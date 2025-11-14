"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, User, Shield, Trash2, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Queries
  const { data: profile, isLoading, refetch } = api.auth.getProfile.useQuery();
  
  // Mutations
  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      alert("Perfil actualizado exitosamente");
      refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile.mutateAsync({
        name: formData.name || undefined,
        email: formData.email || undefined,
      });
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      alert("La eliminación de cuenta se implementará en futuras versiones. Contacta al soporte.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración de Cuenta</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil y configuraciones de seguridad
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="danger">Zona Peligrosa</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <CardTitle>Información Personal</CardTitle>
                </div>
                <CardDescription>
                  Actualiza tu información de perfil
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  {/* Current Info Display */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">WhatsApp:</span> {profile?.whatsapp}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Rol:</span>
                      <Badge className="ml-2" variant={profile?.role === "CLIENT" ? "default" : "secondary"}>
                        {profile?.role === "CLIENT" ? "Cliente" : profile?.role}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Código de Referido:</span> 
                      <code className="ml-2 bg-background px-2 py-1 rounded">{profile?.referralCode}</code>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tu@email.com"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        El email es usado para recuperación de contraseña y notificaciones importantes
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={loading || updateProfile.isPending}
                    className="ml-auto"
                  >
                    {loading || updateProfile.isPending ? (
                      "Guardando..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <CardTitle>Autenticación de Dos Factores</CardTitle>
                  </div>
                  <CardDescription>
                    Mejora la seguridad de tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      La autenticación de dos factores se implementará en futuras versiones.
                      Por ahora, tu cuenta está protegida por contraseña y OAuth.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" disabled>
                    Configurar 2FA (Próximamente)
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña regularmente para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Para cambiar tu contraseña, utiliza la opción "¿Olvidaste tu contraseña?" 
                      en la página de inicio de sesión.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/sign-in">
                      Ir a Cambiar Contraseña
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
                </div>
                <CardDescription>
                  Acciones irreversibles para tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>¡Atención!</strong> Eliminar tu cuenta es una acción permanente.
                      Se perderán todos tus datos, suscripciones y comisiones de afiliado.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-destructive/5 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">¿Qué se eliminará?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Tu perfil y datos personales</li>
                      <li>• Historial de pagos y suscripciones</li>
                      <li>• Comisiones de afiliado pendientes</li>
                      <li>• Enlaces de referido</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            ¿Necesitas ayuda? Contacta a nuestro{" "}
            <Link href="/support" className="underline hover:text-foreground">
              equipo de soporte
            </Link>
          </p>
          <div className="mt-4">
            <p>
              Protegido por{" "}
              <Link
                href="https://next-auth.js.org"
                className="underline hover:text-foreground"
                target="_blank"
              >
                NextAuth.js
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}