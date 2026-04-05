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
      .get<PredictionResponse>(`http://localhost:3000/coordinator/${this.coordinatorId}/prediction`)
      .subscribe({
        next: (data) => {
          this.prediction = data;
          this.loading = false;
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

    const highRisk = this.prediction.patients.filter(p => p.riskLevel === 'HIGH');
    const mediumRisk = this.prediction.patients.filter(p => p.riskLevel === 'MEDIUM');
    const lowRisk = this.prediction.patients.filter(p => p.riskLevel === 'LOW');

    const prompt = `You are a medical coordinator assistant. Analyze this patient compliance data from the last ${this.prediction.periodDays} days and provide a concise, actionable morning briefing in English.

PATIENT DATA:
${this.prediction.patients.map(p =>
  `- ${p.name} (${p.department}): Risk=${p.riskLevel}, Compliance=${p.complianceRate}%, Missing=${p.consecutiveMissingDays} consecutive days, Vitals submitted=${p.totalVitalSubmissions} times, Symptoms submitted=${p.totalSymptomSubmissions} times${p.lastSubmission ? ', Last submission=' + new Date(p.lastSubmission).toLocaleDateString() : ', Never submitted'}`
).join('\n')}

HIGH RISK (${highRisk.length}): ${highRisk.map(p => p.name).join(', ') || 'None'}
MEDIUM RISK (${mediumRisk.length}): ${mediumRisk.map(p => p.name).join(', ') || 'None'}
LOW RISK (${lowRisk.length}): ${lowRisk.map(p => p.name).join(', ') || 'None'}

Write a professional morning briefing with:
1. Summary of compliance situation (2-3 sentences)
2. Top priority patients to contact today
3. Recommended actions for high-risk patients
4. A positive note if any patients are doing well

Keep it concise, professional, and actionable. Use bullet points where appropriate.`;

    // Appel via backend proxy — pas directement à l'API Anthropic
    this.coordinatorService.generatePredictionAI(this.coordinatorId, prompt).subscribe({
      next: (res) => {
        if (res.response) {
          this.aiAnalysis = res.response;
        } else {
          this.aiError = 'AI analysis unavailable.';
        }
        this.loadingAi = false;
      },
      error: () => {
        this.aiError = 'AI analysis unavailable. Please check your API configuration.';
        this.loadingAi = false;
      },
    });
  }

  selectPatient(patient: PatientPrediction): void {
    this.selectedPatient = this.selectedPatient?.patientId === patient.patientId ? null : patient;
  }

  sendReminderToPatient(patient: PatientPrediction): void {
    const message = `Dear ${patient.name.split(' ')[0]}, this is a reminder to complete your daily health follow-up. You have missed ${patient.consecutiveMissingDays} consecutive day(s). Compliance rate: ${patient.complianceRate}%. Please submit your vital signs and symptoms report.`;

    this.coordinatorService.createReminder(this.coordinatorId, {
      patientId: patient.patientId,
      type: 'follow_up',
      message,
      status: 'scheduled',
    }).subscribe({
      next: (reminder) => {
        this.coordinatorService.sendReminder(reminder._id).subscribe({
          next: () => alert(`Reminder sent to ${patient.name}`),
        });
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
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get highRiskCount(): number { return this.prediction?.patients.filter(p => p.riskLevel === 'HIGH').length || 0; }
  get mediumRiskCount(): number { return this.prediction?.patients.filter(p => p.riskLevel === 'MEDIUM').length || 0; }
  get lowRiskCount(): number { return this.prediction?.patients.filter(p => p.riskLevel === 'LOW').length || 0; }

  get avgCompliance(): number {
    if (!this.prediction?.patients.length) return 0;
    return Math.round(this.prediction.patients.reduce((sum, p) => sum + p.complianceRate, 0) / this.prediction.patients.length);
  }
}
