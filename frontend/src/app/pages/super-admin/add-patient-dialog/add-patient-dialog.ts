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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatError, MatHint } from '@angular/material/form-field';

@Component({
  selector: 'app-add-patient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatError,
    MatHint,
  ],
  templateUrl: './add-patient-dialog.html',
  styleUrls: ['./add-patient-dialog.scss'],
})
export class AddPatientDialog implements OnInit {
  patientForm: FormGroup;
  photoPreview: string | null = null;
  selectedFile: File | null = null;
  isSubmitted = false;

  // ✅ AJOUT: Propriété 'today' pour le datepicker
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPatientDialog>,
  ) {
    this.patientForm = this.fb.group({
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
      dateOfBirth: [null, [Validators.required, this.minAgeValidator(18)]],
      age: [{ value: '', disabled: true }],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      medicalRecordNumber: [{ value: this.generateMRN(), disabled: true }],
      emergencyContact: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\+216|00216|0)?[2-9]\d{7}$/),
        ],
      ],
      insuranceProvider: [''],
      insuranceNumber: [''],
    });
  }

  ngOnInit(): void {
    this.patientForm.get('dateOfBirth')?.valueChanges.subscribe((date) => {
      if (date) {
        const age = this.calculateAge(date);
        this.patientForm.patchValue({ age }, { emitEvent: false });
      }
    });
  }

  // 🎯 Custom Validator: Âge minimum
  minAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return { required: true };
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age < minAge
        ? { minAge: { required: minAge, actual: age } }
        : null;
    };
  }

  // 📸 Gestion photo
  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (input) input.value = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image trop volumineuse (max 5MB)');
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

  // 🔢 Génération MRN unique
  private generateMRN(): string {
    const prefix = 'MRN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  // 🎂 Calcul âge
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  // 📝 Messages d'erreur personnalisés
  getErrorMessage(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
    if (!control?.errors) return '';

    const errors: Record<string, string> = {
      required: 'Ce champ est obligatoire',
      email: 'Adresse email invalide',
      minlength: `Minimum ${control.errors['minlength'].requiredLength} caractères`,
      maxlength: `Maximum ${control.errors['maxlength']?.requiredLength || 50} caractères`,
      pattern: this.getPatternMessage(fieldName),
      minAge: `Âge minimum requis: ${control.errors['minAge']?.required} ans`,
    };

    for (const key of Object.keys(control.errors)) {
      if (errors[key]) return errors[key];
    }
    return 'Champ invalide';
  }

  private getPatternMessage(field: string): string {
    const messages: Record<string, string> = {
      firstName: 'Uniquement des lettres (a-z, A-Z)',
      lastName: 'Uniquement des lettres (a-z, A-Z)',
      phone: 'Format: 22123456 ou +21622123456',
      nationalId: '8 chiffres requis (ex: 12345678)',
      password: 'Min 8 car. avec maj, min, chiffre et symbole',
      emergencyContact: 'Format téléphone invalide',
    };
    return messages[field] || 'Format invalide';
  }

  // ✅ CORRECTION: Retourne boolean strict (pas undefined)
  isValidField(field: string): boolean {
    const control = this.patientForm.get(field);
    return (
      control?.valid === true && (control?.touched === true || this.isSubmitted)
    );
  }

  // ✅ CORRECTION: Retourne boolean strict (pas undefined)
  hasError(field: string): boolean {
    const control = this.patientForm.get(field);
    return (
      control?.invalid === true &&
      (control?.touched === true || this.isSubmitted)
    );
  }

  onSubmit(): void {
    this.isSubmitted = true;

    Object.keys(this.patientForm.controls).forEach((key) => {
      this.patientForm.get(key)?.markAsTouched();
    });

    if (this.patientForm.valid) {
      const formData = new FormData();

      const values = this.patientForm.getRawValue();

      // 🔥 envoyer tous les champs
      Object.keys(values).forEach((key) => {
        let value = values[key];

        if (key === 'dateOfBirth' && value) {
          value = new Date(value).toISOString();
        }

        formData.append(key, value);
      });

      // 🔥 IMPORTANT: envoyer le fichier avec le nom "file"
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      // 🔥 TEST
      console.log('FORM DATA READY');

      this.dialogRef.close(formData); // 👈 envoyer au parent
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
