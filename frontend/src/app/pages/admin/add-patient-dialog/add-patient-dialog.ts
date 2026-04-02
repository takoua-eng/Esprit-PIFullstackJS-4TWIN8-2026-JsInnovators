import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { I } from '@angular/cdk/keycodes';
export interface PatientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalRecordNumber: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  serviceId: string;
  doctorId: string;
  nurseId: string;
  coordinatorId: string;
}
@Component({
  selector: 'app-add-patient-dialog',
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
  templateUrl: './add-patient-dialog.html',
  styleUrls: ['./add-patient-dialog.scss']
})
export class AddPatientDialog implements OnInit {

  patientForm: FormGroup;

  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;

  today = new Date();

  services = [
    { _id: '1', name: 'Cardiology' },
    { _id: '2', name: 'Neurology' }
  ];

  doctors = [
    { _id: '1', firstName: 'Dr John', lastName: 'Smith' },
    { _id: '2', firstName: 'Dr Sarah', lastName: 'Brown' }
  ];

  nurses = [
    { _id: '1', firstName: 'Anna', lastName: 'Lee' },
    { _id: '2', firstName: 'Maria', lastName: 'White' }
  ];

  coordinators = [
    { _id: '1', firstName: 'James', lastName: 'Walker' },
    { _id: '2', firstName: 'Emma', lastName: 'Scott' }
  ];

  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPatientDialog>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      dateOfBirth: [null, Validators.required], // ✅ FIX IMPORTANT
      gender: ['', Validators.required],
      address: ['', Validators.required],
      emergencyContact: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      medicalRecordNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],


      // valeurs par défaut pour éviter blocage
      serviceId: ['1'],
      doctorId: ['1'],
      nurseId: ['1'],
      coordinatorId: ['1']
    });
  }

  isFormValid(): boolean {
    return this.patientForm.valid;
  }

ngOnInit() {

  // DEBUG (tu peux garder)
  this.patientForm.statusChanges.subscribe(status => {
    console.log("STATUS:", status);
    console.log("FORM:", this.patientForm.value);
  });

  // 🔥 MODE EDIT
  if (this.data) {

    console.log("EDIT MODE DATA:", this.data);

    this.patientForm.patchValue({
      firstName: this.data.firstName,
      lastName: this.data.lastName,
      email: this.data.email,
      phone: this.data.phone,
      dateOfBirth: this.data.dateOfBirth,
      gender: this.data.gender,
      address: this.data.address,
      emergencyContact: this.data.emergencyContact,
      medicalRecordNumber: this.data.medicalRecordNumber,
      serviceId: this.data.serviceId,
      doctorId: this.data.doctorId,
      nurseId: this.data.nurseId,
      coordinatorId: this.data.coordinatorId
    });

    // 🔒 désactiver password en mode edit
    this.patientForm.get('password')?.clearValidators();
    this.patientForm.get('password')?.updateValueAndValidity();

    // 🖼 image preview
    if (this.data.photo) {
      this.imagePreview = this.data.photo;
    }
  }
}




   onSubmit() {

  if (this.patientForm.invalid) return;

  const formData = new FormData();

  Object.keys(this.patientForm.value).forEach(key => {
    formData.append(key, this.patientForm.value[key]);
  });

  if (this.selectedFile) {
    formData.append('photo', this.selectedFile);
  }

  // 🔥 MODE EDIT
  if (this.data) {
    this.http.patch(`http://localhost:3000/users/${this.data._id}`, formData)
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => console.error(err)
      });
  }

  // 🟢 MODE ADD
  else {
    this.http.post('http://localhost:3000/users/patients', formData)
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (err) => console.error(err)
      });
  }
}
  
  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
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