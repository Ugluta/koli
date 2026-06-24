import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembership1000000000008 implements MigrationInterface {
  name = 'CreateMembership1000000000008';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE membership_plan_enum AS ENUM ('free','standard','premium','enterprise');
      CREATE TYPE subscription_status_enum AS ENUM ('trial','active','past_due','cancelled');
    `);

    await queryRunner.query(`
      CREATE TABLE membership_plans (
        id SERIAL PRIMARY KEY,
        name membership_plan_enum NOT NULL UNIQUE,
        display_name VARCHAR NOT NULL,
        price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
        price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
        max_products INTEGER NOT NULL DEFAULT 5,
        max_services INTEGER NOT NULL DEFAULT 3,
        max_images INTEGER NOT NULL DEFAULT 10,
        max_campaigns INTEGER NOT NULL DEFAULT 0,
        can_upload_video BOOLEAN NOT NULL DEFAULT FALSE,
        can_add_files BOOLEAN NOT NULL DEFAULT FALSE,
        can_use_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
        can_appear_featured BOOLEAN NOT NULL DEFAULT FALSE,
        analytics_days INTEGER NOT NULL DEFAULT 7,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE membership_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES membership_plans(id),
        status subscription_status_enum NOT NULL DEFAULT 'active',
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        payment_provider VARCHAR,
        external_subscription_id VARCHAR,
        plan_snapshot JSONB,
        CONSTRAINT membership_subscriptions_business_unique UNIQUE (business_id)
      )
    `);

    // Seed default plans
    await queryRunner.query(`
      INSERT INTO membership_plans
        (name, display_name, price_monthly, price_yearly, max_products, max_services, max_images, max_campaigns, can_upload_video, can_add_files, can_use_whatsapp, can_appear_featured, analytics_days, sort_order)
      VALUES
        ('free',       'Ücretsiz', 0,     0,      5,   3,   10,  0, false, false, false, false, 7,  1),
        ('standard',   'Standart', 199,   1990,   25,  10,  50,  1, false, false, true,  false, 30, 2),
        ('premium',    'Premium',  499,   4990,   100, 30,  200, 3, true,  true,  true,  true,  90, 3),
        ('enterprise', 'Kurumsal', 999,   9990,   999, 999, 999, 9, true,  true,  true,  true,  365,4)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS membership_subscriptions`);
    await queryRunner.query(`DROP TABLE IF EXISTS membership_plans`);
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS membership_plan_enum`);
  }
}
