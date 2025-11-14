## Objetivo
- Alinear todo el repositorio al diseño funcional de Flutv: embudo público con comprobante manual, panel de cliente con credenciales IPTV, programa de referidos con monedero y retiros, y backend de administración para aprovisionamiento manual.

## Alcance y limpieza
- Eliminar vistas y módulos fuera de alcance: `documentation`, `api-reference`, secciones boilerplate del dashboard y cualquier demo.
- Mantener/renombrar únicamente lo alineado: Home/Landing, Checkout público, Login/Registro, Dashboard, Mis Cuentas/Planes, Contratar/Renovar Plan, Afiliados/Monedero, Pagos, Admin (Pedidos, Clientes, Afiliados, Anuncios, IPTV).
- Ajustar `middleware` para rutas públicas: incluir `"/checkout"`, `"/registro"` y endpoints de webhooks/cron.

## Autenticación (WhatsApp/Email + contraseña)
- Sustituir OAuth por `Credentials` en `src/server/auth.ts:66-84`, permitiendo login por WhatsApp o Email + contraseña.
- UI de `sign-in` y `sign-up`: formularios con campos requeridos del flujo (Nombre, WhatsApp, Email opcional, Contraseña).
- Soporte de recuperación de contraseña por WhatsApp/Email usando modelo `PasswordReset` (`prisma/schema.prisma:271-285`).

## Datos y modelos (Prisma)
- Validar y reutilizar modelos existentes:
  - Usuario con `whatsapp` único y `referralCode` (`prisma/schema.prisma:56-95`).
  - Planes, Suscripciones, Pagos (`prisma/schema.prisma:103-175`).
  - Cuentas IPTV (`prisma/schema.prisma:231-256`).
  - Afiliados y configuración (`prisma/schema.prisma:197-219`, `258-269`).
- Añadir:
  - `WithdrawalRequest` para retiros (CLABE/Banco, estado PENDING/PAID).
  - `WalletTransaction` para usos internos del saldo (compra/ajuste), enlazado a comisiones.

## Páginas públicas
- Landing/Home: grid de planes con CTA “Contratar” que envía a Checkout.
- Checkout unificado (`src/app/(unauth)/checkout/page.tsx:91-166`):
  - Mostrar datos bancarios (Banco, CLABE, Monto, Referencia).
  - Formulario: Nombre, WhatsApp (requerido), Email opcional, Contraseña, Código de referido opcional, Comprobante (JPG/PNG/PDF).
  - Envío: crear usuario y `Payment` PENDING vía `payments.publicCreate` (`src/server/api/routers/payments.ts:8-109`).
  - Disparar webhook `payment.pending`.

## Panel de Usuario
- Dashboard: estado del último pedido, feed de anuncios, métricas resumidas; eliminar bloque “Getting Started” (`src/app/(auth)/dashboard/page.tsx:235-250`).
- Mis Cuentas/Planes (`src/app/(auth)/my-account/page.tsx`):
  - Tarjeta por plan activo: vigencia, credenciales con botones de copiar/mostrar; incluir `serverUrl` y M3U (`servidor.xyz/c/`).
- Contratar/Renovar: seleccionar plan y subir comprobante; lógica de monedero:
  - Mostrar saldo disponible y checkbox para aplicar.
  - Enviar pago por el restante; ajustar validación en `payments.create` para `walletUseAmount`.
- Programa de Referidos (`src/app/(auth)/affiliates/page.tsx`):
  - Link único `flutv.app/registro?ref=CODE`.
  - Estadísticas (clics, registros, conversiones).
- Monedero Electrónico:
  - Saldo actual, historial (comisiones y transacciones), solicitar retiro si `saldo >= 500`; capturar CLABE/Banco.

## Panel de Administración
- Dashboard Admin: accesos a “Pendientes de Validación” y estadísticas básicas.
- Gestión de Pedidos (`src/app/(auth)/admin/payments/page.tsx` + back `paymentsRouter`):
  - Cola PENDING con comprobante visible.
  - Pantalla de Validación con formulario de aprovisionamiento manual:
    - Usuario IPTV, Contraseña IPTV, URL Servidor (`servidor.xyz/c/`), Vigencia (por defecto +duración, editable).
  - Acciones:
    - Aprobar y Activar: guarda credenciales en `IptvAccount`, activa suscripción, dispara `payment.approved` y `iptv.account_created`.
    - Rechazar: motivo requerido, `payment.rejected`.
- Gestión de Clientes: búsqueda/edición de teléfono/email; ver planes/credenciales/vencimientos.
- Gestión de Afiliados: configurar comisión (`AffiliateConfig`), ver `WithdrawalRequest` pendientes; boton “Marcar como Pagado” descuenta saldo y cierra solicitud.
- Gestión de Anuncios: CRUD para feed.
- Roles y Staff: verificador con permisos limitados (usa `adminProcedure` y roles `VERIFIER`, `ADMIN`, `SUPER_ADMIN` en `src/server/api/trpc.ts`).

## Webhooks y n8n
- Implementar servicio `webhookClient` que POSTea a `N8N_WEBHOOK_URL` los eventos:
  - `payment.pending`, `payment.approved`, `payment.rejected`.
  - `affiliate.commission`, `affiliate.withdrawal_request`, `affiliate.commissions_paid`.
  - `iptv.account_created`, `iptv.password_reset`.
- Reemplazar `console.log` actuales en routers por llamadas al servicio (`src/server/api/routers/payments.ts:445-458`, `iptv-accounts.ts:195-207`, `affiliates.ts:339-351`).

## Recordatorios (CRON)
- Endpoint programable `api/cron/payment-reminder` que busca suscripciones que vencen en 3 días y emite `payment.reminder` por webhook.
- Documentar uso con scheduler externo (Vercel Cron o n8n cron).

## UI y estilo
- Unificar branding “Flutv”: paleta, tipografía, copy, iconografía consistente.
- Pulir UX de formularios: validaciones, estados de carga, toasts, accesibilidad.
- Revisar componentes `shadcn/ui` ya usados y reutilizar patrones; limpiar duplicados.
- Hacer copy íntegro en español y consistente; botones de copiar en credenciales.

## Remociones
- Borrar páginas: `src/app/(auth)/documentation/page.tsx`, `src/app/(auth)/api-reference/page.tsx` y secciones boilerplate.
- Quitar OAuth (`GithubProvider`, `GoogleProvider`) de `src/server/auth.ts:67-84`.
- Quitar 2FA temporal si no se requiere.

## Validación y pruebas
- Pruebas de flujo completo: checkout → pago pendiente → aprobación admin → credenciales visibles.
- Verificación de roles y permisos en endpoints `adminProcedure` y `protectedProcedure` (`src/server/api/trpc.ts:125-162`).
- Tests manuales de copy y botones de copiar/mostrar en “Mis Cuentas”.

## Variables de entorno
- `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- `N8N_WEBHOOK_URL` para webhooks.
- Opcional: credenciales de almacenamiento para comprobantes (Cloudinary/S3) si se quiere subir archivo real.

## Entregables
- UI pulida y enfocada en Flutv, con flujos completos de cliente y admin.
- Autenticación por WhatsApp/Email + contraseña.
- Monedero de afiliados operativo (saldo, retiros, uso en compras).
- Webhooks n8n y cron de recordatorios implementados.

¿Confirmo y procedo con estos cambios en el código? (Eliminar lo fuera de alcance, reemplazar autenticación, crear modelos y páginas faltantes, e integrar webhooks/cron).