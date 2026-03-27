import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  CoordinatorDashboardSummary,
  CoordinatorPatientRow,
  CoordinatorService,
} from 'src/app/services/coordinator.service';

@Component({
  selector: 'app-coordinator-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule],
  templateUrl: './coordinator-dashboard.component.html',
  styleUrls: ['./coordinator-dashboard.component.scss'],
})
export class CoordinatorDashboardComponent implements OnInit {
  private coordinatorService = inject(CoordinatorService);

  // IMPORTANT : remplace par le vrai _id du coordinator user dans MongoDB
  coordinatorId = '69c32545a5201407afd209cf';

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