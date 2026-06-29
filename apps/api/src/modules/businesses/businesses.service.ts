import { Injectable, NotFoundException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Business, BusinessStatus } from './entities/business.entity';
import { BusinessLocation } from './entities/business-location.entity';
import { BusinessHours } from './entities/business-hours.entity';
import { BusinessSocialLink, SocialPlatform } from './entities/business-social-link.entity';
import { BusinessMedia } from './entities/business-media.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SearchService } from '../search/search.service';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business) private businessesRepo: Repository<Business>,
    @InjectRepository(BusinessLocation) private locationsRepo: Repository<BusinessLocation>,
    @InjectRepository(BusinessMedia) private mediaRepo: Repository<BusinessMedia>,
    private dataSource: DataSource,
    @Optional() private searchService?: SearchService,
  ) {}

  findGallery(businessId: string): Promise<BusinessMedia[]> {
    return this.mediaRepo.find({
      where: { businessId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(dto: CreateBusinessDto, ownerId: string): Promise<Business> {
    return this.dataSource.transaction(async (manager) => {
      let slug = slugify(dto.name);
      const existing = await manager.findOne(Business, { where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      const business = manager.create(Business, {
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription ?? null,
        description: dto.description ?? null,
        phone: dto.phone ?? null,
        whatsapp: dto.whatsapp ?? null,
        email: dto.email ?? null,
        website: dto.website ?? null,
        ownerId,
        status: BusinessStatus.PENDING,
      });

      const saved = await manager.save(Business, business);

      const location = manager.create(BusinessLocation, {
        businessId: saved.id,
        cityId: dto.cityId,
        districtId: dto.districtId ?? null,
        addressLine1: dto.addressLine1 ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
      });
      await manager.save(BusinessLocation, location);

      if (dto.categoryIds?.length) {
        for (let i = 0; i < dto.categoryIds.length; i++) {
          await manager.query(
            `INSERT INTO business_categories (business_id, category_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [saved.id, dto.categoryIds[i], i === 0],
          );
        }
      }

      const result = await manager.findOneOrFail(Business, {
        where: { id: saved.id },
        relations: ['location', 'location.city', 'location.city.country'],
      });

      // async index — don't block response
      this.searchService?.indexBusiness(saved.id).catch(() => {});
      return result;
    });
  }

  async findAll(options: {
    citySlug?: string;
    categorySlug?: string;
    q?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(options.limit ?? 20, 100);

    const qb = this.businessesRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.location', 'loc')
      .leftJoinAndSelect('loc.city', 'city')
      .leftJoinAndSelect('city.country', 'country')
      .where('b.status = :status AND b.deleted_at IS NULL', { status: BusinessStatus.ACTIVE });

    if (options.citySlug) {
      qb.andWhere('city.slug = :citySlug', { citySlug: options.citySlug });
    }

    if (options.categorySlug) {
      qb
        .innerJoin('business_categories', 'bc', 'bc.business_id = b.id')
        .innerJoin('category_closure', 'cc', 'cc.descendant_id = bc.category_id')
        .innerJoin('categories', 'root_cat', 'root_cat.id = cc.ancestor_id AND root_cat.slug = :catSlug', {
          catSlug: options.categorySlug,
        });
    }

    if (options.q) {
      qb.andWhere(
        `to_tsvector('simple', b.name || ' ' || COALESCE(b.description, '')) @@ plainto_tsquery('simple', :q)`,
        { q: options.q },
      );
    }

    if (options.cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(options.cursor, 'base64url').toString()) as {
          createdAt: string;
          id: string;
        };
        qb.andWhere('(b.created_at, b.id) < (:createdAt::timestamptz, :id::uuid)', {
          createdAt: decoded.createdAt,
          id: decoded.id,
        });
      } catch {
        // ignore invalid cursor
      }
    }

    qb.orderBy('b.is_featured', 'DESC')
      .addOrderBy('b.created_at', 'DESC')
      .addOrderBy('b.id', 'DESC')
      .take(limit + 1);

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const last = data[data.length - 1]!;
      nextCursor = Buffer.from(
        JSON.stringify({ createdAt: last.createdAt, id: last.id }),
      ).toString('base64url');
    }

    return { data, meta: { cursor: nextCursor } };
  }

  async findBySlug(slug: string): Promise<Business> {
    const business = await this.businessesRepo.findOne({
      where: { slug, status: BusinessStatus.ACTIVE },
      relations: [
        'location', 'location.city', 'location.city.country',
        'location.district', 'hours', 'socialLinks',
      ],
    });
    if (!business) throw new NotFoundException(`Business '${slug}' not found`);
    return business;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.businessesRepo.increment({ id }, 'viewCount', 1);
  }

  async findById(id: string, ownerId?: string): Promise<Business> {
    const business = await this.businessesRepo.findOne({
      where: { id },
      relations: ['location', 'location.city', 'hours', 'socialLinks'],
    });
    if (!business) throw new NotFoundException('Business not found');
    if (ownerId && business.ownerId !== ownerId) throw new ForbiddenException('Access denied');
    return business;
  }

  async assertOwner(businessId: string, userId: string): Promise<Business> {
    const business = await this.businessesRepo.findOne({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId) throw new ForbiddenException('Access denied');
    return business;
  }

  async findOwned(ownerId: string): Promise<Business[]> {
    return this.businessesRepo.find({
      where: { ownerId },
      relations: ['location', 'location.city', 'hours', 'socialLinks'],
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, ownerId: string, dto: UpdateBusinessDto): Promise<Business> {
    await this.assertOwner(id, ownerId);
    return this.dataSource.transaction(async (manager) => {
      const { cityId, districtId, addressLine1, addressLine2, postalCode, latitude, longitude, categoryIds, ...bizDto } = dto;
      await manager.update(Business, id, bizDto);

      if (cityId !== undefined || latitude !== undefined || addressLine1 !== undefined) {
        await manager.upsert(BusinessLocation, {
          businessId: id,
          ...(cityId !== undefined ? { cityId } : {}),
          ...(districtId !== undefined ? { districtId } : {}),
          ...(addressLine1 !== undefined ? { addressLine1 } : {}),
          ...(addressLine2 !== undefined ? { addressLine2 } : {}),
          ...(postalCode !== undefined ? { postalCode } : {}),
          ...(latitude !== undefined ? { latitude } : {}),
          ...(longitude !== undefined ? { longitude } : {}),
        }, ['businessId']);
      }

      if (categoryIds !== undefined) {
        await manager.query(`DELETE FROM business_categories WHERE business_id = $1`, [id]);
        for (let i = 0; i < categoryIds.length; i++) {
          await manager.query(
            `INSERT INTO business_categories (business_id, category_id, is_primary) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [id, categoryIds[i], i === 0],
          );
        }
      }

      return manager.findOneOrFail(Business, {
        where: { id },
        relations: ['location', 'location.city', 'hours', 'socialLinks'],
      });
    });
  }

  async upsertHours(businessId: string, ownerId: string, hours: Array<{ dayOfWeek: number; openTime?: string; closeTime?: string; isClosed?: boolean; is24h?: boolean }>): Promise<void> {
    await this.assertOwner(businessId, ownerId);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(BusinessHours, { businessId });
      for (const h of hours) {
        await manager.save(BusinessHours, manager.create(BusinessHours, { businessId, ...h }));
      }
    });
  }

  async upsertSocialLinks(businessId: string, ownerId: string, links: Array<{ platform: SocialPlatform; url: string }>): Promise<void> {
    await this.assertOwner(businessId, ownerId);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(BusinessSocialLink, { businessId });
      for (let i = 0; i < links.length; i++) {
        await manager.save(BusinessSocialLink, manager.create(BusinessSocialLink, { businessId, ...links[i], sortOrder: i }));
      }
    });
  }
}
