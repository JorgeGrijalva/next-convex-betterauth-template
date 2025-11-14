export const dynamic = "force-dynamic";
"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");

  const { data: plan, isLoading: loadingPlan } = api.plans.getById.useQuery(
    { id: planId! },
    { enabled: !!planId }
  );

  const createPayment = api.payments.publicCreate.useMutation();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  if (!planId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-neutral-400">Plan no especificado</div>
      </div>
    );
  }

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-neutral-400">Cargando información del plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-neutral-400">Plan no encontrado</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await createPayment.mutateAsync({
        planId: plan.id,
        amount: plan.price,
        name,
        email: email || undefined,
        whatsapp: whatsapp || undefined,
        reference: reference || undefined,
        receiptImage: receiptImage || undefined,
        paymentMethod: "MANUAL",
      });

      // Redirect to a confirmation page with paymentId and userId
      router.push(`/checkout/success?paymentId=${res.payment.id}&userId=${res.userId}`);
    } catch (err: any) {
      setError(err?.message || "Error al crear el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">Checkout — {plan.name}</h1>
          <p className="text-neutral-400 mt-2">
            Precio: {plan.currency} {plan.price} — {plan.duration} días
          </p>
        </header>

        <Card className="bg-[#070707] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Datos para la orden</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-neutral-300">Nombre completo</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">Email (para notificaciones)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">WhatsApp (opcional)</label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+521XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">Referencia / Nota (opcional)</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Referencia del pago o nota"
                />
              </div>

              <div>
                <label className="text-sm text-neutral-300">URL del comprobante (opcional)</label>
                <Input
                  value={receiptImage}
                  onChange={(e) => setReceiptImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {error && (
                <div className="text-sm text-red-400">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-4">
              <div className="text-neutral-400">
                Total: <span className="font-semibold text-white">{plan.currency} {plan.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.back()} disabled={submitting}>
                  Volver
                </Button>
                <Button type="submit" className="px-6" disabled={submitting}>
                  {submitting ? "Procesando..." : "Pagar y crear orden"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-sm text-neutral-500">
          Al completar, tu orden quedará en estado "En proceso". El equipo validará el pago y te enviará las credenciales cuando sea aprobado.
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Cargando...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}