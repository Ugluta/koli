import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus { PENDING = 'pending', PAID = 'paid', FAILED = 'failed', REFUNDED = 'refunded', CANCELLED = 'cancelled' }
export enum PaymentProvider { IYZICO = 'iyzico', STRIPE = 'stripe', MANUAL = 'manual' }

@Entity('billing_invoices')
export class BillingInvoice {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ name: 'business_id', nullable: true, type: 'varchar' }) businessId: string | null;
  @Column({ name: 'plan_id' }) planId: string;
  @Column({ type: 'enum', enum: PaymentProvider, default: PaymentProvider.IYZICO }) provider: PaymentProvider;
  @Column({ name: 'provider_payment_id', nullable: true, type: 'varchar' }) providerPaymentId: string | null;
  @Column({ name: 'provider_order_id', nullable: true, type: 'varchar' }) providerOrderId: string | null;
  @Column({ name: 'amount_cents' }) amountCents: number;
  @Column({ length: 3, default: 'TRY' }) currency: string;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) status: PaymentStatus;
  @Column({ name: 'period_start', type: 'date', nullable: true }) periodStart: string | null;
  @Column({ name: 'period_end', type: 'date', nullable: true }) periodEnd: string | null;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any> | null;
  @Column({ name: 'paid_at', nullable: true, type: 'timestamptz' }) paidAt: Date | null;
  @Column({ name: 'failed_at', nullable: true, type: 'timestamptz' }) failedAt: Date | null;
  @Column({ name: 'failure_reason', nullable: true, type: 'varchar' }) failureReason: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
