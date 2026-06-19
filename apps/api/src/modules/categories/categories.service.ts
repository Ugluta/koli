import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoriesRepo: Repository<Category>,
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

  private buildTree(items: Category[], parentId: number | null): CategoryTree[] {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(items, item.id),
      }));
  }
}
