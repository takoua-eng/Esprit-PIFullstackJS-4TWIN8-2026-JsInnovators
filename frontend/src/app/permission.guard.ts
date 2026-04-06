import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private core: CoreService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const required: string | undefined = route.data['permission'];

    if (!required) return true;

    if (this.core.hasPermission(required)) return true;

    this.router.navigate(['/403']);
    return false;
  }
}
