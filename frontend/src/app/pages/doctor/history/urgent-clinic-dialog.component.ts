import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

export interface UrgentClinicDialogData {
  patientName: string;
}

export interface UrgentClinicDialogResult {
  severity: string;
  message: string;
}

@Component({
  selector: 'app-urgent-clinic-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, TranslateModule],
  templateUrl: './urgent-clinic-dialog.component.html',
})
export class UrgentClinicDialogComponent {
  severity = 'high';
  message = '';

  readonly severities = ['critical', 'high', 'medium'] as const;

  constructor(
    private readonly ref: MatDialogRef<
      UrgentClinicDialogComponent,
      UrgentClinicDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) readonly data: UrgentClinicDialogData,
  ) {}

  cancel(): void {
    this.ref.close(undefined);
  }

  submit(): void {
    this.ref.close({
      severity: this.severity,
      message: this.message.trim(),
    });
  }
}
