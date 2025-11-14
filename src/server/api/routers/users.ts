import { z } from "zod";
import bcrypt from "bcryptjs";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  // Obtener todos los usuarios (admin)
  getAll: adminProcedure
    .input(z.object({
      role: z.enum(["CLIENT", "VERIFIER", "ADMIN", "SUPER_ADMIN"]).optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(), // Buscar por nombre, WhatsApp o email
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};
      
      if (input.role) {
        where.role = input.role;
      }
      
      if (input.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { whatsapp: { contains: input.search } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      return ctx.db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          whatsapp: true,
          email: true,
          role: true,
          isActive: true,
          referralCode: true,
          referredBy: true,
          createdAt: true,
          _count: {
            select: {
              subscriptions: true,
              payments: { where: { status: "APPROVED" } },
              referredUsers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Obtener usuario específico con detalles (admin)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          },
          payments: {
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          },
          referredUsers: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              createdAt: true,
            },
          },
          commissions: {
            include: {
              referredUser: {
                select: { name: true, whatsapp: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND", 
          message: "Usuario no encontrado",
        });
      }

      // No devolver la contraseña
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  // Crear nuevo usuario (admin) 
  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      whatsapp: z.string().min(10),
      email: z.string().email().optional(),
      password: z.string().min(6),
      role: z.enum(["CLIENT", "VERIFIER", "ADMIN"]).default("CLIENT"),
      referredBy: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar permisos - solo SUPER_ADMIN puede crear ADMIN
      if (input.role === "ADMIN" && ctx.session.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo el super administrador puede crear administradores",
        });
      }

      // Verificar que WhatsApp no existe
      const existingWhatsapp = await ctx.db.user.findUnique({
        where: { whatsapp: input.whatsapp },
      });

      if (existingWhatsapp) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este número de WhatsApp ya está registrado",
        });
      }

      // Verificar email si se proporciona
      if (input.email) {
        const existingEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email ya está registrado",
          });
        }
      }

      // Hash de contraseña
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Generar código de referido
      const referralCode = `${input.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6)}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Crear usuario
      return ctx.db.user.create({
        data: {
          name: input.name,
          whatsapp: input.whatsapp,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          referredBy: input.referredBy,
          referralCode,
        },
        select: {
          id: true,
          name: true,
          whatsapp: true,
          email: true,
          role: true,
          referralCode: true,
        },
      });
    }),

  // Actualizar usuario (admin)
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      role: z.enum(["CLIENT", "VERIFIER", "ADMIN"]).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verificar permisos para cambio de rol
      if (data.role === "ADMIN" && ctx.session.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo el super administrador puede asignar rol de administrador",
        });
      }

      // No permitir auto-desactivación
      if (data.isActive === false && id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No puedes desactivar tu propia cuenta",
        });
      }

      // Verificar email único si se cambia
      if (data.email) {
        const existingEmail = await ctx.db.user.findFirst({
          where: {
            email: data.email,
            id: { not: id },
          },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este email ya está registrado",
          });
        }
      }

      return ctx.db.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          whatsapp: true,
          email: true,
          role: true,
          isActive: true,
        },
      });
    }),

  // Cambiar contraseña de usuario (admin)
  changePassword: adminProcedure
    .input(z.object({
      userId: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      });

      return { success: true, message: "Contraseña actualizada" };
    }),

  // Activar/desactivar usuario (admin)
  toggleActive: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // No permitir auto-desactivación
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No puedes desactivar tu propia cuenta",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { isActive: !user.isActive },
      });
    }),

  // Obtener estadísticas de usuarios (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [clients, admins, verifiers, activeUsers, newUsersThisMonth] = await Promise.all([
        ctx.db.user.count({ where: { role: "CLIENT" } }),
        ctx.db.user.count({ where: { role: "ADMIN" } }),
        ctx.db.user.count({ where: { role: "VERIFIER" } }),
        ctx.db.user.count({ where: { isActive: true } }),
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      return {
        clients,
        admins,
        verifiers,
        total: clients + admins + verifiers,
        activeUsers,
        newUsersThisMonth,
      };
    }),

  // Dashboard del usuario actual
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      // Obtener suscripción activa
      const activeSubscription = await ctx.db.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "PENDING"] },
        },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });

      // Obtener últimos pagos
      const recentPayments = await ctx.db.payment.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Estadísticas de afiliados (si aplica)
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { whatsapp: true },
      });

      let affiliateStats = null;
      if (user) {
        const [referralCount, conversionCount] = await Promise.all([
          ctx.db.user.count({
            where: { referredBy: user.whatsapp },
          }),
          ctx.db.user.count({
            where: {
              referredBy: user.whatsapp,
              payments: { some: { status: "APPROVED" } },
            },
          }),
        ]);

        affiliateStats = {
          totalReferrals: referralCount,
          conversions: conversionCount,
        };
      }

      return {
        subscription: activeSubscription,
        recentPayments,
        affiliateStats,
      };
    }),
});