// components/settings/inquiry-management/inquiry-management.routes.ts

import { Routes } from '@angular/router';
import { InquiryManagementComponent } from './inquiry-management.component';

export const inquiryManagementRoutes: Routes = [
  {
    path: '',
    component: InquiryManagementComponent
  },
  {
    path: 'create',
    loadComponent: () => import('./components/inquiry-editor/inquiry-editor.component')
      .then(m => m.InquiryEditorComponent),
    data: { title: 'Create Inquiry' }
  },
  {
    path: 'edit/:code',
    loadComponent: () => import('./components/inquiry-editor/inquiry-editor.component')
      .then(m => m.InquiryEditorComponent),
    data: { title: 'Edit Inquiry' }
  },
  {
    path: 'preview/:code',
    loadComponent: () => import('./components/preview-viewer/preview-viewer.component')
      .then(m => m.PreviewViewerComponent),
    data: { title: 'Preview Inquiry' }
  }
];
