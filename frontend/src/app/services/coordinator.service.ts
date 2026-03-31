import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CoordinatorSummary {
  totalAssignedPatients: number;
  departmentsCovered: number;
  completeProfiles: number;
  missingEmergencyContact: number;
  patientsWithMedicalRecord: number;
  remindersSentToday: number;
  pendingReminders: number;
  missingVitalsToday: number;
  missingSymptomsToday: number;
}

export interface ChartItem {
  label: string;
  value: number;
}

export interface CoordinatorPatientRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  medicalRecordNumber?: string;
  status: string;
}

export interface CoordinatorDashboardResponse {
  summary: CoordinatorSummary;
  departmentDistribution: ChartItem[];
  completenessDistribution: ChartItem[];
  recentPatients: CoordinatorPatientRow[];
}

export interface ComplianceRow {
  _id: string;
  name: string;
  email: string;
  department: string;
  vitalsSubmitted: boolean;
  symptomsSubmitted: boolean;
  isFullyCompliant: boolean;
}

export interface ReminderRow {
  _id?: string;
  patientId: any;
  sentBy?: any;
  type: string;
  message: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CoordinatorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/coordinator';

  getDashboard(coordinatorId: string): Observable<CoordinatorDashboardResponse> {
    return this.http.get<CoordinatorDashboardResponse>(
      `${this.apiUrl}/${coordinatorId}/dashboard`
    );
  }

  getAssignedPatients(coordinatorId: string): Observable<CoordinatorPatientRow[]> {
    return this.http.get<CoordinatorPatientRow[]>(
      `${this.apiUrl}/${coordinatorId}/patients`
    );
  }

  getComplianceToday(coordinatorId: string): Observable<ComplianceRow[]> {
    return this.http.get<ComplianceRow[]>(
      `${this.apiUrl}/${coordinatorId}/compliance/today`
    );
  }

  getReminders(coordinatorId: string): Observable<ReminderRow[]> {
    return this.http.get<ReminderRow[]>(`${this.apiUrl}/${coordinatorId}/reminders`);
  }

  createReminder(
    coordinatorId: string,
    body: { patientId: string; type: string; message: string; scheduledAt?: string }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${coordinatorId}/reminders`, body);
  }

  sendReminder(reminderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reminders/${reminderId}/send`, {});
  }

  cancelReminder(reminderId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reminders/${reminderId}/cancel`, {});
  }

  deleteReminder(reminderId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reminders/${reminderId}`);
  }
}