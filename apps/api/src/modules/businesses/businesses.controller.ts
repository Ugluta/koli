import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List businesses with cursor pagination' })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.businessesService.findAll({ citySlug: city, categorySlug: category, q, cursor, limit });
  }

  @Public()
  @Get(':businessId/gallery')
  @ApiOperation({ summary: 'List business gallery images (public)' })
  getGallery(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.businessesService.findGallery(businessId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get business detail by slug' })
  async findOne(@Param('slug') slug: string) {
    const business = await this.businessesService.findBySlug(slug);
    this.businessesService.incrementViewCount(business.id).catch(() => null);
    return business;
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new business listing' })
  create(@Body() dto: CreateBusinessDto, @CurrentUser() user: User) {
    return this.businessesService.create(dto, user.id);
  }
}
