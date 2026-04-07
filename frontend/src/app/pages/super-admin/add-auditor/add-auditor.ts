import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialModule } from 'src/app/material.module';
import {
  AuditorService,
  Auditor,
} from 'src/app/services/superadmin/auditor.service';

@Component({
  selector: 'app-add-auditor',
  standalone: true,
  templateUrl: './add-auditor.html',
  styleUrls: ['./add-auditor.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MaterialModule,
  ],
})
export class AddAuditorDialog implements OnInit {
  auditorForm!: FormGroup;
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  hidePassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auditorService: AuditorService,
    private dialogRef: MatDialogRef<AddAuditorDialog>,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.auditorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: [''],
      address: [''],
      nationalId: [''],
      gender: [''],
      auditLevel: ['', Validators.required],
      isActive: [true],
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const f = firstName?.charAt(0)?.toUpperCase() || '';
    const l = lastName?.charAt(0)?.toUpperCase() || '';
    return f + l || '?';
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
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
    if (this.auditorForm.invalid) {
      this.auditorForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const values = this.auditorForm.value;

    // Append all form fields
    Object.keys(values).forEach((key) => {
      if (
        values[key] !== null &&
        values[key] !== undefined &&
        values[key] !== ''
      ) {
        formData.append(key, String(values[key]).trim());
      }
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.auditorService.createAuditor(formData).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        alert('Error: ' + (err.message || 'Failed to create auditor'));
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
