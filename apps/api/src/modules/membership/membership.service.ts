import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan, MembershipPlanName } from './entities/membership-plan.entity';
import { MembershipSubscription, SubscriptionStatus } from './entities/membership-subscription.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(MembershipPlan) private plansRepo: Repository<MembershipPlan>,
    @InjectRepository(MembershipSubscription) private subsRepo: Repository<MembershipSubscription>,
  ) {}

  findAllPlans() {
    return this.plansRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
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
