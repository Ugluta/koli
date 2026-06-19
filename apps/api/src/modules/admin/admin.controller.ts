import {
  Controller, Get, Patch, Delete, Param, Body, Query,
  ParseUUIDPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, User } from '../auth/entities/user.entity';
import { Business, BusinessStatus } from '../businesses/entities/business.entity';

class UpdateUserRoleDto { role: UserRole; }
class ApproveBusinessDto { status: BusinessStatus; }

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Business) private bizRepo: Repository<Business>,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    const [users, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: Math.min(Number(limit), 100),
      skip: (Number(page) - 1) * Number(limit),
    });
    return { data: users.map(u => ({ ...u, passwordHash: undefined })), meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role' })
  async updateUserRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserRoleDto) {
    await this.usersRepo.update(id, { role: dto.role });
    return { ok: true };
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersRepo.delete(id);
  }

  @Get('businesses')
  @ApiOperation({ summary: 'List all businesses with status filter' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listBusinesses(
    @Query('status') status?: BusinessStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const where = status ? { status } : {};
    const [items, total] = await this.bizRepo.findAndCount({
      where,
      relations: ['location', 'location.city'],
      order: { createdAt: 'DESC' },
      take: Math.min(Number(limit), 100),
      skip: (Number(page) - 1) * Number(limit),
    });
    return { data: items, meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Patch('businesses/:id/status')
  @ApiOperation({ summary: 'Approve or suspend a business' })
  async updateBusinessStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ApproveBusinessDto) {
    await this.bizRepo.update(id, { status: dto.status });
    return { ok: true };
  }

  @Delete('businesses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete a business' })
  async deleteBusiness(@Param('id', ParseUUIDPipe) id: string) {
    await this.bizRepo.delete(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide stats' })
  async stats() {
    const [totalUsers, totalBusinesses, pendingBusinesses, activeBusinesses] = await Promise.all([
      this.usersRepo.count(),
      this.bizRepo.count(),
      this.bizRepo.count({ where: { status: BusinessStatus.PENDING } }),
      this.bizRepo.count({ where: { status: BusinessStatus.ACTIVE } }),
    ]);
    return { totalUsers, totalBusinesses, pendingBusinesses, activeBusinesses };
  }
}
