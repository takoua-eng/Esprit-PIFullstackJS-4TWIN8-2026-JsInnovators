import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';

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
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Admin' },
      ],
    },
  },
  {
    path: 'admin/patients',
    component: AdminUsersComponent,
    data: {
      title: 'Patients',
      role: 'Patient',
    },
  },
  {
    path: 'admin/physicians',
    component: AdminUsersComponent,
    data: {
      title: 'Physicians',
      role: 'Physician',
    },
  },
  {
    path: 'admin/nurses',
    component: AdminUsersComponent,
    data: {
      title: 'Nurses',
      role: 'Nurse',
    },
  },
  {
    path: 'admin/coordinators',
    component: AdminUsersComponent,
    data: {
      title: 'Coordinators',
      role: 'Coordinator',
    },
  },
  {
    path: 'admin/auditors',
    component: AdminUsersComponent,
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
];
