import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

// Modules Material nécessaires
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddCoordinateurDialog, CoordinatorData } from '../add-coordinateur-dialog/add-coordinateur-dialog';

interface UserRow {
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-coordinateurs',          // ← nom cohérent avec le dossier/fichier
  standalone: true,                       // ← OBLIGATOIRE en mode standalone
  imports: [
    CommonModule,           // lowercase, slice, ngClass, etc.
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,         // ← indispensable pour mat-table & dataSource
    MatTooltipModule,       // ← pour matTooltip
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './coordinateurs.html',   // ← .component.html (convention)
  styleUrl: './coordinateurs.scss'       // ← .component.scss (convention)
})
export class CoordinateursComponent {   // ← nom de classe avec "Component" (convention Angular)
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  title = 'COORDINATORS';

  users: UserRow[] = [
    { name: 'Anis Charfeddine',  email: 'anis.c@hospital.tn',  service: 'Cardiologie', status: 'Active' },
    { name: 'Rania Khelifi',     email: 'rania.k@hospital.tn', service: 'Oncologie',   status: 'Active' },
    { name: 'Omar Ferjani',      email: 'omar.f@hospital.tn',  service: 'Urgences',    status: 'Inactive' },
  ];

  addUser() {
    const dialogRef = this.dialog.open(AddCoordinateurDialog, {
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

    dialogRef.afterClosed().subscribe((result: CoordinatorData | undefined) => {
      if (result) {
        const newCoordinator: UserRow = {
          name: `${result.firstName} ${result.lastName}`,
          email: result.email,
          service: result.department,
          status: 'Active'
        };

        this.users = [newCoordinator, ...this.users];
        console.log('New coordinator added:', result);
      }
    });
  }
}