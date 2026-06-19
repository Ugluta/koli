import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';
import { GeographyService } from './geography.service';
import { GeographyController } from './geography.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City, District])],
  providers: [GeographyService],
  controllers: [GeographyController],
  exports: [GeographyService],
})
export class GeographyModule {}
