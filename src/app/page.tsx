"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { Play, CreditCard, Users, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session?.user) {
    return router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-purple-400">
              Flutv
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Button asChild>
                <Link href="/sign-up">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Tu plataforma de streaming favorita
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Accede a miles de canales y contenido en vivo
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">Empezar ahora</Link>
        </Button>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Por qué elegirnos
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Play className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Streaming en Vivo</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Accede a cientos de canales en vivo sin interrupciones
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Shield className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Seguro y Privado</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Tu información está protegida con los más altos estándares de seguridad
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Múltiples Dispositivos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Mira en TV, computadora, tablet y teléfono simultáneamente
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CreditCard className="h-8 w-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Planes Flexibles</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              Elige el plan que se ajuste a tu presupuesto
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Nuestros Planes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Básico",
              price: "$9.99",
              features: ["HD", "1 dispositivo", "Acceso a canales básicos"],
            },
            {
              name: "Premium",
              price: "$19.99",
              features: ["4K", "4 dispositivos", "Acceso a todos los canales"],
              highlighted: true,
            },
            {
              name: "Pro",
              price: "$29.99",
              features: ["4K", "6 dispositivos", "Acceso a todo + soporte prioritario"],
            },
          ].map((plan) => (
            <Card
              key={plan.name}
              className={`${
                plan.highlighted
                  ? "bg-purple-900 border-purple-500 scale-105"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-purple-400 mt-2">
                  {plan.price}
                </div>
                <p className="text-slate-400 text-sm">/mes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-slate-300 text-sm">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Elegir Plan</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2024 Flutv. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}