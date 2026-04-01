import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  CoordinatorService,
  CoordinatorPatientRow,
} from 'src/app/services/coordinator.service';

@Component({
  selector: 'app-coordinator-patients',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './coordinator-patients.html',
  styleUrls: ['./coordinator-patients.scss'],
})
export class CoordinatorPatientsComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);

  coordinatorId = '69c32545a5201407afd209cf';
  patients: CoordinatorPatientRow[] = [];
  loading = true;

  displayedColumns = [
    'name',
    'email',
    'department',
    'medicalRecordNumber',
    'vitals',
    'symptoms',
    'status',
  ];

  ngOnInit(): void {
    this.coordinatorService.getPatientsWithCompliance(this.coordinatorId).subscribe({
      next: (data) => {
        this.patients = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Patients error', err);
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    if (status === 'Up to date') return 'good';
    if (status === 'Incomplete today') return 'warn';
    return 'neutral';
  }
}