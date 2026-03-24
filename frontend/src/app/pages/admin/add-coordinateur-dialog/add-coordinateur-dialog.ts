import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface CoordinatorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  yearsExperience: number;
  specialization: string;
}

@Component({
  selector: 'app-add-coordinateur-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-coordinateur-dialog.html',
  styleUrls: ['./add-coordinateur-dialog.scss'],
})
export class AddCoordinateurDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddCoordinateurDialog>);

  coordinatorForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
    department: ['', Validators.required],
    role: ['', Validators.required],
    yearsExperience: [0, [Validators.required, Validators.min(0), Validators.max(60)]],
    specialization: ['', Validators.required],
  });

  departmentOptions = [
    'Cardiology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
  ];

  roleOptions = [
    'Department Head',
    'Project Manager',
    'Quality Coordinator',
    'Administrative Coordinator',
  ];

  onSubmit(): void {
    if (this.coordinatorForm.valid) {
      this.dialogRef.close(this.coordinatorForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.coordinatorForm.controls).forEach((key) => {
      const control = this.coordinatorForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.coordinatorForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (control?.hasError('min') || control?.hasError('max')) {
      return 'Please enter a realistic number';
    }
    return '';
  }
}
