import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

const TRACKED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// GET paths to skip (too noisy / internal)
const SKIP_GET_PATTERNS = [
  /\/auth\/me$/,
  /\/notifications/,
  /\/stats/,
  /\/unread-count/,
  /\/alerts\/count/,
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;

    if (!TRACKED_METHODS.includes(method)) return next.handle();

    // Skip noisy GET endpoints
    if (method === 'GET') {
      const url: string = req.url ?? '';
      if (SKIP_GET_PATTERNS.some(p => p.test(url))) return next.handle();
    }

    const user = req.user;
    const ip: string = req.ip ?? 'unknown';
    const url: string = req.url ?? '';
    const entityType = this.resolveEntityType(url);
    const action = this.resolveAction(method, url);

    return next.handle().pipe(
      tap((responseBody) => {
        const entityId =
          responseBody?._id?.toString() ??
          req.params?.id ??
          'unknown';

        this.auditService
          .create({
            userId:     user?.sub ?? user?._id ?? 'anonymous',
            userEmail:  user?.email ?? 'anonymous',
            action,
            entityType,
            entityId,
            before: null,
            after: method !== 'DELETE' && method !== 'GET' ? responseBody : null,
            ipAddress: ip,
          })
          .catch(() => {/* silent */});
      }),
    );
  }

  private resolveEntityType(url: string): string {
    const segments = url.replace(/\?.*$/, '').split('/').filter(Boolean);
    return segments
      .filter(s => !/^[a-f0-9]{24}$/.test(s))
      .map(s => s.toUpperCase())
      .join('_') || 'UNKNOWN';
  }

  private resolveAction(method: string, url: string): string {
    // Specific actions based on URL pattern
    if (method === 'PUT' || method === 'PATCH') {
      if (/\/activate$/.test(url))   return 'ACTIVATE';
      if (/\/deactivate$/.test(url)) return 'DEACTIVATE';
      if (/\/restore$/.test(url))    return 'RESTORE';
      if (/\/read$/.test(url))       return 'MARK_READ';
      if (/\/read-all$/.test(url))   return 'MARK_ALL_READ';
    }

    if (method === 'GET') return 'VIEW';

    const map: Record<string, string> = {
      POST:   'CREATE',
      PUT:    'UPDATE',
      PATCH:  'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] ?? method;
  }
}
