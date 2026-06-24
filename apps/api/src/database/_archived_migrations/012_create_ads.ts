import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAds1700000012 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TYPE ad_status_enum AS ENUM ('draft', 'active', 'paused', 'ended', 'rejected');
      CREATE TYPE ad_placement_enum AS ENUM (
        'city_top_banner',
        'city_sidebar',
        'business_list_inline',
        'business_detail_sidebar',
        'post_detail_inline',
        'homepage_hero'
      );
      CREATE TYPE ad_target_type_enum AS ENUM ('cpm', 'cpc', 'flat');

      CREATE TABLE ad_campaigns (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        advertiser_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_id     UUID REFERENCES businesses(id) ON DELETE SET NULL,
        name            VARCHAR(255) NOT NULL,
        status          ad_status_enum NOT NULL DEFAULT 'draft',
        placement       ad_placement_enum NOT NULL,
        target_type     ad_target_type_enum NOT NULL DEFAULT 'cpm',
        budget_cents    INTEGER NOT NULL DEFAULT 0,
        spent_cents     INTEGER NOT NULL DEFAULT 0,
        bid_cents       INTEGER NOT NULL DEFAULT 0,
        title           VARCHAR(255),
        description     VARCHAR(500),
        image_url       VARCHAR(2048),
        cta_url         VARCHAR(2048) NOT NULL,
        city_id         UUID REFERENCES cities(id) ON DELETE SET NULL,
        category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
        starts_at       TIMESTAMPTZ,
        ends_at         TIMESTAMPTZ,
        daily_cap_cents INTEGER,
        impression_count BIGINT NOT NULL DEFAULT 0,
        click_count     BIGINT NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE ad_events (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id   UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
        event_type    VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click')),
        ip_hash       VARCHAR(64),
        user_agent    VARCHAR(500),
        city_id       UUID REFERENCES cities(id) ON DELETE SET NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE ad_daily_stats (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id   UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
        stat_date     DATE NOT NULL,
        impressions   INTEGER NOT NULL DEFAULT 0,
        clicks        INTEGER NOT NULL DEFAULT 0,
        spent_cents   INTEGER NOT NULL DEFAULT 0,
        UNIQUE (campaign_id, stat_date)
      );

      CREATE INDEX idx_ad_campaigns_status ON ad_campaigns (status, starts_at, ends_at);
      CREATE INDEX idx_ad_campaigns_placement ON ad_campaigns (placement, status);
      CREATE INDEX idx_ad_campaigns_city ON ad_campaigns (city_id, placement, status);
      CREATE INDEX idx_ad_events_campaign ON ad_events (campaign_id, created_at DESC);
      CREATE INDEX idx_ad_daily_stats_date ON ad_daily_stats (stat_date DESC, campaign_id);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS ad_daily_stats;
      DROP TABLE IF EXISTS ad_events;
      DROP TABLE IF EXISTS ad_campaigns;
      DROP TYPE IF EXISTS ad_target_type_enum;
      DROP TYPE IF EXISTS ad_placement_enum;
      DROP TYPE IF EXISTS ad_status_enum;
    `);
  }
}
