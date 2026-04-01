// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { FullSuperComponent } from './pages/super-admin/full-super/full-super';
import { LandingComponent } from './pages/landing/landing.component';
import { CoordinatorDashboardComponent } from './pages/coordinator/coordinator-dashboard/coordinator-dashboard.component';


export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: '/landing', pathMatch: 'full' },
      { path: 'landing', component: LandingComponent },

      // Admin Coordinator : composant seul, indépendant
      {
        path: 'admin/coordinator',
        component: CoordinatorDashboardComponent,
      },

      // Dashboard principal pour utilisateurs + sous-admin
      {
        path: 'dashboard',
        component: FullComponent,
        children: [
          // Dashboard utilisateur normal
          {
            path: '',
            loadChildren: () =>
              import('./pages/pages.routes').then((m) => m.PagesRoutes),
          },

          // Admin sous dashboard
          {
            path: 'admin',
            loadChildren: () =>
              import('./pages/pages.routes').then((m) => m.AdminRoutes),
          },

          // UI Components
          {
            path: 'ui-components',
            loadChildren: () =>
              import('./pages/ui-components/ui-components.routes').then(
                (m) => m.UiComponentsRoutes
              ),
          },

          // Extra pages
          {
            path: 'extra',
            loadChildren: () =>
              import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
          },
        ],
      },

      // Super Admin séparé
      {
        path: 'super-admin',
        component: FullSuperComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.SuperAdminRoutes),
      },
    ],
  },

  // Authentication
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'authentication/error' },
];