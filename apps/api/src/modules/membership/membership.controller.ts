import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { MembershipService } from './membership.service';

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
  my(@Req() req: any) {
    return this.membershipService.getSubscriptionForUser(req.user.userId);
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
