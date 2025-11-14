import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/next-theme/theme-provider";
import { Footer } from "@/components/footer";
import { TRPCReactProvider } from "@/components/providers/trpc-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { AppHeader } from "@/components/server";

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
        className={`${inter.variable} min-h-screen flex flex-col antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <SessionProviderWrapper>
                <AppHeader />
                <main className="w-full grow flex flex-col">
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
