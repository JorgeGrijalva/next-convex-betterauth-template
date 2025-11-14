"use client";

import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Shield,
  FileText,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (session?.user && !["ADMIN", "SUPER_ADMIN", "VERIFIER"].includes(session.user.role || "")) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Queries
  const { data: userStats, isLoading: userStatsLoading } = api.users.getStats.useQuery();
  const { data: paymentStats, isLoading: paymentStatsLoading } = api.payments.getStats.useQuery({});
  const { data: subscriptionStats, isLoading: subscriptionStatsLoading } = api.subscriptions.getStats.useQuery();
  const { data: affiliateStats, isLoading: affiliateStatsLoading } = api.affiliates.getGeneralStats.useQuery();
  const { data: pendingPayments } = api.payments.getPendingReview.useQuery();

  const isLoading = userStatsLoading || paymentStatsLoading || subscriptionStatsLoading || affiliateStatsLoading;

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRole = session.user.role;
  const isVerifier = userRole === "VERIFIER";
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole || "");
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Bienvenido, {session.user.name}
              <Badge className="ml-2" variant="outline">
                {userRole === "SUPER_ADMIN" ? "Super Admin" : 
                 userRole === "ADMIN" ? "Administrador" : "Verificador"}
              </Badge>
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              Panel Cliente
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {/* Users Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {userStats?.newUsersThisMonth || 0} nuevos este mes
              </p>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${paymentStats?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">
                {paymentStats?.approved || 0} pagos aprobados
              </p>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptionStats?.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                {subscriptionStats?.expiringSoon || 0} vencen pronto
              </p>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats?.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requieren revisión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Payment Review - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Revisar Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {pendingPayments?.length || 0} pagos esperando revisión
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/payments">
                  Revisar Pagos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* User Management - Admin only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Administrar usuarios y permisos
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/users">
                    Gestionar Usuarios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Plans Management - Admin only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Gestión de Planes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Crear y editar planes de IPTV
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/plans">
                    Gestionar Planes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin-only features */}
        {isAdmin && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Affiliates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sistema de Afiliados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Afiliados Activos</div>
                    <div className="text-2xl font-bold">{affiliateStats?.totalAffiliates || 0}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Referidos</div>
                    <div className="text-2xl font-bold">{affiliateStats?.totalReferrals || 0}</div>
                  </div>
                </div>
                <Button asChild className="w-full mt-4" variant="outline">
                  <Link href="/admin/affiliates">
                    Gestionar Afiliados
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Anuncios y Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gestionar feed de anuncios y enviar notificaciones
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/admin/announcements">
                    Gestionar Anuncios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Super Admin only */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Administradores</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Gestionar cuentas de administradores
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/administrators">
                      Gestionar Admins
                    </Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Configuración de Afiliados</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configurar comisiones y porcentajes
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/affiliate-config">
                      Configurar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}