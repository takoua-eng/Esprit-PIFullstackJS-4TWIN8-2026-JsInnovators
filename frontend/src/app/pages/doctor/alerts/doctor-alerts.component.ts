import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AlertDto,
  AlertsApiService,
  ClinicalReviewQueueItemDto,
} from 'src/app/services/alerts-api.service';
import { UsersApiService } from 'src/app/services/users-api.service';
import {
  DoctorSendAlertDialogComponent,
  DoctorSendAlertDialogData,
} from './doctor-send-alert-dialog.component';

@Component({
  selector: 'app-doctor-alerts',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    TranslateModule,
    DoctorSendAlertDialogComponent,
  ],
  templateUrl: './doctor-alerts.component.html',
  styleUrls: ['./doctor-alerts.component.scss'],
})
export class DoctorAlertsComponent implements OnInit {
  loading = true;
  queueLoading = true;
  error: string | null = null;
  queueError: string | null = null;
  alerts: AlertDto[] = [];
  reviewQueue: ClinicalReviewQueueItemDto[] = [];
  queueSortedBy: 'ai' | 'heuristic' | null = null;
  filter: 'all' | 'open' = 'open';
  activePhysicianId: string | null = null;
  noPhysicianAccount = false;
  sending = false;

  displayedColumns: string[] = [
    'createdAt',
    'patientName',
    'severity',
    'parameter',
    'message',
    'status',
  ];

  queueColumns: string[] = [
    'recordedAt',
    'patientName',
    'sourceType',
    'summary',
    'urgency',
    'actions',
  ];

  constructor(
    private readonly alertsApi: AlertsApiService,
    private readonly usersApi: UsersApiService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.queueLoading = true;
    this.error = null;
    this.queueError = null;
    this.noPhysicianAccount = false;
    this.usersApi.getPhysicians().subscribe({
      next: (rows) => {
        this.activePhysicianId = rows[0]?._id ?? null;
        if (!this.activePhysicianId) {
          this.noPhysicianAccount = true;
          this.alerts = [];
          this.reviewQueue = [];
          this.loading = false;
          this.queueLoading = false;
          return;
        }
        this.alertsApi
          .getAlerts({ doctorId: this.activePhysicianId })
          .subscribe({
            next: (list) => {
              this.alerts = list;
              this.loading = false;
            },
            error: (err) => {
              console.error('Failed to load doctor alerts', err);
              const status = err?.status
                ? `HTTP ${err.status}`
                : 'Network/API error';
              this.error = status;
              this.loading = false;
            },
          });

        this.alertsApi
          .getClinicalReviewQueue(this.activePhysicianId)
          .subscribe({
            next: (res) => {
              this.reviewQueue = res.items;
              this.queueSortedBy = res.sortedBy;
              this.queueLoading = false;
            },
            error: (err) => {
              console.error('Failed to load clinical review queue', err);
              const status = err?.status
                ? `HTTP ${err.status}`
                : 'Network/API error';
              this.queueError = status;
              this.queueLoading = false;
            },
          });
      },
      error: (err) => {
        console.error('Failed to resolve physician', err);
        const status = err?.status
          ? `HTTP ${err.status}`
          : 'Network/API error';
        this.error = status;
        this.loading = false;
        this.queueLoading = false;
      },
    });
  }

  get filteredAlerts(): AlertDto[] {
    if (this.filter === 'open') {
      return this.alerts.filter((a) => a.status === 'open');
    }
    return this.alerts;
  }

  severityClass(sev: string): string {
    const s = (sev || '').toLowerCase();
    if (s === 'critical' || s === 'high') return 'sev-high';
    if (s === 'medium') return 'sev-medium';
    return 'sev-low';
  }

  queueSeverityClass(row: ClinicalReviewQueueItemDto): string {
    return this.severityClass(row.heuristicSeverity);
  }

  openSendAlert(
    row: ClinicalReviewQueueItemDto,
    preset: 'high' | 'medium' | 'low',
  ): void {
    if (!this.activePhysicianId || this.sending) return;

    const severityLabels: Record<string, string> = {
      high: this.translate.instant('DOCTOR_ALERT_SEV_HIGH'),
      medium: this.translate.instant('DOCTOR_ALERT_SEV_MEDIUM'),
      low: this.translate.instant('DOCTOR_ALERT_SEV_LOW'),
    };

    const typeLabel =
      row.sourceType === 'vital'
        ? this.translate.instant('DOCTOR_ALERT_TYPE_VITAL')
        : this.translate.instant('DOCTOR_ALERT_TYPE_SYMPTOM');

    const data: DoctorSendAlertDialogData = {
      patientName: row.patientName,
      sourceLabel: `${typeLabel}: ${row.summary}`,
      defaultSeverityLabel: severityLabels[preset] ?? preset,
    };

    const ref = this.dialog.open(DoctorSendAlertDialogComponent, {
      data,
      width: '520px',
      autoFocus: 'textarea',
    });

    ref.afterClosed().subscribe((result) => {
      if (!result?.message?.trim()) return;
      this.sending = true;
      this.alertsApi
        .createUrgentClinicAlert({
          patientId: row.patientId,
          physicianUserId: this.activePhysicianId!,
          severity: preset,
          message: result.message.trim(),
          sourceType: row.sourceType,
          sourceId: row.sourceId,
          parameter: row.parameter,
          value: row.value,
          threshold: row.threshold,
          type: 'physician_instruction',
        })
        .subscribe({
          next: () => {
            this.sending = false;
            this.snackBar.open(
              this.translate.instant('DOCTOR_ALERT_SENT_OK'),
              undefined,
              { duration: 3500 },
            );
            this.load();
          },
          error: (err) => {
            this.sending = false;
            console.error(err);
            this.snackBar.open(
              this.translate.instant('DOCTOR_ALERT_SENT_FAIL'),
              undefined,
              { duration: 5000 },
            );
          },
        });
    });
  }
}
