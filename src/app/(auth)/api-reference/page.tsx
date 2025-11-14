"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function ApiReferencePage() {
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
          <h1 className="text-2xl font-semibold">API Reference</h1>
          <p className="text-muted-foreground">
            Available tRPC functions and NextAuth endpoints for the T3 Stack
          </p>
          <div className="flex gap-2 pt-2">
            <Link
              href="/documentation"
              className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Documentation →
            </Link>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This application has been converted from Convex + Better Auth to T3 Stack (tRPC + Prisma + NextAuth).
            API reference content will be updated to reflect the new architecture.
          </AlertDescription>
        </Alert>

        {/* tRPC API Section */}
        <Card>
          <CardHeader>
            <CardTitle>tRPC API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Todo Operations</h3>
              <div className="bg-muted p-4 rounded text-sm font-mono">
                <div>• <code>api.todo.getAll.useQuery()</code> - Get all todos for current user</div>
                <div>• <code>api.todo.create.useMutation()</code> - Create a new todo</div>
                <div>• <code>api.todo.update.useMutation()</code> - Update a todo</div>
                <div>• <code>api.todo.delete.useMutation()</code> - Delete a todo</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Example Usage</h3>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { api } from "@/utils/api";

// Query todos
const { data: todos } = api.todo.getAll.useQuery();

// Create todo mutation
const createTodo = api.todo.create.useMutation({
  onSuccess: () => {
    utils.todo.getAll.invalidate();
  },
});

// Create a todo
createTodo.mutate({ text: "New todo item" });`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* NextAuth Section */}
        <Card>
          <CardHeader>
            <CardTitle>NextAuth.js Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Authentication Hooks</h3>
              <div className="bg-muted p-4 rounded text-sm font-mono">
                <div>• <code>useSession()</code> - Get current session</div>
                <div>• <code>signIn()</code> - Sign in with providers</div>
                <div>• <code>signOut()</code> - Sign out current user</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Example Usage</h3>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`import { useSession, signIn, signOut } from "next-auth/react";

// Get session
const { data: session } = useSession();

// Sign in with GitHub
await signIn("github");

// Sign out
await signOut();`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Documentation Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://trpc.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  tRPC Documentation
                </a>
                {" - Official tRPC docs"}
              </li>
              <li>
                <a
                  href="https://next-auth.js.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  NextAuth.js Documentation
                </a>
                {" - Official NextAuth docs"}
              </li>
              <li>
                <a
                  href="https://www.prisma.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  Prisma Documentation
                </a>
                {" - Official Prisma docs"}
              </li>
              <li>
                <a
                  href="https://create.t3.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground underline"
                >
                  T3 Stack Documentation
                </a>
                {" - Official T3 Stack docs"}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}