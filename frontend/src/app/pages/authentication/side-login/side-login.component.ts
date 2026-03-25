import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {

  constructor( private router: Router) {}

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required]),
    role: new FormControl('Admin', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const role = this.form.value.role;

  if (role === 'Admin') {
    this.router.navigate(['/dashboard/admin']);
  } else if (role === 'Coordinator') {
    this.router.navigate(['/dashboard/coordinator']);
  } else {
    this.router.navigate(['/dashboard']);
  }
}

  loginWithFaceID() {
  alert("Face ID authentication coming soon");
}
}
