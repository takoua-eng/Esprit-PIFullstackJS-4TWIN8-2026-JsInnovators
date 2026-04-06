import { Routes } from '@angular/router';

/**
 * Enfants de `admin/templates` (voir `app.routes.ts`).
 * Garde appliquée sur le parent : `staffAdminGuard`.
 */
export const ADMIN_TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-questionnaire-list/admin-questionnaire-list').then(
        (m) => m.AdminQuestionnaireListComponent,
      ),
    data: { title: 'Questionnaire templates' },
  },
  {
    path: 'create',
    loadComponent: () =>
      import('../../components/template-builder/template-builder').then(
        (m) => m.TemplateBuilderComponent,
      ),
    data: { title: 'Create questionnaire template', emptyTemplate: true },
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../../components/template-builder/template-builder').then(
        (m) => m.TemplateBuilderComponent,
      ),
    data: { title: 'Edit questionnaire template' },
  },
];
