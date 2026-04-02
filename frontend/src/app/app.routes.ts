// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { FullSuperComponent } from './pages/super-admin/full-super/full-super';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: '/landing', pathMatch: 'full' },
      { path: 'landing', component: LandingComponent },

      {
        path: 'admin/coordinator',
        component: FullComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.CoordinatorRoutes),
      },

      {
        path: 'dashboard',
        component: FullComponent,
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./pages/pages.routes').then((m) => m.PagesRoutes),
          },
          {
            path: 'admin',
            loadChildren: () =>
              import('./pages/pages.routes').then((m) => m.AdminRoutes),
          },
          {
            path: 'ui-components',
            loadChildren: () =>
              import('./pages/ui-components/ui-components.routes').then(
                (m) => m.UiComponentsRoutes,
              ),
          },
          {
            path: 'extra',
            loadChildren: () =>
              import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
          },
        ],
      },

      {
        path: 'super-admin',
        component: FullSuperComponent,
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.SuperAdminRoutes),
      },
    ],
  },

  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'authentication/error' },
];
