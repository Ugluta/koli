import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPlan } from './entities/membership-plan.entity';
import { MembershipSubscription } from './entities/membership-subscription.entity';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipPlan, MembershipSubscription])],
  providers: [MembershipService],
  controllers: [MembershipController],
  exports: [MembershipService],
})
export class MembershipModule {}
