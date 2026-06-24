import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBusinesses1000000000005 implements MigrationInterface {
  name = 'CreateBusinesses1000000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE business_status_enum AS ENUM ('draft','pending','active','suspended','deleted')
    `);

    await queryRunner.query(`
      CREATE TABLE businesses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_id UUID NOT NULL REFERENCES users(id),
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        description TEXT,
        short_description VARCHAR(300),
        logo_url VARCHAR,
        cover_url VARCHAR,
        phone VARCHAR,
        phone_secondary VARCHAR,
        whatsapp VARCHAR,
        email VARCHAR,
        website VARCHAR,
        status business_status_enum NOT NULL DEFAULT 'pending',
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        view_count BIGINT NOT NULL DEFAULT 0,
        click_count BIGINT NOT NULL DEFAULT 0,
        rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
        rating_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT businesses_slug_unique UNIQUE (slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE business_locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        address_line1 VARCHAR,
        address_line2 VARCHAR,
        city_id INTEGER NOT NULL REFERENCES cities(id),
        district_id INTEGER REFERENCES districts(id),
        neighborhood_id INTEGER REFERENCES neighborhoods(id),
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        postal_code VARCHAR,
        plus_code VARCHAR,
        map_embed_url VARCHAR,
        CONSTRAINT business_locations_business_unique UNIQUE (business_id)
      )
    `);

    await queryRunner.query(`
      CREATE TYPE social_platform_enum AS ENUM (
        'facebook','instagram','twitter','youtube','linkedin','tiktok','pinterest','whatsapp_channel'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE business_social_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        platform social_platform_enum NOT NULL,
        url VARCHAR NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE business_hours (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN NOT NULL DEFAULT FALSE,
        is_24h BOOLEAN NOT NULL DEFAULT FALSE,
        note VARCHAR,
        special_date DATE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE business_categories (
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (business_id, category_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        CONSTRAINT tags_slug_unique UNIQUE (slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE business_tags (
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (business_id, tag_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_businesses_status ON businesses(status) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX idx_businesses_owner_id ON businesses(owner_id)`);
    await queryRunner.query(`CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC, id)`);
    await queryRunner.query(`CREATE INDEX idx_business_locations_city_id ON business_locations(city_id)`);
    await queryRunner.query(`CREATE INDEX idx_business_categories_category ON business_categories(category_id)`);
    await queryRunner.query(`
      CREATE INDEX idx_businesses_fts ON businesses
      USING GIN(to_tsvector('simple', name || ' ' || COALESCE(description, '')))
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS business_tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_hours`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_social_links`);
    await queryRunner.query(`DROP TABLE IF EXISTS business_locations`);
    await queryRunner.query(`DROP TABLE IF EXISTS businesses`);
    await queryRunner.query(`DROP TYPE IF EXISTS business_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS social_platform_enum`);
  }
}
