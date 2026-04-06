import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  message = '';

  private backendUrl = 'http://localhost:3000/auth/forgot-password';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      const email = this.forgotForm.value.email;

      this.http.post<{ success: boolean; message: string }>(this.backendUrl, { email })
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.message = res.message || 'Reset link sent!';
          },
          error: (err) => {
            this.isLoading = false;
            this.message = err.error?.message || 'Something went wrong.';
          }
        });
    }
  }
}