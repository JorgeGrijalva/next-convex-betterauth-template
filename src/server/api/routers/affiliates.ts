import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { emitWebhook } from "@/server/services/webhooks";

export const affiliatesRouter = createTRPCRouter({
  // Obtener estadísticas del afiliado actual
  getMyStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { whatsapp: true, referralCode: true },
      });

      if (!user) return null;

      // Contar referidos
      const [totalReferrals, totalConversions, totalCommissions, pendingCommissions] = await Promise.all([
        // Total de usuarios referidos
        ctx.db.user.count({
          where: { referredBy: user.whatsapp },
        }),
        
        // Referidos que han pagado al menos una vez
        ctx.db.user.count({
          where: {
            referredBy: user.whatsapp,
            payments: {
              some: { status: "APPROVED" },
            },
          },
        }),
        
        // Total de comisiones ganadas
        ctx.db.affiliateCommission.aggregate({
          where: { 
            affiliateId: userId,
            status: { in: ["PENDING", "PAID"] },
          },
          _sum: { amount: true },
          _count: true,
        }),
        
        // Comisiones pendientes de pago
        ctx.db.affiliateCommission.aggregate({
          where: { 
            affiliateId: userId,
            status: "PENDING",
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      return {
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXTAUTH_URL}/registro?ref=${user.referralCode}`,
        totalReferrals,
        totalConversions,
        totalCommissions: totalCommissions._sum.amount || 0,
        commissionCount: totalCommissions._count,
        pendingCommissions: pendingCommissions._sum.amount || 0,
        pendingCount: pendingCommissions._count,
        paidCommissions: (totalCommissions._sum.amount || 0) - (pendingCommissions._sum.amount || 0),
      };
    }),

  // Obtener historial detallado de comisiones
  getMyCommissions: protectedProcedure
    .input(z.object({
      status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = { affiliateId: ctx.session.user.id };
      
      if (input.status) {
        where.status = input.status;
      }

      return ctx.db.affiliateCommission.findMany({
        where,
        include: {
          referredUser: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Obtener mis referidos
  getMyReferrals: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { whatsapp: true },
      });

      if (!user) return [];

      return ctx.db.user.findMany({
        where: { referredBy: user.whatsapp },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          createdAt: true,
          subscriptions: {
            select: {
              status: true,
              plan: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          payments: {
            select: { status: true },
            where: { status: "APPROVED" },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Solicitar retiro de comisiones (si es monetario)
  requestWithdraw: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      clabe: z.string().min(18).max(18),
      bank: z.string().min(2),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar saldo disponible
      const pendingCommissions = await ctx.db.affiliateCommission.aggregate({
        where: {
          affiliateId: ctx.session.user.id,
          status: "PENDING",
        },
        _sum: { amount: true },
      });

      const availableAmount = pendingCommissions._sum.amount || 0;

      if (input.amount > availableAmount) {
        throw new Error(`Saldo insuficiente. Disponible: $${availableAmount}`);
      }

      const req = await ctx.db.withdrawalRequest.create({
        data: {
          affiliateId: ctx.session.user.id,
          amount: input.amount,
          clabe: input.clabe,
          bank: input.bank,
          status: "PENDING",
        },
      });

      await emitWebhook("affiliate.withdrawal_request", {
        affiliateId: ctx.session.user.id,
        amount: input.amount,
        clabe: input.clabe,
        bank: input.bank,
        requestId: req.id,
      });

      return {
        success: true,
        message: "Solicitud de retiro enviada. Será procesada en 1-2 días hábiles.",
        requestedAmount: input.amount,
        requestId: req.id,
      };
    }),

  // === FUNCIONES DE ADMINISTRACIÓN ===

  // Obtener todos los afiliados y sus estadísticas (admin)
  getAllAffiliates: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const affiliates = await ctx.db.user.findMany({
        where: {
          // Usuarios que tienen referidos
          referredUsers: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          email: true,
          referralCode: true,
          createdAt: true,
          _count: {
            select: {
              referredUsers: true,
              commissions: true,
            },
          },
        },
        take: input.limit,
        skip: input.offset,
        orderBy: { createdAt: 'desc' },
      });

      // Obtener estadísticas detalladas para cada afiliado
      const affiliatesWithStats = await Promise.all(
        affiliates.map(async (affiliate) => {
          const [conversions, totalEarnings, pendingEarnings] = await Promise.all([
            // Conversiones (referidos que pagaron)
            ctx.db.user.count({
              where: {
                referredBy: affiliate.whatsapp,
                payments: {
                  some: { status: "APPROVED" },
                },
              },
            }),
            
            // Total ganado
            ctx.db.affiliateCommission.aggregate({
              where: { affiliateId: affiliate.id },
              _sum: { amount: true },
            }),
            
            // Pendiente de pago
            ctx.db.affiliateCommission.aggregate({
              where: { 
                affiliateId: affiliate.id,
                status: "PENDING",
              },
              _sum: { amount: true },
            }),
          ]);

          return {
            ...affiliate,
            stats: {
              totalReferrals: affiliate._count.referredUsers,
              conversions,
              totalEarnings: totalEarnings._sum.amount || 0,
              pendingEarnings: pendingEarnings._sum.amount || 0,
              paidEarnings: (totalEarnings._sum.amount || 0) - (pendingEarnings._sum.amount || 0),
              conversionRate: affiliate._count.referredUsers > 0 
                ? (conversions / affiliate._count.referredUsers) * 100 
                : 0,
            },
          };
        })
      );

      return affiliatesWithStats;
    }),

  // Obtener configuración de afiliados (admin)
  getConfig: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.affiliateConfig.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  // Actualizar configuración de afiliados (super admin)
  updateConfig: adminProcedure
    .input(z.object({
      commissionType: z.enum(["FIXED_AMOUNT", "PERCENTAGE", "FREE_DAYS"]),
      fixedAmount: z.number().optional(),
      percentage: z.number().optional(),
      freeDays: z.number().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar que el usuario es SUPER_ADMIN
      if (ctx.session.user.role !== "SUPER_ADMIN") {
        throw new Error("Solo el super administrador puede modificar la configuración");
      }

      // Desactivar configuraciones anteriores
      await ctx.db.affiliateConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Crear nueva configuración
      return ctx.db.affiliateConfig.create({
        data: {
          ...input,
          updatedBy: ctx.session.user.id,
        },
      });
    }),

  // Pagar comisiones pendientes (admin)
  payCommissions: adminProcedure
    .input(z.object({
      affiliateId: z.string(),
      commissionIds: z.array(z.string()).optional(),
      notes: z.string().optional(),
      withdrawalRequestId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const where: any = {
        affiliateId: input.affiliateId,
        status: "PENDING",
      };

      if (input.commissionIds && input.commissionIds.length > 0) {
        where.id = { in: input.commissionIds };
      }

      const commissions = await ctx.db.affiliateCommission.findMany({ where });
      
      if (commissions.length === 0) {
        throw new Error("No hay comisiones pendientes para pagar");
      }

      // Marcar como pagadas
      const updated = await ctx.db.affiliateCommission.updateMany({
        where,
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      const totalPaid = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

      // Obtener info del afiliado para notificación
      const affiliate = await ctx.db.user.findUnique({
        where: { id: input.affiliateId },
      });

      if (affiliate) {
        if (input.withdrawalRequestId) {
          await ctx.db.withdrawalRequest.update({
            where: { id: input.withdrawalRequestId },
            data: { status: "PAID", paidAt: new Date() },
          });
        }

        await ctx.db.walletTransaction.create({
          data: {
            userId: affiliate.id,
            type: "WITHDRAWAL",
            amount: totalPaid,
            description: `Pago de ${updated.count} comisiones`,
          },
        });

        await emitWebhook("affiliate.commissions_paid", {
          affiliate: {
            name: affiliate.name,
            whatsapp: affiliate.whatsapp,
          },
          totalPaid,
          commissionCount: updated.count,
          notes: input.notes,
        });
      }

      return {
        paidCount: updated.count,
        totalPaid,
        message: `Se pagaron ${updated.count} comisiones por un total de $${totalPaid}`,
      };
    }),

  // Estadísticas generales de afiliados (admin)
  getGeneralStats: adminProcedure
    .query(async ({ ctx }) => {
      const [
        totalAffiliates,
        totalReferrals, 
        totalConversions,
        totalCommissionsPaid,
        totalCommissionsPending
      ] = await Promise.all([
        // Afiliados activos (que tienen referidos)
        ctx.db.user.count({
          where: {
            referredUsers: { some: {} },
          },
        }),
        
        // Total referidos
        ctx.db.user.count({
          where: {
            referredBy: { not: null },
          },
        }),
        
        // Total conversiones
        ctx.db.user.count({
          where: {
            referredBy: { not: null },
            payments: { some: { status: "APPROVED" } },
          },
        }),
        
        // Comisiones pagadas
        ctx.db.affiliateCommission.aggregate({
          where: { status: "PAID" },
          _sum: { amount: true },
          _count: true,
        }),
        
        // Comisiones pendientes
        ctx.db.affiliateCommission.aggregate({
          where: { status: "PENDING" },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      return {
        totalAffiliates,
        totalReferrals,
        totalConversions,
        conversionRate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0,
        totalCommissionsPaid: totalCommissionsPaid._sum.amount || 0,
        paidCommissionsCount: totalCommissionsPaid._count,
        totalCommissionsPending: totalCommissionsPending._sum.amount || 0,
        pendingCommissionsCount: totalCommissionsPending._count,
      };
    }),
});