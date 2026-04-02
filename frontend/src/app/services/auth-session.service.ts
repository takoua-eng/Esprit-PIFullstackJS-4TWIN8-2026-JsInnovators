import { Injectable } from '@angular/core';

const ROLE_KEY = 'medi_follow_user_role';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  setRole(role: string): void {
    localStorage.setItem(ROLE_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  }

  clearRole(): void {
    localStorage.removeItem(ROLE_KEY);
  }
}
