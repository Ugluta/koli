import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { ScraperScheduler } from './scraper.scheduler';
import { ScraperSource } from './entities/scraper-source.entity';
import { ScraperItem } from './entities/scraper-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScraperSource, ScraperItem]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ScraperController],
  providers: [ScraperService, ScraperScheduler],
  exports: [ScraperService],
})
export class ScraperModule {}
