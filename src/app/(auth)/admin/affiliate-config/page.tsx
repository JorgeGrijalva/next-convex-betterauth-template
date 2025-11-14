"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, DollarSign, Percent, Clock, Save } from "lucide-react";

export default function AdminAffiliateConfigPage() {
  const { data: session } = useSession();
  const { data: config, isLoading } = api.affiliates.getConfig.useQuery();
  const utils = api.useUtils();

  type CommissionType = "FIXED_AMOUNT" | "PERCENTAGE" | "FREE_DAYS";

  const [formData, setFormData] = useState({
    commissionType: (config?.commissionType || "PERCENTAGE") as CommissionType,
    percentage: config?.percentage || 10,
    fixedAmount: config?.fixedAmount || 0,
    freeDays: config?.freeDays || 0,
    isActive: config?.isActive ?? true,
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
                <Label htmlFor="commissionType" className="text-white flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Tipo de Comisión
                </Label>
                <select
                  id="commissionType"
                  value={formData.commissionType}
                  onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as CommissionType })}
                  className="bg-gray-700 border-gray-600 text-white mt-2 w-full h-10 rounded-md px-3"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="FIXED_AMOUNT">Monto Fijo</option>
                  <option value="FREE_DAYS">Días Gratis</option>
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  Tipo de comisión que los afiliados ganan por cada venta
                </p>
              </div>

              {formData.commissionType === "PERCENTAGE" && (
                <div>
                  <Label htmlFor="percentage" className="text-white flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Porcentaje de Comisión (%)
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Porcentaje que los afiliados ganan por cada venta
                  </p>
                </div>
              )}

              {formData.commissionType === "FIXED_AMOUNT" && (
                <div>
                  <Label htmlFor="fixedAmount" className="text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Monto Fijo (USD)
                  </Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fixedAmount}
                    onChange={(e) => setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Cantidad fija que los afiliados ganan por cada venta
                  </p>
                </div>
              )}

              {formData.commissionType === "FREE_DAYS" && (
                <div>
                  <Label htmlFor="freeDays" className="text-white flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Días Gratis
                  </Label>
                  <Input
                    id="freeDays"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.freeDays}
                    onChange={(e) => setFormData({ ...formData, freeDays: parseInt(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Días gratis que los afiliados ganan por cada venta
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="text-white">Sistema de Afiliados Activo</Label>
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
                <span className="text-gray-300">Tipo de Comisión:</span>
                <Badge className="bg-purple-600">{config?.commissionType}</Badge>
              </div>
              {config?.commissionType === "PERCENTAGE" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Porcentaje de Comisión:</span>
                  <Badge className="bg-green-600">{config?.percentage}%</Badge>
                </div>
              )}
              {config?.commissionType === "FIXED_AMOUNT" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monto Fijo:</span>
                  <Badge className="bg-blue-600">${config?.fixedAmount}</Badge>
                </div>
              )}
              {config?.commissionType === "FREE_DAYS" && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Días Gratis:</span>
                  <Badge className="bg-orange-600">{config?.freeDays} días</Badge>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Estado del Sistema:</span>
                <Badge className={config?.isActive ? "bg-green-600" : "bg-red-600"}>
                  {config?.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}