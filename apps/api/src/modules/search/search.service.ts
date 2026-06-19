import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';
import { DataSource } from 'typeorm';

const BUSINESSES_INDEX = 'businesses';
const POSTS_INDEX = 'posts';
const CATEGORIES_INDEX = 'categories';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch;

  constructor(
    private config: ConfigService,
    private dataSource: DataSource,
  ) {
    this.client = new MeiliSearch({
      host: config.get('MEILI_URL', 'http://localhost:7700'),
      apiKey: config.get('MEILI_MASTER_KEY'),
    });
  }

  async onModuleInit() {
    await this.configureIndexes().catch((err) =>
      this.logger.warn(`Meilisearch init failed (offline?): ${err.message}`),
    );
  }

  // ──── Index configuration ────────────────────────────────────────────────

  private async configureIndexes() {
    await this.client.createIndex(BUSINESSES_INDEX, { primaryKey: 'id' }).catch(() => {});
    await this.client.createIndex(POSTS_INDEX, { primaryKey: 'id' }).catch(() => {});
    await this.client.createIndex(CATEGORIES_INDEX, { primaryKey: 'id' }).catch(() => {});

    const bizIndex = this.client.index(BUSINESSES_INDEX);
    await bizIndex.updateSettings({
      searchableAttributes: ['name', 'shortDescription', 'description', 'categoryNames', 'cityName'],
      filterableAttributes: ['citySlug', 'countrySlug', 'categoryIds', 'status', 'isFeatured'],
      sortableAttributes: ['createdAt', 'viewCount'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    });

    const postIndex = this.client.index(POSTS_INDEX);
    await postIndex.updateSettings({
      searchableAttributes: ['title', 'excerpt', 'content'],
      filterableAttributes: ['type', 'status', 'cityIds'],
      sortableAttributes: ['publishedAt', 'viewCount'],
    });

    const catIndex = this.client.index(CATEGORIES_INDEX);
    await catIndex.updateSettings({
      searchableAttributes: ['name', 'description'],
      filterableAttributes: ['parentId'],
      sortableAttributes: ['name'],
    });
  }

  // ──── Index sync (called after create/update/delete) ────────────────────

  async indexBusiness(id: string) {
    try {
      const [row] = await this.dataSource.query(
        `SELECT b.id, b.name, b.slug, b.short_description AS "shortDescription",
                b.description, b.status, b.is_featured AS "isFeatured",
                b.view_count AS "viewCount", b.created_at AS "createdAt",
                c.slug AS "citySlug", c.name AS "cityName",
                co.slug AS "countrySlug", co.name AS "countryName",
                COALESCE(array_agg(cat.name) FILTER (WHERE cat.name IS NOT NULL), '{}') AS "categoryNames",
                COALESCE(array_agg(cat.id::text) FILTER (WHERE cat.id IS NOT NULL), '{}') AS "categoryIds"
         FROM businesses b
         LEFT JOIN business_locations bl ON bl.business_id = b.id
         LEFT JOIN cities c ON c.id = bl.city_id
         LEFT JOIN countries co ON co.id = c.country_id
         LEFT JOIN business_categories bc ON bc.business_id = b.id
         LEFT JOIN categories cat ON cat.id = bc.category_id
         WHERE b.id = $1
         GROUP BY b.id, c.slug, c.name`,
        [id],
      );
      if (!row) return;
      await this.client.index(BUSINESSES_INDEX).addDocuments([row]);
    } catch (err: any) {
      this.logger.warn(`Index business ${id} failed: ${err.message}`);
    }
  }

  async deleteBusiness(id: string) {
    await this.client.index(BUSINESSES_INDEX).deleteDocument(id).catch(() => {});
  }

  async indexPost(id: string) {
    try {
      const [row] = await this.dataSource.query(
        `SELECT p.id, p.title, p.slug, p.excerpt, p.type, p.status,
                p.view_count AS "viewCount", p.published_at AS "publishedAt",
                LEFT(p.content, 2000) AS content,
                COALESCE(array_agg(DISTINCT pcr.city_id::text) FILTER (WHERE pcr.city_id IS NOT NULL), '{}') AS "cityIds"
         FROM posts p
         LEFT JOIN post_city_relations pcr ON pcr.post_id = p.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id],
      );
      if (!row) return;
      await this.client.index(POSTS_INDEX).addDocuments([row]);
    } catch (err: any) {
      this.logger.warn(`Index post ${id} failed: ${err.message}`);
    }
  }

  async deletePost(id: string) {
    await this.client.index(POSTS_INDEX).deleteDocument(id).catch(() => {});
  }

  // ──── Full reindex (admin / cron) ────────────────────────────────────────

  async reindexAll(): Promise<{ businesses: number; posts: number; categories: number }> {
    const [bizCount, postCount, catCount] = await Promise.all([
      this.reindexBusinesses(),
      this.reindexPosts(),
      this.reindexCategories(),
    ]);
    return { businesses: bizCount, posts: postCount, categories: catCount };
  }

  private async reindexBusinesses(): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT b.id, b.name, b.slug, b.short_description AS "shortDescription",
              b.description, b.status, b.is_featured AS "isFeatured",
              b.view_count AS "viewCount", b.created_at AS "createdAt",
              c.slug AS "citySlug", c.name AS "cityName",
              co.slug AS "countrySlug", co.name AS "countryName",
              COALESCE(array_agg(cat.name) FILTER (WHERE cat.name IS NOT NULL), '{}') AS "categoryNames",
              COALESCE(array_agg(cat.id::text) FILTER (WHERE cat.id IS NOT NULL), '{}') AS "categoryIds"
       FROM businesses b
       LEFT JOIN business_locations bl ON bl.business_id = b.id
       LEFT JOIN cities c ON c.id = bl.city_id
       LEFT JOIN countries co ON co.id = c.country_id
       LEFT JOIN business_categories bc ON bc.business_id = b.id
       LEFT JOIN categories cat ON cat.id = bc.category_id
       WHERE b.deleted_at IS NULL
       GROUP BY b.id, c.slug, c.name, co.slug, co.name
       LIMIT 50000`,
    );
    if (rows.length) {
      await this.client.index(BUSINESSES_INDEX).addDocuments(rows, { primaryKey: 'id' });
    }
    return rows.length;
  }

  private async reindexPosts(): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.type, p.status,
              p.view_count AS "viewCount", p.published_at AS "publishedAt",
              LEFT(p.content, 2000) AS content,
              COALESCE(array_agg(DISTINCT pcr.city_id::text) FILTER (WHERE pcr.city_id IS NOT NULL), '{}') AS "cityIds"
       FROM posts p
       LEFT JOIN post_city_relations pcr ON pcr.post_id = p.id
       WHERE p.deleted_at IS NULL
       GROUP BY p.id
       LIMIT 100000`,
    );
    if (rows.length) {
      await this.client.index(POSTS_INDEX).addDocuments(rows, { primaryKey: 'id' });
    }
    return rows.length;
  }

  private async reindexCategories(): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT id, name, slug, description, parent_id AS "parentId" FROM categories WHERE deleted_at IS NULL`,
    );
    if (rows.length) {
      await this.client.index(CATEGORIES_INDEX).addDocuments(rows, { primaryKey: 'id' });
    }
    return rows.length;
  }

  // ──── Search ──────────────────────────────────────────────────────────────

  async searchBusinesses(params: {
    q: string;
    citySlug?: string;
    countrySlug?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, citySlug, countrySlug, categoryId, page = 1, limit = 20 } = params;
    const filters: string[] = ['status = "active"'];
    if (citySlug) filters.push(`citySlug = "${citySlug}"`);
    if (countrySlug) filters.push(`countrySlug = "${countrySlug}"`);
    if (categoryId) filters.push(`categoryIds = "${categoryId}"`);

    const result = await this.client.index(BUSINESSES_INDEX).search(q, {
      filter: filters.join(' AND '),
      limit,
      offset: (page - 1) * limit,
      attributesToHighlight: ['name', 'shortDescription'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return {
      data: result.hits,
      meta: { total: result.estimatedTotalHits, page, limit, processingTimeMs: result.processingTimeMs },
    };
  }

  async searchPosts(params: {
    q: string;
    type?: string;
    cityId?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, type, cityId, page = 1, limit = 20 } = params;
    const filters: string[] = ['status = "published"'];
    if (type) filters.push(`type = "${type}"`);
    if (cityId) filters.push(`cityIds = "${cityId}"`);

    const result = await this.client.index(POSTS_INDEX).search(q, {
      filter: filters.join(' AND '),
      limit,
      offset: (page - 1) * limit,
      attributesToHighlight: ['title', 'excerpt'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    return {
      data: result.hits,
      meta: { total: result.estimatedTotalHits, page, limit, processingTimeMs: result.processingTimeMs },
    };
  }

  async searchProducts(params: {
    q: string;
    citySlug?: string;
    countrySlug?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, citySlug, countrySlug, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = [`b.status = 'active'`, `b.deleted_at IS NULL`];
    const sqlParams: any[] = [`%${q}%`];
    let idx = 2;
    if (citySlug) { conditions.push(`c.slug = $${idx++}`); sqlParams.push(citySlug); }
    if (countrySlug) { conditions.push(`co.slug = $${idx++}`); sqlParams.push(countrySlug); }
    sqlParams.push(limit, offset);

    const where = conditions.join(' AND ');
    const rows = await this.dataSource.query(
      `SELECT p.id, p.name, p.slug, p.short_description AS "shortDescription",
              p.price, p.image_url AS "imageUrl",
              b.id AS "businessId", b.name AS "businessName", b.slug AS "businessSlug",
              c.name AS "cityName", c.slug AS "citySlug",
              co.name AS "countryName", co.slug AS "countrySlug"
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       LEFT JOIN business_locations bl ON bl.business_id = b.id
       LEFT JOIN cities c ON c.id = bl.city_id
       LEFT JOIN countries co ON co.id = c.country_id
       WHERE (p.name ILIKE $1 OR p.short_description ILIKE $1)
         AND ${where}
       ORDER BY p.name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      sqlParams,
    );

    const [{ count }] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count
       FROM products p
       JOIN businesses b ON b.id = p.business_id
       LEFT JOIN business_locations bl ON bl.business_id = b.id
       LEFT JOIN cities c ON c.id = bl.city_id
       LEFT JOIN countries co ON co.id = c.country_id
       WHERE (p.name ILIKE $1 OR p.short_description ILIKE $1) AND ${where}`,
      sqlParams.slice(0, -2),
    );

    return { data: rows, meta: { total: count, page, limit } };
  }

  async searchAll(q: string, limit = 5) {
    const [businesses, posts, categories] = await Promise.all([
      this.client.index(BUSINESSES_INDEX).search(q, { limit, filter: 'status = "active"' }),
      this.client.index(POSTS_INDEX).search(q, { limit, filter: 'status = "published"' }),
      this.client.index(CATEGORIES_INDEX).search(q, { limit }),
    ]);

    return {
      businesses: businesses.hits,
      posts: posts.hits,
      categories: categories.hits,
    };
  }
}
