import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdCampaign, AdStatus, AdPlacement } from './entities/ad-campaign.entity';
import * as crypto from 'crypto';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdCampaign) private campaignsRepo: Repository<AdCampaign>,
    private dataSource: DataSource,
  ) {}

  // ──── Public: serve an ad for a placement ────────────────────────────────

  async serveAd(placement: AdPlacement, cityId?: string): Promise<AdCampaign | null> {
    const now = new Date();
    const qb = this.campaignsRepo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: AdStatus.ACTIVE })
      .andWhere('c.placement = :placement', { placement })
      .andWhere('(c.starts_at IS NULL OR c.starts_at <= :now)', { now })
      .andWhere('(c.ends_at IS NULL OR c.ends_at >= :now)', { now })
      .andWhere('c.budget_cents > c.spent_cents');

    if (cityId) {
      qb.andWhere('(c.city_id IS NULL OR c.city_id = :cityId)', { cityId });
    }

    // weighted random by bid — higher bid = more likely to appear
    qb.orderBy('RANDOM() * c.bid_cents', 'DESC').limit(1);

    return qb.getOne();
  }

  // ──── Impression + click tracking ────────────────────────────────────────

  async trackImpression(campaignId: string, ip: string, userAgent?: string, cityId?: string): Promise<void> {
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO ad_events (campaign_id, event_type, ip_hash, user_agent, city_id)
         VALUES ($1, 'impression', $2, $3, $4)`,
        [campaignId, ipHash, userAgent?.substring(0, 500) ?? null, cityId ?? null],
      );
      await manager.query(
        `UPDATE ad_campaigns SET impression_count = impression_count + 1,
         spent_cents = spent_cents + CASE WHEN target_type = 'cpm' THEN ROUND(bid_cents::numeric / 1000) ELSE 0 END
         WHERE id = $1`,
        [campaignId],
      );
      // upsert daily stat
      const today = new Date().toISOString().substring(0, 10);
      await manager.query(
        `INSERT INTO ad_daily_stats (campaign_id, stat_date, impressions, spent_cents)
         VALUES ($1, $2, 1, CASE WHEN (SELECT target_type FROM ad_campaigns WHERE id = $1) = 'cpm'
           THEN (SELECT ROUND(bid_cents::numeric / 1000) FROM ad_campaigns WHERE id = $1) ELSE 0 END)
         ON CONFLICT (campaign_id, stat_date)
         DO UPDATE SET impressions = ad_daily_stats.impressions + 1,
           spent_cents = ad_daily_stats.spent_cents + EXCLUDED.spent_cents`,
        [campaignId, today],
      );
    });
  }

  async trackClick(campaignId: string, ip: string, userAgent?: string): Promise<string> {
    const campaign = await this.campaignsRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    const today = new Date().toISOString().substring(0, 10);
    const cpcCost = campaign.targetType === 'cpc' ? campaign.bidCents : 0;

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO ad_events (campaign_id, event_type, ip_hash, user_agent)
         VALUES ($1, 'click', $2, $3)`,
        [campaignId, ipHash, userAgent?.substring(0, 500) ?? null],
      );
      await manager.query(
        `UPDATE ad_campaigns SET click_count = click_count + 1, spent_cents = spent_cents + $2 WHERE id = $1`,
        [campaignId, cpcCost],
      );
      await manager.query(
        `INSERT INTO ad_daily_stats (campaign_id, stat_date, clicks, spent_cents)
         VALUES ($1, $2, 1, $3)
         ON CONFLICT (campaign_id, stat_date)
         DO UPDATE SET clicks = ad_daily_stats.clicks + 1,
           spent_cents = ad_daily_stats.spent_cents + EXCLUDED.spent_cents`,
        [campaignId, today, cpcCost],
      );
    });

    return campaign.ctaUrl;
  }

  // ──── Campaign CRUD (advertiser / admin) ─────────────────────────────────

  async createCampaign(dto: Partial<AdCampaign>, advertiserId: string): Promise<AdCampaign> {
    const campaign = this.campaignsRepo.create({ ...dto, advertiserId, status: AdStatus.DRAFT });
    return this.campaignsRepo.save(campaign);
  }

  async listMyCampaigns(advertiserId: string, page = 1, limit = 20) {
    const [data, total] = await this.campaignsRepo.findAndCount({
      where: { advertiserId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async listAllCampaigns(page = 1, limit = 20) {
    const [data, total] = await this.campaignsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async updateCampaign(id: string, dto: Partial<AdCampaign>, requesterId: string, isAdmin: boolean): Promise<AdCampaign> {
    const campaign = await this.campaignsRepo.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (!isAdmin && campaign.advertiserId !== requesterId) throw new ForbiddenException();
    await this.campaignsRepo.update(id, dto);
    return this.campaignsRepo.findOneOrFail({ where: { id } });
  }

  async setStatus(id: string, status: AdStatus): Promise<void> {
    await this.campaignsRepo.update(id, { status });
  }

  async getStats(campaignId: string, days = 30) {
    const rows = await this.dataSource.query(
      `SELECT stat_date AS date, impressions, clicks, spent_cents AS "spentCents"
       FROM ad_daily_stats
       WHERE campaign_id = $1 AND stat_date >= CURRENT_DATE - $2
       ORDER BY stat_date ASC`,
      [campaignId, days],
    );
    const totals = rows.reduce(
      (acc: any, r: any) => ({
        impressions: acc.impressions + r.impressions,
        clicks: acc.clicks + r.clicks,
        spentCents: acc.spentCents + parseInt(r.spentCents, 10),
      }),
      { impressions: 0, clicks: 0, spentCents: 0 },
    );
    return { daily: rows, totals };
  }

  // ──── Daily rollup cron ───────────────────────────────────────────────────

  /** Pause campaigns that have exhausted their budget */
  @Cron(CronExpression.EVERY_HOUR)
  async pauseExhaustedCampaigns() {
    await this.campaignsRepo.query(
      `UPDATE ad_campaigns SET status = 'ended'
       WHERE status = 'active' AND budget_cents > 0 AND spent_cents >= budget_cents`,
    );
    // Also end past end_date campaigns
    await this.campaignsRepo.query(
      `UPDATE ad_campaigns SET status = 'ended'
       WHERE status = 'active' AND ends_at IS NOT NULL AND ends_at < NOW()`,
    );
  }
}
