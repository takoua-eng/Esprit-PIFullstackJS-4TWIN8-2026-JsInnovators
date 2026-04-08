import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-role-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  template: `
    <div class="role-view">
      <div class="role-header">
        <div class="role-icon"><mat-icon>shield</mat-icon></div>
        <div>
          <h2>{{ data.name | titlecase }}</h2>
          <span class="users-badge">{{ data.usersCount ?? 0 }} users</span>
        </div>
        <button mat-icon-button class="close-btn" (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content class="role-content">

        <div class="desc" *ngIf="data.description">{{ data.description }}</div>

        <mat-divider *ngIf="data.description"></mat-divider>

        <div class="perm-section">
          <div class="perm-title">
            <mat-icon>lock</mat-icon>
            Permissions ({{ data.permissions?.length ?? 0 }})
          </div>

          <div *ngIf="data.permissions?.includes('*')" class="wildcard-badge">
            <mat-icon>all_inclusive</mat-icon> Full Access (Superadmin)
          </div>

          <div *ngIf="!data.permissions?.includes('*')" class="perm-groups">
            <div *ngFor="let group of permGroups" class="perm-group">
              <div class="group-name">{{ group.domain | titlecase }}</div>
              <div class="chips-row">
                <span *ngFor="let p of group.perms" class="perm-chip">{{ p.action }}</span>
              </div>
            </div>
            <div *ngIf="permGroups.length === 0" class="no-perms">No permissions assigned</div>
          </div>
        </div>

      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .role-view { min-width: 440px; }
    .role-header {
      display: flex; align-items: center; gap: 14px;
      padding: 20px 24px; background: linear-gradient(135deg,#6c5ce7,#a29bfe);
      color: #fff; border-radius: 4px 4px 0 0; position: relative;
    }
    .role-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,.2);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 1.6rem; width: 1.6rem; height: 1.6rem; }
    }
    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .users-badge { background: rgba(255,255,255,.25); padding: 2px 10px; border-radius: 12px; font-size: .75rem; }
    .close-btn { position: absolute; right: 8px; top: 8px; color: #fff; }
    mat-dialog-content { padding: 16px 24px !important; max-height: 55vh; overflow-y: auto; }
    .desc { font-size: .88rem; color: #555; margin-bottom: 12px; }
    .perm-section { margin-top: 8px; }
    .perm-title { display: flex; align-items: center; gap: 6px; font-size: .75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .8px; color: #888; margin-bottom: 12px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .wildcard-badge { display: flex; align-items: center; gap: 6px; background: #fff3e0;
      color: #e65100; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: .85rem;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .perm-groups { display: flex; flex-direction: column; gap: 10px; }
    .perm-group { }
    .group-name { font-size: .72rem; font-weight: 700; color: #6c5ce7; margin-bottom: 4px; text-transform: capitalize; }
    .chips-row { display: flex; flex-wrap: wrap; gap: 4px; }
    .perm-chip { background: #f0eeff; color: #6c5ce7; padding: 2px 8px; border-radius: 10px;
      font-size: .7rem; font-weight: 600; }
    .no-perms { color: #aaa; font-size: .85rem; }
    mat-dialog-actions { padding: 8px 24px !important; }
  `],
})
export class RoleViewDialog {
  permGroups: { domain: string; perms: { action: string }[] }[] = [];

  constructor(
    public dialogRef: MatDialogRef<RoleViewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.buildPermGroups();
  }

  private buildPermGroups(): void {
    const perms: string[] = this.data.permissions ?? [];
    if (perms.includes('*')) return;

    const map = new Map<string, string[]>();
    perms.forEach(p => {
      const [domain, action] = p.split(':');
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain)!.push(action);
    });

    this.permGroups = Array.from(map.entries()).map(([domain, actions]) => ({
      domain,
      perms: actions.map(a => ({ action: a })),
    }));
  }
}
