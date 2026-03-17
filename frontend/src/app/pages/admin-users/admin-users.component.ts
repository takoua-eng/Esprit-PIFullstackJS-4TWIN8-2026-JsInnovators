import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ActivatedRoute, Router } from '@angular/router';

interface AdminUserRow {
  name: string;
  email: string;
  role: string;
  service: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  displayedColumns: string[] = ['name', 'email', 'service', 'status', 'actions'];

  title = 'Users';
  roleFilter: string | null = null;

  allUsers: AdminUserRow[] = [
    { name: 'John Patient', email: 'john.patient@hospital.tn', role: 'Patient', service: 'Cardiology', status: 'Active' },
    { name: 'Sarah Patient', email: 'sarah.patient@hospital.tn', role: 'Patient', service: 'Oncology', status: 'Inactive' },
    { name: 'Dr. Ben Salah', email: 'dr.bensalah@hospital.tn', role: 'Physician', service: 'Cardiology', status: 'Active' },
    { name: 'Dr. Nadia', email: 'dr.nadia@hospital.tn', role: 'Physician', service: 'Surgery', status: 'Active' },
    { name: 'Nurse Amira', email: 'amira.nurse@hospital.tn', role: 'Nurse', service: 'Oncology', status: 'Active' },
    { name: 'Nurse Karim', email: 'karim.nurse@hospital.tn', role: 'Nurse', service: 'ICU', status: 'Inactive' },
    { name: 'Coordinator Anis', email: 'anis.coord@hospital.tn', role: 'Coordinator', service: 'Cardiology', status: 'Active' },
    { name: 'Auditor Sameh', email: 'sameh.audit@hospital.tn', role: 'Auditor', service: 'Quality', status: 'Active' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data.subscribe((data) => {
      this.title = data['title'] ?? 'Users';
      this.roleFilter = data['role'] ?? null;
    });
  }

  get users(): AdminUserRow[] {
    if (!this.roleFilter) {
      return this.allUsers;
    }
    return this.allUsers.filter((u) => u.role === this.roleFilter);
  }

  addUser() {
    const role = this.roleFilter ?? 'Admin';
    this.router.navigate(['/authentication/register'], {
      queryParams: { role },
    });
  }
}

