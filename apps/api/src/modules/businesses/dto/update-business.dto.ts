import { IsString, IsOptional, IsEmail, IsUrl, MaxLength, IsInt, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusinessDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(300) shortDescription?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() phoneSecondary?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() coverUrl?: string;
  // location
  @IsOptional() @IsInt() @Type(() => Number) cityId?: number;
  @IsOptional() @IsInt() @Type(() => Number) districtId?: number;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
  // categories
  @IsOptional() @IsArray() @IsInt({ each: true }) categoryIds?: number[];
}
