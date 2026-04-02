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
  AuditorService,
  Auditor,
} from '../../../services/superadmin/auditor.service';

// ✅ Interface pour l'affichage
interface AuditorRow {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  isArchived: boolean;
}

@Component({
  selector: 'app-super-auditors',
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
  templateUrl: './auditors.html',
  styleUrls: ['./auditors.scss'],
})
export class AuditorsComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private auditorService = inject(AuditorService);

  displayedColumns: string[] = ['photo', 'name', 'status', 'actions'];
  title = 'AUDITORS';
  dataSource = new MatTableDataSource<AuditorRow>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadAuditors();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ✅ LOAD AUDITORS
  loadAuditors(): void {
    this.auditorService.getAuditors().subscribe({
      next: (data: Auditor[]) => {
        this.dataSource.data = data.map((a: Auditor) => ({
          _id: a._id,
          firstName: a.firstName,
          lastName: a.lastName,
          email: a.email,
          photo: a.photo,
          isArchived: a.isArchived,
        }));
      },
      error: (err) => console.error('Error loading auditors:', err),
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

  // ✅ ADD AUDITOR
  addAuditor(): void {
    console.log('Add auditor clicked');
    // ✅ Naviguer ou ouvrir dialog selon votre besoin
    // this.router.navigate(['/super-admin/auditors/add']);
  }

  // ✅ EDIT AUDITOR
  editAuditor(auditor: AuditorRow): void {
    console.log('Edit auditor:', auditor._id);
    // ✅ this.router.navigate(['/super-admin/auditors/edit', auditor._id]);
  }

  // ✅ TOGGLE STATUS (Archive/Activate)
  toggleStatus(auditor: AuditorRow): void {
    const action = auditor.isArchived ? 'Activate' : 'Archive';
    if (confirm(`${action} ${this.getFullName(auditor)}?`)) {
      if (auditor.isArchived) {
        this.auditorService.activateAuditor?.(auditor._id)?.subscribe({
          next: () => this.loadAuditors(),
          error: (err: any) => console.error('Activate error:', err),
        });
      } else {
        this.auditorService.archiveAuditor?.(auditor._id)?.subscribe({
          next: () => this.loadAuditors(),
          error: (err: any) => console.error('Archive error:', err),
        });
      }
    }
  }

  // ✅ GET FULL NAME
  getFullName(user: AuditorRow): string {
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
