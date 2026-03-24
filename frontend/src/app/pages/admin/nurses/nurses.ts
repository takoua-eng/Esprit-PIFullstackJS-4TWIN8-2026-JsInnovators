import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddPatientDialog, PatientData } from '../add-patient-dialog/add-patient-dialog';

interface UserRow {
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-nurses',
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
  templateUrl: './nurses.html',
  styleUrls: ['./nurses.scss']
})
export class NursesComponent {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  title = 'NURSES';

  users: UserRow[] = [
    { name: 'Fatma Ben Ali',     email: 'fatma.b@hospital.tn',     service: 'Emergency',    status: 'Active' },
    { name: 'Sonia Gharbi',      email: 'sonia.g@hospital.tn',     service: 'ICU',          status: 'Active' },
    { name: 'Leila Mansouri',    email: 'leila.m@hospital.tn',     service: 'Surgery',      status: 'Inactive' },
    { name: 'Amina Khaldi',      email: 'amina.k@hospital.tn',     service: 'Pediatrics',   status: 'Active' },
  ];

  addUser() {
    const dialogRef = this.dialog.open(AddPatientDialog, {
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

    dialogRef.afterClosed().subscribe((result: PatientData | undefined) => {
      if (result) {
        const newNurse: UserRow = {
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          service: 'General Nursing',
          status: 'Active'
        };

        this.users = [newNurse, ...this.users];
        console.log('New nurse added:', result);
      }
    });
  }
}