import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Firmaya ait ürünleri listele' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findByBusiness(
    @Query('businessId', ParseUUIDPipe) businessId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findByBusiness(businessId, cursor, limit ? parseInt(limit) : 20);
  }
}
