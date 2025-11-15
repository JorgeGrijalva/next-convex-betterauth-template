import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/next-theme/theme-provider";
import { Footer } from "@/components/footer";
import { TRPCReactProvider } from "@/components/providers/trpc-provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { AppShell } from "@/components/app-shell";

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
        className={`${inter.variable} min-h-[calc(100vh-2rem)] flex flex-col antialiased bg-slate-900`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <SessionProviderWrapper>
                <AppShell>
                  {children}
                </AppShell>
                <Footer />
              </SessionProviderWrapper>
            </TRPCReactProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
