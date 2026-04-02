import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/** Requires `accessToken` in localStorage; otherwise sends user to login. */
export const authGuard: CanActivateFn = () => {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;
  if (token) return true;
  inject(Router).navigate(['/authentication/login']);
  return false;
};
