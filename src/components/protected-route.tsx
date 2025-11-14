"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "ADMIN" | "SUPER_ADMIN" | "VERIFIER" | "USER";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    } else if (requiredRole && session?.user?.role !== requiredRole) {
      // Si requiere un rol específico y el usuario no lo tiene, redirige al dashboard
      router.push("/dashboard");
    }
  }, [status, session, requiredRole, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="text-3xl font-bold text-purple-400">Flutv</div>
          </div>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
