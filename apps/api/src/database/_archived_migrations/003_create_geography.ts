import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGeography1000000000003 implements MigrationInterface {
  name = 'CreateGeography1000000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE countries (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        iso_code CHAR(2) NOT NULL,
        slug VARCHAR NOT NULL,
        default_locale VARCHAR(5) NOT NULL DEFAULT 'en',
        currency_code CHAR(3) NOT NULL DEFAULT 'EUR',
        timezone VARCHAR NOT NULL DEFAULT 'UTC',
        phone_prefix VARCHAR(6) NOT NULL DEFAULT '+0',
        date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        CONSTRAINT countries_iso_unique UNIQUE (iso_code),
        CONSTRAINT countries_slug_unique UNIQUE (slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE cities (
        id SERIAL PRIMARY KEY,
        country_id INTEGER NOT NULL REFERENCES countries(id),
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        plate_code VARCHAR,
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        seo_title VARCHAR,
        seo_description TEXT,
        seo_content TEXT,
        CONSTRAINT cities_slug_unique UNIQUE (slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE districts (
        id SERIAL PRIMARY KEY,
        city_id INTEGER NOT NULL REFERENCES cities(id),
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        CONSTRAINT districts_slug_city_unique UNIQUE (city_id, slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE neighborhoods (
        id SERIAL PRIMARY KEY,
        district_id INTEGER NOT NULL REFERENCES districts(id),
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        postal_code VARCHAR,
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        CONSTRAINT neighborhoods_slug_district_unique UNIQUE (district_id, slug)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_cities_country_id ON cities(country_id)`);
    await queryRunner.query(`CREATE INDEX idx_districts_city_id ON districts(city_id)`);
    await queryRunner.query(`CREATE INDEX idx_neighborhoods_district_id ON neighborhoods(district_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS neighborhoods`);
    await queryRunner.query(`DROP TABLE IF EXISTS districts`);
    await queryRunner.query(`DROP TABLE IF EXISTS cities`);
    await queryRunner.query(`DROP TABLE IF EXISTS countries`);
  }
}
