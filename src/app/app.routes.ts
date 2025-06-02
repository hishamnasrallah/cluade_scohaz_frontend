// app.routes.ts - ENHANCED with proper guards and navigation
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ConfigGuard } from './guards/config.guard';

import { LoginComponent } from './components/login/login.component';
import { ConfigComponent } from './components/config/config.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';

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
  }
};
