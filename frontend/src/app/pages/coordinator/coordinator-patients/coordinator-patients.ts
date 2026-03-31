import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CoordinatorService, CoordinatorPatientRow } from 'src/app/services/coordinator.service';

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
  displayedColumns = ['name', 'email', 'department', 'medicalRecordNumber', 'status'];

  ngOnInit(): void {
    this.coordinatorService.getAssignedPatients(this.coordinatorId).subscribe({
      next: (data) => (this.patients = data),
      error: (err) => console.error('Patients error', err),
    });
  }
}