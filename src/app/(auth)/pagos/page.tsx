"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  DollarSign,
  Calendar,
  User,
  Eye
} from "lucide-react";

export default function Pagos() {
  const { data: session } = useSession();
  const { data: payments, isLoading } = api.payments.getMyPayments.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">Pendiente</Badge>;
      case "APPROVED":
        return <Badge variant="secondary" className="bg-green-900 text-green-300">Aprobado</Badge>;
      case "REJECTED":
        return <Badge variant="secondary" className="bg-red-900 text-red-300">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mis Pagos
          </h1>
          <p className="text-slate-400">
            Historial de todos tus pagos y sus estados
          </p>
        </div>

        {/* New Payment Button */}
        <div className="mb-8">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/planes">
              <DollarSign className="mr-2 h-4 w-4" />
              Nuevo Pago
            </Link>
          </Button>
        </div>

        {/* Payments List */}
        {payments && payments.length > 0 ? (
          <div className="grid gap-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <CardTitle className="text-white text-lg">
                          {payment.plan.name}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          ${payment.amount} {payment.currency}
                        </div>
                        <div className="text-sm text-slate-400">
                          {payment.plan.duration} días
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">Método:</span>
                        <span className="text-white">{payment.paymentMethod || "No especificado"}</span>
                      </div>
                      
                      {payment.reference && (
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">Referencia:</span>
                          <span className="text-white">{payment.reference}</span>
                        </div>
                      )}
                      
                      {payment.paidAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">Fecha de pago:</span>
                          <span className="text-white">{new Date(payment.paidAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {payment.reviewNotes && (
                        <div className="bg-slate-700 rounded-lg p-3">
                          <div className="text-sm text-slate-300 mb-1">Notas de revisión:</div>
                          <div className="text-white text-sm">{payment.reviewNotes}</div>
                        </div>
                      )}
                      
                      {payment.receiptImage && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Comprobante
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tienes pagos registrados
              </h3>
              <p className="text-slate-400 mb-6">
                Aún no has realizado ningún pago. Comienza comprando uno de nuestros planes.
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/planes">
                  Ver Planes Disponibles
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}