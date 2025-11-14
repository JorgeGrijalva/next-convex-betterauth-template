"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="bg-muted p-4 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap">
    {children}
  </pre>
);

const DocSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

export default function DocumentationPage() {
  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide for the T3 Stack application
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              href="/api-reference"
              className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View API Reference →
            </Link>
          </div>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            This application has been successfully converted to T3 Stack architecture with tRPC, Prisma, and NextAuth.js.
          </AlertDescription>
        </Alert>

        {/* Getting Started */}
        <DocSection title="Getting Started">
          <div className="space-y-4">
            <p className="text-sm">
              This is a T3 Stack application with the following technologies:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside ml-4">
              <li><strong>Next.js 16</strong> - React framework with App Router</li>
              <li><strong>TypeScript</strong> - Type-safe development</li>
              <li><strong>tRPC</strong> - End-to-end typesafe APIs</li>
              <li><strong>Prisma</strong> - Database ORM with type safety</li>
              <li><strong>NextAuth.js</strong> - Authentication solution</li>
              <li><strong>Tailwind CSS</strong> - Utility-first CSS framework</li>
              <li><strong>shadcn/ui</strong> - Re-usable UI components</li>
            </ul>
          </div>
        </DocSection>

        {/* Development Setup */}
        <DocSection title="Development Setup">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Install Dependencies</h3>
              <CodeBlock>npm install</CodeBlock>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">2. Set up Environment Variables</h3>
              <p className="text-sm text-muted-foreground mb-2">Copy .env.example to .env.local and fill in the values:</p>
              <CodeBlock>{`DATABASE_URL="file:./db.sqlite"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"`}</CodeBlock>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">3. Set up Database</h3>
              <CodeBlock>{`# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio`}</CodeBlock>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">4. Start Development Server</h3>
              <CodeBlock>npm run dev</CodeBlock>
            </div>
          </div>
        </DocSection>

        {/* Database */}
        <DocSection title="Database & Prisma">
          <div className="space-y-4">
            <p className="text-sm">
              The application uses Prisma as the ORM with SQLite by default (configurable to PostgreSQL/MySQL).
            </p>
            
            <div>
              <h3 className="font-medium mb-2">Schema Location</h3>
              <CodeBlock>prisma/schema.prisma</CodeBlock>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Available Models</h3>
              <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                <li><code>User</code> - User accounts</li>
                <li><code>Account</code> - OAuth account linking</li>
                <li><code>Session</code> - User sessions</li>
                <li><code>Todo</code> - Todo items</li>
              </ul>
            </div>
          </div>
        </DocSection>

        {/* Authentication */}
        <DocSection title="Authentication">
          <div className="space-y-4">
            <p className="text-sm">
              Authentication is handled by NextAuth.js with support for OAuth providers.
            </p>
            
            <div>
              <h3 className="font-medium mb-2">Configuration</h3>
              <ul className="text-sm space-y-1 list-disc list-inside ml-4">
                <li><code>src/server/auth.ts</code> - NextAuth configuration</li>
                <li><code>src/app/api/auth/[...nextauth]/route.ts</code> - API routes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Usage Example</h3>
              <CodeBlock>{`import { useSession, signIn, signOut } from "next-auth/react";

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  
  return (
    <button onClick={() => signIn()}>Sign in</button>
  );
}`}</CodeBlock>
            </div>
          </div>
        </DocSection>

        {/* Resources */}
        <DocSection title="Resources & Documentation">
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://create.t3.gg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                T3 Stack Documentation <ExternalLink className="w-3 h-3" />
              </a>
              {" - Official T3 Stack docs"}
            </li>
            <li>
              <a href="https://trpc.io/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                tRPC Documentation <ExternalLink className="w-3 h-3" />
              </a>
              {" - Official tRPC docs"}
            </li>
            <li>
              <a href="https://next-auth.js.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                NextAuth.js Documentation <ExternalLink className="w-3 h-3" />
              </a>
              {" - Official NextAuth docs"}
            </li>
            <li>
              <a href="https://www.prisma.io/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Prisma Documentation <ExternalLink className="w-3 h-3" />
              </a>
              {" - Official Prisma docs"}
            </li>
            <li>
              <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Next.js Documentation <ExternalLink className="w-3 h-3" />
              </a>
              {" - Official Next.js docs"}
            </li>
          </ul>
        </DocSection>
      </div>
    </div>
  );
}