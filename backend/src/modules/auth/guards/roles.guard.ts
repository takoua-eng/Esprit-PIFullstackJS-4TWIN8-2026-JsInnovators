// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ✅ 1. Récupérer les rôles requis définis par @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // ✅ Si aucun rôle requis → accès libre
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // ✅ 2. Récupérer l'utilisateur depuis request.user (peuplé par JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // ✅ 3. Vérifier que l'utilisateur a un rôle valide
    if (!user || !user.role) {
      throw new ForbiddenException('Accès refusé: rôle non défini');
    }

    // ✅ 4. Super Admin a accès à tout (optionnel, selon ta logique)
    if (user.role === 'superadmin') {
      return true;
    }

    // ✅ 5. Vérifier si le rôle de l'utilisateur est dans la liste autorisée
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé. Rôles requis: ${requiredRoles.join(', ')}. Votre rôle: ${user.role}`,
      );
    }

    return true;
  }
}
