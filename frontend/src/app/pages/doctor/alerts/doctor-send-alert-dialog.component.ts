import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertsApiService } from 'src/app/services/alerts-api.service';

export interface DoctorSendAlertDialogData {
  patientName: string;
  sourceLabel: string;
  defaultSeverityLabel: string;
  /** Matches the button the doctor chose (red / yellow / green band). */
  severityPreset: 'high' | 'medium' | 'low';
  /** Full clinical line for AI / template. */
  summary: string;
  sourceType: 'vital' | 'symptom';
  parameter?: string;
}

export interface DoctorSendAlertDialogResult {
  message: string;
}

@Component({
  selector: 'app-doctor-send-alert-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TranslateModule],
  templateUrl: './doctor-send-alert-dialog.component.html',
  styleUrls: ['./doctor-send-alert-dialog.component.scss'],
})
export class DoctorSendAlertDialogComponent implements OnInit {
  message = '';
  loadingSuggestion = true;
  suggestionSource: 'groq' | 'template' | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DoctorSendAlertDialogData,
    private readonly dialogRef: MatDialogRef<
      DoctorSendAlertDialogComponent,
      DoctorSendAlertDialogResult | undefined
    >,
    private readonly alertsApi: AlertsApiService,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.alertsApi
      .suggestDoctorMessage({
        patientName: this.data.patientName,
        summary: this.data.summary,
        severityPreset: this.data.severityPreset,
        sourceType: this.data.sourceType,
        parameter: this.data.parameter,
      })
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.suggestionSource = res.source;
          this.loadingSuggestion = false;
        },
        error: () => {
          this.message = this.fallbackMessage();
          this.suggestionSource = 'template';
          this.loadingSuggestion = false;
        },
      });
  }

  private fallbackMessage(): string {
    const name = this.data.patientName?.trim() || 'there';
    const ctx = this.data.summary?.trim() || 'your recent update';
    return `Hello ${name}, we reviewed: ${ctx}. Please follow your care plan and contact us if symptoms change.`;
  }

  severityBandClass(): string {
    const p = this.data.severityPreset;
    if (p === 'high') return 'sev-band-high';
    if (p === 'medium') return 'sev-band-medium';
    return 'sev-band-low';
  }

  severityBandLabel(): string {
    const p = this.data.severityPreset;
    if (p === 'high') {
      return this.translate.instant('DOCTOR_ALERT_BAND_HIGH');
    }
    if (p === 'medium') {
      return this.translate.instant('DOCTOR_ALERT_BAND_MEDIUM');
    }
    return this.translate.instant('DOCTOR_ALERT_BAND_LOW');
  }

  suggestionSourceLabel(): string {
    if (this.suggestionSource === 'groq') {
      return this.translate.instant('DOCTOR_ALERT_AI_GROQ');
    }
    if (this.suggestionSource === 'template') {
      return this.translate.instant('DOCTOR_ALERT_AI_TEMPLATE');
    }
    return '';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  send(): void {
    const msg = this.message.trim();
    if (!msg.length) return;
    this.dialogRef.close({ message: msg });
  }
}
