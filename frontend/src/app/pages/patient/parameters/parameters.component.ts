import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';

@Component({
  selector: 'app-parameters',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.scss',
})
export class ParametersComponent {
  parametersForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private patientService: PatientService) {
    this.parametersForm = this.fb.group({
      temperature: ['', [Validators.required, Validators.min(35), Validators.max(42)]],
      bloodPressureSystolic: ['', [Validators.required, Validators.min(80), Validators.max(200)]],
      bloodPressureDiastolic: ['', [Validators.required, Validators.min(50), Validators.max(120)]],
      weight: ['', [Validators.required, Validators.min(30), Validators.max(200)]],
      heartRate: ['', [Validators.required, Validators.min(40), Validators.max(200)]],
      notes: [''],
    });
  }

  onSubmit() {
    if (this.parametersForm.invalid) {
      this.parametersForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formVal = this.parametersForm.value;
    const payload = {
      temperature: Number(formVal.temperature),
      bloodPressuresystolic: Number(formVal.bloodPressureSystolic),
      bloodPressureDiastolic: Number(formVal.bloodPressureDiastolic),
      weight: Number(formVal.weight),
      heartRate: Number(formVal.heartRate),
      notes: formVal.notes,
      recordedAt: new Date().toISOString(),
    };

    this.patientService.submitVitals(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Vital parameters saved successfully!';
        this.parametersForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Failed to save. Please check your connection.';
      },
    });
  }
}