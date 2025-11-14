"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Megaphone
} from "lucide-react";
import Link from "next/link";

export default function AnnouncementsManagement() {
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [customNotification, setCustomNotification] = useState({
    title: "",
    message: "",
    recipients: "ALL" as "ALL" | "ACTIVE_SUBSCRIBERS" | "EXPIRED_SUBSCRIBERS",
  });

  // Queries
  const { data: announcements, refetch } = api.announcements.getAll.useQuery({
    limit: 50,
  });

  // Mutations
  const createAnnouncement = api.announcements.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewAnnouncement({ title: "", content: "", imageUrl: "" });
    },
  });

  const togglePublished = api.announcements.togglePublished.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteAnnouncement = api.announcements.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const sendNotification = api.announcements.sendCustomNotification.useMutation({
    onSuccess: () => {
      setCustomNotification({ title: "", message: "", recipients: "ALL" });
      alert("Notificación enviada exitosamente");
    },
  });

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Título y contenido son requeridos");
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        imageUrl: newAnnouncement.imageUrl || undefined,
        isPublished: true,
      });
      alert("Anuncio creado y publicado exitosamente");
    } catch (error) {
      alert("Error al crear el anuncio");
    }
  };

  const handleTogglePublished = async (id: string) => {
    try {
      await togglePublished.mutateAsync({ id });
    } catch (error) {
      alert("Error al cambiar el estado del anuncio");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este anuncio?")) return;

    try {
      await deleteAnnouncement.mutateAsync({ id });
      alert("Anuncio eliminado exitosamente");
    } catch (error) {
      alert("Error al eliminar el anuncio");
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNotification.title || !customNotification.message) {
      alert("Título y mensaje son requeridos");
      return;
    }

    if (!confirm(`¿Enviar notificación a ${customNotification.recipients === "ALL" ? "todos los usuarios" : customNotification.recipients === "ACTIVE_SUBSCRIBERS" ? "suscriptores activos" : "suscriptores vencidos"}?`)) {
      return;
    }

    try {
      await sendNotification.mutateAsync({
        title: customNotification.title,
        message: customNotification.message,
        recipients: customNotification.recipients,
      });
    } catch (error) {
      alert("Error al enviar la notificación");
    }
  };

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Panel Admin
            </Link>
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Anuncios y Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona el feed de anuncios y envía notificaciones a los usuarios
          </p>
        </div>

        <Tabs defaultValue="announcements" className="space-y-6">
          <TabsList>
            <TabsTrigger value="announcements">Anuncios</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            {/* Create New Announcement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Crear Nuevo Anuncio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título del anuncio"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Contenido *</Label>
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Contenido del anuncio..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL de Imagen (opcional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={newAnnouncement.imageUrl}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <Button type="submit" disabled={createAnnouncement.isPending}>
                    {createAnnouncement.isPending ? "Creando..." : "Crear y Publicar"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Announcements List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Anuncios Existentes</h3>
              
              {announcements && announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{announcement.title}</h4>
                              <Badge variant={announcement.isPublished ? "default" : "secondary"}>
                                {announcement.isPublished ? "Publicado" : "Borrador"}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {announcement.content}
                            </p>

                            <div className="text-xs text-muted-foreground">
                              Creado: {new Date(announcement.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublished(announcement.id)}
                              disabled={togglePublished.isPending}
                            >
                              {announcement.isPublished ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Publicar
                                </>
                              )}
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              disabled={deleteAnnouncement.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay anuncios creados aún
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Enviar Notificación Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <Label htmlFor="notificationTitle">Título *</Label>
                    <Input
                      id="notificationTitle"
                      value={customNotification.title}
                      onChange={(e) => setCustomNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título de la notificación"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notificationMessage">Mensaje *</Label>
                    <Textarea
                      id="notificationMessage"
                      value={customNotification.message}
                      onChange={(e) => setCustomNotification(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Mensaje de la notificación..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipients">Destinatarios</Label>
                    <select
                      id="recipients"
                      value={customNotification.recipients}
                      onChange={(e) => setCustomNotification(prev => ({ ...prev, recipients: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="ALL">Todos los usuarios</option>
                      <option value="ACTIVE_SUBSCRIBERS">Solo suscriptores activos</option>
                      <option value="EXPIRED_SUBSCRIBERS">Solo suscriptores vencidos</option>
                    </select>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Vista Previa</h4>
                    <div className="border bg-background p-3 rounded">
                      <div className="font-medium text-sm">{customNotification.title || "Título"}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {customNotification.message || "Mensaje de la notificación"}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={sendNotification.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {sendNotification.isPending ? "Enviando..." : "Enviar Notificación"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Información Importante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Notificaciones automáticas:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Se envían automáticamente cuando se aprueba o rechaza un pago</li>
                    <li>• Se envían recordatorios 3 días antes del vencimiento</li>
                    <li>• Se notifica cuando se genera una comisión de afiliado</li>
                  </ul>
                </div>
                
                <div className="text-sm">
                  <strong>Notificaciones personalizadas:</strong>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>• Útiles para mantenimientos programados</li>
                    <li>• Anuncios de nuevos servicios o promociones</li>
                    <li>• Comunicados importantes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}