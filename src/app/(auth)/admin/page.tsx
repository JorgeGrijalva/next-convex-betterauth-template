"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Server
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats } = api.admin.getDashboardStats.useQuery();
  const { data: recentPayments } = api.payments.getRecent.useQuery({ limit: 5 });
  const { data: pendingWithdrawals } = api.affiliates.getWithdrawalRequests.useQuery({ 
    status: "pending" 
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Aprobado</Badge>;
      case "rejected":
        return <Badge className="bg-red-600">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-400">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-400">
              +{stats?.newUsersThisMonth || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Suscripciones Activas</CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-gray-400">
              {stats?.totalSubscriptions || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats?.monthlyRevenue || 0}</div>
            <p className="text-xs text-gray-400">
              {stats?.pendingPayments || 0} pagos pendientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Cuentas IPTV</CardTitle>
            <Server className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalIptvAccounts || 0}</div>
            <p className="text-xs text-gray-400">
              {stats?.activeIptvAccounts || 0} activas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pagos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments?.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {payment.user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.plan.name} - ${payment.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payment.status)}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentPayments?.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay pagos recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Solicitudes de Retiro Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWithdrawals?.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      {withdrawal.affiliate.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${withdrawal.amount} - {withdrawal.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-600">Pendiente</Badge>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {pendingWithdrawals?.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay solicitudes pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/pagos" className="block">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Revisar Pagos</p>
                    <p className="text-gray-400 text-sm">Aprobar/Rechazar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/admin/usuarios" className="block">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">Gestionar Usuarios</p>
                    <p className="text-gray-400 text-sm">Ver y editar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/admin/planes" className="block">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Planes</p>
                    <p className="text-gray-400 text-sm">Crear y editar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="/admin/withdrawals" className="block">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Retiros</p>
                    <p className="text-gray-400 text-sm">Procesar solicitudes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
}