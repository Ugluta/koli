import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/panel', '/admin'];

const LOCALE_TO_CITY: Record<string, string> = {
  tr: 'istanbul',
  de: 'berlin',
  fr: 'paris',
  en: 'london',
  it: 'roma',
  es: 'madrid',
  nl: 'amsterdam',
  pl: 'warszawa',
  pt: 'lisboa',
  cs: 'praha',
  ro: 'bucuresti',
  bg: 'sofia',
  el: 'athina',
  hu: 'budapest',
  sv: 'stockholm',
  da: 'kobenhavn',
  fi: 'helsinki',
};

function detectLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'tr';
  const primary = acceptLanguage.split(',')[0]?.split(';')[0]?.split('-')[0]?.toLowerCase();
  return primary ?? 'tr';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect panel and admin routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Redirect root to locale-appropriate city
  if (pathname === '/') {
    const locale = detectLocale(request.headers.get('accept-language'));
    const citySlug = LOCALE_TO_CITY[locale] ?? 'istanbul';
    return NextResponse.redirect(new URL(`/${citySlug}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/panel/:path*', '/admin/:path*'],
};
