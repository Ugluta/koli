import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { ProductMedia } from './product-media.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  PREORDER = 'preorder',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Business) @JoinColumn({ name: 'business_id' }) business: Business;
  @Column({ name: 'business_id' }) businessId: string;
  @Column({ name: 'category_id', nullable: true, type: 'int' }) categoryId: number | null;
  @Column() name: string;
  @Column() slug: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'short_description', length: 500, nullable: true, type: 'varchar' }) shortDescription: string | null;
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true }) price: number | null;
  @Column({ name: 'price_min', type: 'numeric', precision: 10, scale: 2, nullable: true }) priceMin: number | null;
  @Column({ name: 'price_max', type: 'numeric', precision: 10, scale: 2, nullable: true }) priceMax: number | null;
  @Column({ length: 3, default: 'TRY' }) currency: string;
  @Column({ name: 'stock_status', type: 'enum', enum: StockStatus, default: StockStatus.IN_STOCK }) stockStatus: StockStatus;
  @Column({ nullable: true, type: 'varchar' }) sku: string | null;
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT }) status: ProductStatus;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'view_count', type: 'bigint', default: 0 }) viewCount: number;
  @Column({ name: 'seo_title', nullable: true, type: 'varchar' }) seoTitle: string | null;
  @Column({ name: 'seo_description', type: 'text', nullable: true }) seoDescription: string | null;
  @Column({ name: 'seo_keywords', nullable: true, type: 'varchar' }) seoKeywords: string | null;
  @Column({ name: 'schema_markup', type: 'jsonb', nullable: true }) schemaMarkup: Record<string, unknown> | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @OneToMany(() => ProductMedia, (m) => m.product) media: ProductMedia[];
}
