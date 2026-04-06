import { Injectable, signal, computed } from '@angular/core';
import { AppSettings, defaults } from '../config';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private optionsSignal = signal<AppSettings>(defaults);

  // ── Permissions signal — reactive across the whole app ───────────
  private permissionsSignal = signal<string[]>(this.loadPermsFromStorage());

  private loadPermsFromStorage(): string[] {
    try {
      const raw = localStorage.getItem('permissions');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  getOptions() { return this.optionsSignal(); }

  setOptions(options: Partial<AppSettings>) {
    this.optionsSignal.update(current => ({ ...current, ...options }));
  }

  userRole = signal<string>('Guest');
  isSuperAdmin = computed(() => this.userRole() === 'SuperAdmin');

  initUserRole() {
    const raw = localStorage.getItem('user_role');
    this.userRole.set(raw ? this.formatDisplayRole(raw) : 'Guest');
    this.permissionsSignal.set(this.loadPermsFromStorage());
  }

  setRoleFromLogin(roleName: string) {
    const display = roleName ? this.formatDisplayRole(roleName) : 'Guest';
    localStorage.setItem('user_role', roleName || '');
    this.userRole.set(display);
  }

  /** Called after login to store and signal permissions */
  setPermissions(perms: string[]): void {
    localStorage.setItem('permissions', JSON.stringify(perms));
    this.permissionsSignal.set(perms);
  }

  clearRole() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('permissions');
    this.userRole.set('Guest');
    this.permissionsSignal.set([]);
  }

  private formatDisplayRole(r: string): string {
    const t = r.trim();
    if (!t) return 'Guest';
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }

  getPermissions(): string[] {
    return this.permissionsSignal();
  }

  hasPermission(permission: string): boolean {
    const perms = this.permissionsSignal();

    if (perms.includes('*')) return true;
    if (perms.includes(permission)) return true;

    // domain wildcard: 'patients:*' covers 'patients:read', etc.
    const [reqDomain] = permission.split(':');
    return perms.some(p => {
      const [domain, action] = p.split(':');
      return action === '*' && domain === reqDomain;
    });
  }
}
