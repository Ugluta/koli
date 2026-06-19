import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /panel/',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join('\n');

  return new NextResponse(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
