import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

// 🎨 Angular Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminService } from 'src/app/services/superadmin/admin.service';
import { ServiceService } from 'src/app/services/superadmin/service.service';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  templateUrl: './add-admin.html',
  styleUrls: ['./add-admin.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class AddAdminDialog implements OnInit {
  adminForm!: FormGroup;
  services: any[] = [];

  photoPreview: string | null = null;
  selectedFile: File | null = null;
  loading = false;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private serviceService: ServiceService,
    private dialogRef: MatDialogRef<AddAdminDialog>,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadServices();
  }

  // === 🎯 Initialisation du formulaire avec validations ===
  private initForm(): void {
    this.adminForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
          ),
        ],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\+216|00216|0)?[2-9]\d{7}$/),
        ],
      ],
      nationalId: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      address: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      gender: ['', Validators.required],
      serviceId: ['', Validators.required],
      isActive: [true],
    });
  }

  // === 🏥 Chargement des services ===
  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (res) => (this.services = res),
      error: (err) => console.error('Error loading services:', err),
    });
  }

  // === 📸 Gestion de la photo ===
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];

      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large (max 5MB)');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (input) input.value = '';
  }

  // === 🎯 Helpers pour les erreurs ===
  hasError(field: string): boolean {
    const control = this.adminForm.get(field);
    return (
      control?.invalid === true &&
      (control?.touched === true || this.isSubmitted)
    );
  }

  getErrorMessage(field: string): string {
    const control = this.adminForm.get(field);
    if (!control?.errors) return '';

    const errors: Record<string, string> = {
      required: 'This field is required',
      email: 'Invalid email address',
      minlength: `Minimum ${control.errors['minlength']?.requiredLength} characters`,
      maxlength: `Maximum ${control.errors['maxlength']?.requiredLength} characters`,
      pattern: this.getPatternMessage(field),
    };

    for (const key of Object.keys(control.errors)) {
      if (errors[key]) return errors[key];
    }
    return 'Invalid field';
  }

  private getPatternMessage(field: string): string {
    const messages: Record<string, string> = {
      firstName: 'Only letters allowed (a-z, A-Z, Arabic)',
      lastName: 'Only letters allowed (a-z, A-Z, Arabic)',
      phone: 'Format: 22123456 or +21622123456',
      nationalId: 'Must be 8 digits',
      password: 'Min 8 chars with uppercase, lowercase, number & symbol',
    };
    return messages[field] || 'Invalid format';
  }

  // === 📤 Soumission du formulaire ===
  onSubmit(): void {
    this.isSubmitted = true;

    // Mark all fields as touched to show errors
    Object.keys(this.adminForm.controls).forEach((key) => {
      this.adminForm.get(key)?.markAsTouched();
    });

    if (this.adminForm.invalid) return;

    this.loading = true;
    const formData = new FormData();
    const values = this.adminForm.getRawValue();

    // Append all form fields
    Object.keys(values).forEach((key) => {
      if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, String(values[key]));
      }
    });

    // Append file if selected
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
        console.error('Error creating admin:', err);
        alert('Failed to create admin. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // === 🔤 Initiales pour l'avatar ===
  getInitials(firstName: string, lastName: string): string {
    const f = firstName?.trim()?.[0]?.toUpperCase() || '';
    const l = lastName?.trim()?.[0]?.toUpperCase() || '';
    return f + l;
  }
}
