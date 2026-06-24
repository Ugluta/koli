import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBusinessGallery1700000014 implements MigrationInterface {
  async up(runner: QueryRunner) {
    await runner.query(`
      CREATE TABLE business_media (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        url         TEXT NOT NULL,
        thumbnail_url TEXT,
        alt_text    VARCHAR(255),
        mime_type   VARCHAR(100),
        file_size   BIGINT,
        sort_order  SMALLINT NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX bm_business_idx ON business_media(business_id, sort_order);
    `);
  }

  async down(runner: QueryRunner) {
    await runner.query(`DROP TABLE IF EXISTS business_media;`);
  }
}
