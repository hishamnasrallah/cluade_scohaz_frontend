// components/settings/settings-overview/settings-overview.component.ts - ENHANCED Ocean Mint Theme
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatRippleModule,
    MatTooltipModule
  ],
  template: `
    <div class="settings-overview">
      <!-- Compact Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <mat-icon>settings</mat-icon>
            </div>
            <div class="header-text">
              <h1>Platform Settings</h1>
              <p>Manage your low-code platform configuration</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-icon-button
                    (click)="refreshData()"
                    class="refresh-btn"
                    matTooltip="Refresh"
                    [disabled]="isLoading">
              <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
            </button>
            <button mat-button class="search-btn">
              <mat-icon>search</mat-icon>
              Search Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon lookups-icon">
            <mat-icon>list</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalLookups }}</h3>
            <p>Lookups</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon fields-icon">
            <mat-icon>dynamic_form</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalFields }}</h3>
            <p>Fields</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon types-icon">
            <mat-icon>input</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalFieldTypes }}</h3>
            <p>Types</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon versions-icon">
            <mat-icon>history</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ stats.totalVersions }}</h3>
            <p>Versions</p>
          </div>
        </div>
      </div>

      <!-- Settings Grid -->
      <div class="settings-grid">
        <div
          *ngFor="let card of settingsCards"
          class="settings-card"
          [class]="'card-' + card.id"
          (click)="navigateToSetting(card.route)"
          matRipple
          [matRippleColor]="'rgba(52, 197, 170, 0.1)'">

          <div class="card-header">
            <div class="card-icon" [style.background]="card.color">
              <mat-icon>{{ card.icon }}</mat-icon>
            </div>
            <button mat-icon-button
                    class="card-menu"
                    (click)="openCardMenu($event, card)"
                    matTooltip="More options">
              <mat-icon>more_vert</mat-icon>
            </button>
          </div>

          <div class="card-content">
            <h3>{{ card.title }}</h3>
            <p>{{ card.description }}</p>
          </div>

          <div class="card-footer">
            <div class="card-stats">
              <span class="stat-value" *ngIf="card.count !== undefined">
                <mat-icon>folder_open</mat-icon>
                {{ card.count }} items
              </span>
              <span class="stat-status" [class]="'status-' + card.status">
                <span class="status-dot"></span>
                {{ card.status }}
              </span>
            </div>
            <mat-icon class="card-arrow">arrow_forward</mat-icon>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="quick-actions-card">
          <div class="quick-header">
            <mat-icon>flash_on</mat-icon>
            <h3>Quick Actions</h3>
          </div>
          <div class="quick-actions">
            <button mat-button class="quick-action" (click)="exportSettings()">
              <mat-icon>download</mat-icon>
              Export All
            </button>
            <button mat-button class="quick-action" (click)="importSettings()">
              <mat-icon>upload</mat-icon>
              Import
            </button>
            <button mat-button class="quick-action" (click)="backupSettings()">
              <mat-icon>backup</mat-icon>
              Backup
            </button>
            <button mat-button class="quick-action" (click)="viewLogs()">
              <mat-icon>description</mat-icon>
              View Logs
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="activity-section" *ngIf="recentActivities.length > 0">
        <div class="section-header">
          <div class="header-left">
            <mat-icon>update</mat-icon>
            <h2>Recent Activity</h2>
          </div>
          <button mat-button class="view-all-btn">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div class="activity-timeline">
          <div
            *ngFor="let activity of recentActivities"
            class="activity-item"
            [class]="'activity-' + activity.type">
            <div class="timeline-dot" [style.background]="getActivityColor(activity.type)">
              <mat-icon>{{ activity.icon }}</mat-icon>
            </div>
            <div class="timeline-content">
              <p class="activity-text">{{ activity.description }}</p>
              <span class="activity-time">
                <mat-icon>schedule</mat-icon>
                {{ activity.timestamp }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-overview {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
    }

    /* Compact Header */
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 8px rgba(52, 197, 170, 0.25);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .header-text h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      line-height: 1.2;
      font-family: 'Poppins', sans-serif;
    }

    .header-text p {
      color: #6B7280;
      margin: 0;
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .refresh-btn {
      color: #34C5AA;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    .search-btn {
      color: #6B7280;
      border: 1px solid #E5E7EB;

      &:hover {
        background: rgba(196, 247, 239, 0.2);
        border-color: rgba(52, 197, 170, 0.3);
        color: #34C5AA;
      }
    }

    /* Compact Stats */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.1);
        border-color: rgba(52, 197, 170, 0.3);
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      &.lookups-icon { background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%); }
      &.fields-icon { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
      &.types-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
      &.versions-icon { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .stat-content h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      line-height: 1;
    }

    .stat-content p {
      color: #6B7280;
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Settings Grid */
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .settings-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #34C5AA, #2BA99B);
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(47, 72, 88, 0.08);
        border-color: rgba(52, 197, 170, 0.3);

        &::before {
          transform: scaleX(1);
        }

        .card-arrow {
          transform: translateX(4px);
          color: #34C5AA;
        }
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
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

    .card-menu {
      width: 32px;
      height: 32px;
      opacity: 0;
      transition: opacity 0.2s ease;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #9CA3AF;
      }
    }

    .settings-card:hover .card-menu {
      opacity: 1;
    }

    .card-content h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2F4858;
      margin: 0 0 8px 0;
    }

    .card-content p {
      color: #6B7280;
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #F3F4F6;
    }

    .card-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.75rem;
    }

    .stat-value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #6B7280;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .stat-status {
      display: flex;
      align-items: center;
      gap: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-active {
      color: #16A34A;
      .status-dot { background: #16A34A; }
    }

    .status-inactive {
      color: #6B7280;
      .status-dot { background: #6B7280; }
    }

    .status-loading {
      color: #3B82F6;
      .status-dot { background: #3B82F6; }
    }

    .card-arrow {
      color: #D1D5DB;
      transition: all 0.3s ease;
      font-size: 18px;
    }

    /* Quick Actions Card */
    .quick-actions-card {
      background: linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .quick-header {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        color: #34C5AA;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .quick-action {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      justify-content: flex-start;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 8px;
      }
    }

    /* Activity Section */
    .activity-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        color: #34C5AA;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .view-all-btn {
      color: #34C5AA;
      font-weight: 500;
      font-size: 0.875rem;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      padding-left: 32px;

      &::before {
        content: '';
        position: absolute;
        left: 12px;
        top: 24px;
        bottom: 24px;
        width: 2px;
        background: #E5E7EB;
      }
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
    }

    .timeline-dot {
      position: absolute;
      left: -26px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .timeline-content {
      flex: 1;
    }

    .activity-text {
      color: #2F4858;
      margin: 0 0 4px 0;
      font-size: 0.9rem;
    }

    .activity-time {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #9CA3AF;
      font-size: 0.8rem;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-overview {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 12px;
      }

      .header-info {
        justify-content: center;
      }

      .header-actions {
        justify-content: center;
        width: 100%;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .settings-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
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

  isLoading = false;

  settingsCards: SettingsCard[] = [
    {
      id: 'lookups',
      title: 'Lookups Management',
      description: 'Manage dropdown values and reference data',
      icon: 'list',
      color: 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
      route: '/settings/lookups',
      status: 'active'
    },
    {
      id: 'field-types',
      title: 'Field Types',
      description: 'Configure field types for forms',
      icon: 'input',
      color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      route: '/settings/field-types',
      status: 'active'
    },
    {
      id: 'fields',
      title: 'Fields Management',
      description: 'Create and manage dynamic fields',
      icon: 'dynamic_form',
      color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      route: '/settings/fields',
      status: 'active'
    },
    {
      id: 'versions',
      title: 'Version Control',
      description: 'Manage app versions and deployments',
      icon: 'history',
      color: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      route: '/settings/versions',
      status: 'active'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, roles and permissions',
      icon: 'people',
      color: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      route: '/settings/users',
      status: 'active'
    },
    {
      id: 'licenses',
      title: 'Licenses',
      description: 'Manage platform licenses',
      icon: 'receipt',
      color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      route: '/settings/licenses',
      status: 'active'
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: 'tune',
      color: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      route: '/settings/system',
      status: 'active'
    }
  ];

  recentActivities = [
    {
      type: 'create',
      icon: 'add_circle',
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
      icon: 'cloud_upload',
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
    this.isLoading = true;

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

    // Mock data for now
    this.stats.totalLookups = 55;
    this.stats.totalVersions = 3;

    this.updateCardCount('lookups', this.stats.totalLookups);
    this.updateCardCount('versions', this.stats.totalVersions);

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
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

  openCardMenu(event: Event, card: SettingsCard): void {
    event.stopPropagation();
    // Implement menu functionality
  }

  exportSettings(): void {
    console.log('Export settings');
  }

  importSettings(): void {
    console.log('Import settings');
  }

  backupSettings(): void {
    console.log('Backup settings');
  }

  viewLogs(): void {
    console.log('View logs');
  }

  getActivityColor(type: string): string {
    const colors = {
      create: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      update: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      deploy: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      delete: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    };
    return colors[type as keyof typeof colors] || colors.create;
  }
}
