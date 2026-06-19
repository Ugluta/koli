import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Business } from './business.entity';

@Entity('business_media')
export class BusinessMedia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Business, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'business_id' }) business: Business;
  @Column({ name: 'business_id' }) businessId: string;
  @Column({ type: 'text' }) url: string;
  @Column({ name: 'thumbnail_url', type: 'text', nullable: true }) thumbnailUrl: string | null;
  @Column({ name: 'alt_text', nullable: true }) altText: string | null;
  @Column({ name: 'mime_type', nullable: true }) mimeType: string | null;
  @Column({ name: 'file_size', type: 'bigint', nullable: true }) fileSize: number | null;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
