import { Module } from '@nestjs/common';
import { PanelController } from './panel.controller';
import { BusinessesModule } from '../businesses/businesses.module';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { MembershipModule } from '../membership/membership.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [BusinessesModule, ProductsModule, ServicesModule, MembershipModule, MediaModule],
  controllers: [PanelController],
})
export class PanelModule {}
