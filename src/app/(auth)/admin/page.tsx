"use client";

import { api } from "@/utils/api";
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
  const { data: userStats } = api.users.getStats.useQuery();
  const { data: paymentStats } = api.payments.getStats.useQuery({});
  const { data: subscriptionStats } = api.subscriptions.getStats.useQuery();
  const { data: iptvStats } = api.iptvAccounts.getStats.useQuery();
  const { data: announcementStats } = api.announcements.getStats.useQuery();
  const { data: recentPayments } = api.payments.getAll.useQuery({ limit: 5 });
  const { data: affiliateStats } = api.affiliates.getGeneralStats.useQuery();

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
    <div className="w-full h-full">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
          <p className="text-slate-400 text-sm mt-1">Resumen general del sistema</p>
        </div>
      </div>

      <div className="p-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userStats?.total || 0}</div>
            <p className="text-xs text-gray-400">
              +{userStats?.newUsersThisMonth || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-green-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Suscripciones Activas</CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{subscriptionStats?.active || 0}</div>
            <p className="text-xs text-gray-400">
              {subscriptionStats?.total || 0} totales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${paymentStats?.totalRevenue || 0}</div>
            <p className="text-xs text-gray-400">
              {paymentStats?.pending || 0} pagos pendientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Cuentas IPTV</CardTitle>
            <Server className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{iptvStats?.total || 0}</div>
            <p className="text-xs text-gray-400">
              {iptvStats?.active || 0} activas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Payments */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pagos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments?.map((payment: any) => (
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
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Solicitudes de Retiro Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Comisiones Pendientes
                  </p>
                  <p className="text-xs text-gray-400">
                    {affiliateStats?.pendingCommissionsCount || 0} solicitudes
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-600">${affiliateStats?.totalCommissionsPending || 0}</Badge>
                </div>
              </div>
              
              {(affiliateStats?.pendingCommissionsCount || 0) === 0 && (
                <p className="text-gray-400 text-center py-4">No hay comisiones pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/admin/pagos" className="block">
            <Card className="bg-slate-900 border-slate-800 hover:border-green-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
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
            <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
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
            <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
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
            <Card className="bg-slate-900 border-slate-800 hover:border-yellow-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
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
    </div>
  );
}