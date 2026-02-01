import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export default async function middleware(request: NextRequest) {
  return await proxy(request);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize pathname to remove trailing slashes for consistent matching
  const path =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname;

  // 1. Session Detection
  const allCookies = request.cookies.getAll();

  // Broad session detection: any cookie that looks like a better-auth session
  const hasSessionToken = allCookies.some(
    (c) => c.name.includes("session-token") || c.name.includes("better-auth"),
  );

  const authRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.includes(path);

  // DEBUG: Useful for the user to see in their terminal logs
  // console.log(`[Proxy] ${path} | Session: ${hasSessionToken} | Cookies: ${allCookies.length}`);

  if (hasSessionToken && isAuthRoute) {
    // console.log(`[Proxy] Redirecting authenticated user from ${path} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Admin Route Protection
  if (path.startsWith("/admin")) {
    const adminKey = process.env.ADMIN_KEY;
    const authCookie = request.cookies.get("flora_admin_auth")?.value;
    const queryKey = request.nextUrl.searchParams.get("key");

    if (authCookie === adminKey && adminKey !== undefined) {
      return NextResponse.next();
    }

    if (queryKey !== null) {
      // If someone is trying a key, rate limit them
      const rateLimit = await checkRateLimit({
        key: "admin-key-attempt",
        window: 60 * 60 * 24 * 7, // 7 days
        max: 3, // 3 attempts per 7 days
      });

      if (!rateLimit.success) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (queryKey === adminKey && adminKey !== undefined) {
        const response = NextResponse.redirect(new URL("/admin", request.url));
        response.cookies.set("flora_admin_auth", adminKey, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        });
        return response;
      }
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/admin",
    "/admin/:path*",
  ],
};
