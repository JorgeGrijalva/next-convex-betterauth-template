"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPassword() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Reset Password</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Password reset not yet implemented
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Password reset functionality is not yet implemented with NextAuth.js.
              This feature will be added in future updates.
            </AlertDescription>
          </Alert>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/sign-in">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t py-4">
            <p className="text-center text-xs text-neutral-500">
              Powered by{" "}
              <Link
                href="https://next-auth.js.org"
                className="underline"
                target="_blank"
              >
                <span className="dark:text-blue-200/90">NextAuth.js</span>
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}