import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientService } from 'src/app/services/patient.service';

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  specialization?: string;
  photo?: string;
  medicalRecordNumber?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  isLoading = true;
  error = '';
  editMode = false;
  form: FormGroup;

  private readonly API = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private patientSvc: PatientService,
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      department: [''],
    });
  }

  ngOnInit() {
    const userId = this.patientSvc.getCurrentPatientId() || '';
    if (!userId) {
      this.error = 'User not found. Please log in again.';
      this.isLoading = false;
      return;
    }
    this.http.get<UserProfile>(`${this.API}/users/${userId}`).subscribe({
      next: (data) => {
        this.user = data;
        this.form.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          department: data.department || '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    if (this.user) {
      this.form.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        phone: this.user.phone || '',
        dateOfBirth: this.user.dateOfBirth || '',
        gender: this.user.gender || '',
        department: this.user.department || '',
      });
    }
    this.editMode = false;
  }

  saveProfile() {
    if (!this.user) return;
    if (this.form.invalid) {
      this.snackBar.open('Please fix validation errors', 'Close', { duration: 3000 });
      return;
    }
    const userId = this.user?._id || this.patientSvc.getCurrentPatientId() || localStorage.getItem('userId');
    if (!userId) return;
    const payload = this.form.value;
    this.http.put<UserProfile>(`${this.API}/users/${userId}`, payload).subscribe({
      next: (updated) => {
        this.user = { ...this.user!, ...updated };
        this.form.patchValue({
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email,
          phone: this.user.phone || '',
          dateOfBirth: this.user.dateOfBirth || '',
          gender: this.user.gender || '',
          department: this.user.department || '',
        });
        this.editMode = false;
        this.snackBar.open('Profile updated', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      },
    });
  }

  getInitials(): string {
    if (!this.user) return '?';
    return `${this.user.firstName?.[0] ?? ''}${this.user.lastName?.[0] ?? ''}`.toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return 'Not provided';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}