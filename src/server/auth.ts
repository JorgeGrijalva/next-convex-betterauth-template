import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import { type GetServerSidePropsContext } from "next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { env } from "@/env";
import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    // ...other properties
  }
}


/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // Obtener rol del usuario de la base de datos
        const user = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        
        session.user.role = user?.role;
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Flutv",
      credentials: {
        identifier: { label: "WhatsApp o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            OR: [
              { whatsapp: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email || undefined,
          image: null,
          role: user.role,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    // error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user" // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  session: {
    strategy: "jwt",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"] | Request;
  res?: GetServerSidePropsContext["res"] | { setHeader?: Function; end?: Function };
}) => {
  // For App Router with fetch adapter where res is undefined
  if (!ctx.res) {
    // Create a minimal response object that satisfies NextAuth's requirements
    const minimalRes = {
      setHeader: () => {},
      getHeader: () => undefined,
      end: () => {},
    };
    return getServerSession(ctx.req as any, minimalRes as any, authOptions);
  }
  
  return getServerSession(ctx.req as any, ctx.res as any, authOptions);
};