import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Utilidades para generar códigos únicos
function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${cleanName.substring(0, 6)}${randomSuffix}`;
}

function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}

export const authRouter = createTRPCRouter({
  // Registro de usuarios (WhatsApp como principal)
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      whatsapp: z.string().min(10, "Número de WhatsApp inválido"),
      email: z.string().email().optional(),
      password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      referralCode: z.string().optional(), // Código del referido
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar si el WhatsApp ya existe
      const existingUser = await ctx.db.user.findUnique({
        where: { whatsapp: input.whatsapp },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este número de WhatsApp ya está registrado",
        });
      }

      // Verificar si el email ya existe (si se proporciona)
      if (input.email) {
        const existingEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email ya está registrado",
          });
        }
      }

      // Verificar si el código de referido existe
      let referredBy = null;
      if (input.referralCode) {
        const referrer = await ctx.db.user.findUnique({
          where: { referralCode: input.referralCode },
        });

        if (!referrer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Código de referido inválido",
          });
        }
        referredBy = referrer.whatsapp;
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Generar código de referido único
      let referralCode = generateReferralCode(input.name);
      let codeExists = await ctx.db.user.findUnique({
        where: { referralCode },
      });

      // Asegurar que el código sea único
      while (codeExists) {
        referralCode = generateReferralCode(input.name);
        codeExists = await ctx.db.user.findUnique({
          where: { referralCode },
        });
      }

      // Crear el usuario
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          whatsapp: input.whatsapp,
          email: input.email,
          password: hashedPassword,
          referralCode,
          referredBy,
          role: "CLIENT",
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          whatsapp: user.whatsapp,
          referralCode: user.referralCode,
        },
      };
    }),

  // Inicio de sesión
  login: publicProcedure
    .input(z.object({
      identifier: z.string(), // WhatsApp o email
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar usuario por WhatsApp o email
      const user = await ctx.db.user.findFirst({
        where: {
          OR: [
            { whatsapp: input.identifier },
            { email: input.identifier },
          ],
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuario desactivado",
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(input.password, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Contraseña incorrecta",
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          whatsapp: user.whatsapp,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
        },
      };
    }),

  // Solicitar reset de contraseña
  requestPasswordReset: publicProcedure
    .input(z.object({
      identifier: z.string(), // WhatsApp o email
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar usuario
      const user = await ctx.db.user.findFirst({
        where: {
          OR: [
            { whatsapp: input.identifier },
            { email: input.identifier },
          ],
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      // Determinar el tipo de reset
      const isEmail = input.identifier.includes('@');
      const resetType = user.email && isEmail ? "EMAIL" : "WHATSAPP";

      if (resetType === "WHATSAPP" && !user.whatsapp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuario no tiene WhatsApp registrado",
        });
      }

      // Generar código de reset
      const code = generateResetCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Invalidar códigos anteriores
      await ctx.db.passwordReset.updateMany({
        where: {
          userId: user.id,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      });

      // Crear nuevo reset
      await ctx.db.passwordReset.create({
        data: {
          userId: user.id,
          code,
          type: resetType,
          expiresAt,
        },
      });

      // TODO: Aquí se enviaría el webhook a n8n
      if (resetType === "WHATSAPP") {
        // Webhook para WhatsApp
        console.log("Webhook to n8n:", {
          event: "security.password_reset",
          user: { whatsapp: user.whatsapp },
          reset_code: code,
        });
      } else {
        // Webhook para Email
        console.log("Email reset:", {
          user: { email: user.email },
          reset_code: code,
        });
      }

      return {
        success: true,
        type: resetType,
        message: resetType === "EMAIL" 
          ? "Se ha enviado un enlace de recuperación a tu email"
          : "Se ha enviado un código de verificación a tu WhatsApp",
      };
    }),

  // Verificar código de reset (WhatsApp)
  verifyResetCode: publicProcedure
    .input(z.object({
      identifier: z.string(),
      code: z.string(),
      newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar usuario
      const user = await ctx.db.user.findFirst({
        where: {
          OR: [
            { whatsapp: input.identifier },
            { email: input.identifier },
          ],
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      // Buscar código de reset válido
      const resetCode = await ctx.db.passwordReset.findFirst({
        where: {
          userId: user.id,
          code: input.code,
          isUsed: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!resetCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Código inválido o expirado",
        });
      }

      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      // Actualizar contraseña
      await ctx.db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Marcar código como usado
      await ctx.db.passwordReset.update({
        where: { id: resetCode.id },
        data: { isUsed: true },
      });

      return {
        success: true,
        message: "Contraseña actualizada exitosamente",
      };
    }),

  // Obtener perfil del usuario autenticado
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          email: true,
          role: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
        },
      });
    }),

  // Actualizar perfil
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar si el email ya existe (si se cambia)
      if (input.email) {
        const existingEmail = await ctx.db.user.findFirst({
          where: {
            email: input.email,
            id: { not: ctx.session.user.id },
          },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email ya está registrado",
          });
        }
      }

      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});