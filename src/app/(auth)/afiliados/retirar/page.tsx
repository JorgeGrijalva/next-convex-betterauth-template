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

export default function WithdrawalRequestPage() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  const { data: stats } = api.affiliates.getMyStats.useQuery();
  const { data: withdrawals } = api.affiliates.getMyWithdrawals.useQuery();
  const utils = api.useUtils();

  const requestWithdrawal = api.affiliates.requestWithdrawal.useMutation({
    onSuccess: () => {
      utils.affiliates.getMyStats.invalidate();
      utils.affiliates.getMyWithdrawals.invalidate();
      setAmount("");
      setPaymentMethod("");
      setPaymentDetails("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentMethod || !paymentDetails) return;

    requestWithdrawal.mutate({
      amount: parseFloat(amount),
      paymentMethod,
      paymentDetails,
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

  const canWithdraw = (stats?.balance || 0) >= (stats?.minimumWithdrawal || 50);

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
              <p className="text-3xl font-bold text-white">${stats?.balance || 0}</p>
              <p className="text-gray-400">Comisión disponible</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Retiro mínimo</p>
              <p className="text-lg font-semibold text-white">${stats?.minimumWithdrawal || 50}</p>
            </div>
          </div>
          
          {!canWithdraw && (
            <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-400 text-sm">
                Necesitas al menos ${stats?.minimumWithdrawal || 50} para solicitar un retiro
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
                  min={stats?.minimumWithdrawal || 50}
                  max={stats?.balance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder={`Mínimo: $${stats?.minimumWithdrawal || 50}`}
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="text-white">Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecciona un método" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="crypto">Criptomoneda</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDetails" className="text-white">Detalles de Pago</Label>
                <Textarea
                  id="paymentDetails"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Ingresa los detalles según el método elegido (ej: email de PayPal, número de cuenta, etc.)"
                  rows={3}
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
            {withdrawals?.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">${withdrawal.amount}</p>
                  <p className="text-gray-400 text-sm">{withdrawal.paymentMethod}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(withdrawal.status)}
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {withdrawals?.length === 0 && (
              <p className="text-gray-400 text-center py-4">No has realizado retiros aún</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}