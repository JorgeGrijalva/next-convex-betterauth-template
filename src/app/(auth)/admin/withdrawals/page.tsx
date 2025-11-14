"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
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
import { DollarSign, User, Calendar, Clock } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  amount: number;
  clabe: string;
  bank: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
  affiliate: {
    id: string;
    name: string;
    whatsapp: string;
    email: string;
  };
}

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: withdrawalsData, isLoading } = api.affiliates.getWithdrawalRequests.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase() as "PENDING" | "PAID" | "CANCELLED",
  });

  const utils = api.useUtils();

  const updateWithdrawalStatus = api.affiliates.updateWithdrawalStatus.useMutation({
    onSuccess: () => {
      utils.affiliates.getWithdrawalRequests.invalidate();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-600">Pendiente</Badge>;
      case "PAID":
        return <Badge className="bg-green-600">Pagado</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-600">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusUpdate = (withdrawalId: string, newStatus: "PENDING" | "PAID" | "CANCELLED") => {
    updateWithdrawalStatus.mutate({
      withdrawalId,
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando solicitudes de retiro...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-purple-400" />
          Solicitudes de Retiro
        </h1>
        <p className="text-gray-400">Administrar solicitudes de retiro de comisiones</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="approved">Aprobados</SelectItem>
              <SelectItem value="rejected">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Afiliado</TableHead>
              <TableHead className="text-gray-300">Monto</TableHead>
              <TableHead className="text-gray-300">Método</TableHead>
              <TableHead className="text-gray-300">Fecha Solicitud</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawalsData?.withdrawals?.map((withdrawal) => (
              <TableRow key={withdrawal.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{withdrawal.affiliate.name}</p>
                    <p className="text-sm text-gray-400">{withdrawal.affiliate.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">${withdrawal.amount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-300">
                    <p className="font-medium">Transferencia Bancaria</p>
                    <p className="text-sm text-gray-400">
                      {withdrawal.bank} - {withdrawal.clabe}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(withdrawal.status)}
                </TableCell>
                <TableCell>
                  {withdrawal.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(withdrawal.id, "PAID")}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleStatusUpdate(withdrawal.id, "CANCELLED")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {withdrawal.status !== "PENDING" && (
                    <span className="text-gray-400 text-sm">
                      {withdrawal.status === "PAID" ? "Procesado" : "Cancelado"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {withdrawalsData?.withdrawals?.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No hay solicitudes de retiro</p>
          </div>
        )}
      </div>
    </div>
  );
}