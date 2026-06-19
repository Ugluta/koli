import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
}

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async findByBusiness(businessId: string, cursor?: string, limit = 20) {
    const take = Math.min(limit, 100);
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .where('p.business_id = :businessId AND p.status != :archived', {
        businessId, archived: ProductStatus.ARCHIVED,
      });

    if (cursor) {
      try {
        const { sortOrder, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString());
        qb.andWhere('(p.sort_order, p.id::text) > (:sortOrder, :id)', { sortOrder, id });
      } catch { /* ignore */ }
    }

    qb.orderBy('p.sort_order', 'ASC').addOrderBy('p.created_at', 'DESC').take(take + 1);
    const items = await qb.getMany();
    const hasMore = items.length > take;
    const data = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore && data.length > 0
      ? Buffer.from(JSON.stringify({ sortOrder: data[data.length-1]!.sortOrder, id: data[data.length-1]!.id })).toString('base64url')
      : null;
    return { data, meta: { cursor: nextCursor } };
  }

  async create(businessId: string, dto: CreateProductDto): Promise<Product> {
    let slug = slugify(dto.name);
    const existing = await this.repo.findOne({ where: { businessId, slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = this.repo.create({
      businessId,
      slug,
      name: dto.name,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      price: dto.price ?? null,
      priceMin: dto.priceMin ?? null,
      priceMax: dto.priceMax ?? null,
      currency: dto.currency ?? 'TRY',
      stockStatus: dto.stockStatus,
      sku: dto.sku ?? null,
      categoryId: dto.categoryId ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    });
    return this.repo.save(product);
  }

  async update(id: string, businessId: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.repo.findOne({ where: { id, businessId } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const product = await this.repo.findOne({ where: { id, businessId } });
    if (!product) throw new NotFoundException('Product not found');
    product.status = ProductStatus.ARCHIVED;
    await this.repo.save(product);
  }

  async reorder(businessId: string, items: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of items) {
      await this.repo.update({ id: item.id, businessId }, { sortOrder: item.sortOrder });
    }
  }
}
