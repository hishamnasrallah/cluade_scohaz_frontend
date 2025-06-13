import { Routes } from '@angular/router';
import { LayoutBuilderComponent } from './components/layout-builder/layout-builder.component';

export const BUILDER_ROUTES: Routes = [
  { path: '', component: LayoutBuilderComponent } // Main builder tabbed view
];
