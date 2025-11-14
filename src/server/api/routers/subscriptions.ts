import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = createTRPCRouter({
  // Obtener suscripción actual del usuario
  getMyCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.subscription.findFirst({
        where: { 
          userId: ctx.session.user.id,
          status: { in: ["ACTIVE", "PENDING"] },
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Obtener historial de suscripciones del usuario
  getMyHistory: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.subscription.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Obtener todas las suscripciones (admin)
  getAll: adminProcedure
    .input(z.object({
      status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
      userId: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.status) {
        where.status = input.status;
      }
      
      if (input.userId) {
        where.userId = input.userId;
      }

      return ctx.db.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              email: true,
            },
          },
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Obtener suscripciones que vencen pronto
  getExpiringSoon: adminProcedure
    .input(z.object({
      days: z.number().default(3), // Días antes del vencimiento
    }))
    .query(async ({ ctx, input }) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.days);

      return ctx.db.subscription.findMany({
        where: {
          status: "ACTIVE",
          endDate: {
            lte: futureDate,
            gte: new Date(), // No vencidas aún
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              email: true,
            },
          },
          plan: true,
        },
        orderBy: { endDate: 'asc' },
      });
    }),

  // Actualizar estado de suscripción manualmente (admin)
  updateStatus: adminProcedure
    .input(z.object({
      subscriptionId: z.string(),
      status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"]),
      endDate: z.string().optional(), // ISO string
      startDate: z.string().optional(), // ISO string
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
        include: { user: true, plan: true },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Suscripción no encontrada",
        });
      }

      const updateData: any = {
        status: input.status,
      };

      if (input.endDate) {
        updateData.endDate = new Date(input.endDate);
      }

      if (input.startDate) {
        updateData.startDate = new Date(input.startDate);
      }

      return ctx.db.subscription.update({
        where: { id: input.subscriptionId },
        data: updateData,
      });
    }),

  // Extender suscripción (admin) - agregar días
  extend: adminProcedure
    .input(z.object({
      subscriptionId: z.string(),
      additionalDays: z.number().positive(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { id: input.subscriptionId },
        include: { user: true, plan: true },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Suscripción no encontrada",
        });
      }

      // Calcular nueva fecha de vencimiento
      const currentEndDate = subscription.endDate || new Date();
      const newEndDate = new Date(currentEndDate.getTime() + (input.additionalDays * 24 * 60 * 60 * 1000));

      // Actualizar suscripción
      const updated = await ctx.db.subscription.update({
        where: { id: input.subscriptionId },
        data: {
          endDate: newEndDate,
          status: "ACTIVE", // Activar si estaba vencida
        },
      });

      // TODO: Enviar notificación al usuario
      console.log("Webhook to n8n - Subscription Extended:", {
        event: "subscription.extended",
        user: {
          name: subscription.user.name,
          whatsapp: subscription.user.whatsapp,
        },
        plan: subscription.plan.name,
        additionalDays: input.additionalDays,
        newEndDate: newEndDate.toISOString(),
        reason: input.reason,
      });

      return updated;
    }),

  // Cancelar suscripción (usuario o admin)
  cancel: protectedProcedure
    .input(z.object({
      subscriptionId: z.string().optional(), // Si es admin puede especificar ID
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let subscriptionId = input.subscriptionId;

      // Si no se proporciona ID, buscar la suscripción activa del usuario
      if (!subscriptionId) {
        const activeSubscription = await ctx.db.subscription.findFirst({
          where: {
            userId: ctx.session.user.id,
            status: { in: ["ACTIVE", "PENDING"] },
          },
        });

        if (!activeSubscription) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No tienes suscripciones activas para cancelar",
          });
        }

        subscriptionId = activeSubscription.id;
      } else {
        // Si se proporciona ID, verificar permisos
        const subscription = await ctx.db.subscription.findUnique({
          where: { id: subscriptionId },
        });

        if (!subscription) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Suscripción no encontrada",
          });
        }

        // Solo el dueño o admin puede cancelar
        const isOwner = subscription.userId === ctx.session.user.id;
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(ctx.session.user.role || "");

        if (!isOwner && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para cancelar esta suscripción",
          });
        }
      }

      return ctx.db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
        },
      });
    }),

  // Estadísticas de suscripciones (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [active, pending, expired, cancelled, expiringSoon] = await Promise.all([
        ctx.db.subscription.count({
          where: { status: "ACTIVE" },
        }),
        ctx.db.subscription.count({
          where: { status: "PENDING" },
        }),
        ctx.db.subscription.count({
          where: { status: "EXPIRED" },
        }),
        ctx.db.subscription.count({
          where: { status: "CANCELLED" },
        }),
        ctx.db.subscription.count({
          where: {
            status: "ACTIVE",
            endDate: {
              lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
              gte: new Date(),
            },
          },
        }),
      ]);

      return {
        active,
        pending,
        expired,
        cancelled,
        expiringSoon,
        total: active + pending + expired + cancelled,
      };
    }),

  // Proceso automático para marcar suscripciones vencidas
  processExpired: adminProcedure
    .mutation(async ({ ctx }) => {
      const now = new Date();
      
      const expiredSubscriptions = await ctx.db.subscription.updateMany({
        where: {
          status: "ACTIVE",
          endDate: {
            lt: now,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });

      return {
        expiredCount: expiredSubscriptions.count,
        processedAt: now,
      };
    }),
});