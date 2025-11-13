import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_ROUTES = [/^\/worlds(\/.*)?$/, /^\/dashboard(\/.*)?$/];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => route.test(pathname));

  if (isProtectedRoute) {
    const sessionCookie = getSessionCookie(request, {
      cookiePrefix: "continueml",
    });

    // Optimistic redirect - not secure, must validate session on each page/route
    // This is just for UX to avoid showing protected pages to unauthenticated users
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  // Add caching headers for static assets
  if (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/fonts/")
  ) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  // Add caching headers for API routes
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth/")) {
      response.headers.set("Cache-Control", "no-store, must-revalidate");
    } else if (
      request.method === "GET" &&
      (pathname.includes("/worlds") || pathname.includes("/entities"))
    ) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, stale-while-revalidate=1800"
      );
    } else if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
      response.headers.set("Cache-Control", "no-store, must-revalidate");
    }
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/image|favicon.ico).*)"],
};
