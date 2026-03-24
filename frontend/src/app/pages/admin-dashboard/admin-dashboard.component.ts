import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';
import { AppProfitExpensesComponent } from 'src/app/components/profit-expenses/profit-expenses.component';
import { TablerIconsModule } from 'angular-tabler-icons';

interface AdminUserRow {
  name: string;
  email: string;
  role: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MaterialModule,
    AppProfitExpensesComponent,
    TablerIconsModule,
    TranslateModule,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  displayedColumns: string[] = ['name', 'email', 'role', 'service', 'status', 'actions'];

  users: AdminUserRow[] = [
    { name: 'Super Admin', email: 'super.admin@hospital.tn', role: 'Admin', service: 'Global', status: 'Active' },
    { name: 'Admin Chirurgie', email: 'admin.chirurgie@hospital.tn', role: 'Admin', service: 'Surgery', status: 'Active' },
    { name: 'John Patient', email: 'john.patient@hospital.tn', role: 'Patient', service: 'Cardiology', status: 'Active' },
    { name: 'Sarah Patient', email: 'sarah.patient@hospital.tn', role: 'Patient', service: 'Oncology', status: 'Inactive' },
    { name: 'Dr. Ben Salah', email: 'dr.bensalah@hospital.tn', role: 'Physician', service: 'Cardiology', status: 'Active' },
    { name: 'Nurse Amira', email: 'amira.nurse@hospital.tn', role: 'Nurse', service: 'Oncology', status: 'Active' },
    { name: 'Coordinator Anis', email: 'anis.coordinator@hospital.tn', role: 'Coordinator', service: 'Cardiology', status: 'Inactive' },
    { name: 'Auditor Sameh', email: 'sameh.audit@hospital.tn', role: 'Auditor', service: 'Quality', status: 'Active' },
  ];

  get totalUsers(): number {
    return this.users.length;
  }

  get totalPatients(): number {
    return this.users.filter((u) => u.role === 'Patient').length;
  }

  get totalPhysicians(): number {
    return this.users.filter((u) => u.role === 'Physician').length;
  }

  get totalNurses(): number {
    return this.users.filter((u) => u.role === 'Nurse').length;
  }

  get totalCoordinators(): number {
    return this.users.filter((u) => u.role === 'Coordinator').length;
  }

  get totalAuditors(): number {
    return this.users.filter((u) => u.role === 'Auditor').length;
  }

  viewMode: 'day' | 'month' | 'year' = 'month';
}

