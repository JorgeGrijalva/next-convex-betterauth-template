"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, X } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });
      if (res?.ok) {
        setSuccess("Inicio de sesión exitoso");
        window.location.href = "/dashboard";
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/80 border-purple-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Inicia sesión</CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Ingresa a tu cuenta para acceder al panel de FLUTV.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500 bg-red-900/30">
              <X className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-500 bg-green-900/30">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form className="space-y-4" onSubmit={handleCredentialsSignIn}>
            <div>
              <Label htmlFor="identifier" className="text-gray-300">WhatsApp o Email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="+52XXXXXXXXXX o nombre@correo.com"
                required
                className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              ¿No tienes cuenta?{" "}
              <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 underline">
                Crea una cuenta
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/reset-password" className="text-gray-400 hover:text-gray-300 underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
  );
}