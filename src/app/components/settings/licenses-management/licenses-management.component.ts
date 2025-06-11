// components/settings/licenses-management/licenses-management.component.ts
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
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';

interface License {
  id?: number;
  name: string;
  type: 'enterprise' | 'professional' | 'basic' | 'trial';
  status: 'active' | 'expired' | 'suspended' | 'pending';
  license_key: string;
  start_date: string;
  expiry_date: string;
  max_users: number;
  current_users: number;
  features: string[];
  organization: string;
  contact_email: string;
  created_date?: string;
  updated_date?: string;
}

interface Subscription {
  id?: number;
  plan_name: string;
  plan_type: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  price: number;
  currency: string;
  billing_cycle_start: string;
  billing_cycle_end: string;
  next_billing_date: string;
  auto_renew: boolean;
  features: string[];
  usage_metrics?: {
    api_calls: number;
    storage_used: number;
    bandwidth_used: number;
  };
}

@Component({
  selector: 'app-licenses-management',
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
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTabsModule,
    MatMenuTrigger,
    MatMenu
  ],
  template: `
    <div class="licenses-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Licenses & Subscriptions</h1>
            <p>Manage platform licenses, subscriptions, and billing information</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-button (click)="downloadLicenseReport()">
              <mat-icon>download</mat-icon>
              Export Report
            </button>
            <button mat-raised-button color="primary" (click)="openAddLicenseDialog()">
              <mat-icon>add</mat-icon>
              Add License
            </button>
          </div>
        </div>
      </div>

      <!-- Current Plan Overview -->
      <div class="current-plan-section">
        <mat-card class="current-plan-card">
          <div class="plan-header">
            <div class="plan-info">
              <div class="plan-icon">
                <mat-icon>workspace_premium</mat-icon>
              </div>
              <div class="plan-details">
                <h2>{{ currentSubscription?.plan_name || 'No Active Plan' }}</h2>
                <p>{{ getPlanDescription() }}</p>
              </div>
            </div>
            <div class="plan-status" [class]="'status-' + (currentSubscription?.status || 'inactive')">
              {{ formatStatus(currentSubscription?.status || 'inactive') }}
            </div>
          </div>

          <div class="plan-content" *ngIf="currentSubscription">
            <div class="plan-metrics">
              <div class="metric">
                <span class="metric-label">Next Billing</span>
                <span class="metric-value">{{ formatDate(currentSubscription.next_billing_date) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Price</span>
                <span class="metric-value">{{ currentSubscription.price | currency:currentSubscription.currency }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Billing Cycle</span>
                <span class="metric-value">{{ formatBillingCycle(currentSubscription.plan_type) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Auto Renew</span>
                <span class="metric-value">{{ currentSubscription.auto_renew ? 'Yes' : 'No' }}</span>
              </div>
            </div>

            <!-- Usage Metrics -->
            <div class="usage-section" *ngIf="currentSubscription.usage_metrics">
              <h4>Usage This Month</h4>
              <div class="usage-metrics">
                <div class="usage-item">
                  <div class="usage-header">
                    <span>API Calls</span>
                    <span>{{ currentSubscription.usage_metrics.api_calls | number }} / ∞</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="75"></mat-progress-bar>
                </div>
                <div class="usage-item">
                  <div class="usage-header">
                    <span>Storage</span>
                    <span>{{ formatStorage(currentSubscription.usage_metrics.storage_used) }} / 100 GB</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="45"></mat-progress-bar>
                </div>
                <div class="usage-item">
                  <div class="usage-header">
                    <span>Bandwidth</span>
                    <span>{{ formatBandwidth(currentSubscription.usage_metrics.bandwidth_used) }} / 1 TB</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="30"></mat-progress-bar>
                </div>
              </div>
            </div>

            <div class="plan-actions">
              <button mat-button (click)="manageBilling()">
                <mat-icon>payment</mat-icon>
                Manage Billing
              </button>
              <button mat-button (click)="upgradeDowngrade()">
                <mat-icon>upgrade</mat-icon>
                Change Plan
              </button>
            </div>
          </div>

          <div class="no-plan-content" *ngIf="!currentSubscription">
            <div class="no-plan-message">
              <mat-icon>info</mat-icon>
              <h3>No Active Subscription</h3>
              <p>Choose a plan to get started with premium features</p>
              <button mat-raised-button color="primary" (click)="browsePlans()">
                <mat-icon>shopping_cart</mat-icon>
                Browse Plans
              </button>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon licenses-icon">
            <mat-icon>verified</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ licenses.length }}</h3>
            <p>Total Licenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveLicenses().length }}</h3>
            <p>Active Licenses</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon users-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getTotalUsers() }}</h3>
            <p>Licensed Users</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon expiring-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getExpiringLicenses().length }}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading licenses...</p>
      </div>

      <!-- Licenses Content -->
      <div class="licenses-content" *ngIf="!isLoading">
        <mat-tab-group>
          <!-- Licenses Tab -->
          <mat-tab label="Licenses">
            <div class="licenses-grid">
              <mat-card *ngFor="let license of licenses"
                        class="license-card"
                        [class.expired]="isExpired(license.expiry_date)"
                        [class.expiring]="isExpiringSoon(license.expiry_date)">
                <mat-card-header>
                  <div class="license-header">
                    <div class="license-info">
                      <div class="license-icon" [style.background]="getLicenseTypeColor(license.type)">
                        <mat-icon>{{ getLicenseTypeIcon(license.type) }}</mat-icon>
                      </div>
                      <div class="license-details">
                        <h3>{{ license.name }}</h3>
                        <p>{{ license.organization }}</p>
                        <div class="license-type">{{ formatLicenseType(license.type) }}</div>
                      </div>
                    </div>
                    <div class="license-status" [class]="'status-' + license.status">
                      {{ formatStatus(license.status) }}
                    </div>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="license-metrics">
                    <div class="metric-row">
                      <span class="metric-label">Users:</span>
                      <span class="metric-value">{{ license.current_users }} / {{ license.max_users }}</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Expires:</span>
                      <span class="metric-value" [class.expired]="isExpired(license.expiry_date)">
                        {{ formatDate(license.expiry_date) }}
                      </span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Contact:</span>
                      <span class="metric-value">{{ license.contact_email }}</span>
                    </div>
                  </div>

                  <!-- User Usage Progress -->
                  <div class="usage-progress">
                    <div class="progress-header">
                      <span>User Capacity</span>
                      <span>{{ getUserUsagePercentage(license) }}%</span>
                    </div>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="getUserUsagePercentage(license)"
                      [color]="getUserUsagePercentage(license) > 90 ? 'warn' : 'primary'">
                    </mat-progress-bar>
                  </div>

                  <!-- Features -->
                  <div class="license-features">
                    <h5>Included Features</h5>
                    <div class="features-list">
                      <mat-chip *ngFor="let feature of license.features" class="feature-chip">
                        {{ feature }}
                      </mat-chip>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button (click)="viewLicense(license)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button mat-button (click)="editLicense(license)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-button (click)="renewLicense(license)" *ngIf="license.status === 'expired'">
                    <mat-icon>autorenew</mat-icon>
                    Renew
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="licenseMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #licenseMenu="matMenu">
                    <button mat-menu-item (click)="duplicateLicense(license)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <button mat-menu-item (click)="exportLicense(license)">
                      <mat-icon>download</mat-icon>
                      Export
                    </button>
                    <button mat-menu-item (click)="deleteLicense(license)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </mat-card-actions>
              </mat-card>

              <!-- Add License Card -->
              <div class="add-license-card" (click)="openAddLicenseDialog()">
                <mat-icon>add</mat-icon>
                <span>Add New License</span>
              </div>
            </div>

            <!-- Empty State -->
            <div class="empty-state" *ngIf="licenses.length === 0">
              <mat-icon>verified</mat-icon>
              <h3>No licenses found</h3>
              <p>Add your first license to get started</p>
              <button mat-raised-button color="primary" (click)="openAddLicenseDialog()">
                <mat-icon>add</mat-icon>
                Add First License
              </button>
            </div>
          </mat-tab>

          <!-- Billing History Tab -->
          <mat-tab label="Billing History">
            <div class="billing-history">
              <mat-card class="billing-card">
                <mat-card-header>
                  <mat-card-title>Recent Transactions</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="transaction-list">
                    <div class="transaction-item" *ngFor="let transaction of mockTransactions">
                      <div class="transaction-info">
                        <div class="transaction-details">
                          <span class="transaction-description">{{ transaction.description }}</span>
                          <span class="transaction-date">{{ formatDate(transaction.date) }}</span>
                        </div>
                        <div class="transaction-amount" [class]="transaction.type">
                          {{ transaction.type === 'refund' ? '-' : '' }}{{ transaction.amount | currency:'USD' }}
                        </div>
                      </div>
                      <div class="transaction-status" [class]="'status-' + transaction.status">
                        {{ formatStatus(transaction.status) }}
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Add/Edit License Dialog -->
    <ng-template #editLicenseDialog>
      <div mat-dialog-title>{{ editingLicense?.id ? 'Edit' : 'Add' }} License</div>
      <mat-dialog-content>
        <form [formGroup]="licenseForm" class="license-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>License Name</mat-label>
              <input matInput formControlName="name">
              <mat-error *ngIf="licenseForm.get('name')?.hasError('required')">
                License name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>License Type</mat-label>
              <mat-select formControlName="type">
                <mat-option value="trial">Trial</mat-option>
                <mat-option value="basic">Basic</mat-option>
                <mat-option value="professional">Professional</mat-option>
                <mat-option value="enterprise">Enterprise</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>License Key</mat-label>
            <input matInput formControlName="license_key">
            <button mat-icon-button matSuffix (click)="generateLicenseKey()" matTooltip="Generate Key">
              <mat-icon>auto_awesome</mat-icon>
            </button>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Organization</mat-label>
              <input matInput formControlName="organization">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contact Email</mat-label>
              <input matInput type="email" formControlName="contact_email">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="start_date">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Expiry Date</mat-label>
              <input matInput [matDatepicker]="expiryPicker" formControlName="expiry_date">
              <mat-datepicker-toggle matSuffix [for]="expiryPicker"></mat-datepicker-toggle>
              <mat-datepicker #expiryPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Maximum Users</mat-label>
            <input matInput type="number" formControlName="max_users" min="1">
          </mat-form-field>

          <!-- Features Selection -->
          <div class="features-section">
            <h4>Features</h4>
            <div class="features-checkboxes">
              <mat-checkbox *ngFor="let feature of availableFeatures"
                            [checked]="isFeatureSelected(feature)"
                            (change)="toggleFeature(feature, $event.checked)">
                {{ feature }}
              </mat-checkbox>
            </div>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveLicense()"
                [disabled]="!licenseForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingLicense?.id ? 'Update' : 'Add' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .licenses-management {
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

    .current-plan-section {
      margin-bottom: 32px;
    }

    .current-plan-card {
      border-radius: 20px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
    }

    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    .plan-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .plan-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .plan-details h2 {
      margin: 0 0 4px 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .plan-details p {
      margin: 0;
      opacity: 0.9;
    }

    .plan-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.8rem;

      &.status-active { background: rgba(34, 197, 94, 0.2); }
      &.status-trial { background: rgba(245, 158, 11, 0.2); }
      &.status-expired { background: rgba(239, 68, 68, 0.2); }
    }

    .plan-content {
      padding: 0 24px 24px;
    }

    .plan-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-label {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .metric-value {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .usage-section {
      margin-bottom: 24px;
    }

    .usage-section h4 {
      margin: 0 0 16px 0;
      opacity: 0.9;
    }

    .usage-metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .usage-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .usage-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
    }

    .plan-actions {
      display: flex;
      gap: 12px;
    }

    .plan-actions button {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .no-plan-content {
      padding: 40px 24px;
      text-align: center;
    }

    .no-plan-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.8;
      }

      h3 {
        margin: 0;
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        opacity: 0.9;
      }
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.licenses-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.active-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
      &.users-icon { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
      &.expiring-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    }

    .stat-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .stat-content p {
      color: #64748b;
      margin: 4px 0 0 0;
      font-size: 0.9rem;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-section p {
      margin-top: 16px;
      color: #64748b;
    }

    .licenses-content {
      margin-top: 20px;
    }

    .licenses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-top: 20px;
    }

    .license-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      &.expired {
        border-color: #fecaca;
        background: #fef2f2;
      }

      &.expiring {
        border-color: #fed7aa;
        background: #fffbeb;
      }
    }

    .license-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .license-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .license-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .license-details h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
    }

    .license-details p {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .license-type {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
    }

    .license-status {
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;

      &.status-active { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
      &.status-expired { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
      &.status-suspended { background: rgba(245, 158, 11, 0.1); color: #d97706; }
      &.status-pending { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
    }

    .license-metrics {
      margin-bottom: 16px;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .metric-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.9rem;
    }

    .metric-value {
      color: #334155;
      font-size: 0.9rem;

      &.expired {
        color: #dc2626;
        font-weight: 600;
      }
    }

    .usage-progress {
      margin-bottom: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #64748b;
    }

    .license-features h5 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 12px 0;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .feature-chip {
      font-size: 0.75rem;
      height: 24px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .add-license-card {
      border: 2px dashed #e2e8f0;
      border-radius: 16px;
      padding: 60px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #94a3b8;
      background: #fafafa;

      &:hover {
        border-color: #667eea;
        color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      span {
        font-weight: 500;
        font-size: 1.1rem;
      }
    }

    .billing-history {
      margin-top: 20px;
    }

    .billing-card {
      border-radius: 16px;
    }

    .transaction-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
    }

    .transaction-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      margin-right: 16px;
    }

    .transaction-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transaction-description {
      font-weight: 500;
      color: #334155;
    }

    .transaction-date {
      font-size: 0.9rem;
      color: #64748b;
    }

    .transaction-amount {
      font-weight: 600;
      font-size: 1.1rem;

      &.payment { color: #334155; }
      &.refund { color: #dc2626; }
    }

    .transaction-status {
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;

      &.status-completed { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
      &.status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
      &.status-failed { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0 0 8px 0;
        color: #334155;
      }

      p {
        margin: 0 0 24px 0;
      }
    }

    .license-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .features-section {
      margin-top: 16px;
    }

    .features-section h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px 0;
    }

    .features-checkboxes {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    @media (max-width: 768px) {
      .licenses-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .licenses-grid {
        grid-template-columns: 1fr;
      }

      .plan-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .features-checkboxes {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LicensesManagementComponent implements OnInit {
  @ViewChild('editLicenseDialog') editLicenseDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  licenses: License[] = [];
  currentSubscription: Subscription | null = null;

  licenseForm: FormGroup;
  editingLicense: License | null = null;
  selectedFeatures: string[] = [];

  availableFeatures = [
    'API Access',
    'User Management',
    'Advanced Analytics',
    'Custom Branding',
    'Priority Support',
    'SSO Integration',
    'Audit Logs',
    'Custom Workflows',
    'Advanced Security',
    'Multi-tenant Support'
  ];

  mockTransactions = [
    {
      id: 1,
      description: 'Professional Plan - Monthly',
      amount: 99.00,
      date: '2024-06-01T00:00:00Z',
      status: 'completed',
      type: 'payment'
    },
    {
      id: 2,
      description: 'Enterprise Plan - Yearly',
      amount: 1200.00,
      date: '2024-05-15T00:00:00Z',
      status: 'completed',
      type: 'payment'
    },
    {
      id: 3,
      description: 'Refund - Unused Credits',
      amount: 50.00,
      date: '2024-04-20T00:00:00Z',
      status: 'completed',
      type: 'refund'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.licenseForm = this.fb.group({
      name: ['', Validators.required],
      type: ['basic', Validators.required],
      license_key: ['', Validators.required],
      organization: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      start_date: [new Date(), Validators.required],
      expiry_date: [new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), Validators.required],
      max_users: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    // Mock data
    this.currentSubscription = {
      id: 1,
      plan_name: 'Professional Plan',
      plan_type: 'monthly',
      status: 'active',
      price: 99.00,
      currency: 'USD',
      billing_cycle_start: '2024-06-01',
      billing_cycle_end: '2024-07-01',
      next_billing_date: '2024-07-01',
      auto_renew: true,
      features: ['API Access', 'User Management', 'Priority Support'],
      usage_metrics: {
        api_calls: 45000,
        storage_used: 45000000000, // 45GB in bytes
        bandwidth_used: 300000000000 // 300GB in bytes
      }
    };

    this.licenses = [
      {
        id: 1,
        name: 'Production License',
        type: 'enterprise',
        status: 'active',
        license_key: 'ENT-2024-PROD-12345',
        start_date: '2024-01-01',
        expiry_date: '2024-12-31',
        max_users: 100,
        current_users: 75,
        features: ['API Access', 'User Management', 'Advanced Analytics', 'Custom Branding'],
        organization: 'Acme Corporation',
        contact_email: 'admin@acme.com',
        created_date: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Development License',
        type: 'professional',
        status: 'active',
        license_key: 'PRO-2024-DEV-67890',
        start_date: '2024-03-01',
        expiry_date: '2024-09-01',
        max_users: 25,
        current_users: 18,
        features: ['API Access', 'User Management', 'Priority Support'],
        organization: 'Dev Team Inc',
        contact_email: 'dev@devteam.com',
        created_date: '2024-03-01T00:00:00Z'
      }
    ];

    this.isLoading = false;
  }

  openAddLicenseDialog(): void {
    this.editingLicense = null;
    this.licenseForm.reset({
      type: 'basic',
      start_date: new Date(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      max_users: 10
    });
    this.selectedFeatures = [];
    this.openDialog();
  }

  editLicense(license: License): void {
    this.editingLicense = license;
    this.licenseForm.patchValue({
      ...license,
      start_date: new Date(license.start_date),
      expiry_date: new Date(license.expiry_date)
    });
    this.selectedFeatures = [...license.features];
    this.openDialog();
  }

  private openDialog(): void {
    this.dialog.open(this.editLicenseDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  saveLicense(): void {
    if (!this.licenseForm.valid) return;

    this.isSaving = true;
    const licenseData = {
      ...this.licenseForm.value,
      features: this.selectedFeatures,
      start_date: this.licenseForm.value.start_date.toISOString().split('T')[0],
      expiry_date: this.licenseForm.value.expiry_date.toISOString().split('T')[0],
      current_users: 0,
      status: 'active' as const
    };

    // Mock save operation
    setTimeout(() => {
      if (this.editingLicense?.id) {
        const index = this.licenses.findIndex(l => l.id === this.editingLicense!.id);
        if (index !== -1) {
          this.licenses[index] = { ...this.licenses[index], ...licenseData };
        }
      } else {
        const newLicense: License = {
          ...licenseData,
          id: this.licenses.length + 1,
          created_date: new Date().toISOString()
        };
        this.licenses.push(newLicense);
      }

      this.snackBar.open(
        `License ${this.editingLicense?.id ? 'updated' : 'added'} successfully`,
        'Close',
        { duration: 3000 }
      );

      this.dialog.closeAll();
      this.isSaving = false;
    }, 1000);
  }

  generateLicenseKey(): void {
    const typePrefix = this.licenseForm.value.type?.toUpperCase().slice(0, 3) || 'LIC';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const key = `${typePrefix}-${year}-${random}`;
    this.licenseForm.patchValue({ license_key: key });
  }

  viewLicense(license: License): void {
    this.snackBar.open(`Viewing details for ${license.name}`, 'Close', { duration: 2000 });
  }

  renewLicense(license: License): void {
    if (confirm(`Renew license "${license.name}" for another year?`)) {
      const renewedExpiry = new Date(license.expiry_date);
      renewedExpiry.setFullYear(renewedExpiry.getFullYear() + 1);

      license.expiry_date = renewedExpiry.toISOString().split('T')[0];
      license.status = 'active';

      this.snackBar.open('License renewed successfully', 'Close', { duration: 3000 });
    }
  }

  duplicateLicense(license: License): void {
    const duplicated: License = {
      ...license,
      id: undefined,
      name: license.name + ' (Copy)',
      license_key: '',
      current_users: 0,
      created_date: undefined
    };

    this.editingLicense = null;
    this.licenseForm.patchValue({
      ...duplicated,
      start_date: new Date(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    this.selectedFeatures = [...license.features];
    this.generateLicenseKey();
    this.openDialog();
  }

  exportLicense(license: License): void {
    this.snackBar.open(`Exporting license ${license.name}...`, 'Close', { duration: 2000 });
  }

  deleteLicense(license: License): void {
    if (confirm(`Are you sure you want to delete "${license.name}"?`)) {
      this.licenses = this.licenses.filter(l => l.id !== license.id);
      this.snackBar.open('License deleted successfully', 'Close', { duration: 3000 });
    }
  }

  // Plan management
  manageBilling(): void {
    this.snackBar.open('Redirecting to billing portal...', 'Close', { duration: 2000 });
  }

  upgradeDowngrade(): void {
    this.snackBar.open('Plan change functionality coming soon', 'Close', { duration: 3000 });
  }

  browsePlans(): void {
    this.snackBar.open('Browse plans functionality coming soon', 'Close', { duration: 3000 });
  }

  downloadLicenseReport(): void {
    this.snackBar.open('Generating license report...', 'Close', { duration: 2000 });
  }

  refreshData(): void {
    this.loadData();
  }

  // Feature management
  isFeatureSelected(feature: string): boolean {
    return this.selectedFeatures.includes(feature);
  }

  toggleFeature(feature: string, checked: boolean): void {
    if (checked) {
      this.selectedFeatures.push(feature);
    } else {
      this.selectedFeatures = this.selectedFeatures.filter(f => f !== feature);
    }
  }

  // Utility methods
  getActiveLicenses(): License[] {
    return this.licenses.filter(l => l.status === 'active');
  }

  getTotalUsers(): number {
    return this.licenses.reduce((total, license) => total + license.current_users, 0);
  }

  getExpiringLicenses(): License[] {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.licenses.filter(license => {
      const expiryDate = new Date(license.expiry_date);
      return expiryDate <= thirtyDaysFromNow && license.status === 'active';
    });
  }

  isExpired(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  isExpiringSoon(dateString: string): boolean {
    const expiryDate = new Date(dateString);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  }

  getUserUsagePercentage(license: License): number {
    return Math.round((license.current_users / license.max_users) * 100);
  }

  getLicenseTypeIcon(type: string): string {
    const icons = {
      enterprise: 'business',
      professional: 'work',
      basic: 'person',
      trial: 'schedule'
    };
    return icons[type as keyof typeof icons] || 'verified';
  }

  getLicenseTypeColor(type: string): string {
    const colors = {
      enterprise: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      professional: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      basic: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
      trial: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    };
    return colors[type as keyof typeof colors] || 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
  }

  formatLicenseType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatBillingCycle(type: string): string {
    const cycles = {
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime'
    };
    return cycles[type as keyof typeof cycles] || type;
  }

  formatStorage(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  }

  formatBandwidth(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  }

  getPlanDescription(): string {
    if (!this.currentSubscription) return 'No active subscription';
    return `${this.formatBillingCycle(this.currentSubscription.plan_type)} billing • ${this.currentSubscription.features.length} features included`;
  }
}
