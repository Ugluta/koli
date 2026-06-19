import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ItemStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

@Entity('scraper_items')
export class ScraperItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'source_id' }) sourceId: string;
  @Column({ name: 'source_url' }) sourceUrl: string;
  @Column() title: string;
  @Column({ nullable: true, type: 'text' }) body: string | null;
  @Column({ name: 'image_url', nullable: true }) imageUrl: string | null;
  @Column({ nullable: true }) author: string | null;
  @Column({ name: 'published_at', nullable: true }) publishedAt: Date | null;
  @Column({ type: 'enum', enum: ItemStatus, default: ItemStatus.PENDING }) status: ItemStatus;
  @Column({ name: 'post_id', nullable: true }) postId: string | null;
  @Column({ name: 'reviewed_by', nullable: true }) reviewedBy: string | null;
  @Column({ name: 'reviewed_at', nullable: true }) reviewedAt: Date | null;
  @Column({ name: 'reject_reason', nullable: true }) rejectReason: string | null;
  @Column({ name: 'raw_data', type: 'jsonb', nullable: true }) rawData: Record<string, any> | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
