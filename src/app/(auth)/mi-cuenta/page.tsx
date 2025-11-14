"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Tv, 
  User, 
  Key, 
  Globe, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MiCuenta() {
  const { data: session } = useSession();
  const { data: iptvAccount } = api.iptvAccounts.getMyAccount.useQuery();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-8 text-center">
            <Tv className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Inicia sesión</h3>
            <p className="text-slate-400 mb-6">
              Debes iniciar sesión para ver tu cuenta IPTV
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/sign-in">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Error al copiar");
    }
  };

  if (!iptvAccount) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-purple-400">
                Flutv
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/planes" className="text-slate-300 hover:text-white transition-colors">
                  Planes
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="bg-slate-800 border-slate-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                Cuenta IPTV no disponible
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-slate-300 mb-4">
                Aún no tienes una cuenta IPTV asignada. Esto puede deberse a que:
              </div>
              <ul className="text-left text-slate-400 space-y-2 mb-6 max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Tu pago aún está en proceso de validación
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Tu suscripción está pendiente de activación
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Aún no has realizado ninguna compra
                </li>
              </ul>
              <div className="flex gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/planes">Ver Planes</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Link href="/pagos">Ver Mis Pagos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-purple-400">
              Flutv
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/planes" className="text-slate-300 hover:text-white transition-colors">
                Planes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mi Cuenta IPTV
          </h1>
          <p className="text-slate-400">
            Aquí encontrarás tus credenciales y configuración para acceder al servicio
          </p>
        </div>

        {/* Account Status */}
        <div className="mb-8">
          <Card className={`${iptvAccount.isActive ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'} border-2`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {iptvAccount.isActive ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <div>
                  <div className="text-white font-semibold">
                    Estado de la Cuenta: {iptvAccount.isActive ? 'Activa' : 'Inactiva'}
                  </div>
                  <div className="text-slate-300 text-sm">
                    {iptvAccount.isActive 
                      ? 'Tu cuenta está activa y funcionando correctamente'
                      : 'Tu cuenta está temporalmente inactiva'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-400" />
                Credenciales de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuario
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono">
                    {iptvAccount.username}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(iptvAccount.username, 'Usuario')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Contraseña
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono">
                    {iptvAccount.password}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(iptvAccount.password, 'Contraseña')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Información del Servidor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  URL del Servidor
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm break-all">
                    {iptvAccount.serverUrl}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(iptvAccount.serverUrl, 'URL del servidor')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {iptvAccount.port && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Puerto</Label>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono">
                    {iptvAccount.port}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Conexiones Simultáneas</Label>
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                  {iptvAccount.maxConnections} dispositivos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Nombre del Perfil</Label>
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                  {iptvAccount.profileName || "Sin nombre"}
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Fecha de Creación</Label>
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                  {new Date(iptvAccount.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {iptvAccount.lastUsed && (
                <div>
                  <Label className="text-slate-300">Último Uso</Label>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                    {new Date(iptvAccount.lastUsed).toLocaleDateString()}
                  </div>
                </div>
              )}

              {iptvAccount.notes && (
                <div>
                  <Label className="text-slate-300">Notas</Label>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white">
                    {iptvAccount.notes}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Tv className="h-5 w-5 text-purple-400" />
                Instrucciones de Configuración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-slate-300">
                <div>
                  <h4 className="font-semibold text-white mb-2">Para configurar tu servicio IPTV:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Descarga una aplicación IPTV compatible (como IPTV Smarters, TiviMate, etc.)</li>
                    <li>Abre la aplicación y selecciona "Agregar Usuario" o "Login con Xtream Codes API"</li>
                    <li>Ingresa los siguientes datos:</li>
                  </ol>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                    <li><strong>Usuario:</strong> {iptvAccount.username}</li>
                    <li><strong>Contraseña:</strong> {iptvAccount.password}</li>
                    <li><strong>URL del Servidor:</strong> {iptvAccount.serverUrl}</li>
                  </ul>
                </div>
                
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">Importante</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    No compartas tus credenciales con nadie. Están limitadas a {iptvAccount.maxConnections} dispositivos simultáneos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}