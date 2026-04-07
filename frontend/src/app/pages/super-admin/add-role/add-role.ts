import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { RoleService } from '../../../services/superadmin/role.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-role.html',
  styleUrls: ['./add-role.scss'],
})
export class AddRoleComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  permissionsList: string[] = [];
  filteredPermissions: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  permissionsFilterControl: FormControl = new FormControl();

  protected _onDestroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private dialogRef: MatDialogRef<AddRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      description: [this.data?.description || ''],
      permissions: [this.data?.permissions || []],
    });

    this.loadPermissions();

    // Listen for search field value changes
    this.permissionsFilterControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterPermissions();
      });
  }

  loadPermissions() {
    this.roleService.getPermissions().subscribe({
      next: (res: string[]) => {
        this.permissionsList = res;
        // Set initial permissions
        this.filteredPermissions.next(this.permissionsList);
      },
      error: (err) => {
        console.error('Error loading permissions', err);
      },
    });
  }

  filterPermissions() {
    if (!this.permissionsList) {
      return;
    }

    let search = this.permissionsFilterControl.value;

    if (!search) {
      this.filteredPermissions.next(this.permissionsList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    this.filteredPermissions.next(
      this.permissionsList.filter((permission) =>
        permission.toLowerCase().includes(search),
      ),
    );
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
