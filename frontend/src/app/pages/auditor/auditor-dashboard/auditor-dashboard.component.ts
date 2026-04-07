import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { interval, Subscription, forkJoin, of } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { AuditApiService, AuditLog, AuditStats } from 'src/app/services/audit.service';

@Component({
  selector: 'app-auditor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, TablerIconsModule],
  templateUrl: './auditor-dashboard.component.html',
  styleUrls: ['./auditor-dashboard.component.scss'],
})
export class AuditorDashboardComponent implements OnInit, OnDestroy {
  totalEvents = 0;
  todayEvents = 0;
  loginEvents = 0;
  deleteEvents = 0;
  recentLogs: AuditLog[] = [];
  lastRefresh = new Date();
  private sub?: Subscription;

  constructor(private auditService: AuditApiService) {}

  ngOnInit(): void {
    this.sub = interval(30000).pipe(
      startWith(0),
      switchMap(() => forkJoin({
        logs:  this.auditService.getLogs().pipe(catchError(() => of([]))),
        stats: this.auditService.getStats().pipe(catchError(() => of(null))),
      })),
    ).subscribe(({ logs, stats }) => {
      this.lastRefresh = new Date();
      const all = logs as AuditLog[];
      this.recentLogs = all.slice(0, 8);
      if (stats) {
        const s = stats as AuditStats;
        this.totalEvents  = s.total;
        this.loginEvents  = (s.byAction?.find((a: any) => a._id === 'LOGIN')?.count) ?? 0;
        this.deleteEvents = (s.byAction?.find((a: any) => a._id === 'DELETE')?.count) ?? 0;
      }
      const today = new Date().toISOString().split('T')[0];
      this.todayEvents = all.filter(l => l.createdAt?.startsWith(today)).length;
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  actionColor(a: string): string {
    return { CREATE:'#00b894', UPDATE:'#0984e3', DELETE:'#d63031',
             LOGIN:'#6c5ce7', VIEW:'#b2bec3', ACTIVATE:'#00cec9',
             DEACTIVATE:'#e17055' }[a] ?? '#b2bec3';
  }

  actionIcon(a: string): string {
    return { CREATE:'circle-plus', UPDATE:'edit', DELETE:'trash',
             LOGIN:'login', VIEW:'eye', ACTIVATE:'toggle-right',
             DEACTIVATE:'toggle-left' }[a] ?? 'activity';
  }
}
