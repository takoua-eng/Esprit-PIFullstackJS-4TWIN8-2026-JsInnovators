// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../core/auth.guard';
import { roleGuard } from '../core/role.guard';

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

import { AuditLogsComponent } from './super-admin/audit-logs/audit-logs';

import { UserManagementComponent } from './super-admin/user-management/user-management.component';

import { SuperAdminDashboardComponent } from './super-admin/superadmin-dashboard/superadmin-dashboard.component';
import { SuperAdminProfileComponent } from './super-admin/superadmin-profile/superadmin-profile.component';
import { AdminsComponent } from './super-admin/admins/admins';
import { Patients as SuperPatients } from './super-admin/patients/patients';
import { MedecinsComponent as SuperMedecins } from './super-admin/medecins/medecins';
import { NursesComponent as SuperNurses } from './super-admin/nurses/nurses';
import { CoordinateursComponent as SuperCoordinateurs } from './super-admin/coordinateurs/coordinateurs';
import { AuditorsComponent as SuperAuditors } from './super-admin/auditors/auditors';

// Auditor Components
import { AuditorDashboardComponent } from './auditor/auditor-dashboard/auditor-dashboard.component';
import { AuditorVerifyComponent } from './auditor/auditor-verify/auditor-verify.component';

// Patient Components (from main)
import { DashboardComponent } from './patient/dashboard/dashboard.component';
import { DossiersComponent } from './patient/dossiers/dossiers.component';
import { ProfileComponent } from './patient/profile/profile.component';
import { ParametersComponent } from './patient/parameters/parameters.component';
import { SymptomsComponent } from './patient/symptoms/symptoms.component';
import { QuestionnairesComponent } from './patient/questionnaires/questionnaires.component';
import { HistoryComponent } from './patient/history/history.component';
import { MessagesComponent } from './patient/messages/messages.component';
import { AlertsComponent } from './patient/alerts/alerts.component';

// Nurse & doctor workspaces
import { NurseDashboardComponent } from './nurse/dashboard/nurse-dashboard.component';
import { NurseAlertsComponent } from './nurse/alerts/nurse-alerts.component';
import { NurseRemindersComponent } from './nurse/reminders/nurse-reminders.component';
import { NurseMedicalFileComponent } from './nurse/medical-file/nurse-medical-file.component';
import { DoctorDashboardComponent } from './doctor/dashboard/doctor-dashboard.component';
import { DoctorAlertsComponent } from './doctor/alerts/doctor-alerts.component';
import { DoctorHistoryComponent } from './doctor/history/doctor-history.component';
import { DoctorPrescriptionsComponent } from './doctor/prescriptions/doctor-prescriptions.component';
import { ServiceComponent } from './super-admin/service/service';
import { RoleComponent } from './super-admin/role/role';
import { PermissionGuard } from '../permission.guard';

/** Roles allowed to use the sub-admin `/dashboard/admin/...` area (not patients, not coordinators). */
const staffAdminGuard = [
  authGuard,
  roleGuard(['admin', 'superadmin', 'nurse', 'doctor', 'physician', 'auditor']),
];

// ✅ ADMIN ROUTES
export const AdminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'dashboard:read' },
  },
  {
    path: 'admin/patients',
    component: Patients,
    canActivate: [PermissionGuard],
    data: { permission: 'patients:read' },
  },
  {
    path: 'admin/physicians',
    component: MedecinsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'physicians:read' },
  },
  {
    path: 'admin/nurses',
    component: NursesComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'nurses:read' },
  },
  {
    path: 'admin/coordinators',
    component: CoordinateursComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'coordinators:read' },
  },
  {
    path: 'admin/auditors',
    component: AuditorsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'auditors:read' },
  },
];

// ✅ COORDINATOR ROUTES — loaded only from `/admin/coordinator` (see `app.routes.ts`)
export const CoordinatorRoutes: Routes = [
  {
    path: '',
    component: CoordinatorDashboardComponent,
    data: { title: 'Coordinator Dashboard' },
  },
  {
    path: 'patients',
    component: CoordinatorPatientsComponent,
    data: { title: 'My Patients' },
  },
  {
    path: 'reminders',
    component: RemindersComponent,
    data: { title: 'Reminders' },
  },
];

const nurseOnlyGuard = [authGuard, roleGuard(['nurse'])];
const doctorOnlyGuard = [authGuard, roleGuard(['doctor', 'physician'])];

