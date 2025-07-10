// src/app/components/simple-pdf/simple-pdf.routes.ts

import { Routes } from '@angular/router';

export const simplePdfRoutes: Routes = [
  {
    path: '',
    data: {
      title: 'Simple PDF Templates',
      icon: 'picture_as_pdf',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        loadComponent: () => import('./simple-template-list/simple-template-list.component').then(m => m.SimpleTemplateListComponent),
        data: { title: 'Template List', icon: 'list' }
      },
      {
        path: 'new',
        loadComponent: () => import('./simple-template-builder/simple-template-builder.component').then(m => m.SimpleTemplateBuilderComponent),
        data: { title: 'Create Template', icon: 'add' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./simple-template-builder/simple-template-builder.component').then(m => m.SimpleTemplateBuilderComponent),
        data: { title: 'Edit Template', icon: 'edit' }
      },
      {
        path: 'generate/:id',
        loadComponent: () => import('./simple-pdf-generate/simple-pdf-generate.component').then(m => m.SimplePDFGenerateComponent),
        data: { title: 'Generate PDF', icon: 'picture_as_pdf' }
      }
    ]
  }
];
