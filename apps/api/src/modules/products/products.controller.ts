import { Controller, Get, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Firmaya ait yayındaki ürünleri listele (public)' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findByBusiness(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByBusiness(businessId, cursor, limit ? parseInt(limit) : 20, true);
  }
}
