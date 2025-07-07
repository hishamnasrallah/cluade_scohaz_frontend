// src/app/components/template-builder/template-builder.routes.ts

import { Routes } from '@angular/router';
import { PDFTemplateListComponent } from './pdf-template-list/pdf-template-list.component';
import { TemplateBuilderComponent } from './template-builder.component';

export const templateBuilderRoutes: Routes = [
  {
    path: '',
    component: PDFTemplateListComponent,
    data: { title: 'PDF Templates' }
  },
  {
    path: 'new',
    component: TemplateBuilderComponent,
    data: { title: 'Create PDF Template' }
  },
  {
    path: 'edit/:id',
    component: TemplateBuilderComponent,
    data: { title: 'Edit PDF Template' }
  },
  {
    path: 'generate/:id',
    loadComponent: () => import('./pdf-generate/pdf-generate.component').then(m => m.PDFGenerateComponent),
    data: { title: 'Generate PDF' }
  }
];

// Add this to your main app.routes.ts in the settings section:
/*
{
  path: 'settings/pdf-templates',
  loadChildren: () => import('./components/template-builder/template-builder.routes').then(m => m.templateBuilderRoutes)
}
*/
