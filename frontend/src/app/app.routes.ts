// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { FullSuperComponent } from './pages/super-admin/full-super/full-super';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/landing',
        pathMatch: 'full',
      },

      // Landing page
      {
        path: 'landing',
        component: LandingComponent,
      },

      // ADMIN
      {
        path: 'admin',
        component: FullComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.AdminRoutes),
      },

      // SUPER ADMIN
      {
        path: 'super-admin',
        component: FullSuperComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.SuperAdminRoutes),
      },

      // Dashboard (ancienne config)
      {
        path: 'dashboard',
        component: FullComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },

      // UI Components
      {
        path: 'ui-components',
        component: FullComponent,
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },

      // Extra pages
      {
        path: 'extra',
        component: FullComponent,
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
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

  // Error fallback
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];