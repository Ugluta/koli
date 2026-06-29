import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post, PostStatus, PostType } from './entities/post.entity';
import { CreatePostDto, UpdatePostDto, PostListQueryDto } from './dto/post.dto';

function slugify(text: string, suffix = ''): string {
  const base = text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
  return suffix ? `${base}-${suffix}` : base;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: PostListQueryDto) {
    const limit = Math.min(query.limit ?? 20, 100);

    const qb = this.postsRepo.createQueryBuilder('p')
      .where('p.status = :status AND p.deleted_at IS NULL', { status: PostStatus.PUBLISHED })
      .orderBy('p.published_at', 'DESC')
      .addOrderBy('p.id', 'DESC');

    if (query.type) qb.andWhere('p.post_type = :type', { type: query.type });

    if (query.city) {
      qb.innerJoin('post_city_relations', 'pcr', 'pcr.post_id = p.id')
        .innerJoin('cities', 'c', 'c.id = pcr.city_id AND c.slug = :citySlug', { citySlug: query.city });
    }

    if (query.category) {
      qb.innerJoin('post_category_relations', 'pcar', 'pcar.post_id = p.id')
        .innerJoin('categories', 'cat', 'cat.id = pcar.category_id AND cat.slug = :catSlug', { catSlug: query.category });
    }

    if (query.business) {
      qb.innerJoin('post_business_relations', 'pbr', 'pbr.post_id = p.id')
        .innerJoin('businesses', 'b', 'b.id = pbr.business_id AND b.slug = :bizSlug', { bizSlug: query.business });
    }

    if (query.cursor) {
      try {
        const { publishedAt, id } = JSON.parse(Buffer.from(query.cursor, 'base64url').toString());
        qb.andWhere('(p.published_at, p.id::text) < (:publishedAt::timestamptz, :id)', { publishedAt, id });
      } catch { /* ignore */ }
    }

    qb.take(limit + 1);
    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const last = data[data.length - 1];
    const nextCursor = hasMore && last
      ? Buffer.from(JSON.stringify({ publishedAt: last.publishedAt, id: last.id })).toString('base64url')
      : null;

    return { data, meta: { cursor: nextCursor } };
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { slug, status: PostStatus.PUBLISHED },
    });
    if (!post) throw new NotFoundException(`Post '${slug}' not found`);
    return post;
  }

  async findFeatured(type?: PostType, limit = 5): Promise<Post[]> {
    const qb = this.postsRepo.createQueryBuilder('p')
      .where('p.status = :status AND p.is_featured = true AND p.deleted_at IS NULL', { status: PostStatus.PUBLISHED })
      .orderBy('p.published_at', 'DESC')
      .take(limit);
    if (type) qb.andWhere('p.post_type = :type', { type });
    return qb.getMany();
  }

  async create(dto: CreatePostDto, authorId: string, businessId?: string): Promise<Post> {
    return this.dataSource.transaction(async (manager) => {
      let slug = slugify(dto.title);
      const existing = await manager.findOne(Post, { where: { slug } });
      if (existing) slug = slugify(dto.title, Date.now().toString());

      const post = manager.create(Post, {
        authorId,
        businessId: businessId ?? null,
        postType: dto.postType,
        title: dto.title,
        slug,
        excerpt: dto.excerpt ?? null,
        content: dto.content ?? null,
        coverImageUrl: dto.coverImageUrl ?? null,
        isFeatured: dto.isFeatured ?? false,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        eventStartAt: dto.eventStartAt ? new Date(dto.eventStartAt) : null,
        eventEndAt: dto.eventEndAt ? new Date(dto.eventEndAt) : null,
        eventLocation: dto.eventLocation ?? null,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
        seoKeywords: dto.seoKeywords ?? null,
        status: dto.publishedAt ? PostStatus.PUBLISHED : PostStatus.DRAFT,
      });

      const saved = await manager.save(Post, post);

      if (dto.cityIds?.length) {
        const vals = dto.cityIds.map((cid) => `('${saved.id}', ${cid})`).join(',');
        await manager.query(`INSERT INTO post_city_relations (post_id, city_id) VALUES ${vals} ON CONFLICT DO NOTHING`);
      }
      if (dto.categoryIds?.length) {
        const vals = dto.categoryIds.map((cid) => `('${saved.id}', ${cid})`).join(',');
        await manager.query(`INSERT INTO post_category_relations (post_id, category_id) VALUES ${vals} ON CONFLICT DO NOTHING`);
      }
      if (dto.businessIds?.length) {
        const vals = dto.businessIds.map((bid) => `('${saved.id}', '${bid}')`).join(',');
        await manager.query(`INSERT INTO post_business_relations (post_id, business_id) VALUES ${vals} ON CONFLICT DO NOTHING`);
      }

      return saved;
    });
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');

    if (dto.status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    Object.assign(post, {
      title: dto.title ?? post.title,
      excerpt: dto.excerpt ?? post.excerpt,
      content: dto.content ?? post.content,
      coverImageUrl: dto.coverImageUrl ?? post.coverImageUrl,
      isFeatured: dto.isFeatured ?? post.isFeatured,
      eventStartAt: dto.eventStartAt ? new Date(dto.eventStartAt) : post.eventStartAt,
      eventEndAt: dto.eventEndAt ? new Date(dto.eventEndAt) : post.eventEndAt,
      eventLocation: dto.eventLocation ?? post.eventLocation,
      seoTitle: dto.seoTitle ?? post.seoTitle,
      seoDescription: dto.seoDescription ?? post.seoDescription,
      status: dto.status ?? post.status,
    });

    return this.postsRepo.save(post);
  }

  async remove(id: string): Promise<void> {
    await this.postsRepo.softDelete(id);
  }

  // ──── Admin moderation ────────────────────────────────────────────────────

  async findAllForAdmin(opts: { status?: PostStatus; type?: PostType; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 20, 100);
    const where: Record<string, unknown> = {};
    if (opts.status) where.status = opts.status;
    if (opts.type) where.postType = opts.type;

    const [data, total] = await this.postsRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async setStatus(id: string, status: PostStatus): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    post.status = status;
    if (status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    return this.postsRepo.save(post);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.postsRepo.increment({ id }, 'viewCount', 1);
  }

  async getRelations(postId: string) {
    const [cities, categories, businesses] = await Promise.all([
      this.dataSource.query(
        `SELECT c.id, c.name, c.slug FROM cities c INNER JOIN post_city_relations pcr ON pcr.city_id = c.id WHERE pcr.post_id = $1`,
        [postId],
      ),
      this.dataSource.query(
        `SELECT cat.id, cat.name, cat.slug FROM categories cat INNER JOIN post_category_relations pcar ON pcar.category_id = cat.id WHERE pcar.post_id = $1`,
        [postId],
      ),
      this.dataSource.query(
        `SELECT b.id, b.name, b.slug FROM businesses b INNER JOIN post_business_relations pbr ON pbr.business_id = b.id WHERE pbr.post_id = $1`,
        [postId],
      ),
    ]);
    return { cities, categories, businesses };
  }
}
