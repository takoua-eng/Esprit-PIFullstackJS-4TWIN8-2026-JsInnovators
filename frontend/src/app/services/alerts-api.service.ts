import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';

export interface ClinicalReviewQueueItemDto {
  queueId: string;
  sourceType: 'vital' | 'symptom';
  sourceId: string;
  patientId: string;
  patientName: string;
  summary: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  recordedAt: string;
  heuristicSeverity: 'high' | 'medium' | 'low';
  sortScore: number;
}

export interface ClinicalReviewQueueResponseDto {
  items: ClinicalReviewQueueItemDto[];
  sortedBy: 'ai' | 'heuristic';
}

export interface AlertDto {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  sourceType?: string;
  sourceId?: string;
  type: string;
  severity: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  message: string;
  status: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string | null;
  createdAt?: string;
}

/** Physician → patient urgent clinic / ED instruction (optionally linked to a vital or symptom row). */
export interface CreateUrgentClinicAlertPayload {
  patientId: string;
  physicianUserId: string;
  severity: string;
  message?: string;
  type?: string;
  parameter?: string;
  value?: number;
  threshold?: number;
  sourceType?: 'symptom' | 'vital' | 'manual';
  sourceId?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private readonly base = `${API_BASE_URL}/alerts`;

  constructor(private readonly http: HttpClient) {}

  getAlerts(opts?: {
    doctorId?: string;
    patientId?: string;
  }): Observable<AlertDto[]> {
    let params = new HttpParams();
    if (opts?.doctorId) {
      params = params.set('doctorId', opts.doctorId);
    }
    if (opts?.patientId) {
      params = params.set('patientId', opts.patientId);
    }
    return this.http.get<AlertDto[]>(this.base, { params });
  }

  /** Abnormal vitals/symptoms, urgency-sorted (AI when backend has GROQ_API_KEY). */
  getClinicalReviewQueue(doctorId: string): Observable<ClinicalReviewQueueResponseDto> {
    return this.http.get<ClinicalReviewQueueResponseDto>(
      `${this.base}/clinical-review-queue`,
      { params: { doctorId } },
    );
  }

  getOpenCount(opts?: {
    doctorId?: string;
    patientId?: string;
  }): Observable<{ count: number }> {
    let params = new HttpParams();
    if (opts?.doctorId) {
      params = params.set('doctorId', opts.doctorId);
    }
    if (opts?.patientId) {
      params = params.set('patientId', opts.patientId);
    }
    return this.http.get<{ count: number }>(`${this.base}/stats/open-count`, {
      params,
    });
  }

  createUrgentClinicAlert(
    payload: CreateUrgentClinicAlertPayload,
  ): Observable<AlertDto> {
    return this.http.post<AlertDto>(this.base, payload);
  }

  acknowledge(
    alertId: string,
    opts?: {
      nurseUserId?: string;
      doctorUserId?: string;
      patientUserId?: string;
    },
  ): Observable<AlertDto> {
    return this.http.patch<AlertDto>(`${this.base}/${alertId}/acknowledge`, {
      nurseUserId: opts?.nurseUserId,
      doctorUserId: opts?.doctorUserId,
      patientUserId: opts?.patientUserId,
    });
  }
}
