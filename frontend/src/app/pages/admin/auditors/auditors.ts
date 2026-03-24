import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddAuditorDialog, AuditorData } from '../add-auditor-dialog/add-auditor-dialog';

interface UserRow {
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-auditors',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './auditors.html',
  styleUrls: ['./auditors.scss']
})
export class AuditorsComponent {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  title = 'AUDITORS';

  users: UserRow[] = [
    { name: 'Mohamed Salah',     email: 'm.salah@hospital.tn',     service: 'Quality Control',    status: 'Active' },
    { name: 'Nadia Bouzid',      email: 'nadia.b@hospital.tn',     service: 'Compliance',         status: 'Active' },
    { name: 'Karim Jaziri',      email: 'karim.j@hospital.tn',     service: 'Audit Department',   status: 'Inactive' },
  ];

  addUser() {
    const dialogRef = this.dialog.open(AddAuditorDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'custom-dialog-panel',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: AuditorData | undefined) => {
      if (result) {
        const newAuditor: UserRow = {
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          service: result.focusArea,
          status: 'Active'
        };

        this.users = [newAuditor, ...this.users];
        console.log('New auditor added:', result);
      }
    });
  }
}