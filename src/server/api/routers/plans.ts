import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "@/server/api/trpc";

export const plansRouter = createTRPCRouter({
  // Obtener todos los planes activos (público)
  getActivePlans: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      });
    }),

  // Obtener todos los planes (admin)
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.plan.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Obtener un plan específico
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.plan.findUnique({
        where: { id: input.id },
      });
    }),

  // Crear nuevo plan (admin)
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1, "El nombre es requerido"),
      description: z.string().optional(),
      price: z.number().positive("El precio debe ser positivo"),
      currency: z.string().default("MXN"),
      duration: z.number().positive("La duración debe ser positiva"),
      features: z.string().optional(), // JSON string
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.plan.create({
        data: input,
      });
    }),

  // Actualizar plan (admin)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      currency: z.string().optional(),
      duration: z.number().positive().optional(),
      features: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.plan.update({
        where: { id },
        data,
      });
    }),

  // Desactivar/activar plan (admin)
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.db.plan.findUnique({
        where: { id: input.id },
      });

      if (!plan) {
        throw new Error("Plan no encontrado");
      }

      return ctx.db.plan.update({
        where: { id: input.id },
        data: { isActive: !plan.isActive },
      });
    }),

  // Eliminar plan (admin) - Solo si no tiene suscripciones activas
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar si tiene suscripciones activas
      const activeSubscriptions = await ctx.db.subscription.count({
        where: {
          planId: input.id,
          status: "ACTIVE",
        },
      });

      if (activeSubscriptions > 0) {
        throw new Error("No se puede eliminar un plan con suscripciones activas");
      }

      return ctx.db.plan.delete({
        where: { id: input.id },
      });
    }),

  // Estadísticas de planes (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const plans = await ctx.db.plan.findMany({
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
          _count: {
            select: {
              subscriptions: true,
              payments: {
                where: { status: "APPROVED" },
              },
            },
          },
        },
      });

      return plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        activeSubscriptions: plan.subscriptions.length,
        totalSubscriptions: plan._count.subscriptions,
        totalRevenue: plan._count.payments * plan.price,
        isActive: plan.isActive,
      }));
    }),
});