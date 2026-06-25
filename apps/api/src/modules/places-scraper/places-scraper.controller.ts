import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { PlacesScraperService, ScrapeJobResult } from './places-scraper.service';

class StartScrapeDto {
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsArray()
  @IsString({ each: true })
  cities: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  categoryIds?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxPerQuery?: number;
}

@ApiTags('Admin / Places Scraper')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin/places-scraper')
export class PlacesScraperController {
  constructor(private readonly service: PlacesScraperService) {}

  @Post('run')
  @ApiOperation({ summary: 'Google Places üzerinden işletme içe aktar' })
  async run(@Body() dto: StartScrapeDto): Promise<ScrapeJobResult> {
    return this.service.run({
      keywords: dto.keywords,
      cities: dto.cities,
      categoryIds: dto.categoryIds ?? [],
      maxPerQuery: dto.maxPerQuery ?? 60,
    });
  }
}
