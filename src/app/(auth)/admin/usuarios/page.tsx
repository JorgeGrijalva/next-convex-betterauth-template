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
import { Search, User, Mail, Calendar, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { data: users, isLoading } = api.users.getAll.useQuery({
    search: searchTerm,
    role: roleFilter === "all" ? undefined : roleFilter as "CLIENT" | "VERIFIER" | "ADMIN" | "SUPER_ADMIN",
  });

  const utils = api.useUtils();

  const updateUserRole = api.users.update.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-red-600">Super Admin</Badge>;
      case "ADMIN":
        return <Badge className="bg-purple-600">Admin</Badge>;
      case "USER":
        return <Badge className="bg-blue-600">Usuario</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-400" />
          Gestión de Usuarios
        </h1>
        <p className="text-gray-400">Administrar usuarios y sus roles</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="USER">Usuario</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Usuario</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Rol</TableHead>
              <TableHead className="text-gray-300">Registro</TableHead>
              <TableHead className="text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => {
                      updateUserRole.mutate({
                        id: user.id,
                        role: newRole as "ADMIN" | "VERIFIER" | "CLIENT",
                      });
                    }}
                    disabled={user.role === "SUPER_ADMIN"}
                  >
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="USER">Usuario</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      {user.role === "SUPER_ADMIN" && (
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {users?.length === 0 && (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  );
}