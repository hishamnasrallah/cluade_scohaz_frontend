// dashboard.component.ts - ENHANCED Professional Home Page
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import {ConfigService} from '../../services/config.service';

interface ApiResponse {
  applications: {
    api_version: string;
    schema_generated_on: string;
    total_applications: number;
    total_urls: number;
    applications: {
      [key: string]: Array<{
        path: string;
        name: string;
        methods: string[];
        parameters: string[];
        keys: Array<{
          name: string;
          type: string;
          required: boolean;
          read_only: boolean;
          default: any;
          help_text: string;
          choices?: Array<{
            value: string;
            label: string;
          }>;
        }>;
        other_info: string;
        query_params: any[];
        permissions: string[];
        methods_info: {
          [method: string]: {
            description: string;
            status_codes: Array<{
              code: number;
              description: string;
            }>;
            request_example: any;
            response_example: any;
          };
        };
        available_actions: string[];
      }>;
    };
  };
}

interface ApplicationSummary {
  name: string;
  description: string;
  status: string;
  endpointCount: number;
  endpoints: any[];
  icon: string;
  color: string;
  category: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // MatCard,
    // MatCardHeader,
    // MatCardTitle,
    // MatCardSubtitle,
    // MatCardContent,
    // MatCardActions,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatRippleModule
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Welcome to <span class="brand-gradient">LowCode Pro</span>
            </h1>
            <p class="hero-subtitle">
              Enterprise-grade platform for rapid application development and API management
            </p>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">{{ apiData?.applications?.total_applications || 0 }}</span>
                <span class="stat-label">Applications</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ apiData?.applications?.total_urls || 0 }}</span>
                <span class="stat-label">API Endpoints</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getTotalMethods() }}</span>
                <span class="stat-label">HTTP Methods</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="floating-card card-1">
              <mat-icon>api</mat-icon>
            </div>
            <div class="floating-card card-2">
              <mat-icon>dashboard</mat-icon>
            </div>
            <div class="floating-card card-3">
              <mat-icon>speed</mat-icon>
            </div>
          </div>
        </div>
      </section>

      <!-- Platform Overview -->
      <section class="overview-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Platform Overview</h2>
            <p class="section-subtitle">Real-time insights into your development ecosystem</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon api-icon">
                <mat-icon>api</mat-icon>
              </div>
              <div class="metric-content">
                <h3 class="metric-number">{{ apiData?.applications?.api_version || 'N/A' }}</h3>
                <p class="metric-label">API Version</p>
                <span class="metric-status status-active">Active</span>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon endpoints-icon">
                <mat-icon>hub</mat-icon>
              </div>
              <div class="metric-content">
                <h3 class="metric-number">{{ apiData?.applications?.total_urls || 0 }}</h3>
                <p class="metric-label">Total Endpoints</p>
                <span class="metric-trend positive">+12% this month</span>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon apps-icon">
                <mat-icon>apps</mat-icon>
              </div>
              <div class="metric-content">
                <h3 class="metric-number">{{ apiData?.applications?.total_applications || 0 }}</h3>
                <p class="metric-label">Applications</p>
                <span class="metric-trend positive">All operational</span>
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-icon time-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="metric-content">
                <h3 class="metric-number">{{ getFormattedDate(apiData?.applications?.schema_generated_on) }}</h3>
                <p class="metric-label">Last Updated</p>
                <span class="metric-status status-recent">Recent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Applications Section -->
      <section class="applications-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Your Applications</h2>
            <p class="section-subtitle">Click on any application to explore its resources and endpoints</p>
          </div>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="isLoading">
            <div class="loading-content">
              <mat-spinner diameter="48"></mat-spinner>
              <h3>Loading your applications...</h3>
              <p>Please wait while we fetch your data</p>
            </div>
          </div>

          <!-- Error State -->
          <div class="error-state" *ngIf="error && !isLoading">
            <div class="error-content">
              <mat-icon class="error-icon">error_outline</mat-icon>
              <h3>Unable to Load Applications</h3>
              <p>{{ error }}</p>
              <button mat-raised-button color="primary" (click)="loadDashboardData()" class="retry-btn">
                <mat-icon>refresh</mat-icon>
                Try Again
              </button>
            </div>
          </div>

          <!-- Applications Grid -->
          <div class="applications-grid" *ngIf="!isLoading && !error && applications && applications.length > 0">
            <div class="application-card"
                 *ngFor="let app of applications; trackBy: trackByApp"
                 (click)="viewApplication(app.name)"
                 matRipple
                 [matRippleColor]="'rgba(102, 126, 234, 0.1)'"
                 [style.--card-color]="app.color">

              <div class="card-header">
                <div class="app-icon" [style.background]="app.color">
                  <mat-icon>{{ app.icon }}</mat-icon>
                </div>
                <div class="app-badge" [ngClass]="'badge-' + app.category">
                  {{ app.category }}
                </div>
              </div>

              <div class="card-content">
                <h3 class="app-name">{{ app.name | titlecase }}</h3>
                <p class="app-description">{{ app.description }}</p>

                <div class="app-metrics">
                  <div class="app-metric">
                    <mat-icon>api</mat-icon>
                    <span>{{ app.endpointCount }} endpoints</span>
                  </div>
                  <div class="app-metric">
                    <mat-icon>http</mat-icon>
                    <span>{{ getUniqueMethods(app.endpoints).length }} methods</span>
                  </div>
                </div>

                <div class="method-chips">
                  <span class="method-chip"
                        *ngFor="let method of getUniqueMethods(app.endpoints).slice(0, 4)"
                        [ngClass]="'method-' + method.toLowerCase()">
                    {{ method }}
                  </span>
                  <span class="method-chip more"
                        *ngIf="getUniqueMethods(app.endpoints).length > 4">
                    +{{ getUniqueMethods(app.endpoints).length - 4 }}
                  </span>
                </div>
              </div>

              <div class="card-footer">
                <button mat-button class="explore-btn">
                  <span>Explore Application</span>
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>

              <div class="card-overlay"></div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!isLoading && !error && (!applications || applications.length === 0)">
            <div class="empty-content">
              <div class="empty-icon">
                <mat-icon>folder_open</mat-icon>
              </div>
              <h3>No Applications Found</h3>
              <p>It looks like you don't have any applications configured yet.</p>
              <button mat-raised-button color="primary" class="setup-btn">
                <mat-icon>add</mat-icon>
                Set Up Your First Application
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions Section -->
      <section class="quick-actions-section" *ngIf="!isLoading && applications && applications.length > 0">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Quick Actions</h2>
            <p class="section-subtitle">Common tasks and platform utilities</p>
          </div>

          <div class="actions-grid">
            <div class="action-card" (click)="loadDashboardData()" matRipple>
              <div class="action-icon refresh-icon">
                <mat-icon>refresh</mat-icon>
              </div>
              <h4>Refresh Data</h4>
              <p>Update application data and metrics</p>
            </div>

            <div class="action-card" (click)="goToConfig()" matRipple>
              <div class="action-icon config-icon">
                <mat-icon>settings</mat-icon>
              </div>
              <h4>Configuration</h4>
              <p>Manage platform settings</p>
            </div>

            <div class="action-card" matRipple>
              <div class="action-icon docs-icon">
                <mat-icon>description</mat-icon>
              </div>
              <h4>API Documentation</h4>
              <p>View API reference guides</p>
            </div>

            <div class="action-card" matRipple>
              <div class="action-icon analytics-icon">
                <mat-icon>analytics</mat-icon>
              </div>
              <h4>Analytics</h4>
              <p>View usage statistics</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Hero Section */
    .hero-section {
      padding: 80px 0 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
      }
    }

    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 60px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      margin: 0 0 20px 0;
      line-height: 1.1;
    }

    .brand-gradient {
      background: linear-gradient(45deg, #ffffff, #f0f9ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin: 0 0 40px 0;
      opacity: 0.9;
      line-height: 1.6;
      max-width: 600px;
    }

    .hero-stats {
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;

      .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .hero-visual {
      position: relative;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .floating-card {
      position: absolute;
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      animation: float 6s ease-in-out infinite;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &.card-1 {
        top: 20px;
        left: 20px;
        animation-delay: 0s;
      }

      &.card-2 {
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        animation-delay: 2s;
      }

      &.card-3 {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        animation-delay: 4s;
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }

    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 12px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: #64748b;
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Overview Section */
    .overview-section {
      padding: 80px 0;
      background: white;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .metric-card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

        &::before {
          transform: scaleX(1);
        }
      }
    }

    .metric-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      color: white;

      &.api-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.endpoints-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.apps-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
      &.time-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .metric-number {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
      line-height: 1;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .metric-status,
    .metric-trend {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;

      &.status-active {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.status-recent {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      &.positive {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }
    }

    /* Applications Section */
    .applications-section {
      padding: 80px 0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .application-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
      border: 1px solid #f1f5f9;

      &:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

        .card-overlay {
          opacity: 1;
        }

        .explore-btn {
          transform: translateX(8px);
        }
      }
    }

    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .card-header {
      padding: 24px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .app-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .app-badge {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.badge-api { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
      &.badge-web { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
      &.badge-service { background: rgba(168, 85, 247, 0.1); color: #9333ea; }
      &.badge-data { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
    }

    .card-content {
      padding: 0 24px 20px;
    }

    .app-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 12px 0;
    }

    .app-description {
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }

    .app-metrics {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .app-metric {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 0.9rem;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .method-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .method-chip {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;

      &.method-get { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
      &.method-post { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
      &.method-put { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
      &.method-delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
      &.method-patch { background: rgba(168, 85, 247, 0.1); color: #9333ea; }
      &.more { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
    }

    .card-footer {
      padding: 20px 24px 24px;
      border-top: 1px solid #f1f5f9;
    }

    .explore-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }

      mat-icon {
        transition: transform 0.3s ease;
      }
    }

    /* Loading, Error, and Empty States */
    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-content,
    .error-content,
    .empty-content {
      text-align: center;
      max-width: 400px;
    }

    .loading-content {
      h3 {
        margin: 24px 0 8px 0;
        color: #334155;
        font-weight: 600;
      }

      p {
        color: #64748b;
        margin: 0;
      }
    }

    .error-icon,
    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #dc2626;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
    }

    .empty-icon {
      background: rgba(107, 114, 128, 0.1);
      color: #6b7280;
    }

    .error-content,
    .empty-content {
      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #334155;
        margin: 0 0 12px 0;
      }

      p {
        color: #64748b;
        margin: 0 0 24px 0;
        line-height: 1.5;
      }
    }

    .retry-btn,
    .setup-btn {
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 24px;
    }

    /* Quick Actions */
    .quick-actions-section {
      padding: 80px 0;
      background: white;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .action-card {
      background: white;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;

      &:hover {
        border-color: #667eea;
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
      }
    }

    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;

      &.refresh-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.config-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.docs-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
      &.analytics-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .action-card h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .action-card p {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 40px;
        text-align: center;
      }

      .hero-visual {
        height: 200px;
      }

      .applications-grid {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 60px 0 40px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .overview-section,
      .applications-section,
      .quick-actions-section {
        padding: 60px 0;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .applications-grid {
        grid-template-columns: 1fr;
      }

      .hero-stats {
        justify-content: center;
        gap: 30px;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 0 16px;
      }

      .hero-section {
        padding: 40px 0 30px;
      }

      .hero-title {
        font-size: 2rem;
      }

      .metric-card,
      .action-card {
        padding: 24px 20px;
      }

      .application-card .card-header,
      .application-card .card-content,
      .application-card .card-footer {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  apiData: ApiResponse | null = null;
  applications: ApplicationSummary[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  private appIcons = ['apps', 'api', 'cloud', 'storage', 'analytics', 'security'];
  private appColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ];
  private appCategories = ['API', 'Web', 'Service', 'Data'];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  public loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`)
      .subscribe({
        next: (data) => {
          this.apiData = data;
          this.processApplicationsData(data);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);

          if (err.status === 401) {
            this.error = 'Authentication failed. Please login again.';
            this.handleAuthError();
          } else if (err.status === 403) {
            this.error = 'Access denied. You do not have permission to access this resource.';
          } else if (err.status === 0) {
            this.error = 'Network error. Please check your connection and try again.';
          } else {
            this.error = `Failed to load dashboard data. Server responded with status ${err.status}.`;
          }

          this.isLoading = false;
        }
      });
  }

  private processApplicationsData(data: ApiResponse): void {
    if (!data.applications?.applications) {
      this.applications = [];
      return;
    }

    this.applications = Object.keys(data.applications.applications).map((appName, index) => {
      const endpoints = data.applications.applications[appName];

      return {
        name: appName,
        description: this.generateAppDescription(appName, endpoints),
        status: 'Active',
        endpointCount: endpoints.length,
        endpoints: endpoints,
        icon: this.appIcons[index % this.appIcons.length],
        color: this.appColors[index % this.appColors.length],
        category: this.appCategories[index % this.appCategories.length]
      };
    });
  }

  private generateAppDescription(appName: string, endpoints: any[]): string {
    if (endpoints.length === 0) return 'No endpoints available';

    const uniqueActions = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.available_actions?.forEach((action: string) => uniqueActions.add(action));
    });

    const actionsArray = Array.from(uniqueActions);
    const actionText = actionsArray.length > 0 ? actionsArray.slice(0, 3).join(', ') : 'CRUD operations';

    return `${endpoints.length} endpoint${endpoints.length > 1 ? 's' : ''} supporting ${actionText}${actionsArray.length > 3 ? ' and more' : ''}`;
  }

  public getUniqueMethods(endpoints: any[]): string[] {
    const methods = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.methods?.forEach((method: string) => methods.add(method));
    });
    return Array.from(methods);
  }

  getTotalMethods(): number {
    if (!this.applications) return 0;
    const allMethods = new Set<string>();
    this.applications.forEach(app => {
      this.getUniqueMethods(app.endpoints).forEach(method => allMethods.add(method));
    });
    return allMethods.size;
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Not available';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  viewApplication(appName: string): void {
    this.router.navigate(['/app', appName]);
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }

  trackByApp(index: number, app: ApplicationSummary): string {
    return app.name;
  }

  private handleAuthError(): void {
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }
}
