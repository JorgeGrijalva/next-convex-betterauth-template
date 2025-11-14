"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";

function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  
  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    reference: "",
    paymentMethod: "",
    paidAt: new Date().toISOString().split('T')[0], // Today's date
  });

  // Queries
  const { data: plans } = api.plans.getActivePlans.useQuery();
  const { data: myPayments, refetch: refetchPayments } = api.payments.getMyPayments.useQuery();
  
  // Mutations
  const createPayment = api.payments.create.useMutation({
    onSuccess: () => {
      setSelectedFile(null);
      setPreviewUrl("");
      setFormData({
        reference: "",
        paymentMethod: "",
        paidAt: new Date().toISOString().split('T')[0],
      });
      refetchPayments();
    },
  });

  const selectedPlan = plans?.find(p => p.id === planId);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("El archivo debe ser menor a 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert("Solo se permiten imágenes y archivos PDF");
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl("");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      alert("Por favor selecciona un plan");
      return;
    }

    if (!selectedFile) {
      alert("Por favor sube tu comprobante de pago");
      return;
    }

    // En un sistema real, subirías la imagen a un servicio como S3 o Cloudinary
    // Por ahora simularemos con una URL placeholder
    const receiptImageUrl = `https://placeholder-receipts.com/${selectedFile.name}`;

    try {
      await createPayment.mutateAsync({
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        reference: formData.reference,
        receiptImage: receiptImageUrl,
        paymentMethod: formData.paymentMethod || "Transferencia Bancaria",
        paidAt: formData.paidAt,
      });

      alert("¡Comprobante enviado exitosamente! Será revisado en las próximas horas.");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar el comprobante. Intenta nuevamente.");
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/plans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Planes
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <h1 className="text-2xl font-bold mb-6">Subir Comprobante de Pago</h1>
            
            {selectedPlan ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Plan Seleccionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-semibold">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span>{selectedPlan.duration} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio:</span>
                      <span className="font-semibold text-lg">
                        ${selectedPlan.price} {selectedPlan.currency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No has seleccionado un plan. <Link href="/plans" className="underline">Ir a planes</Link>
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Datos para Transferencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Banco:</span> Banco Ejemplo
                  </div>
                  <div>
                    <span className="font-medium">Cuenta:</span> 1234-5678-9012-3456
                  </div>
                  <div>
                    <span className="font-medium">Titular:</span> IPTV Company S.A.
                  </div>
                  <div>
                    <span className="font-medium">CLABE:</span> 012345678901234567
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="receipt">Comprobante de Pago *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="receipt"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="receipt" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : "Haz clic para subir imagen o PDF"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Máximo 5MB • PNG, JPG, PDF
                    </div>
                  </label>
                </div>
                
                {/* Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <Label>Vista previa:</Label>
                    <div className="relative w-full h-48 mt-2 border rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Reference */}
              <div>
                <Label htmlFor="reference">Referencia / Número de Operación</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Ej: 123456789"
                  className="mt-2"
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="method">Método de Pago</Label>
                <Input
                  id="method"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  placeholder="Ej: Transferencia Bancaria, OXXO, etc."
                  className="mt-2"
                />
              </div>

              {/* Payment Date */}
              <div>
                <Label htmlFor="paidAt">Fecha de Pago</Label>
                <Input
                  id="paidAt"
                  type="date"
                  value={formData.paidAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, paidAt: e.target.value }))}
                  className="mt-2"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedPlan || !selectedFile || createPayment.isPending}
              >
                {createPayment.isPending ? "Enviando..." : "Enviar Comprobante"}
              </Button>
            </form>
          </div>

          {/* Payment History */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Historial de Pagos</h2>
            
            {myPayments && myPayments.length > 0 ? (
              <div className="space-y-4">
                {myPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{payment.plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${payment.amount} {payment.currency}
                          </div>
                        </div>
                        <Badge variant={
                          payment.status === "APPROVED" ? "default" :
                          payment.status === "REJECTED" ? "destructive" : 
                          "secondary"
                        }>
                          {payment.status === "APPROVED" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {payment.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                          {payment.status === "REJECTED" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {payment.status === "APPROVED" ? "Aprobado" :
                           payment.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Fecha: {new Date(payment.createdAt).toLocaleDateString()}</div>
                        {payment.reference && (
                          <div>Referencia: {payment.reference}</div>
                        )}
                        {payment.reviewNotes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Nota:</strong> {payment.reviewNotes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <div className="text-muted-foreground">No tienes pagos registrados</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    }>
      <PaymentsPageContent />
    </Suspense>
  );
}