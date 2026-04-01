// src/app/services/superadmin/auditor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Auditor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  isArchived: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuditorService {
  private apiUrl = 'http://localhost:3000/users/auditors';

  constructor(private http: HttpClient) {}

  getAuditors(): Observable<Auditor[]> {
    return this.http.get<Auditor[]>(this.apiUrl);
  }

  createAuditor(auditor: Partial<Auditor>): Observable<Auditor> {
    return this.http.post<Auditor>(this.apiUrl, auditor);
  }

  // ✅ ARCHIVE AUDITOR (Soft Delete)
  archiveAuditor(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/archive`, {
      isArchived: true,
    });
  }

  // ✅ ACTIVATE AUDITOR
  activateAuditor(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {
      isArchived: false,
    });
  }
}
