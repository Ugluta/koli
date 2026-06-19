import { Controller, Get, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** Global multi-index search — for autocomplete / header search bar */
  @Get()
  searchAll(@Query('q') q: string, @Query('limit') limit?: string) {
    if (!q?.trim()) return { businesses: [], posts: [], categories: [] };
    return this.searchService.searchAll(q, limit ? Math.min(parseInt(limit, 10), 10) : 5);
  }

  @Get('businesses')
  searchBusinesses(
    @Query('q') q: string,
    @Query('city') citySlug?: string,
    @Query('category') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.searchBusinesses({
      q: q ?? '',
      citySlug,
      categoryId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });
  }

  @Get('posts')
  searchPosts(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('cityId') cityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.searchPosts({
      q: q ?? '',
      type,
      cityId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });
  }

  /** Admin: trigger full reindex */
  @Post('reindex')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  reindexAll() {
    return this.searchService.reindexAll();
  }
}
