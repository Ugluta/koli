import { Controller, Get, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Firmaya ait yayındaki hizmetleri listele (public)' })
  @ApiQuery({ name: 'businessId', required: true })
  findByBusiness(@Query('businessId', ParseUUIDPipe) businessId: string) {
    return this.service.findByBusiness(businessId);
  }
}
