import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { getPostLoginPath, normalizeRoleKey } from './post-login-route';

/**
 * Allows navigation only when `user_role` (raw name from API) normalizes to one of `allowedRoles`.
 * Redirects to login if not authenticated, or to the user’s home route if the role is not allowed.
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  const allowed = new Set(allowedRoles.map((r) => normalizeRoleKey(r)));
  return () => {
    const router = inject(Router);
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (!token) {
      router.navigate(['/authentication/login']);
      return false;
    }
    const raw = localStorage.getItem('user_role') ?? '';
    const key = normalizeRoleKey(raw);
    if (!key) {
      router.navigate(['/authentication/login']);
      return false;
    }
    if (allowed.has(key)) return true;
    router.navigateByUrl(getPostLoginPath(raw));
    return false;
  };
}
