import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { MembershipPlan } from './membership-plan.entity';

export enum SubscriptionStatus { TRIAL='trial', ACTIVE='active', PAST_DUE='past_due', CANCELLED='cancelled' }

@Entity('membership_subscriptions')
export class MembershipSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'business_id', unique: true }) businessId: string;
  @ManyToOne(() => MembershipPlan, { eager: true }) @JoinColumn({ name: 'plan_id' }) plan: MembershipPlan;
  @Column({ name: 'plan_id' }) planId: number;
  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE }) status: SubscriptionStatus;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'expires_at', nullable: true, type: 'timestamptz' }) expiresAt: Date | null;
  @Column({ name: 'cancelled_at', nullable: true, type: 'timestamptz' }) cancelledAt: Date | null;
  @Column({ name: 'plan_snapshot', type: 'jsonb', nullable: true }) planSnapshot: Record<string, unknown> | null;
}
