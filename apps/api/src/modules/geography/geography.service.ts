import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { City } from './entities/city.entity';
import { District } from './entities/district.entity';

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(Country) private countriesRepo: Repository<Country>,
    @InjectRepository(City) private citiesRepo: Repository<City>,
    @InjectRepository(District) private districtsRepo: Repository<District>,
  ) {}

  findAllCountries() {
    return this.countriesRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  findAllCities(countrySlug?: string) {
    const qb = this.citiesRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.country', 'country')
      .where('c.is_active = true')
      .orderBy('c.name', 'ASC');

    if (countrySlug) {
      qb.andWhere('country.slug = :countrySlug', { countrySlug });
    }

    return qb.getMany();
  }

  async findCityBySlug(slug: string) {
    const city = await this.citiesRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.country', 'country')
      .where('c.slug = :slug AND c.is_active = true', { slug })
      .getOne();

    if (!city) throw new NotFoundException(`City '${slug}' not found`);
    return city;
  }

  findDistrictsByCity(citySlug: string) {
    return this.districtsRepo
      .createQueryBuilder('d')
      .innerJoin('d.city', 'city')
      .where('city.slug = :citySlug AND d.is_active = true', { citySlug })
      .orderBy('d.name', 'ASC')
      .getMany();
  }

  detectLocaleFromCity(city: City): string {
    return city.country?.defaultLocale ?? 'en';
  }
}
