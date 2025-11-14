"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementsFeed } from "@/components/announcements-feed";
import { 
  Play, 
  CreditCard, 
  Users, 
  Tv, 
  Settings, 
  LogOut,
  Calendar,
  DollarSign,
  UserPlus
} from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: userDashboard } = api.users.getDashboard.useQuery();
  const { data: affiliateStats } = api.affiliates.getMyStats.useQuery();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="text-3xl font-bold text-purple-400">Flutv</div>
          </div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const subscription = userDashboard?.subscription;
  const totalPayments = userDashboard?.recentPayments?.length || 0;
  const approvedPayments = userDashboard?.recentPayments?.filter(p => p.status === "APPROVED").length || 0;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ACTIVE": return "text-green-400";
      case "PENDING": return "text-yellow-400";
      case "EXPIRED": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "ACTIVE": return "Activo";
      case "PENDING": return "Pendiente";
      case "EXPIRED": return "Vencido";
      default: return "Sin suscripción";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-purple-400">
                Flutv
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/planes" className="text-slate-300 hover:text-white transition-colors">
                  Planes
                </Link>
                <Link href="/pagos" className="text-slate-300 hover:text-white transition-colors">
                  Mis Pagos
                </Link>
                <Link href="/afiliados" className="text-slate-300 hover:text-white transition-colors">
                  Afiliados
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-white">{session.user.name}</div>
                <div className="text-xs text-slate-400">
                  {session.user.role === "ADMIN" ? "Administrador" : 
                   session.user.role === "VERIFIER" ? "Verificador" : "Cliente"}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-300 hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Announcements Feed */}
        <AnnouncementsFeed />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido, {session.user.name}
          </h1>
          <p className="text-slate-400">
            Gestiona tu suscripción y accede a todos nuestros servicios
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Estado de Suscripción
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(subscription?.status)}`}>
                {getStatusText(subscription?.status)}
              </div>
              {subscription?.plan && (
                <p className="text-xs text-slate-400 mt-1">
                  Plan: {subscription.plan.name}
                </p>
              )}
              {subscription?.endDate && (
                <p className="text-xs text-slate-400">
                  Vence: {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pagos Realizados
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {approvedPayments}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {totalPayments} pagos totales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Referidos
              </CardTitle>
              <UserPlus className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {affiliateStats?.totalReferrals || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {affiliateStats?.totalConversions || 0} conversiones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button asChild className="bg-slate-800 hover:bg-slate-700 border-slate-600 h-auto py-4 px-4">
            <Link href="/planes" className="flex flex-col items-center gap-2">
              <Play className="h-6 w-6 text-purple-400" />
              <span className="text-sm">Ver Planes</span>
            </Link>
          </Button>

          <Button asChild className="bg-slate-800 hover:bg-slate-700 border-slate-600 h-auto py-4 px-4">
            <Link href="/pagos" className="flex flex-col items-center gap-2">
              <CreditCard className="h-6 w-6 text-green-400" />
              <span className="text-sm">Mis Pagos</span>
            </Link>
          </Button>

          <Button asChild className="bg-slate-800 hover:bg-slate-700 border-slate-600 h-auto py-4 px-4">
            <Link href="/afiliados" className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Afiliados</span>
            </Link>
          </Button>

          <Button asChild className="bg-slate-800 hover:bg-slate-700 border-slate-600 h-auto py-4 px-4">
            <Link href="/mi-cuenta" className="flex flex-col items-center gap-2">
              <Tv className="h-6 w-6 text-orange-400" />
              <span className="text-sm">Mi Cuenta IPTV</span>
            </Link>
          </Button>
        </div>

        {/* Admin Quick Access */}
        {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" || session.user.role === "VERIFIER") && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Panel de Administración</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/admin/pagos">Revisar Pagos</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/admin/usuarios">Gestionar Usuarios</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/admin/planes">Administrar Planes</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
