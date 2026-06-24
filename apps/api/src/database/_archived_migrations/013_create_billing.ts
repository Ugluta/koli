import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBilling1700000013 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
      CREATE TYPE payment_provider_enum AS ENUM ('iyzico', 'stripe', 'manual');

      CREATE TABLE billing_invoices (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
        plan_id             UUID NOT NULL REFERENCES membership_plans(id),
        provider            payment_provider_enum NOT NULL DEFAULT 'iyzico',
        provider_payment_id VARCHAR(255),
        provider_order_id   VARCHAR(255),
        amount_cents        INTEGER NOT NULL,
        currency            CHAR(3) NOT NULL DEFAULT 'TRY',
        status              payment_status_enum NOT NULL DEFAULT 'pending',
        period_start        DATE,
        period_end          DATE,
        metadata            JSONB,
        paid_at             TIMESTAMPTZ,
        failed_at           TIMESTAMPTZ,
        failure_reason      VARCHAR(500),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE webhook_events (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider      payment_provider_enum NOT NULL,
        event_type    VARCHAR(100) NOT NULL,
        payload       JSONB NOT NULL,
        processed     BOOLEAN NOT NULL DEFAULT FALSE,
        error         TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_billing_invoices_user ON billing_invoices (user_id, created_at DESC);
      CREATE INDEX idx_billing_invoices_status ON billing_invoices (status, created_at DESC);
      CREATE INDEX idx_billing_invoices_provider ON billing_invoices (provider, provider_payment_id);
      CREATE INDEX idx_webhook_events_processed ON webhook_events (processed, created_at);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP TABLE IF EXISTS webhook_events;
      DROP TABLE IF EXISTS billing_invoices;
      DROP TYPE IF EXISTS payment_provider_enum;
      DROP TYPE IF EXISTS payment_status_enum;
    `);
  }
}
