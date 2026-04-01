import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  AddMedecinDialog,
  DoctorData,
} from '../add-medecin-dialog/add-medecin-dialog';
import {
  DoctorService,
  Doctor,
} from 'src/app/services/superadmin/doctor.service';

// ✅ Interface complète
interface DoctorRow {
  _id: string;
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
  photo?: string;
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
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './medecins.html',
  styleUrls: ['./medecins.scss'],
})
export class MedecinsComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private doctorService = inject(DoctorService);

  displayedColumns: string[] = [
    'photo',
    'name',
    'service',
    'status',
    'actions',
  ];
  title = 'PHYSICIANS';
  dataSource = new MatTableDataSource<DoctorRow>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadDoctors();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ✅ LOAD DOCTORS
  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data: any[]) => {
        this.dataSource.data = data.map((d: any) => ({
          _id: d._id || '',
          name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unknown',
          email: d.email || '',
          service: d.specialty || 'N/A',
          status: d.isArchived ? 'Inactive' : 'Active',
          photo: d.photo ? `http://localhost:3000/uploads/${d.photo}` : '',
        }));
      },
      error: (err) => console.error('Error loading doctors:', err),
    });
  }

  // ✅ SEARCH
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // ✅ ADD DOCTOR - ✅ CORRECTION: data: {}
  addUser(): void {
    const dialogRef = this.dialog.open(AddMedecinDialog, {
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '900px',
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop',
      panelClass: 'custom-dialog-panel',
      data: {}, // ✅ Clé "data:" ajoutée
    });

    dialogRef.afterClosed().subscribe((result: DoctorData | undefined) => {
      if (result) {
        this.loadDoctors();
      }
    });
  }

  // ✅ ARCHIVE DOCTOR
  archiveDoctor(doctor: DoctorRow): void {
    if (confirm(`Deactivate ${doctor.name}?`)) {
      this.doctorService.archiveDoctor?.(doctor._id)?.subscribe({
        next: () => this.loadDoctors(),
        error: (err: any) => {
          console.error('Archive error:', err);
          this.dataSource.data = this.dataSource.data.filter(
            (d: DoctorRow) => d._id !== doctor._id,
          );
        },
      });
    }
  }

  // ✅ GET INITIALS FOR AVATAR
  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  // ✅ HANDLE IMAGE ERROR
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
