import { Controller, Get, Post, Delete, Body, Query, Param, ParseUUIDPipe, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const CHUNK = 10_000;
const BASE_URL = process.env.SITE_URL ?? 'https://koli.app';

function xmlHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>`;
}

function sitemapIndex(entries: string[]): string {
  return [
    xmlHeader(),
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</sitemapindex>',
  ].join('\n');
}

function urlSet(urls: string[]): string {
  return [
    xmlHeader(),
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

function loc(path: string, lastmod?: string, changefreq = 'weekly', priority = '0.5'): string {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod.substring(0, 10)}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  /** Redirect lookup — called by Next.js middleware */
  @Get('redirect')
  async resolveRedirect(@Query('path') path: string) {
    if (!path) return null;
    return this.seoService.resolveRedirect(path);
  }

  /** Sitemap index */
  @Get('sitemap.xml')
  async sitemapIndex(@Res() res: FastifyReply) {
    const [bizCount, postCount] = await Promise.all([
      this.seoService.countBusinesses(),
      this.seoService.countPosts(),
    ]);

    const entries: string[] = [
      `  <sitemap><loc>${BASE_URL}/sitemap-cities.xml</loc></sitemap>`,
    ];
    for (let i = 0; i * CHUNK < bizCount; i++) {
      entries.push(`  <sitemap><loc>${BASE_URL}/sitemap-businesses-${i}.xml</loc></sitemap>`);
    }
    for (let i = 0; i * CHUNK < postCount; i++) {
      entries.push(`  <sitemap><loc>${BASE_URL}/sitemap-posts-${i}.xml</loc></sitemap>`);
    }

    res.header('Content-Type', 'application/xml').send(sitemapIndex(entries));
  }

  @Get('sitemap-cities.xml')
  async sitemapCities(@Res() res: FastifyReply) {
    const cities = await this.seoService.getSitemapCities();
    const urls = cities.map((c) =>
      loc(`/${c.slug}`, c.updatedAt?.toISOString(), 'daily', '0.9'),
    );
    res.header('Content-Type', 'application/xml').send(urlSet(urls));
  }

  @Get('sitemap-businesses-:chunk.xml')
  async sitemapBusinesses(@Param('chunk') chunk: string, @Res() res: FastifyReply) {
    const offset = parseInt(chunk, 10) * CHUNK;
    const rows = await this.seoService.getSitemapBusinesses(offset, CHUNK);
    const urls = rows.map((b) =>
      loc(`/firma/${b.slug}`, b.updatedAt?.toISOString(), 'weekly', '0.7'),
    );
    res.header('Content-Type', 'application/xml').send(urlSet(urls));
  }

  @Get('sitemap-posts-:chunk.xml')
  async sitemapPosts(@Param('chunk') chunk: string, @Res() res: FastifyReply) {
    const offset = parseInt(chunk, 10) * CHUNK;
    const rows = await this.seoService.getSitemapPosts(offset, CHUNK);
    const typeToPath: Record<string, string> = {
      news: '/haber',
      blog: '/blog',
      event: '/etkinlik',
      announcement: '/duyuru',
      campaign: '/kampanya',
    };
    const urls = rows.map((p) =>
      loc(`${typeToPath[p.type] ?? '/haber'}/${p.slug}`, p.publishedAt?.toISOString(), 'weekly', '0.6'),
    );
    res.header('Content-Type', 'application/xml').send(urlSet(urls));
  }

  // ──── Admin: redirect CRUD ────────────────────────────────────────────

  @Get('redirects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  listRedirects(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.seoService.listRedirects(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('redirects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createRedirect(@Body() body: { fromPath: string; toPath: string; statusCode?: number }) {
    return this.seoService.createRedirect(body.fromPath, body.toPath, body.statusCode);
  }

  @Delete('redirects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteRedirect(@Param('id', ParseUUIDPipe) id: string) {
    return this.seoService.deleteRedirect(id);
  }
}
