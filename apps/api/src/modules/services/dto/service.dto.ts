import { IsString, IsOptional, IsNumber, IsEnum, IsInt, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceStatus } from '../entities/service.entity';

export class CreateServiceDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) priceMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) priceMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() priceUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) durationMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
}

export class UpdateServiceDto extends CreateServiceDto {
  @ApiPropertyOptional({ enum: ServiceStatus }) @IsOptional() @IsEnum(ServiceStatus) status?: ServiceStatus;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
}
