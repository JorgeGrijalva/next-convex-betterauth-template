"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { Upload, ArrowLeft, CreditCard, User, Mail, Phone, Lock, Hash } from "lucide-react";

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");

  const { data: plan, isLoading: loadingPlan } = api.plans.getById.useQuery(
    { id: planId! },
    { enabled: !!planId }
  );
  
  const register = api.auth.register.useMutation();
  const createPayment = api.payments.create.useMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
    reference: "",
    referralCode: ""
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!planId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-400 mb-2">Plan no especificado</div>
              <Button onClick={() => router.push("/planes")} className="bg-purple-600 hover:bg-purple-700">
                Ver Planes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-white">Cargando información del plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-400 mb-2">Plan no encontrado</div>
              <Button onClick={() => router.push("/planes")} className="bg-purple-600 hover:bg-purple-700">
                Ver Planes Disponibles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!selectedFile) {
        throw new Error("Debes subir tu comprobante de pago");
      }

      // Register user
      await register.mutateAsync({
        name: formData.name,
        whatsapp: formData.whatsapp,
        email: formData.email || undefined,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
      });

      // Sign in immediately
      const signInRes = await signIn("credentials", {
        redirect: false,
        identifier: formData.whatsapp || formData.email,
        password: formData.password,
      });
      
      if (!signInRes?.ok) {
        throw new Error("Error al iniciar sesión después del registro");
      }

      // Create payment with receipt (simulated URL)
      const receiptImageUrl = `https://placeholder-receipts.com/${selectedFile.name}`;
      await createPayment.mutateAsync({
        planId: plan.id,
        amount: plan.price,
        reference: formData.reference || undefined,
        receiptImage: receiptImageUrl,
        paymentMethod: "Transferencia Bancaria",
        paidAt: new Date().toISOString().split('T')[0],
      });

      router.push(`/pagos`);
    } catch (err: any) {
      setError(err?.message || "Error al procesar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo no debe superar 5MB");
      return;
    }
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert("Solo se permiten imágenes (PNG/JPG) o PDF");
      return;
    }
    
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-purple-400">
              Flutv
            </Link>
            <Button 
              variant="outline" 
              onClick={() => router.push("/planes")}
              className="text-slate-300 hover:text-white border-slate-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Planes
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Plan Summary */}
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Resumen de tu Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <h2 className="text-2xl font-bold text-purple-400 mb-2">{plan.name}</h2>
              <p className="text-slate-300 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-white mb-2">
                ${plan.price} {plan.currency}
              </div>
              <div className="text-slate-400">
                Duración: {plan.duration} días
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Completa tu Registro y Pago
              </CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">Información Personal</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombre completo *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Juan Pérez García"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-slate-300 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        WhatsApp *
                      </Label>
                      <Input
                        id="whatsapp"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        placeholder="+521234567890"
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email (opcional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="correo@ejemplo.com"
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Crear contraseña *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">Información de Pago</h3>
                  
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-300 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Método de Pago: Transferencia Bancaria</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Realiza tu transferencia y sube el comprobante para validar tu pago
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-slate-300 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Referencia de pago (opcional)
                    </Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      placeholder="Número de referencia o nota"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-slate-300">
                      Código de referido (opcional)
                    </Label>
                    <Input
                      id="referralCode"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                      placeholder="Ej. ARTURO123"
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">Comprobante de Pago</h3>
                  
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                    <input
                      type="file"
                      id="receipt"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label htmlFor="receipt" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-slate-300">
                        {selectedFile ? (
                          <span className="text-green-400">✓ {selectedFile.name}</span>
                        ) : (
                          "Haz clic para subir tu comprobante (PNG/JPG/PDF, máx. 5MB)"
                        )}
                      </div>
                    </Label>
                  </div>

                  {previewUrl && (
                    <div className="mt-4">
                      <Label className="text-slate-300 mb-2 block">Vista previa:</Label>
                      <div className="relative w-full h-48 border border-slate-600 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={previewUrl} 
                          alt="Comprobante de pago" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="w-full text-center">
                  <div className="text-slate-300 mb-2">
                    Total a pagar: <span className="font-bold text-white text-xl">${plan.price} {plan.currency}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Tu pedido quedará en estado "Pendiente de Validación" y te notificaremos por WhatsApp
                  </div>
                </div>
                
                <div className="flex gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/planes")}
                    disabled={submitting}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !selectedFile}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
                  >
                    {submitting ? "Procesando..." : "Completar Pedido"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}