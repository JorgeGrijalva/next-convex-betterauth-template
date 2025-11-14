"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlansPage() {
  const router = useRouter();
  const { data: plans, isLoading } = api.plans.getActivePlans.useQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    router.push(`/payments?planId=${planId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Planes de IPTV</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para ti. Todos nuestros planes incluyen acceso completo 
            a nuestro servicio de IPTV con la mejor calidad.
          </p>
        </div>

        {/* Plans Grid */}
        {plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const isPopular = index === 1; // El segundo plan será el popular
              const features = plan.features ? JSON.parse(plan.features) : [
                "Acceso completo a IPTV",
                "Soporte 24/7",
                "Calidad HD/4K",
                "Sin restricciones"
              ];

              return (
                <Card key={plan.id} className={`relative ${isPopular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">{plan.currency}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        por {plan.duration} días
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features List */}
                    <div className="space-y-2">
                      {features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="w-full mt-6" 
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Seleccionar Plan
                    </Button>

                    {/* Duration highlight */}
                    <div className="text-center text-xs text-muted-foreground">
                      Válido por {plan.duration} días
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay planes disponibles</h3>
            <p className="text-muted-foreground">
              Actualmente no tenemos planes activos. Por favor contacta al soporte.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">¿Necesitas ayuda?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier consulta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/settings">
                  Configuración de Cuenta
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/affiliates">
                  Programa de Afiliados
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}