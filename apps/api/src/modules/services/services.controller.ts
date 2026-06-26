import { Controller, Get, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Firmaya ait hizmetleri listele' })
  @ApiQuery({ name: 'businessId', required: true })
  findByBusiness(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.service.findByBusiness(businessId);
  }
}
