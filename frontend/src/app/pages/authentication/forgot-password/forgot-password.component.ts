import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatCard, MatCardContent } from "@angular/material/card";


@Component({
  selector: 'app-forgot-password',
  imports: [MatFormField, MatLabel, MatCard, ReactiveFormsModule, MatCardContent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;
      alert("Reset link sent to " + email);
    }
  }
}
