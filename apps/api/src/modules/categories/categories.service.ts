import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Category } from './entities/category.entity';

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoriesRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: { isActive: true },
      order: { depth: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findTree(): Promise<CategoryTree[]> {
    const all = await this.findAll();
    return this.buildTree(all, null);
  }

  async findBySlug(slug: string): Promise<Category> {
    const cat = await this.categoriesRepo.findOne({ where: { slug, isActive: true } });
    if (!cat) throw new NotFoundException(`Category '${slug}' not found`);
    return cat;
  }

  async findAncestors(categoryId: number): Promise<Category[]> {
    return this.categoriesRepo
      .createQueryBuilder('c')
      .innerJoin('category_closure', 'cc', 'cc.ancestor_id = c.id')
      .where('cc.descendant_id = :id AND cc.ancestor_id != :id AND c.is_active = true', { id: categoryId })
      .orderBy('cc.depth', 'DESC')
      .getMany();
  }

  async findChildren(categoryId: number): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: { parentId: categoryId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  // ──── Admin CRUD ──────────────────────────────────────────────────────────

  findAllAdmin(): Promise<Category[]> {
    return this.categoriesRepo.find({ order: { depth: 'ASC', sortOrder: 'ASC', name: 'ASC' } });
  }

  async createCategory(dto: { name: string; parentId?: number | null; sortOrder?: number; iconUrl?: string }): Promise<Category> {
    let slug = slugify(dto.name);
    if (!slug) throw new BadRequestException('Geçersiz kategori adı');
    if (await this.categoriesRepo.findOne({ where: { slug } })) slug = `${slug}-${Date.now()}`;

    let depth = 0;
    let path = slug;
    let parentId: number | null = null;
    if (dto.parentId) {
      const parent = await this.categoriesRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Üst kategori bulunamadı');
      parentId = parent.id;
      depth = parent.depth + 1;
      path = `${parent.path}/${slug}`;
    }

    return this.dataSource.transaction(async (manager) => {
      const cat = await manager.save(manager.create(Category, {
        name: dto.name, slug, parentId, depth, path,
        sortOrder: dto.sortOrder ?? 0,
        iconUrl: dto.iconUrl ?? null,
        isActive: true,
      }));
      // closure: self + every ancestor of the parent
      await manager.query(
        `INSERT INTO category_closure (ancestor_id, descendant_id, depth) VALUES ($1, $1, 0)`,
        [cat.id],
      );
      if (parentId) {
        await manager.query(
          `INSERT INTO category_closure (ancestor_id, descendant_id, depth)
           SELECT ancestor_id, $1, depth + 1 FROM category_closure WHERE descendant_id = $2`,
          [cat.id, parentId],
        );
      }
      return cat;
    });
  }

  async updateCategory(
    id: number,
    dto: { name?: string; sortOrder?: number; isActive?: boolean; iconUrl?: string },
  ): Promise<Category> {
    const cat = await this.categoriesRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori bulunamadı');
    // slug/path/depth stay stable to avoid breaking links and the closure tree
    if (dto.name !== undefined) cat.name = dto.name;
    if (dto.sortOrder !== undefined) cat.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) cat.isActive = dto.isActive;
    if (dto.iconUrl !== undefined) cat.iconUrl = dto.iconUrl;
    return this.categoriesRepo.save(cat);
  }

  async removeCategory(id: number): Promise<void> {
    const cat = await this.categoriesRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Kategori bulunamadı');
    const childCount = await this.categoriesRepo.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('Alt kategorisi olan bir kategori silinemez. Önce alt kategorileri taşıyın/silin.');
    }
    // category_closure rows cascade via FK ON DELETE CASCADE
    await this.categoriesRepo.delete(id);
  }

  private buildTree(items: Category[], parentId: number | null): CategoryTree[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
