"use client";

import { useState } from "react";
import { api } from "@/utils/api";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Edit, Calendar, User } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  
  const { data: announcements, isLoading } = api.announcements.getAll.useQuery({});
  const utils = api.useUtils();

  const createAnnouncement = api.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.getAll.invalidate();
      utils.announcements.getFeed.invalidate();
      setIsCreateOpen(false);
    },
  });

  const updateAnnouncement = api.announcements.update.useMutation({
    onSuccess: () => {
      utils.announcements.getAll.invalidate();
      utils.announcements.getFeed.invalidate();
      setEditingAnnouncement(null);
    },
  });

  const deleteAnnouncement = api.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.getAll.invalidate();
      utils.announcements.getFeed.invalidate();
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-600">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">Media</Badge>;
      case "low":
        return <Badge className="bg-blue-600">Baja</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const AnnouncementForm = ({ announcement = null, onClose }: { announcement?: any; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      title: announcement?.title || "",
      content: announcement?.content || "",
      imageUrl: announcement?.imageUrl || "",
      isPublished: announcement?.isPublished ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (announcement) {
        updateAnnouncement.mutate({
          id: announcement.id,
          ...formData,
        });
      } else {
        createAnnouncement.mutate(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="content" className="text-white">Contenido</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={4}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="imageUrl" className="text-white">URL de Imagen (opcional)</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="isPublished"
            checked={formData.isPublished}
            onChange={(checked) => setFormData({ ...formData, isPublished: checked })}
          />
          <Label htmlFor="isPublished" className="text-white">Publicar Anuncio</Label>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            {announcement ? "Actualizar" : "Crear"} Anuncio
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
            <Bell className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
            <p className="text-gray-400">Cargando anuncios...</p>
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
            <Bell className="w-8 h-8 text-purple-400" />
            Gestión de Anuncios
          </h1>
          <p className="text-gray-400">Administrar anuncios y notificaciones</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Anuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-600">
            <DialogHeader>
              <DialogTitle className="text-white">Crear Nuevo Anuncio</DialogTitle>
            </DialogHeader>
            <AnnouncementForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Título</TableHead>
              <TableHead className="text-gray-300">Contenido</TableHead>
              <TableHead className="text-gray-300">Prioridad</TableHead>
              <TableHead className="text-gray-300">Autor</TableHead>
              <TableHead className="text-gray-300">Fecha</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements?.map((announcement) => (
              <TableRow key={announcement.id} className="border-gray-700 hover:bg-gray-700/50">
                <TableCell>
                  <div>
                    <p className="font-medium text-white">{announcement.title}</p>
                    <p className="text-sm text-gray-400">ID: {announcement.id.slice(0, 8)}...</p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-gray-300 max-w-md truncate">
                    {announcement.content}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-600">General</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{announcement.createdBy}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={announcement.isPublished ? "bg-green-600" : "bg-red-600"}>
                    {announcement.isPublished ? "Publicado" : "Borrador"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAnnouncement(announcement)}
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
        
        {announcements?.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No hay anuncios disponibles</p>
          </div>
        )}
      </div>

      <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
        <DialogContent className="bg-gray-800 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Anuncio</DialogTitle>
          </DialogHeader>
          {editingAnnouncement && (
            <AnnouncementForm announcement={editingAnnouncement} onClose={() => setEditingAnnouncement(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}