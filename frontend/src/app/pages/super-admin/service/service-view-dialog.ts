import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ServiceModel } from './service';

@Component({
  selector: 'app-service-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="svc-view">
      <div class="svc-header">
        <div class="svc-icon"><mat-icon>business</mat-icon></div>
        <div>
          <h2>{{ s.name }}</h2>
          <span class="code-badge">{{ s.code }}</span>
        </div>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content class="svc-content">
        <div class="row-item" *ngIf="s.description">
          <mat-icon>description</mat-icon>
          <span>{{ s.description }}</span>
        </div>
        <mat-divider></mat-divider>
        <div class="row-item">
          <mat-icon>circle</mat-icon>
          <span class="badge" [class.active]="s.isActive" [class.inactive]="!s.isActive">
            {{ s.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .svc-view { min-width: 360px; }
    .svc-header {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px; background: linear-gradient(135deg,#0984e3,#74b9ff);
      color: #fff; border-radius: 4px 4px 0 0; position: relative;
    }
    .svc-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 1.6rem; width: 1.6rem; height: 1.6rem; }
    }
    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .code-badge { background: rgba(255,255,255,.25); padding: 2px 10px; border-radius: 12px; font-size: .75rem; }
    .close-btn { position: absolute; right: 8px; top: 8px; color: #fff; }
    mat-dialog-content { padding: 16px 24px !important; }
    .row-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: .9rem; color: #444;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #888; }
    }
    mat-divider { margin: 4px 0; }
    .badge { padding: 3px 12px; border-radius: 12px; font-size: .75rem; font-weight: 700;
      &.active   { background: #e8f5e9; color: #2e7d32; }
      &.inactive { background: #ffebee; color: #c62828; }
    }
    mat-dialog-actions { padding: 8px 24px !important; }
  `],
})
export class ServiceViewDialog {
  s: ServiceModel;
  constructor(
    public dialogRef: MatDialogRef<ServiceViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceModel,
  ) { this.s = data; }
}
