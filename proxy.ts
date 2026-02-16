import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";

type UserWithRole = Prisma.UserGetPayload<{
  select: { role: true };
}>;

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
  // FIXED: Be more specific to avoid matching CSRF/PKCE cookies (like better-auth.csrf_token) which persist after logout
  const hasSessionToken = allCookies.some(
    (c) => c.name.includes("session_token") || c.name.includes("session-token"),
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

  // 2. Admin Route Protection using better-auth
  if (path.startsWith("/admin")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }

    // Query database directly for role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }) as UserWithRole | null;

    if (!user || user.role?.toLowerCase() !== "admin") {
      return NextResponse.rewrite(new URL("/not-found", request.url), { status: 404 });
    }

    return NextResponse.next();
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
