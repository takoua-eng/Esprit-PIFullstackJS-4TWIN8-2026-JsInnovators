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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, ReactiveFormsModule, FormsModule, TranslateModule],
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
  editingReminder: ReminderRow | null = null;

  selectedMessage = '';
  messageOptions: { value: string; label: string }[] = [];

  // Recherche
  searchQuery = '';

  // Pagination par jour
  allDays: string[] = [];       // liste des jours uniques triés décroissants
  currentDayIndex = 0;          // index du jour affiché
  pageSize = 10;                // reminders par page dans un jour
  currentPage = 0;

  reminderForm: FormGroup = this.fb.group({
    patientId: ['', Validators.required],
    type: ['follow_up', Validators.required],
    message: ['', [Validators.required, Validators.minLength(5)]],
    scheduledAt: [''],
  });

  displayedColumns = ['patient', 'type', 'message', 'status', 'scheduledAt', 'actions'];

  typeOptions = [
    { value: 'vital_entry', label: 'VITAL_ENTRY' },
    { value: 'questionnaire', label: 'QUESTIONNAIRE' },
    { value: 'follow_up', label: 'FOLLOW_UP' },
  ];

  ngOnInit(): void {
    this.loadReminders();
    this.loadPatients();
    this.loadCompliance();
  }

  loadReminders(): void {
    this.coordinatorService.getReminders(this.coordinatorId).subscribe({
      next: (data) => {
        this.reminders = data;
        this.buildDays();
        this.currentDayIndex = 0;
        this.currentPage = 0;
      },
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

  // ── Jours uniques extraits des scheduledAt ────────────────
  buildDays(): void {
    const daySet = new Set<string>();
    for (const r of this.reminders) {
      const d = r.scheduledAt || r.createdAt;
      if (d) {
        daySet.add(this.toDateKey(new Date(d)));
      }
    }
    this.allDays = Array.from(daySet).sort((a, b) => b.localeCompare(a)); // décroissant
  }

  toDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  formatDay(dayKey: string): string {
    const d = new Date(dayKey + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  get currentDay(): string {
    return this.allDays[this.currentDayIndex] || '';
  }

  prevDay(): void {
    if (this.currentDayIndex < this.allDays.length - 1) {
      this.currentDayIndex++;
      this.currentPage = 0;
    }
  }

  nextDay(): void {
    if (this.currentDayIndex > 0) {
      this.currentDayIndex--;
      this.currentPage = 0;
    }
  }

  // ── Filtrage recherche + jour ─────────────────────────────
  get filteredReminders(): ReminderRow[] {
    let result = this.reminders;

    // Filtre par jour
    if (this.currentDay) {
      result = result.filter((r) => {
        const d = r.scheduledAt || r.createdAt;
        return d ? this.toDateKey(new Date(d)) === this.currentDay : false;
      });
    }

    // Filtre recherche par nom de patient
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((r) =>
        this.getPatientName(r.patientId).toLowerCase().includes(q)
      );
    }

    return result;
  }

  // ── Pagination dans le jour filtré ───────────────────────
  get totalPages(): number {
    return Math.ceil(this.filteredReminders.length / this.pageSize);
  }

  get paginatedReminders(): ReminderRow[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredReminders.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearchChange(): void {
    this.currentPage = 0;
  }

  // ── Formulaire create / edit ──────────────────────────────
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
    this.editingReminder = null;
    if (!this.showForm) {
      this.reminderForm.reset({ type: 'follow_up' });
      this.messageOptions = [];
      this.selectedMessage = '';
    }
  }

  startEdit(reminder: ReminderRow): void {
    this.editingReminder = reminder;
    this.showForm = true;

    // Récupérer l'id patient
    const patientId = typeof reminder.patientId === 'object'
      ? reminder.patientId._id
      : reminder.patientId;

    this.reminderForm.patchValue({
      patientId: patientId,
      type: reminder.type,
      message: reminder.message,
      scheduledAt: reminder.scheduledAt
        ? new Date(reminder.scheduledAt).toISOString().slice(0, 16)
        : '',
    });

    this.onPatientChange(patientId);
    this.selectedMessage = reminder.message;
  }

  submitReminder(): void {
    if (this.reminderForm.invalid) {
      this.reminderForm.markAllAsTouched();
      return;
    }

    const { patientId, type, message, scheduledAt } = this.reminderForm.value;

    if (this.editingReminder?._id) {
      // MODE EDIT — update via PUT
      this.coordinatorService
        .updateReminder(this.editingReminder._id, { type, message, scheduledAt })
        .subscribe({
          next: () => {
            this.loadReminders();
            this.toggleForm();
          },
          error: (err) => console.error('Update reminder error', err),
        });
    } else {
      // MODE CREATE
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

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
