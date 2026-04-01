import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';
import * as SimpleWebAuthnBrowser from '@simplewebauthn/browser'; // ✅ importer ici
 
@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {


  loading = false;
  errorMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }


    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    // 🔹 Appel HTTP POST /auth/login
    this.http.post<{ accessToken: string }>('http://localhost:3000/auth/login', { email, password })
      .pipe(
        catchError(err => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        this.loading = false;

        // 🔹 Stocker le token
        localStorage.setItem('accessToken', res.accessToken);

        // 🔹 Rediriger vers dashboard
        this.router.navigate(['/admin']);
      });
  }

 async loginWithFaceID() {
    try {
      this.loading = true;
      this.errorMessage = '';

      // 1️⃣ demander le challenge au backend
      const options: any = await this.http
        .get('http://localhost:3000/auth/webauthn/login-challenge?email=' + this.form.value.email)
        .toPromise();

      // 2️⃣ lancer la biométrie via le navigateur (Face ID / Touch ID)
      const assertion = await SimpleWebAuthnBrowser.startAuthentication(options);

      // 3️⃣ envoyer la réponse au backend pour validation
      const res: any = await this.http
        .post('http://localhost:3000/auth/webauthn/verify', assertion)
        .toPromise();

      // 4️⃣ stocker le token JWT et rediriger
      localStorage.setItem('accessToken', res.accessToken);
      this.router.navigate(['/admin']);
      this.loading = false;

    } catch (err: any) {
      console.error(err);
      this.loading = false;
      this.errorMessage = err.error?.message || 'Face ID login failed';

    }
  }
}