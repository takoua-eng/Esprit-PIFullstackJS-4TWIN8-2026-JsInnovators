import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  CoordinatorDashboardResponse,
  CoordinatorPatientRow,
  ComplianceRow,
  CoordinatorService,
  buildReminderMessages,
} from 'src/app/services/coordinator.service';
import { NgApexchartsModule } from 'ng-apexcharts';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-coordinator-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, NgApexchartsModule, FormsModule, TranslateModule],
  templateUrl: './coordinator-dashboard.component.html',
  styleUrls: ['./coordinator-dashboard.component.scss'],
})
export class CoordinatorDashboardComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);
  private router = inject(Router);

  coordinatorId = '69c32545a5201407afd209cf';
  remindedPatientIds: Set<string> = new Set(
  JSON.parse(localStorage.getItem('reminded_patients') || '[]')
);

  dashboardData: CoordinatorDashboardResponse = {
    summary: {
      totalAssignedPatients: 0,
      departmentsCovered: 0,
      completeProfiles: 0,
      missingEmergencyContact: 0,
      patientsWithMedicalRecord: 0,
      remindersSentToday: 0,
      pendingReminders: 0,
      missingVitalsToday: 0,
      missingSymptomsToday: 0,
    },
    departmentDistribution: [],
    recentPatients: [],
  };

  complianceData: ComplianceRow[] = [];

  departmentChart: any = null;
  submissionOverviewChart: any = null;
  complianceChart: any = null;
  missingFieldsChart: any = null;

  // Pour le reminder inline dans la card
  selectedReminderId: string | null = null;
  selectedReminderMessage: string = '';
  reminderMessageOptions: { value: string; label: string }[] = [];

  private deptColors: Record<string, string> = {
    Cardio: '#2563eb',
    Neurology: '#7c3aed',
    Oncology: '#db2777',
    Pediatrics: '#059669',
    Orthopedics: '#d97706',
    Unknown: '#94a3b8',
  };

  ngOnInit(): void {
    this.coordinatorService.getDashboard(this.coordinatorId).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.buildDepartmentChart();
      },
      error: (err) => console.error('Dashboard error', err),
    });

    this.coordinatorService.getComplianceToday(this.coordinatorId).subscribe({
      next: (data) => {
        this.complianceData = data;
        this.buildComplianceChart(data);
        this.buildSubmissionOverviewChart(data);
        this.buildMissingFieldsChart(data);
      },
      error: (err) => console.error('Compliance error', err),
    });
  }

  private getDeptColor(label: string): string {
    return this.deptColors[label] || '#2563eb';
  }

  private buildDepartmentChart(): void {
    const deptLabels = this.dashboardData.departmentDistribution.map((i) => i.label);
    const deptValues = this.dashboardData.departmentDistribution.map((i) => i.value);
    const deptColors = deptLabels.map((l) => this.getDeptColor(l));

    this.departmentChart = {
      series: [{ name: 'Patients', data: deptValues }],
      chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit', foreColor: '#6b7280' },
      colors: deptColors,
      dataLabels: { enabled: true, style: { fontSize: '13px', fontWeight: 700, colors: ['#fff'] } },
      plotOptions: { bar: { borderRadius: 8, columnWidth: '50%', distributed: true } },
      xaxis: { categories: deptLabels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '13px', fontWeight: 600 } } },
      yaxis: { min: 0, tickAmount: 4, labels: { formatter: (val: number) => Math.floor(val).toString() } },
      legend: { show: false },
      stroke: { show: false },
      tooltip: { theme: 'light', y: { formatter: (val: number) => `${val} patient${val > 1 ? 's' : ''}` } },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };
  }

  private buildSubmissionOverviewChart(data: ComplianceRow[]): void {
    const fullyCompliant = data.filter((p) => p.isFullyCompliant).length;
    const partial = data.filter(
      (p) => !p.isFullyCompliant && (p.vitalsSubmitted || p.symptomsSubmitted)
    ).length;
    const noSubmission = data.filter(
      (p) => !p.vitalsSubmitted && !p.symptomsSubmitted
    ).length;
    const total = data.length;
    const rate = total > 0 ? Math.round((fullyCompliant / total) * 100) : 0;

    this.submissionOverviewChart = {
      series: [fullyCompliant, partial, noSubmission],
      chart: { type: 'donut', height: 280, fontFamily: 'inherit', toolbar: { show: false } },
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      labels: ['Fully Compliant', 'Partial', 'No Submission'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '13px', fontWeight: 700 },
        dropShadow: { enabled: false },
      },
      legend: { show: true, position: 'bottom', fontSize: '13px', fontWeight: 600 },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Compliance',
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b7280',
                formatter: () => `${rate}%`,
              },
            },
          },
        },
      },
      stroke: { show: false },
      tooltip: { y: { formatter: (val: number) => `${val} patient${val > 1 ? 's' : ''}` } },
    };
  }

  private buildComplianceChart(data: ComplianceRow[]): void {
    if (data.length === 0) return;

    const names = data.map((p) => p.name.split(' ')[0]);

    // 0 = missing, 1 = submitted but incomplete, 2 = fully complete
    const vitals = data.map((p) => {
      if (!p.vitalsSubmitted) return 0;
      if (!p.vitalsFullyComplete) return 1;
      return 2;
    });

    const symptoms = data.map((p) => {
      if (!p.symptomsSubmitted) return 0;
      if (!p.symptomsFullyComplete) return 1;
      return 2;
    });

    this.complianceChart = {
      series: [
        { name: 'Vitals', data: vitals },
        { name: 'Symptoms', data: symptoms },
      ],
      chart: { type: 'bar', height: 270, toolbar: { show: false }, fontFamily: 'inherit', foreColor: '#6b7280' },
      colors: ['#2563eb', '#10b981'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '35%', grouped: true } },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          if (val === 0) return '✗';
          if (val === 1) return '~';
          return '✓';
        },
        style: { fontSize: '14px', fontWeight: 700, colors: ['#fff'] },
      },
      xaxis: {
        categories: names,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '13px', fontWeight: 600 } },
      },
      yaxis: {
        min: 0,
        max: 2,
        tickAmount: 2,
        labels: {
          formatter: (val: number) => {
            if (val === 0) return 'Missing';
            if (val === 1) return 'Partial';
            return 'Complete';
          },
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val: number) => {
            if (val === 0) return '✗ Not submitted';
            if (val === 1) return '~ Submitted but incomplete';
            return '✓ Fully complete';
          },
        },
      },
      legend: { show: true, position: 'top', fontSize: '13px', fontWeight: 600 },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };
  }

  private buildMissingFieldsChart(data: ComplianceRow[]): void {
    // Compte combien de fois chaque champ est manquant
    const fieldCount: Record<string, number> = {};

    for (const p of data) {
      for (const f of p.missingVitalFields) {
        fieldCount[f] = (fieldCount[f] || 0) + 1;
      }
      for (const f of p.missingSymptomFields) {
        fieldCount[f] = (fieldCount[f] || 0) + 1;
      }
    }

    const labels = Object.keys(fieldCount);
    const values = Object.values(fieldCount);

    if (labels.length === 0) {
      this.missingFieldsChart = null;
      return;
    }

    this.missingFieldsChart = {
      series: [{ name: 'Patients with missing field', data: values }],
      chart: { type: 'bar', height: 240, toolbar: { show: false }, fontFamily: 'inherit', foreColor: '#6b7280' },
      colors: ['#ef4444'],
      dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 700, colors: ['#fff'] } },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', horizontal: false } },
      xaxis: {
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: {
        min: 0,
        tickAmount: 3,
        labels: { formatter: (val: number) => Math.floor(val).toString() },
      },
      tooltip: { theme: 'light', y: { formatter: (val: number) => `${val} patient${val > 1 ? 's' : ''}` } },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };
  }

  get patientsNeedingAction(): ComplianceRow[] {
    return this.complianceData.filter((p) => !p.isFullyCompliant);
  }

  get complianceRate(): number {
    if (this.complianceData.length === 0) return 0;
    const compliant = this.complianceData.filter((p) => p.isFullyCompliant).length;
    return Math.round((compliant / this.complianceData.length) * 100);
  }

  openReminderFor(patient: ComplianceRow): void {
  this.selectedReminderId = patient._id;
  // Charger le message personnalisé depuis la DB
  this.coordinatorService.getPersonalizedMessage(this.coordinatorId, patient._id).subscribe({
    next: (data) => {
      this.reminderMessageOptions = [
        { value: data.message, label: 'Personalized message based on missing fields' },
        { value: 'Reminder: Please complete your daily health follow-up as soon as possible.', label: 'General follow-up reminder' },
      ];
      this.selectedReminderMessage = data.message;
    },
    error: () => {
      this.reminderMessageOptions = buildReminderMessages(patient.missingVitalFields, patient.missingSymptomFields);
      this.selectedReminderMessage = this.reminderMessageOptions[0]?.value || '';
    }
  });
}

  closeReminder(): void {
    this.selectedReminderId = null;
    this.selectedReminderMessage = '';
    this.reminderMessageOptions = [];
  }

  navigateTo(path: string): void {
  const routeMap: Record<string, string> = {
    '/dashboard/coordinator/patients': '/admin/coordinator/patients',
    '/dashboard/coordinator/reminders': '/admin/coordinator/reminders',
  };
  this.router.navigate([routeMap[path] || path]);
}

confirmReminder(patient: ComplianceRow): void {
  if (!this.selectedReminderMessage.trim()) return;

  this.coordinatorService
    .createReminder(this.coordinatorId, {
      patientId: patient._id,
      type: 'follow_up',
      message: this.selectedReminderMessage,
      status: 'scheduled',
    })
    .subscribe({
      next: (reminder) => {
        // Envoyer immédiatement (email + planification SMS)
        this.coordinatorService.sendReminder(reminder._id).subscribe({
          next: () => {
            this.remindedPatientIds.add(patient._id);
            localStorage.setItem('reminded_patients', JSON.stringify([...this.remindedPatientIds]));
            this.closeReminder();
          }
        });
      },
      error: (err) => console.error('Reminder error', err),
    });
}
}