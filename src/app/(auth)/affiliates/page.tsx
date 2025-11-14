"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  Share2
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AffiliatesPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawClabe, setWithdrawClabe] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading } = api.affiliates.getMyStats.useQuery();
  const { data: commissions } = api.affiliates.getMyCommissions.useQuery({
    limit: 10,
    offset: 0,
  });
  const { data: referrals } = api.affiliates.getMyReferrals.useQuery();

  // Mutations
  const requestWithdraw = api.affiliates.requestWithdraw.useMutation({
    onSuccess: () => {
      setWithdrawAmount("");
      alert("Solicitud de retiro enviada exitosamente");
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    if (amount > (stats?.pendingCommissions || 0)) {
      alert("No tienes suficiente saldo disponible");
      return;
    }

    if (withdrawClabe.length !== 18) {
      alert("CLABE debe tener 18 dígitos");
      return;
    }
    if (!withdrawBank) {
      alert("Ingresa el banco");
      return;
    }

    try {
      await requestWithdraw.mutateAsync({
        amount,
        clabe: withdrawClabe,
        bank: withdrawBank,
        notes: `Retiro de comisiones por afiliado`,
      });
    } catch (error) {
      alert("Error al solicitar retiro");
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Programa de Afiliados</h1>
          <p className="text-muted-foreground">
            Gana dinero refiriendo nuevos usuarios a nuestra plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios registrados con tu link
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Referidos que pagaron
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones Ganadas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalCommissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total acumulado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponible</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.pendingCommissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pendiente de retiro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Tu Link de Referido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={stats?.referralLink || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(stats?.referralLink || "")}
                className="whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Código de Referido:</h4>
              <div className="font-mono text-lg font-bold text-primary">
                {stats?.referralCode}
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Comparte tu link de referido con amigos y familiares. Cuando se registren y realicen 
                su primer pago, recibirás una comisión automáticamente.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="withdraw" className="space-y-6">
          <TabsList>
            <TabsTrigger value="withdraw">Retiros</TabsTrigger>
            <TabsTrigger value="commissions">Comisiones</TabsTrigger>
            <TabsTrigger value="referrals">Mis Referidos</TabsTrigger>
          </TabsList>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Retiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Monto a retirar</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      max={stats?.pendingCommissions || 0}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Disponible: ${stats?.pendingCommissions || 0}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">CLABE Interbancaria (18 dígitos)</label>
                      <Input
                        placeholder="XXXXXXXXXXXXXXXXXX"
                        value={withdrawClabe}
                        onChange={(e) => setWithdrawClabe(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Banco</label>
                      <Input
                        placeholder="Nombre del banco"
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Button 
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || requestWithdraw.isPending || (stats?.pendingCommissions || 0) <= 0}
                    >
                      {requestWithdraw.isPending ? "Procesando..." : "Solicitar"}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Los retiros se procesan en 1-2 días hábiles. Serás contactado por WhatsApp 
                    para coordinar el pago.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Comisiones</CardTitle>
              </CardHeader>
              <CardContent>
                {commissions && commissions.length > 0 ? (
                  <div className="space-y-4">
                    {commissions.map((commission) => (
                      <div key={commission.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            Referido: {commission.referredUser.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {commission.amount ? `$${commission.amount}` : `${commission.days} días gratis`}
                          </div>
                          <Badge variant={commission.status === "PAID" ? "default" : "secondary"}>
                            {commission.status === "PAID" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes comisiones aún
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Referidos</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals && referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{referral.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Registrado: {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              referral.payments.length > 0 ? "default" : 
                              referral.subscriptions[0]?.status === "PENDING" ? "secondary" : 
                              "outline"
                            }
                          >
                            {referral.payments.length > 0 ? "Pagó" : 
                             referral.subscriptions[0]?.status === "PENDING" ? "Pendiente" : 
                             "Sin pagar"}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {referral.subscriptions[0]?.plan.name || "Sin plan"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No has referido usuarios aún
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How it Works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>¿Cómo Funciona el Programa de Afiliados?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                <h4 className="font-medium">Comparte tu Link</h4>
                <p className="text-muted-foreground">
                  Envía tu link de referido a amigos, familiares o redes sociales.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                <h4 className="font-medium">Se Registran y Pagan</h4>
                <p className="text-muted-foreground">
                  Cuando alguien usa tu link, se registra y realiza su primer pago.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                <h4 className="font-medium">Recibes Comisión</h4>
                <p className="text-muted-foreground">
                  Automáticamente recibes tu comisión que podrás retirar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}