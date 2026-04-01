import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';

@Component({
  selector: 'app-symptoms',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './symptoms.component.html',
  styleUrl: './symptoms.component.scss',
})
export class SymptomsComponent {
  symptomsForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  availableSymptoms = [
    { name: 'douleur', label: 'Douleur', scale: true },
    { name: 'fatigue', label: 'Fatigue', scale: true },
    { name: 'essoufflement', label: 'Essoufflement', scale: true },
    { name: 'nausee', label: 'Nausée', scale: true },
    { name: 'vertiges', label: 'Vertiges', scale: false },
    { name: 'toux', label: 'Toux', scale: false },
    { name: 'fievre', label: 'Fièvre', scale: false },
  ];

  constructor(private fb: FormBuilder, private patientService: PatientService) {
    const formControls: any = {};
    this.availableSymptoms.forEach(symptom => {
      formControls[symptom.name] = [false];
      if (symptom.scale) {
        formControls[symptom.name + 'Scale'] = [0, [Validators.min(0), Validators.max(10)]];
      }
    });
    formControls['notes'] = [''];
    this.symptomsForm = this.fb.group(formControls);
  }

  getFormControl(key: string): FormControl {
    return this.symptomsForm.get(key) as FormControl;
  }

  onSubmit() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const fv = this.symptomsForm.value;

    // Construire la liste des symptômes cochés
    const selectedSymptoms: string[] = this.availableSymptoms
      .filter(s => fv[s.name])
      .map(s => s.name);

    const payload = {
      symptoms: selectedSymptoms,
      painLevel: Number(fv['douleurScale'] ?? 0),
      fatigueLevel: Number(fv['fatigueScale'] ?? 0),
      shortnessOfBreath: Boolean(fv['essoufflement']),
      nausea: Boolean(fv['nausee']),
      description: fv['notes'] ?? '',
      reportedAt: new Date().toISOString(),
    };

    this.patientService.submitSymptoms(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Symptômes enregistrés avec succès !';
        this.symptomsForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Erreur lors de l\'enregistrement.';
      },
    });
  }
}