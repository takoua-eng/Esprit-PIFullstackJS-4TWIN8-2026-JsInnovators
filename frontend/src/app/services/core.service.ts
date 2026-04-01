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
    const role = localStorage.getItem('user_role') || 'Guest';
    this.userRole.set(role);
  }
}
