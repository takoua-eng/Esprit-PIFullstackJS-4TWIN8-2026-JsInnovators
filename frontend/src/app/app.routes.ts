import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { FullSuperComponent } from './pages/super-admin/full-super/full-super';
import { AuditorLayoutComponent } from './pages/auditor/auditor-layout/auditor-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { ForbiddenComponent } from './pages/forbidden/forbidden';

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
        canActivate: [authGuard, roleGuard(['superadmin'])],
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.SuperAdminRoutes),
      },

      {
        path: 'auditor',
        component: AuditorLayoutComponent,
        canActivate: [authGuard, roleGuard(['auditor'])],
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.AuditorRoutes),
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
  {
    path: '403',
    component: ForbiddenComponent,
  },

  { path: '**', redirectTo: 'authentication/error' },
];
