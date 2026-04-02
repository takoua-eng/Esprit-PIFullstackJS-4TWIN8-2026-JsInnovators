import { Injectable, signal, computed } from '@angular/core';
import { AppSettings, defaults } from '../config';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private optionsSignal = signal<AppSettings>(defaults);

  getOptions() {
    return this.optionsSignal();
  }

  setOptions(options: Partial<AppSettings>) {
    this.optionsSignal.update((current) => ({
      ...current,
      ...options,
    }));
  }

  userRole = signal<string>('Guest');

  isSuperAdmin = computed(() => this.userRole() === 'SuperAdmin');

  initUserRole() {
    const raw = localStorage.getItem('user_role');
    this.userRole.set(raw ? this.formatDisplayRole(raw) : 'Guest');
  }

  /** Sync role after login (backend role name, e.g. `patient`, `admin`). */
  setRoleFromLogin(roleName: string) {
    const display = roleName
      ? this.formatDisplayRole(roleName)
      : 'Guest';
    localStorage.setItem('user_role', roleName || '');
    this.userRole.set(display);
  }

  clearRole() {
    localStorage.removeItem('user_role');
    this.userRole.set('Guest');
  }

  private formatDisplayRole(r: string): string {
    const t = r.trim();
    if (!t) return 'Guest';
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }
}
