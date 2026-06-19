import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoRedirect } from './entities/seo-redirect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeoRedirect])],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
