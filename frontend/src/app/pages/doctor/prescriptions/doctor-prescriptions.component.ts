import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { UsersApiService, UserListRow } from 'src/app/services/users-api.service';

type PrescriptionRow = {
  createdAt: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

@Component({
  selector: 'app-doctor-prescriptions',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    TranslateModule,
  ],
  templateUrl: './doctor-prescriptions.component.html',
  styleUrls: ['./doctor-prescriptions.component.scss'],
})
export class DoctorPrescriptionsComponent implements OnInit {
  patients: UserListRow[] = [];
  selectedPatientId = '';

  medication = '';
  dosage = '';
  frequency = '';
  duration = '';
  instructions = '';

  rows: PrescriptionRow[] = [];

  displayedColumns: string[] = [
    'createdAt',
    'patientName',
    'medication',
    'dosage',
    'frequency',
    'duration',
  ];

  constructor(private readonly usersApi: UsersApiService) {}

  ngOnInit(): void {
    this.usersApi.getPatients().subscribe({
      next: (rows) => {
        this.patients = rows;
        if (rows.length) this.selectedPatientId = rows[0]._id;
      },
    });
  }

  save(): void {
    if (!this.selectedPatientId || !this.medication.trim()) return;
    const patient = this.patients.find((p) => p._id === this.selectedPatientId);
    if (!patient) return;

    const newRow: PrescriptionRow = {
      createdAt: new Date().toISOString(),
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      medication: this.medication.trim(),
      dosage: this.dosage.trim(),
      frequency: this.frequency.trim(),
      duration: this.duration.trim(),
      instructions: this.instructions.trim(),
    };

    this.rows = [newRow, ...this.rows];
    this.medication = '';
    this.dosage = '';
    this.frequency = '';
    this.duration = '';
    this.instructions = '';
  }
}
