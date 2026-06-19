import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GeographyService } from './geography.service';

@ApiTags('geography')
@Controller()
export class GeographyController {
  constructor(private geo: GeographyService) {}

  @Public()
  @Get('countries')
  @ApiOperation({ summary: 'List all active countries' })
  countries() {
    return this.geo.findAllCountries();
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List cities, optionally filtered by country slug' })
  @ApiQuery({ name: 'country', required: false })
  cities(@Query('country') country?: string) {
    return this.geo.findAllCities(country);
  }

  @Public()
  @Get('cities/:slug')
  @ApiOperation({ summary: 'Get city by slug' })
  city(@Param('slug') slug: string) {
    return this.geo.findCityBySlug(slug);
  }

  @Public()
  @Get('cities/:slug/districts')
  @ApiOperation({ summary: 'Get districts of a city' })
  districts(@Param('slug') slug: string) {
    return this.geo.findDistrictsByCity(slug);
  }
}
