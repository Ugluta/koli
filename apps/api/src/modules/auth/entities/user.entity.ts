import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CITY_ADMIN = 'city_admin',
  BUSINESS = 'business',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verify_token', nullable: true, select: false, type: 'varchar' })
  emailVerifyToken: string | null;

  @Column({ name: 'email_verify_expires', type: 'timestamptz', nullable: true, select: false })
  emailVerifyExpires: Date | null;

  @Column({ name: 'password_reset_token', nullable: true, select: false, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_expires', type: 'timestamptz', nullable: true, select: false })
  passwordResetExpires: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
