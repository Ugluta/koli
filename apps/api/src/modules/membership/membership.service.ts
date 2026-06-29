import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MembershipPlan, MembershipPlanName } from './entities/membership-plan.entity';
import { MembershipSubscription, SubscriptionStatus } from './entities/membership-subscription.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(MembershipPlan) private plansRepo: Repository<MembershipPlan>,
    @InjectRepository(MembershipSubscription) private subsRepo: Repository<MembershipSubscription>,
    private dataSource: DataSource,
  ) {}

  async findAllPlans() {
    const plans = await this.plansRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
    // numeric columns come back as strings from pg — normalise to numbers for the client
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      priceMonthly: Number(p.priceMonthly),
      priceYearly: Number(p.priceYearly),
      priceOnetime: Number(p.priceOnetime),
      maxProducts: p.maxProducts,
      maxServices: p.maxServices,
      maxImages: p.maxImages,
      maxCampaigns: p.maxCampaigns,
      canUploadVideo: p.canUploadVideo,
      canAddFiles: p.canAddFiles,
      canUseWhatsapp: p.canUseWhatsapp,
      canAppearFeatured: p.canAppearFeatured,
      analyticsDays: p.analyticsDays,
      sortOrder: p.sortOrder,
    }));
  }

  async getOrCreateSubscription(businessId: string): Promise<MembershipSubscription> {
    let sub = await this.subsRepo.findOne({
      where: { businessId },
      relations: ['plan'],
    });
    if (!sub) {
      const freePlan = await this.plansRepo.findOneOrFail({ where: { name: MembershipPlanName.FREE } });
      sub = await this.subsRepo.save(this.subsRepo.create({
        businessId,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
      }));
      sub = await this.subsRepo.findOneOrFail({ where: { businessId }, relations: ['plan'] });
    }
    return sub;
  }

  async checkLimit(
    businessId: string,
    resource: 'products' | 'services' | 'images' | 'campaigns',
    currentCount: number,
  ): Promise<void> {
    const sub = await this.getOrCreateSubscription(businessId);
    const plan = sub.plan;
    const limits: Record<string, number> = {
      products: plan.maxProducts,
      services: plan.maxServices,
      images: plan.maxImages,
      campaigns: plan.maxCampaigns,
    };
    const limit = limits[resource] ?? 0;
    if (currentCount >= limit) {
      throw new ForbiddenException(
        `${resource} limit reached (${limit}). Upgrade your plan to add more.`,
      );
    }
  }

  async getSubscriptionForUser(userId: string): Promise<MembershipSubscription | null> {
    const rows = await this.dataSource.query(
      `SELECT id FROM businesses WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at LIMIT 1`,
      [userId],
    );
    if (!rows.length) return null;
    return this.getOrCreateSubscription(rows[0].id);
  }

  async checkFeature(businessId: string, feature: 'video' | 'files' | 'whatsapp' | 'featured'): Promise<void> {
    const sub = await this.getOrCreateSubscription(businessId);
    const plan = sub.plan;
    const features: Record<string, boolean> = {
      video: plan.canUploadVideo,
      files: plan.canAddFiles,
      whatsapp: plan.canUseWhatsapp,
      featured: plan.canAppearFeatured,
    };
    if (!features[feature]) {
      throw new ForbiddenException(`Feature '${feature}' is not available on your current plan.`);
    }
  }
}
