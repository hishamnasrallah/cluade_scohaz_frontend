// guards/config.guard.ts - ENHANCED with better user experience
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // If accessing login but not configured, redirect to config
    if (!this.configService.isConfigured()) {
      this.snackBar.open(
        '⚙️ Please configure your backend connection first',
        'Configure Now',
        {
          duration: 5000,
          panelClass: ['info-snackbar'],
          action: 'Configure Now'
        }
      ).onAction().subscribe(() => {
        this.router.navigate(['/config']);
      });

      this.router.navigate(['/config']);
      return false;
    }

    return true;
  }
}
