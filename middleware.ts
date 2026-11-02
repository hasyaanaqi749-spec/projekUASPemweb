import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface UserPayload {
  id: string;
  email: string;
  role: 'PENUMPANG' | 'PETUGAS' | 'ADMIN';
}

function parseJwtPayload(token: string): UserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session_token')?.value;

  // 1. Rute Publik (bebas akses)
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/jadwal') ||
    pathname.startsWith('/api/cron')
  ) {
    return NextResponse.next();
  }

  // 2. Jika rute tertutup diakses tanpa login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = parseJwtPayload(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Rute Admin (/admin/*) -> Hanya Role ADMIN
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 4. Rute Petugas (/petugas/*) -> Role PETUGAS atau ADMIN
  if (pathname.startsWith('/petugas') && !['PETUGAS', 'ADMIN'].includes(user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/petugas/:path*', '/tiket/pesan/:path*', '/profil/:path*'],
};