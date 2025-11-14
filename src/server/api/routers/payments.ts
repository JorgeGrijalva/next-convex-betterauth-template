import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const paymentsRouter = createTRPCRouter({
  // Crear nuevo pago (cliente sube comprobante)
  create: protectedProcedure
    .input(z.object({
      planId: z.string(),
      amount: z.number().positive(),
      reference: z.string().optional(),
      receiptImage: z.string().optional(), // URL de la imagen
      paymentMethod: z.string().optional(),
      paidAt: z.string().optional(), // ISO string de fecha
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar que el plan existe y está activo
      const plan = await ctx.db.plan.findUnique({
        where: { id: input.planId },
      });

      if (!plan || !plan.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plan no encontrado o inactivo",
        });
      }

      // Verificar que el monto coincide con el precio del plan
      if (input.amount !== plan.price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El monto no coincide con el precio del plan",
        });
      }

      // Crear el pago
      const payment = await ctx.db.payment.create({
        data: {
          userId: ctx.session.user.id,
          planId: input.planId,
          amount: input.amount,
          currency: plan.currency,
          reference: input.reference,
          receiptImage: input.receiptImage,
          paymentMethod: input.paymentMethod,
          paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
          status: "PENDING",
        },
      });

      // Buscar suscripción existente o crear nueva
      const existingSubscription = await ctx.db.subscription.findFirst({
        where: {
          userId: ctx.session.user.id,
          planId: input.planId,
        },
      });

      if (existingSubscription) {
        await ctx.db.subscription.update({
          where: { id: existingSubscription.id },
          data: { status: "PENDING" },
        });
      } else {
        await ctx.db.subscription.create({
          data: {
            userId: ctx.session.user.id,
            planId: input.planId,
            status: "PENDING",
          },
        });
      }

      return payment;
    }),

  // Obtener pagos del usuario autenticado
  getMyPayments: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.payment.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Obtener todos los pagos (admin)
  getAll: adminProcedure
    .input(z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
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

      return ctx.db.payment.findMany({
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

  // Obtener pagos pendientes de revisión (admin/verifier)
  getPendingReview: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.payment.findMany({
        where: { status: "PENDING" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              email: true,
              referredBy: true,
            },
          },
          plan: true,
        },
        orderBy: { createdAt: 'asc' }, // Los más antiguos primero
      });
    }),

  // Aprobar pago (admin/verifier)
  approve: adminProcedure
    .input(z.object({
      paymentId: z.string(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          user: true,
          plan: true,
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pago no encontrado",
        });
      }

      if (payment.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este pago ya fue revisado",
        });
      }

      // Actualizar pago
      const updatedPayment = await ctx.db.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "APPROVED",
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.reviewNotes,
        },
      });

      // Activar suscripción
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (payment.plan.duration * 24 * 60 * 60 * 1000));

      // Buscar suscripción existente o crear nueva
      const existingSubscription = await ctx.db.subscription.findFirst({
        where: {
          userId: payment.userId,
          planId: payment.planId,
        },
      });

      if (existingSubscription) {
        await ctx.db.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });
      } else {
        await ctx.db.subscription.create({
          data: {
            userId: payment.userId,
            planId: payment.planId,
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });
      }

      // Verificar si es un usuario referido y generar comisión
      if (payment.user.referredBy) {
        // Verificar si es su primer pago aprobado
        const previousPayments = await ctx.db.payment.count({
          where: {
            userId: payment.userId,
            status: "APPROVED",
            id: { not: payment.id },
          },
        });

        if (previousPayments === 0) {
          // Es su primer pago - generar comisión
          const affiliate = await ctx.db.user.findUnique({
            where: { whatsapp: payment.user.referredBy },
          });

          if (affiliate) {
            // Obtener configuración de afiliados
            const config = await ctx.db.affiliateConfig.findFirst({
              where: { isActive: true },
              orderBy: { updatedAt: 'desc' },
            });

            if (config) {
              let commissionData: any = {
                affiliateId: affiliate.id,
                referredUserId: payment.userId,
                commissionType: config.commissionType,
                triggerPaymentId: payment.id,
                status: "PENDING",
              };

              // Calcular comisión según tipo
              switch (config.commissionType) {
                case "FIXED_AMOUNT":
                  commissionData.amount = config.fixedAmount;
                  break;
                case "PERCENTAGE":
                  commissionData.amount = payment.amount * (config.percentage! / 100);
                  commissionData.percentage = config.percentage;
                  break;
                case "FREE_DAYS":
                  commissionData.days = config.freeDays;
                  break;
              }

              await ctx.db.affiliateCommission.create({
                data: commissionData,
              });

              // TODO: Enviar webhook a n8n
              console.log("Webhook to n8n - Affiliate Commission:", {
                event: "affiliate.commission",
                affiliate_user: {
                  name: affiliate.name,
                  whatsapp: affiliate.whatsapp,
                },
                new_customer_name: payment.user.name,
                commission_amount: config.commissionType === "FREE_DAYS" 
                  ? `${config.freeDays} Días Gratis`
                  : `${commissionData.amount} ${payment.currency}`,
              });
            }
          }
        }
      }

      // TODO: Enviar webhook a n8n
      console.log("Webhook to n8n - Payment Approved:", {
        event: "payment.approved",
        user: {
          name: payment.user.name,
          whatsapp: payment.user.whatsapp,
        },
        plan: {
          name: payment.plan.name,
          duration: payment.plan.duration,
        },
        amount: `${payment.amount} ${payment.currency}`,
        endDate: endDate.toISOString(),
      });

      return updatedPayment;
    }),

  // Rechazar pago (admin/verifier)
  reject: adminProcedure
    .input(z.object({
      paymentId: z.string(),
      reviewNotes: z.string().min(1, "Debe proporcionar una razón para el rechazo"),
    }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          user: true,
          plan: true,
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pago no encontrado",
        });
      }

      if (payment.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este pago ya fue revisado",
        });
      }

      // Actualizar pago
      const updatedPayment = await ctx.db.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "REJECTED",
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          reviewNotes: input.reviewNotes,
        },
      });

      // TODO: Enviar webhook a n8n
      console.log("Webhook to n8n - Payment Rejected:", {
        event: "payment.rejected",
        user: {
          name: payment.user.name,
          whatsapp: payment.user.whatsapp,
        },
        plan: {
          name: payment.plan.name,
        },
        amount: `${payment.amount} ${payment.currency}`,
        reason: input.reviewNotes,
      });

      return updatedPayment;
    }),

  // Estadísticas de pagos (admin)
  getStats: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = new Date(input.startDate);
        if (input.endDate) where.createdAt.lte = new Date(input.endDate);
      }

      const [pending, approved, rejected, totalRevenue] = await Promise.all([
        ctx.db.payment.count({
          where: { ...where, status: "PENDING" },
        }),
        ctx.db.payment.count({
          where: { ...where, status: "APPROVED" },
        }),
        ctx.db.payment.count({
          where: { ...where, status: "REJECTED" },
        }),
        ctx.db.payment.aggregate({
          where: { ...where, status: "APPROVED" },
          _sum: { amount: true },
        }),
      ]);

      return {
        pending,
        approved,
        rejected,
        total: pending + approved + rejected,
        totalRevenue: totalRevenue._sum.amount || 0,
      };
    }),
});