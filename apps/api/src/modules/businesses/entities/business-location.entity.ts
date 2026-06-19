import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Business } from './business.entity';
import { City } from '../../geography/entities/city.entity';
import { District } from '../../geography/entities/district.entity';

@Entity('business_locations')
export class BusinessLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Business, (b) => b.location)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string | null;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2: string | null;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'city_id' })
  cityId: number;

  @ManyToOne(() => District, { nullable: true })
  @JoinColumn({ name: 'district_id' })
  district: District | null;

  @Column({ name: 'district_id', nullable: true, type: 'int' })
  districtId: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string | null;

  @Column({ name: 'plus_code', nullable: true })
  plusCode: string | null;

  @Column({ name: 'map_embed_url', nullable: true })
  mapEmbedUrl: string | null;
}
