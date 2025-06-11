// app.routes.ts - ENHANCED with User Management route
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ConfigGuard } from './guards/config.guard';

import { LoginComponent } from './components/login/login.component';
import { ConfigComponent } from './components/config/config.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';
import { ApplicationsInboxComponent } from './components/applications-inbox/applications-inbox.component';

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

  // User Management route - for now redirects to dashboard
  // TODO: Create UserManagementComponent when needed
  {
    path: 'user-management',
    redirectTo: '/dashboard',
    pathMatch: 'full',
    data: {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: 'people',
      requiresAuth: true
    }
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
  '/user-management': {
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: 'people',
    requiresAuth: true
  }
};
