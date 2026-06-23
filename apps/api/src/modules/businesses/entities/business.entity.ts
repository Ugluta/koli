import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { BusinessLocation } from './business-location.entity';
import { BusinessHours } from './business-hours.entity';
import { BusinessSocialLink } from './business-social-link.entity';

export enum BusinessStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'short_description', length: 300, nullable: true })
  shortDescription: string | null;

  @Column({ name: 'logo_url', nullable: true, type: 'varchar' })
  logoUrl: string | null;

  @Column({ name: 'cover_url', nullable: true, type: 'varchar' })
  coverUrl: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ name: 'phone_secondary', nullable: true, type: 'varchar' })
  phoneSecondary: string | null;

  @Column({ nullable: true, type: 'varchar' })
  whatsapp: string | null;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  website: string | null;

  @Column({ type: 'enum', enum: BusinessStatus, default: BusinessStatus.PENDING })
  status: BusinessStatus;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'view_count', type: 'bigint', default: 0 })
  viewCount: number;

  @Column({ name: 'click_count', type: 'bigint', default: 0 })
  clickCount: number;

  @Column({ name: 'rating_avg', type: 'numeric', precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToOne(() => BusinessLocation, (loc) => loc.business, { nullable: true })
  location: BusinessLocation;

  @OneToMany(() => BusinessHours, (h) => h.business)
  hours: BusinessHours[];

  @OneToMany(() => BusinessSocialLink, (s) => s.business)
  socialLinks: BusinessSocialLink[];
}
