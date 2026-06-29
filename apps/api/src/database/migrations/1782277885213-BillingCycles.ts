import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingCycles1782277885213 implements MigrationInterface {
  name = 'BillingCycles1782277885213';

  async up(queryRunner: QueryRunner): Promise<void> {
    // One-time (lifetime) price column on plans
    await queryRunner.query(
      `ALTER TABLE "membership_plans" ADD COLUMN IF NOT EXISTS "price_onetime" numeric(10,2) NOT NULL DEFAULT 0`,
    );

    // Seed lifetime prices (~3x yearly) for paid plans
    await queryRunner.query(`UPDATE "membership_plans" SET "price_onetime" = 5970  WHERE "name" = 'standard'`);
    await queryRunner.query(`UPDATE "membership_plans" SET "price_onetime" = 14970 WHERE "name" = 'premium'`);
    await queryRunner.query(`UPDATE "membership_plans" SET "price_onetime" = 29970 WHERE "name" = 'enterprise'`);

    // Billing cycle enum + columns
    await queryRunner.query(
      `DO $$ BEGIN
         CREATE TYPE "public"."billing_cycle_enum" AS ENUM('monthly', 'yearly', 'one_time');
       EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "billing_invoices" ADD COLUMN IF NOT EXISTS "billing_cycle" "public"."billing_cycle_enum" NOT NULL DEFAULT 'monthly'`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership_subscriptions" ADD COLUMN IF NOT EXISTS "billing_cycle" "public"."billing_cycle_enum"`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "membership_subscriptions" DROP COLUMN IF EXISTS "billing_cycle"`);
    await queryRunner.query(`ALTER TABLE "billing_invoices" DROP COLUMN IF EXISTS "billing_cycle"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."billing_cycle_enum"`);
    await queryRunner.query(`ALTER TABLE "membership_plans" DROP COLUMN IF EXISTS "price_onetime"`);
  }
}
