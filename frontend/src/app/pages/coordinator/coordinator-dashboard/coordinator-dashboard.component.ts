import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
  CoordinatorDashboardSummary,
  CoordinatorPatientRow,
  CoordinatorService,
} from 'src/app/services/coordinator.service';

@Component({
  selector: 'app-coordinator-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './coordinator-dashboard.component.html',
})
export class CoordinatorDashboard implements OnInit {
  private coordinatorService = inject(CoordinatorService);

  // remplace cet ID par un vrai _id coordinator de ta base
  coordinatorId = 'PUT_REAL_COORDINATOR_ID_HERE';

  summary: CoordinatorDashboardSummary = {
    totalAssignedPatients: 0,
    incompleteEntries: 0,
    remindersSentToday: 0,
    activeAlerts: 0,
  };

  patients: CoordinatorPatientRow[] = [];
  displayedColumns: string[] = ['name', 'email', 'department', 'status'];

  ngOnInit(): void {
    this.coordinatorService.getDashboard(this.coordinatorId).subscribe({
      next: (data) => (this.summary = data),
      error: (err) => console.error('Dashboard error', err),
    });

    this.coordinatorService.getAssignedPatients(this.coordinatorId).subscribe({
      next: (data) => (this.patients = data),
      error: (err) => console.error('Patients error', err),
    });
  }
}