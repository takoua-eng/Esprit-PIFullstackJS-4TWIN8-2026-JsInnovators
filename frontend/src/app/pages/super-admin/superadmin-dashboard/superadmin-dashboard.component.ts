import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';

import { AuditApiService, AuditLog, AuditStats } from '../../../services/audit.service';
import { UsersApiService } from '../../../services/users-api.service';
import { AlertsApiService, AlertDto } from '../../../services/alerts-api.service';
import { ServiceService } from '../../../services/superadmin/service.service';
import { PatientService } from '../../../services/superadmin/patient.service';
import { RemindersApiService } from '../../../services/reminders-api.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss'],
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {

  // KPIs
  totalUsers = 0;
  totalPatients = 0;
  totalDoctors = 0;
  totalNurses = 0;
  activeAlerts = 0;
  totalReminders = 0;
  pendingReminders = 0;
  criticalAlerts = 0;
  totalServices = 0;
  totalAuditEvents = 0;
  lastRefresh = new Date();

  // Alerts
  recentAlerts: AlertDto[] = [];
  criticalAlertsList: AlertDto[] = [];

  // Services
  services: any[] = [];

  // Audit
  recentLogs: AuditLog[] = [];

  // Charts
  alertsChart: any = {};
  usersRoleChart: any = {};
  activityChart: any = {};

  // AI Insights (simulated from real data)
  aiInsights: { icon: string; color: string; text: string }[] = [];

  // Users by role (from backend stats)
  usersByRole: { role: string; count: number; color: string; icon: string }[] = [];

  private sub?: Subscription;

  constructor(
    private auditService: AuditApiService,
    private usersService: UsersApiService,
    private alertsService: AlertsApiService,
    private serviceService: ServiceService,
    private patientService: PatientService,
    private remindersService: RemindersApiService,
  ) {}

  ngOnInit(): void {
    this.sub = interval(20000).pipe(
      startWith(0),
      switchMap(() => forkJoin({
        users:     this.usersService.getAllUsers().pipe(catchError(() => of([]))),
        alerts:    this.alertsService.getAlerts().pipe(catchError(() => of([]))),
        services:  this.serviceService.getServices().pipe(catchError(() => of([]))),
        patients:  this.patientService.getPatients().pipe(catchError(() => of([]))),
        stats:     this.auditService.getStats().pipe(catchError(() => of(null))),
        logs:      this.auditService.getLogs().pipe(catchError(() => of([]))),
        reminders: this.remindersService.getReminders().pipe(catchError(() => of([]))),
      })),
    ).subscribe({
      next: ({ users, alerts, services, patients, stats, logs, reminders }) => {
        this.lastRefresh = new Date();
        this.applyUsers(users as any[]);
        this.applyAlerts(alerts as AlertDto[]);
        this.applyServices(services as any[]);
        this.totalPatients = (patients as any[]).length;
        if (stats) this.applyAuditStats(stats as AuditStats);
        this.recentLogs = (logs as AuditLog[]).slice(0, 6);
        this.generateAiInsights(alerts as AlertDto[], patients as any[]);
        // Reminders
        const rems = reminders as any[];
        this.totalReminders   = rems.length;
        this.pendingReminders = rems.filter(r => r.status === 'pending' || r.status === 'scheduled').length;
      },
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // ── Data processors ──────────────────────────────────────────────

  private applyUsers(users: any[]): void {
    this.totalUsers = users.length;
    const roleMap: Record<string, number> = {};
    users.forEach(u => {
      const r = (u.role?.name ?? u.role ?? 'unknown').toLowerCase();
      roleMap[r] = (roleMap[r] ?? 0) + 1;
    });
    this.totalDoctors = (roleMap['doctor'] ?? 0) + (roleMap['physician'] ?? 0);
    this.totalNurses  = roleMap['nurse'] ?? 0;

    const palette: Record<string, { color: string; icon: string }> = {
      admin:       { color: '#6c5ce7', icon: 'shield-lock' },
      superadmin:  { color: '#2d3436', icon: 'crown' },
      doctor:      { color: '#0984e3', icon: 'stethoscope' },
      physician:   { color: '#0984e3', icon: 'stethoscope' },
      nurse:       { color: '#00b894', icon: 'nurse' },
      coordinator: { color: '#fdcb6e', icon: 'users-group' },
      auditor:     { color: '#a29bfe', icon: 'eye' },
      patient:     { color: '#e17055', icon: 'heart-rate-monitor' },
    };
    this.usersByRole = Object.entries(roleMap).map(([role, count]) => ({
      role, count,
      color: palette[role]?.color ?? '#b2bec3',
      icon:  palette[role]?.icon  ?? 'user',
    })).sort((a, b) => b.count - a.count);

    this.buildUsersRoleChart(this.usersByRole);
  }

  private applyAlerts(alerts: AlertDto[]): void {
    const open = alerts.filter(a => a.status === 'open');
    this.activeAlerts   = open.length;
    this.criticalAlerts = open.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    this.recentAlerts   = alerts.slice(0, 5);
    this.criticalAlertsList = open.filter(a => a.severity === 'critical').slice(0, 3);
    this.buildAlertsChart(alerts);
  }

  private applyServices(services: any[]): void {
    this.totalServices = services.length;
    this.services = services.slice(0, 6);
  }

  private applyAuditStats(s: AuditStats): void {
    this.totalAuditEvents = s.total;
    this.buildActivityChart(s.last7days);
  }

  private generateAiInsights(alerts: AlertDto[], patients: any[]): void {
    const insights: { icon: string; color: string; text: string }[] = [];
    const critical = alerts.filter(a => a.severity === 'critical' && a.status === 'open');
    if (critical.length > 0) {
      insights.push({ icon: 'alert-triangle', color: '#d63031',
        text: `${critical.length} critical alert(s) unresolved — immediate action required` });
    }
    const inactive = patients.filter((p: any) => p.isActive === false).length;
    if (inactive > 0) {
      insights.push({ icon: 'user-off', color: '#e17055',
        text: `${inactive} patient(s) with inactive account detected` });
    }
    if (this.totalAuditEvents > 100) {
      insights.push({ icon: 'activity', color: '#6c5ce7',
        text: `High activity: ${this.totalAuditEvents} events logged this month` });
    }
    if (this.totalNurses < 3) {
      insights.push({ icon: 'nurse', color: '#fdcb6e',
        text: `Low nursing staff (${this.totalNurses}) — risk of overload` });
    }
    if (insights.length === 0) {
      insights.push({ icon: 'circle-check', color: '#00b894',
        text: 'System stable — no anomalies detected' });
    }
    this.aiInsights = insights;
  }

  // ── Chart builders ────────────────────────────────────────────────

  private buildAlertsChart(alerts: AlertDto[]): void {
    const last7 = this.last7DayLabels();
    const counts = last7.map(d =>
      alerts.filter(a => a.createdAt?.startsWith(d)).length
    );
    this.alertsChart = {
      series: [{ name: 'Alertes', data: counts }],
      chart: { type: 'bar', height: 180, toolbar: { show: false }, sparkline: { enabled: false } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
      colors: ['#d63031'],
      xaxis: { categories: last7.map(d => d.slice(5)), labels: { style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 3 },
      tooltip: { theme: 'light' },
    };
  }

  private buildUsersRoleChart(roles: { role: string; count: number; color: string }[]): void {
    this.usersRoleChart = {
      series: roles.map(r => r.count),
      labels: roles.map(r => r.role),
      chart: { type: 'donut', height: 220 },
      colors: roles.map(r => r.color),
      legend: { position: 'bottom', fontSize: '11px' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '60%' } } },
      tooltip: { theme: 'light' },
    };
  }

  private buildActivityChart(last7: { _id: string; count: number }[]): void {
    const days = this.last7DayLabels();
    const counts = days.map(d => last7.find(x => x._id === d)?.count ?? 0);
    this.activityChart = {
      series: [{ name: 'Evenements', data: counts }],
      chart: { type: 'area', height: 180, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
      colors: ['#6c5ce7'],
      xaxis: { categories: days.map(d => d.slice(5)), labels: { style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 3 },
      tooltip: { theme: 'light' },
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────

  private last7DayLabels(): string[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
  }

  severityColor(s: string): string {
    return { critical: '#d63031', high: '#e17055', medium: '#fdcb6e', low: '#00b894' }[s] ?? '#b2bec3';
  }

  severityIcon(s: string): string {
    return { critical: 'alert-octagon', high: 'alert-triangle', medium: 'alert-circle', low: 'info-circle' }[s] ?? 'bell';
  }

  auditActionColor(a: string): string {
    return {
      CREATE:     '#00b894',
      UPDATE:     '#0984e3',
      DELETE:     '#d63031',
      LOGIN:      '#6c5ce7',
      VIEW:       '#b2bec3',
      ACTIVATE:   '#00cec9',
      DEACTIVATE: '#e17055',
      RESTORE:    '#fdcb6e',
      MARK_READ:  '#a29bfe',
    }[a] ?? '#b2bec3';
  }

  auditActionIcon(a: string): string {
    return {
      CREATE:     'circle-plus',
      UPDATE:     'edit',
      DELETE:     'trash',
      LOGIN:      'login',
      VIEW:       'eye',
      ACTIVATE:   'toggle-right',
      DEACTIVATE: 'toggle-left',
      RESTORE:    'restore',
      MARK_READ:  'check',
    }[a] ?? 'activity';
  }
}
