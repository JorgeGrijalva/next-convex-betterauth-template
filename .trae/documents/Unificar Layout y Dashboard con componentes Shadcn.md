## Objetivo
- Usar exclusivamente componentes Shadcn para el layout y el dashboard, eliminando headers duplicados y márgenes/blancos laterales.

## Arquitectura de UI
- Crear `AppShell` (Header + Sidebar + Content) basado en Shadcn (`Button`, `Sheet`, `DropdownMenu`, `ScrollArea`, `Separator`).
- Header: logo, breadcrumbs, acciones rápidas, menú de usuario (Shadcn `DropdownMenu`).
- Sidebar: navegación vertical con `lucide-react` y Shadcn (`ScrollArea`, `Button` como items). `Sheet` para móvil.
- Content: contenedor `max-w-none` con `px-4 md:px-6` y fondo global oscuro del `body`.

## Archivos a modificar/crear
1. `src/components/app-shell.tsx` (nuevo): implementa `AppShell` con props `children` y `navItems`.
2. `src/app/layout.tsx`: envolver `{children}` con `AppShell`; mantener `ThemeProvider`, `TRPCReactProvider`, `SessionProviderWrapper` y `Footer`.
3. `src/components/navbar.tsx`: deprecado; migrar su lógica (items, signOut) a `AppShell`.
4. `src/app/(auth)/layout.tsx` y `src/app/(unauth)/layout.tsx`: eliminar `Navbar`; para `(unauth)` usar `SiteHeader` ligero Shadcn (opcional) o sin header.
5. Páginas autenticadas (`dashboard`, `planes`, `pagos`, `mi-cuenta`, `afiliados`): quitar headers locales y usar solo contenido bajo `AppShell`.
6. Admin: mantener `src/app/(auth)/admin/layout.tsx` con su `AdminNav`; garantizar que `AppShell` no se renderiza en `/admin`.

## Dashboard Shadcn
- Tarjetas de métricas: `Card` (4–6 KPIs) con `CardHeader` + `CardContent`.
- Lista de actividad/anuncios: `Card` + `ScrollArea`.
- Accesos rápidos: `Button` con `asChild` y `Link`.
- Sin librerías de charts externas (solo Shadcn). Dejar sección de gráfico como `Card` placeholder.

## Navegación y permisos
- Construir `navItems` a partir de sesión (`useSession`): Inicio, Planes, Dashboard, Mis Pagos, Mi Cuenta IPTV, Afiliados; añadir `Admin` si rol ∈ {ADMIN, SUPER_ADMIN, VERIFIER}.
- Botón `Cerrar Sesión`: `DropdownMenu` en Header y acción en Sidebar para móvil.

## Estilos y tema
- Fondo global: `body` con `bg-slate-900` para evitar blancos laterales.
- Contenido full-width visual (sin `max-w-6xl` cuando se requiera ancho completo) o usar `container` condicional.
- Unificar paleta Slate/Gray en Shadcn.

## Verificación
- Ejecutar dev y validar:
  - No hay headers duplicados.
  - Rutas no-admin usan `AppShell`; `/admin` mantiene su layout.
  - Móvil: `Sheet` abre/cierra el menú.
  - Dark mode consistente.

## Entregables
- `AppShell` funcional.
- Dashboard y páginas autenticadas usando solo Shadcn.
- Layout raíz sin márgenes/blancos.