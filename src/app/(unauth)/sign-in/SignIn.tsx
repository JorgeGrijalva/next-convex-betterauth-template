"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Chrome, CheckCircle2, X } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignIn() {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Social Sign In (GitHub)
  const handleGitHubSignIn = async () => {
    setLoading(true);
    clearMessages();

    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("GitHub sign in failed");
    } finally {
      setLoading(false);
    }
  };

  // Social Sign In (Google)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearMessages();

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Inicia sesión</CardTitle>
          <p className="text-muted-foreground text-sm">
            Ingresa a tu cuenta para acceder al panel de FLUTV.
          </p>
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

          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignIn}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" />
              Continuar con GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Continuar con Google
            </Button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Crea una cuenta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}