import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

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
