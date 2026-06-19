import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ScraperSource, SourceType, SourceStatus } from './entities/scraper-source.entity';
import { ScraperItem, ItemStatus } from './entities/scraper-item.entity';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    @InjectRepository(ScraperSource) private sourcesRepo: Repository<ScraperSource>,
    @InjectRepository(ScraperItem) private itemsRepo: Repository<ScraperItem>,
    private dataSource: DataSource,
  ) {}

  // ──── Source CRUD ────────────────────────────────────────────────────────

  async createSource(dto: Partial<ScraperSource>): Promise<ScraperSource> {
    const source = this.sourcesRepo.create(dto);
    return this.sourcesRepo.save(source);
  }

  async listSources(page = 1, limit = 50) {
    const [data, total] = await this.sourcesRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async updateSource(id: string, dto: Partial<ScraperSource>): Promise<ScraperSource> {
    await this.sourcesRepo.update(id, dto);
    return this.sourcesRepo.findOneOrFail({ where: { id } });
  }

  async deleteSource(id: string): Promise<void> {
    await this.sourcesRepo.delete(id);
  }

  // ──── Fetch & parse ──────────────────────────────────────────────────────

  async fetchSource(sourceId: string): Promise<{ created: number; skipped: number }> {
    const source = await this.sourcesRepo.findOne({ where: { id: sourceId } });
    if (!source) throw new NotFoundException('Source not found');

    let created = 0;
    let skipped = 0;

    try {
      const items =
        source.type === SourceType.RSS
          ? await this.parseRss(source.url)
          : source.type === SourceType.HTML
          ? await this.parseHtml(source)
          : await this.parseJsonApi(source.url);

      for (const item of items) {
        const exists = await this.itemsRepo.findOne({
          where: { sourceId, sourceUrl: item.sourceUrl },
        });
        if (exists) { skipped++; continue; }

        await this.itemsRepo.save(
          this.itemsRepo.create({ ...item, sourceId, status: ItemStatus.PENDING }),
        );
        created++;
      }

      await this.sourcesRepo.update(sourceId, {
        lastFetchedAt: new Date(),
        lastError: null,
        fetchCount: () => 'fetch_count + 1' as any,
      });
    } catch (err: any) {
      this.logger.error(`Fetch failed for source ${sourceId}: ${err.message}`);
      await this.sourcesRepo.update(sourceId, {
        lastError: err.message,
        status: SourceStatus.ERROR,
        errorCount: () => 'error_count + 1' as any,
      });
      throw err;
    }

    return { created, skipped };
  }

  private async parseRss(url: string) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    // Simple regex-based RSS parser — no external deps needed
    const items: Array<{ title: string; sourceUrl: string; body: string | null; imageUrl: string | null; publishedAt: Date | null; author: string | null; rawData: any }> = [];

    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
    for (const match of itemMatches) {
      const block = match[1]!;
      const title = this.extractXml(block, 'title') ?? '';
      const link = this.extractXml(block, 'link') ?? this.extractXml(block, 'guid') ?? '';
      if (!title || !link) continue;

      const description = this.extractXml(block, 'description');
      const pubDate = this.extractXml(block, 'pubDate');
      const author = this.extractXml(block, 'author') ?? this.extractXml(block, 'dc:creator');

      // enclosure or media:content for image
      const enclosure = block.match(/enclosure[^>]*url="([^"]+)"/i)?.[1];
      const mediaContent = block.match(/media:content[^>]*url="([^"]+)"/i)?.[1];

      items.push({
        title: this.decodeHtmlEntities(title),
        sourceUrl: link.trim(),
        body: description ? this.decodeHtmlEntities(description) : null,
        imageUrl: enclosure ?? mediaContent ?? null,
        publishedAt: pubDate ? new Date(pubDate) : null,
        author: author ?? null,
        rawData: { title, link, description, pubDate },
      });
    }

    return items;
  }

  private async parseHtml(source: ScraperSource) {
    const res = await fetch(source.url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Without cheerio, we do basic regex extraction using configured selectors
    // In production you'd add cheerio/htmlparser2 as a dependency
    const items: Array<{ title: string; sourceUrl: string; body: string | null; imageUrl: string | null; publishedAt: Date | null; author: string | null; rawData: any }> = [];

    // Extract <a href> links that match the link selector pattern
    const linkPattern = source.selectorLink
      ? new RegExp(`href="([^"]*${source.selectorLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*)"`, 'gi')
      : /href="(https?:\/\/[^"]+)"/gi;

    const linkMatches = [...html.matchAll(linkPattern)];
    for (const match of linkMatches.slice(0, 50)) {
      const url = match[1];
      if (!url) continue;
      items.push({
        title: url,
        sourceUrl: url,
        body: null,
        imageUrl: null,
        publishedAt: new Date(),
        author: null,
        rawData: { url },
      });
    }

    return items;
  }

  private async parseJsonApi(url: string) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const arr: any[] = Array.isArray(data) ? data : data.items ?? data.data ?? data.results ?? [];
    return arr.slice(0, 100).map((item: any) => ({
      title: item.title ?? item.name ?? String(item.id ?? ''),
      sourceUrl: item.url ?? item.link ?? item.id ?? '',
      body: item.description ?? item.content ?? item.body ?? null,
      imageUrl: item.image ?? item.thumbnail ?? item.cover ?? null,
      publishedAt: item.publishedAt ?? item.published_at ?? item.date ? new Date(item.publishedAt ?? item.published_at ?? item.date) : null,
      author: item.author ?? item.author_name ?? null,
      rawData: item,
    }));
  }

  private extractXml(block: string, tag: string): string | null {
    const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, 'i'))
      ?? block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
    return m?.[1]?.trim() ?? null;
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
      .replace(/<[^>]+>/g, '').trim();
  }

  // ──── Review queue ───────────────────────────────────────────────────────

  async listPending(page = 1, limit = 20) {
    const [data, total] = await this.itemsRepo.findAndCount({
      where: { status: ItemStatus.PENDING },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async approveItem(itemId: string, reviewerId: string): Promise<{ postId: string }> {
    const item = await this.itemsRepo.findOne({ where: { id: itemId }, relations: [] });
    if (!item) throw new NotFoundException('Item not found');

    const source = await this.sourcesRepo.findOne({ where: { id: item.sourceId } });

    return this.dataSource.transaction(async (manager) => {
      let slug = slugify(item.title);
      const existing = await manager.query(`SELECT id FROM posts WHERE slug = $1`, [slug]);
      if (existing.length) slug = `${slug}-${Date.now()}`;

      const [post] = await manager.query(
        `INSERT INTO posts (title, slug, type, status, excerpt, content, cover_image_url, author_id, published_at)
         VALUES ($1, $2, $3, 'published', $4, $5, $6, $7, $8) RETURNING id`,
        [
          item.title,
          slug,
          source?.defaultPostType ?? 'news',
          item.body?.substring(0, 300) ?? null,
          item.body ?? null,
          item.imageUrl ?? null,
          reviewerId,
          item.publishedAt ?? new Date(),
        ],
      );

      if (source?.cityId) {
        await manager.query(
          `INSERT INTO post_city_relations (post_id, city_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [post.id, source.cityId],
        );
      }
      if (source?.categoryId) {
        await manager.query(
          `INSERT INTO post_category_relations (post_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [post.id, source.categoryId],
        );
      }

      await manager.query(
        `UPDATE scraper_items SET status = 'published', post_id = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3`,
        [post.id, reviewerId, itemId],
      );

      return { postId: post.id };
    });
  }

  async rejectItem(itemId: string, reviewerId: string, reason?: string): Promise<void> {
    await this.itemsRepo.update(itemId, {
      status: ItemStatus.REJECTED,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectReason: reason ?? null,
    });
  }
}
