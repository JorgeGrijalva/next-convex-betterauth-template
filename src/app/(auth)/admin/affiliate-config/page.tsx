"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Percent, Clock, Save } from "lucide-react";

export default function AdminAffiliateConfigPage() {
  const { data: config, isLoading } = api.affiliates.getConfig.useQuery();
  const utils = api.useUtils();

  const [formData, setFormData] = useState({
    commissionRate: config?.commissionRate || 10,
    minimumWithdrawal: config?.minimumWithdrawal || 50,
    cookieDuration: config?.cookieDuration || 30,
  });

  const updateConfig = api.affiliates.updateConfig.useMutation({
    onSuccess: () => {
      utils.affiliates.getConfig.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando configuración...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-purple-400" />
          Configuración de Afiliados
        </h1>
        <p className="text-gray-400">Administrar la configuración del sistema de afiliados</p>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Configuración General</CardTitle>
            <CardDescription className="text-gray-400">
              Ajusta los parámetros del sistema de afiliados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="commissionRate" className="text-white flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Tasa de Comisión (%)
                </Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Porcentaje de comisión que los afiliados ganan por cada venta
                </p>
              </div>

              <div>
                <Label htmlFor="minimumWithdrawal" className="text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Retiro Mínimo (USD)
                </Label>
                <Input
                  id="minimumWithdrawal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimumWithdrawal}
                  onChange={(e) => setFormData({ ...formData, minimumWithdrawal: parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Cantidad mínima que los afiliados deben tener para solicitar un retiro
                </p>
              </div>

              <div>
                <Label htmlFor="cookieDuration" className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duración de Cookie (días)
                </Label>
                <Input
                  id="cookieDuration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.cookieDuration}
                  onChange={(e) => setFormData({ ...formData, cookieDuration: parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white mt-2"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Días que dura la cookie de afiliado en el navegador del cliente
                </p>
              </div>

              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">Configuración Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Comisión por Venta:</span>
                <Badge className="bg-purple-600">{config?.commissionRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Retiro Mínimo:</span>
                <Badge className="bg-green-600">${config?.minimumWithdrawal}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Duración de Cookie:</span>
                <Badge className="bg-blue-600">{config?.cookieDuration} días</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}