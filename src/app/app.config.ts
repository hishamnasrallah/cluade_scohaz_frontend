// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ThemeService } from './services/theme.service';

// 💡 Angular Material & CDK modules needed by the builder
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs'; // ✅ NEW: Added for <mat-tab-group>
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    ThemeService,

    // ✅ HttpClient + Interceptors
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MatFormFieldModule),

    // ✅ Animations for Material components
    provideAnimations(),

    // ✅ Register Auth Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // ✅ Material modules required by builder
    importProvidersFrom(MatIconModule),
    importProvidersFrom(MatTabsModule),   // ✅ Added for tab support
    importProvidersFrom(DragDropModule)
  ]
};
