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
  instances: any[] = [];
  isLoading = true;
  noQuestionnaires = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.patientService.getAssignedQuestionnaires().subscribe({
      next: (instances) => {
        if (!instances || instances.length === 0) {
          this.noQuestionnaires = true;
          this.isLoading = false;
          return;
        }

        // Check which ones have responses
        // Optimization: For now, we show all assigned. 
        // In a real app, we might filter by "already answered today" or "unanswered"
        this.instances = instances.map((inst) => ({
          ...inst,
          isOpen: false,
          form: undefined,
          isSubmitting: false,
          successMessage: '',
          errorMessage: '',
        }));
        this.isLoading = false;
      },
      error: () => {
        this.noQuestionnaires = true;
        this.isLoading = false;
      },
    });
  }

  openInstance(inst: any) {
    inst.isOpen = true;
    const controls: any = {};
    
    // instance.questions is the actual list of Questions (from template + doctor extra)
    inst.questions.forEach((q: any) => {
      const validators = [];
      if (q.required) validators.push(Validators.required);
      
      if (q.type === 'number') {
        controls[q._id] = ['', [...validators, Validators.pattern('^-?\\d*(\\.\\d+)?$')]];
      } else {
        controls[q._id] = ['', validators];
      }
    });

    inst.form = this.fb.group(controls);
  }

  getControl(inst: any, qId: string): FormControl {
    return inst.form!.get(qId) as FormControl;
  }

  toggleCheckbox(inst: any, qId: string, option: string) {
    const control = this.getControl(inst, qId);
    let values: string[] = control.value || [];
    if (!Array.isArray(values)) values = [];

    if (values.includes(option)) {
      values = values.filter(v => v !== option);
    } else {
      values = [...values, option];
    }
    control.setValue(values);
    control.markAsDirty();
  }

  isChecked(inst: any, qId: string, option: string): boolean {
    const values = this.getControl(inst, qId).value;
    return Array.isArray(values) && values.includes(option);
  }

  submit(inst: any) {
    if (!inst.form || inst.form.invalid) {
      inst.form?.markAllAsTouched();
      return;
    }

    inst.isSubmitting = true;
    inst.successMessage = '';
    inst.errorMessage = '';

    const answers = inst.questions.map((q: any) => ({
      questionId: q._id,
      value: inst.form!.value[q._id]
    }));

    this.patientService.submitInstanceResponse(inst._id, answers).subscribe({
      next: () => {
        inst.isSubmitting = false;
        inst.isOpen = false;
        inst.successMessage = 'Questionnaire submitted successfully!';
        // Optionally remove from list or mark as completed
        inst.completedToday = true;
      },
      error: (err: any) => {
        inst.isSubmitting = false;
        inst.errorMessage = err?.error?.message ?? 'Failed to submit. Please try again.';
      },
    });
  }
}
