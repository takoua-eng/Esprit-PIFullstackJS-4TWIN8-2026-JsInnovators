import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuditLog } from '../../../services/audit.service';

@Component({
  selector: 'app-audit-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="audit-detail">
      <h2 mat-dialog-title>
        <mat-icon>security</mat-icon>
        Détail de l'événement
      </h2>

      <mat-dialog-content>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="label">Date</span>
            <span class="value">{{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Utilisateur</span>
            <span class="value">{{ log.userEmail }}</span>
          </div>
          <div class="detail-row">
            <span class="label">User ID</span>
            <span class="value mono">{{ log.userId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Action</span>
            <span class="value action-{{ log.action | lowercase }}">{{ log.action }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Module</span>
            <span class="value mono">{{ log.entityType }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Entité ID</span>
            <span class="value mono">{{ log.entityId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Adresse IP</span>
            <span class="value">{{ log.ipAddress }}</span>
          </div>
        </div>

        <div class="json-section" *ngIf="log.after">
          <h4>Données après modification</h4>
          <pre class="json-block">{{ log.after | json }}</pre>
        </div>

        <div class="json-section" *ngIf="log.before">
          <h4>Données avant modification</h4>
          <pre class="json-block">{{ log.before | json }}</pre>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Fermer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .audit-detail h2 { display: flex; align-items: center; gap: 8px; }
    .detail-grid { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .detail-row { display: flex; gap: 12px; align-items: flex-start; }
    .label { min-width: 120px; font-weight: 600; color: #555; font-size: 0.85rem; }
    .value { font-size: 0.9rem; }
    .mono { font-family: monospace; font-size: 0.8rem; color: #333; }
    .action-create { color: #2e7d32; font-weight: 700; }
    .action-update { color: #1565c0; font-weight: 700; }
    .action-delete { color: #c62828; font-weight: 700; }
    .action-login  { color: #6a1b9a; font-weight: 700; }
    .json-section h4 { font-size: 0.85rem; color: #666; margin-bottom: 6px; }
    .json-block {
      background: #1e1e1e; color: #d4d4d4;
      padding: 12px; border-radius: 8px;
      font-size: 0.75rem; max-height: 200px;
      overflow: auto; white-space: pre-wrap;
    }
  `],
})
export class AuditDetailDialog {
  log: AuditLog;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AuditLog,
    private dialogRef: MatDialogRef<AuditDetailDialog>,
  ) {
    this.log = data;
  }

  close(): void {
    this.dialogRef.close();
  }
}
