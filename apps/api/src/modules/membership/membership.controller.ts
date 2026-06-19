import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
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
}
