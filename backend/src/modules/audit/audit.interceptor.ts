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
  /^\/audit/,          // skip audit self-reads — prevents infinite loop
  /\/reminders$/,      // skip listing reminders (too noisy)
  /\/users\/patients$/, // skip patient list reads
  /\/users\/doctors$/,
  /\/users\/nurses$/,
  /\/users\/coordinators$/,
  /\/users\/auditors$/,
  /\/users\/admins$/,
  /\/roles$/,
  /\/services$/,
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

        // For role/permission changes, capture what changed
        const isRoleChange = /\/roles\//.test(url) && (method === 'PUT' || method === 'PATCH');
        const afterData = method !== 'DELETE' && method !== 'GET'
          ? (isRoleChange ? { permissions: responseBody?.permissions, name: responseBody?.name } : responseBody)
          : null;

        this.auditService
          .create({
            userId:     user?.sub ?? user?._id ?? 'anonymous',
            userEmail:  user?.email ?? 'anonymous',
            userRole:   user?.role ?? 'unknown',
            userName:   user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : (user?.email ?? 'anonymous'),
            action,
            entityType,
            entityId,
            before: null,
            after: afterData,
            ipAddress: ip,
            userAgent: req.headers?.['user-agent'] ?? 'unknown',
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
    // ── Specific URL-based actions ────────────────────────────────
    if (method === 'PUT' || method === 'PATCH') {
      if (/\/activate$/.test(url))        return 'ACTIVATE';
      if (/\/deactivate$/.test(url))      return 'DEACTIVATE';
      if (/\/restore$/.test(url))         return 'RESTORE';
      if (/\/archive$/.test(url))         return 'ARCHIVE';
      if (/\/read$/.test(url))            return 'MARK_READ';
      if (/\/read-all$/.test(url))        return 'MARK_ALL_READ';
      if (/\/verify$/.test(url))          return 'VERIFY';
      if (/\/send$/.test(url))            return 'SEND_REMINDER';
      if (/\/complete$/.test(url))        return 'COMPLETE';
      if (/\/cancel$/.test(url))          return 'CANCEL';
      if (/\/accept$/.test(url))          return 'ACCEPT';
      if (/\/decline$/.test(url))         return 'DECLINE';
      if (/\/resolve$/.test(url))         return 'RESOLVE';
      if (/\/acknowledge$/.test(url))     return 'ACKNOWLEDGE';
    }

    if (method === 'POST') {
      if (/\/auth\/logout$/.test(url))    return 'LOGOUT';
      if (/\/reset-password$/.test(url))  return 'RESET_PASSWORD';
      if (/\/forgot-password$/.test(url)) return 'FORGOT_PASSWORD';
      if (/\/questionnaire-responses/.test(url)) return 'QUESTIONNAIRE_SUBMIT';
      if (/\/video-calls/.test(url))      return 'VIDEO_CALL_START';
      if (/\/patient-notes/.test(url))    return 'SEND_NOTE';
      if (/\/reminders/.test(url))        return 'CREATE_REMINDER';
    }

    if (method === 'GET') {
      if (/\/vital-parameters\/patient/.test(url)) return 'VIEW_PATIENT_VITALS';
      if (/\/vitals/.test(url))                    return 'VIEW_VITALS';
      if (/\/symptoms\/patient/.test(url))         return 'VIEW_PATIENT_SYMPTOMS';
      if (/\/nurse-dossier/.test(url))             return 'VIEW_PATIENT_DOSSIER';
      if (/\/auto-alerts\/patient/.test(url))      return 'VIEW_PATIENT_ALERTS';
      if (/\/questionnaire-responses\/patient/.test(url)) return 'VIEW_PATIENT_QUESTIONNAIRES';
      return 'VIEW';
    }

    const map: Record<string, string> = {
      POST:   'CREATE',
      PUT:    'UPDATE',
      PATCH:  'UPDATE',
      DELETE: 'DELETE',
    };
    return map[method] ?? method;
  }
}
