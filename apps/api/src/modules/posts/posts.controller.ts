import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body,
  UseGuards, Req, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, PostListQueryDto } from './dto/post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query: PostListQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('featured')
  findFeatured(@Query('citySlug') citySlug?: string, @Query('limit') limit?: string) {
    return this.postsService.findFeatured(citySlug, limit ? parseInt(limit, 10) : 6);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const post = await this.postsService.findBySlug(slug);
    await this.postsService.incrementViewCount(post.id);
    return post;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.postsService.create(dto, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @Req() req: any,
  ) {
    return this.postsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.postsService.remove(id, req.user.userId);
  }
}
