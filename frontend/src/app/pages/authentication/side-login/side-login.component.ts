import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  isLoading = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required]),
    role: new FormControl('Patient', [Validators.required]),
    remember: new FormControl(false),
  });

  get f() {
    return this.form.controls;
  }

  /** Décode le payload d'un JWT sans bibliothèque externe */
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      email: this.form.value.uname,
      password: this.form.value.password,
    };

    this.http.post<{ accessToken: string }>('http://localhost:3000/auth/login', credentials)
      .subscribe({
        next: (res) => {
          const decoded = this.decodeJwt(res.accessToken);
          localStorage.setItem('accessToken', res.accessToken);
          if (decoded?.sub) {
            localStorage.setItem('userId', decoded.sub);
          }
          const role = decoded?.role ?? this.form.value.role ?? 'Patient';
          localStorage.setItem('user_role', role);
          this.isLoading = false;

          if (role === 'Admin' || role === 'SuperAdmin') {
            this.router.navigate(['/dashboard/admin']);
          } else if (role === 'Patient') {
            this.router.navigate(['/dashboard/patient/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message ?? 'Email ou mot de passe incorrect.';
        },
      });
  }

  loginWithFaceID() {
    alert('Face ID authentication coming soon');
  }
}
