import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { HttpClient } from '@angular/common/http';

export interface DoctorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  specialty: string;
  licenseNumber: string;
  yearsExperience: number;
  serviceId: string;
}

@Component({
  selector: 'app-add-doctor-dialog',
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
    MatNativeDateModule
  ],
  templateUrl: './add-medecin-dialog.html',
  styleUrls: ['./add-medecin-dialog.scss']
})
export class AddDoctorsDialog implements OnInit {

  doctorForm: FormGroup;

  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;

  services = [
    { _id: '1', name: 'Cardiology' },
    { _id: '2', name: 'Neurology' }
  ];

  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  specialtyOptions = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Surgery'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDoctorsDialog>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.doctorForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      dateOfBirth: [null, Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],

      specialty: ['', Validators.required],
      licenseNumber: ['', Validators.required],
      yearsExperience: [0, [Validators.required, Validators.min(0)]],

      serviceId: ['1']
    });
  }

  ngOnInit() {

    if (this.data) {

      this.doctorForm.patchValue({
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        email: this.data.email,
        phone: this.data.phone,
        dateOfBirth: this.data.dateOfBirth,
        gender: this.data.gender,
        address: this.data.address,
        specialty: this.data.specialty,
        licenseNumber: this.data.licenseNumber,
        yearsExperience: this.data.yearsExperience,
        serviceId: this.data.serviceId
      });

      this.doctorForm.get('password')?.clearValidators();
      this.doctorForm.get('password')?.updateValueAndValidity();

      if (this.data.photo) {
        this.imagePreview = this.data.photo;
      }
    }
  }

  onSubmit() {

    if (this.doctorForm.invalid) return;

    const formData = new FormData();

    Object.keys(this.doctorForm.value).forEach(key => {
      formData.append(key, this.doctorForm.value[key]);
    });

    formData.append('role', 'doctor'); // backend fera la recherche insensible à la casse

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    if (this.data) {

      this.http.patch(`http://localhost:3000/users/${this.data._id}`, formData)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: err => console.error(err)
        });

    } else {

      this.http.post(`http://localhost:3000/users/doctor`, formData)
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: err => console.error(err)
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {

    const control = this.doctorForm.get(fieldName);
    if (!control) return '';

    if (control.hasError('required')) return 'Required';
    if (control.hasError('email')) return 'Invalid email';
    if (control.hasError('pattern')) return 'Invalid format';
    if (control.hasError('minlength')) return 'Too short';

    return '';
  }

  onFileSelected(event: any) {

    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }
}