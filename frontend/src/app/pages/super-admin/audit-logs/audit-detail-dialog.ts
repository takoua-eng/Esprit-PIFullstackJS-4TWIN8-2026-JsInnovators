import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuditLog } from '../../../services/audit.service';

@Component({
  selector: 'app-audit-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TablerIconsModule],
  template: `
    <div class="audit-detail">

      <h2 mat-dialog-title class="d-flex align-items-center gap-8">
        <i-tabler name="shield-check" style="color:#6c5ce7" class="icon-22"></i-tabler>
        Audit Trail — Event Detail
      </h2>

      <mat-dialog-content>

        <!-- QUI -->
        <div class="section">
          <div class="section-title">
            <i-tabler name="user" class="icon-16"></i-tabler> WHO
          </div>
          <div class="detail-grid">
            <div class="row-item"><span class="lbl">Name</span><span class="val">{{ log.userName || '—' }}</span></div>
            <div class="row-item"><span class="lbl">Email</span><span class="val">{{ log.userEmail }}</span></div>
            <div class="row-item"><span class="lbl">Role</span>
              <span class="badge" style="background:#6c5ce718;color:#6c5ce7">{{ log.userRole || '—' }}</span>
            </div>
            <div class="row-item"><span class="lbl">User ID</span><span class="val mono">{{ log.userId }}</span></div>
          </div>
        </div>

        <!-- QUOI -->
        <div class="section">
          <div class="section-title">
            <i-tabler name="activity" class="icon-16"></i-tabler> WHAT
          </div>
          <div class="detail-grid">
            <div class="row-item"><span class="lbl">Action</span>
              <span class="badge" [style.background]="actionColor(log.action) + '18'" [style.color]="actionColor(log.action)">
                {{ log.action }}
              </span>
            </div>
          </div>
        </div>

        <!-- SUR QUOI -->
        <div class="section">
          <div class="section-title">
            <i-tabler name="database" class="icon-16"></i-tabler> ON WHAT
          </div>
          <div class="detail-grid">
            <div class="row-item"><span class="lbl">Resource</span><span class="val mono">{{ log.entityType }}</span></div>
            <div class="row-item"><span class="lbl">Entity ID</span><span class="val mono">{{ log.entityId }}</span></div>
          </div>
        </div>

        <!-- QUAND -->
        <div class="section">
          <div class="section-title">
            <i-tabler name="clock" class="icon-16"></i-tabler> WHEN
          </div>
          <div class="detail-grid">
            <div class="row-item"><span class="lbl">Timestamp</span>
              <span class="val">{{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
          </div>
        </div>

        <!-- OÙ -->
        <div class="section">
          <div class="section-title">
            <i-tabler name="map-pin" class="icon-16"></i-tabler> WHERE
          </div>
          <div class="detail-grid">
            <div class="row-item"><span class="lbl">IP Address</span><span class="val mono">{{ log.ipAddress }}</span></div>
            <div class="row-item"><span class="lbl">User-Agent</span>
              <span class="val ua-text">{{ log.userAgent || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- CHANGEMENTS -->
        <div class="section" *ngIf="log.after || log.before">
          <div class="section-title">
            <i-tabler name="git-diff" class="icon-16"></i-tabler> CHANGES
          </div>
          <div *ngIf="log.after" class="m-b-8">
            <div class="json-label">After</div>
            <pre class="json-block">{{ log.after | json }}</pre>
          </div>
          <div *ngIf="log.before">
            <div class="json-label">Before</div>
            <pre class="json-block">{{ log.before | json }}</pre>
          </div>
        </div>

      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .audit-detail { min-width: 560px; }
    h2 { font-size: 1.1rem !important; }

    .section {
      margin-bottom: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .section-title {
      display: flex; align-items: center; gap: 6px;
      background: #f8f9fa; padding: 8px 14px;
      font-size: .75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px; color: #555;
    }

    .detail-grid { padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }

    .row-item { display: flex; align-items: center; gap: 12px; }
    .lbl { min-width: 100px; font-size: .8rem; font-weight: 600; color: #888; }
    .val { font-size: .85rem; color: #2d3436; }
    .mono { font-family: monospace; font-size: .78rem; color: #444; }
    .ua-text { font-size: .72rem; color: #666; word-break: break-all; }

    .badge {
      font-size: .72rem; font-weight: 700;
      padding: 3px 10px; border-radius: 8px;
    }

    .json-label { font-size: .72rem; font-weight: 700; color: #888; margin-bottom: 4px; }
    .json-block {
      background: #1e1e1e; color: #d4d4d4;
      padding: 12px; border-radius: 8px;
      font-size: .72rem; max-height: 180px;
      overflow: auto; white-space: pre-wrap;
      margin: 0;
    }
  `],
})
export class AuditDetailDialog {
  log: AuditLog;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AuditLog,
    private dialogRef: MatDialogRef<AuditDetailDialog>,
  ) { this.log = data; }

  close(): void { this.dialogRef.close(); }

  actionColor(a: string): string {
    return {
      CREATE:'#00b894', UPDATE:'#0984e3', DELETE:'#d63031',
      LOGIN:'#6c5ce7', LOGOUT:'#a29bfe', VIEW:'#b2bec3',
    }[a] ?? '#b2bec3';
  }
}
