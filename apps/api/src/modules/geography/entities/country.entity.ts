import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { City } from './city.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'iso_code', length: 2 })
  isoCode: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'default_locale', length: 5, default: 'en' })
  defaultLocale: string;

  @Column({ name: 'currency_code', length: 3, default: 'EUR' })
  currencyCode: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ name: 'phone_prefix', length: 6, default: '+0' })
  phonePrefix: string;

  @Column({ name: 'date_format', default: 'DD/MM/YYYY' })
  dateFormat: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
