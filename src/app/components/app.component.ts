// components/app.component.ts - ENHANCED Professional Layout
import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet, NavigationEnd} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import {MatToolbar} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgIf, NgClass, TitleCasePipe} from "@angular/common";
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-layout">
      <!-- Enhanced Professional Header -->
      <header class="app-header" [ngClass]="{'header-transparent': isHomePage}">
        <div class="header-content">
          <!-- Logo and Brand -->
          <div class="brand-section">
            <div class="logo-container" (click)="goHome()">
              <div class="logo-icon">
                <mat-icon>dashboard</mat-icon>
              </div>
              <div class="brand-text">
                <h1 class="brand-title">LowCode Pro</h1>
                <span class="brand-subtitle">Enterprise Platform</span>
              </div>
            </div>
          </div>

          <!-- Navigation Breadcrumbs -->
          <div class="navigation-section" *ngIf="!isHomePage">
            <nav class="breadcrumb-nav">
              <a class="breadcrumb-item" (click)="goHome()">
                <mat-icon>home</mat-icon>
                Home
              </a>
              <span class="breadcrumb-separator">
                <mat-icon>chevron_right</mat-icon>
              </span>
              <span class="breadcrumb-item active">{{ currentPageTitle }}</span>
            </nav>
          </div>

          <!-- Action Section -->
          <div class="actions-section">
            <!-- Configuration Button -->
            <button mat-icon-button
                    *ngIf="showConfigButton"
                    (click)="goToConfig()"
                    class="action-btn config-btn"
                    matTooltip="System Configuration"
                    matTooltipPosition="below">
              <mat-icon>settings</mat-icon>
            </button>

            <!-- User Menu -->
            <div class="user-menu" *ngIf="isAuthenticated">
              <button mat-icon-button
                      [matMenuTriggerFor]="userMenuRef"
                      class="user-menu-trigger"
                      matTooltip="User Menu"
                      matTooltipPosition="below">
                <div class="user-avatar">
                  <mat-icon>account_circle</mat-icon>
                </div>
              </button>

              <mat-menu #userMenuRef="matMenu" class="user-dropdown">
                <button mat-menu-item (click)="goToConfig()">
                  <mat-icon>settings</mat-icon>
                  <span>Configuration</span>
                </button>
                <button mat-menu-item (click)="goToDashboard()">
                  <mat-icon>dashboard</mat-icon>
                  <span>Dashboard</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()" class="logout-item">
                  <mat-icon>logout</mat-icon>
                  <span>Sign Out</span>
                </button>
              </mat-menu>
            </div>

            <!-- Login Button for non-authenticated users -->
            <button mat-button
                    *ngIf="!isAuthenticated && showConfigButton"
                    (click)="goToLogin()"
                    class="login-btn">
              <mat-icon>login</mat-icon>
              Sign In
            </button>
          </div>
        </div>

        <!-- Progress Bar for Loading States -->
        <div class="progress-bar" [ngClass]="{'active': isLoading}"></div>
      </header>

      <!-- Main Content Area -->
      <main class="app-main" [ngClass]="{'main-home': isHomePage}">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Professional Footer -->
      <footer class="app-footer" *ngIf="isHomePage">
        <div class="footer-content">
          <div class="footer-section">
            <h3>LowCode Pro</h3>
            <p>Enterprise-grade low-code platform for rapid application development.</p>
          </div>
          <div class="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#" (click)="$event.preventDefault()">Applications</a></li>
              <li><a href="#" (click)="$event.preventDefault()">Resources</a></li>
              <li><a href="#" (click)="$event.preventDefault()">API Management</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#" (click)="$event.preventDefault()">Documentation</a></li>
              <li><a href="#" (click)="$event.preventDefault()">Help Center</a></li>
              <li><a href="#" (click)="$event.preventDefault()">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 LowCode Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  imports: [
    // MatToolbar,
    MatIconModule,
    RouterOutlet,
    MatButton,
    MatIconButton,
    NgIf,
    NgClass,
    // TitleCasePipe,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDivider
  ],
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    /* Professional Header */
    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

      &.header-transparent {
        background: rgba(255, 255, 255, 0.8);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 72px;
    }

    /* Brand Section */
    .brand-section {
      flex-shrink: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 8px 12px;
      border-radius: 12px;

      &:hover {
        background: rgba(102, 126, 234, 0.08);
        transform: translateY(-1px);
      }
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.39);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: #334155;
      margin: 0;
      line-height: 1.2;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Navigation Section */
    .navigation-section {
      flex: 1;
      max-width: 600px;
      margin: 0 32px;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64748b;
        text-decoration: none;
        transition: all 0.2s ease;
        padding: 6px 12px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;

        &:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.08);
        }

        &.active {
          color: #334155;
          font-weight: 600;
          background: rgba(102, 126, 234, 0.12);
        }

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .breadcrumb-separator {
        color: #cbd5e1;
        display: flex;
        align-items: center;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    /* Actions Section */
    .actions-section {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(248, 250, 252, 0.8);
      border: 1px solid rgba(226, 232, 240, 0.8);
      color: #64748b;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.3);
        color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .user-menu-trigger {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }

      .user-avatar mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .login-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.39);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      }

      mat-icon {
        margin-right: 8px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* Progress Bar */
    .progress-bar {
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.active {
        transform: translateX(0);
        animation: progressSlide 2s ease-in-out infinite;
      }
    }

    @keyframes progressSlide {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0); }
      100% { transform: translateX(100%); }
    }

    /* Main Content */
    .app-main {
      flex: 1;
      position: relative;

      &.main-home {
        background: transparent;
      }
    }

    .content-wrapper {
      min-height: calc(100vh - 72px);
    }

    /* Professional Footer */
    .app-footer {
      background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
      color: #e2e8f0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px 24px 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
    }

    .footer-section {
      h3, h4 {
        color: white;
        margin-bottom: 16px;
        font-weight: 600;
      }

      h3 {
        font-size: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      h4 {
        font-size: 16px;
      }

      p {
        color: #94a3b8;
        line-height: 1.6;
        margin: 0;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;

          a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.2s ease;

            &:hover {
              color: #667eea;
            }
          }
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(71, 85, 105, 0.3);
      padding: 24px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }

    /* User Dropdown Menu */
    ::ng-deep .user-dropdown {
      margin-top: 8px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(226, 232, 240, 0.8);
      backdrop-filter: blur(10px);

      .mat-mdc-menu-content {
        padding: 8px;
      }

      .mat-mdc-menu-item {
        border-radius: 8px;
        margin-bottom: 4px;
        transition: all 0.2s ease;
        font-weight: 500;

        &:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
        }

        &.logout-item:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
        }

        mat-icon {
          margin-right: 12px;
          color: inherit;
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .navigation-section {
        max-width: 400px;
        margin: 0 16px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 16px;
      }

      .navigation-section {
        display: none;
      }

      .brand-title {
        font-size: 18px;
      }

      .brand-subtitle {
        font-size: 10px;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 32px 16px 16px;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        height: 64px;
        padding: 0 12px;
      }

      .logo-icon {
        width: 40px;
        height: 40px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .brand-title {
        font-size: 16px;
      }

      .actions-section {
        gap: 8px;
      }

      .action-btn,
      .user-menu-trigger {
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  showConfigButton = false;
  isLoading = false;
  isHomePage = false;
  currentPageTitle = '';
  title = 'LowCode Pro';

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.showConfigButton = isAuth || this.configService.isConfigured();
      }
    );

    // Track route changes for breadcrumbs and page detection
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentPage(event.url);
    });

    // Initial routing logic
    if (!this.configService.isConfigured()) {
      this.router.navigate(['/config']);
    } else if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  private updateCurrentPage(url: string): void {
    this.isHomePage = url === '/' || url === '/dashboard';

    if (url.startsWith('/app/')) {
      const appName = url.split('/')[2];
      this.currentPageTitle = `${appName} Application`;
    } else if (url === '/config') {
      this.currentPageTitle = 'Configuration';
    } else if (url === '/login') {
      this.currentPageTitle = 'Sign In';
    } else if (url === '/dashboard' || url === '/') {
      this.currentPageTitle = 'Dashboard';
    } else {
      this.currentPageTitle = 'Platform';
    }
  }

  logout(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoading = false;
    }, 500);
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
