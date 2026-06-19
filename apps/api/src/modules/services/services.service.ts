import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceStatus } from './entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

function slugify(t: string) {
  return t.toLowerCase()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-');
}

@Injectable()
export class ServicesService {
  constructor(@InjectRepository(Service) private repo: Repository<Service>) {}

  findByBusiness(businessId: string) {
    return this.repo.find({
      where: { businessId, status: ServiceStatus.ACTIVE },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async create(businessId: string, dto: CreateServiceDto): Promise<Service> {
    let slug = slugify(dto.name);
    const existing = await this.repo.findOne({ where: { businessId, slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    return this.repo.save(this.repo.create({
      businessId, slug,
      name: dto.name,
      shortDescription: dto.shortDescription ?? null,
      description: dto.description ?? null,
      priceMin: dto.priceMin ?? null,
      priceMax: dto.priceMax ?? null,
      priceUnit: dto.priceUnit ?? null,
      currency: dto.currency ?? 'TRY',
      durationMinutes: dto.durationMinutes ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    }));
  }

  async update(id: string, businessId: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.repo.findOne({ where: { id, businessId } });
    if (!service) throw new NotFoundException('Service not found');
    Object.assign(service, dto);
    return this.repo.save(service);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const service = await this.repo.findOne({ where: { id, businessId } });
    if (!service) throw new NotFoundException('Service not found');
    service.status = ServiceStatus.ARCHIVED;
    await this.repo.save(service);
  }
}
