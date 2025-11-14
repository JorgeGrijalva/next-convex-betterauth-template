import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";

export const announcementsRouter = createTRPCRouter({
  // Obtener anuncios para el feed del cliente (últimos 10)
  getFeed: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.announcementFeed.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          imageUrl: true,
          createdAt: true,
        },
      });
    }),

  // Obtener todos los anuncios (admin)
  getAll: adminProcedure
    .input(z.object({
      isPublished: z.boolean().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.isPublished !== undefined) {
        where.isPublished = input.isPublished;
      }

      return ctx.db.announcementFeed.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Crear nuevo anuncio (admin)
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1, "El título es requerido"),
      content: z.string().min(1, "El contenido es requerido"),
      imageUrl: z.string().url().optional(),
      isPublished: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.db.announcementFeed.create({
        data: {
          ...input,
          createdBy: ctx.session.user.id,
        },
      });

      // Si se publica inmediatamente, enviar notificación
      if (input.isPublished) {
        // Obtener usuarios activos para notificar
        const activeUsers = await ctx.db.user.findMany({
          where: {
            isActive: true,
            role: "CLIENT",
          },
          select: {
            whatsapp: true,
            name: true,
          },
        });

        // TODO: Enviar webhook a n8n para notificación masiva
        console.log("Webhook to n8n - Announcement Broadcast:", {
          event: "notification.broadcast",
          announcement: {
            title: input.title,
            content: input.content,
            imageUrl: input.imageUrl,
          },
          recipients: activeUsers.map(user => ({
            whatsapp: user.whatsapp,
            name: user.name,
          })),
        });
      }

      return announcement;
    }),

  // Actualizar anuncio (admin)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      imageUrl: z.string().url().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      return ctx.db.announcementFeed.update({
        where: { id },
        data,
      });
    }),

  // Cambiar estado de publicación (admin)
  togglePublished: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const announcement = await ctx.db.announcementFeed.findUnique({
        where: { id: input.id },
      });

      if (!announcement) {
        throw new Error("Anuncio no encontrado");
      }

      return ctx.db.announcementFeed.update({
        where: { id: input.id },
        data: { isPublished: !announcement.isPublished },
      });
    }),

  // Eliminar anuncio (admin)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.announcementFeed.delete({
        where: { id: input.id },
      });
    }),

  // Enviar notificación personalizada (admin)
  sendCustomNotification: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      recipients: z.enum(["ALL", "ACTIVE_SUBSCRIBERS", "EXPIRED_SUBSCRIBERS", "SPECIFIC"]),
      specificWhatsapps: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let users: { whatsapp: string; name: string }[] = [];

      switch (input.recipients) {
        case "ALL":
          users = await ctx.db.user.findMany({
            where: {
              isActive: true,
              role: "CLIENT",
            },
            select: { whatsapp: true, name: true },
          });
          break;

        case "ACTIVE_SUBSCRIBERS":
          users = await ctx.db.user.findMany({
            where: {
              isActive: true,
              role: "CLIENT",
              subscriptions: {
                some: { status: "ACTIVE" },
              },
            },
            select: { whatsapp: true, name: true },
          });
          break;

        case "EXPIRED_SUBSCRIBERS":
          users = await ctx.db.user.findMany({
            where: {
              isActive: true,
              role: "CLIENT", 
              subscriptions: {
                some: { status: "EXPIRED" },
              },
            },
            select: { whatsapp: true, name: true },
          });
          break;

        case "SPECIFIC":
          if (!input.specificWhatsapps || input.specificWhatsapps.length === 0) {
            throw new Error("Debe especificar al menos un WhatsApp");
          }
          users = await ctx.db.user.findMany({
            where: {
              whatsapp: { in: input.specificWhatsapps },
              isActive: true,
            },
            select: { whatsapp: true, name: true },
          });
          break;
      }

      if (users.length === 0) {
        throw new Error("No se encontraron usuarios para notificar");
      }

      // TODO: Enviar webhook a n8n
      console.log("Webhook to n8n - Custom Notification:", {
        event: "notification.custom",
        notification: {
          title: input.title,
          message: input.message,
        },
        recipients: users,
        recipientCount: users.length,
      });

      return {
        success: true,
        recipientCount: users.length,
        message: `Notificación enviada a ${users.length} usuarios`,
      };
    }),

  // Obtener estadísticas de anuncios (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [published, draft, total] = await Promise.all([
        ctx.db.announcementFeed.count({
          where: { isPublished: true },
        }),
        ctx.db.announcementFeed.count({
          where: { isPublished: false },
        }),
        ctx.db.announcementFeed.count(),
      ]);

      return {
        published,
        draft,
        total,
      };
    }),

  // Obtener anuncios activos (alias para getFeed)
  getActive: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.announcementFeed.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          content: true,
          imageUrl: true,
          createdAt: true,
        },
      });
    }),
});