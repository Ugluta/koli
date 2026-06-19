import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { ScraperSource } from './entities/scraper-source.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('scraper')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // ──── Sources ──────────────────────────────────────────────────────────

  @Get('sources')
  listSources(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.scraperService.listSources(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('sources')
  createSource(@Body() dto: Partial<ScraperSource>) {
    return this.scraperService.createSource(dto);
  }

  @Patch('sources/:id')
  updateSource(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<ScraperSource>) {
    return this.scraperService.updateSource(id, dto);
  }

  @Delete('sources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSource(@Param('id', ParseUUIDPipe) id: string) {
    return this.scraperService.deleteSource(id);
  }

  /** Manually trigger a fetch for one source */
  @Post('sources/:id/fetch')
  fetchNow(@Param('id', ParseUUIDPipe) id: string) {
    return this.scraperService.fetchSource(id);
  }

  // ──── Review queue ─────────────────────────────────────────────────────

  @Get('queue')
  listQueue(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.scraperService.listPending(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('queue/:id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.scraperService.approveItem(id, req.user.userId);
  }

  @Post('queue/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body('reason') reason?: string,
  ) {
    return this.scraperService.rejectItem(id, req.user.userId, reason);
  }
}
