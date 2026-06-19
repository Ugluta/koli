import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum PostType {
  NEWS = 'news',
  BLOG = 'blog',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  CAMPAIGN = 'campaign',
}

export enum PostStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User) @JoinColumn({ name: 'author_id' }) author: User;
  @Column({ name: 'author_id' }) authorId: string;

  @Column({ name: 'business_id', nullable: true, type: 'uuid' }) businessId: string | null;

  @Column({ name: 'post_type', type: 'enum', enum: PostType, default: PostType.BLOG })
  postType: PostType;

  @Column() title: string;
  @Column({ unique: true }) slug: string;
  @Column({ type: 'text', nullable: true }) excerpt: string | null;
  @Column({ type: 'text', nullable: true }) content: string | null;
  @Column({ name: 'cover_image_url', nullable: true }) coverImageUrl: string | null;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column({ name: 'is_featured', default: false }) isFeatured: boolean;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true }) publishedAt: Date | null;
  @Column({ name: 'event_start_at', type: 'timestamptz', nullable: true }) eventStartAt: Date | null;
  @Column({ name: 'event_end_at', type: 'timestamptz', nullable: true }) eventEndAt: Date | null;
  @Column({ name: 'event_location', nullable: true }) eventLocation: string | null;
  @Column({ name: 'view_count', type: 'bigint', default: 0 }) viewCount: number;
  @Column({ name: 'seo_title', nullable: true }) seoTitle: string | null;
  @Column({ name: 'seo_description', type: 'text', nullable: true }) seoDescription: string | null;
  @Column({ name: 'seo_keywords', nullable: true }) seoKeywords: string | null;
  @Column({ name: 'og_image_url', nullable: true }) ogImageUrl: string | null;
  @Column({ name: 'schema_markup', type: 'jsonb', nullable: true }) schemaMarkup: Record<string, unknown> | null;
  @Column({ name: 'canonical_url', nullable: true }) canonicalUrl: string | null;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
  @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date | null;
}
