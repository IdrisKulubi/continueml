import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "continueml",
  });

  // Optimistic redirect - not secure, must validate session on each page/route
  // This is just for UX to avoid showing protected pages to unauthenticated users
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/worlds/:path*",
    "/dashboard/:path*",
  ],
};
