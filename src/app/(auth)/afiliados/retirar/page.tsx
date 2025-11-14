"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, AlertCircle, Send } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  clabe: string;
  bank: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
}

export default function WithdrawalRequestPage() {
  const [amount, setAmount] = useState("");
  const [clabe, setClabe] = useState("");
  const [bank, setBank] = useState("");

  const { data: stats } = api.affiliates.getMyStats.useQuery();
  const { data: withdrawals } = api.affiliates.getMyWithdrawals.useQuery({});
  const utils = api.useUtils();

  const requestWithdrawal = api.affiliates.requestWithdraw.useMutation({
    onSuccess: () => {
      utils.affiliates.getMyStats.invalidate();
      utils.affiliates.getMyWithdrawals.invalidate();
      setAmount("");
      setBank("");
      setClabe("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !clabe || !bank) return;

    requestWithdrawal.mutate({
      amount: parseFloat(amount),
      clabe,
      bank,
    });
  };

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

  const canWithdraw = (stats?.pendingCommissions || 0) >= 50;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-purple-400" />
          Solicitud de Retiro
        </h1>
        <p className="text-gray-400">Retira tus comisiones ganadas</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Balance Disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold text-white">${stats?.pendingCommissions || 0}</p>
                <p className="text-gray-400">Comisión disponible</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Retiro mínimo</p>
                <p className="text-lg font-semibold text-white">$50</p>
              </div>
            </div>
          
          {!canWithdraw && (
            <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400 text-sm">
                Necesitas al menos $50 para solicitar un retiro
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      {canWithdraw && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5" />
              Nueva Solicitud de Retiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-white">Monto a Retirar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={50}
                  max={stats?.pendingCommissions || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder={`Mínimo: $50`}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bank" className="text-white">Banco</Label>
                <Input
                  id="bank"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Nombre del banco"
                  required
                />
              </div>

              <div>
                <Label htmlFor="clabe" className="text-white">Número de Cuenta CLABE</Label>
                <Input
                  id="clabe"
                  value={clabe}
                  onChange={(e) => setClabe(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="18 dígitos de CLABE"
                  maxLength={18}
                  minLength={18}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={requestWithdrawal.isPending}
              >
                {requestWithdrawal.isPending ? "Procesando..." : "Solicitar Retiro"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Retiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals?.withdrawals?.map((withdrawal: WithdrawalRequest) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">${withdrawal.amount}</p>
                  <p className="text-gray-400 text-sm">{withdrawal.bank} - {withdrawal.clabe}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(withdrawal.status)}
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {withdrawals?.withdrawals?.length === 0 && (
              <p className="text-gray-400 text-center py-4">No has realizado retiros aún</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}