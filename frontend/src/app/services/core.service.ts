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
  currentUser = signal<any>(null);

  isSuperAdmin = computed(() => this.userRole() === 'SuperAdmin');

  initUserRole() {
    const rawRole = localStorage.getItem('user_role');
    this.userRole.set(rawRole ? this.formatDisplayRole(rawRole) : 'Guest');

    const rawUser = localStorage.getItem('medi_follow_user_data');
    if (rawUser) {
      try {
        this.currentUser.set(JSON.parse(rawUser));
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
      }
    }
  }

  /** Sync role & user after login. */
  setUserFromLogin(user: any) {
    if (!user) return;
    
    localStorage.setItem('medi_follow_user_data', JSON.stringify(user));
    this.currentUser.set(user);

    // ✅ Safely extract role name whether it's a string or a populated object
    const roleObj = user.role;
    const roleName: string = 
      typeof roleObj === 'string' ? roleObj :
      (roleObj && typeof roleObj === 'object' && 'name' in roleObj) ? String(roleObj.name) : 
      '';

    const display = this.formatDisplayRole(roleName);
    localStorage.setItem('user_role', roleName);
    this.userRole.set(display);
  }

  clearSession() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('medi_follow_user_data');
    localStorage.removeItem('accessToken');
    this.userRole.set('Guest');
    this.currentUser.set(null);
  }

  clearRole() {
    this.clearSession();
  }

  private formatDisplayRole(r: string | any): string {
    const t = typeof r === 'string' ? r.trim() : '';
    if (!t) return 'Guest';
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }
}
