"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2,
  Tv,
  Server,
  User,
  Lock,
  Globe,
  Calendar,
  Activity,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Queries
  const { data: iptvAccount, isLoading, refetch } = api.iptvAccounts.getMyAccount.useQuery();
  const { data: accountStatus } = api.iptvAccounts.getAccountStatus.useQuery({});

  // Mutations
  const markAsUsed = api.iptvAccounts.markAsUsed.useMutation();

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleUseCredentials = async () => {
    try {
      await markAsUsed.mutateAsync();
      refetch();
    } catch (error) {
      console.error("Error marking as used:", error);
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
          <div className="flex items-center gap-2 mb-2">
            <Tv className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Mi Cuenta IPTV</h1>
          </div>
          <p className="text-muted-foreground">
            Credenciales de acceso y configuración de tu servicio IPTV
          </p>
        </div>

        {/* Account Status */}
        {iptvAccount ? (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Estado de la Cuenta
                  </CardTitle>
                  <Badge variant={iptvAccount.isActive ? "default" : "destructive"}>
                    {iptvAccount.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Usuario IPTV</div>
                    <div className="font-medium">{iptvAccount.username}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Conexiones Máximas</div>
                    <div className="font-medium">{iptvAccount.maxConnections}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Última Conexión</div>
                    <div className="font-medium">
                      {iptvAccount.lastUsed 
                        ? new Date(iptvAccount.lastUsed).toLocaleDateString()
                        : "Nunca"}
                    </div>
                  </div>
                </div>

                {accountStatus?.subscription && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Suscripción Activa:</div>
                      <div className="font-medium">
                        {accountStatus.subscription.plan.name} - 
                        Vence: {new Date(accountStatus.subscription.endDate!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credentials Card */}
            {iptvAccount.isActive ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Credenciales de Acceso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Server URL */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Servidor</label>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                        {iptvAccount.serverUrl}
                        {iptvAccount.port && `:${iptvAccount.port}`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          `${iptvAccount.serverUrl}${iptvAccount.port ? `:${iptvAccount.port}` : ''}`,
                          'server'
                        )}
                      >
                        {copiedField === 'server' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Usuario</label>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                        {iptvAccount.username}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(iptvAccount.username, 'username')}
                      >
                        {copiedField === 'username' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Contraseña</label>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                        {showPassword ? iptvAccount.password : '••••••••••••'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(iptvAccount.password, 'password')}
                      >
                        {copiedField === 'password' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <Button onClick={handleUseCredentials} className="w-full">
                      Marcar como Utilizada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Tu cuenta IPTV está desactivada. Contacta al soporte para más información.
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones de Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Aplicaciones Recomendadas:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Android/iOS:</strong> IPTV Smarters, TiviMate, GSE Smart IPTV</li>
                    <li>• <strong>Windows/Mac:</strong> VLC Media Player, IPTV Smarters</li>
                    <li>• <strong>Smart TV:</strong> Smart IPTV, SS IPTV</li>
                    <li>• <strong>MAG Box:</strong> Configuración automática con servidor</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pasos de Configuración:</h4>
                  <ol className="text-sm space-y-1 text-muted-foreground">
                    <li>1. Descarga la aplicación IPTV de tu preferencia</li>
                    <li>2. Selecciona "Agregar Lista" o "Add Playlist"</li>
                    <li>3. Ingresa el servidor, usuario y contraseña</li>
                    <li>4. Guarda la configuración y disfruta</li>
                  </ol>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm">
                    <strong>Importante:</strong> Puedes usar hasta {iptvAccount.maxConnections} conexiones 
                    simultáneas. No compartas tus credenciales para evitar interrupciones en el servicio.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Perfil</div>
                    <div className="font-medium">{iptvAccount.profileName || "No definido"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Creada</div>
                    <div className="font-medium">
                      {new Date(iptvAccount.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {accountStatus?.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Notas:</div>
                      <div className="bg-muted/50 p-3 rounded">{accountStatus.notes}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tienes una cuenta IPTV</h3>
            <p className="text-muted-foreground mb-6">
              Para acceder al servicio IPTV, primero debes adquirir un plan y realizar el pago correspondiente.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/plans">
                  Ver Planes Disponibles
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/payments">
                  Verificar Mis Pagos
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Support */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            ¿Necesitas ayuda con la configuración?{" "}
            <Link href="/support" className="underline hover:text-foreground">
              Contacta al soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}