import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { UsersApiService, UserListRow } from 'src/app/services/users-api.service';
import { VitalsApiService, VitalDto } from 'src/app/services/vitals-api.service';
import { SymptomsApiService, SymptomDto } from 'src/app/services/symptoms-api.service';
import { AlertsApiService, AlertDto } from 'src/app/services/alerts-api.service';
import {
  UrgentClinicDialogComponent,
  UrgentClinicDialogResult,
} from './urgent-clinic-dialog.component';

type HistoryRow = {
  when: string;
  patientName: string;
  source: 'vital' | 'symptom';
  summary: string;
};

type TrendDirection = 'up' | 'down' | 'flat';
type DayTrend = {
  label: string;
  value: number;
  max: number;
};

@Component({
  selector: 'app-doctor-history',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
  ],
  templateUrl: './doctor-history.component.html',
  styleUrls: ['./doctor-history.component.scss'],
})
export class DoctorHistoryComponent implements OnInit {
  patients: UserListRow[] = [];
  physicians: UserListRow[] = [];
  selectedPatientId = '';
  activePhysicianId: string | null = null;
  loading = true;
  alertLoading = true;

  vitals: VitalDto[] = [];
  symptoms: SymptomDto[] = [];
  alerts: AlertDto[] = [];

  displayedColumns: string[] = ['when', 'patient', 'source', 'summary'];

  constructor(
    private readonly usersApi: UsersApiService,
    private readonly vitalsApi: VitalsApiService,
    private readonly symptomsApi: SymptomsApiService,
    private readonly alertsApi: AlertsApiService,
    private readonly dialog: MatDialog,
    private readonly snack: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.usersApi.getPatients().subscribe({
      next: (rows) => {
        this.patients = rows;
        if (rows.length) this.selectedPatientId = rows[0]._id;
        this.loadHistory();
      },
      error: () => {
        this.loading = false;
      },
    });
    this.usersApi.getPhysicians().subscribe({
      next: (rows) => {
        this.physicians = rows;
        this.activePhysicianId = rows.length ? rows[0]._id : null;
        this.loadAlerts();
      },
    });
  }

  loadHistory(): void {
    this.loading = true;
    const pid = this.selectedPatientId || undefined;

    this.vitalsApi.getVitals(pid).subscribe({
      next: (rows) => {
        this.vitals = rows;
        this.loading = false;
      },
      error: () => {
        this.vitals = [];
        this.loading = false;
      },
    });

    this.symptomsApi.getSymptoms(pid).subscribe({
      next: (rows) => {
        this.symptoms = rows;
      },
      error: () => {
        this.symptoms = [];
      },
    });

    this.loadAlerts();
  }

  private loadAlerts(): void {
    if (!this.activePhysicianId || !this.selectedPatientId) {
      this.alerts = [];
      this.alertLoading = false;
      return;
    }
    this.alertLoading = true;
    this.alertsApi
      .getAlerts({
        patientId: this.selectedPatientId,
        doctorId: this.activePhysicianId,
      })
      .subscribe({
        next: (rows) => {
          this.alerts = rows;
          this.alertLoading = false;
        },
        error: () => {
          this.alerts = [];
          this.alertLoading = false;
        },
      });
  }

