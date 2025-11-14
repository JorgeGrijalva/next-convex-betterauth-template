"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (status === "authenticated" && session?.user) {
      const adminRoles = ["ADMIN", "SUPER_ADMIN", "VERIFIER"];
      if (!adminRoles.includes(session.user.role || "")) {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const adminRoles = ["ADMIN", "SUPER_ADMIN", "VERIFIER"];
  if (!adminRoles.includes(session.user.role || "")) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex bg-slate-950">
      <AdminNav />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}