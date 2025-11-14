import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/next-theme/theme-provider";
import { Footer } from "@/components/footer";
import { TRPCReactProvider } from "@/components/providers/trpc-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Next.js T3 App",
  description: "T3 Stack with Prisma, tRPC, and NextAuth.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-[calc(100vh-2rem)] flex flex-col gap-4 antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <SessionProviderWrapper>
                <main className=" px-2 md:px-4 grow flex flex-col">
                  {children}
                </main>
                <Footer />
              </SessionProviderWrapper>
            </TRPCReactProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
