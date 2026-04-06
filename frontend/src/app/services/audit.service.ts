import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  entityType: string;
  entityId: string;
  before: any;
  after: any;
  ipAddress: string;
  createdAt: string;
}

export interface AuditStats {
  total: number;
  byAction: { _id: string; count: number }[];
  byEntity: { _id: string; count: number }[];
  byUser: { _id: string; count: number }[];
  last24h: { _id: number; count: number }[];
  last7days: { _id: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private base = 'http://localhost:3000/audit';

  constructor(private http: HttpClient) {}

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.base);
  }

  getStats(): Observable<AuditStats> {
    return this.http.get<AuditStats>(`${this.base}/stats`);
  }

  getLog(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.base}/${id}`);
  }

  deleteLog(id: string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
