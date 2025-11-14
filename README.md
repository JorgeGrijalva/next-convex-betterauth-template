# Sistema Integral IPTV - Pagos, Afiliados y Notificaciones

Un sistema web robusto para la gestión de suscripciones y pagos de un servicio de IPTV, con sistema de marketing de afiliados y automatización de notificaciones vía WhatsApp.

![IPTV System](https://img.shields.io/badge/IPTV-System-blue)
![T3 Stack](https://img.shields.io/badge/T3-Stack-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌟 Características Principales

### 📱 Panel de Usuario (Portal del Cliente)

**Autenticación Priorizada por WhatsApp:**
- ✅ Registro con WhatsApp como campo principal
- ✅ Email como campo alternativo (opcional)
- ✅ Recuperación de contraseña por WhatsApp con códigos de 6 dígitos
- ✅ Integración con OAuth (GitHub, Google)

**Dashboard Completo:**
- ✅ Estado de suscripción en tiempo real (Activa, Pendiente, Vencida)
- ✅ Feed de anuncios y promociones
- ✅ Gestión de pagos con comprobantes
- ✅ Sistema de afiliados con link único
- ✅ Historial completo de actividad

**Sistema de Pagos Manual:**
- ✅ Subida de comprobantes (imagen/PDF)
- ✅ Proceso de verificación por administradores
- ✅ Estados: Pendiente → Aprobado/Rechazado
- ✅ Notificaciones automáticas por WhatsApp

**Programa de Afiliados:**
- ✅ Link de referido único por usuario
- ✅ Estadísticas detalladas (clics, registros, conversiones)
- ✅ Sistema de comisiones configurable
- ✅ Gestión de retiros

### 🛠️ Panel de Administración (Backend)

**Dashboard Administrativo:**
- ✅ Métricas en tiempo real (ingresos, suscripciones, usuarios)
- ✅ Sistema de roles (VERIFIER, ADMIN, SUPER_ADMIN)
- ✅ Gestión de pagos pendientes
- ✅ Estadísticas de afiliados

**Gestión de Verificación de Pagos:**
- ✅ Cola de pagos con visualizador de comprobantes
- ✅ Aprobación/rechazo con notas
- ✅ Activación automática de suscripciones
- ✅ Generación automática de comisiones

**Gestión Completa:**
- ✅ CRUD de usuarios con roles
- ✅ CRUD de planes IPTV
- ✅ Feed de anuncios y notificaciones
- ✅ Sistema de afiliados configurable
- ✅ Notificaciones masivas por WhatsApp

### 🔗 Sistema de Webhooks (n8n Ready)

**Eventos Automatizados:**
- ✅ `payment.approved` - Pago aprobado
- ✅ `payment.rejected` - Pago rechazado
- ✅ `affiliate.commission` - Comisión generada
- ✅ `security.password_reset` - Reset por WhatsApp
- ✅ `notification.broadcast` - Notificaciones masivas
- ✅ `subscription.reminder` - Recordatorios de vencimiento

## 🏗️ Arquitectura Técnica

### Stack Tecnológico (T3 Stack)

```
Frontend:
├── Next.js 16 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
└── Lucide Icons

Backend:
├── tRPC (Type-safe APIs)
├── Prisma ORM
├── NextAuth.js
├── bcryptjs
└── Zod (Validation)

Base de Datos:
├── SQLite (desarrollo)
├── PostgreSQL (producción)
└── Prisma Schema
```

### Estructura de la Base de Datos

```sql
-- Usuarios con sistema de referidos
Users (id, name, whatsapp, email, role, referralCode, referredBy)

-- Planes IPTV
Plans (id, name, price, duration, features, isActive)

-- Suscripciones
Subscriptions (id, userId, planId, status, startDate, endDate)

-- Pagos
Payments (id, userId, planId, amount, status, receiptImage, reviewNotes)

-- Sistema de Afiliados
AffiliateCommission (id, affiliateId, referredUserId, amount, status)
AffiliateConfig (commissionType, percentage, fixedAmount, freeDays)

-- Anuncios y Notificaciones
AnnouncementFeed (id, title, content, imageUrl, isPublished)
PasswordReset (id, userId, code, type, expiresAt)
```

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
Node.js >= 18
pnpm >= 8
Git
```

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd sistema-iptv
pnpm install
```

### 2. Configurar Variables de Entorno

Crear `.env.local`:

```env
# Base de Datos
DATABASE_URL="file:./db.sqlite"

# NextAuth.js
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Opcional)
GITHUB_CLIENT_ID="tu-github-client-id"
GITHUB_CLIENT_SECRET="tu-github-client-secret"
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# n8n Webhooks (Opcional)
N8N_WEBHOOK_URL="https://tu-n8n-instance.com/webhook"
```

### 3. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear base de datos y tablas
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 4. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Guía de Uso

### Para Clientes

1. **Registro:**
   - Usar WhatsApp como identificador principal
   - Email opcional para recuperación

2. **Contratar Plan:**
   - Ver planes disponibles en `/plans`
   - Seleccionar plan y proceder al pago

3. **Realizar Pago:**
   - Subir comprobante en `/payments`
   - Agregar referencia y método de pago
   - Esperar aprobación del administrador

4. **Programa de Afiliados:**
   - Obtener link de referido en `/affiliates`
   - Compartir con amigos y familia
   - Ganar comisiones por conversiones

### Para Administradores

1. **Acceso al Panel:**
   - Iniciar sesión con cuenta de administrador
   - Acceder a `/admin`

2. **Revisar Pagos:**
   - Ir a `/admin/payments`
   - Revisar comprobantes subidos
   - Aprobar o rechazar con notas

3. **Gestionar Usuarios:**
   - Ver lista completa en `/admin/users`
   - Activar/desactivar cuentas
   - Ver historial detallado

4. **Crear Anuncios:**
   - Ir a `/admin/announcements`
   - Crear anuncios para el feed
   - Enviar notificaciones personalizadas

## 🎯 Funcionalidades Detalladas

### Sistema de Roles

```typescript
CLIENT:        // Cliente normal
├── Ver planes
├── Realizar pagos
├── Gestionar afiliados
└── Ver feed de anuncios

VERIFIER:      // Verificador de pagos
├── Revisar pagos pendientes
├── Aprobar/rechazar comprobantes
└── Ver estadísticas básicas

ADMIN:         // Administrador general
├── Todas las funciones de VERIFIER
├── Gestionar usuarios
├── Gestionar planes
├── Gestionar anuncios
└── Ver estadísticas completas

SUPER_ADMIN:   // Super administrador
├── Todas las funciones de ADMIN
├── Crear/editar administradores
├── Configurar sistema de afiliados
└── Acceso total al sistema
```

### Sistema de Notificaciones (Webhooks)

```json
// Ejemplo: Pago Aprobado
{
  "event": "payment.approved",
  "user": {
    "name": "Juan Pérez",
    "whatsapp": "+521234567890"
  },
  "plan": {
    "name": "Plan Premium",
    "duration": 30
  },
  "amount": "150.00 MXN",
  "endDate": "2024-01-15T00:00:00Z"
}

// Ejemplo: Comisión Generada
{
  "event": "affiliate.commission",
  "affiliate_user": {
    "name": "María García",
    "whatsapp": "+521234567891"
  },
  "new_customer_name": "Pedro López",
  "commission_amount": "15.00 MXN"
}
```

## 🎨 Páginas Disponibles

### Páginas del Cliente
- `/` - Página principal
- `/dashboard` - Panel del usuario
- `/plans` - Catálogo de planes IPTV
- `/payments` - Gestión de pagos
- `/affiliates` - Programa de afiliados
- `/settings` - Configuración de cuenta
- `/feed` - Feed de noticias y anuncios

### Páginas de Administración
- `/admin` - Dashboard administrativo
- `/admin/payments` - Revisión de pagos
- `/admin/users` - Gestión de usuarios
- `/admin/announcements` - Gestión de anuncios

### Páginas de Autenticación
- `/sign-in` - Inicio de sesión
- `/sign-up` - Registro de usuario
- `/reset-password` - Recuperación de contraseña

## 🔧 Configuración Avanzada

### Integración con n8n

1. **Configurar Webhook en n8n:**
   ```json
   {
     "method": "POST",
     "url": "https://tu-dominio.com/webhook/iptv",
     "headers": {
       "Content-Type": "application/json"
     }
   }
   ```

2. **Procesar Eventos:**
   - Filtrar por `event` type
   - Enviar mensajes de WhatsApp
   - Actualizar CRM externo

### Configuración de OAuth

1. **GitHub:**
   - Crear OAuth App en GitHub
   - Configurar callback: `http://localhost:3000/api/auth/callback/github`

2. **Google:**
   - Crear proyecto en Google Console
   - Habilitar Google+ API
   - Configurar callback: `http://localhost:3000/api/auth/callback/google`

### Configuración de Base de Datos para Producción

```env
# PostgreSQL para producción
DATABASE_URL="postgresql://usuario:password@localhost:5432/iptv_db"
```

Ejecutar migraciones:
```bash
npx prisma db push
npx prisma generate
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
pnpm test

# Verificar tipos
pnpm type-check

# Linting
pnpm lint

# Build de producción
pnpm build
```

## 📦 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio en Vercel**
2. **Configurar variables de entorno**
3. **Configurar base de datos externa**
4. **Deploy automático**

### Docker

```dockerfile
# Dockerfile incluido en el proyecto
docker build -t iptv-system .
docker run -p 3000:3000 iptv-system
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙋‍♂️ Soporte

Para soporte técnico o preguntas:

- **Email**: soporte@tu-dominio.com
- **WhatsApp**: +52-XXX-XXX-XXXX
- **Documentación**: [Confluence Page]
- **Issues**: [GitHub Issues]

## 🚧 Roadmap

### Próximas Funcionalidades

- [ ] **Autenticación 2FA completa**
- [ ] **Integración con pasarelas de pago**
- [ ] **App móvil React Native**
- [ ] **Panel de analytics avanzado**
- [ ] **Integración con Telegram**
- [ ] **API pública para terceros**
- [ ] **Multi-tenant support**

### Mejoras Técnicas

- [ ] **Tests unitarios y e2e**
- [ ] **Monitoring y observabilidad**
- [ ] **CDN para comprobantes**
- [ ] **Rate limiting**
- [ ] **Caché con Redis**

---

**Desarrollado con ❤️ usando T3 Stack**

*Sistema IPTV - Gestión completa de suscripciones, pagos y afiliados*