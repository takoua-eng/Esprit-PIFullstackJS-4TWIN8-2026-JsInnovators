import { Component, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { PatientService, VitalEntry, SymptomEntry, AlertEntry } from 'src/app/services/patient.service';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule, CommonModule, RouterModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  todayDate = new Date();
  vitalsEnteredToday = false;
  symptomsEnteredToday = false;
  questionnaireAnsweredToday = false;
  latestVital: VitalEntry | null = null;
  recentAlerts: AlertEntry[] = [];
  pendingAlertsCount = 0;
  usageChartOptions: any;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    const patientId = this.patientService.getCurrentPatientId();
    if (!patientId) { this.buildUsageChart([], [], []); this.isLoading = false; return; }
    forkJoin({
      vitalsToday: this.patientService.hasEnteredVitalsToday(),
      symptomsToday: this.patientService.hasEnteredSymptomsToday(),
      questionnaireToday: this.patientService.hasRespondedToQuestionnaireToday(),
      latestVital: this.patientService.getLatestVital(),
      recentAlerts: this.patientService.getRecentAlerts(),
      pendingCount: this.patientService.getPendingAlertsCount(),
      allVitals: this.patientService.getMyVitals(),
      allSymptoms: this.patientService.getMySymptoms(),
      allQuestionnaires: this.patientService.getMyQuestionnaires(),
    }).subscribe({
      next: (data) => {
        this.vitalsEnteredToday = data.vitalsToday;
        this.symptomsEnteredToday = data.symptomsToday;
        this.questionnaireAnsweredToday = data.questionnaireToday;
        this.latestVital = data.latestVital;
        this.recentAlerts = data.recentAlerts;
        this.pendingAlertsCount = data.pendingCount;
        this.buildUsageChart(data.allVitals, data.allSymptoms, data.allQuestionnaires as any[]);
        this.isLoading = false;
      },
      error: () => { this.buildUsageChart([], [], []); this.isLoading = false; },
    });
  }

  buildUsageChart(vitals: VitalEntry[], symptoms: SymptomEntry[], questionnaires: any[]) {
    const days: string[] = [];
    const vitalsData: number[] = [];
    const symptomsData: number[] = [];
    const questData: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      days.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      vitalsData.push(vitals.some(v => new Date(v.recordedAt).toDateString() === ds) ? 1 : 0);
      symptomsData.push(symptoms.some(s => new Date(s.reportedAt).toDateString() === ds) ? 1 : 0);
      questData.push(questionnaires.some(q => { const d2 = q.submittedAt ?? q.createdAt; return d2 && new Date(d2).toDateString() === ds; }) ? 1 : 0);
    }
    this.usageChartOptions = {
      series: [
        { name: 'Vital Parameters', data: vitalsData },
        { name: 'Symptoms', data: symptomsData },
        { name: 'Questionnaires', data: questData },
      ],
      chart: { type: 'bar', height: 250, stacked: false, toolbar: { show: false } },
      xaxis: { categories: days, labels: { style: { fontSize: '11px' } } },
      yaxis: { min: 0, max: 1, tickAmount: 1, labels: { formatter: (v: number) => (v === 1 ? 'Done' : '') } },
      colors: ['#1976d2', '#ef5350', '#43a047'],
      legend: { position: 'top' },
      title: { text: 'This Week – Daily Activity', style: { fontSize: '13px', fontWeight: '600' } },
      dataLabels: { enabled: false },
      plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
      tooltip: { y: { formatter: (v: number) => (v === 1 ? 'Completed' : 'Not done') } },
    };
  }

  resolveAlert(alertId: string) {
    this.patientService.resolveAlert(alertId).subscribe(() => {
      this.recentAlerts = this.recentAlerts.filter(a => a._id !== alertId);
      this.pendingAlertsCount = Math.max(0, this.pendingAlertsCount - 1);
    });
  }
}
