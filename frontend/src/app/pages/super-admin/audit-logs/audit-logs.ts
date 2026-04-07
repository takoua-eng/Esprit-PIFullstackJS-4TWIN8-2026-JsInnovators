import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { AuditApiService, AuditLog } from '../../../services/audit.service';
import { AuditDetailDialog } from './audit-detail-dialog';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './audit-logs.html',
  styleUrls: ['./audit-logs.scss'],
})
export class AuditLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['createdAt', 'userEmail', 'action', 'entityType', 'entityId', 'ipAddress', 'actions'];
  dataSource = new MatTableDataSource<AuditLog>([]);
  isLive = true;
  lastRefresh = new Date();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private pollSub?: Subscription;

  constructor(
    private auditService: AuditApiService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Poll every 10s for live updates
    this.pollSub = interval(10000)
      .pipe(startWith(0), switchMap(() => this.auditService.getLogs()))
      .subscribe({
        next: (logs) => {
          this.dataSource.data = logs;
          this.lastRefresh = new Date();
        },
        error: (err) => console.error('Audit fetch error', err),
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  applyFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.dataSource.filter = val.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  refresh(): void {
    this.auditService.getLogs().subscribe((logs) => {
      this.dataSource.data = logs;
      this.lastRefresh = new Date();
    });
  }

  viewDetail(log: AuditLog): void {
    this.dialog.open(AuditDetailDialog, {
      width: '700px',
      maxWidth: '95vw',
      data: log,
    });
  }

  deleteLog(log: AuditLog): void {
    if (!confirm(`Delete this log entry?`)) return;
    this.auditService.deleteLog(log._id).subscribe(() => this.refresh());
  }

  actionColor(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'accent',
      UPDATE: 'primary',
      DELETE: 'warn',
      LOGIN: '',
    };
    return map[action] ?? '';
  }

  actionIcon(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'add_circle',
      UPDATE: 'edit',
      DELETE: 'delete',
      LOGIN: 'login',
    };
    return map[action] ?? 'info';
  }
}
