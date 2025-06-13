// src/app/builder/builder.routes.ts
import { Routes } from '@angular/router';
import { LayoutBuilderComponent } from './components/layout-builder/layout-builder.component';

export const BUILDER_ROUTES: Routes = [
  {
    path: '',
    component: LayoutBuilderComponent,
    data: {
      title: 'Form Builder',
      description: 'Create and design forms with drag and drop',
      icon: 'construction',
      breadcrumb: 'Builder'
    }
  },

  // Placeholder routes for future features
  // These will just redirect to the main builder for now
  {
    path: 'templates',
    redirectTo: '',
    pathMatch: 'full',
    data: {
      title: 'Template Library',
      description: 'Coming soon: Pre-built form templates',
      icon: 'library_books',
      breadcrumb: 'Templates'
    }
  },

  {
    path: 'preview/:id',
    component: LayoutBuilderComponent, // Use main component for now
    data: {
      title: 'Form Preview',
      description: 'Preview your form',
      icon: 'preview',
      breadcrumb: 'Preview',
      mode: 'preview'
    }
  },

  {
    path: 'edit/:id',
    component: LayoutBuilderComponent,
    data: {
      title: 'Edit Form',
      description: 'Edit existing form',
      icon: 'edit',
      breadcrumb: 'Edit',
      mode: 'edit'
    }
  },

  {
    path: 'themes',
    redirectTo: '',
    pathMatch: 'full',
    data: {
      title: 'Theme Editor',
      description: 'Coming soon: Customize form themes',
      icon: 'palette',
      breadcrumb: 'Themes'
    }
  },

  {
    path: 'export/:id',
    redirectTo: '',
    pathMatch: 'full',
    data: {
      title: 'Export Form',
      description: 'Coming soon: Export form as Angular component',
      icon: 'download',
      breadcrumb: 'Export'
    }
  },

  // Redirect any unknown paths back to builder
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

// Export route configuration for navigation
export const BUILDER_ROUTE_CONFIG = {
  main: {
    path: '/settings/builder',
    title: 'Form Builder',
    icon: 'construction',
    description: 'Visual form designer'
  },
  templates: {
    path: '/settings/builder/templates',
    title: 'Templates',
    icon: 'library_books',
    description: 'Pre-built templates',
    comingSoon: true
  },
  themes: {
    path: '/settings/builder/themes',
    title: 'Themes',
    icon: 'palette',
    description: 'Theme customization',
    comingSoon: true
  },
  export: {
    path: '/settings/builder/export',
    title: 'Export',
    icon: 'download',
    description: 'Export forms',
    comingSoon: true
  }
};

// Helper function to check if a feature is available
export function isFeatureAvailable(feature: string): boolean {
  const availableFeatures = ['main', 'preview', 'edit'];
  return availableFeatures.includes(feature);
}
