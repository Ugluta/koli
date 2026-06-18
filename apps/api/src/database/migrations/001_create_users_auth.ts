import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAuth1000000000001 implements MigrationInterface {
  name = 'CreateUsersAuth1000000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM (
        'super_admin', 'city_admin', 'business', 'editor', 'viewer'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR NOT NULL,
        password_hash VARCHAR NOT NULL,
        role user_role_enum NOT NULL DEFAULT 'viewer',
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT users_email_unique UNIQUE (email)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        ip_address VARCHAR,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}
