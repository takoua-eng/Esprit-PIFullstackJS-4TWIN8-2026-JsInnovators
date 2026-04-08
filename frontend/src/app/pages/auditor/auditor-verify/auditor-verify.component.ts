import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AuditApiService, AuditLog } from 'src/app/services/audit.service';

@Component({
  selector: 'app-auditor-verify',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './auditor-verify.component.html',
  styleUrls: ['./auditor-verify.component.scss'],
})
export class AuditorVerifyComponent implements OnInit {
  displayedColumns = ['createdAt', 'userEmail', 'action', 'entityType', 'entityId', 'ipAddress', 'status'];
  dataSource = new MatTableDataSource<AuditLog & { verified?: boolean }>([]);
  loading = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Filter
  selectedAction = 'all';
  actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'VIEW', 'ACTIVATE', 'DEACTIVATE'];

  constructor(private auditService: AuditApiService) {}

  ngOnInit(): void { this.load(); }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  load(): void {
    this.loading = true;
    this.auditService.getLogs().subscribe({
      next: (logs) => {
        this.dataSource.data = (logs as AuditLog[]).map(l => ({ ...l, verified: false }));
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  filterByAction(action: string): void {
    this.selectedAction = action;
    this.dataSource.filterPredicate = (row) =>
      action === 'all' || row.action === action;
    this.dataSource.filter = action === 'all' ? '' : action;
  }

  applySearch(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  verify(row: AuditLog & { verified?: boolean }): void {
    row.verified = true;
  }

  verifyAll(): void {
    this.dataSource.data.forEach(r => r.verified = true);
    this.dataSource.data = [...this.dataSource.data];
  }

  get verifiedCount(): number { return this.dataSource.data.filter(r => r.verified).length; }
  get pendingCount(): number  { return this.dataSource.data.filter(r => !r.verified).length; }

  actionColor(a: string): string {
    return { CREATE:'#00b894', UPDATE:'#0984e3', DELETE:'#d63031',
             LOGIN:'#6c5ce7', VIEW:'#b2bec3', ACTIVATE:'#00cec9',
             DEACTIVATE:'#e17055' }[a] ?? '#b2bec3';
  }
}
