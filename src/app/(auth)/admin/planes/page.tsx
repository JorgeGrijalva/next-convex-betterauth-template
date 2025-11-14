"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Edit, DollarSign, Clock } from "lucide-react";

export default function AdminPlansPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const { data: plans, isLoading } = api.plans.getAll.useQuery();
  const utils = api.useUtils();

  const createPlan = api.plans.create.useMutation({
    onSuccess: () => {
      utils.plans.getAll.invalidate();
      utils.plans.getActivePlans.invalidate();
      setIsCreateOpen(false);
    },
  });

  const updatePlan = api.plans.update.useMutation({
    onSuccess: () => {
      utils.plans.getAll.invalidate();
      utils.plans.getActivePlans.invalidate();
      setEditingPlan(null);
    },
  });

  const PlanForm = ({ plan = null, onClose }: { plan?: any; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || 0,
      duration: plan?.duration || 30,
      features: plan?.features?.join("\n") || "",
      isActive: plan?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const features = formData.features.split("\n").filter(f => f.trim());
      
      if (plan) {
        updatePlan.mutate({
          id: plan.id,
          ...formData,
          features,
        });
      } else {
        createPlan.mutate({
          ...formData,
          features,
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white">Nombre del Plan</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-white">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="text-white">Precio (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="duration" className="text-white">Duración (días)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="features" className="text-white">Características (una por línea)</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={4}
            placeholder="Canales HD&#10;Soporte 24/7&#10;Sin anuncios"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive" className="text-white">Plan Activo</Label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            {plan ? "Actualizar" : "Crear"} Plan
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando planes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-400" />
            Gestión de Planes
          </h1>
          <p className="text-gray-400">Administrar planes de suscripción</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nuevo Plan</DialogTitle>
            </DialogHeader>
            <PlanForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Plan</TableHead>
              <TableHead className="text-gray-300">Descripción</TableHead>
              <TableHead className="text-gray-300">Precio</TableHead>
              <TableHead className="text-gray-300">Duración</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{plan.name}</p>
                    <p className="text-sm text-gray-400">
                      {plan.features.length} características
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-gray-300 max-w-xs truncate">
                    {plan.description || "Sin descripción"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">${plan.price}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{plan.duration} días</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={plan.isActive ? "bg-green-600" : "bg-red-600"}>
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPlan(plan)}
                      className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {plans?.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No hay planes disponibles</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="bg-gray-800 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Plan</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <PlanForm plan={editingPlan} onClose={() => setEditingPlan(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}