"use client";

import Link from "next/link";
import { Toaster } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Temporary: using inline components instead of server components
// import {
//   AppContainer,
//   AppHeader,
//   AppNav,
//   SettingsButton,
//   SettingsButtonContent,
//   UserProfile,
// } from "@/components/server";
import { SignOutButton } from "@/components/client";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Settings, CreditCard, Upload, Users, Megaphone } from "lucide-react";
import Image from "next/image";

// Header Component - Shows user profile and navigation
const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between max-w-2xl mx-auto">
      <div className="flex items-center space-x-2">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h1 className="font-medium">{session?.user?.name}</h1>
          <p className="text-sm text-neutral-500">{session?.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings">
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </div>
          </Link>
        </Button>
        <SignOutButton onClick={handleSignOut} />
      </div>
    </header>
  );
};

// Stat Card Component - Reusable card for displaying metrics
const StatCard = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) => {
  return (
    <div className="border rounded-lg p-6">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  );
};

// Quick Actions Component - Common actions users might take
const QuickActions = () => {
  const actions = [
    { label: "Ver Planes", href: "/plans", description: "Explora nuestros planes de IPTV", icon: <CreditCard size={16} /> },
    { label: "Subir Comprobante", href: "/payments", description: "Sube tu comprobante de pago", icon: <Upload size={16} /> },
    { label: "Programa de Afiliados", href: "/affiliates", description: "Gana dinero refiriendo usuarios", icon: <Users size={16} /> },
    { label: "Configuración", href: "/settings", description: "Ajusta tu perfil y preferencias", icon: <Settings size={16} /> },
  ];

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Acciones Rápidas</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="text-muted-foreground">{action.icon}</div>
            <div>
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {action.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component - Shows recent user activity  
const RecentActivity = () => {
  const { data: userDashboard } = api.users.getDashboard.useQuery();
  
  // Transform recent payments into activity items
  const activities = userDashboard?.recentPayments?.slice(0, 5).map((payment) => ({
    action: `${payment.status === "APPROVED" ? "Pago aprobado" : payment.status === "REJECTED" ? "Pago rechazado" : "Pago enviado"} para plan ${payment.plan.name}`,
    time: new Date(payment.createdAt).toLocaleDateString(),
  })) || [];

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span>{activity.action}</span>
            <span className="text-muted-foreground text-xs">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Announcements Feed Component - Shows latest announcements
const AnnouncementsFeed = () => {
  const { data: announcements } = api.announcements.getFeed.useQuery();

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Noticias y Anuncios
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/feed">Ver Todo</Link>
        </Button>
      </div>
      
      <div className="space-y-3">
        {announcements && announcements.length > 0 ? (
          announcements.slice(0, 3).map((announcement) => (
            <div key={announcement.id} className="border rounded-lg p-3">
              <div className="font-medium text-sm mb-1">{announcement.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {announcement.content}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div>No hay anuncios recientes</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Content
const DashboardContent = () => {
  const { data: session } = useSession();
  const { data: userDashboard } = api.users.getDashboard.useQuery();
  const { data: affiliateStats } = api.affiliates.getMyStats.useQuery();
  
  const subscription = userDashboard?.subscription;
  const totalPayments = userDashboard?.recentPayments?.length || 0;
  const approvedPayments = userDashboard?.recentPayments?.filter(p => p.status === "APPROVED").length || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats Grid - Real metrics from tRPC */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="Estado" 
          value={subscription?.status === "ACTIVE" ? "Activo" : subscription?.status === "PENDING" ? "Pendiente" : "Inactivo"} 
          description={subscription ? `Plan: ${subscription.plan.name}` : "Sin suscripción"} 
        />
        <StatCard 
          label="Pagos" 
          value={approvedPayments} 
          description={`${totalPayments} pagos enviados`} 
        />
        <StatCard 
          label="Referidos" 
          value={affiliateStats?.totalReferrals || 0} 
          description={`${affiliateStats?.totalConversions || 0} conversiones`} 
        />
      </div>

      {/* Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions />
        <RecentActivity />
        <AnnouncementsFeed />
      </div>

      {/* Getting Started Section (Remove this after setup) */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h2 className="text-lg font-medium mb-3">Getting Started</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This is a boilerplate dashboard. Customize it by:
        </p>
        <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
          <li>Replacing StatCard values with your own tRPC queries</li>
          <li>Adding your own components and sections</li>
          <li>Creating new pages in the /dashboard directory</li>
          <li>Customizing the layout to fit your needs</li>
        </ul>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Edit this file: <code className="bg-muted px-1.5 py-0.5 rounded">src/app/(auth)/dashboard/page.tsx</code>
        </div>
      </div>
    </div>
  );
};

// Main Page Export
export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <Header />
      <DashboardContent />
      <Toaster />
    </div>
  );
}
