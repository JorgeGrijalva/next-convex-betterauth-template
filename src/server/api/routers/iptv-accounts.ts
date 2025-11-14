import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Función para generar username único
function generateIptvUsername(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `iptv_${cleanName.substring(0, 8)}_${randomSuffix}`;
}

// Función para generar contraseña segura
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const iptvAccountsRouter = createTRPCRouter({
  // Obtener cuenta IPTV del usuario actual
  getMyAccount: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.iptvAccount.findUnique({
        where: { userId: ctx.session.user.id },
        select: {
          id: true,
          username: true,
          password: true,
          serverUrl: true,
          port: true,
          isActive: true,
          maxConnections: true,
          profileName: true,
          createdAt: true,
          lastUsed: true,
        },
      });
    }),

  // Obtener estado de conexión (admin puede ver de cualquier usuario)
  getAccountStatus: protectedProcedure
    .input(z.object({
      userId: z.string().optional(), // Solo para admins
    }))
    .query(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.session.user.id;
      
      // Verificar permisos si se solicita otro usuario
      if (input.userId && input.userId !== ctx.session.user.id) {
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(ctx.session.user.role || "");
        if (!isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permisos para ver esta cuenta",
          });
        }
      }

      const account = await ctx.db.iptvAccount.findUnique({
        where: { userId: targetUserId },
        include: {
          user: {
            select: {
              name: true,
              subscriptions: {
                where: { status: "ACTIVE" },
                include: { plan: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!account) {
        return null;
      }

      return {
        ...account,
        subscription: account.user.subscriptions[0] || null,
      };
    }),

  // Crear cuenta IPTV (admin) - se llama automáticamente al aprobar pago
  createAccount: adminProcedure
    .input(z.object({
      userId: z.string(),
      serverUrl: z.string().url(),
      port: z.string().optional(),
      maxConnections: z.number().default(2),
      profileName: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar que no exista ya una cuenta para este usuario
      const existingAccount = await ctx.db.iptvAccount.findUnique({
        where: { userId: input.userId },
      });

      if (existingAccount) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este usuario ya tiene una cuenta IPTV",
        });
      }

      // Obtener información del usuario
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      // Generar credenciales únicas
      let username = generateIptvUsername(user.name);
      let usernameExists = await ctx.db.iptvAccount.findUnique({
        where: { username },
      });

      // Asegurar username único
      while (usernameExists) {
        username = generateIptvUsername(user.name);
        usernameExists = await ctx.db.iptvAccount.findUnique({
          where: { username },
        });
      }

      const password = generateSecurePassword();

      // Crear cuenta IPTV
      const account = await ctx.db.iptvAccount.create({
        data: {
          userId: input.userId,
          username,
          password,
          serverUrl: input.serverUrl,
          port: input.port,
          maxConnections: input.maxConnections,
          profileName: input.profileName || user.name,
          notes: input.notes,
        },
      });

      return account;
    }),

  // Actualizar cuenta IPTV (admin)
  updateAccount: adminProcedure
    .input(z.object({
      accountId: z.string(),
      serverUrl: z.string().url().optional(),
      port: z.string().optional(),
      maxConnections: z.number().optional(),
      profileName: z.string().optional(),
      notes: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { accountId, ...updateData } = input;

      return ctx.db.iptvAccount.update({
        where: { id: accountId },
        data: updateData,
      });
    }),

  // Regenerar contraseña (admin)
  regeneratePassword: adminProcedure
    .input(z.object({
      accountId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const newPassword = generateSecurePassword();

      const account = await ctx.db.iptvAccount.update({
        where: { id: input.accountId },
        data: { password: newPassword },
        include: {
          user: {
            select: { name: true, whatsapp: true },
          },
        },
      });

      // TODO: Enviar nueva contraseña por WhatsApp
      console.log("Webhook to n8n - Password Reset:", {
        event: "iptv.password_reset",
        user: {
          name: account.user.name,
          whatsapp: account.user.whatsapp,
        },
        credentials: {
          username: account.username,
          password: newPassword,
          serverUrl: account.serverUrl,
        },
      });

      return { success: true, newPassword };
    }),

  // Activar/desactivar cuenta (admin)
  toggleActive: adminProcedure
    .input(z.object({
      accountId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.db.iptvAccount.findUnique({
        where: { id: input.accountId },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cuenta IPTV no encontrada",
        });
      }

      return ctx.db.iptvAccount.update({
        where: { id: input.accountId },
        data: { isActive: !account.isActive },
      });
    }),

  // Marcar como usada (para estadísticas)
  markAsUsed: protectedProcedure
    .mutation(async ({ ctx }) => {
      const account = await ctx.db.iptvAccount.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!account) {
        return null;
      }

      return ctx.db.iptvAccount.update({
        where: { id: account.id },
        data: { lastUsed: new Date() },
      });
    }),

  // Obtener todas las cuentas (admin)
  getAllAccounts: adminProcedure
    .input(z.object({
      isActive: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.isActive !== undefined) {
        where.isActive = input.isActive;
      }

      if (input.search) {
        where.OR = [
          { username: { contains: input.search } },
          { profileName: { contains: input.search } },
          { user: { name: { contains: input.search } } },
          { user: { whatsapp: { contains: input.search } } },
        ];
      }

      return ctx.db.iptvAccount.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              whatsapp: true,
              subscriptions: {
                where: { status: "ACTIVE" },
                include: { plan: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      });
    }),

  // Estadísticas de cuentas IPTV (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, active, inactive, recentlyUsed] = await Promise.all([
        ctx.db.iptvAccount.count(),
        ctx.db.iptvAccount.count({
          where: { isActive: true },
        }),
        ctx.db.iptvAccount.count({
          where: { isActive: false },
        }),
        ctx.db.iptvAccount.count({
          where: {
            lastUsed: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
            },
          },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        recentlyUsed,
      };
    }),
});