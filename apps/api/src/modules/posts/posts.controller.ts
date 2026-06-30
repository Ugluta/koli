import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, PostListQueryDto } from './dto/post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../auth/entities/user.entity';
import { PostType, PostStatus } from './entities/post.entity';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(@Query() query: PostListQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get('featured')
  findFeatured(@Query('type') type?: string, @Query('limit') limit?: string) {
    return this.postsService.findFeatured(type as PostType | undefined, limit ? parseInt(limit, 10) : 5);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  adminList(
    @Query('status') status?: PostStatus,
    @Query('type') type?: PostType,
    @Query('page') page?: string,
  ) {
    return this.postsService.findAllForAdmin({
      status, type, page: page ? parseInt(page, 10) : 1,
    });
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  adminSetStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: PostStatus,
  ) {
    return this.postsService.setStatus(id, status);
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
  create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.update(id, dto, { id: user.id, role: user.role });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.postsService.remove(id, { id: user.id, role: user.role });
  }
}
