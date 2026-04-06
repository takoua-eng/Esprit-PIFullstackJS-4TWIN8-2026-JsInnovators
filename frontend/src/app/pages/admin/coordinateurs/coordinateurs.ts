import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  CoordinateurService,
  Coordinator,
} from './../../../services/superadmin/coordinateur.service';
import { CoreService } from 'src/app/services/core.service';

// ✅ Interface pour l'affichage
interface CoordinatorRow {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
}

@Component({
  selector: 'app-coordinateurs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './coordinateurs.html',
  styleUrls: ['./coordinateurs.scss'],
})
export class CoordinateursComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private coordService = inject(CoordinateurService);
  public core = inject(CoreService);

  displayedColumns: string[] = ['photo', 'name', 'email', 'actions'];
  title = 'COORDINATORS';
  dataSource = new MatTableDataSource<CoordinatorRow>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadCoordinators();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ✅ LOAD COORDINATORS
  loadCoordinators(): void {
    this.coordService.getCoordinators().subscribe({
      next: (data: Coordinator[]) => {
        this.dataSource.data = data.map((c: Coordinator) => ({
          _id: c._id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          photo: c.photo,
        }));
      },
      error: (err) => console.error('Error loading coordinators:', err),
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

  // ✅ ADD COORDINATOR
  addCoordinator(): void {
    // ✅ Ouvrir un dialog ou naviguer vers la page d'ajout
    // this.router.navigate(['/super-admin/coordinators/add']);
    console.log('Add coordinator clicked');
  }

  // ✅ EDIT COORDINATOR
  editCoordinator(coord: CoordinatorRow): void {
    // ✅ Naviguer vers la page d'édition
    // this.router.navigate(['/super-admin/coordinators/edit', coord._id]);
    console.log('Edit coordinator:', coord._id);
  }

  // ✅ DELETE COORDINATOR
  deleteCoordinator(coord: CoordinatorRow): void {
    if (confirm(`Delete ${this.getFullName(coord)}?`)) {
      this.coordService.deleteCoordinator?.(coord._id)?.subscribe({
        next: () => this.loadCoordinators(),
        error: (err: any) => {
          console.error('Delete error:', err);
          this.dataSource.data = this.dataSource.data.filter(
            (c: CoordinatorRow) => c._id !== coord._id,
          );
        },
      });
    }
  }

  // ✅ GET FULL NAME
  getFullName(user: CoordinatorRow): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  }

  // ✅ GET PHOTO URL
  getPhoto(photo?: string): string {
    return photo ? `http://localhost:3000/uploads/${photo}` : '';
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
