import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { PatientService } from 'src/app/services/patient.service';
import { forkJoin, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [MaterialModule, FormsModule, ReactiveFormsModule, CommonModule, TranslateModule],
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

        // Check completion status for each instance using the new backend endpoint
        if (instances.length > 0) {
          const checks = instances.map(inst => {
            const id = inst._id || inst.id;
            if (!id) return of(false); // Safety: avoid 404 for empty ID
            return this.patientService.hasCompletedInstance(id);
          });

          forkJoin(checks).subscribe({
            next: (statuses) => {
              this.instances = instances.map((inst, index) => ({
                ...inst,
                isOpen: false,
                form: undefined,
                isSubmitting: false,
                successMessage: '',
                errorMessage: '',
                completedToday: statuses[index]
              }));
              this.isLoading = false;
            },
            error: () => {
              // Fallback: show instances without completion status if check fails
              this.instances = instances.map((inst) => ({
                ...inst,
                isOpen: false,
                form: undefined,
                isSubmitting: false,
                successMessage: '',
                errorMessage: '',
                completedToday: false
              }));
              this.isLoading = false;
            }
          });
        }
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
      const qId = q._id || q.id;
      const validators = [];
      if (q.required) validators.push(Validators.required);
      
      if (q.type === 'number') {
        controls[qId] = ['', [...validators, Validators.pattern('^-?\\d*(\\.\\d+)?$')]];
      } else {
        controls[qId] = ['', validators];
      }
    });

    inst.form = this.fb.group(controls);
  }

  getControl(inst: any, question: any): any {
    const qId = question._id || question.id;
    return inst.form?.get(qId);
  }

  isChecked(inst: any, question: any, option: string): boolean {
    const qId = question._id || question.id;
    const value = inst.form?.get(qId)?.value;
    return Array.isArray(value) && value.includes(option);
  }

  toggleCheckbox(inst: any, question: any, option: string) {
    const qId = question._id || question.id;
    const control = inst.form?.get(qId);
    if (!control) return;
    
    const current = Array.isArray(control.value) ? [...control.value] : [];
    const idx = current.indexOf(option);
    if (idx > -1) current.splice(idx, 1);
    else current.push(option);
    
    control.setValue(current);
    control.markAsDirty();
  }

  submit(inst: any) {
    if (!inst.form || inst.form.invalid) {
      Object.keys(inst.form?.controls || {}).forEach(key => {
        inst.form.get(key)?.markAsTouched();
      });
      return;
    }

    inst.isSubmitting = true;
    inst.successMessage = '';
    inst.errorMessage = '';

    const answers = inst.questions.map((q: any) => {
      const qId = q._id || q.id;
      return {
        questionId: qId,
        value: inst.form.value[qId]
      };
    });

    const instanceId = inst._id || inst.id;
    if (!instanceId) {
      inst.isSubmitting = false;
      return;
    }

    this.patientService.submitInstanceResponse(instanceId, answers).subscribe({
      next: () => {
        inst.isSubmitting = false;
        inst.isOpen = false;
        inst.completedToday = true;
        inst.successMessage = 'SUBMIT_SUCCESS';
        setTimeout(() => (inst.successMessage = ''), 5000);
      },
      error: (err) => {
        inst.isSubmitting = false;
        inst.errorMessage = err.error?.message || 'Error submitting response';
      },
    });
  }
}
