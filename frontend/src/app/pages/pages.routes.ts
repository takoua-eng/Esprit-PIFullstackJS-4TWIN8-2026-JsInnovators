// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';

// Admin Components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

import { AdminProfileComponent } from './admin-profile/admin-profile.component';

import { Patients } from './admin/patients/patients';
import { MedecinsComponent } from './admin/medecins/medecins';
import { CoordinateursComponent } from './admin/coordinateurs/coordinateurs';
import { NursesComponent } from './admin/nurses/nurses';
import { AuditorsComponent } from './admin/auditors/auditors';
import { CoordinatorDashboardComponent } from './coordinator/coordinator-dashboard/coordinator-dashboard.component';
import { RemindersComponent } from './coordinator/reminders/reminders';
import { CoordinatorPatientsComponent } from './coordinator/coordinator-patients/coordinator-patients';

// Super Admin Components
import { SuperAdminDashboardComponent } from './super-admin/superadmin-dashboard/superadmin-dashboard.component';
import { SuperAdminProfileComponent } from './super-admin/superadmin-profile/superadmin-profile.component';
import { AdminUsersComponent } from './super-admin/admin-users/admin-users';
import { Patients as SuperPatients } from './super-admin/patients/patients';
import { MedecinsComponent as SuperMedecins } from './super-admin/medecins/medecins';
import { NursesComponent as SuperNurses } from './super-admin/nurses/nurses';
import { CoordinateursComponent as SuperCoordinateurs } from './super-admin/coordinateurs/coordinateurs';
import { AuditorsComponent as SuperAuditors } from './super-admin/auditors/auditors';

// ✅ ADMIN ROUTES - بدون 'admin' في البداية
export const AdminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    data: {
      title: 'Admin Dashboard',
    },
  },
  {
    path: 'admin/patients',
    component: Patients,
    data: {
      title: 'Patients',
      role: 'Patient',
    },
  },
  {
    path: 'admin/physicians',
    component: MedecinsComponent,
    data: {
      title: 'Physicians',
      role: 'Physician',
    },
  },
  {
    path: 'admin/nurses',
    component: NursesComponent,
    data: {
      title: 'Nurses',
      role: 'Nurse',
    },
  },
  {
    path: 'admin/coordinators',
    component: CoordinateursComponent,
    data: {
      title: 'Coordinators',
      role: 'Coordinator',
    },
  },
  {
    path: 'admin/auditors',
    component: AuditorsComponent,
    data: {
      title: 'Auditors',
      role: 'Auditor',
    },
  },
  {
    path: 'profile',
    component: AdminProfileComponent,
    data: {
      title: 'Profile',
    },
  },

  {
    path: 'coordinator',
    component: CoordinatorDashboardComponent,
    data: {
      title: 'Coordinator Dashboard',
    },
  },

  {
    path: 'coordinator/reminders',
    component: RemindersComponent,
    data: { title: 'Reminders' },
  },

  {
    path: 'coordinator/patients',
    component: CoordinatorPatientsComponent,
    data: { title: 'My Patients' },
  },
];

// ✅ SUPER ADMIN ROUTES - بدون 'super-admin' في البداية
export const SuperAdminRoutes: Routes = [
  { path: '', component: SuperAdminDashboardComponent },
  { path: 'dashboard', component: SuperAdminDashboardComponent }, // /super-admin
  { path: 'profile', component: SuperAdminProfileComponent }, // /super-admin/profile
  { path: 'patients', component: SuperPatients }, // /super-admin/patients
  { path: 'medecins', component: SuperMedecins }, // /super-admin/medecins
  { path: 'nurses', component: SuperNurses }, // /super-admin/nurses
  { path: 'coordinateurs', component: SuperCoordinateurs }, // /super-admin/coordinateurs
  { path: 'auditors', component: SuperAuditors }, // /super-admin/auditors
  { path: 'admin-users', component: AdminUsersComponent }, // /super-admin/admin-users
];

// ⚠️ احتفظ بـ PagesRoutes القديم للتوافق (اختياري)
export const PagesRoutes: Routes = [...AdminRoutes, ...SuperAdminRoutes];
