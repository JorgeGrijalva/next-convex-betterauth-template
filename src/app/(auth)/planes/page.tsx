"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Clock, CheckCircle } from "lucide-react";

export default function Planes() {
  const { data: session } = useSession();
  const { data: plans, isLoading } = api.plans.getActivePlans.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nuestros Planes de IPTV
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y disfruta de la mejor televisión por internet
          </p>
        </div>

        {/* Plans Grid */}
        {plans && plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-slate-800 border-slate-700 text-white hover:border-purple-500 transition-all hover:scale-105">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    ${plan.price}
                  </div>
                  <div className="text-slate-400 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    {plan.duration} días
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {plan.description && (
                    <p className="text-slate-300 text-center mb-6">
                      {plan.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300">Canales en HD</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300">Soporte 24/7</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300">Estabilidad garantizada</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-slate-300">Múltiples dispositivos</span>
                    </div>
                  </div>

                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href={`/checkout?planId=${plan.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Comprar Ahora
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-4">
              No hay planes disponibles actualmente
            </div>
            <Button asChild variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            ¿Por qué elegir Flutv?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400">Características Técnicas</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Transmisión en alta definición (HD)
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Servidores estables y rápidos
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Compatible con múltiples dispositivos
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Actualización constante de canales
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-400">Servicio al Cliente</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Soporte técnico 24/7
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Atención por WhatsApp
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Configuración guiada
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Garantía de satisfacción
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}