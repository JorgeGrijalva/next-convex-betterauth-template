"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Share2, 
  Clock,
  CheckCircle,
  UserPlus,
  User,
  Copy,
  LinkIcon,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Afiliados() {
  const { data: session } = useSession();
  const { data: stats } = api.affiliates.getMyStats.useQuery();
  const { data: commissions } = api.affiliates.getMyCommissions.useQuery({ limit: 10 });
  const { data: referrals } = api.affiliates.getMyReferrals.useQuery();

  const [copied, setCopied] = useState(false);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Inicia sesión</h3>
            <p className="text-slate-400 mb-6">
              Debes iniciar sesión para acceder al programa de afiliados
            </p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/sign-in">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyReferralLink = async () => {
    if (!stats?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      toast.success("¡Enlace copiado al portapapeles!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Error al copiar el enlace");
    }
  };

  const getCommissionBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">Pendiente</Badge>;
      case "PAID":
        return <Badge variant="secondary" className="bg-green-900 text-green-300">Pagado</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="bg-red-900 text-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            Programa de Afiliados
          </h1>
          <p className="text-slate-400">
            Gana dinero refiriendo nuevos usuarios a Flutv
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Total Referidos
                </CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalReferrals}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.totalConversions} han comprado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Comisiones Ganadas
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${stats.totalCommissions}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.commissionCount} comisiones
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Comisiones Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${stats.pendingCommissions}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {stats.pendingCount} comisiones
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Tasa de Conversión
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.totalReferrals > 0 
                    ? Math.round((stats.totalConversions / stats.totalReferrals) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  De referidos a compradores
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawal Button */}
        {stats && stats.pendingCommissions > 0 && (
          <div className="mb-8 text-center">
            <Link href="/afiliados/retirar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Retirar Comisiones (${stats.pendingCommissions})
              </Button>
            </Link>
          </div>
        )}

        {/* Referral Link */}
        {stats?.referralLink && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Tu Enlace de Referido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white font-mono text-sm break-all">
                    {stats.referralLink}
                  </div>
                  <Button 
                    onClick={copyReferralLink}
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-slate-400 text-sm">
                  Comparte este enlace con tus amigos. Cuando se registren y compren, ganarás comisiones.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Commissions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Comisiones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commissions && commissions.length > 0 ? (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {commission.referredUser.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          ${commission.amount || 0}
                        </div>
                        {getCommissionBadge(commission.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Sin comisiones</h3>
                  <p className="text-slate-400">
                    Aún no has ganado comisiones. ¡Empieza a referir usuarios!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Referidos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referrals && referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {referral.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {referral.payments.length > 0 ? (
                          <Badge variant="secondary" className="bg-green-900 text-green-300">
                            Compró
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400">
                            Sin comprar
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Sin referidos</h3>
                  <p className="text-slate-400">
                    Aún no has referido usuarios. ¡Empieza a compartir tu enlace!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}