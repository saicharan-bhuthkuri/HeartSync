import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_must_change';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const protectedPaths = ['/dashboard', '/timeline', '/journal', '/settings'];
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('token')?.value;

  // Check if it's a protected path or auth path
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (!isProtected && !isAuthPath && pathname !== '/') {
    return NextResponse.next();
  }

  let isAuthed = false;
  if (tokenCookie) {
    try {
      // Fast edge verify
      await jwtVerify(tokenCookie, secretKey, { algorithms: ['HS256'] });
      isAuthed = true;
    } catch (e) {
      isAuthed = false;
    }
  }

  // Redirect rules
  if (isProtected && !isAuthed) {
    // Save original path as redirect query
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthed) {
    // Already logged in, go to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user hits root "/" and is logged in, send them to dashboard
  if (pathname === '/' && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons (public folder files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
