// app.routes.ts - ENHANCED with CRUD Permissions Module
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ConfigGuard } from './guards/config.guard';

import { LoginComponent } from './components/login/login.component';
import { ConfigComponent } from './components/config/config.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { ApplicationsInboxComponent } from './components/applications-inbox/applications-inbox.component';
import { ThemeCreatorComponent } from './components/theme-creator/theme-creator.component';
import {LogoComponent} from './components/logo/logo.component';
import {simplePdfRoutes} from './components/simple-pdf/simple-pdf.routes';

export const routes: Routes = [
  // Default route - redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Public routes (no authentication required)
  {
    path: 'config',
    component: ConfigComponent,
    data: {
      title: 'Configuration',
      description: 'Configure your backend connection',
      icon: 'settings',
      isPublic: true
    }
  },
  {
    path: 'theme-creator',
    component: ThemeCreatorComponent
  },
  {
    path: 'logo-info',
    component: LogoComponent
  },
  // Authentication required routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [ConfigGuard],
    data: {
      title: 'Sign In',
      description: 'Access your account',
      icon: 'login',
      isPublic: true
    }
  },

  // Protected routes (authentication + configuration required)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Dashboard',
      description: 'Application overview and management',
      icon: 'dashboard',
      isHomePage: true,
      requiresAuth: true
    }
  },

  {
    path: 'applications',
    component: ApplicationsInboxComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Applications',
      description: 'Manage your applications and inbox',
      icon: 'apps',
      requiresAuth: true
    }
  },

  {
    path: 'inbox',
    redirectTo: '/applications',
    pathMatch: 'full'
  },
  {
    path: 'inquiry',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/inquiry/inquiry-dashboard/inquiry-dashboard.component')
          .then(m => m.InquiryDashboardComponent)
      },
      {
        path: ':code',
        loadComponent: () => import('./components/inquiry/inquiry-executor/inquiry-executor.component')
          .then(m => m.InquiryExecutorComponent)
      }
    ]
  },

  // Settings Module Routes
  {
    path: 'settings',
    canActivate: [AuthGuard],
    data: {
      title: 'Settings',
      description: 'Platform administration and configuration',
      icon: 'settings',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      // {
      //   path: 'builder',
      //   loadChildren: () =>
      //     import('./builder/builder.routes').then((m) => m.BUILDER_ROUTES)
      // },
      {
        path: 'theme-creator',
        loadComponent: () => import('./components/theme-creator/index').then(m => m.ThemeCreatorComponent),
        data: { title: 'Theme Creator', icon: 'theme' }
      },
      {
        path: 'pdf-templates',
        loadChildren: () =>
          import('./components/template-builder/template-builder.routes')
            .then(m => m.templateBuilderRoutes),
        data: { title: 'PDF Templates', icon: 'description' }
      },
      {
        path: 'simple-pdf',
        loadChildren: () =>
          import('./components/simple-pdf/simple-pdf.routes').then(m => m.simplePdfRoutes),
        data: { title: 'PDF Templates', icon: 'dashboard' }

      },

      {
        path: 'logo-info',
        loadComponent: () => import('./components/logo/logo.component').then(m => m.LogoComponent),
        data: { title: 'Logo', icon: 'theme' }
      },
      {
        path: 'overview',
        loadComponent: () => import('./components/settings/settings-overview/settings-overview.component').then(m => m.SettingsOverviewComponent),
        data: { title: 'Settings Overview', icon: 'dashboard' }
      },
      {
        path: 'lookups',
        loadComponent: () => import('./components/settings/lookups-management/lookups-management.component').then(m => m.LookupsManagementComponent),
        data: { title: 'Lookups Management', icon: 'list' }
      },
      {
        path: 'field-types',
        loadComponent: () => import('./components/settings/field-types-management/field-types-management.component').then(m => m.FieldTypesManagementComponent),
        data: { title: 'Field Types', icon: 'input' }
      },
      {
        path: 'fields',
        loadComponent: () => import('./components/settings/fields-management/fields-management.component').then(m => m.FieldsManagementComponent),
        data: { title: 'Fields Management', icon: 'dynamic_form' }
      },
      {
        path: 'versions',
        loadComponent: () => import('./components/settings/version-control/version-control.component').then(m => m.VersionControlComponent),
        data: { title: 'Version Control', icon: 'history' }
      },
      {
        path: 'permissions',
        loadComponent: () => import('./components/settings/crud-permissions-management/crud-permissions-management.component').then(m => m.CrudPermissionsManagementComponent),
        data: { title: 'CRUD Permissions', icon: 'security' }
      },
      {
        path: 'inquiry-management',
        loadChildren: () => import('./components/settings/inquiry-management/inquiry-management.routes')
          .then(m => m.inquiryManagementRoutes),
        data: { title: 'Inquiry Management', icon: 'query_stats' }
      },
      {
        path: 'users',
        loadComponent: () => import('./components/settings/user-management/user-management.component').then(m => m.UserManagementComponent),
        data: { title: 'User Management', icon: 'people' }
      },
      {
        path: 'translations',
        loadComponent: () => import('./components/settings/translation-management/translation-management.component').then(m => m.TranslationManagementComponent),
        data: { title: 'Translation Management', icon: 'translate' }
      },
      {
        path: 'preferences',
        loadComponent: () => import('./components/settings/user-preferences/user-preferences.component').then(m => m.UserPreferencesComponent),
        data: { title: 'User Preferences', icon: 'person' }
      },
      {
        path: 'licenses',
        loadComponent: () => import('./components/settings/licenses-management/licenses-management.component').then(m => m.LicensesManagementComponent),
        data: { title: 'Licenses & Subscriptions', icon: 'receipt' }
      },
      {
        path: 'system',
        loadComponent: () => import('./components/settings/system-settings/system-settings.component').then(m => m.SystemSettingsComponent),
        data: { title: 'System Settings', icon: 'tune' }
      }
    ]
  },

  {
    path: 'app/:appName',
    component: ApplicationDetailComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Application Details',
      description: 'Manage application resources and data',
      icon: 'api',
      requiresAuth: true
    }
  },

  // Reports Module
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () => import('./reports/reports.routes').then(m => m.REPORT_ROUTES),
    data: {
      title: 'Statistics',
      description: 'Dynamic reporting and analytics',
      icon: 'assessment',
      requiresAuth: true
    }
  },
  // {
  //   path: 'pdf-templates',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./components/template-builder/template-builder.routes').then(m => m.templateBuilderRoutes),
  //   data: {
  //     title: 'Statidsadsastics',
  //     description: 'Dynamic reportisdng and analytics',
  //     icon: 'assessment',
  //     requiresAuth: true
  //   }
  // },

  // Catch-all route - redirect to dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

// Route configuration for navigation service
export const ROUTE_CONFIG = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your application overview',
    icon: 'dashboard',
    isHomePage: true
  },
  '/applications': {
    title: 'Applications',
    description: 'Manage applications and cases',
    icon: 'apps',
    requiresAuth: true
  },
  '/config': {
    title: 'Configuration',
    description: 'System settings',
    icon: 'settings',
    isPublic: true
  },
  '/login': {
    title: 'Sign In',
    description: 'Access your account',
    icon: 'login',
    isPublic: true
  },
  '/settings': {
    title: 'Settings',
    description: 'Platform administration',
    icon: 'settings',
    requiresAuth: true
  }
};
