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
import { CoordinatorDashboardComponent } from './coordinator/coordinator-dashboard/coordinator-dashboard.component';
import { RemindersComponent } from './coordinator/reminders/reminders';
import { CoordinatorPatientsComponent } from './coordinator/coordinator-patients/coordinator-patients';


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
