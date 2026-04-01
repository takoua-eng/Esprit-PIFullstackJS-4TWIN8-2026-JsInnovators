import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AddDoctorsDialog } from '../add-medecin-dialog/add-medecin-dialog';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [CommonModule, TranslateModule, MaterialModule, MatDialogModule],
  templateUrl: './medecins.html',
  styleUrls: ['./medecins.scss'],
})
export class MedecinsComponent implements OnInit {

  private dialog = inject(MatDialog);
  private http = inject(HttpClient);

  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    this.loadDoctors();

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

  // 📥 GET DOCTORS
  loadDoctors() {
    this.http.get<any[]>('http://localhost:3000/users/doctors')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (err) => console.error(err)
      });
  }

  // ➕ ADD
  addUser() {
    const dialogRef = this.dialog.open(AddDoctorsDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDoctors(); // 🔥 refresh
      }
    });
  }

  // 🗑 DELETE
  deleteUser(id: string) {
    Swal.fire({
      title: 'Supprimer ce médecin ?',
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

              // ✅ update table sans reload
              this.dataSource.data = this.dataSource.data.filter(user => user._id !== id);

              Swal.fire({
                title: 'Supprimé !',
                text: 'Le médecin a été supprimé avec succès.',
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
    const dialogRef = this.dialog.open(AddDoctorsDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
      data: user
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDoctors(); // refresh
      }
    });
  }

  // 🔍 SEARCH
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}