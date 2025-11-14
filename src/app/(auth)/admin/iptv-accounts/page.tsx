"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Server, User, Key, Plus, Edit } from "lucide-react";

export default function AdminIptvAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  
  const { data: accounts, isLoading } = api.iptvAccounts.getAllAccounts.useQuery({
    search: searchTerm,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const { data: users } = api.users.getAll.useQuery({});
  const utils = api.useUtils();

  const createAccount = api.iptvAccounts.createAccount.useMutation({
    onSuccess: () => {
      utils.iptvAccounts.getAllAccounts.invalidate();
    },
  });

  const updateAccount = api.iptvAccounts.updateAccount.useMutation({
    onSuccess: () => {
      utils.iptvAccounts.getAllAccounts.invalidate();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Activo</Badge>;
      case "suspended":
        return <Badge className="bg-red-600">Suspendido</Badge>;
      case "expired":
        return <Badge className="bg-yellow-600">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AccountForm = ({ account = null, onClose }: { account?: any; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      username: account?.username || "",
      password: account?.password || "",
      serverUrl: account?.serverUrl || "",
      isActive: account?.isActive ?? true,
      userId: account?.userId || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (account) {
        updateAccount.mutate({
          accountId: account.id,
          serverUrl: formData.serverUrl,
          isActive: formData.isActive,
        });
      } else {
        createAccount.mutate({
          userId: formData.userId,
          serverUrl: formData.serverUrl || "https://iptv.example.com",
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="userId" className="text-white">Usuario</Label>
          <Select
            value={formData.userId}
            onValueChange={(value) => setFormData({ ...formData, userId: value })}
            required
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Seleccionar usuario" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="username" className="text-white">Nombre de Usuario</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="password" className="text-white">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            required={!account}
          />
        </div>
        
        <div>
          <Label htmlFor="serverUrl" className="text-white">URL del Servidor</Label>
          <Input
            id="serverUrl"
            value={formData.serverUrl}
            onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="http://tuservidor.com:8080"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="isActive" className="text-white">Estado</Label>
          <Select
            value={formData.isActive ? "active" : "inactive"}
            onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            {account ? "Actualizar" : "Crear"} Cuenta
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Server className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando cuentas IPTV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Server className="w-8 h-8 text-purple-400" />
            Gestión de Cuentas IPTV
          </h1>
          <p className="text-gray-400">Administrar credenciales de acceso IPTV</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nueva Cuenta IPTV</DialogTitle>
            </DialogHeader>
            <AccountForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por usuario o servidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="suspended">Suspendido</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Usuario</TableHead>
              <TableHead className="text-gray-300">Credenciales</TableHead>
              <TableHead className="text-gray-300">Servidor</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{account.user.name}</p>
                    <p className="text-sm text-gray-400">{account.user.whatsapp}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 font-mono text-sm">{account.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 font-mono text-sm">••••••••</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-300 max-w-xs truncate">
                    {account.serverUrl}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(account.isActive ? "active" : "inactive")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAccount(account)}
                      className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {accounts?.length === 0 && (
          <div className="text-center py-8">
            <Server className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No se encontraron cuentas IPTV</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="bg-gray-800 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Cuenta IPTV</DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <AccountForm account={editingAccount} onClose={() => setEditingAccount(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}