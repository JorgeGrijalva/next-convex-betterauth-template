"use client";

import { api } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export function AnnouncementsFeed() {
  const { data: announcements } = api.announcements.getFeed.useQuery();

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
              <CardTitle className="text-white text-base">
                {announcement.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300">{announcement.content}</p>
              {announcement.imageUrl && (
                <img 
                  src={announcement.imageUrl} 
                  alt={announcement.title}
                  className="w-full mt-3 rounded-md max-h-48 object-cover"
                />
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}