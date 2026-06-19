import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'city_id' })
  cityId: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
