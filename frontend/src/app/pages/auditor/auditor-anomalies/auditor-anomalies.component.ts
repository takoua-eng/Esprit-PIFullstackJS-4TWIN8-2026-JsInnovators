import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { VitalsApiService } from 'src/app/services/vitals-api.service';
import { API_BASE_URL } from 'src/app/core/api.config';

interface AnomalyRow {
  patientId: string;
  name: string;
  email: string;
  issue: string;
  severity: 'HIGH' | 'MEDIUM';
}

@Component({
  selector: 'app-auditor-anomalies',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './auditor-anomalies.component.html',
  styleUrls: ['./auditor-anomalies.component.scss'],
})
export class AuditorAnomaliesComponent implements OnInit {
  anomalies: AnomalyRow[] = [];
  loading = false;
  lastRefresh = new Date();

  constructor(private http: HttpClient, private vitalsService: VitalsApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const today = new Date().toISOString().split('T')[0];

    forkJoin({
      patients: this.http.get<any[]>(`${API_BASE_URL}/users/patients`).pipe(catchError(() => of([]))),
      vitals:   this.vitalsService.getVitals().pipe(catchError(() => of([]))),
      symptoms: this.http.get<any[]>(`${API_BASE_URL}/symptoms`).pipe(catchError(() => of([]))),
    }).subscribe(({ patients, vitals, symptoms }) => {
      this.lastRefresh = new Date();
      const vitsToday = new Set((vitals as any[]).filter(v => v.recordedAt?.startsWith(today)).map(v => v.patientId?.toString()));
      const sympToday = new Set((symptoms as any[]).filter(s => (s.reportedAt || s.createdAt)?.startsWith(today)).map(s => s.patientId?.toString()));

      const rows: AnomalyRow[] = [];
      for (const p of patients as any[]) {
        const id = p._id?.toString();
        const name = `${p.firstName} ${p.lastName}`;
        const hasV = vitsToday.has(id);
        const hasS = sympToday.has(id);

        if (!hasV && !hasS) {
          rows.push({ patientId: id, name, email: p.email, issue: 'No vitals and no symptoms submitted today', severity: 'HIGH' });
        } else if (!hasV) {
          rows.push({ patientId: id, name, email: p.email, issue: 'Missing vital signs today', severity: 'MEDIUM' });
        } else if (!hasS) {
          rows.push({ patientId: id, name, email: p.email, issue: 'Missing symptoms report today', severity: 'MEDIUM' });
        }
      }
      this.anomalies = rows.sort((a, b) => (a.severity === 'HIGH' ? -1 : 1));
      this.loading = false;
    });
  }

  severityColor(s: string): string {
    return s === 'HIGH' ? '#d63031' : '#fdcb6e';
  }

  get highCount():   number { return this.anomalies.filter(a => a.severity === 'HIGH').length; }
  get mediumCount(): number { return this.anomalies.filter(a => a.severity === 'MEDIUM').length; }
}
