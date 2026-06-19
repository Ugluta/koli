import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { ProductsService } from '../products/products.service';
import { ServicesService } from '../services/services.service';
import { MembershipService } from '../membership/membership.service';
import { MediaService } from '../media/media.service';
import { BusinessMedia } from '../businesses/entities/business-media.entity';
import { CreateProductDto, UpdateProductDto } from '../products/dto/product.dto';
import { CreateServiceDto, UpdateServiceDto } from '../services/dto/service.dto';

class PresignedUploadDto {
  folder: string;
  filename: string;
  mimeType: string;
}

class ReorderDto {
  items: { id: string; sortOrder: number }[];
}

class AddGalleryItemDto {
  url: string;
  mimeType?: string;
  fileSize?: number;
  altText?: string;
}

@ApiTags('panel')
@ApiBearerAuth()
@Controller('panel/businesses/:businessId')
export class PanelController {
  constructor(
    private businessesService: BusinessesService,
    private productsService: ProductsService,
    private servicesService: ServicesService,
    private membershipService: MembershipService,
    private mediaService: MediaService,
    @InjectRepository(BusinessMedia) private galleryRepo: Repository<BusinessMedia>,
  ) {}

  // ── Stats ──────────────────────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Business stats overview' })
  async stats(@Param('businessId', ParseUUIDPipe) businessId: string, @CurrentUser() user: User) {
    const business = await this.businessesService.findById(businessId, user.id);
    return {
      viewCount: business.viewCount,
      clickCount: business.clickCount,
      ratingAvg: business.ratingAvg,
      ratingCount: business.ratingCount,
    };
  }

  // ── Membership ────────────────────────────────────────────────────
  @Get('membership')
  @ApiOperation({ summary: 'Get current membership plan' })
  getMembership(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.membershipService.getOrCreateSubscription(businessId);
  }

  // ── Products ──────────────────────────────────────────────────────
  @Get('products')
  @ApiOperation({ summary: 'List business products' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getProducts(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findByBusiness(businessId, cursor, limit);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product (checks membership limit)' })
  async createProduct(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    const { data } = await this.productsService.findByBusiness(businessId);
    await this.membershipService.checkLimit(businessId, 'products', data.length);
    return this.productsService.create(businessId, dto);
  }

  @Patch('products/:productId')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    return this.productsService.update(productId, businessId, dto);
  }

  @Delete('products/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive product' })
  async deleteProduct(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    await this.productsService.remove(productId, businessId);
  }

  @Patch('products/reorder')
  @ApiOperation({ summary: 'Reorder products' })
  async reorderProducts(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: ReorderDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    await this.productsService.reorder(businessId, dto.items);
  }

  // ── Services ──────────────────────────────────────────────────────
  @Get('services')
  @ApiOperation({ summary: 'List business services' })
  getServices(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.servicesService.findByBusiness(businessId);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create service (checks membership limit)' })
  async createService(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: CreateServiceDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    const services = await this.servicesService.findByBusiness(businessId);
    await this.membershipService.checkLimit(businessId, 'services', services.length);
    return this.servicesService.create(businessId, dto);
  }

  @Patch('services/:serviceId')
  @ApiOperation({ summary: 'Update service' })
  async updateService(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    return this.servicesService.update(serviceId, businessId, dto);
  }

  @Delete('services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive service' })
  async deleteService(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    await this.servicesService.remove(serviceId, businessId);
  }

  // ── Gallery ───────────────────────────────────────────────────────
  @Get('gallery')
  @ApiOperation({ summary: 'List business gallery images' })
  async getGallery(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.galleryRepo.find({ where: { businessId }, order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  @Post('gallery')
  @ApiOperation({ summary: 'Add confirmed upload to gallery' })
  async addGalleryItem(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: AddGalleryItemDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    await this.membershipService.checkLimit(businessId, 'images', await this.galleryRepo.countBy({ businessId }));
    return this.galleryRepo.save(this.galleryRepo.create({ businessId, ...dto }));
  }

  @Delete('gallery/:mediaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete gallery item' })
  async deleteGalleryItem(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    await this.galleryRepo.delete({ id: mediaId, businessId });
  }

  // ── Media Upload ──────────────────────────────────────────────────
  @Post('media/presign')
  @ApiOperation({ summary: 'Get presigned S3 upload URL' })
  async presignUpload(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: PresignedUploadDto,
    @CurrentUser() user: User,
  ) {
    await this.businessesService.assertOwner(businessId, user.id);
    return this.mediaService.generatePresignedUpload(
      businessId,
      dto.folder ?? 'uploads',
      dto.filename,
      dto.mimeType,
    );
  }
}
