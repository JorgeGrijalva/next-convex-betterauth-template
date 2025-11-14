import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Welcome to T3 Stack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern web application built with Next.js, Prisma, tRPC, and NextAuth.js
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 Next.js 16</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                React framework with server-side rendering and static generation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🗃️ Prisma</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Type-safe database ORM with automatic migrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔒 NextAuth.js</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Authentication with GitHub and Google OAuth
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-in">
              Get Started
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Built with the T3 Stack: TypeScript, Tailwind CSS, tRPC, Prisma, NextAuth.js
          </p>
        </div>
      </div>
    </div>
  );
}