import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1000000000002 implements MigrationInterface {
  name = 'CreateAuditLogs1000000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR NOT NULL,
        entity_type VARCHAR NOT NULL,
        entity_id UUID,
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id)`);
    await queryRunner.query(`CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
  }
}
