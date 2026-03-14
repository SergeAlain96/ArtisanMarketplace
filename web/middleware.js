import { NextResponse } from 'next/server';

const TOKEN_COOKIE = 'artisan_marketplace_token';
const ROLE_COOKIE = 'artisan_marketplace_role';

export function middleware(request) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value || '';
  const role = request.cookies.get(ROLE_COOKIE)?.value || '';
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/dashboard/artisan') && role !== 'artisan') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
};
