"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, Users, Package, DollarSign, Server, Bell, Settings } from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Shield,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Planes",
    href: "/admin/planes",
    icon: Package,
  },
  {
    title: "Pagos",
    href: "/admin/pagos",
    icon: DollarSign,
  },
  {
    title: "Cuentas IPTV",
    href: "/admin/iptv-accounts",
    icon: Server,
  },
  {
    title: "Anuncios",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    title: "Solicitudes de Retiro",
    href: "/admin/withdrawals",
    icon: DollarSign,
  },
  {
    title: "Config Afiliados",
    href: "/admin/affiliate-config",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Panel de Admin</h2>
        <ul className="space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}