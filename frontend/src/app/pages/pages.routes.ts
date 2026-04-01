import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';

// Import des composants admin spécifiques
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { Patients } from './admin/patients/patients';
import { MedecinsComponent } from './admin/medecins/medecins';
import { CoordinateursComponent } from './admin/coordinateurs/coordinateurs';
import { NursesComponent } from './admin/nurses/nurses';
import { AuditorsComponent } from './admin/auditors/auditors';

// Import des composants patient spécifiques
import { DashboardComponent } from './patient/dashboard/dashboard.component';
import { DossiersComponent } from './patient/dossiers/dossiers.component';
import { ProfileComponent } from './patient/profile/profile.component';
import { ParametersComponent } from './patient/parameters/parameters.component';
import { SymptomsComponent } from './patient/symptoms/symptoms.component';
import { QuestionnairesComponent } from './patient/questionnaires/questionnaires.component';
import { HistoryComponent } from './patient/history/history.component';
import { MessagesComponent } from './patient/messages/messages.component';
import { AlertsComponent } from './patient/alerts/alerts.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
      urls: [
        { title: 'Dashboard', url: '/dashboards/dashboard1' },
        { title: 'Starter Page' },
      ],
    },
  },

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
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // redirection si juste /patient
  ],
},
];
