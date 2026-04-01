// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';

// Admin Components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { Patients as AdminPatients } from './admin/patients/patients';
import { MedecinsComponent as AdminMedecins } from './admin/medecins/medecins';
import { NursesComponent as AdminNurses } from './admin/nurses/nurses';
import { CoordinateursComponent as AdminCoordinateurs } from './admin/coordinateurs/coordinateurs';
import { AuditorsComponent as AdminAuditors } from './admin/auditors/auditors';

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
  { path: '', component: AdminDashboardComponent }, // /admin
  { path: 'profile', component: AdminProfileComponent }, // /admin/profile
  { path: 'patients', component: AdminPatients }, // /admin/patients
  { path: 'medecins', component: AdminMedecins }, // /admin/medecins
  { path: 'nurses', component: AdminNurses }, // /admin/nurses
  { path: 'coordinateurs', component: AdminCoordinateurs }, // /admin/coordinateurs
  { path: 'auditors', component: AdminAuditors }, // /admin/auditors
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
