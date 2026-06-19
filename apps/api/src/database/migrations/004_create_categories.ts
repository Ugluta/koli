import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1000000000004 implements MigrationInterface {
  name = 'CreateCategories1000000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS ltree`);

    await queryRunner.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL,
        icon_url VARCHAR,
        cover_url VARCHAR,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        depth INTEGER NOT NULL DEFAULT 0,
        path ltree NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT categories_slug_unique UNIQUE (slug)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE category_closure (
        ancestor_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        descendant_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        depth INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (ancestor_id, descendant_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_categories_path ON categories USING GIST(path)`);
    await queryRunner.query(`CREATE INDEX idx_categories_parent_id ON categories(parent_id)`);
    await queryRunner.query(`CREATE INDEX idx_category_closure_descendant ON category_closure(descendant_id)`);
    await queryRunner.query(`CREATE INDEX idx_category_closure_ancestor ON category_closure(ancestor_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS category_closure`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
  }
}
