import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuestionnaireApiService } from '../../../services/questionnaire-api.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-send-questionnaire-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './send-questionnaire-dialog.html',
  styleUrls: ['./send-questionnaire-dialog.scss']
})
export class SendQuestionnaireDialog implements OnInit {
  templates: any[] = [];
  selectedTemplateId: string = '';
  loading = true;

  constructor(
    private questionnaireApi: QuestionnaireApiService,
    public dialogRef: MatDialogRef<SendQuestionnaireDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { patientName: string; patientId: string }
  ) {}

  ngOnInit(): void {
    this.questionnaireApi.getTemplates().subscribe({
      next: (res) => {
        this.templates = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get selectedTemplate(): any {
    return this.templates.find(t => t._id === this.selectedTemplateId);
  }

  onConfirm(): void {
    if (this.selectedTemplateId) {
      this.dialogRef.close(this.selectedTemplateId);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
