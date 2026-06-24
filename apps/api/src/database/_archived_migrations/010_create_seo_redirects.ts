import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeoRedirects1700000010 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE seo_redirects (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_path   VARCHAR(2048) NOT NULL,
        to_path     VARCHAR(2048) NOT NULL,
        status_code SMALLINT NOT NULL DEFAULT 301,
        hit_count   INTEGER NOT NULL DEFAULT 0,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_status_code CHECK (status_code IN (301, 302, 307, 308))
      );

      CREATE UNIQUE INDEX idx_seo_redirects_from_path ON seo_redirects (from_path) WHERE is_active = TRUE;
      CREATE INDEX idx_seo_redirects_active ON seo_redirects (is_active);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS seo_redirects;`);
  }
}
