import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessLocation } from './entities/business-location.entity';
import { BusinessHours } from './entities/business-hours.entity';
import { BusinessSocialLink } from './entities/business-social-link.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesController } from './businesses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessLocation, BusinessHours, BusinessSocialLink])],
  providers: [BusinessesService],
  controllers: [BusinessesController],
  exports: [BusinessesService],
})
export class BusinessesModule {}
