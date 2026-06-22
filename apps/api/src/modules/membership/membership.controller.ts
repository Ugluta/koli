import { Controller, Get, Param, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MembershipService } from './membership.service';

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(private membershipService: MembershipService) {}

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
  forBusiness(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.membershipService.getOrCreateSubscription(businessId);
  }
}
