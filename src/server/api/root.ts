import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { usersRouter } from "@/server/api/routers/users";
import { plansRouter } from "@/server/api/routers/plans";
import { paymentsRouter } from "@/server/api/routers/payments";
import { subscriptionsRouter } from "@/server/api/routers/subscriptions";
import { affiliatesRouter } from "@/server/api/routers/affiliates";
import { announcementsRouter } from "@/server/api/routers/announcements";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Sistema de Autenticación
  auth: authRouter,
  
  // Gestión de Usuarios
  users: usersRouter,
  
  // Planes y Suscripciones IPTV
  plans: plansRouter,
  payments: paymentsRouter,
  subscriptions: subscriptionsRouter,
  
  // Sistema de Afiliados
  affiliates: affiliatesRouter,
  
  // Feed de Anuncios
  announcements: announcementsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;