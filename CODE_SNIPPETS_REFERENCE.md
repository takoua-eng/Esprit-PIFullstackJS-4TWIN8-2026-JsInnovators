# 🔧 Quick Reference - Key Implementation Code

## Service Layer

### Auditor Service Example

```typescript
// frontend/src/app/services/superadmin/auditor.service.ts
export interface Auditor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isArchived: boolean;
  photo?: string;
}

@Injectable({ providedIn: "root" })
export class AuditorService {
  private baseUrl = "http://localhost:3000/users";

  // Get all auditors
  getAuditors(): Observable<Auditor[]> {
    return this.http.get<Auditor[]>(`${this.baseUrl}/auditors`);
  }

  // Create new auditor with file
  createAuditor(formData: FormData): Observable<Auditor> {
    return this.http.post<Auditor>(`${this.baseUrl}/auditors`, formData);
  }

  // Update existing auditor
  updateAuditor(id: string, formData: FormData): Observable<Auditor> {
    return this.http.put<Auditor>(`${this.baseUrl}/${id}`, formData);
  }

  // Archive auditor (soft delete)
  archiveAuditor(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Toggle active status
  activateAuditor(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateAuditor(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
```

### Admin Service (Same Pattern)

```typescript
// frontend/src/app/services/superadmin/admin.service.ts
@Injectable({ providedIn: "root" })
export class AdminService {
  private baseUrl = "http://localhost:3000/users";

  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.baseUrl}/admins`);
  }

  createAdmin(formData: FormData): Observable<Admin> {
    return this.http.post<Admin>(`${this.baseUrl}/admins`, formData);
  }

  updateAdmin(id: string, formData: FormData): Observable<Admin> {
    return this.http.put<Admin>(`${this.baseUrl}/${id}`, formData);
  }

  archiveAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  activateAdmin(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/activate`, {});
  }

  deactivateAdmin(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
```

---

## Component Layer

### Create/Add Component Pattern

```typescript
// frontend/src/app/pages/super-admin/add-admin/add-admin.ts
@Component({
  selector: 'app-add-admin',
  standalone: true,
  templateUrl: './add-admin.html',
  styleUrls: ['./add-admin.scss'],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, ...]
})
export class AddAdminDialog implements OnInit {
  adminForm!: FormGroup;
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private dialogRef: MatDialogRef<AddAdminDialog>,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.adminForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: [''],
      address: [''],
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const values = this.adminForm.value;

    Object.keys(values).forEach((key) => {
      if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
        formData.append(key, String(values[key]).trim());
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.adminService.createAdmin(formData).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        alert('Error: ' + (err.message || 'Failed to create admin'));
      },
    });
  }
}
```

### List Component with Alerts

```typescript
// frontend/src/app/pages/super-admin/admins/admins.ts
@Component({
  selector: 'app-admins-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MaterialModule, ...]
})
export class AdminsComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);
  private alertsService = inject(AlertsService);

  displayedColumns: string[] = ['photo', 'name', 'email', 'status', 'actions'];
  dataSource = new MatTableDataSource<AdminRow>([]);
  alertCount = 0;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadAdmins();
    this.loadAlerts();
  }

  loadAdmins(): void {
    this.adminService.getAdmins().subscribe({
      next: (data: Admin[]) => {
        this.dataSource.data = data.map(a => this.mapToAdminRow(a));
      },
      error: (err) => console.error('Error:', err),
    });
  }

  loadAlerts(): void {
    this.alertsService.getAlerts().subscribe({
      next: (alerts: any[]) => {
        this.alertCount = alerts.filter(a => a.status === 'open').length;
      },
      error: (err) => console.error('Error:', err),
    });
  }

  addAdmin(): void {
    const dialogRef = this.dialog.open(AddAdminDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadAdmins();
    });
  }

  editAdmin(admin: AdminRow): void {
    const dialogRef = this.dialog.open(EditAdminDialog, {
      width: '800px',
      data: this.adminsData.find((a) => a._id === admin._id),
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) this.loadAdmins();
    });
  }

  toggleStatus(admin: AdminRow): void {
    const apiCall = admin.isActive
      ? this.adminService.deactivateAdmin(admin._id)
      : this.adminService.activateAdmin(admin._id);

    apiCall.subscribe({
      next: () => this.loadAdmins(),
      error: (err) => alert('Error: ' + err.message),
    });
  }

  archiveAdmin(admin: AdminRow): void {
    this.adminService.archiveAdmin(admin._id).subscribe({
      next: () => this.loadAdmins(),
      error: (err) => alert('Error: ' + err.message),
    });
  }
}
```

---

## Form Template Pattern

### HTML Form with Photo Upload

```html
<!-- add-admin.html -->
<form [formGroup]="adminForm" (ngSubmit)="onSubmit()">
  <!-- Photo Section -->
  <div class="form-section text-center mb-4">
    <div class="photo-wrapper">
      <div class="avatar-circle-large">
        <img *ngIf="photoPreview" [src]="photoPreview" class="avatar-img" />
        <span *ngIf="!photoPreview" class="avatar-initials-large">
          {{ getInitials(adminForm.value.firstName, adminForm.value.lastName) }}
        </span>
      </div>
      <input
        type="file"
        hidden
        #fileInput
        (change)="onFileSelected($event)"
        accept="image/*"
      />
      <button
        mat-mini-fab
        color="primary"
        (click)="fileInput.click()"
        type="button"
      >
        <mat-icon>edit</mat-icon>
      </button>
    </div>
  </div>

  <!-- Form Fields -->
  <div class="form-row">
    <mat-form-field appearance="outline" class="form-field">
      <mat-label>First Name *</mat-label>
      <input
        matInput
        formControlName="firstName"
        placeholder="Enter first name"
      />
      <mat-error *ngIf="adminForm.get('firstName')?.hasError('required')"
        >Required</mat-error
      >
    </mat-form-field>

    <mat-form-field appearance="outline" class="form-field">
      <mat-label>Last Name *</mat-label>
      <input
        matInput
        formControlName="lastName"
        placeholder="Enter last name"
      />
      <mat-error *ngIf="adminForm.get('lastName')?.hasError('required')"
        >Required</mat-error
      >
    </mat-form-field>
  </div>

  <div class="form-row">
    <mat-form-field appearance="outline" class="form-field">
      <mat-label>Email *</mat-label>
      <input
        matInput
        formControlName="email"
        type="email"
        placeholder="Enter email"
      />
      <mat-error *ngIf="adminForm.get('email')?.hasError('required')"
        >Required</mat-error
      >
      <mat-error *ngIf="adminForm.get('email')?.hasError('email')"
        >Invalid format</mat-error
      >
    </mat-form-field>

    <mat-form-field appearance="outline" class="form-field">
      <mat-label>Password *</mat-label>
      <input
        matInput
        formControlName="password"
        [type]="hidePassword ? 'password' : 'text'"
      />
      <button
        mat-icon-button
        matSuffix
        (click)="hidePassword = !hidePassword"
        type="button"
      >
        <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
      </button>
      <mat-error *ngIf="adminForm.get('password')?.hasError('required')"
        >Required</mat-error
      >
    </mat-form-field>
  </div>

  <!-- Actions -->
  <div class="dialog-actions">
    <button mat-stroked-button type="button" (click)="onCancel()" color="warn">
      <mat-icon>close</mat-icon> Cancel
    </button>
    <button
      mat-raised-button
      color="primary"
      type="submit"
      [disabled]="adminForm.invalid || loading"
    >
      <mat-icon *ngIf="!loading">save</mat-icon>
      <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
      {{ loading ? 'Creating...' : 'Create Admin' }}
    </button>
  </div>
</form>
```

---

## Table Template Pattern

```html
<!-- admins.html - Table with Alerts -->
<div class="header">
  <div>
    <h2 class="title">
      <mat-icon>admin_panel_settings</mat-icon>
      Admins Management
    </h2>
  </div>
  <div class="alert-badge" *ngIf="alertCount > 0">
    <mat-icon>notifications_active</mat-icon>
    <span>{{ alertCount }} Active Alerts</span>
  </div>
</div>

<!-- Search -->
<mat-form-field appearance="outline" class="search-field">
  <mat-label>Search admins...</mat-label>
  <input matInput (keyup)="applyFilter($event)" placeholder="Name, email..." />
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>

<button mat-raised-button color="primary" (click)="addAdmin()">
  <mat-icon>add</mat-icon>
  Add New Admin
</button>

<!-- Table -->
<table matSort mat-table [dataSource]="dataSource">
  <!-- Photo Column -->
  <ng-container matColumnDef="photo">
    <th mat-header-cell *matHeaderCellDef>Photo</th>
    <td mat-cell *matCellDef="let admin">
      <div class="avatar-circle">
        <img *ngIf="getPhoto(admin.photo)" [src]="getPhoto(admin.photo)" />
        <span *ngIf="!getPhoto(admin.photo)" class="avatar-initials">
          {{ getInitials(getFullName(admin)) }}
        </span>
      </div>
    </td>
  </ng-container>

  <!-- Name Column -->
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
    <td mat-cell *matCellDef="let admin">
      <div class="admin-name">{{ getFullName(admin) }}</div>
      <div class="admin-email">{{ admin.email }}</div>
    </td>
  </ng-container>

  <!-- Status Column -->
  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
    <td mat-cell *matCellDef="let admin">
      <span
        class="status-badge"
        [ngClass]="admin.isActive ? 'active' : 'inactive'"
      >
        <span class="status-dot"></span>
        {{ admin.isActive ? 'Active' : 'Inactive' }}
      </span>
    </td>
  </ng-container>

  <!-- Actions Column -->
  <ng-container matColumnDef="actions">
    <th mat-header-cell *matHeaderCellDef>Actions</th>
    <td mat-cell *matCellDef="let admin">
      <button
        mat-icon-button
        color="primary"
        (click)="editAdmin(admin)"
        matTooltip="Edit"
      >
        <mat-icon>edit</mat-icon>
      </button>
      <button
        mat-icon-button
        color="accent"
        (click)="toggleStatus(admin)"
        matTooltip="Deactivate"
      >
        <mat-icon>block</mat-icon>
      </button>
      <button
        mat-icon-button
        color="warn"
        (click)="archiveAdmin(admin)"
        matTooltip="Archive"
      >
        <mat-icon>delete</mat-icon>
      </button>
    </td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
</table>

<!-- Paginator -->
<mat-paginator
  [pageSizeOptions]="[5, 10, 25, 50]"
  showFirstLastButtons
></mat-paginator>
```

---

## Backend Integration

### NestJS Controller Endpoints

```typescript
// backend/src/modules/users/users.controller.ts

@Post('administadores')
createAdmin(
  @Body() dto: CreateAdminDto,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.createAdmin(dto, file);
}

@Get('admins')
getAdmins() {
  return this.usersService.getAdmins();
}

@Put(':id')
update(
  @Param('id') id: string,
  @Body() dto: any,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.updateUserWithFile(id, dto, file);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.usersService.deleteUser(id);
}

@Put(':id/activate')
activate(@Param('id') id: string) {
  return this.usersService.activateUser(id);
}

@Put(':id/deactivate')
deactivate(@Param('id') id: string) {
  return this.usersService.deactivateUser(id);
}
```

---

## Alerts Integration Code

```typescript
// In any list component, inject AlertsService
constructor(
  private adminService: AdminService,
  private alertsService: AlertsService,
) {}

// Load alerts on init
ngOnInit(): void {
  this.loadAdmins();
  this.loadAlerts();
}

// Load and count open alerts
loadAlerts(): void {
  this.alertsService.getAlerts().subscribe({
    next: (alerts: any[]) => {
      this.alertCount = alerts.filter(a => a.status === 'open').length;
    },
    error: (err) => console.error('Error loading alerts:', err),
  });
}
```

Display in template:

```html
<div class="alert-badge" *ngIf="alertCount > 0">
  <mat-icon>notifications_active</mat-icon>
  <span>{{ alertCount }} Active Alerts</span>
</div>
```

---

## Common Patterns

### FormData Creation

```typescript
const formData = new FormData();
const values = this.form.value;

Object.keys(values).forEach((key) => {
  if (values[key] !== null && values[key] !== undefined && values[key] !== "") {
    formData.append(key, String(values[key]).trim());
  }
});

if (this.selectedFile) {
  formData.append("file", this.selectedFile);
}
```

### Error Handling

```typescript
this.service.method().subscribe({
  next: (result) => {
    // Success handling
    this.operationSuccess();
  },
  error: (err) => {
    console.error("Error:", err);
    alert("Error: " + (err.message || "Operation failed"));
  },
});
```

### Mapping to UI Models

```typescript
private mapToAdminRow(a: Admin): AdminRow {
  return {
    _id: a._id,
    firstName: a.firstName,
    lastName: a.lastName,
    email: a.email,
    photo: a.photo,
    isArchived: Boolean(a.isArchived),
    isActive: Boolean(a.isActive ?? true),
  };
}
```

---

**Use these snippets as templates for extending to other modules!**
