// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// ✅ Clé utilisée par le Reflector pour récupérer les rôles requis
export const ROLES_KEY = 'roles';

/**
 * Décorateur pour spécifier les rôles autorisés sur une route
 * @usage: @Roles('superadmin', 'admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
