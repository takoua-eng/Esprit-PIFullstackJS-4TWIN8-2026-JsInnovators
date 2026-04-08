// src/auth/guards/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Non authentifié');

    // Super Admin a tous les droits
    if (user?.permissions?.includes('*')) return true;

    const userPerms: string[] = user?.permissions ?? [];

    // OR logic: l'utilisateur doit avoir AU MOINS UNE des permissions requises
    const hasAny = required.some((perm) => {
      // Support wildcard de domaine: 'patients:*' couvre 'patients:read', 'patients:create', etc.
      return userPerms.some((up) => {
        if (up === perm) return true;
        const [upDomain, upAction] = up.split(':');
        const [reqDomain] = perm.split(':');
        return upAction === '*' && upDomain === reqDomain;
      });
    });

    if (!hasAny) {
      throw new ForbiddenException(
        `Permissions insuffisantes. Requis (l'une de): ${required.join(', ')}`,
      );
    }

    return true;
  }
}
