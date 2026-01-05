import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Protect all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    const adminKey = process.env.ADMIN_KEY;
    const authCookie = request.cookies.get('flora_admin_auth')?.value;
    const queryKey = searchParams.get('key');

    // 1. Check if the user is already authenticated via cookie
    if (authCookie === adminKey && adminKey !== undefined) {
      return NextResponse.next();
    }

    // 2. Check if the user is providing the key via URL
    if (queryKey === adminKey && adminKey !== undefined) {
      // Create a response that redirects to /admin to clean the URL
      const response = NextResponse.redirect(new URL('/admin', request.url));
      
      // Set a secure, long-lived cookie
      response.cookies.set('flora_admin_auth', adminKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    }

    // 3. If no valid auth is found, redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
