import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AdStatus { DRAFT = 'draft', ACTIVE = 'active', PAUSED = 'paused', ENDED = 'ended', REJECTED = 'rejected' }
export enum AdPlacement {
  CITY_TOP_BANNER = 'city_top_banner',
  CITY_SIDEBAR = 'city_sidebar',
  BUSINESS_LIST_INLINE = 'business_list_inline',
  BUSINESS_DETAIL_SIDEBAR = 'business_detail_sidebar',
  POST_DETAIL_INLINE = 'post_detail_inline',
  HOMEPAGE_HERO = 'homepage_hero',
}
export enum AdTargetType { CPM = 'cpm', CPC = 'cpc', FLAT = 'flat' }

@Entity('ad_campaigns')
export class AdCampaign {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'advertiser_id' }) advertiserId: string;
  @Column({ name: 'business_id', nullable: true }) businessId: string | null;
  @Column() name: string;
  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.DRAFT }) status: AdStatus;
  @Column({ type: 'enum', enum: AdPlacement }) placement: AdPlacement;
  @Column({ name: 'target_type', type: 'enum', enum: AdTargetType, default: AdTargetType.CPM }) targetType: AdTargetType;
  @Column({ name: 'budget_cents', default: 0 }) budgetCents: number;
  @Column({ name: 'spent_cents', default: 0 }) spentCents: number;
  @Column({ name: 'bid_cents', default: 0 }) bidCents: number;
  @Column({ nullable: true }) title: string | null;
  @Column({ nullable: true }) description: string | null;
  @Column({ name: 'image_url', nullable: true }) imageUrl: string | null;
  @Column({ name: 'cta_url' }) ctaUrl: string;
  @Column({ name: 'city_id', nullable: true }) cityId: string | null;
  @Column({ name: 'category_id', nullable: true }) categoryId: string | null;
  @Column({ name: 'starts_at', nullable: true }) startsAt: Date | null;
  @Column({ name: 'ends_at', nullable: true }) endsAt: Date | null;
  @Column({ name: 'daily_cap_cents', nullable: true }) dailyCapCents: number | null;
  @Column({ name: 'impression_count', type: 'bigint', default: 0 }) impressionCount: number;
  @Column({ name: 'click_count', type: 'bigint', default: 0 }) clickCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
