import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For in-memory/localStorage token, we can't reliably check it in middleware (middleware runs on edge/server, no access to client storage).
  // So a simple approach: assume protected if a specific cookie exists (you can set a non-sensitive "isLoggedIn" flag cookie on login).

  // Alternative: If you switch to HttpOnly cookies for the token, check it here securely.
  // For now, let's use a dummy check or skip strict middleware and handle per-page.

  const pathname = request.nextUrl.pathname;
  console.log("middleware", request.headers)

//   // Protect anything under /dashboard
//   if (pathname.startsWith('/dashboard')) {
//     // Example: Check for a custom cookie you set on login (non-HttpOnly)
//     const hasToken = request.cookies.has('hasAccessToken'); // You'll set this on login

//     if (!hasToken) {
//       return NextResponse.redirect(new URL('/auth/login', request.url));
//     }
//   }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], // Apply to all dashboard sub-routes
};