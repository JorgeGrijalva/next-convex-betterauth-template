import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Rutas que requieren rol de admin
    const adminRoutes = ["/admin"];
    const affiliateRoutes = ["/afiliados", "/afiliados/retirar"];

    // Verificar si es ruta de admin
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!token || !["ADMIN", "SUPER_ADMIN", "VERIFIER"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which routes require authentication
        const { pathname } = req.nextUrl;
        
        // Public routes that don't require authentication
        const publicRoutes = ["/", "/sign-in", "/sign-up", "/api/auth", "/api/cron", "/checkout", "/registro"];
        
        // Check if the current path is public
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }
        
        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};