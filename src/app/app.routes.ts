// import { Routes } from '@angular/router';
//
// export const routes: Routes = [];

import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { ConfigComponent } from './components/config/config.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApplicationDetailComponent } from './components/application-detail/application-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'config', component: ConfigComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'app/:appName', component: ApplicationDetailComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
