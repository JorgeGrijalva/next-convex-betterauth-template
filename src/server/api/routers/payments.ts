// @ts-nocheck
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { emitWebhook } from "@/server/services/webhooks";

export const paymentsRouter = createTRPCRouter({
  // Crear nuevo pago público (flujo checkout para usuarios no autenticados)
  publicCreate: publicProcedure
    .input(z.object({
      planId: z.string(),
      amount: z.number().positive(),
      name: z.string().min(1),
      email: z.string().email().optional(),
      whatsapp: z.string().optional(),
      reference: z.string().optional(),
      receiptImage: z.string().optional(),
      paymentMethod: z.string().optional(),
      paidAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.db.plan.findUnique({ where: { id: input.planId } });
      if (!plan || !plan.isActive) throw new TRPCError({ code: "NOT_FOUND", message: "Plan no encontrado o inactivo" });
      if (input.amount !== plan.price) throw new TRPCError({ code: "BAD_REQUEST", message: "El monto no coincide con el precio del plan" });

      let user = null as any;
      if (input.email) user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!user && input.whatsapp) user = await ctx.db.user.findUnique({ where: { whatsapp: input.whatsapp } });

      if (!user) {
        const randomPassword = Math.random().toString(36).substring(2, 12);
        const hashed = await bcrypt.hash(randomPassword, 12);
        const referralCode = `U${Math.random().toString(36).substring(2,8).toUpperCase()}`;
        const tempWhatsapp = `temp_${Date.now()}_${Math.random().toString(36).substring(2,6)}`;
        user = await ctx.db.user.create({
          data: { name: input.name, email: input.email, whatsapp: tempWhatsapp, password: hashed, referralCode, isActive: false },
        });
      }

      const payment = await ctx.db.payment.create({
        data: {
          userId: user.id,
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

      const existingSubscription = await ctx.db.subscription.findFirst({ where: { userId: user.id, planId: input.planId } });
      if (existingSubscription) {
        await ctx.db.subscription.update({ where: { id: existingSubscription.id }, data: { status: "PENDING" } });
      } else {
        await ctx.db.subscription.create({ data: { userId: user.id, planId: input.planId, status: "PENDING" } });
      }

      return { payment, userId: user.id };
    }),

  // Crear nuevo pago (cliente sube comprobante)
  create: protectedProcedure
    .input(z.object({
      planId: z.string(),
      amount: z.number().positive(),
      reference: z.string().optional(),
      receiptImage: z.string().optional(),
      paymentMethod: z.string().optional(),
      paidAt: z.string().optional(),
      walletUseAmount: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.db.plan.findUnique({ where: { id: input.planId } });
      if (!plan || !plan.isActive) throw new TRPCError({ code: "NOT_FOUND", message: "Plan no encontrado o inactivo" });

      const walletUse = input.walletUseAmount || 0;
      if (walletUse < 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Monto de monedero inválido" });
      if (walletUse > 0) {
        const pendingAgg = await ctx.db.affiliateCommission.aggregate({ where: { affiliateId: ctx.session.user.id, status: "PENDING" }, _sum: { amount: true } });
        const available = pendingAgg._sum.amount || 0;
        if (walletUse > available) throw new TRPCError({ code: "BAD_REQUEST", message: "Saldo de monedero insuficiente" });
      }
      if (input.amount + walletUse !== plan.price) throw new TRPCError({ code: "BAD_REQUEST", message: "Total a pagar no coincide con el precio del plan" });

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

      const existingSubscription = await ctx.db.subscription.findFirst({ where: { userId: ctx.session.user.id, planId: input.planId } });
      if (existingSubscription) {
        await ctx.db.subscription.update({ where: { id: existingSubscription.id }, data: { status: "PENDING" } });
      } else {
        await ctx.db.subscription.create({ data: { userId: ctx.session.user.id, planId: input.planId, status: "PENDING" } });
      }

      return payment;
    }),

  // Obtener pagos del usuario autenticado
  getMyPayments: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.payment.findMany({ where: { userId: ctx.session.user.id }, include: { plan: true }, orderBy: { createdAt: "desc" } });
  }),

  // Obtener todos los pagos (admin)
  getAll: adminProcedure
    .input(z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(), userId: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.userId) where.userId = input.userId;
      return ctx.db.payment.findMany({
        where,
        include: { user: { select: { id: true, name: true, whatsapp: true, email: true } }, plan: true },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Obtener pagos pendientes de revisión (admin/verifier)
  getPendingReview: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.payment.findMany({ where: { status: "PENDING" }, include: { user: { select: { id: true, name: true, whatsapp: true, email: true, referredBy: true } }, plan: true }, orderBy: { createdAt: "asc" } });
  }),

  // Aprobar pago (admin/verifier)
  approve: adminProcedure
    .input(z.object({ paymentId: z.string(), reviewNotes: z.string().optional(), iptvUsername: z.string().optional(), iptvPassword: z.string().optional(), serverUrl: z.string().url().optional(), endDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({ where: { id: input.paymentId }, include: { user: true, plan: true } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Pago no encontrado" });
      if (payment.status !== "PENDING") throw new TRPCError({ code: "BAD_REQUEST", message: "Este pago ya fue revisado" });

      const updatedPayment = await ctx.db.payment.update({ where: { id: input.paymentId }, data: { status: "APPROVED", reviewedBy: ctx.session.user.id, reviewedAt: new Date(), reviewNotes: input.reviewNotes } });

      const startDate = new Date();
      const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + (payment.plan.duration * 24 * 60 * 60 * 1000));

      const existingSubscription = await ctx.db.subscription.findFirst({ where: { userId: payment.userId, planId: payment.planId } });
      if (existingSubscription) {
        await ctx.db.subscription.update({ where: { id: existingSubscription.id }, data: { status: "ACTIVE", startDate, endDate } });
      } else {
        await ctx.db.subscription.create({ data: { userId: payment.userId, planId: payment.planId, status: "ACTIVE", startDate, endDate } });
      }

      const existingIptvAccount = await ctx.db.iptvAccount.findUnique({ where: { userId: payment.userId } });
      if (!existingIptvAccount) {
        const username = input.iptvUsername || `iptv_${payment.user.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`;
        const password = input.iptvPassword || (Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 4).toUpperCase());
        await ctx.db.iptvAccount.create({ data: { userId: payment.userId, username, password, serverUrl: input.serverUrl || "http://servidor.xyz/c/", port: "8080", maxConnections: 2, profileName: payment.user.name, notes: `Cuenta creada al aprobar pago del plan ${payment.plan.name}` } });
        await emitWebhook("iptv.account_created", { user: { name: payment.user.name, whatsapp: payment.user.whatsapp }, credentials: { username, password, serverUrl: input.serverUrl || "http://servidor.xyz/c/", port: "8080" }, subscription: { plan: payment.plan.name, endDate: endDate.toISOString() } });
      } else if (!existingIptvAccount.isActive) {
        await ctx.db.iptvAccount.update({ where: { id: existingIptvAccount.id }, data: { isActive: true } });
      }

      if (payment.user.referredBy) {
        const previousPayments = await ctx.db.payment.count({ where: { userId: payment.userId, status: "APPROVED", id: { not: payment.id } } });
        if (previousPayments === 0) {
          const affiliate = await ctx.db.user.findUnique({ where: { whatsapp: payment.user.referredBy } });
          if (affiliate) {
            const config = await ctx.db.affiliateConfig.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
            if (config) {
              let commissionData: any = { affiliateId: affiliate.id, referredUserId: payment.userId, commissionType: config.commissionType, triggerPaymentId: payment.id, status: "PENDING" };
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
              await ctx.db.affiliateCommission.create({ data: commissionData });
              await emitWebhook("affiliate.commission", { affiliate_user: { name: affiliate.name, whatsapp: affiliate.whatsapp }, new_customer_name: payment.user.name, commission_amount: config.commissionType === "FREE_DAYS" ? `${config.freeDays} Días Gratis` : `${commissionData.amount} ${payment.currency}` });
            }
          }
        }
      }

      await emitWebhook("payment.approved", { user: { name: payment.user.name, whatsapp: payment.user.whatsapp }, plan: { name: payment.plan.name, duration: payment.plan.duration }, amount: `${payment.amount} ${payment.currency}`, endDate: endDate.toISOString() });
      return updatedPayment;
    }),

  // Obtener pagos de un usuario específico (admin)
  getUserPayments: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.payment.findMany({ where: { userId: input.userId }, include: { plan: true, user: true }, orderBy: { createdAt: "desc" } });
    }),

  // Rechazar pago (admin/verifier)
  reject: adminProcedure
    .input(z.object({ paymentId: z.string(), reviewNotes: z.string().min(1, "Debe proporcionar una razón para el rechazo") }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({ where: { id: input.paymentId }, include: { user: true, plan: true } });
      if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Pago no encontrado" });
      if (payment.status !== "PENDING") throw new TRPCError({ code: "BAD_REQUEST", message: "Este pago ya fue revisado" });
      const updatedPayment = await ctx.db.payment.update({ where: { id: input.paymentId }, data: { status: "REJECTED", reviewedBy: ctx.session.user.id, reviewedAt: new Date(), reviewNotes: input.reviewNotes } });
      await emitWebhook("payment.rejected", { user: { name: payment.user.name, whatsapp: payment.user.whatsapp }, plan: { name: payment.plan.name }, amount: `${payment.amount} ${payment.currency}`, reason: input.reviewNotes });
      return updatedPayment;
    }),

  // Estadísticas de pagos (admin) con rango opcional
  getStats: adminProcedure
    .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = new Date(input.startDate);
        if (input.endDate) where.createdAt.lte = new Date(input.endDate);
      }
      const [pending, approved, rejected, totalRevenue] = await Promise.all([
        ctx.db.payment.count({ where: { ...where, status: "PENDING" } }),
        ctx.db.payment.count({ where: { ...where, status: "APPROVED" } }),
        ctx.db.payment.count({ where: { ...where, status: "REJECTED" } }),
        ctx.db.payment.aggregate({ where: { ...where, status: "APPROVED" }, _sum: { amount: true } }),
      ]);
      return { pending, approved, rejected, total: pending + approved + rejected, totalRevenue: totalRevenue._sum.amount || 0 };
    }),

  // Actualizar estado de pago (admin)
  updateStatus: adminProcedure
    .input(z.object({ paymentId: z.string(), status: z.enum(["PENDING", "APPROVED", "REJECTED"]), notes: z.string().optional(), rejectionReason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({ where: { id: input.paymentId }, include: { user: true, plan: true } });
      if (!payment) throw new Error("Pago no encontrado");

      if (payment.walletUseAmount > 0) {
        let remaining = payment.walletUseAmount;
        const pending = await ctx.db.affiliateCommission.findMany({ where: { affiliateId: payment.userId, status: "PENDING" }, orderBy: { createdAt: "asc" } });
        for (const c of pending) {
          const amt = c.amount || 0;
          if (amt <= 0) continue;
          if (remaining <= 0) break;
          const toPay = Math.min(amt, remaining);
          await ctx.db.affiliateCommission.update({ where: { id: c.id }, data: { status: "PAID", paidAt: new Date() } });
          remaining -= toPay;
        }
        await ctx.db.walletTransaction.create({ data: { userId: payment.userId, type: "PURCHASE", amount: payment.walletUseAmount, description: `Uso de monedero para plan ${payment.plan.name}` } });
      }

      const updatedPayment = await ctx.db.payment.update({ where: { id: input.paymentId }, data: { status: input.status, notes: input.notes, rejectionReason: input.rejectionReason, reviewedAt: new Date(), reviewedBy: ctx.session.user.id } });

      if (input.status === "APPROVED") {
        const existingSubscription = await ctx.db.subscription.findFirst({ where: { userId: payment.userId, status: { in: ["ACTIVE", "PENDING"] } } });
        if (existingSubscription) {
          await ctx.db.subscription.update({ where: { id: existingSubscription.id }, data: { expiresAt: new Date(existingSubscription.expiresAt.getTime() + payment.plan.durationDays * 24 * 60 * 60 * 1000), updatedAt: new Date() } });
        } else {
          await ctx.db.subscription.create({ data: { userId: payment.userId, planId: payment.planId, status: "ACTIVE", startsAt: new Date(), expiresAt: new Date(Date.now() + payment.plan.durationDays * 24 * 60 * 60 * 1000), createdAt: new Date(), updatedAt: new Date() } });
        }

        const existingAccount = await ctx.db.iptvAccount.findFirst({ where: { userId: payment.userId } });
        if (!existingAccount) {
          await ctx.db.iptvAccount.create({ data: { userId: payment.userId, username: `user_${payment.userId.slice(0, 8)}`, password: Math.random().toString(36).slice(-8), serverUrl: "http://iptv.flu-tv.com:8080", status: "ACTIVE", createdAt: new Date(), updatedAt: new Date() } });
        }

        if (payment.user.referredBy) {
          const affiliateConfig = await ctx.db.affiliateConfig.findFirst({ where: { isActive: true } });
          if (affiliateConfig) {
            let commissionAmount = 0;
            let commissionDays = 0;
            if (affiliateConfig.commissionType === "PERCENTAGE") commissionAmount = (payment.amount * affiliateConfig.percentage) / 100;
            else if (affiliateConfig.commissionType === "FIXED") commissionAmount = affiliateConfig.fixedAmount;
            else if (affiliateConfig.commissionType === "FREE_DAYS") commissionDays = affiliateConfig.freeDays;
            if (commissionAmount > 0 || commissionDays > 0) {
              await ctx.db.affiliateCommission.create({ data: { affiliateId: payment.user.referredBy, referredUserId: payment.userId, paymentId: payment.id, amount: commissionAmount || null, days: commissionDays || null, status: "PENDING", createdAt: new Date() } });
            }
          }
        }
      }

      return updatedPayment;
    }),
});