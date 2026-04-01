import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

// Interface pour les données d'un coordinateur
export interface CoordinatorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  specialization: string;
  yearsExperience: number;
  password?: string; // en edit, password peut être optionnel
}

@Component({
  selector: 'app-add-coordinateur-dialog',
  templateUrl: './add-coordinateur-dialog.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class AddCoordinateurDialog implements OnInit {
  coordinatorForm: FormGroup;
  selectedFile!: File;
  imagePreview: string | ArrayBuffer | null = null;

  departmentOptions = [
    'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics', 'General Medicine'
  ];

  roleOptions = [
    'Department Head', 'Project Manager', 'Quality Coordinator', 'Administrative Coordinator'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCoordinateurDialog>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: CoordinatorData | null  // type plus précis
  ) {
    this.coordinatorForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      department: ['', Validators.required],
      role: ['', Validators.required],
      yearsExperience: [0, [Validators.required, Validators.min(0), Validators.max(60)]],
      specialization: ['', Validators.required],
      password: ['', [Validators.minLength(6)]] // password n'est obligatoire qu'en création
    });
  }

  ngOnInit() {
    if (this.data) {
      // Si on a reçu un utilisateur existant (edit)
      this.http.get<any>(`http://localhost:3000/users/${this.data.email || this.data.firstName}`)
        .subscribe(user => {
          if (user.role?.name.toLowerCase() === 'coordinator') {
            this.coordinatorForm.patchValue({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              department: user.department,
              role: this.roleOptions.includes(user.role.name) ? user.role.name : '',
              yearsExperience: user.yearsExperience,
              specialization: user.specialization
            });

            // Supprimer la validation password en mode edit
            this.coordinatorForm.get('password')?.clearValidators();
            this.coordinatorForm.get('password')?.updateValueAndValidity();

            if (user.photo) this.imagePreview = user.photo;
          }
        });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.coordinatorForm.get(fieldName);
    if (!control) return '';
    if (control.hasError('required')) return 'Required';
    if (control.hasError('email')) return 'Invalid email';
    if (control.hasError('pattern')) return 'Invalid format';
    if (control.hasError('minlength')) return 'Too short';
    return '';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.coordinatorForm.invalid) return;

    const formData = new FormData();
    Object.entries(this.coordinatorForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value.toString());
    });
    if (this.selectedFile) formData.append('photo', this.selectedFile);

    const request$ = this.data
      ? this.http.patch(`http://localhost:3000/users/${this.data.email}`, formData)
      : this.http.post('http://localhost:3000/users/coordinator', formData);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: err => console.error('Error:', err)
    });
  }
}