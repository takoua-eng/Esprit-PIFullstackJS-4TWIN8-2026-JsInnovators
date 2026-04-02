import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';
import { forkJoin } from 'rxjs';

interface QuestionItem {
  key: string;
  text: string;
  type: 'text' | 'radio' | 'scale';
  options?: string[];
  min?: number;
  max?: number;
}

interface Template {
  _id: string;
  title: string;
  description?: string;
  questions: QuestionItem[];
  completedToday?: boolean;
  isOpen?: boolean;
  form?: FormGroup;
  isSubmitting?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-questionnaires',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './questionnaires.component.html',
  styleUrl: './questionnaires.component.scss',
})
export class QuestionnairesComponent implements OnInit {
  templates: Template[] = [];
  isLoading = true;
  noTemplatesYet = false;

  constructor(private fb: FormBuilder, private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.getAssignedQuestionnaires().subscribe({
      next: (templates) => {
        if (!templates || templates.length === 0) {
          this.noTemplatesYet = true;
          this.isLoading = false;
          return;
        }

        // Check which ones were already completed today
        const checks = templates.map(t =>
          this.patientService.hasCompletedTemplate(t._id)
        );

        forkJoin(checks).subscribe({
          next: (results) => {
            this.templates = templates.map((t, i) => ({
              ...t,
              completedToday: results[i],
              isOpen: false,
              form: undefined,
              isSubmitting: false,
              successMessage: '',
              errorMessage: '',
            }));
            this.isLoading = false;
          },
          error: () => {
            this.templates = templates.map(t => ({ ...t, completedToday: false, isOpen: false, isSubmitting: false, successMessage: '', errorMessage: '' }));
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.noTemplatesYet = true;
        this.isLoading = false;
      },
    });
  }

  openTemplate(t: Template) {
    if (t.completedToday) return;
    t.isOpen = true;
    const controls: any = {};
    t.questions.forEach(q => {
      if (q.type === 'scale') {
        controls[q.key] = ['', [Validators.required, Validators.min(q.min ?? 1), Validators.max(q.max ?? 10)]];
      } else if (q.type === 'radio') {
        controls[q.key] = ['', Validators.required];
      } else {
        controls[q.key] = [''];
      }
    });
    t.form = this.fb.group(controls);
  }

  getControl(t: Template, key: string): FormControl {
    return t.form!.get(key) as FormControl;
  }

  submit(t: Template) {
    if (!t.form || t.form.invalid) { t.form?.markAllAsTouched(); return; }
    t.isSubmitting = true;
    t.successMessage = '';
    t.errorMessage = '';
    const answers: Record<string, string> = {};
    t.questions.forEach(q => { answers[q.key] = String(t.form!.value[q.key] ?? ''); });

    this.patientService.submitQuestionnaireWithTemplate(t._id, answers).subscribe({
      next: () => {
        t.isSubmitting = false;
        t.completedToday = true;
        t.isOpen = false;
        t.successMessage = 'Questionnaire submitted successfully!';
      },
      error: (err: any) => {
        t.isSubmitting = false;
        t.errorMessage = err?.error?.message ?? 'Failed to submit. Please try again.';
      },
    });
  }
}
