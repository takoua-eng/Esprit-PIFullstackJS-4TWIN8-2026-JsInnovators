import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import * as SimpleWebAuthnBrowser from '@simplewebauthn/browser';
import { API_BASE_URL } from 'src/app/core/api.config';
import { getPostLoginPath } from 'src/app/core/post-login-route';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './side-login.component.html',
  styles: [
    `
      .login-error {
        margin-bottom: 1rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        background: #fdecea;
        color: #611a15;
        font-size: 0.875rem;
        line-height: 1.4;
      }
    `,
  ],
})
export class AppSideLoginComponent {
  loading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private core: CoreService,
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
  });

  get f() {
    return this.form.controls;
  }

  /** NestJS often returns `{ message: string | string[] }`; sometimes `error` is a string. */
  private messageFromHttpError(err: HttpErrorResponse): string {
    const e = err.error as
      | string
      | { message?: string | string[] }
      | null
      | undefined;
    if (!e) {
      return err.status === 401
        ? 'Wrong email or password, or no user in this database. Create a user first or check spelling.'
        : 'Request failed';
    }
    if (typeof e === 'string') return e;
    const m = e.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.join(', ');
    return err.status === 401
      ? 'Wrong email or password, or no user in this database.'
      : 'Request failed';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    this.http
      .post<{ accessToken: string; role: string }>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.loading = false;
          if (err.status === 0) {
            this.errorMessage = `Cannot reach API at ${API_BASE_URL}. Start the backend (e.g. cd backend && npm run start:dev) and ensure it listens on that URL.`;
          } else {
            this.errorMessage = this.messageFromHttpError(err);
          }
          return throwError(() => err);
        }),
      )
      .subscribe((res) => {
        this.loading = false;

        localStorage.setItem('accessToken', res.accessToken);
        this.core.setRoleFromLogin(res.role || '');

        this.router.navigateByUrl(getPostLoginPath(res.role));
      });
  }

  async loginWithFaceID() {
    try {
      this.loading = true;
      this.errorMessage = '';

      const email = this.form.value.email;
      if (!email) {
        this.errorMessage = 'Enter your email first.';
        this.loading = false;
        return;
      }

      const options: unknown = await this.http
        .get(
          `${API_BASE_URL}/auth/webauthn/login-challenge?email=` +
            encodeURIComponent(email),
        )
        .toPromise();

      const assertion = await SimpleWebAuthnBrowser.startAuthentication({
        optionsJSON: options as never,
      });

      const res = (await this.http
        .post<{ accessToken: string; role?: string }>(
          `${API_BASE_URL}/auth/webauthn/verify`,
          assertion,
        )
        .toPromise())!;

      localStorage.setItem('accessToken', res.accessToken);
      this.core.setRoleFromLogin(res.role || '');
      this.router.navigateByUrl(getPostLoginPath(res.role));
      this.loading = false;
    } catch (err: unknown) {
      console.error(err);
      this.loading = false;
      const e = err as { error?: { message?: string } };
      this.errorMessage = e?.error?.message || 'Face ID login failed';
    }
  }
}
