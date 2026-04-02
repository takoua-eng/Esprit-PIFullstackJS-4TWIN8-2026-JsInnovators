import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

function isPublicAuthUrl(url: string): boolean {
  try {
    const path = new URL(url, API_BASE_URL).pathname;
    return (
      path.endsWith('/auth/login') ||
      path.endsWith('/auth/forgot-password') ||
      path.endsWith('/auth/reset-password')
    );
  } catch {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')
    );
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

  if (!token || isPublicAuthUrl(req.url)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
