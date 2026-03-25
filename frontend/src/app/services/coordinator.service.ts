import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoordinatorDashboardSummary {
  totalAssignedPatients: number;
  incompleteEntries: number;
  remindersSentToday: number;
  activeAlerts: number;
}

export interface CoordinatorPatientRow {
  _id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class CoordinatorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/coordinator';

  getDashboard(coordinatorId: string): Observable<CoordinatorDashboardSummary> {
    return this.http.get<CoordinatorDashboardSummary>(
      `${this.apiUrl}/${coordinatorId}/dashboard`,
    );
  }

  getAssignedPatients(coordinatorId: string): Observable<CoordinatorPatientRow[]> {
    return this.http.get<CoordinatorPatientRow[]>(
      `${this.apiUrl}/${coordinatorId}/patients`,
    );
  }
}