
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
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

import { FaceRecognitionService } from 'src/app/services/face-recognition';

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
})
export class AppSideLoginComponent implements OnInit {

  // CLASSIC LOGIN
  loading = false;
  errorMessage = '';

  // FACE LOGIN
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  showCamera = false;
  loadingFace = false;
  faceMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private core: CoreService,
    private faceService: FaceRecognitionService
  ) { }

  // ================= INIT =================
  async ngOnInit() {
    await this.faceService.loadModels();
  }

  // ================= FORM =================
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false),
  });

  get f() {
    return this.form.controls;
  }

  // ================= ERROR HANDLING =================
  private messageFromHttpError(err: HttpErrorResponse): string {
    const e = err.error as
      | string
      | { message?: string | string[] }
      | null
      | undefined;

    if (!e) return err.status === 401 ? 'Wrong email or password.' : 'Request failed';
    if (typeof e === 'string') return e;
    const m = e.message;
    if (typeof m === 'string') return m;
    if (Array.isArray(m)) return m.join(', ');
    return 'Request failed';
  }

  // ================= CLASSIC LOGIN =================
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
        { email, password }
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = this.messageFromHttpError(err);
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

  // ================= START FACE LOGIN =================
  async startFaceLogin() {

    try {

      this.showCamera = true;
      this.faceMessage = 'Initializing camera...';

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const videoEl = this.video.nativeElement;

      videoEl.srcObject = stream;

      await videoEl.play();
      navigator.mediaDevices.getUserMedia({video:true})

      this.faceMessage = 'Look at the camera...';

      // attendre un peu pour stabiliser la caméra
      setTimeout(() => {
        this.captureAndLogin();
      }, 2000);

    } catch (err: any) {

      console.error('Camera error:', err);

      if (err.name === 'NotReadableError') {
        this.faceMessage = 'Camera already used by another app.';
      } else if (err.name === 'NotAllowedError') {
        this.faceMessage = 'Camera permission denied.';
      } else {
        this.faceMessage = 'Cannot access camera.';
      }

      this.showCamera = false;
    }
  }

  // ================= STOP CAMERA =================
  stopCamera() {

    const stream = this.video?.nativeElement?.srcObject as MediaStream | null;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

  }

  closeCamera() {
    this.showCamera = false;
    this.stopCamera();
  }

  // ================= CAPTURE FACE =================
  async captureFace(): Promise<number[] | null> {

    const result = await this.faceService.detectFace(this.video.nativeElement);

    if (!result) return null;

    return Array.from(result.descriptor);

  }

  // ================= FACE LOGIN =================
  async captureAndLogin() {

    this.loadingFace = true;
    this.faceMessage = 'Scanning face...';

    const descriptor = await this.captureFace();

    if (!descriptor) {

      this.faceMessage = 'No face detected. Try again.';
      this.loadingFace = false;

      return;

    }

    this.faceMessage = 'Face detected. Verifying...';

    this.http.post<any>(`${API_BASE_URL}/auth/face-login`, {
      faceDescriptor: descriptor
    })
      .subscribe({

        next: (res) => {

          this.faceMessage = 'Login successful';

          this.loadingFace = false;

          localStorage.setItem('accessToken', res.token);

          this.core.setRoleFromLogin(res.user?.role || '');

          this.stopCamera();

          this.router.navigateByUrl(getPostLoginPath(res.user?.role));

        },

        error: () => {

          this.faceMessage = 'Face not recognized';
          this.loadingFace = false;

        }

      });

  }

  // ================= WEBAUTHN FACE ID =================
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
        .get(`${API_BASE_URL}/auth/webauthn/login-challenge?email=` + encodeURIComponent(email))
        .toPromise();

      const assertion = await SimpleWebAuthnBrowser.startAuthentication({
        optionsJSON: options as never,
      });

      const res = (await this.http
        .post<{ accessToken: string; role?: string }>(
          `${API_BASE_URL}/auth/webauthn/verify`,
          assertion
        )
        .toPromise())!;

      localStorage.setItem('accessToken', res.accessToken);

      this.core.setRoleFromLogin(res.role || '');

      this.router.navigateByUrl(getPostLoginPath(res.role));

      this.loading = false;

    } catch (err) {

      console.error(err);

      this.loading = false;

      this.errorMessage = 'Face ID login failed';

    }
  }

}

