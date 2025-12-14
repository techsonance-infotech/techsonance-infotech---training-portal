import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't need auth (login, etc)
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    if (token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        // If logged in and trying to go to login, redirect to dashboard or admin
        // But how do we know the role without verifying? 
        // We can just redirect to default dashboard and let dashboard handle role redirect?
        // Or just let them go to login (maybe they want to switch accounts) - but standard UX is redirect.
        // Let's just allow access to login page even if logged in for now, or redirect.
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (e) {
        // Token invalid, allow login page
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    // Role based access control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      // If not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/feedback/:path*",
    "/login" // Include login to redirect if already authenticated
  ],
};