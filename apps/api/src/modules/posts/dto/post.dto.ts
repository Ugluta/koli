import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsArray, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostType, PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ enum: PostType }) @IsEnum(PostType) postType: PostType;
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() publishedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() eventStartAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() eventEndAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eventLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(70) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoKeywords?: string;
  @ApiPropertyOptional({ type: [Number] }) @IsOptional() @IsArray() @IsInt({ each: true }) @Type(() => Number) cityIds?: number[];
  @ApiPropertyOptional({ type: [Number] }) @IsOptional() @IsArray() @IsInt({ each: true }) @Type(() => Number) categoryIds?: number[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) businessIds?: string[];
}

export class UpdatePostDto extends CreatePostDto {
  @ApiPropertyOptional({ enum: PostStatus }) @IsOptional() @IsEnum(PostStatus) status?: PostStatus;
}

export class PostListQueryDto {
  @IsOptional() @IsEnum(PostType) type?: PostType;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() business?: string;
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @Type(() => Number) @IsInt() limit?: number;
}
