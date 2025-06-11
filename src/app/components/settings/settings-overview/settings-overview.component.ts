// components/settings/settings-overview/settings-overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { ApiService } from '../../../services/api.service';

interface SettingsCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  count?: number;
  status: 'active' | 'inactive' | 'loading';
  lastUpdated?: string;
}

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule
  ],
  template: `
    <div class="settings-overview">
      <!-- Header Section -->
      <div class="overview-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Platform Settings</h1>
            <p>Manage your low-code platform configuration and administration</p>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon lookups-icon">
            <mat-icon>list</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalLookups }}</h3>
            <p>Total Lookups</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon fields-icon">
            <mat-icon>dynamic_form</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalFields }}</h3>
            <p>Dynamic Fields</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon types-icon">
            <mat-icon>input</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalFieldTypes }}</h3>
            <p>Field Types</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon versions-icon">
            <mat-icon>history</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalVersions }}</h3>
            <p>App Versions</p>
          </div>
        </div>
      </div>

      <!-- Settings Cards Grid -->
      <div class="settings-grid">
        <div
          *ngFor="let card of settingsCards"
          class="settings-card"
          [class]="'card-' + card.id"
          (click)="navigateToSetting(card.route)"
          matRipple>

          <div class="card-header">
            <div class="card-icon" [style.background]="card.color">
              <mat-icon>{{ card.icon }}</mat-icon>
            </div>
            <div class="card-status" [class]="'status-' + card.status">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusText(card.status) }}</span>
            </div>
          </div>

          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>

            <div class="card-meta" *ngIf="card.count !== undefined || card.lastUpdated">
              <span class="card-count" *ngIf="card.count !== undefined">
                {{ card.count }} items
              </span>
              <span class="card-updated" *ngIf="card.lastUpdated">
                Updated {{ card.lastUpdated }}
              </span>
            </div>
          </div>

          <div class="card-action">
            <mat-icon>arrow_forward</mat-icon>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity" *ngIf="recentActivities.length > 0">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div
            *ngFor="let activity of recentActivities"
            class="activity-item"
            [class]="'activity-' + activity.type">
            <div class="activity-icon">
              <mat-icon>{{ activity.icon }}</mat-icon>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.description }}</p>
              <span class="activity-time">{{ activity.timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-overview {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .overview-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-text p {
      color: #64748b;
      font-size: 1.1rem;
      margin: 0;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.lookups-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.fields-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.types-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
      &.versions-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    }

    .stat-content h3 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .stat-content p {
      color: #64748b;
      margin: 4px 0 0 0;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .settings-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .settings-card::before {
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

    .settings-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .settings-card:hover::before {
      transform: scaleX(1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .card-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-active {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;

      .status-dot { background: #16a34a; }
    }

    .status-inactive {
      background: rgba(148, 163, 184, 0.1);
      color: #64748b;

      .status-dot { background: #64748b; }
    }

    .status-loading {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;

      .status-dot { background: #2563eb; }
    }

    .card-content h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .card-content p {
      color: #64748b;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .card-action {
      position: absolute;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      color: #94a3b8;
      transition: all 0.3s ease;
    }

    .settings-card:hover .card-action {
      color: #667eea;
      transform: translateY(-50%) translateX(4px);
    }

    .recent-activity h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 20px 0;
    }

    .activity-list {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s ease;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item:hover {
      background: #f8fafc;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .activity-text {
      font-size: 0.9rem;
      color: #334155;
      margin: 0 0 4px 0;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .settings-overview {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .quick-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SettingsOverviewComponent implements OnInit {
  stats = {
    totalLookups: 0,
    totalFields: 0,
    totalFieldTypes: 0,
    totalVersions: 0
  };

  settingsCards: SettingsCard[] = [
    {
      id: 'lookups',
      title: 'Lookups Management',
      description: 'Manage dropdown values, categories, and reference data for your applications',
      icon: 'list',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/settings/lookups',
      status: 'active'
    },
    {
      id: 'field-types',
      title: 'Field Types',
      description: 'Configure available field types for dynamic form generation',
      icon: 'input',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      route: '/settings/field-types',
      status: 'active'
    },
    {
      id: 'fields',
      title: 'Fields Management',
      description: 'Create and manage dynamic fields with validation rules and properties',
      icon: 'dynamic_form',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      route: '/settings/fields',
      status: 'active'
    },
    {
      id: 'versions',
      title: 'Version Control',
      description: 'Manage application versions, environments, and deployment settings',
      icon: 'history',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      route: '/settings/versions',
      status: 'active'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts, roles, permissions, and access control',
      icon: 'people',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/settings/users',
      status: 'active'
    },
    {
      id: 'licenses',
      title: 'Licenses & Subscriptions',
      description: 'Manage platform licenses, subscriptions, and billing information',
      icon: 'receipt',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      route: '/settings/licenses',
      status: 'active'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Configure global system settings, security, and platform preferences',
      icon: 'tune',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      route: '/settings/system',
      status: 'active'
    }
  ];

  recentActivities = [
    {
      type: 'create',
      icon: 'add',
      description: 'New lookup "Document Types" created',
      timestamp: '2 hours ago'
    },
    {
      type: 'update',
      icon: 'edit',
      description: 'Field "Email Address" validation updated',
      timestamp: '4 hours ago'
    },
    {
      type: 'deploy',
      icon: 'publish',
      description: 'Version 1.2.3 deployed to production',
      timestamp: '1 day ago'
    }
  ];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Load stats from APIs
    this.apiService.getFieldTypes().subscribe({
      next: (response) => {
        this.stats.totalFieldTypes = response.count;
        this.updateCardCount('field-types', response.count);
      },
      error: (err) => console.error('Error loading field types:', err)
    });

    this.apiService.getFields().subscribe({
      next: (response) => {
        this.stats.totalFields = response.count;
        this.updateCardCount('fields', response.count);
      },
      error: (err) => console.error('Error loading fields:', err)
    });

    // Note: Add other API calls when available
    // For now, using mock data
    this.stats.totalLookups = 55; // From the provided sample data
    this.stats.totalVersions = 3; // From the provided sample data

    this.updateCardCount('lookups', this.stats.totalLookups);
    this.updateCardCount('versions', this.stats.totalVersions);
  }

  private updateCardCount(cardId: string, count: number): void {
    const card = this.settingsCards.find(c => c.id === cardId);
    if (card) {
      card.count = count;
    }
  }

  navigateToSetting(route: string): void {
    this.router.navigate([route]);
  }

  refreshData(): void {
    this.loadStats();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'loading': return 'Loading';
      default: return 'Unknown';
    }
  }
}
