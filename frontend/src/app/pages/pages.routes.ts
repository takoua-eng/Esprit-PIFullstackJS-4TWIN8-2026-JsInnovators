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

// Patient Components
import { DashboardComponent } from './patient/dashboard/dashboard.component';
import { DossiersComponent } from './patient/dossiers/dossiers.component';
import { ProfileComponent } from './patient/profile/profile.component';
import { ParametersComponent } from './patient/parameters/parameters.component';
import { SymptomsComponent } from './patient/symptoms/symptoms.component';
import { QuestionnairesComponent } from './patient/questionnaires/questionnaires.component';
import { HistoryComponent } from './patient/history/history.component';
import { MessagesComponent } from './patient/messages/messages.component';
import { AlertsComponent } from './patient/alerts/alerts.component';

// ✅ ADMIN ROUTES
export const AdminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    data: { title: 'Admin Dashboard' },
  },
  {
    path: 'admin/patients',
    component: Patients,
    data: { title: 'Patients', role: 'Patient' },
  },
  {
    path: 'admin/physicians',
    component: MedecinsComponent,
    data: { title: 'Physicians', role: 'Physician' },
  },
  {
    path: 'admin/nurses',
    component: NursesComponent,
    data: { title: 'Nurses', role: 'Nurse' },
  },
  {
    path: 'admin/coordinators',
    component: CoordinateursComponent,
    data: { title: 'Coordinators', role: 'Coordinator' },
  },
  {
    path: 'admin/auditors',
    component: AuditorsComponent,
    data: { title: 'Auditors', role: 'Auditor' },
  },
  {
    path: 'profile',
    component: AdminProfileComponent,
    data: { title: 'Profile' },
  },
];

// ✅ COORDINATOR ROUTES
export const CoordinatorRoutes: Routes = [
  { path: '', component: CoordinatorDashboardComponent, data: { title: 'Coordinator Dashboard' } },
  { path: 'patients', component: CoordinatorPatientsComponent, data: { title: 'My Patients' } },
  { path: 'reminders', component: RemindersComponent, data: { title: 'Reminders' } },
];

// ✅ SUPER ADMIN ROUTES
export const SuperAdminRoutes: Routes = [
  { path: '', component: SuperAdminDashboardComponent },
  { path: 'dashboard', component: SuperAdminDashboardComponent },
  { path: 'profile', component: SuperAdminProfileComponent },
  { path: 'patients', component: SuperPatients },
  { path: 'medecins', component: SuperMedecins },
  { path: 'nurses', component: SuperNurses },
  { path: 'coordinateurs', component: SuperCoordinateurs },
  { path: 'auditors', component: SuperAuditors },
  { path: 'admin-users', component: AdminUsersComponent },
];

// ✅ PATIENT ROUTES
export const PatientRoutes: Routes = [
  {
    path: 'patient',
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'dossiers', component: DossiersComponent, data: { title: 'Dossiers' } },
      { path: 'profile', component: ProfileComponent, data: { title: 'Profil' } },
      { path: 'parameters', component: ParametersComponent, data: { title: 'Mes Paramètres' } },
      { path: 'symptoms', component: SymptomsComponent, data: { title: 'Mes Symptômes' } },
      { path: 'questionnaires', component: QuestionnairesComponent, data: { title: 'Questionnaires' } },
      { path: 'history', component: HistoryComponent, data: { title: 'Historique' } },
      { path: 'messages', component: MessagesComponent, data: { title: 'Messages' } },
      { path: 'alerts', component: AlertsComponent, data: { title: 'Alerts' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

// ⚠️ PagesRoutes complet (optionnel)
export const PagesRoutes: Routes = [
  ...AdminRoutes,
  ...CoordinatorRoutes,
  ...SuperAdminRoutes,
  ...PatientRoutes,
];