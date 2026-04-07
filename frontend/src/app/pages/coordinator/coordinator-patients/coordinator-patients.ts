import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CoordinatorService, CoordinatorPatientRow } from 'src/app/services/coordinator.service';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-coordinator-patients',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, TranslateModule],
  templateUrl: './coordinator-patients.html',
  styleUrls: ['./coordinator-patients.scss'],
})
export class CoordinatorPatientsComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);
  private coreService = inject(CoreService);

  coordinatorId = '';
  patients: CoordinatorPatientRow[] = [];
  loading = true;

  displayedColumns = ['name', 'email', 'department', 'medicalRecordNumber', 'vitals', 'symptoms', 'status'];

  ngOnInit(): void {
    const user = this.coreService.currentUser();
    if (user?._id) {
      this.coordinatorId = user._id;
    } else {
      const raw = localStorage.getItem('medi_follow_user_data');
      if (raw) {
        try { this.coordinatorId = JSON.parse(raw)._id || ''; } catch { }
      }
    }

    if (!this.coordinatorId) { console.error('No coordinator ID'); this.loading = false; return; }

    this.coordinatorService.getPatientsWithCompliance(this.coordinatorId).subscribe({
      next: (data) => { this.patients = data; this.loading = false; },
      error: (err) => { console.error('Patients error', err); this.loading = false; },
    });
  }

  getStatusClass(status: string): string {
    if (status === 'UP_TO_DATE') return 'good';
    if (status === 'INCOMPLETE_TODAY') return 'warn';
    return 'neutral';
  }
}