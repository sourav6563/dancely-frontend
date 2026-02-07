import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection configuration
 * Pattern: "Secure by Default" (Whitelist)
 *
 * Strategy:
 * 1. Default: BLOCK EVERYTHING.
 * 2. Whitelist: Open specific routes for public access.
 * 3. Auth Routes: Special handling to redirect logged-in users away from login pages.
 */

// 1. PUBLIC ROUTES: Accessible to everyone (Guest + User)
const PUBLIC_ROUTES = [
  "/", // Landing Page
];

// 2. GUEST ONLY ROUTES: Accessible ONLY to Guests (Redirect to Home if Logged In)
const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Note: All other routes are implicitly PRIVATE.
// Examples: /dashboard, /community, /watch, /profile, /settings, /upload...

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken");

  /**
   * Helper: Matches path against a list of routes.
   * - "/" matches EXACTLY "/".
   * - "/watch" matches "/watch", "/watch/123", etc.
   */
  const isRouteMatch = (routes: string[]) => {
    return routes.some((route) => {
      if (route === "/") return pathname === "/";
      return pathname.startsWith(route);
    });
  };

  const isPublic = isRouteMatch(PUBLIC_ROUTES);
  const isGuestOnly = isRouteMatch(GUEST_ONLY_ROUTES);

  // SCENARIO 1: Accessing a Private Route (NOT Public, NOT Guest Only)
  // Action: If no token -> Redirect to Login
  if (!isPublic && !isGuestOnly) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      // Clean up the URL params to avoid duplication
      loginUrl.searchParams.delete("from");
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // SCENARIO 2: Accessing a Guest Only Page (Login/Register)
  // Action: If valid token exists -> Redirect to Home (Dashboard)
  if (isGuestOnly) {
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // SCENARIO 3: Accessing Public Route or Valid Private Access
  // Action: Allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
