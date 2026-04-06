import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionnaireApiService } from '../../../services/questionnaire-api.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-review-questionnaire-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './review-questionnaire-dialog.html',
  styleUrls: ['./review-questionnaire-dialog.scss']
})
export class ReviewQuestionnaireDialog implements OnInit {
  response: any;
  instance: any;
  loading = true;
  doctorNotes = '';
  mappedAnswers: { label: string; value: any }[] = [];

  constructor(
    private questionnaireApi: QuestionnaireApiService,
    public dialogRef: MatDialogRef<ReviewQuestionnaireDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { response: any }
  ) {
    this.response = data.response;
  }

  ngOnInit(): void {
    this.questionnaireApi.getInstance(this.response.questionnaireInstanceId).subscribe({
      next: (inst) => {
        this.instance = inst;
        this.mapAnswers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  mapAnswers(): void {
    if (!this.instance || !this.response) return;
    this.mappedAnswers = this.response.answers.map((a: any) => {
      const question = this.instance.questions.find((q: any) => q._id === a.questionId);
      return {
        label: question?.label || 'Question inconnu',
        value: a.value
      };
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({ notes: this.doctorNotes });
  }

  formatValue(val: any): string {
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  }
}
