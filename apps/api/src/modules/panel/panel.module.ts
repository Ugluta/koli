import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanelController, PanelBusinessListController } from './panel.controller';
import { BusinessesModule } from '../businesses/businesses.module';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { MembershipModule } from '../membership/membership.module';
import { MediaModule } from '../media/media.module';
import { BusinessMedia } from '../businesses/entities/business-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessMedia]),
    BusinessesModule, ProductsModule, ServicesModule, MembershipModule, MediaModule,
  ],
  controllers: [PanelController, PanelBusinessListController],
})
export class PanelModule {}
