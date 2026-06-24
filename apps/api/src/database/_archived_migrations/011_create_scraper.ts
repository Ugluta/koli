import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScraper1700000011 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TYPE scraper_source_type_enum AS ENUM ('rss', 'html', 'json_api');
      CREATE TYPE scraper_source_status_enum AS ENUM ('active', 'paused', 'error');
      CREATE TYPE scraper_item_status_enum AS ENUM ('pending', 'approved', 'rejected', 'published');

      CREATE TABLE scraper_sources (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name            VARCHAR(255) NOT NULL,
        url             VARCHAR(2048) NOT NULL,
        type            scraper_source_type_enum NOT NULL DEFAULT 'rss',
        status          scraper_source_status_enum NOT NULL DEFAULT 'active',
        cron_expr       VARCHAR(100) NOT NULL DEFAULT '0 */6 * * *',
        city_id         UUID REFERENCES cities(id) ON DELETE SET NULL,
        category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
        default_post_type VARCHAR(50) NOT NULL DEFAULT 'news',
        selector_title  VARCHAR(500),
        selector_body   VARCHAR(500),
        selector_image  VARCHAR(500),
        selector_link   VARCHAR(500),
        last_fetched_at TIMESTAMPTZ,
        last_error      TEXT,
        fetch_count     INTEGER NOT NULL DEFAULT 0,
        error_count     INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE scraper_items (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_id       UUID NOT NULL REFERENCES scraper_sources(id) ON DELETE CASCADE,
        source_url      VARCHAR(2048) NOT NULL,
        title           VARCHAR(500) NOT NULL,
        body            TEXT,
        image_url       VARCHAR(2048),
        author          VARCHAR(255),
        published_at    TIMESTAMPTZ,
        status          scraper_item_status_enum NOT NULL DEFAULT 'pending',
        post_id         UUID REFERENCES posts(id) ON DELETE SET NULL,
        reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at     TIMESTAMPTZ,
        reject_reason   VARCHAR(500),
        raw_data        JSONB,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (source_id, source_url)
      );

      CREATE INDEX idx_scraper_items_status ON scraper_items (status);
      CREATE INDEX idx_scraper_items_source ON scraper_items (source_id, created_at DESC);
      CREATE INDEX idx_scraper_sources_status ON scraper_sources (status);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS scraper_items;
      DROP TABLE IF EXISTS scraper_sources;
      DROP TYPE IF EXISTS scraper_item_status_enum;
      DROP TYPE IF EXISTS scraper_source_status_enum;
      DROP TYPE IF EXISTS scraper_source_type_enum;
    `);
  }
}
