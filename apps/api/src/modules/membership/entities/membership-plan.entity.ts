import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum MembershipPlanName {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'enum', enum: MembershipPlanName, unique: true }) name: MembershipPlanName;
  @Column({ name: 'display_name' }) displayName: string;
  @Column({ name: 'price_monthly', type: 'numeric', precision: 10, scale: 2, default: 0 }) priceMonthly: number;
  @Column({ name: 'price_yearly', type: 'numeric', precision: 10, scale: 2, default: 0 }) priceYearly: number;
  @Column({ name: 'max_products', default: 5 }) maxProducts: number;
  @Column({ name: 'max_services', default: 3 }) maxServices: number;
  @Column({ name: 'max_images', default: 10 }) maxImages: number;
  @Column({ name: 'max_campaigns', default: 0 }) maxCampaigns: number;
  @Column({ name: 'can_upload_video', default: false }) canUploadVideo: boolean;
  @Column({ name: 'can_add_files', default: false }) canAddFiles: boolean;
  @Column({ name: 'can_use_whatsapp', default: false }) canUseWhatsapp: boolean;
  @Column({ name: 'can_appear_featured', default: false }) canAppearFeatured: boolean;
  @Column({ name: 'analytics_days', default: 7 }) analyticsDays: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
}
