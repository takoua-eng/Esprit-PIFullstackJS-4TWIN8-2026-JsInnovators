import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  CoordinatorService,
  CoordinatorPatientRow,
  ReminderRow,
} from 'src/app/services/coordinator.service';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, ReactiveFormsModule],
  templateUrl: './reminders.html',
styleUrls: ['./reminders.scss'],
})
export class RemindersComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);
  private fb = inject(FormBuilder);

  // ⚠️ Remplace par le vrai _id coordinator
  coordinatorId = '69c32545a5201407afd209cf';

  reminders: ReminderRow[] = [];
  patients: CoordinatorPatientRow[] = [];

  showForm = false;

  reminderForm: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    type: ['follow_up', Validators.required],
    message: ['', [Validators.required, Validators.minLength(5)]],
    scheduledAt: [''],
  });

  displayedColumns = ['patient', 'type', 'message', 'status', 'scheduledAt', 'actions'];

  typeOptions = [
    { value: 'vital_entry', label: 'Vital Entry' },
    { value: 'questionnaire', label: 'Questionnaire' },
    { value: 'follow_up', label: 'Follow-up' },
  ];

  ngOnInit(): void {
    this.loadReminders();
    this.loadPatients();
  }

  loadReminders(): void {
    this.coordinatorService.getReminders(this.coordinatorId).subscribe({
      next: (data) => (this.reminders = data),
      error: (err) => console.error('Reminders error', err),
    });
  }

  loadPatients(): void {
    this.coordinatorService.getAssignedPatients(this.coordinatorId).subscribe({
      next: (data) => (this.patients = data),
      error: (err) => console.error('Patients error', err),
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.reminderForm.reset({ type: 'follow_up' });
  }

  submitReminder(): void {
    if (this.reminderForm.invalid) {
      this.reminderForm.markAllAsTouched();
      return;
    }

    const { patientId, type, message, scheduledAt } = this.reminderForm.value;

    this.coordinatorService
      .createReminder(this.coordinatorId, { patientId, type, message, scheduledAt })
      .subscribe({
        next: () => {
          this.loadReminders();
          this.toggleForm();
        },
        error: (err) => console.error('Create reminder error', err),
      });
  }

  sendReminder(reminder: ReminderRow): void {
    if (!reminder._id) return;
    this.coordinatorService.sendReminder(reminder._id).subscribe({
      next: () => this.loadReminders(),
      error: (err) => console.error('Send reminder error', err),
    });
  }

  cancelReminder(reminder: ReminderRow): void {
    if (!reminder._id) return;
    this.coordinatorService.cancelReminder(reminder._id).subscribe({
      next: () => this.loadReminders(),
      error: (err) => console.error('Cancel reminder error', err),
    });
  }

  deleteReminder(reminder: ReminderRow): void {
    if (!reminder._id) return;
    if (!window.confirm('Delete this reminder?')) return;
    this.coordinatorService.deleteReminder(reminder._id).subscribe({
      next: () => this.loadReminders(),
      error: (err) => console.error('Delete reminder error', err),
    });
  }

  getPatientName(patientId: any): string {
    if (patientId && typeof patientId === 'object') {
      return `${patientId.firstName} ${patientId.lastName}`;
    }
    const patient = this.patients.find((p) => p._id === patientId);
    return patient ? patient.name : 'Unknown';
  }

  getStatusClass(status: string): string {
    if (status === 'sent') return 'good';
    if (status === 'cancelled') return 'warn';
    return 'pending';
  }
}