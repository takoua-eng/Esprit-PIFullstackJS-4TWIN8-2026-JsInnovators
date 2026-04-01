import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AddPatientDialog } from '../add-patient-dialog/add-patient-dialog';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, TranslateModule, MaterialModule, MatDialogModule],
  templateUrl: './patients.html',
  styleUrls: ['./patients.scss'],
})
export class Patients implements OnInit {

  private dialog = inject(MatDialog);
  private http = inject(HttpClient);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    this.loadPatients();

    // 🔥 filtre personnalisé (recherche intelligente)
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const search = filter.toLowerCase();
      return (
        data.firstName?.toLowerCase().includes(search) ||
        data.lastName?.toLowerCase().includes(search) ||
        data.email?.toLowerCase().includes(search) ||
        data.phone?.toLowerCase().includes(search)
      );
    };
  }

  loadPatients() {
    this.http.get<any[]>('http://localhost:3000/users/patients')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (err) => console.error(err)
      });
  }

  // ➕ ADD
  addUser() {
    const dialogRef = this.dialog.open(AddPatientDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPatients(); // 🔥 juste refresh
      }
    });
  }

  // 🗑 DELETE
  deleteUser(id: string) {
    Swal.fire({
      title: 'Supprimer ce patient ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {

      if (result.isConfirmed) {

        this.http.delete(`http://localhost:3000/users/${id}`)
          .subscribe({
            next: () => {

              // ✅ CORRECTION ICI
              this.dataSource.data = this.dataSource.data.filter(user => user._id !== id);

              Swal.fire({
                title: 'Supprimé !',
                text: 'Le patient a été supprimé avec succès.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });

            },
            error: (err) => {
              console.error(err);

              Swal.fire({
                title: 'Erreur',
                text: 'La suppression a échoué',
                icon: 'error'
              });
            }
          });
      }
    });
  }

  // ✏️ EDIT
  editUser(user: any) {
    const dialogRef = this.dialog.open(AddPatientDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
      data: user
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPatients(); // refresh
      }
    });
  }

  // 🔍 SEARCH
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}