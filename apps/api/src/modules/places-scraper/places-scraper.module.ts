import { Module } from '@nestjs/common';
import { PlacesScraperController } from './places-scraper.controller';
import { PlacesScraperService } from './places-scraper.service';

@Module({
  controllers: [PlacesScraperController],
  providers: [PlacesScraperService],
  exports: [PlacesScraperService],
})
export class PlacesScraperModule {}
