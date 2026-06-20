import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailVerification1720000015000 implements MigrationInterface {
  async up(qr: QueryRunner) {
    await qr.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS email_verify_token TEXT,
        ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
        ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;
    `);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_users_email_verify_token ON users(email_verify_token) WHERE email_verify_token IS NOT NULL`);
    await qr.query(`CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token) WHERE password_reset_token IS NOT NULL`);
  }

  async down(qr: QueryRunner) {
    await qr.query(`ALTER TABLE users DROP COLUMN IF EXISTS email_verified, DROP COLUMN IF EXISTS email_verify_token, DROP COLUMN IF EXISTS email_verify_expires, DROP COLUMN IF EXISTS password_reset_token, DROP COLUMN IF EXISTS password_reset_expires`);
  }
}
