"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Edit,
  UserPlus,
  Shield,
  ShieldOff,
  Calendar,
  DollarSign
} from "lucide-react";
import Link from "next/link";

export default function UsersManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "clients" | "admins">("all");

  // Queries
  const { data: users, refetch } = api.users.getAll.useQuery({
    role: filter === "clients" ? "CLIENT" : filter === "admins" ? "ADMIN" : undefined,
    search: search || undefined,
    limit: 50,
  });

  const { data: userDetails } = api.users.getById.useQuery(
    { id: selectedUser?.id || "" },
    { enabled: !!selectedUser?.id }
  );

  // Mutations
  const toggleActive = api.users.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUser(null);
    },
  });

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) return;
    
    try {
      await toggleActive.mutateAsync({ id: userId });
      alert(`Usuario ${action === "desactivar" ? "desactivado" : "activado"} exitosamente`);
    } catch (error) {
      alert("Error al cambiar el estado del usuario");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-500">Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-blue-500">Administrador</Badge>;
      case "VERIFIER":
        return <Badge className="bg-green-500">Verificador</Badge>;
      default:
        return <Badge variant="outline">Cliente</Badge>;
    }
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

        {/* Page Title and Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administrar usuarios, roles y permisos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Funcionalidad de creación de usuarios se implementará próximamente
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, WhatsApp o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
            <Button 
              variant={filter === "clients" ? "default" : "outline"}
              onClick={() => setFilter("clients")}
            >
              Clientes
            </Button>
            <Button 
              variant={filter === "admins" ? "default" : "outline"}
              onClick={() => setFilter("admins")}
            >
              Administradores
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        {getRoleBadge(user.role)}
                        {!user.isActive && (
                          <Badge variant="destructive">Desactivado</Badge>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <div>WhatsApp: {user.whatsapp}</div>
                          {user.email && <div>Email: {user.email}</div>}
                        </div>
                        
                        <div>
                          <div>Suscripciones: {user._count.subscriptions}</div>
                          <div>Pagos aprobados: {user._count.payments}</div>
                        </div>
                        
                        <div>
                          <div>Referidos: {user._count.referredUsers}</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {user.referredBy && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Referido por: {user.referredBy}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Usuario</DialogTitle>
                            <DialogDescription>
                              {user.name} - {user.whatsapp}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {userDetails && (
                            <Tabs defaultValue="info">
                              <TabsList>
                                <TabsTrigger value="info">Información</TabsTrigger>
                                <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
                                <TabsTrigger value="payments">Pagos</TabsTrigger>
                                <TabsTrigger value="referrals">Referidos</TabsTrigger>
                              </TabsList>

                              <TabsContent value="info" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>ID:</strong> {userDetails.id}
                                  </div>
                                  <div>
                                    <strong>Rol:</strong> {userDetails.role}
                                  </div>
                                  <div>
                                    <strong>WhatsApp:</strong> {userDetails.whatsapp}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {userDetails.email || "No registrado"}
                                  </div>
                                  <div>
                                    <strong>Código de referido:</strong> {userDetails.referralCode}
                                  </div>
                                  <div>
                                    <strong>Estado:</strong> {userDetails.isActive ? "Activo" : "Inactivo"}
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="subscriptions">
                                {userDetails.subscriptions.length > 0 ? (
                                  <div className="space-y-3">
                                    {userDetails.subscriptions.map((sub) => (
                                      <div key={sub.id} className="border rounded p-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <div className="font-medium">{sub.plan.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {sub.startDate && sub.endDate 
                                                ? `${new Date(sub.startDate).toLocaleDateString()} - ${new Date(sub.endDate).toLocaleDateString()}`
                                                : "Sin fechas definidas"}
                                            </div>
                                          </div>
                                          <Badge>{sub.status}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No tiene suscripciones
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="payments">
                                {userDetails.payments.length > 0 ? (
                                  <div className="space-y-3">
                                    {userDetails.payments.map((payment) => (
                                      <div key={payment.id} className="border rounded p-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <DollarSign className="w-4 h-4" />
                                              <span className="font-medium">
                                                ${payment.amount} {payment.currency}
                                              </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {payment.plan.name} - {new Date(payment.createdAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <Badge variant={
                                            payment.status === "APPROVED" ? "default" :
                                            payment.status === "REJECTED" ? "destructive" : "secondary"
                                          }>
                                            {payment.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No tiene pagos registrados
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="referrals">
                                {userDetails.referredUsers.length > 0 ? (
                                  <div className="space-y-3">
                                    {userDetails.referredUsers.map((referred) => (
                                      <div key={referred.id} className="border rounded p-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <div className="font-medium">{referred.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {referred.whatsapp} - Registrado: {new Date(referred.createdAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No ha referido usuarios
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant={user.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        disabled={toggleActive.isPending}
                      >
                        {user.isActive ? (
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
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
            <p className="text-muted-foreground">
              {search 
                ? "Intenta con otros términos de búsqueda" 
                : "No hay usuarios registrados aún"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}