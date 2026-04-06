import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface VitalEntry {
  _id?: string;
  patientId?: string;
  temperature?: number;
  bloodPressuresystolic?: number;
  bloodPressureDiastolic?: number;
  weight?: number;
  heartRate?: number;
  notes?: string;
  recordedAt: string;
  createdAt?: string;
}

export interface SymptomEntry {
  _id?: string;
  patientId?: string;
  symptoms: string[];
  painLevel: number;
  fatigueLevel: number;
  shortnessOfBreath: boolean;
  nausea: boolean;
  description?: string;
  reportedAt: string;
  createdAt?: string;
}

export interface AlertEntry {
  _id?: string;
  patientId?: string;
  type: 'vital' | 'symptom';
  parameter: string;
  value?: number;
  message: string;
  status: 'pending' | 'resolved' | 'acknowledged';
  createdAt?: string;
}

export interface QuestionnaireSubmit {
  patientId: string;
  answers: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}



  /** Retourne le patientId en décodant le JWT (claim 'sub') stocké après connexion */
  getCurrentPatientId(): string {
    // Priorité : userId explicite si jamais stocké
    const direct = localStorage.getItem('userId');
    if (direct) return direct;

    // Sinon décoder le JWT pour extraire sub
    const token = localStorage.getItem('accessToken');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? payload._id ?? payload.id ?? '';
    } catch {
      return '';
    }
  }

  // â”€â”€â”€ VITAL PARAMETERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  submitVitals(data: Partial<VitalEntry>): Observable<VitalEntry> {
    const patientId = this.getCurrentPatientId();
    return this.http.post<VitalEntry>(`${this.API}/vital-parameters`, {
      ...data,
      patientId,
      recordedBy: patientId,
      recordedAt: data.recordedAt ?? new Date().toISOString(),
    });
  }

  getMyVitals(): Observable<VitalEntry[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<VitalEntry[]>(
      `${this.API}/vital-parameters/patient/${patientId}`,
    );
  }

  getLatestVital(): Observable<VitalEntry> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<VitalEntry>(
      `${this.API}/vital-parameters/patient/${patientId}/latest`,
    );
  }

  hasEnteredVitalsToday(): Observable<boolean> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<boolean>(
      `${this.API}/vital-parameters/patient/${patientId}/today`,
    );
  }

  // â”€â”€â”€ SYMPTOMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  submitSymptoms(data: Partial<SymptomEntry>): Observable<SymptomEntry> {
    const patientId = this.getCurrentPatientId();
    return this.http.post<SymptomEntry>(`${this.API}/symptoms`, {
      ...data,
      patientId,
      reportedBy: patientId,
      reportedAt: data.reportedAt ?? new Date().toISOString(),
    });
  }

  getMySymptoms(): Observable<SymptomEntry[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<SymptomEntry[]>(
      `${this.API}/symptoms/patient/${patientId}`,
    );
  }

  hasEnteredSymptomsToday(): Observable<boolean> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<boolean>(
      `${this.API}/symptoms/patient/${patientId}/today`,
    );
  }




  // â”€â”€â”€ ALERTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  getMyAlerts(): Observable<AlertEntry[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<AlertEntry[]>(
      `${this.API}/auto-alerts/patient/${patientId}`,
    );
  }

  /** Fetch clinical alerts (collection `alerts`) for a specific patient */
  getPatientAlerts(patientId: string, status?: string): Observable<AlertEntry[]> {
    let url = `${this.API}/alerts/patient/${patientId}`;
    if (status) url += `?status=${encodeURIComponent(status)}`;
    return this.http.get<any[]>(url).pipe(
      // Map backend Alert -> AlertEntry shape
      map(arr => (arr || []).map(a => ({
        _id: a._id,
        patientId: a.patientId,
        type: a.type || 'vital',
        parameter: a.parameter || '',
        value: a.value,
        message: a.message,
        status: a.status === 'open' ? 'pending' : 'resolved',
        createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
      })))
    );
  }

  acknowledgeClinicalAlert(alertId: string): Observable<AlertEntry> {
  return this.http.patch<any>(`${this.API}/alerts/${alertId}/acknowledge`, {}).pipe(
    map(a => ({
      _id: a._id,
      patientId: a.patientId,
      type: a.type || 'vital',
      parameter: a.parameter || '',
      value: a.value,
      message: a.message,
      status: a.status, // <-- garder le vrai status backend
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : undefined,
    }))
  );
}



  getRecentAlerts(): Observable<AlertEntry[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<AlertEntry[]>(
      `${this.API}/auto-alerts/patient/${patientId}/recent`,
    );
  }

  getPendingAlertsCount(): Observable<number> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<number>(
      `${this.API}/auto-alerts/patient/${patientId}/count`,
    );
  }

  resolveAlert(alertId: string): Observable<AlertEntry> {
    return this.http.patch<AlertEntry>(
      `${this.API}/auto-alerts/${alertId}/resolve`,
      {},
    );
  }



  // â”€â”€â”€ QUESTIONNAIRES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  submitQuestionnaire(
    answers: Record<string, string>,
  ): Observable<QuestionnaireSubmit> {
    const patientId = this.getCurrentPatientId();
    return this.http.post<QuestionnaireSubmit>(
      `${this.API}/questionnaire-responses`,
      { patientId, answers },
    );
  }

  getMyQuestionnaires(): Observable<QuestionnaireSubmit[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<QuestionnaireSubmit[]>(
      `${this.API}/questionnaire-responses/patient/${patientId}`,
    );
  }

  hasRespondedToQuestionnaireToday(): Observable<boolean> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<boolean>(
      `${this.API}/questionnaire-responses/patient/${patientId}/today`,
    );
  }

  getAssignedQuestionnaires(): Observable<any[]> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<any[]>(`${this.API}/questionnaire-templates/patient/${patientId}`);
  }

  hasCompletedTemplate(templateId: string): Observable<boolean> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<boolean>(
      `${this.API}/questionnaire-responses/patient/${patientId}/template/${templateId}`,
    );
  }

  submitQuestionnaireWithTemplate(templateId: string, answers: Record<string, string>): Observable<any> {
    const patientId = this.getCurrentPatientId();
    return this.http.post(`${this.API}/questionnaire-responses`, { patientId, templateId, answers });
  }




}
