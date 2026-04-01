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

import { AddPatientDialog } from '../add-patient-dialog/add-patient-dialog';
import { NurseService, Nurse } from 'src/app/services/superadmin/nurse.service';

interface NurseRow {
  _id: string;
  name: string;
  email: string;
  service: string;
  status: 'Active' | 'Inactive';
  photo?: string;
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
    TranslateModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './nurses.html',
  styleUrls: ['./nurses.scss'],
})
export class NursesComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private nurseService = inject(NurseService);

  displayedColumns: string[] = [
    'photo',
    'name',
    'service',
    'status',
    'actions',
  ];
  title = 'NURSES';
  dataSource = new MatTableDataSource<NurseRow>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadNurses();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadNurses(): void {
    this.nurseService.getNurses().subscribe({
      next: (data: any[]) => {
        this.dataSource.data = data.map((n: any) => ({
          _id: n._id || '',
          name: `${n.firstName || ''} ${n.lastName || ''}`.trim() || 'Unknown',
          email: n.email || '',
          service:
            typeof n.serviceId === 'object'
              ? (n.serviceId as any)?.name || 'N/A'
              : n.serviceId || n.service || 'N/A',
          status: n.isArchived ? 'Inactive' : 'Active',
          photo: n.photo ? `http://localhost:3000/uploads/${n.photo}` : '',
        }));
      },
      error: (err: any) => console.error('Error loading nurses:', err),
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addUser(): void {
    const dialogRef = this.dialog.open(AddPatientDialog, {
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

    dialogRef.afterClosed().subscribe((formData: FormData | undefined) => {
      if (formData) {
        this.loadNurses();
      }
    });
  }

  archiveNurse(nurse: NurseRow): void {
    if (confirm(`Deactivate ${nurse.name}?`)) {
      this.nurseService.archiveNurse?.(nurse._id)?.subscribe({
        next: () => this.loadNurses(),
        error: (err: any) => {
          console.error('Archive error:', err);
          this.dataSource.data = this.dataSource.data.filter(
            (n: NurseRow) => n._id !== nurse._id,
          );
        },
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }
}
