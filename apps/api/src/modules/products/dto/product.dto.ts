import { IsString, IsOptional, IsNumber, IsEnum, IsInt, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus, StockStatus } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) priceMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) priceMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional({ enum: StockStatus }) @IsOptional() @IsEnum(StockStatus) stockStatus?: StockStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() sku?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) categoryId?: number;
}

export class UpdateProductDto extends CreateProductDto {
  @ApiPropertyOptional({ enum: ProductStatus }) @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}
