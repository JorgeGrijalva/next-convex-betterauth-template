"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Search, 
  Eye, 
  EyeOff,
  RefreshCw,
  Shield,
  ShieldOff,
  Tv,
  User,
  Calendar,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function IptvAccountsManagement() {
  const [search, setSearch] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Queries
  const { data: accounts, refetch } = api.iptvAccounts.getAllAccounts.useQuery({
    search: search || undefined,
    limit: 50,
  });
  
  const { data: stats } = api.iptvAccounts.getStats.useQuery();

  // Mutations
  const regeneratePassword = api.iptvAccounts.regeneratePassword.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedAccount(null);
    },
  });

  const toggleActive = api.iptvAccounts.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRegeneratePassword = async (accountId: string) => {
    if (!confirm("¿Estás seguro de que quieres regenerar la contraseña? El usuario actual perderá acceso hasta que use las nuevas credenciales.")) {
      return;
    }

    try {
      const result = await regeneratePassword.mutateAsync({ accountId });
      alert(`Nueva contraseña generada: ${result.newPassword}`);
    } catch (error) {
      alert("Error al regenerar la contraseña");
    }
  };

  const handleToggleActive = async (accountId: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de que quieres ${action} esta cuenta IPTV?`)) return;

    try {
      await toggleActive.mutateAsync({ accountId });
      alert(`Cuenta ${action === "desactivar" ? "desactivada" : "activada"} exitosamente`);
    } catch (error) {
      alert("Error al cambiar el estado de la cuenta");
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Panel Admin
            </Link>
          </Button>
        </div>

        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Cuentas IPTV</h1>
            <p className="text-muted-foreground">
              Administrar credenciales y acceso al servicio IPTV
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cuentas</CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuentas Activas</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuentas Inactivas</CardTitle>
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usadas Recientemente</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentlyUsed}</div>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por usuario, perfil o usuario IPTV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Accounts List */}
        {accounts && accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{account.user.name}</span>
                        </div>
                        <Badge variant="outline">{account.user.whatsapp}</Badge>
                        <Badge variant={account.isActive ? "default" : "destructive"}>
                          {account.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                        {account.user.subscriptions[0] && (
                          <Badge variant="outline">
                            {account.user.subscriptions[0].plan.name}
                          </Badge>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Usuario IPTV</div>
                          <div className="font-mono">{account.username}</div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground">Contraseña</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {showPasswords[account.id] ? account.password : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(account.id)}
                            >
                              {showPasswords[account.id] ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Servidor</div>
                          <div className="font-mono text-xs">
                            {account.serverUrl}
                            {account.port && `:${account.port}`}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Conexiones / Última Vez</div>
                          <div>
                            <div>Máx: {account.maxConnections}</div>
                            <div className="text-xs">
                              {account.lastUsed 
                                ? new Date(account.lastUsed).toLocaleDateString()
                                : "Nunca"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {account.notes && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <span className="text-muted-foreground">Notas:</span>
                          <div className="mt-1 p-2 bg-muted rounded text-xs">
                            {account.notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegeneratePassword(account.id)}
                        disabled={regeneratePassword.isPending}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Nueva Contraseña
                      </Button>

                      <Button
                        variant={account.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(account.id, account.isActive)}
                        disabled={toggleActive.isPending}
                      >
                        {account.isActive ? (
                          <>
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Tv className="w-12 h-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron cuentas IPTV</h3>
            <p className="text-muted-foreground">
              {search 
                ? "Intenta con otros términos de búsqueda" 
                : "No hay cuentas IPTV creadas aún"}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-muted/30 rounded-lg p-6">
          <h3 className="font-medium mb-2">Información Importante</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Las cuentas IPTV se crean automáticamente cuando se aprueba el primer pago de un usuario</div>
            <div>• Regenerar la contraseña enviará las nuevas credenciales por WhatsApp al usuario</div>
            <div>• Las cuentas inactivas no pueden acceder al servicio IPTV</div>
            <div>• La información de "Última Vez" se actualiza cuando el usuario marca su cuenta como utilizada</div>
          </div>
        </div>
      </div>
    </div>
  );
}