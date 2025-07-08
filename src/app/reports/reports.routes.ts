// src/app/reports/reports.routes.ts

import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'Statistics',
      icon: 'assessment',
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
        loadComponent: () => import('./components/report-list/report-list.component').then(m => m.ReportListComponent),
        data: { title: 'Report List', icon: 'list' }
      },
      {
        path: 'create',
        loadComponent: () => import('./components/report-editor/report-editor.component').then(m => m.ReportEditorComponent),
        data: { title: 'Create Report', icon: 'add', mode: 'create' }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./components/report-editor/report-editor.component').then(m => m.ReportEditorComponent),
        data: { title: 'Edit Report', icon: 'edit', mode: 'edit' }
      },
      {
        path: ':id/view',
        loadComponent: () => import('./components/report-viewer/report-viewer.component').then(m => m.ReportViewerComponent),
        data: { title: 'View Report', icon: 'visibility' }
      },
      {
        path: ':id/execute',
        loadComponent: () => import('./components/report-execution/report-execution.component').then(m => m.ReportExecutionComponent),
        data: { title: 'Execute Report', icon: 'play_arrow' }
      },
      {
        path: 'templates',
        loadComponent: () => import('./components/report-templates/report-templates.component').then(m => m.ReportTemplatesComponent),
        data: { title: 'Report Templates', icon: 'content_copy' }
      },
      {
        path: 'schedules',
        loadComponent: () => import('./components/report-schedules/report-schedules.component').then(m => m.ReportSchedulesComponent),
        data: { title: 'Scheduled Reports', icon: 'schedule' }
      }
    ]
  }
];

// Add this to your main app.routes.ts file:
/*
{
  path: 'reports',
  canActivate: [AuthGuard],
  loadChildren: () => import('./reports/reports.routes').then(m => m.REPORT_ROUTES)
}
*/
