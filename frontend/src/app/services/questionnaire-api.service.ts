import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class QuestionnaireApiService {
  private readonly base = `${API_BASE_URL}/questionnaire-responses`;

  constructor(private readonly http: HttpClient) {}

  /** Whether the patient submitted any questionnaire today (backend boolean body). */
  hasRespondedToday(patientId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.base}/patient/${encodeURIComponent(patientId)}/today`,
    );
  }
}
