import {
  Controller, Get, Post, Patch, Body, Param, Query,
  ParseUUIDPipe, UseGuards, Req, Res, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AdsService } from './ads.service';
import { AdCampaign, AdPlacement, AdStatus } from './entities/ad-campaign.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  /** Public: get the best ad for a placement */
  @Get('serve')
  serve(
    @Query('placement') placement: AdPlacement,
    @Query('cityId') cityId?: string,
  ) {
    return this.adsService.serveAd(placement, cityId);
  }

  /** Public: track impression (fire-and-forget) */
  @Post('impression/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  trackImpression(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Query('cityId') cityId?: string,
  ) {
    const ip = req.ip ?? req.headers['x-forwarded-for'] ?? '0.0.0.0';
    const ua = req.headers['user-agent'];
    return this.adsService.trackImpression(id, ip, ua, cityId);
  }

  /** Public: click redirect */
  @Get('click/:id')
  async trackClick(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: FastifyReply,
  ) {
    const ip = req.ip ?? req.headers['x-forwarded-for'] ?? '0.0.0.0';
    const ua = req.headers['user-agent'];
    const ctaUrl = await this.adsService.trackClick(id, ip, ua);
    res.redirect(302, ctaUrl);
  }

  // ──── Advertiser endpoints ─────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: Partial<AdCampaign>, @Req() req: any) {
    return this.adsService.createCampaign(dto, req.user.userId);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  mine(@Req() req: any, @Query('page') page?: string) {
    return this.adsService.listMyCampaigns(req.user.userId, page ? parseInt(page, 10) : 1);
  }

  @Get('mine/:id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  myStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') days?: string,
  ) {
    return this.adsService.getStats(id, days ? parseInt(days, 10) : 30);
  }

  @Patch('mine/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<AdCampaign>,
    @Req() req: any,
  ) {
    return this.adsService.updateCampaign(id, dto, req.user.userId, false);
  }

  // ──── Admin endpoints ──────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  adminList(@Query('page') page?: string) {
    return this.adsService.listAllCampaigns(page ? parseInt(page, 10) : 1);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AdStatus,
  ) {
    return this.adsService.setStatus(id, status);
  }

  @Get('admin/:id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  adminStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') days?: string,
  ) {
    return this.adsService.getStats(id, days ? parseInt(days, 10) : 30);
  }
}
