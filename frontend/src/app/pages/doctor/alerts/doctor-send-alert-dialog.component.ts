import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

export interface DoctorSendAlertDialogData {
  patientName: string;
  sourceLabel: string;
  defaultSeverityLabel: string;
}

export interface DoctorSendAlertDialogResult {
  message: string;
}

@Component({
  selector: 'app-doctor-send-alert-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TranslateModule],
  templateUrl: './doctor-send-alert-dialog.component.html',
})
export class DoctorSendAlertDialogComponent {
  message = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DoctorSendAlertDialogData,
    private readonly dialogRef: MatDialogRef<
      DoctorSendAlertDialogComponent,
      DoctorSendAlertDialogResult | undefined
    >,
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  send(): void {
    const msg = this.message.trim();
    if (!msg.length) return;
    this.dialogRef.close({ message: msg });
  }
}
