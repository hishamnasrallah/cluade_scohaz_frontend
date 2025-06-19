// components/settings/system-settings/system-settings.component.ts - ENHANCED Ocean Mint Theme
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRippleModule } from '@angular/material/core';

interface SystemSetting {
  id?: number;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  is_sensitive: boolean;
  is_readonly: boolean;
  validation_rules?: any;
  updated_at?: string;
  updated_by?: string;
}

interface SecuritySetting {
  id?: number;
  setting_name: string;
  setting_value: boolean | string | number;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'audit' | 'general';
}

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatChipsModule,
    MatExpansionModule,
    MatRippleModule
  ],
  template: `
    <div class="system-settings">
      <!-- Compact Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <mat-icon>tune</mat-icon>
            </div>
            <div class="header-text">
              <h1>System Settings</h1>
              <p>Configure global system settings and preferences</p>
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
            <button mat-button class="export-btn" (click)="exportSettings()">
              <mat-icon>download</mat-icon>
              Export
            </button>
            <button mat-raised-button class="save-btn" (click)="saveAllSettings()" [disabled]="isSaving">
              <mat-icon>save</mat-icon>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon general-icon">
            <mat-icon>settings</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getSettingsCount('general') }}</h3>
            <p>General</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon security-icon">
            <mat-icon>security</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getSettingsCount('security') }}</h3>
            <p>Security</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon performance-icon">
            <mat-icon>speed</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getSettingsCount('performance') }}</h3>
            <p>Performance</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon notifications-icon">
            <mat-icon>notifications</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getSettingsCount('notifications') }}</h3>
            <p>Notifications</p>
          </div>
        </div>
      </div>

      <!-- Settings Categories -->
      <div class="settings-container">
        <mat-tab-group class="settings-tabs" animationDuration="300ms">

          <!-- General Settings Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label">
                <mat-icon>tune</mat-icon>
                <span>General</span>
              </div>
            </ng-template>

            <div class="tab-content">
              <!-- Platform Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>business</mat-icon>
                    <h3>Platform Settings</h3>
                  </div>
                </div>

                <form [formGroup]="generalForm" class="settings-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Platform Name</mat-label>
                      <input matInput formControlName="platform_name">
                      <mat-icon matPrefix>label</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Platform Version</mat-label>
                      <input matInput formControlName="platform_version" readonly>
                      <mat-icon matPrefix>tag</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Platform Description</mat-label>
                    <textarea matInput formControlName="platform_description" rows="2"></textarea>
                    <mat-icon matPrefix>description</mat-icon>
                  </mat-form-field>
                </form>
              </div>

              <!-- Regional Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>language</mat-icon>
                    <h3>Regional Settings</h3>
                  </div>
                </div>

                <form [formGroup]="generalForm" class="settings-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Default Language</mat-label>
                      <mat-select formControlName="default_language">
                        <mat-option value="en">English</mat-option>
                        <mat-option value="ar">Arabic</mat-option>
                        <mat-option value="fr">French</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>translate</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Default Timezone</mat-label>
                      <mat-select formControlName="default_timezone">
                        <mat-option value="UTC">UTC</mat-option>
                        <mat-option value="Asia/Dubai">Dubai</mat-option>
                        <mat-option value="Asia/Riyadh">Riyadh</mat-option>
                        <mat-option value="America/New_York">New York</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>schedule</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Date Format</mat-label>
                      <mat-select formControlName="date_format">
                        <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                        <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                        <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>calendar_today</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Currency</mat-label>
                      <mat-select formControlName="default_currency">
                        <mat-option value="USD">USD - US Dollar</mat-option>
                        <mat-option value="EUR">EUR - Euro</mat-option>
                        <mat-option value="AED">AED - UAE Dirham</mat-option>
                        <mat-option value="JOD">JOD - Jordanian Dinar</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>attach_money</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>

              <!-- System Limits -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>data_usage</mat-icon>
                    <h3>System Limits</h3>
                  </div>
                </div>

                <form [formGroup]="generalForm" class="settings-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Max Upload Size (MB)</mat-label>
                      <input matInput type="number" formControlName="max_upload_size">
                      <mat-icon matPrefix>cloud_upload</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Session Timeout (minutes)</mat-label>
                      <input matInput type="number" formControlName="session_timeout">
                      <mat-icon matPrefix>timer</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>
            </div>
          </mat-tab>

          <!-- Security Settings Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label">
                <mat-icon>security</mat-icon>
                <span>Security</span>
              </div>
            </ng-template>

            <div class="tab-content">
              <!-- Authentication Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>lock</mat-icon>
                    <h3>Authentication</h3>
                  </div>
                </div>

                <form [formGroup]="securityForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>security</mat-icon>
                        <div class="toggle-text">
                          <h5>Two-Factor Authentication</h5>
                          <p>Require 2FA for all users</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="require_2fa"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>login</mat-icon>
                        <div class="toggle-text">
                          <h5>Single Sign-On (SSO)</h5>
                          <p>Enable SSO integration</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_sso"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>lock_person</mat-icon>
                        <div class="toggle-text">
                          <h5>Account Lockout</h5>
                          <p>Lock accounts after failed login attempts</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_account_lockout"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Password Min Length</mat-label>
                      <input matInput type="number" formControlName="password_min_length" min="6" max="50">
                      <mat-icon matPrefix>password</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Max Failed Attempts</mat-label>
                      <input matInput type="number" formControlName="max_failed_attempts" min="3" max="10">
                      <mat-icon matPrefix>block</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>

              <!-- Data Protection -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>shield</mat-icon>
                    <h3>Data Protection</h3>
                  </div>
                </div>

                <form [formGroup]="securityForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>enhanced_encryption</mat-icon>
                        <div class="toggle-text">
                          <h5>Data Encryption at Rest</h5>
                          <p>Encrypt sensitive data in database</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="encrypt_data_at_rest"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>history</mat-icon>
                        <div class="toggle-text">
                          <h5>Audit Logging</h5>
                          <p>Log all user activities and changes</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_audit_logging"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>location_on</mat-icon>
                        <div class="toggle-text">
                          <h5>IP Restriction</h5>
                          <p>Restrict access by IP address</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_ip_restriction"></mat-slide-toggle>
                    </div>
                  </div>

                  <mat-form-field appearance="outline" *ngIf="securityForm.get('enable_ip_restriction')?.value">
                    <mat-label>Allowed IP Addresses</mat-label>
                    <textarea matInput formControlName="allowed_ips"
                              placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                              rows="4"></textarea>
                    <mat-icon matPrefix>list</mat-icon>
                    <mat-hint>Enter IP addresses or CIDR blocks, one per line</mat-hint>
                  </mat-form-field>
                </form>
              </div>
            </div>
          </mat-tab>

          <!-- Performance Settings Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label">
                <mat-icon>speed</mat-icon>
                <span>Performance</span>
              </div>
            </ng-template>

            <div class="tab-content">
              <!-- Caching Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>cached</mat-icon>
                    <h3>Caching</h3>
                  </div>
                </div>

                <form [formGroup]="performanceForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>memory</mat-icon>
                        <div class="toggle-text">
                          <h5>Enable Redis Caching</h5>
                          <p>Use Redis for session and data caching</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_redis_cache"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>storage</mat-icon>
                        <div class="toggle-text">
                          <h5>Database Query Caching</h5>
                          <p>Cache frequently used database queries</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_query_cache"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>folder</mat-icon>
                        <div class="toggle-text">
                          <h5>Static File Caching</h5>
                          <p>Enable browser caching for static assets</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_static_cache"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Cache TTL (seconds)</mat-label>
                      <input matInput type="number" formControlName="cache_ttl" min="60" max="86400">
                      <mat-icon matPrefix>timer</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Query Cache Size (MB)</mat-label>
                      <input matInput type="number" formControlName="query_cache_size" min="50" max="1000">
                      <mat-icon matPrefix>memory</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>

              <!-- Rate Limiting -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>speed</mat-icon>
                    <h3>Rate Limiting</h3>
                  </div>
                </div>

                <form [formGroup]="performanceForm" class="settings-form">
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>API Rate Limit (requests/minute)</mat-label>
                      <input matInput type="number" formControlName="api_rate_limit" min="10" max="10000">
                      <mat-icon matPrefix>api</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Burst Limit</mat-label>
                      <input matInput type="number" formControlName="burst_limit" min="5" max="100">
                      <mat-icon matPrefix>bolt</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>
            </div>
          </mat-tab>

          <!-- Notifications Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label">
                <mat-icon>notifications</mat-icon>
                <span>Notifications</span>
              </div>
            </ng-template>

            <div class="tab-content">
              <!-- Email Configuration -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>email</mat-icon>
                    <h3>Email Configuration</h3>
                  </div>
                </div>

                <form [formGroup]="notificationForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>mail</mat-icon>
                        <div class="toggle-text">
                          <h5>Enable Email Notifications</h5>
                          <p>Send system notifications via email</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_email_notifications"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="form-grid" *ngIf="notificationForm.get('enable_email_notifications')?.value">
                    <mat-form-field appearance="outline">
                      <mat-label>SMTP Server</mat-label>
                      <input matInput formControlName="smtp_server">
                      <mat-icon matPrefix>dns</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>SMTP Port</mat-label>
                      <input matInput type="number" formControlName="smtp_port">
                      <mat-icon matPrefix>router</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>SMTP Username</mat-label>
                      <input matInput formControlName="smtp_username">
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>From Email</mat-label>
                      <input matInput type="email" formControlName="from_email">
                      <mat-icon matPrefix>alternate_email</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>

              <!-- Notification Types -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>notifications_active</mat-icon>
                    <h3>Notification Types</h3>
                  </div>
                </div>

                <form [formGroup]="notificationForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>person_add</mat-icon>
                        <div class="toggle-text">
                          <h5>User Registration</h5>
                          <p>Notify admins of new user registrations</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="notify_user_registration"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>error</mat-icon>
                        <div class="toggle-text">
                          <h5>System Errors</h5>
                          <p>Send alerts for system errors and failures</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="notify_system_errors"></mat-slide-toggle>
                    </div>

                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>security</mat-icon>
                        <div class="toggle-text">
                          <h5>Security Events</h5>
                          <p>Alert on security-related events</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="notify_security_events"></mat-slide-toggle>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </mat-tab>

          <!-- Backup & Maintenance Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label">
                <mat-icon>backup</mat-icon>
                <span>Backup</span>
              </div>
            </ng-template>

            <div class="tab-content">
              <!-- Backup Configuration -->
              <div class="settings-section">
                <div class="section-header">
                  <div class="header-left">
                    <mat-icon>cloud_upload</mat-icon>
                    <h3>Backup Configuration</h3>
                  </div>
                </div>

                <form [formGroup]="maintenanceForm" class="settings-form">
                  <div class="toggle-list">
                    <div class="toggle-item" matRipple>
                      <div class="toggle-info">
                        <mat-icon>backup</mat-icon>
                        <div class="toggle-text">
                          <h5>Automated Backups</h5>
                          <p>Enable scheduled database backups</p>
                        </div>
                      </div>
                      <mat-slide-toggle formControlName="enable_auto_backup"></mat-slide-toggle>
                    </div>
                  </div>

                  <div class="form-grid" *ngIf="maintenanceForm.get('enable_auto_backup')?.value">
                    <mat-form-field appearance="outline">
                      <mat-label>Backup Frequency</mat-label>
                      <mat-select formControlName="backup_frequency">
                        <mat-option value="daily">Daily</mat-option>
                        <mat-option value="weekly">Weekly</mat-option>
                        <mat-option value="monthly">Monthly</mat-option>
                      </mat-select>
                      <mat-icon matPrefix>schedule</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Backup Retention (days)</mat-label>
                      <input matInput type="number" formControlName="backup_retention_days" min="1" max="365">
                      <mat-icon matPrefix>date_range</mat-icon>
                    </mat-form-field>
                  </div>
                </form>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Save Dialog -->
    <ng-template #saveDialog>
      <h2 mat-dialog-title>
        <mat-icon>save</mat-icon>
        Save System Settings
      </h2>
      <mat-dialog-content>
        <p>Are you sure you want to save all changes?</p>
        <div class="warning-card" *ngIf="hasSecurityChanges()">
          <mat-icon>warning</mat-icon>
          <span>Security settings have been modified. Please review carefully before saving.</span>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button class="save-btn" (click)="confirmSave()" [disabled]="isSaving">
          <mat-spinner diameter="16" *ngIf="isSaving"></mat-spinner>
          Save Changes
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .system-settings {
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

    .export-btn {
      color: #6B7280;
      border: 1px solid #E5E7EB;

      &:hover {
        background: rgba(196, 247, 239, 0.2);
        border-color: rgba(52, 197, 170, 0.3);
        color: #34C5AA;
      }
    }

    .save-btn {
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(52, 197, 170, 0.2);

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    }

    /* Stats Section */
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

      &.general-icon { background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%); }
      &.security-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
      &.performance-icon { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
      &.notifications-icon { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

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

    /* Settings Container */
    .settings-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .settings-tabs {
      ::ng-deep .mat-mdc-tab-header {
        background: #F9FAFB;
        border-bottom: 1px solid #E5E7EB;
      }

      ::ng-deep .mat-mdc-tab {
        min-width: 120px;
        height: 56px;
      }

      ::ng-deep .mdc-tab__text-label {
        color: #6B7280;
        font-weight: 500;
      }

      ::ng-deep .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
        color: #34C5AA;
      }

      ::ng-deep .mdc-tab-indicator__content--underline {
        background-color: #34C5AA;
        height: 3px;
      }
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .tab-content {
      padding: 24px;
      background: #FAFBFC;
      min-height: 400px;
    }

    /* Settings Section */
    .settings-section {
      background: white;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.03);
      border: 1px solid rgba(196, 247, 239, 0.3);
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

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #2F4858;
      }
    }

    /* Form Styles */
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    mat-form-field {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: white;
      }

      ::ng-deep .mdc-text-field--outlined .mdc-notched-outline {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #E5E7EB;
        }
      }

      ::ng-deep &.mat-focused .mdc-text-field--outlined .mdc-notched-outline {
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: #34C5AA;
        }
      }

      ::ng-deep .mat-mdc-form-field-icon-prefix {
        color: #9CA3AF;
        margin-right: 12px;
      }

      ::ng-deep &.mat-focused .mat-mdc-form-field-icon-prefix {
        color: #34C5AA;
      }
    }

    /* Toggle List */
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        background: rgba(196, 247, 239, 0.2);
        border-color: rgba(52, 197, 170, 0.3);
      }
    }

    .toggle-info {
      display: flex;
      align-items: center;
      gap: 16px;

      mat-icon {
        color: #34C5AA;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .toggle-text h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #2F4858;
      margin: 0 0 4px 0;
    }

    .toggle-text p {
      font-size: 0.8rem;
      color: #6B7280;
      margin: 0;
    }

    ::ng-deep .mat-mdc-slide-toggle {
      .mdc-switch--selected .mdc-switch__track {
        background-color: rgba(52, 197, 170, 0.54);
      }

      .mdc-switch--selected .mdc-switch__handle-track {
        .mdc-switch__handle {
          .mdc-switch__icon--on {
            fill: #34C5AA;
          }
        }
      }
    }

    /* Dialog Styles */
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      color: #2F4858;
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid #E5E7EB;

      mat-icon {
        color: #34C5AA;
      }
    }

    mat-dialog-content {
      padding: 20px 24px !important;
    }

    .warning-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
      color: #D97706;
      font-size: 0.875rem;
      margin-top: 16px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    mat-dialog-actions {
      padding: 12px 24px !important;
      border-top: 1px solid #E5E7EB;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .system-settings {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        gap: 12px;
      }

      .header-actions {
        width: 100%;
        justify-content: center;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .toggle-item {
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  @ViewChild('saveDialog') saveDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;

  generalForm!: FormGroup;
  securityForm!: FormGroup;
  performanceForm!: FormGroup;
  notificationForm!: FormGroup;
  maintenanceForm!: FormGroup;

  private originalValues: any = {};

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private initializeForms(): void {
    this.generalForm = this.fb.group({
      platform_name: ['PraXelo'],
      platform_version: ['1.0.0'],
      platform_description: ['Enterprise low-code platform for rapid application development'],
      default_language: ['en'],
      default_timezone: ['UTC'],
      date_format: ['YYYY-MM-DD'],
      default_currency: ['USD'],
      max_upload_size: [100],
      session_timeout: [30]
    });

    this.securityForm = this.fb.group({
      require_2fa: [false],
      enable_sso: [false],
      enable_account_lockout: [true],
      password_min_length: [8],
      max_failed_attempts: [5],
      encrypt_data_at_rest: [true],
      enable_audit_logging: [true],
      enable_ip_restriction: [false],
      allowed_ips: ['']
    });

    this.performanceForm = this.fb.group({
      enable_redis_cache: [true],
      enable_query_cache: [true],
      enable_static_cache: [true],
      cache_ttl: [3600],
      query_cache_size: [128],
      api_rate_limit: [1000],
      burst_limit: [20],
      db_pool_size: [20],
      query_timeout: [30]
    });

    this.notificationForm = this.fb.group({
      enable_email_notifications: [true],
      smtp_server: [''],
      smtp_port: [587],
      smtp_username: [''],
      from_email: ['noreply@example.com'],
      notify_user_registration: [true],
      notify_system_errors: [true],
      notify_security_events: [true],
      admin_emails: ['admin@example.com']
    });

    this.maintenanceForm = this.fb.group({
      enable_auto_backup: [true],
      backup_frequency: ['daily'],
      backup_retention_days: [30],
      enable_maintenance_mode: [false],
      log_retention_days: [90],
      cleanup_frequency: ['weekly'],
      max_storage_per_user: [10],
      temp_file_cleanup_hours: [24]
    });
  }

  private loadSettings(): void {
    this.isLoading = true;

    // Store original values for change detection
    this.originalValues = {
      general: this.generalForm.value,
      security: this.securityForm.value,
      performance: this.performanceForm.value,
      notification: this.notificationForm.value,
      maintenance: this.maintenanceForm.value
    };

    // Simulate loading
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  saveAllSettings(): void {
    this.dialog.open(this.saveDialog, {
      width: '500px',
      disableClose: false,
      panelClass: 'compact-dialog'
    });
  }

  confirmSave(): void {
    this.isSaving = true;

    // Simulate saving
    setTimeout(() => {
      this.snackBar.open('System settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      // Update original values
      this.originalValues = {
        general: this.generalForm.value,
        security: this.securityForm.value,
        performance: this.performanceForm.value,
        notification: this.notificationForm.value,
        maintenance: this.maintenanceForm.value
      };

      this.isSaving = false;
      this.dialog.closeAll();
    }, 2000);
  }

  refreshData(): void {
    this.loadSettings();
    this.snackBar.open('Settings refreshed', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  exportSettings(): void {
    const settings = {
      general: this.generalForm.value,
      security: this.securityForm.value,
      performance: this.performanceForm.value,
      notification: this.notificationForm.value,
      maintenance: this.maintenanceForm.value,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-settings-${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Settings exported successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  hasSecurityChanges(): boolean {
    const currentSecurity = this.securityForm.value;
    const originalSecurity = this.originalValues.security || {};

    return JSON.stringify(currentSecurity) !== JSON.stringify(originalSecurity);
  }

  getSettingsCount(category: string): number {
    switch (category) {
      case 'general':
        return Object.keys(this.generalForm.controls).length;
      case 'security':
        return Object.keys(this.securityForm.controls).length;
      case 'performance':
        return Object.keys(this.performanceForm.controls).length;
      case 'notifications':
        return Object.keys(this.notificationForm.controls).length;
      default:
        return 0;
    }
  }


  // Reset functions for each form
  resetGeneralSettings(): void {
    this.generalForm.patchValue(this.originalValues.general);
    this.snackBar.open('General settings reset', 'Close', { duration: 2000 });
  }

  resetSecuritySettings(): void {
    this.securityForm.patchValue(this.originalValues.security);
    this.snackBar.open('Security settings reset', 'Close', { duration: 2000 });
  }

  resetPerformanceSettings(): void {
    this.performanceForm.patchValue(this.originalValues.performance);
    this.snackBar.open('Performance settings reset', 'Close', { duration: 2000 });
  }

  resetNotificationSettings(): void {
    this.notificationForm.patchValue(this.originalValues.notification);
    this.snackBar.open('Notification settings reset', 'Close', { duration: 2000 });
  }

  resetMaintenanceSettings(): void {
    this.maintenanceForm.patchValue(this.originalValues.maintenance);
    this.snackBar.open('Maintenance settings reset', 'Close', { duration: 2000 });
  }
}
