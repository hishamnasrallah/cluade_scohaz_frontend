

// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.configService.isConfigured()) {
      this.router.navigate(['/config']);
      return false;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
