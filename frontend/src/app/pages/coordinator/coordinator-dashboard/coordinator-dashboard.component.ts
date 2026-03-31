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
} from 'src/app/services/coordinator.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-coordinator-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './coordinator-dashboard.component.html',
  styleUrls: ['./coordinator-dashboard.component.scss'],
})
export class CoordinatorDashboardComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);
  private router = inject(Router);

  coordinatorId = '69c32545a5201407afd209cf';

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
    completenessDistribution: [],
    recentPatients: [],
  };

  complianceData: ComplianceRow[] = [];
  displayedColumns: string[] = ['name', 'email', 'department', 'status'];
  complianceColumns: string[] = ['name', 'department', 'vitals', 'symptoms', 'compliant'];

  departmentChart: any = null;
  completenessChart: any = null;
  complianceChart: any = null;

  // Couleurs par département
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
        this.buildCharts();
      },
      error: (err) => console.error('Dashboard error', err),
    });

    this.coordinatorService.getComplianceToday(this.coordinatorId).subscribe({
      next: (data) => {
        this.complianceData = data;
        this.buildComplianceChart(data);
      },
      error: (err) => console.error('Compliance error', err),
    });
  }

  private getDeptColor(label: string): string {
    return this.deptColors[label] || '#2563eb';
  }

  private buildCharts(): void {
    const deptLabels = this.dashboardData.departmentDistribution.map((i) => i.label);
    const deptValues = this.dashboardData.departmentDistribution.map((i) => i.value);
    const deptColors = deptLabels.map((l) => this.getDeptColor(l));

    // Bar chart — une couleur par barre
    this.departmentChart = {
      series: [{ name: 'Patients', data: deptValues }],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
        foreColor: '#6b7280',
      },
      colors: deptColors,
      dataLabels: {
        enabled: true,
        style: { fontSize: '13px', fontWeight: 700, colors: ['#fff'] },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%',
          distributed: true, // une couleur par barre
          dataLabels: { position: 'top' },
        },
      },
      xaxis: {
        categories: deptLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '13px', fontWeight: 600 } },
      },
      yaxis: {
        min: 0,
        tickAmount: 4,
        labels: { formatter: (val: number) => Math.floor(val).toString() },
      },
      legend: { show: false },
      stroke: { show: false },
      tooltip: {
        theme: 'light',
        y: { formatter: (val: number) => `${val} patient${val > 1 ? 's' : ''}` },
      },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };

    // Donut chart completeness — même style visuel que le bar
    const total = this.dashboardData.summary.totalAssignedPatients;
    const complete = this.dashboardData.summary.completeProfiles;
    const incomplete = total - complete;
    const completePct = total > 0 ? Math.round((complete / total) * 100) : 0;

    this.completenessChart = {
      series: [complete, incomplete],
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'inherit',
        toolbar: { show: false },
      },
      colors: ['#10b981', '#ef7d57'],
      labels: ['Complete', 'Incomplete'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${Math.round(val)}%`,
        style: { fontSize: '13px', fontWeight: 700 },
        dropShadow: { enabled: false },
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 600,
        markers: { width: 12, height: 12, radius: 6 },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: { show: true, fontSize: '14px', fontWeight: 600, color: '#374151' },
              value: { show: true, fontSize: '26px', fontWeight: 700, color: '#111827' },
              total: {
                show: true,
                label: 'Compliance',
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b7280',
                formatter: () => `${completePct}%`,
              },
            },
          },
        },
      },
      stroke: { show: false },
      tooltip: {
        y: { formatter: (val: number) => `${val} patient${val > 1 ? 's' : ''}` },
      },
    };
  }

  private buildComplianceChart(data: ComplianceRow[]): void {
    if (data.length === 0) return;

    const names = data.map((p) => p.name.split(' ')[0]);
    const vitals = data.map((p) => (p.vitalsSubmitted ? 1 : 0));
    const symptoms = data.map((p) => (p.symptomsSubmitted ? 1 : 0));

    this.complianceChart = {
      series: [
        { name: 'Vitals Submitted', data: vitals },
        { name: 'Symptoms Submitted', data: symptoms },
      ],
      chart: {
        type: 'bar',
        height: 270,
        toolbar: { show: false },
        fontFamily: 'inherit',
        foreColor: '#6b7280',
        stacked: false,
      },
      colors: ['#2563eb', '#10b981'],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '35%',
          grouped: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => (val === 1 ? '✓' : '✗'),
        style: {
          fontSize: '14px',
          fontWeight: 700,
          colors: ['#fff'],
        },
      },
      xaxis: {
        categories: names,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '13px', fontWeight: 600 } },
      },
      yaxis: {
        min: 0,
        max: 1,
        tickAmount: 1,
        labels: {
          formatter: (val: number) => (val === 1 ? 'Yes' : 'No'),
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val: number) => (val === 1 ? '✓ Submitted' : '✗ Missing'),
        },
      },
      legend: {
        show: true,
        position: 'top',
        fontSize: '13px',
        fontWeight: 600,
        markers: { width: 12, height: 12, radius: 6 },
      },
      grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 4 },
    };
  }

  get recentPatients(): CoordinatorPatientRow[] {
    return this.dashboardData.recentPatients;
  }

  get complianceRate(): number {
    if (this.complianceData.length === 0) return 0;
    const compliant = this.complianceData.filter((p) => p.isFullyCompliant).length;
    return Math.round((compliant / this.complianceData.length) * 100);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}