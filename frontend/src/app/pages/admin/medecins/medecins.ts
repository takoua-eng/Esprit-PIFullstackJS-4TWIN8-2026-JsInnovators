import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

// Option 1 : Importer les modules Material individuellement (recommandé si MaterialModule est incomplet)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddMedecinDialog, DoctorData } from '../add-medecin-dialog/add-medecin-dialog';

// Option 2 : Si tu as un MaterialModule qui exporte déjà tout ça → décommente et utilise-le
// import { MaterialModule } from 'src/app/material.module';

interface UserRow {
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './medecins.html',
  styleUrls: ['./medecins.scss'],
})
export class MedecinsComponent {
  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'name',
    'email',
    'service',
    'status',
    'actions',
  ];

  title = 'PHYSICIANS'; // key i18n for doctors page

  users: UserRow[] = [
    {
      name: 'Amira Zouari',
      email: 'amira.z@hospital.tn',
      service: 'Cardiologie',
      status: 'Active',
    },
    {
      name: 'Karim Hmidi',
      email: 'karim.h@hospital.tn',
      service: 'Réanimation',
      status: 'Inactive',
    },
    {
      name: 'Safa Ben Romdhane',
      email: 'safa.br@hospital.tn',
      service: 'Oncologie',
      status: 'Active',
    },
    {
      name: 'Nadia Jelali',
      email: 'nadia.j@hospital.tn',
      service: 'Pédiatrie',
      status: 'Active',
    },
  ];

  addUser() {
    const dialogRef = this.dialog.open(AddMedecinDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'custom-dialog-panel',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: DoctorData | undefined) => {
      if (result) {
        const newDoctor: UserRow = {
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          service: result.specialty,
          status: 'Active',
        };

        this.users = [newDoctor, ...this.users];
        console.log('New doctor added:', result);
      }
    });
  }
}
