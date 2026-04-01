import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  CoordinatorService,
  CoordinatorPatientRow,
  ComplianceRow,
  ReminderRow,
  buildReminderMessages,
} from 'src/app/services/coordinator.service';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reminders.html',
  styleUrls: ['./reminders.scss'],
})
export class RemindersComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);
  private fb = inject(FormBuilder);

  coordinatorId = '69c32545a5201407afd209cf';

  reminders: ReminderRow[] = [];
  patients: CoordinatorPatientRow[] = [];
  complianceData: ComplianceRow[] = [];

  showForm = false;

  // Message sélectionné dans la liste déroulante
  selectedMessage = '';
  messageOptions: { value: string; label: string }[] = [];

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
    this.loadCompliance();
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

  loadCompliance(): void {
    this.coordinatorService.getComplianceToday(this.coordinatorId).subscribe({
      next: (data) => (this.complianceData = data),
      error: () => {},
    });
  }

  // Quand on change de patient dans le formulaire
  onPatientChange(patientId: string): void {
    const compliance = this.complianceData.find((c) => c._id === patientId);

    this.messageOptions = buildReminderMessages(
      compliance?.missingVitalFields ?? [],
      compliance?.missingSymptomFields ?? [],
    );

    this.selectedMessage = this.messageOptions[0]?.value || '';
    this.reminderForm.get('message')?.setValue(this.selectedMessage);
  }

  onMessageSelect(value: string): void {
    this.selectedMessage = value;
    this.reminderForm.get('message')?.setValue(value);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.reminderForm.reset({ type: 'follow_up' });
      this.messageOptions = [];
      this.selectedMessage = '';
    }
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
    });
  }

  cancelReminder(reminder: ReminderRow): void {
    if (!reminder._id) return;
    this.coordinatorService.cancelReminder(reminder._id).subscribe({
      next: () => this.loadReminders(),
    });
  }

  deleteReminder(reminder: ReminderRow): void {
    if (!reminder._id || !window.confirm('Delete this reminder?')) return;
    this.coordinatorService.deleteReminder(reminder._id).subscribe({
      next: () => this.loadReminders(),
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