import { Component, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { PatientService, AlertEntry } from 'src/app/services/patient.service';

@Component({
  selector: 'app-alerts',
  imports: [MaterialModule, CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
})
export class AlertsComponent implements OnInit {
  alerts: AlertEntry[] = [];
  isLoading = true;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.getMyAlerts().subscribe({
      next: (data) => { this.alerts = data; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  resolve(id: string) {
    this.patientService.resolveAlert(id).subscribe(() => {
      const a = this.alerts.find(x => x._id === id);
      if (a) a.status = 'resolved';
    });
  }
}
