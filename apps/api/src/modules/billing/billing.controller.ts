import {
  Controller, Post, Get, Body, Query, Req,
  UseGuards, HttpCode, HttpStatus, Res, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { BillingCycle } from '../../common/enums/billing-cycle.enum';
import { ConfigService } from '@nestjs/config';
import { IsUUID, IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class InitUpgradeDto {
  @IsUUID() businessId: string;
  @IsInt() @Min(1) @Type(() => Number) planId: number;
  @IsOptional() @IsEnum(BillingCycle) cycle?: BillingCycle;
}

class ManualUpgradeDto {
  @IsUUID() businessId: string;
  @IsInt() @Min(1) @Type(() => Number) planId: number;
}

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly businessesService: BusinessesService,
    private readonly config: ConfigService,
  ) {}

  /** Start checkout — returns iyzico 3DS HTML form */
  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async initUpgrade(
    @Body() body: InitUpgradeDto,
    @Req() req: any,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(body.businessId, user.id);
    const cycle = body.cycle && Object.values(BillingCycle).includes(body.cycle) ? body.cycle : BillingCycle.MONTHLY;
    return this.billingService.initUpgrade({
      userId: user.id,
      businessId: body.businessId,
      planId: Number(body.planId),
      cycle,
      userEmail: user.email,
      userName: user.email?.split('@')[0] ?? 'Kullanıcı',
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
  myInvoices(@CurrentUser() user: User, @Query('page') page?: string) {
    return this.billingService.myInvoices(user.id, page ? parseInt(page, 10) : 1);
  }

  /** Admin: list all invoices */
  @Get('admin/invoices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  allInvoices(@Query('page') page?: string) {
    return this.billingService.allInvoices(page ? parseInt(page, 10) : 1);
  }

  /** Admin: manual plan upgrade */
  @Post('admin/upgrade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  manualUpgrade(
    @Body() body: ManualUpgradeDto,
    @CurrentUser() admin: User,
  ) {
    return this.billingService.manualUpgrade(body.businessId, Number(body.planId), admin.id);
  }
}
