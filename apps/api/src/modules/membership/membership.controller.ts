import { Controller, Get, Patch, Body, Param, ParseUUIDPipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { MembershipService } from './membership.service';

class UpdatePlanDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsNumber() @Type(() => Number) priceMonthly?: number;
  @IsOptional() @IsNumber() @Type(() => Number) priceYearly?: number;
  @IsOptional() @IsNumber() @Type(() => Number) priceOnetime?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxProducts?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxServices?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxImages?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) maxCampaigns?: number;
  @IsOptional() @IsBoolean() canUploadVideo?: boolean;
  @IsOptional() @IsBoolean() canAddFiles?: boolean;
  @IsOptional() @IsBoolean() canUseWhatsapp?: boolean;
  @IsOptional() @IsBoolean() canAppearFeatured?: boolean;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) analyticsDays?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(
    private membershipService: MembershipService,
    private businessesService: BusinessesService,
  ) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List all membership plans' })
  plans() {
    return this.membershipService.findAllPlans();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get caller's active subscription" })
  my(@CurrentUser() user: User) {
    return this.membershipService.getSubscriptionForUser(user.id);
  }

  // ──── Admin plan management ───────────────────────────────────────────────

  @Get('admin/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all plans incl. inactive (admin)' })
  adminPlans() {
    return this.membershipService.findAllPlansAdmin();
  }

  @Patch('admin/plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a plan (admin)' })
  updatePlan(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.membershipService.updatePlan(id, dto);
  }

  @Get('business/:businessId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async forBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    return this.membershipService.getOrCreateSubscription(businessId);
  }
}
