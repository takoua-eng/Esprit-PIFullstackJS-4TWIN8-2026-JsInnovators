import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AlertsApiService } from 'src/app/services/alerts-api.service';
import { UsersApiService } from 'src/app/services/users-api.service';

interface MonitoredPatientRow {
  name: string;
  service: string;
  lastReading: string;
  status: 'Stable' | 'Watch';
}

@Component({
  selector: 'app-doctor-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    TranslateModule,
  ],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
})
export class DoctorDashboardComponent implements OnInit {
  assignedPatients = 9;
  activeAlerts: number | null = null;

  constructor(
    private readonly alertsApi: AlertsApiService,
    private readonly usersApi: UsersApiService,
  ) {}

  ngOnInit(): void {
    this.usersApi.getPhysicians().subscribe({
      next: (rows) => {
        const doctorId = rows[0]?._id;
        this.alertsApi.getOpenCount({ doctorId }).subscribe({
          next: ({ count }) => (this.activeAlerts = count),
          error: () => (this.activeAlerts = null),
        });
      },
      error: () => {
        this.alertsApi.getOpenCount().subscribe({
          next: ({ count }) => (this.activeAlerts = count),
          error: () => (this.activeAlerts = null),
        });
      },
    });
  }

  patients: MonitoredPatientRow[] = [];

  displayedColumns: string[] = ['name', 'service', 'lastReading', 'status'];
}
