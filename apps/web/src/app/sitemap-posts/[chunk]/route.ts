import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const revalidate = 3600;

export async function GET(_req: Request, { params }: { params: { chunk: string } }) {
  try {
    const res = await fetch(`${API_URL}/seo/sitemap-posts-${params.chunk}.xml`, {
      next: { revalidate: 3600 },
    });
    const xml = await res.text();
    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch {
    return new NextResponse('<?xml version="1.0"?><urlset/>', { headers: { 'Content-Type': 'application/xml' } });
  }
}
