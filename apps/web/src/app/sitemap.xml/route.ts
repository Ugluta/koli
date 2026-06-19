import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koli.app';

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/seo/sitemap.xml`, { next: { revalidate: 3600 } });
    const xml = await res.text();
    // rewrite localhost API urls to SITE_URL
    const rewritten = xml.replace(new RegExp(API_URL, 'g'), SITE_URL);
    return new NextResponse(rewritten, { headers: { 'Content-Type': 'application/xml' } });
  } catch {
    return new NextResponse('<?xml version="1.0"?><sitemapindex/>', {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
