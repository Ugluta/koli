import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

const AUDITED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method?.toUpperCase() ?? '';

    if (!AUDITED_METHODS.has(method)) return next.handle();

    const userId = req.user?.userId ?? null;
    const action = `${method} ${req.url}`;
    const ipAddress = req.ip ?? req.headers['x-forwarded-for'] ?? null;

    return next.handle().pipe(
      tap({
        next: () => {
          this.dataSource
            .query(
              `INSERT INTO audit_logs (user_id, action, ip_address, metadata)
               VALUES ($1, $2, $3, $4::jsonb)`,
              [
                userId,
                action,
                ipAddress,
                JSON.stringify({
                  userAgent: req.headers['user-agent']?.substring(0, 200),
                  body: this.sanitizeBody(req.body),
                }),
              ],
            )
            .catch((err: Error) => this.logger.error(`Audit log failed: ${err.message}`));
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return {};
    const safe = { ...body };
    // never log passwords or tokens
    for (const key of ['password', 'passwordHash', 'refresh_token', 'access_token', 'token', 'secret']) {
      if (key in safe) safe[key] = '[REDACTED]';
    }
    return safe;
  }
}
