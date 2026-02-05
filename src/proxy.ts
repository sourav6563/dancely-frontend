import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection configuration
 * Clean, centralized route definitions
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/upload",
  "/settings",
  "/liked",
  "/history",
  "/playlists",
  "/search",
];

// Homepage removed - it should be accessible to everyone (shows different content based on auth)
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

/**
 * Next.js 16 Proxy for route protection
 * Runs before every request to check auth state
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  // Protected routes: Redirect to login if not authenticated
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes: Redirect to home if already authenticated
  // Homepage is NOT in this list - it shows different content based on auth state
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
