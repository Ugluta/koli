import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyReply } from 'fastify';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((value) => {
        if (!value || typeof value !== 'object') return { data: value };

        // Already shaped { data, meta } — add pagination headers for mobile clients
        if ('data' in value && 'meta' in value) {
          const meta = value.meta as Record<string, any>;

          if (typeof meta?.total === 'number') {
            res.header('X-Total-Count', String(meta.total));
          }
          if (meta?.cursor) {
            res.header('X-Next-Cursor', meta.cursor);
          }
          if (typeof meta?.page === 'number' && typeof meta?.limit === 'number' && typeof meta?.total === 'number') {
            const totalPages = Math.ceil(meta.total / meta.limit);
            const links: string[] = [];
            const base = context.switchToHttp().getRequest().url ?? '';
            const url = new URL(base, 'http://localhost');
            if (meta.page < totalPages) {
              url.searchParams.set('page', String(meta.page + 1));
              links.push(`<${url.pathname}${url.search}>; rel="next"`);
            }
            if (meta.page > 1) {
              url.searchParams.set('page', String(meta.page - 1));
              links.push(`<${url.pathname}${url.search}>; rel="prev"`);
            }
            if (links.length) res.header('Link', links.join(', '));
          }
          return value;
        }

        return { data: value };
      }),
    );
  }
}
