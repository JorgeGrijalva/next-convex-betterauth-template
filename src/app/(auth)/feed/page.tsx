"use client";

import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Megaphone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FeedPage() {
  const { data: announcements, isLoading } = api.announcements.getFeed.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-4xl mx-auto">
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Megaphone className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Noticias y Anuncios</h1>
          </div>
          <p className="text-muted-foreground">
            Mantente al día con las últimas noticias y actualizaciones
          </p>
        </div>

        {/* Announcements Feed */}
        {announcements && announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="overflow-hidden">
                {announcement.imageUrl && (
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {announcement.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hay anuncios disponibles</h3>
            <p className="text-muted-foreground mb-6">
              No tenemos noticias nuevas en este momento. Vuelve pronto para ver las últimas actualizaciones.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Enlaces Útiles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/plans" className="flex flex-col items-center gap-2">
                <div className="font-medium">Ver Planes</div>
                <div className="text-xs text-muted-foreground text-center">
                  Explora nuestros planes de IPTV
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/payments" className="flex flex-col items-center gap-2">
                <div className="font-medium">Realizar Pago</div>
                <div className="text-xs text-muted-foreground text-center">
                  Sube tu comprobante de pago
                </div>
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/affiliates" className="flex flex-col items-center gap-2">
                <div className="font-medium">Programa de Afiliados</div>
                <div className="text-xs text-muted-foreground text-center">
                  Gana dinero refiriendo usuarios
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}