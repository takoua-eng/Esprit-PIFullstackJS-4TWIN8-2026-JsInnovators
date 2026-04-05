import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MaterialModule } from 'src/app/material.module';
import {
  CreateTemplatePayload,
  QuestionnaireService,
  QuestionnaireTemplateQuestionApi,
} from 'src/app/services/questionnaire.service';

export type TemplateQuestionType =
  | 'text'
  | 'number'
  | 'single_choice'
  | 'multiple_choice';

export interface TemplateBuilderQuestion {
  key: string;
  text: string;
  type: TemplateQuestionType;
  options?: string[];
}

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './template-builder.html',
  styleUrl: './template-builder.scss',
})
export class TemplateBuilderComponent implements OnInit {
  private readonly snackBar = inject(MatSnackBar);
  private readonly questionnaireService = inject(QuestionnaireService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  title = '';
  category = '';
  allowDoctorToAddQuestions = true;
  questions: TemplateBuilderQuestion[] = [];
  submitting = false;
  loadingTemplate = false;
  loadError: string | null = null;
  editingTemplateId: string | null = null;

  private questionIdSeq = 0;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.editingTemplateId = id;
          this.loadTemplateForEdit(id);
          return;
        }
        this.editingTemplateId = null;
        this.loadError = null;
        if (this.route.snapshot.data['emptyTemplate'] === true) {
          this.resetEmptyTemplate();
        }
      });
  }

  private loadTemplateForEdit(id: string): void {
    this.loadingTemplate = true;
    this.loadError = null;
    this.questionnaireService.getTemplateById(id).subscribe({
      next: (doc) => {
        this.title = doc.title ?? '';
        this.category = doc.category ?? '';
        this.allowDoctorToAddQuestions = doc.allowDoctorToAddQuestions ?? true;
        this.questions = this.mapApiQuestionsToBuilder(doc.questions ?? []);
        this.questionIdSeq = Math.max(this.questions.length, 0);
        this.loadingTemplate = false;
      },
      error: () => {
        this.loadingTemplate = false;
        this.loadError = 'Impossible de charger ce modèle.';
        this.resetEmptyTemplate();
        this.editingTemplateId = null;
      },
    });
  }

  private mapApiQuestionsToBuilder(
    rows: QuestionnaireTemplateQuestionApi[],
  ): TemplateBuilderQuestion[] {
    return rows.map((q, idx) => {
      const type = this.normalizeQuestionType(q.type);
      const item: TemplateBuilderQuestion = {
        key: `q_${idx + 1}`,
        text: q.label ?? '',
        type,
      };
      if (type === 'single_choice' || type === 'multiple_choice') {
        const opts = Array.isArray(q.options) ? q.options.map((o) => String(o)) : [];
        item.options = opts.length > 0 ? [...opts] : ['', ''];
      }
      return item;
    });
  }

  private normalizeQuestionType(t: string | undefined): TemplateQuestionType {
    const allowed: TemplateQuestionType[] = [
      'text',
      'number',
      'single_choice',
      'multiple_choice',
    ];
    const v = String(t ?? '');
    return allowed.includes(v as TemplateQuestionType)
      ? (v as TemplateQuestionType)
      : 'text';
  }

  private resetEmptyTemplate(): void {
    this.title = '';
    this.category = '';
    this.allowDoctorToAddQuestions = true;
    this.questions = [];
    this.questionIdSeq = 0;
    this.submitting = false;
  }

  readonly typeOptions: { value: TemplateQuestionType; label: string }[] = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'single_choice', label: 'Choix unique' },
    { value: 'multiple_choice', label: 'Choix multiples' },
  ];

  addQuestion(): void {
    this.questionIdSeq++;
    this.questions.push({
      key: `q_${this.questionIdSeq}`,
      text: '',
      type: 'text',
    });
  }

  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
  }

  onTypeChange(q: TemplateBuilderQuestion, type: TemplateQuestionType): void {
    q.type = type;
    if (type === 'single_choice' || type === 'multiple_choice') {
      if (!q.options?.length) {
        q.options = ['', ''];
      }
    } else {
      q.options = undefined;
    }
  }

  isChoiceType(q: TemplateBuilderQuestion): boolean {
    return q.type === 'single_choice' || q.type === 'multiple_choice';
  }

  hasFilledChoiceOption(q: TemplateBuilderQuestion): boolean {
    return (q.options ?? []).some((o) => String(o).trim().length > 0);
  }

  choiceOptionsInvalid(q: TemplateBuilderQuestion): boolean {
    return this.isChoiceType(q) && !this.hasFilledChoiceOption(q);
  }

  validate(): boolean {
    return this.isFormValid();
  }

  titleRequiredError(titleCtrl: NgModel): boolean {
    return (!!titleCtrl.touched || !!titleCtrl.dirty) && !String(this.title).trim();
  }

  categoryRequiredError(catCtrl: NgModel): boolean {
    return (!!catCtrl.touched || !!catCtrl.dirty) && !String(this.category).trim();
  }

  questionTextRequiredError(q: TemplateBuilderQuestion, textCtrl: NgModel): boolean {
    return (!!textCtrl.touched || !!textCtrl.dirty) && !String(q.text).trim();
  }

  questionsListRequiredError(titleCtrl: NgModel, catCtrl: NgModel): boolean {
    return this.questions.length === 0 && (!!titleCtrl.touched || !!catCtrl.touched);
  }

  isFormValid(): boolean {
    if (!String(this.title).trim()) {
      return false;
    }
    if (!String(this.category).trim()) {
      return false;
    }
    if (this.questions.length === 0) {
      return false;
    }
    for (const q of this.questions) {
      if (!String(q.text).trim()) {
        return false;
      }
      if (this.choiceOptionsInvalid(q)) {
        return false;
      }
    }
    return true;
  }

  onSubmit(form: NgForm): void {
    if (!this.isFormValid() || this.submitting) {
      return;
    }
    this.title = this.title.trim();
    this.category = this.category.trim();
    for (const q of this.questions) {
      q.text = q.text.trim();
    }

    const payload = this.buildCreatePayload();
    this.submitting = true;
    const save$ = this.editingTemplateId
      ? this.questionnaireService.updateTemplate(this.editingTemplateId, payload)
      : this.questionnaireService.createTemplate(payload);
    save$.pipe(finalize(() => (this.submitting = false))).subscribe({
      next: () => {
        form.form.markAsPristine();
        const msg = this.editingTemplateId ? 'Modèle mis à jour.' : 'Modèle enregistré.';
        this.snackBar.open(msg, 'Fermer', { duration: 4000 });
        void this.router.navigate(['/admin/templates']);
      },
      error: (err: { error?: { message?: string | string[] } }) => {
        const raw = err?.error?.message;
        const msg = Array.isArray(raw)
          ? raw.join(' ')
          : typeof raw === 'string'
            ? raw
            : this.editingTemplateId
              ? 'Impossible de mettre à jour le modèle.'
              : 'Impossible d’enregistrer le modèle.';
        this.snackBar.open(msg, 'Fermer', { duration: 6000 });
      },
    });
  }

  private buildCreatePayload(): CreateTemplatePayload {
    return {
      title: this.title.trim(),
      category: this.category.trim(),
      allowDoctorToAddQuestions: this.allowDoctorToAddQuestions,
      questions: this.questions.map((q) => {
        const row: CreateTemplatePayload['questions'][number] = {
          label: q.text.trim(),
          type: q.type,
          required: false,
        };
        if (this.isChoiceType(q)) {
          row.options = (q.options ?? [])
            .map((o) => String(o).trim())
            .filter((o) => o.length > 0);
        }
        return row;
      }),
    };
  }

  addOption(q: TemplateBuilderQuestion): void {
    if (!q.options) {
      q.options = [];
    }
    q.options.push('');
  }

  removeOption(q: TemplateBuilderQuestion, optionIndex: number): void {
    if (!q.options?.length) {
      return;
    }
    q.options.splice(optionIndex, 1);
    if (q.options.length === 0) {
      q.options.push('');
    }
  }

  getTypeLabel(type: TemplateQuestionType): string {
    return this.typeOptions.find((o) => o.value === type)?.label ?? type;
  }
}
