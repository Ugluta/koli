import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SeoRedirect } from './entities/seo-redirect.entity';

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(SeoRedirect) private redirectsRepo: Repository<SeoRedirect>,
    private dataSource: DataSource,
  ) {}

  async resolveRedirect(fromPath: string): Promise<{ toPath: string; statusCode: number } | null> {
    const redirect = await this.redirectsRepo.findOne({
      where: { fromPath, isActive: true },
    });
    if (!redirect) return null;

    // increment hit count in background, don't await
    this.redirectsRepo.increment({ id: redirect.id }, 'hitCount', 1).catch(() => {});

    return { toPath: redirect.toPath, statusCode: redirect.statusCode };
  }

  async createRedirect(fromPath: string, toPath: string, statusCode = 301): Promise<SeoRedirect> {
    const existing = await this.redirectsRepo.findOne({ where: { fromPath } });
    if (existing) {
      await this.redirectsRepo.update(existing.id, { toPath, statusCode, isActive: true });
      return this.redirectsRepo.findOneOrFail({ where: { id: existing.id } });
    }
    const redirect = this.redirectsRepo.create({ fromPath, toPath, statusCode });
    return this.redirectsRepo.save(redirect);
  }

  async deleteRedirect(id: string): Promise<void> {
    await this.redirectsRepo.update(id, { isActive: false });
  }

  async listRedirects(page = 1, limit = 50) {
    const [data, total] = await this.redirectsRepo.findAndCount({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  // ──── Sitemap helpers ────────────────────────────────────────────────────

  async getSitemapCities(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.dataSource.query(
      `SELECT slug, updated_at AS "updatedAt" FROM cities WHERE deleted_at IS NULL ORDER BY name`,
    );
  }

  async getSitemapCategories(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.dataSource.query(
      `SELECT slug, updated_at AS "updatedAt" FROM categories WHERE deleted_at IS NULL ORDER BY name`,
    );
  }

  async getSitemapCountries(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.dataSource.query(
      `SELECT slug, updated_at AS "updatedAt" FROM countries WHERE deleted_at IS NULL ORDER BY name`,
    );
  }

  async getSitemapBusinesses(offset = 0, limit = 10000): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.dataSource.query(
      `SELECT slug, updated_at AS "updatedAt" FROM businesses
       WHERE status = 'active' AND deleted_at IS NULL
       ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async getSitemapPosts(offset = 0, limit = 10000): Promise<Array<{ slug: string; type: string; publishedAt: Date }>> {
    return this.dataSource.query(
      `SELECT slug, type, published_at AS "publishedAt" FROM posts
       WHERE status = 'published' AND deleted_at IS NULL
       ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async countBusinesses(): Promise<number> {
    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) AS count FROM businesses WHERE status = 'active' AND deleted_at IS NULL`,
    );
    return parseInt(count, 10);
  }

  async countPosts(): Promise<number> {
    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*) AS count FROM posts WHERE status = 'published' AND deleted_at IS NULL`,
    );
    return parseInt(count, 10);
  }
}
