import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosts1000000000009 implements MigrationInterface {
  name = 'CreatePosts1000000000009';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE post_type_enum AS ENUM ('news','blog','event','announcement','campaign');
      CREATE TYPE post_status_enum AS ENUM ('draft','review','published','archived');
    `);

    await queryRunner.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id),
        business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
        post_type post_type_enum NOT NULL DEFAULT 'blog',
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT,
        cover_image_url VARCHAR,
        status post_status_enum NOT NULL DEFAULT 'draft',
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        published_at TIMESTAMPTZ,
        event_start_at TIMESTAMPTZ,
        event_end_at TIMESTAMPTZ,
        event_location VARCHAR,
        view_count BIGINT NOT NULL DEFAULT 0,
        seo_title VARCHAR,
        seo_description TEXT,
        seo_keywords VARCHAR,
        og_image_url VARCHAR,
        schema_markup JSONB,
        canonical_url VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE post_city_relations (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, city_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE post_business_relations (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, business_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE post_category_relations (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, category_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE post_tags (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_posts_status_type ON posts(status, post_type) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published' AND deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX idx_posts_business_id ON posts(business_id) WHERE deleted_at IS NULL`);
    await queryRunner.query(`CREATE INDEX idx_post_city_relations_city ON post_city_relations(city_id)`);
    await queryRunner.query(`CREATE INDEX idx_post_business_relations_business ON post_business_relations(business_id)`);
    await queryRunner.query(`CREATE INDEX idx_post_category_relations_category ON post_category_relations(category_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS post_tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS post_category_relations`);
    await queryRunner.query(`DROP TABLE IF EXISTS post_business_relations`);
    await queryRunner.query(`DROP TABLE IF EXISTS post_city_relations`);
    await queryRunner.query(`DROP TABLE IF EXISTS posts`);
    await queryRunner.query(`DROP TYPE IF EXISTS post_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS post_type_enum`);
  }
}
