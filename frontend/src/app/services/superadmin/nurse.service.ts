// src/app/services/superadmin/nurse.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Nurse {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  serviceId?: string | any;
  service?: string;
  isArchived?: boolean;
  photo?: string;
}

@Injectable({ providedIn: 'root' })
export class NurseService {
  private apiUrl = 'http://localhost:3000/api/nurses';

  constructor(private http: HttpClient) {}

  getNurses(): Observable<Nurse[]> {
    return this.http.get<Nurse[]>(this.apiUrl);
  }

  createNurse(nurse: Partial<Nurse>): Observable<Nurse> {
    return this.http.post<Nurse>(this.apiUrl, nurse);
  }

  // ✅ ARCHIVE NURSE
  archiveNurse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
    // 💡 Ou si votre API utilise PATCH:
    // return this.http.patch(`${this.apiUrl}/${id}`, { isArchived: true });
  }
}
