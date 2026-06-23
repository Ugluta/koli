import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  YOUTUBE = 'youtube',
}

@Entity('product_media')
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Product, (p) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' }) product: Product;
  @Column({ name: 'product_id' }) productId: string;
  @Column({ name: 'media_type', type: 'enum', enum: MediaType, default: MediaType.IMAGE }) mediaType: MediaType;
  @Column() url: string;
  @Column({ name: 'thumbnail_url', nullable: true, type: 'varchar' }) thumbnailUrl: string | null;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'alt_text', nullable: true, type: 'varchar' }) altText: string | null;
  @Column({ name: 'file_name', nullable: true, type: 'varchar' }) fileName: string | null;
  @Column({ name: 'file_size', type: 'bigint', nullable: true }) fileSize: number | null;
  @Column({ name: 'mime_type', nullable: true, type: 'varchar' }) mimeType: string | null;
}
