import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Strict throttler for auth endpoints: 5 req/min per IP to slow brute-force.
 * Apply with @UseGuards(ThrottleAuthGuard) on login/register/refresh.
 */
@Injectable()
export class ThrottleAuthGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // use real IP behind proxy
    const forwarded = req.headers?.['x-forwarded-for'];
    const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) : req.ip;
    return `auth:${ip?.trim() ?? 'unknown'}`;
  }
}
