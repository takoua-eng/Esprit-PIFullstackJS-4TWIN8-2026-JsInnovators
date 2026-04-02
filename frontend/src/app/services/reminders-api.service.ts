import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';

export interface ReminderDto {
  _id: string;
  patientId: string;
  patientName: string;
  type: string;
  message: string;
  status: string;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RemindersApiService {
  private readonly base = `${API_BASE_URL}/reminders`;

  constructor(private readonly http: HttpClient) {}

  getReminders(): Observable<ReminderDto[]> {
    return this.http.get<ReminderDto[]>(this.base);
  }

  createReminder(payload: {
    patientId: string;
    message: string;
    type?: string;
    nurseUserId?: string;
    scheduledAt?: string;
  }): Observable<ReminderDto> {
    return this.http.post<ReminderDto>(this.base, payload);
  }

  getPendingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/stats/pending-count`);
  }

  complete(reminderId: string): Observable<ReminderDto> {
    return this.http.patch<ReminderDto>(`${this.base}/${reminderId}/complete`, {});
  }

  send(reminderId: string, nurseUserId?: string): Observable<ReminderDto> {
    return this.http.patch<ReminderDto>(`${this.base}/${reminderId}/send`, {
      nurseUserId,
    });
  }

  accept(reminderId: string, nurseUserId?: string): Observable<ReminderDto> {
    return this.http.patch<ReminderDto>(`${this.base}/${reminderId}/accept`, {
      nurseUserId,
    });
  }

  decline(reminderId: string, nurseUserId?: string): Observable<ReminderDto> {
    return this.http.patch<ReminderDto>(`${this.base}/${reminderId}/decline`, {
      nurseUserId,
    });
  }
}
