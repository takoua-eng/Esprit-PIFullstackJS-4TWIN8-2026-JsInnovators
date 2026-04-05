import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CoordinatorService } from 'src/app/services/coordinator.service';

export interface PatientPrediction {
  patientId: string;
  name: string;
  email: string;
  department: string;
  complianceRate: number;
  consecutiveMissingDays: number;
  lastSubmission: string | null;
  totalVitalSubmissions: number;
  totalSymptomSubmissions: number;
  riskScore: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  vitalDaysCount: number;
  symptomDaysCount: number;
}

export interface PredictionResponse {
  generatedAt: string;
  periodDays: number;
  patients: PatientPrediction[];
}

@Component({
  selector: 'app-ai-prediction',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, TranslateModule],
  templateUrl: './ai-prediction.component.html',
  styleUrls: ['./ai-prediction.component.scss'],
})
export class AiPredictionComponent implements OnInit {
  private http = inject(HttpClient);
  private coordinatorService = inject(CoordinatorService);

  coordinatorId = '69c32545a5201407afd209cf';

  prediction: PredictionResponse | null = null;
  loading = true;
  loadingAi = false;
  aiAnalysis = '';
  aiError = '';
  selectedPatient: PatientPrediction | null = null;

  ngOnInit(): void {
    this.loadPrediction();
  }

  loadPrediction(): void {
    this.loading = true;
    this.http
      .get<PredictionResponse>(
        `http://localhost:3000/coordinator/${this.coordinatorId}/prediction`,
      )
      .subscribe({
        next: (data) => {
          this.prediction = data;
          this.loading = false;
          // Lancer l'analyse IA automatiquement
          this.runAiAnalysis();
        },
        error: (err) => {
          console.error('Prediction error', err);
          this.loading = false;
        },
      });
  }

  runAiAnalysis(): void {
    if (!this.prediction) return;
    this.loadingAi = true;
    this.aiAnalysis = '';
    this.aiError = '';

    const highRisk = this.prediction.patients.filter(
      (p) => p.riskLevel === 'HIGH',
    );
    const mediumRisk = this.prediction.patients.filter(
      (p) => p.riskLevel === 'MEDIUM',
    );
    const lowRisk = this.prediction.patients.filter(
      (p) => p.riskLevel === 'LOW',
    );

    const prompt = `You are a medical coordinator assistant. Analyze this patient compliance data from the last ${this.prediction.periodDays} days and provide a concise, actionable morning briefing in English.

PATIENT DATA:
${this.prediction.patients
  .map(
    (p) => `- ${p.name} (${p.department}): Risk=${p.riskLevel}, Compliance=${p.complianceRate}%, Missing=${p.consecutiveMissingDays} consecutive days, Vitals submitted=${p.totalVitalSubmissions} times, Symptoms submitted=${p.totalSymptomSubmissions} times${p.lastSubmission ? ', Last submission=' + new Date(p.lastSubmission).toLocaleDateString() : ', Never submitted'}`,
  )
  .join('\n')}

HIGH RISK patients (${highRisk.length}): ${highRisk.map((p) => p.name).join(', ') || 'None'}
MEDIUM RISK patients (${mediumRisk.length}): ${mediumRisk.map((p) => p.name).join(', ') || 'None'}
LOW RISK patients (${lowRisk.length}): ${lowRisk.map((p) => p.name).join(', ') || 'None'}

Write a professional morning briefing with:
1. A summary of today's compliance situation (2-3 sentences)
2. Top priority patients to contact today (with specific reasons)
3. Recommended actions for each high-risk patient
4. A positive note if any patients are doing well

Keep it concise, medical-professional tone, and actionable. Use bullet points where appropriate.`;

    this.http
      .post<any>('https://api.anthropic.com/v1/messages', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      })
      .subscribe({
        next: (res) => {
          this.aiAnalysis =
            res.content?.[0]?.text || 'No analysis generated.';
          this.loadingAi = false;
        },
        error: (err) => {
          console.error('AI error', err);
          this.aiError =
            'AI analysis unavailable. Please check your API configuration.';
          this.loadingAi = false;
        },
      });
  }

  selectPatient(patient: PatientPrediction): void {
    this.selectedPatient =
      this.selectedPatient?.patientId === patient.patientId ? null : patient;
  }

  sendReminderToPatient(patient: PatientPrediction): void {
    const message = `Dear ${patient.name.split(' ')[0]}, this is a reminder to please complete your daily health follow-up. You have missed ${patient.consecutiveMissingDays} consecutive day(s). Your compliance rate is ${patient.complianceRate}%. Please submit your vital signs and symptoms report as soon as possible.`;

    this.coordinatorService
      .createReminder(this.coordinatorId, {
        patientId: patient.patientId,
        type: 'follow_up',
        message,
        status: 'sent',
      })
      .subscribe({
        next: () => {
          // Marquer visuellement
          patient.riskLevel = patient.riskLevel; // trigger change detection
          alert(`Reminder sent to ${patient.name}`);
        },
        error: (err) => console.error('Reminder error', err),
      });
  }

  getRiskColor(level: string): string {
    if (level === 'HIGH') return '#ef4444';
    if (level === 'MEDIUM') return '#f59e0b';
    return '#10b981';
  }

  getRiskBgColor(level: string): string {
    if (level === 'HIGH') return '#fef2f2';
    if (level === 'MEDIUM') return '#fffbeb';
    return '#f0fdf4';
  }

  getRiskIcon(level: string): string {
    if (level === 'HIGH') return 'alert-triangle';
    if (level === 'MEDIUM') return 'alert-circle';
    return 'circle-check';
  }

  formatDate(date: string | null): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  get highRiskCount(): number {
    return this.prediction?.patients.filter((p) => p.riskLevel === 'HIGH').length || 0;
  }

  get mediumRiskCount(): number {
    return this.prediction?.patients.filter((p) => p.riskLevel === 'MEDIUM').length || 0;
  }

  get lowRiskCount(): number {
    return this.prediction?.patients.filter((p) => p.riskLevel === 'LOW').length || 0;
  }

  get avgCompliance(): number {
    if (!this.prediction?.patients.length) return 0;
    const total = this.prediction.patients.reduce((sum, p) => sum + p.complianceRate, 0);
    return Math.round(total / this.prediction.patients.length);
  }
}
