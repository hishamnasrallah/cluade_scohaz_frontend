// components/settings/system-settings/system-settings.component.ts - NEW COMPONENT
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
    MatExpansionModule
  ],
  template: `
    <div class="system-settings">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>System Settings</h1>
            <p>Configure global system settings, security, and platform preferences</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-button (click)="exportSettings()">
              <mat-icon>download</mat-icon>
              Export
            </button>
            <button mat-raised-button color="primary" (click)="saveAllSettings()" [disabled]="isSaving">
              <mat-icon>save</mat-icon>
              Save All Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Categories -->
      <div class="settings-content">
        <mat-tab-group animationDuration="300ms">
          <!-- General Settings Tab -->
          <mat-tab label="General Settings">
            <div class="tab-content">
              <mat-card class="settings-category-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>tune</mat-icon>
                    Application Configuration
                  </mat-card-title>
                  <mat-card-subtitle>Basic platform settings and configurations</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="generalForm" class="settings-form">
                    <div class="form-group">
                      <h4>Platform Information</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Platform Name</mat-label>
                          <input matInput formControlName="platform_name">
                          <mat-hint>Display name for your platform</mat-hint>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Platform Version</mat-label>
                          <input matInput formControlName="platform_version" readonly>
                          <mat-hint>Current platform version</mat-hint>
                        </mat-form-field>
                      </div>
                      <mat-form-field appearance="outline">
                        <mat-label>Platform Description</mat-label>
                        <textarea matInput formControlName="platform_description" rows="3"></textarea>
                      </mat-form-field>
                    </div>

                    <div class="form-group">
                      <h4>Regional Settings</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Default Language</mat-label>
                          <mat-select formControlName="default_language">
                            <mat-option value="en">English</mat-option>
                            <mat-option value="ar">Arabic</mat-option>
                            <mat-option value="fr">French</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Default Timezone</mat-label>
                          <mat-select formControlName="default_timezone">
                            <mat-option value="UTC">UTC</mat-option>
                            <mat-option value="Asia/Dubai">Dubai</mat-option>
                            <mat-option value="Asia/Riyadh">Riyadh</mat-option>
                            <mat-option value="America/New_York">New York</mat-option>
                            <mat-option value="Europe/London">London</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Date Format</mat-label>
                          <mat-select formControlName="date_format">
                            <mat-option value="YYYY-MM-DD">YYYY-MM-DD</mat-option>
                            <mat-option value="DD/MM/YYYY">DD/MM/YYYY</mat-option>
                            <mat-option value="MM/DD/YYYY">MM/DD/YYYY</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Currency</mat-label>
                          <mat-select formControlName="default_currency">
                            <mat-option value="USD">USD - US Dollar</mat-option>
                            <mat-option value="EUR">EUR - Euro</mat-option>
                            <mat-option value="AED">AED - UAE Dirham</mat-option>
                            <mat-option value="SAR">SAR - Saudi Riyal</mat-option>
                            <mat-option value="JOD">JOD - Jordanian Dinar</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>System Limits</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Max Upload Size (MB)</mat-label>
                          <input matInput type="number" formControlName="max_upload_size">
                          <mat-hint>Maximum file upload size in megabytes</mat-hint>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Session Timeout (minutes)</mat-label>
                          <input matInput type="number" formControlName="session_timeout">
                        </mat-form-field>
                      </div>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Security Settings Tab -->
          <mat-tab label="Security">
            <div class="tab-content">
              <mat-card class="settings-category-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>security</mat-icon>
                    Security Configuration
                  </mat-card-title>
                  <mat-card-subtitle>Authentication, authorization, and security policies</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="securityForm" class="settings-form">
                    <div class="form-group">
                      <h4>Authentication Settings</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Two-Factor Authentication</h5>
                            <p>Require 2FA for all users</p>
                          </div>
                          <mat-slide-toggle formControlName="require_2fa"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Single Sign-On (SSO)</h5>
                            <p>Enable SSO integration</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_sso"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Account Lockout</h5>
                            <p>Lock accounts after failed login attempts</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_account_lockout"></mat-slide-toggle>
                        </div>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Password Min Length</mat-label>
                          <input matInput type="number" formControlName="password_min_length" min="6" max="50">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Max Failed Attempts</mat-label>
                          <input matInput type="number" formControlName="max_failed_attempts" min="3" max="10">
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Data Protection</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Data Encryption at Rest</h5>
                            <p>Encrypt sensitive data in database</p>
                          </div>
                          <mat-slide-toggle formControlName="encrypt_data_at_rest"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Audit Logging</h5>
                            <p>Log all user activities and changes</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_audit_logging"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>IP Restriction</h5>
                            <p>Restrict access by IP address</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_ip_restriction"></mat-slide-toggle>
                        </div>
                      </div>
                    </div>

                    <div class="form-group" *ngIf="securityForm.get('enable_ip_restriction')?.value">
                      <h4>Allowed IP Addresses</h4>
                      <mat-form-field appearance="outline">
                        <mat-label>IP Whitelist</mat-label>
                        <textarea matInput formControlName="allowed_ips"
                                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                                  rows="4"></textarea>
                        <mat-hint>Enter IP addresses or CIDR blocks, one per line</mat-hint>
                      </mat-form-field>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Performance Settings Tab -->
          <mat-tab label="Performance">
            <div class="tab-content">
              <mat-card class="settings-category-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>speed</mat-icon>
                    Performance Configuration
                  </mat-card-title>
                  <mat-card-subtitle>Caching, optimization, and performance settings</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="performanceForm" class="settings-form">
                    <div class="form-group">
                      <h4>Caching Settings</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Enable Redis Caching</h5>
                            <p>Use Redis for session and data caching</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_redis_cache"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Database Query Caching</h5>
                            <p>Cache frequently used database queries</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_query_cache"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Static File Caching</h5>
                            <p>Enable browser caching for static assets</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_static_cache"></mat-slide-toggle>
                        </div>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Cache TTL (seconds)</mat-label>
                          <input matInput type="number" formControlName="cache_ttl" min="60" max="86400">
                          <mat-hint>Time to live for cached data</mat-hint>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Query Cache Size (MB)</mat-label>
                          <input matInput type="number" formControlName="query_cache_size" min="50" max="1000">
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Rate Limiting</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>API Rate Limit (requests/minute)</mat-label>
                          <input matInput type="number" formControlName="api_rate_limit" min="10" max="10000">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Burst Limit</mat-label>
                          <input matInput type="number" formControlName="burst_limit" min="5" max="100">
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Database Settings</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Connection Pool Size</mat-label>
                          <input matInput type="number" formControlName="db_pool_size" min="5" max="100">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Query Timeout (seconds)</mat-label>
                          <input matInput type="number" formControlName="query_timeout" min="5" max="300">
                        </mat-form-field>
                      </div>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Notifications Tab -->
          <mat-tab label="Notifications">
            <div class="tab-content">
              <mat-card class="settings-category-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>notifications</mat-icon>
                    Notification Settings
                  </mat-card-title>
                  <mat-card-subtitle>Email, SMS, and push notification configuration</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="notificationForm" class="settings-form">
                    <div class="form-group">
                      <h4>Email Configuration</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Enable Email Notifications</h5>
                            <p>Send system notifications via email</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_email_notifications"></mat-slide-toggle>
                        </div>
                      </div>

                      <div class="form-row" *ngIf="notificationForm.get('enable_email_notifications')?.value">
                        <mat-form-field appearance="outline">
                          <mat-label>SMTP Server</mat-label>
                          <input matInput formControlName="smtp_server">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>SMTP Port</mat-label>
                          <input matInput type="number" formControlName="smtp_port">
                        </mat-form-field>
                      </div>

                      <div class="form-row" *ngIf="notificationForm.get('enable_email_notifications')?.value">
                        <mat-form-field appearance="outline">
                          <mat-label>SMTP Username</mat-label>
                          <input matInput formControlName="smtp_username">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>From Email</mat-label>
                          <input matInput type="email" formControlName="from_email">
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Notification Types</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>User Registration</h5>
                            <p>Notify admins of new user registrations</p>
                          </div>
                          <mat-slide-toggle formControlName="notify_user_registration"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>System Errors</h5>
                            <p>Send alerts for system errors and failures</p>
                          </div>
                          <mat-slide-toggle formControlName="notify_system_errors"></mat-slide-toggle>
                        </div>
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Security Events</h5>
                            <p>Alert on security-related events</p>
                          </div>
                          <mat-slide-toggle formControlName="notify_security_events"></mat-slide-toggle>
                        </div>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Admin Notification Recipients</h4>
                      <mat-form-field appearance="outline">
                        <mat-label>Admin Email Addresses</mat-label>
                        <textarea matInput formControlName="admin_emails"
                                  placeholder="admin1@example.com&#10;admin2@example.com"
                                  rows="3"></textarea>
                        <mat-hint>Enter email addresses, one per line</mat-hint>
                      </mat-form-field>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Backup & Maintenance Tab -->
          <mat-tab label="Backup & Maintenance">
            <div class="tab-content">
              <mat-card class="settings-category-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>backup</mat-icon>
                    Backup & Maintenance
                  </mat-card-title>
                  <mat-card-subtitle>Backup schedules, maintenance windows, and data retention</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="maintenanceForm" class="settings-form">
                    <div class="form-group">
                      <h4>Backup Configuration</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Automated Backups</h5>
                            <p>Enable scheduled database backups</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_auto_backup"></mat-slide-toggle>
                        </div>
                      </div>

                      <div class="form-row" *ngIf="maintenanceForm.get('enable_auto_backup')?.value">
                        <mat-form-field appearance="outline">
                          <mat-label>Backup Frequency</mat-label>
                          <mat-select formControlName="backup_frequency">
                            <mat-option value="daily">Daily</mat-option>
                            <mat-option value="weekly">Weekly</mat-option>
                            <mat-option value="monthly">Monthly</mat-option>
                          </mat-select>
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Backup Retention (days)</mat-label>
                          <input matInput type="number" formControlName="backup_retention_days" min="1" max="365">
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Maintenance Windows</h4>
                      <div class="toggle-settings">
                        <div class="toggle-item">
                          <div class="toggle-info">
                            <h5>Scheduled Maintenance</h5>
                            <p>Enable automatic maintenance tasks</p>
                          </div>
                          <mat-slide-toggle formControlName="enable_maintenance_mode"></mat-slide-toggle>
                        </div>
                      </div>

                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Log Retention (days)</mat-label>
                          <input matInput type="number" formControlName="log_retention_days" min="7" max="365">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Cleanup Frequency</mat-label>
                          <mat-select formControlName="cleanup_frequency">
                            <mat-option value="daily">Daily</mat-option>
                            <mat-option value="weekly">Weekly</mat-option>
                            <mat-option value="monthly">Monthly</mat-option>
                          </mat-select>
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="form-group">
                      <h4>Storage Management</h4>
                      <div class="form-row">
                        <mat-form-field appearance="outline">
                          <mat-label>Max Storage per User (GB)</mat-label>
                          <input matInput type="number" formControlName="max_storage_per_user" min="1" max="1000">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Temp File Cleanup (hours)</mat-label>
                          <input matInput type="number" formControlName="temp_file_cleanup_hours" min="1" max="168">
                        </mat-form-field>
                      </div>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Save Changes Dialog -->
      <ng-template #saveDialog>
        <div mat-dialog-title>Save System Settings</div>
        <mat-dialog-content>
          <p>Are you sure you want to save all changes? Some settings may require a system restart to take effect.</p>
          <div class="warning-message" *ngIf="hasSecurityChanges()">
            <mat-icon>warning</mat-icon>
            <span>Security settings have been modified. Please review carefully before saving.</span>
          </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Cancel</button>
          <button mat-raised-button color="primary" (click)="confirmSave()" [disabled]="isSaving">
            <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
            <span *ngIf="!isSaving">Save Changes</span>
          </button>
        </mat-dialog-actions>
      </ng-template>
    </div>
  `,
  styles: [`
    .system-settings {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-text h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .header-text p {
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .settings-content {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 24px;
    }

    .settings-category-card {
      border: none;
      box-shadow: none;
      background: transparent;
    }

    .settings-category-card mat-card-header {
      margin-bottom: 24px;
    }

    .settings-category-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: #334155;
    }

    .settings-category-card mat-card-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 4px;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      margin: 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .toggle-settings {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 16px 0;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .toggle-info h5 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 4px 0;
    }

    .toggle-info p {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    .warning-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      color: #d97706;
      font-size: 0.9rem;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .system-settings {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .toggle-item {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
        gap: 12px;
      }

      .tab-content {
        padding: 16px;
      }
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  @ViewChild('saveDialog') saveDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;

  generalForm: FormGroup;
  securityForm: FormGroup;
  performanceForm: FormGroup;
  notificationForm: FormGroup;
  maintenanceForm: FormGroup;

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
      platform_name: ['LowCode Pro'],
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
      width: '500px'
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
    this.snackBar.open('Settings refreshed', 'Close', { duration: 2000 });
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

    this.snackBar.open('Settings exported successfully', 'Close', { duration: 3000 });
  }

  hasSecurityChanges(): boolean {
    const currentSecurity = this.securityForm.value;
    const originalSecurity = this.originalValues.security || {};

    return JSON.stringify(currentSecurity) !== JSON.stringify(originalSecurity);
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
