import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsServices1000000000007 implements MigrationInterface {
  name = 'CreateProductsServices1000000000007';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE product_status_enum AS ENUM ('draft','active','archived');
      CREATE TYPE stock_status_enum AS ENUM ('in_stock','out_of_stock','preorder');
      CREATE TYPE media_type_enum AS ENUM ('image','video','file','youtube');
    `);

    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price NUMERIC(10,2),
        price_min NUMERIC(10,2),
        price_max NUMERIC(10,2),
        currency CHAR(3) NOT NULL DEFAULT 'TRY',
        stock_status stock_status_enum NOT NULL DEFAULT 'in_stock',
        sku VARCHAR,
        barcode VARCHAR,
        status product_status_enum NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        view_count BIGINT NOT NULL DEFAULT 0,
        seo_title VARCHAR,
        seo_description TEXT,
        seo_keywords VARCHAR,
        schema_markup JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT products_slug_business_unique UNIQUE (business_id, slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_media (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        media_type media_type_enum NOT NULL DEFAULT 'image',
        url VARCHAR NOT NULL,
        thumbnail_url VARCHAR,
        sort_order INTEGER NOT NULL DEFAULT 0,
        alt_text VARCHAR,
        file_name VARCHAR,
        file_size BIGINT,
        mime_type VARCHAR
      )
    `);

    await queryRunner.query(`
      CREATE TABLE product_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        sku VARCHAR,
        price NUMERIC(10,2),
        stock_status stock_status_enum NOT NULL DEFAULT 'in_stock',
        attributes JSONB,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE services (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price_min NUMERIC(10,2),
        price_max NUMERIC(10,2),
        price_unit VARCHAR,
        currency CHAR(3) NOT NULL DEFAULT 'TRY',
        duration_minutes INTEGER,
        cover_url VARCHAR,
        status product_status_enum NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        seo_title VARCHAR,
        seo_description TEXT,
        seo_keywords VARCHAR,
        schema_markup JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT services_slug_business_unique UNIQUE (business_id, slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE service_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        url VARCHAR NOT NULL,
        thumbnail_url VARCHAR,
        sort_order INTEGER NOT NULL DEFAULT 0,
        alt_text VARCHAR
      )
    `);

    await queryRunner.query(`
      CREATE TABLE media_files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        uploaded_by UUID NOT NULL REFERENCES users(id),
        business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
        entity_type VARCHAR,
        entity_id UUID,
        bucket VARCHAR NOT NULL,
        key VARCHAR NOT NULL UNIQUE,
        url VARCHAR NOT NULL,
        original_filename VARCHAR,
        mime_type VARCHAR,
        size_bytes BIGINT,
        width INTEGER,
        height INTEGER,
        blurhash VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_products_business_id ON products(business_id)`);
    await queryRunner.query(`CREATE INDEX idx_products_status ON products(business_id, status)`);
    await queryRunner.query(`CREATE INDEX idx_services_business_id ON services(business_id)`);
    await queryRunner.query(`CREATE INDEX idx_media_files_business ON media_files(business_id)`);
    await queryRunner.query(`CREATE INDEX idx_media_files_entity ON media_files(entity_type, entity_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS media_files`);
    await queryRunner.query(`DROP TABLE IF EXISTS service_images`);
    await queryRunner.query(`DROP TABLE IF EXISTS services`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TYPE IF EXISTS product_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS stock_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS media_type_enum`);
  }
}
