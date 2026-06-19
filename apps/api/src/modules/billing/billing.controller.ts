import {
  Controller, Post, Get, Body, Query, Req,
  UseGuards, HttpCode, HttpStatus, Res, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly config: ConfigService,
  ) {}

  /** Start checkout — returns iyzico 3DS HTML form */
  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async initUpgrade(
    @Body() body: { businessId: string; planId: string; planName: string; amountCents: number },
    @Req() req: any,
  ) {
    const user = req.user;
    return this.billingService.initUpgrade({
      userId: user.userId,
      businessId: body.businessId,
      planId: body.planId,
      planName: body.planName,
      amountCents: body.amountCents,
      userEmail: user.email,
      userName: user.email.split('@')[0],
      ip: req.ip ?? '0.0.0.0',
    });
  }

  /** iyzico posts back here after 3DS */
  @Post('callback/iyzico')
  @HttpCode(HttpStatus.OK)
  async iyzicoCallback(@Body('token') token: string, @Res() res: FastifyReply) {
    const siteUrl = this.config.get('SITE_URL', 'https://koli.app');
    const result = await this.billingService.handleIyzicoCallback(token);
    const redirect = result.success
      ? `${siteUrl}/panel/uyelik?success=1`
      : `${siteUrl}/panel/uyelik?error=payment_failed`;
    res.redirect(302, redirect);
  }

  /** My invoice history */
  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  myInvoices(@Req() req: any, @Query('page') page?: string) {
    return this.billingService.myInvoices(req.user.userId, page ? parseInt(page, 10) : 1);
  }

  /** Admin: list all invoices */
  @Get('admin/invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  allInvoices(@Query('page') page?: string) {
    return this.billingService.allInvoices(page ? parseInt(page, 10) : 1);
  }

  /** Admin: manual plan upgrade */
  @Post('admin/upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  manualUpgrade(
    @Body() body: { businessId: string; planId: string },
    @Req() req: any,
  ) {
    return this.billingService.manualUpgrade(body.businessId, body.planId, req.user.userId);
  }
}
