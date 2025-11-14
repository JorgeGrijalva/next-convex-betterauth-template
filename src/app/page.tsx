"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { Play, CreditCard, Users, Shield } from "lucide-react";

export default function Home() {
  const { data: plans } = api.plans.getActivePlans.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              Flutv
              <span className="block text-3xl md:text-4xl text-purple-300 mt-2">
                Tu IPTV de Confianza
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Disfruta de los mejores canales de televisión por internet con la mejor calidad y precio del mercado
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/planes">
                <Play className="mr-2 h-4 w-4" />
                Ver Planes
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-purple-400 text-purple-400 hover:bg-purple-400">
              <Link href="/afiliados">
                <Users className="mr-2 h-4 w-4" />
                Programa de Afiliados
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-purple-400" />
                Calidad HD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Transmisión en alta definición con estabilidad garantizada
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Pago Seguro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Múltiples métodos de pago con verificación manual de comprobantes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Soporte 24/7
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Atención al cliente mediante WhatsApp para resolver cualquier duda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plans Preview */}
        {plans && plans.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Nuestros Planes
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <Card key={plan.id} className="bg-slate-800/50 border-slate-700 text-white hover:border-purple-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold text-purple-400">
                      ${plan.price} {plan.currency}
                    </div>
                    <div className="text-sm text-gray-400">
                      {plan.duration} días
                    </div>
                  </CardHeader>
                  <CardContent>
                    {plan.description && (
                      <p className="text-gray-300 mb-4">{plan.description}</p>
                    )}
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link href={`/checkout?planId=${plan.id}`}>
                        Comprar Ahora
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}