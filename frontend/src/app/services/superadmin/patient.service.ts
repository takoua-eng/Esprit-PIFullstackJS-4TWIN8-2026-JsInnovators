import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: Date;
  medicalRecordNumber: string;
  emergencyContact: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  photo?: string;
  isArchived?: boolean;
  isActive?: boolean; // ✅ important
  serviceId?: any;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients`);
  }

  createPatient(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients`, data);
  }

  archivePatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ✅ activate / deactivate
  activatePatient(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivatePatient(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
