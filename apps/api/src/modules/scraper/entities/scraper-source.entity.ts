import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SourceType { RSS = 'rss', HTML = 'html', JSON_API = 'json_api' }
export enum SourceStatus { ACTIVE = 'active', PAUSED = 'paused', ERROR = 'error' }

@Entity('scraper_sources')
export class ScraperSource {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() url: string;
  @Column({ type: 'enum', enum: SourceType, default: SourceType.RSS }) type: SourceType;
  @Column({ type: 'enum', enum: SourceStatus, default: SourceStatus.ACTIVE }) status: SourceStatus;
  @Column({ name: 'cron_expr', default: '0 */6 * * *' }) cronExpr: string;
  @Column({ name: 'city_id', nullable: true }) cityId: string | null;
  @Column({ name: 'category_id', nullable: true }) categoryId: string | null;
  @Column({ name: 'default_post_type', default: 'news' }) defaultPostType: string;
  @Column({ name: 'selector_title', nullable: true }) selectorTitle: string | null;
  @Column({ name: 'selector_body', nullable: true }) selectorBody: string | null;
  @Column({ name: 'selector_image', nullable: true }) selectorImage: string | null;
  @Column({ name: 'selector_link', nullable: true }) selectorLink: string | null;
  @Column({ name: 'last_fetched_at', nullable: true }) lastFetchedAt: Date | null;
  @Column({ name: 'last_error', nullable: true, type: 'text' }) lastError: string | null;
  @Column({ name: 'fetch_count', default: 0 }) fetchCount: number;
  @Column({ name: 'error_count', default: 0 }) errorCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
