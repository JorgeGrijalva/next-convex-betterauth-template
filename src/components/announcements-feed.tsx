"use client";

import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Info } from "lucide-react";

export function AnnouncementsFeed() {
  const { data: announcements } = api.announcements.getActive.useQuery();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "medium":
        return <Info className="w-4 h-4 text-yellow-400" />;
      case "low":
        return <Bell className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-600">Importante</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600">Aviso</Badge>;
      case "low":
        return <Badge className="bg-blue-600">Información</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Anuncios
      </h2>
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(announcement.priority)}
                  <CardTitle className="text-white text-base">
                    {announcement.title}
                  </CardTitle>
                </div>
                {getPriorityBadge(announcement.priority)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300">{announcement.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                Por {announcement.author.name} - {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}