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
import { buildJitsiMeetUrl } from 'src/app/core/api.config';
import { VideoCallsApiService } from 'src/app/services/video-calls-api.service';

@Component({
  selector: 'app-doctor-alerts',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    TranslateModule,
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
  /** No Mongo user id in JWT — cannot scope alerts */
  noDoctorSession = false;
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
    'videoCall',
    'actions',
  ];

  constructor(
    private readonly alertsApi: AlertsApiService,
    private readonly videoCallsApi: VideoCallsApiService,
    private readonly usersApi: UsersApiService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** MongoDB user id from JWT `sub` (same as logged-in doctor). */
  private userIdFromAccessToken(): string | null {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { sub?: string };
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  load(): void {
    this.loading = true;
    this.queueLoading = true;
    this.error = null;
    this.queueError = null;
    this.noDoctorSession = false;

    const doctorId = this.userIdFromAccessToken();
    if (doctorId) {
      this.activePhysicianId = doctorId;
      this.fetchAlertsForDoctor(doctorId);
      return;
    }

    this.usersApi.getPhysicians().subscribe({
      next: (rows) => {
        this.activePhysicianId = rows[0]?._id ?? null;
        if (!this.activePhysicianId) {
          this.noDoctorSession = true;
          this.alerts = [];
          this.reviewQueue = [];
          this.loading = false;
          this.queueLoading = false;
          return;
        }
        this.fetchAlertsForDoctor(this.activePhysicianId);
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

  private fetchAlertsForDoctor(doctorId: string): void {
    this.alertsApi.getAlerts({ doctorId }).subscribe({
      next: (list) => {
        this.alerts = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load doctor alerts', err);
        const status = err?.status ? `HTTP ${err.status}` : 'Network/API error';
        this.error = status;
        this.loading = false;
      },
    });

    this.alertsApi.getClinicalReviewQueue(doctorId).subscribe({
      next: (res) => {
        this.reviewQueue = res.items;
        this.queueSortedBy = res.sortedBy;
        this.queueLoading = false;
      },
      error: (err) => {
        console.error('Failed to load clinical review queue', err);
        const status = err?.status ? `HTTP ${err.status}` : 'Network/API error';
        this.queueError = status;
        this.queueLoading = false;
      },
    });
  }

  /** Reload only issued alerts — keeps clinical review visible (no full-page queue spinner). */
  private refreshIssuedAlertsOnly(doctorId: string): void {
    this.alertsApi.getAlerts({ doctorId }).subscribe({
      next: (list) => {
        this.alerts = list;
      },
      error: (err) => {
        console.error('Failed to refresh issued alerts', err);
      },
    });
  }

  /** Soft-refresh clinical queue without hiding the table (e.g. after data might change). */
  private refreshClinicalQueueQuiet(doctorId: string): void {
    this.alertsApi.getClinicalReviewQueue(doctorId).subscribe({
      next: (res) => {
        this.reviewQueue = res.items;
        this.queueSortedBy = res.sortedBy;
        this.queueError = null;
      },
      error: (err) => {
        console.error('Failed to refresh clinical review queue', err);
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
    const c = row.severityCategory;
    if (c === 'urgent') return 'sev-high';
    if (c === 'warning') return 'sev-medium';
    if (c === 'info') return 'sev-low';
    return this.severityClass(row.heuristicSeverity);
  }

  severityLabel(row: ClinicalReviewQueueItemDto): string {
    if (row.severityCategory === 'urgent') {
      return this.translate.instant('DOCTOR_SEVERITY_URGENT');
    }
    if (row.severityCategory === 'warning') {
      return this.translate.instant('DOCTOR_SEVERITY_WARNING');
    }
    if (row.severityCategory === 'info') {
      return this.translate.instant('DOCTOR_SEVERITY_INFO');
    }
    return row.heuristicSeverity;
  }

  /**
   * Opens a browser video room (default: Jitsi Meet) in a new tab.
   * Room name is stable per patient + doctor so you can share it with the patient for the same call.
   */
  openVideoCall(row: ClinicalReviewQueueItemDto): void {
    if (!this.activePhysicianId) return;
    this.videoCallsApi
      .invite({
        patientId: row.patientId,
        physicianUserId: this.activePhysicianId,
      })
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('DOCTOR_VIDEO_CALL_NOTIFY_OK'),
            undefined,
            { duration: 3000 },
          );
          const room = `EspritCare-${row.patientId}-${this.activePhysicianId}`;
          window.open(buildJitsiMeetUrl(room), '_blank', 'noopener,noreferrer');
        },
        error: (err) => {
          console.error('Video call invite failed', err);
          this.snackBar.open(
            this.translate.instant('DOCTOR_VIDEO_CALL_NOTIFY_FAIL'),
            undefined,
            { duration: 5000 },
          );
        },
      });
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
      severityPreset: preset,
      summary: row.summary,
      sourceType: row.sourceType,
      parameter: row.parameter,
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
            // Issued alert is new; clinical review is still driven by vitals/symptoms — do not
            // run full load() (that clears the queue UI with queueLoading). Refresh lists separately.
            if (this.activePhysicianId) {
              this.refreshIssuedAlertsOnly(this.activePhysicianId);
              this.refreshClinicalQueueQuiet(this.activePhysicianId);
            }
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
