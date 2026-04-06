import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  status: 'pending' | 'resolved';
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

  /** Retourne le patientId stocké en localStorage après connexion */
  getCurrentPatientId(): string {
    const raw = localStorage.getItem('medi_follow_user_data');
    if (!raw) return '';
    try {
      const user = JSON.parse(raw);
      return user._id ?? '';
    } catch (e) {
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
    return this.http.get<any[]>(`${this.API}/questionnaire-instances/patient/${patientId}`);
  }

  hasCompletedTemplate(templateId: string): Observable<boolean> {
    const patientId = this.getCurrentPatientId();
    return this.http.get<boolean>(
      `${this.API}/questionnaire-responses/patient/${patientId}/template/${templateId}`,
    );
  }

  submitInstanceResponse(instanceId: string, answers: any[]): Observable<any> {
    const patientId = this.getCurrentPatientId();
    return this.http.post(`${this.API}/questionnaire-responses`, { 
      questionnaireInstanceId: instanceId,
      patientId,
      answers 
    });
  }

  // ─── MESSAGES ────────────────────────────────────────────────────────────────

  getDoctorsAndNurses(): Observable<any[]> {
    return new Observable(obs => {
      // Fetch Doctor and Nurse roles in parallel
      Promise.all([
        fetch(`${this.API}/users/by-role/Doctor`).then(r => r.json()),
        fetch(`${this.API}/users/by-role/Nurse`).then(r => r.json()),
      ]).then(([doctors, nurses]) => {
        obs.next([
          ...(Array.isArray(doctors) ? doctors : []),
          ...(Array.isArray(nurses) ? nurses : []),
        ]);
        obs.complete();
      }).catch(e => obs.error(e));
    });
  }

  sendNote(toUserId: string, message: string): Observable<any> {
    const fromUserId = this.getCurrentPatientId();
    return this.http.post(`${this.API}/patient-notes`, { fromUserId, toUserId, message });
  }

  getMySentNotes(): Observable<any[]> {
    const fromUserId = this.getCurrentPatientId();
    return this.http.get<any[]>(`${this.API}/patient-notes/from/${fromUserId}`);
  }
}
