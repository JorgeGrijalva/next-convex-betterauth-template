"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Eye, 
  Check, 
  X, 
  Clock,
  DollarSign,
  User,
  Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  reference?: string | null;
  receiptImage?: string | null;
  paymentMethod?: string | null;
  status: string;
  paidAt?: Date | null;
  createdAt: Date;
  reviewNotes?: string | null;
  user: {
    id: string;
    name: string;
    whatsapp: string;
    email?: string | null;
  };
  plan: {
    id: string;
    name: string;
    duration: number;
  };
}

export default function PaymentReviewPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Queries
  const { data: payments, refetch } = api.payments.getAll.useQuery({
    status: filter === "all" ? undefined : filter.toUpperCase() as any,
    limit: 50,
  });
  
  // Mutations
  const approvePayment = api.payments.approve.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedPayment(null);
      setReviewNotes("");
    },
  });

  const rejectPayment = api.payments.reject.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedPayment(null);
      setReviewNotes("");
    },
  });

  const handleApprove = async (paymentId: string) => {
    if (!confirm("¿Estás seguro de que quieres aprobar este pago?")) return;
    
    try {
      await approvePayment.mutateAsync({
        paymentId,
        reviewNotes: reviewNotes || undefined,
      });
      alert("Pago aprobado exitosamente");
    } catch (error) {
      alert("Error al aprobar el pago");
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!reviewNotes.trim()) {
      alert("Debes proporcionar una razón para rechazar el pago");
      return;
    }

    if (!confirm("¿Estás seguro de que quieres rechazar este pago?")) return;

    try {
      await rejectPayment.mutateAsync({
        paymentId,
        reviewNotes,
      });
      alert("Pago rechazado");
    } catch (error) {
      alert("Error al rechazar el pago");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case "REJECTED":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
  };

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Panel Admin
            </Link>
          </Button>
        </div>

        {/* Page Title and Filters */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
            <p className="text-muted-foreground">
              Revisar y gestionar comprobantes de pago
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pendientes
            </Button>
            <Button 
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
            >
              Aprobados
            </Button>
            <Button 
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
            >
              Rechazados
            </Button>
            <Button 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Todos
            </Button>
          </div>
        </div>

        {/* Payments List */}
        {payments && payments.length > 0 ? (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment.id} className={`${
                payment.status === "PENDING" ? "border-orange-200 bg-orange-50/50" : ""
              }`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    {/* Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{payment.user.name}</span>
                        </div>
                        <Badge variant="outline">{payment.user.whatsapp}</Badge>
                        {getStatusBadge(payment.status)}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Plan</div>
                          <div className="font-medium">{payment.plan.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {payment.plan.duration} días
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground">Monto</div>
                          <div className="font-bold text-lg flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {payment.amount} {payment.currency}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Fecha</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {(payment.reference || payment.paymentMethod) && (
                        <div className="mt-3 pt-3 border-t text-sm space-y-1">
                          {payment.reference && (
                            <div>
                              <span className="text-muted-foreground">Referencia:</span> {payment.reference}
                            </div>
                          )}
                          {payment.paymentMethod && (
                            <div>
                              <span className="text-muted-foreground">Método:</span> {payment.paymentMethod}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Notes */}
                      {payment.reviewNotes && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notas de revisión:</span>
                            <div className="mt-1 p-2 bg-muted rounded text-sm">
                              {payment.reviewNotes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {/* View Receipt */}
                      {payment.receiptImage && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Comprobante
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Comprobante de Pago</DialogTitle>
                              <DialogDescription>
                                {payment.user.name} - {payment.plan.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                              <Image
                                src={payment.receiptImage}
                                alt="Comprobante de pago"
                                fill
                                className="object-contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Review Actions for Pending Payments */}
                      {payment.status === "PENDING" && (
                        <Dialog 
                          open={selectedPayment?.id === payment.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedPayment(null);
                              setReviewNotes("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              Revisar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Revisar Pago</DialogTitle>
                              <DialogDescription>
                                {payment.user.name} - ${payment.amount} {payment.currency}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">
                                  Notas de revisión (opcional)
                                </label>
                                <Textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="Agrega una nota sobre esta revisión..."
                                  className="mt-2"
                                />
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button
                                  className="flex-1"
                                  onClick={() => handleApprove(payment.id)}
                                  disabled={approvePayment.isPending}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Aprobar
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleReject(payment.id)}
                                  disabled={rejectPayment.isPending}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay pagos</h3>
            <p className="text-muted-foreground">
              {filter === "pending" 
                ? "No hay pagos pendientes de revisión" 
                : `No hay pagos ${filter === "all" ? "" : filter === "approved" ? "aprobados" : "rechazados"}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}