  get historyRows(): HistoryRow[] {
    const vitalRows: HistoryRow[] = this.vitals.map((v) => ({
      when: v.recordedAt,
      patientName: v.patientName,
      source: 'vital',
      summary: this.vitalSummary(v),
    }));
    const symptomRows: HistoryRow[] = this.symptoms.map((s) => ({
      when: s.reportedAt,
      patientName: s.patientName,
      source: 'symptom',
      summary: this.symptomSummary(s),
    }));

    return [...vitalRows, ...symptomRows].sort(
      (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime(),
    );
  }

  get avgTemperature(): string {
    const vals = this.vitals
      .map((x) => x.temperature)
      .filter((x): x is number => typeof x === 'number');
    if (!vals.length) return '—';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return avg.toFixed(1);
  }

  get avgHeartRate(): string {
    const vals = this.vitals
      .map((x) => x.heartRate)
      .filter((x): x is number => typeof x === 'number');
    if (!vals.length) return '—';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.round(avg).toString();
  }

  get latestPain(): string {
    const vals = this.symptoms
      .map((x) => x.painLevel)
      .filter((x): x is number => typeof x === 'number');
    if (!vals.length) return '—';
    return vals[0].toString();
  }

  get bpOutOfRangeCount(): number {
    return this.vitals.filter((v) => this.isBloodPressureOutOfRange(v.bloodPressure))
      .length;
  }

  get temperatureTrend(): TrendDirection {
    return this.computeTrend(
      this.vitals
        .map((x) => x.temperature)
        .filter((x): x is number => typeof x === 'number'),
    );
  }

  get heartRateTrend(): TrendDirection {
    return this.computeTrend(
      this.vitals
        .map((x) => x.heartRate)
        .filter((x): x is number => typeof x === 'number'),
    );
  }

  get painTrend(): TrendDirection {
    return this.computeTrend(
      this.symptoms
        .map((x) => x.painLevel)
        .filter((x): x is number => typeof x === 'number'),
    );
  }

  get trendsLast7Days(): DayTrend[] {
    const now = new Date();
    const days = [...Array(7).keys()].map((i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: d, key };
    });

    const counts = new Map<string, number>();
    for (const d of days) counts.set(d.key, 0);

    for (const v of this.vitals) {
      const key = new Date(v.recordedAt).toISOString().slice(0, 10);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    for (const s of this.symptoms) {
      const key = new Date(s.reportedAt).toISOString().slice(0, 10);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const max = Math.max(...Array.from(counts.values()), 1);
    return days.map((d) => ({
      label: d.date.toLocaleDateString(undefined, { weekday: 'short' }),
      value: counts.get(d.key) ?? 0,
      max,
    }));
  }

  /** Urgent instructions sent by this physician to the selected patient (newest first). */
  get alertsForSelectedPatient(): AlertDto[] {
    return [...this.alerts].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }

  get pendingValidationVitals(): VitalDto[] {
    return this.vitals.filter((v) => !v.verifiedAt);
  }

  get pendingValidationSymptoms(): SymptomDto[] {
    return this.symptoms.filter((s) => !s.verifiedAt);
  }

  trendIcon(direction: TrendDirection): string {
    if (direction === 'up') return 'trending-up';
    if (direction === 'down') return 'trending-down';
    return 'minus';
  }

  trendClass(direction: TrendDirection): string {
    if (direction === 'up') return 'trend-up';
    if (direction === 'down') return 'trend-down';
    return 'trend-flat';
  }

  barWidth(day: DayTrend): string {
    return `${Math.max(8, Math.round((day.value / day.max) * 100))}%`;
  }

  validateVital(v: VitalDto): void {
    if (v.verifiedAt) return;
    this.ensurePhysicianId((id) => {
      this.vitalsApi.verify(v._id, id).subscribe({
        next: (updated) => {
          this.vitals = this.vitals.map((x) =>
            x._id === updated._id ? updated : x,
          );
        },
      });
    });
  }

  validateSymptom(s: SymptomDto): void {
    if (s.verifiedAt) return;
    this.ensurePhysicianId((id) => {
      this.symptomsApi.verify(s._id, id).subscribe({
        next: (updated) => {
          this.symptoms = this.symptoms.map((x) =>
            x._id === updated._id ? updated : x,
          );
        },
      });
    });
  }

  openUrgentClinicFromVital(v: VitalDto): void {
    this.ensurePhysicianId((physicianId) => {
      const ref = this.dialog.open(UrgentClinicDialogComponent, {
        width: 'min(520px, 96vw)',
        data: { patientName: v.patientName },
      });
      ref.afterClosed().subscribe((r: UrgentClinicDialogResult | undefined) => {
        if (!r?.severity) return;
        const param =
          v.heartRate != null
            ? 'heartRate'
            : v.temperature != null
              ? 'temperature'
              : 'bloodPressure';
        const value =
          v.heartRate ?? v.temperature ?? (v.bloodPressure ? 1 : undefined);
        this.alertsApi
          .createUrgentClinicAlert({
            patientId: v.patientId,
            physicianUserId: physicianId,
            severity: r.severity,
            message: r.message || undefined,
            sourceType: 'vital',
            sourceId: v._id,
            parameter: param,
            value,
          })
          .subscribe({
            next: (created) => {
              this.alerts = [created, ...this.alerts];
            },
            error: (e) => console.error('Urgent clinic alert failed', e),
          });
      });
    });
  }

  openUrgentClinicFromSymptom(s: SymptomDto): void {
    this.ensurePhysicianId((physicianId) => {
      const ref = this.dialog.open(UrgentClinicDialogComponent, {
        width: 'min(520px, 96vw)',
        data: { patientName: s.patientName },
      });
      ref.afterClosed().subscribe((r: UrgentClinicDialogResult | undefined) => {
        if (!r?.severity) return;
        this.alertsApi
          .createUrgentClinicAlert({
            patientId: s.patientId,
            physicianUserId: physicianId,
            severity: r.severity,
            message: r.message || undefined,
            sourceType: 'symptom',
            sourceId: s._id,
            parameter: 'symptoms',
            value:
              typeof s.painLevel === 'number' ? s.painLevel : undefined,
          })
          .subscribe({
            next: (created) => {
              this.alerts = [created, ...this.alerts];
            },
            error: (e) => console.error('Urgent clinic alert failed', e),
          });
      });
    });
  }

  /**
   * Resolves physician id on demand (fixes race: /users/physicians may load after first paint).
   */
  private ensurePhysicianId(onReady: (physicianId: string) => void): void {
    if (this.activePhysicianId) {
      onReady(this.activePhysicianId);
      return;
    }
    this.usersApi.getPhysicians().subscribe({
      next: (rows) => {
        const id = rows[0]?._id ?? null;
        if (id) {
          this.activePhysicianId = id;
          onReady(id);
        } else {
          this.snack.open(
            this.translate.instant('DOCTOR_NO_PHYSICIAN_SNACK'),
            this.translate.instant('CLOSE'),
            { duration: 6000 },
          );
        }
      },
      error: () => {
        this.snack.open(
          this.translate.instant('DOCTOR_NO_PHYSICIAN_SNACK'),
          this.translate.instant('CLOSE'),
          { duration: 6000 },
        );
      },
    });
  }

  private vitalSummary(v: VitalDto): string {
    const parts: string[] = [];
    if (v.temperature != null) parts.push(`T ${v.temperature}°C`);
    if (v.heartRate != null) parts.push(`HR ${v.heartRate}`);
    if (v.bloodPressure) parts.push(`BP ${v.bloodPressure}`);
    if (v.weight != null) parts.push(`W ${v.weight}kg`);
    return parts.join(' · ') || '—';
  }

  private symptomSummary(s: SymptomDto): string {
    if (s.symptoms?.length) return s.symptoms.join(', ');
    if (s.description) return s.description;
    if (typeof s.painLevel === 'number') return `Pain ${s.painLevel}/10`;
    return '—';
  }

  private computeTrend(values: number[]): TrendDirection {
    if (values.length < 2) return 'flat';
    const latest = values[0];
    const previous = values[1];
    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'flat';
  }

  private isBloodPressureOutOfRange(bp?: string): boolean {
    if (!bp) return false;
    const m = bp.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
    if (!m) return false;
    const sys = Number(m[1]);
    const dia = Number(m[2]);
    return sys >= 140 || dia >= 90 || sys <= 90 || dia <= 60;
  }
}
