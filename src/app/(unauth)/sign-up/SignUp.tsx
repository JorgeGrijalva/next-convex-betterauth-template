"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Chrome, CheckCircle2, X } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUp() {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Social Sign Up (GitHub)
  const handleGitHubSignUp = async () => {
    setLoading(true);
    clearMessages();

    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("GitHub sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Social Sign Up (Google)
  const handleGoogleSignUp = async () => {
    setLoading(true);
    clearMessages();

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Google sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-sm">
            Join us today! Create your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <X className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignUp}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t py-4">
            <p className="text-center text-xs text-neutral-500">
              Secured by <span className="text-blue-400">NextAuth.js</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}