import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';

export enum ServiceStatus { DRAFT='draft', ACTIVE='active', ARCHIVED='archived' }

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Business) @JoinColumn({ name: 'business_id' }) business: Business;
  @Column({ name: 'business_id' }) businessId: string;
  @Column() name: string;
  @Column() slug: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'short_description', length: 500, nullable: true }) shortDescription: string | null;
  @Column({ name: 'price_min', type: 'numeric', precision: 10, scale: 2, nullable: true }) priceMin: number | null;
  @Column({ name: 'price_max', type: 'numeric', precision: 10, scale: 2, nullable: true }) priceMax: number | null;
  @Column({ name: 'price_unit', nullable: true, type: 'varchar' }) priceUnit: string | null;
  @Column({ length: 3, default: 'TRY' }) currency: string;
  @Column({ name: 'duration_minutes', nullable: true, type: 'int' }) durationMinutes: number | null;
  @Column({ name: 'cover_url', nullable: true, type: 'varchar' }) coverUrl: string | null;
  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.DRAFT }) status: ServiceStatus;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'seo_title', nullable: true, type: 'varchar' }) seoTitle: string | null;
  @Column({ name: 'seo_description', type: 'text', nullable: true }) seoDescription: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
