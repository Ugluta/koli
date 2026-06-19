import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ScraperSource, SourceStatus } from './entities/scraper-source.entity';
import { ScraperService } from './scraper.service';

@Injectable()
export class ScraperScheduler {
  private readonly logger = new Logger(ScraperScheduler.name);
  private running = new Set<string>();

  constructor(
    @InjectRepository(ScraperSource) private sourcesRepo: Repository<ScraperSource>,
    private scraperService: ScraperService,
  ) {}

  /** Every 15 minutes — check which sources are due and run them */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async runDueSources() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 5 * 60 * 1000); // at least 5 min ago

    const sources = await this.sourcesRepo.find({
      where: [
        { status: SourceStatus.ACTIVE, lastFetchedAt: LessThan(cutoff) },
        { status: SourceStatus.ACTIVE, lastFetchedAt: null as any },
      ],
    });

    for (const source of sources) {
      if (this.running.has(source.id)) continue;

      // Simple cron check — only run 6h/daily sources at the right time
      if (!this.isDue(source.cronExpr, source.lastFetchedAt)) continue;

      this.running.add(source.id);
      this.scraperService
        .fetchSource(source.id)
        .then(({ created, skipped }) => {
          this.logger.log(`[${source.name}] created=${created} skipped=${skipped}`);
        })
        .catch((err) => {
          this.logger.error(`[${source.name}] failed: ${err.message}`);
        })
        .finally(() => this.running.delete(source.id));
    }
  }

  private isDue(cronExpr: string, lastFetchedAt: Date | null): boolean {
    if (!lastFetchedAt) return true;
    const parts = cronExpr.trim().split(/\s+/);
    // parse interval from "0 */N * * *" → N hours
    const hoursPart = parts[1];
    if (hoursPart?.startsWith('*/')) {
      const every = parseInt(hoursPart.slice(2), 10);
      const msSince = Date.now() - lastFetchedAt.getTime();
      return msSince >= every * 3600 * 1000;
    }
    // daily "0 8 * * *" — run once if not fetched today
    const today = new Date().toDateString();
    return lastFetchedAt.toDateString() !== today;
  }
}
