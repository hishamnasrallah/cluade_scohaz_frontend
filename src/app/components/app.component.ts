
// components/app.component.ts
import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import {MatToolbar} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span>Low-Code Platform</span>
      <span class="spacer"></span>
      <button mat-button (click)="goToConfig()" *ngIf="showConfigButton">
        <mat-icon>settings</mat-icon>
        Config
      </button>
      <button mat-button (click)="logout()" *ngIf="isAuthenticated">
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  imports: [
    MatToolbar,
    MatIconModule,
    RouterOutlet,
    MatButton,
    NgIf
  ],
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  showConfigButton = false;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.showConfigButton = isAuth || this.configService.isConfigured();
      }
    );

    if (!this.configService.isConfigured()) {
      this.router.navigate(['/config']);
    } else if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }
}
