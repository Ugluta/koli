import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('seo_redirects')
export class SeoRedirect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_path', length: 2048 })
  fromPath: string;

  @Column({ name: 'to_path', length: 2048 })
  toPath: string;

  @Column({ name: 'status_code', type: 'smallint', default: 301 })
  statusCode: number;

  @Column({ name: 'hit_count', default: 0 })
  hitCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
