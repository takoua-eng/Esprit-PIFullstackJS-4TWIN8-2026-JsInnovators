import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPatientDialog, PatientData } from '../add-patient-dialog/add-patient-dialog';

interface UserRow {
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, TranslateModule, MaterialModule, MatDialogModule],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss'],
})
export class Patients {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  title = 'Patients';

  users: UserRow[] = [
    { name: 'Amina Trabelsi',    email: 'amina.t@patients.tn',    service: 'Cardiologie',   status: 'Active'   },
    { name: 'Mohamed Kacem',     email: 'm.kacem@patients.tn',    service: 'Oncologie',     status: 'Inactive' },
    { name: 'Nour El Houda',     email: 'nour.h@patients.tn',     service: 'Pédiatrie',     status: 'Active'   },
    { name: 'Yassine Ben Ali',   email: 'y.benali@patients.tn',   service: 'Neurologie',    status: 'Active'   },
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
        // Add the new patient to the list
        const newPatient: UserRow = {
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          service: 'General Medicine', // Default service, can be updated later
          status: 'Active'
        };

        this.users = [newPatient, ...this.users];

        // Here you would typically send the data to your backend API
        console.log('New patient added:', result);

        // TODO: Call your patient service to save to backend
        // this.patientService.createPatient(result).subscribe(...)
      }
    });
  }
}
