import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CategoriesService } from './categories.service';

class CreateCategoryDto {
  @IsString() name: string;
  @IsOptional() @IsInt() @Type(() => Number) parentId?: number;
  @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
  @IsOptional() @IsString() iconUrl?: string;
}

class UpdateCategoryDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() @Type(() => Number) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() iconUrl?: string;
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private cats: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get full category tree' })
  tree() {
    return this.cats.findTree();
  }

  @Public()
  @Get('flat')
  @ApiOperation({ summary: 'Get flat list of all categories' })
  flat() {
    return this.cats.findAll();
  }

  // ──── Admin CRUD (declared before :slug to avoid route capture) ────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flat list incl. inactive (admin)' })
  adminAll() {
    return this.cats.findAllAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.cats.createCategory(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.cats.updateCategory(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete leaf category (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cats.removeCategory(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug with children and ancestors' })
  async bySlug(@Param('slug') slug: string) {
    const category = await this.cats.findBySlug(slug);
    const [children, ancestors] = await Promise.all([
      this.cats.findChildren(category.id),
      this.cats.findAncestors(category.id),
    ]);
    return { ...category, children, ancestors };
  }
}
