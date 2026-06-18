import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(RefreshToken) private tokensRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ email: dto.email, passwordHash });
    await this.usersRepo.save(user);

    return this.issueTokens(user, ipAddress);
  }

  async login(dto: LoginDto, ipAddress?: string) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user, ipAddress);
  }

  async refresh(userId: string, rawRefreshToken: string, ipAddress?: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.tokensRepo.findOne({
      where: { userId, tokenHash, revokedAt: null as any },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt < new Date()) {
      await this.revokeAllUserTokens(userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.tokensRepo.update(stored.id, { revokedAt: new Date() });
    return this.issueTokens(stored.user, ipAddress);
  }

  async refreshByToken(rawRefreshToken: string, ipAddress?: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.tokensRepo.findOne({
      where: { tokenHash, revokedAt: null as any },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.revokeAllUserTokens(stored.userId);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.tokensRepo.update(stored.id, { revokedAt: new Date() });
    return this.issueTokens(stored.user, ipAddress);
  }

  async logout(userId: string, rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.tokensRepo.update({ userId, tokenHash }, { revokedAt: new Date() });
  }

  async revokeAllUserTokens(userId: string) {
    await this.tokensRepo.update({ userId, revokedAt: null as any }, { revokedAt: new Date() });
  }

  private async issueTokens(user: User, ipAddress?: string) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date(Date.now() + this.parseDuration(expiresIn));

    const tokenEntity = this.tokensRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: ipAddress ?? null,
    });
    await this.tokensRepo.save(tokenEntity);

    return {
      access_token: accessToken,
      refresh_token: rawRefreshToken,
      token_type: 'Bearer',
      expires_in: this.parseDuration(this.config.get('JWT_EXPIRES_IN', '15m')) / 1000,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);
    const map: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (map[unit] ?? 1000);
  }
}