/** Nurse portal: `/dashboard/nurse`, `/dashboard/nurse/alerts`, … */
export const NurseRoutes: Routes = [
  {
    path: 'nurse',
    canActivate: nurseOnlyGuard,
    children: [
      {
        path: '',
        component: NurseDashboardComponent,
        data: { title: 'Nurse Dashboard' },
      },
      {
        path: 'alerts',
        component: NurseAlertsComponent,
        data: { title: 'Nurse Alerts' },
      },
      {
        path: 'reminders',
        component: NurseRemindersComponent,
        data: { title: 'Nurse Reminders' },
      },
      {
        path: 'medical-file',
        component: NurseMedicalFileComponent,
        data: { title: 'Nurse Medical File' },
      },
    ],
  },
];

/** Physician portal: `/dashboard/doctor`, `/dashboard/doctor/alerts`, … */
export const DoctorRoutes: Routes = [
  {
    path: 'doctor',
    canActivate: doctorOnlyGuard,
    children: [
      {
        path: '',
        component: DoctorDashboardComponent,
        data: { title: 'Doctor Dashboard' },
      },
      {
        path: 'alerts',
        component: DoctorAlertsComponent,
        data: { title: 'Doctor Alerts' },
      },
      {
        path: 'history',
        component: DoctorHistoryComponent,
        data: { title: 'Doctor History' },
      },
      {
        path: 'prescriptions',
        component: DoctorPrescriptionsComponent,
        data: { title: 'Doctor Prescriptions' },
      },
    ],
  },
];

const superAdminOnlyGuard = [authGuard, roleGuard(['superadmin'])];

// ✅ SUPER ADMIN ROUTES
export const SuperAdminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: SuperAdminDashboardComponent,
  },
  {
    path: 'profile',
    component: SuperAdminProfileComponent,
  },
  {
    path: 'admin-users',
    component: AdminsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'users:read' },
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'users:read' },
  },
  {
    path: 'patients',
    component: SuperPatients,
    canActivate: [PermissionGuard],
    data: { permission: 'patients:read' },
  },
  {
    path: 'medecins',
    component: SuperMedecins,
    canActivate: [PermissionGuard],
    data: { permission: 'doctors:read' },
  },
  {
    path: 'nurses',
    component: SuperNurses,
    canActivate: [PermissionGuard],
    data: { permission: 'nurses:read' },
  },
  {
    path: 'coordinateurs',
    component: SuperCoordinateurs,
    canActivate: [PermissionGuard],
    data: { permission: 'coordinators:read' },
  },
  {
    path: 'auditors',
    component: SuperAuditors,
    canActivate: [PermissionGuard],
    data: { permission: 'auditors:read' },
  },
  {
    path: 'services',
    component: ServiceComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'services:read' },
  },
  {
    path: 'role',
    component: RoleComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'users:manage' },
  },
  {
    path: 'audit-logs',
    component: AuditLogsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'audit:read' },
  },
];

const patientOnlyGuard = [authGuard, roleGuard(['patient'])];

// ✅ PATIENT ROUTES (portal — only `patient` role)
export const PatientRoutes: Routes = [
  {
    path: 'patient',
    canActivate: patientOnlyGuard,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'dossiers',
        component: DossiersComponent,
        data: { title: 'Dossiers' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'Profil' },
      },
      {
        path: 'parameters',
        component: ParametersComponent,
        data: { title: 'Mes Paramètres' },
      },
      {
        path: 'symptoms',
        component: SymptomsComponent,
        data: { title: 'Mes Symptômes' },
      },
      {
        path: 'questionnaires',
        component: QuestionnairesComponent,
        data: { title: 'Questionnaires' },
      },
      {
        path: 'history',
        component: HistoryComponent,
        data: { title: 'Historique' },
      },
      {
        path: 'messages',
        component: MessagesComponent,
        data: { title: 'Messages' },
      },
      { path: 'alerts', component: AlertsComponent, data: { title: 'Alerts' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

/** `/dashboard` lazy chunk: sub-admin, nurse/doctor portals, super-admin shell, patient portal — not coordinator (use `/admin/coordinator`). */
export const PagesRoutes: Routes = [
  ...AdminRoutes,
  ...NurseRoutes,
  ...DoctorRoutes,
  ...SuperAdminRoutes,
  ...PatientRoutes,
];

// ✅ AUDITOR ROUTES
export const AuditorRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AuditorDashboardComponent },
  {
    path: 'logs',
    component: AuditLogsComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'audit:read' },
  },
  {
    path: 'verify',
    component: AuditorVerifyComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'audit:read' },
  },
  { path: 'profile', component: SuperAdminProfileComponent },
];
