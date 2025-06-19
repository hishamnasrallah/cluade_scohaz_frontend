// components/settings/version-control/version-control.component.ts
import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Version {
  id?: number;
  version_number: string;
  operating_system: 'IOS' | 'Android' | null;
  _environment: '0' | '1' | '2' | '3' | null;
  backend_endpoint: string;
  active_ind: boolean;
  expiration_date: string | null;
  created_date?: string;
  updated_date?: string;
}

interface VersionResponse {
  count: number;
  results: Version[];
}

@Component({
  selector: 'app-version-control',
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
    MatNativeDateModule
  ],
  template: `
    <div class="version-control">
      <!-- Compact Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-icon">
              <mat-icon>layers</mat-icon>
            </div>
            <div>
              <h1>Version Control</h1>
              <p>Manage application versions, environments, and deployment settings</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-icon-button
                    (click)="handleRefresh($event)"
                    class="refresh-btn"
                    matTooltip="Refresh"
                    [disabled]="isProcessing">
              <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
            </button>
            <button mat-raised-button
                    (click)="handleCreate($event)"
                    class="create-btn">
              <mat-icon>add</mat-icon>
              New Version
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>layers</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ versions.length }}</h3>
            <p>Total Versions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveVersions().length }}</h3>
            <p>Active</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon environments-icon">
            <mat-icon>cloud</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueEnvironments().length }}</h3>
            <p>Environments</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon platforms-icon">
            <mat-icon>devices</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniquePlatforms().length }}</h3>
            <p>Platforms</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading versions...</p>
      </div>

      <!-- Error State -->
      <div class="error-section" *ngIf="errorMessage && !isLoading">
        <div class="error-content">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>Unable to Load Versions</h3>
          <p>{{ errorMessage }}</p>
          <button mat-raised-button color="primary" (click)="handleRefresh($event)">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      </div>

      <!-- Versions by Environment -->
      <div class="versions-content" *ngIf="!isLoading && !errorMessage">
        <div class="environment-section" *ngFor="let env of getEnvironmentGroups(); trackBy: trackByEnvironment">
          <div class="environment-header">
            <div class="env-info">
              <div class="env-icon" [style.background]="getEnvironmentColor(env.key)">
                <mat-icon>{{ getEnvironmentIcon(env.key) }}</mat-icon>
              </div>
              <div class="env-details">
                <h3>{{ getEnvironmentName(env.key) }}</h3>
                <p>{{ env.versions.length }} version{{ env.versions.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <div class="env-actions">
              <button mat-button (click)="handleDeploy($event, env.key)">
                <mat-icon>publish</mat-icon>
                Deploy
              </button>
            </div>
          </div>

          <div class="versions-grid">
            <mat-card *ngFor="let version of env.versions; trackBy: trackByVersion"
                      class="version-card"
                      [class.inactive]="!version.active_ind"
                      [class.expired]="isExpired(version)">
              <mat-card-header>
                <div class="version-header">
                  <div class="version-info">
                    <h4>{{ version.version_number || 'No Version' }}</h4>
                    <div class="version-meta">
                      <span class="platform-chip" *ngIf="version.operating_system"
                            [style.background]="getPlatformColor(version.operating_system)">
                        {{ version.operating_system }}
                      </span>
                      <span class="status-chip" [class]="getStatusClass(version)">
                        {{ getVersionStatus(version) }}
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="version-actions">
                    <!-- Edit Button -->
                    <button type="button"
                            mat-icon-button
                            matTooltip="Edit Version"
                            [disabled]="isProcessing"
                            (click)="handleEdit($event, version)"
                            class="action-btn edit-btn">
                      <mat-icon>edit</mat-icon>
                    </button>

                    <!-- Toggle Status Button -->
                    <button type="button"
                            mat-icon-button
                            [matTooltip]="version.active_ind ? 'Deactivate Version' : 'Activate Version'"
                            [disabled]="isProcessing"
                            (click)="handleToggle($event, version)"
                            class="action-btn toggle-btn">
                      <mat-icon>{{ version.active_ind ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>

                    <!-- Duplicate Button -->
                    <button type="button"
                            mat-icon-button
                            matTooltip="Duplicate Version"
                            [disabled]="isProcessing"
                            (click)="handleDuplicate($event, version)"
                            class="action-btn duplicate-btn">
                      <mat-icon>content_copy</mat-icon>
                    </button>

                    <!-- Delete Button -->
                    <button type="button"
                            mat-icon-button
                            matTooltip="Delete Version"
                            [disabled]="isProcessing"
                            (click)="handleDelete($event, version)"
                            class="action-btn delete-btn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card-header>

              <mat-card-content>
                <div class="version-details">
                  <div class="detail-row" *ngIf="version.backend_endpoint">
                    <span class="detail-label">Endpoint:</span>
                    <span class="detail-value endpoint" [title]="version.backend_endpoint">
                      {{ version.backend_endpoint }}
                    </span>
                  </div>
                  <div class="detail-row" *ngIf="version.expiration_date">
                    <span class="detail-label">Expires:</span>
                    <span class="detail-value" [class.expired]="isExpired(version)">
                      {{ formatDate(version.expiration_date) }}
                    </span>
                  </div>
                  <div class="detail-row" *ngIf="version.created_date">
                    <span class="detail-label">Created:</span>
                    <span class="detail-value">{{ formatDate(version.created_date) }}</span>
                  </div>
                </div>
              </mat-card-content>

              <!-- Status Indicator -->
              <div class="version-status-bar" [style.background]="getVersionStatusColor(version)"></div>
            </mat-card>

            <!-- Add Version Card -->
            <div class="add-version-card" (click)="handleCreateForEnv($event, env.key)">
              <mat-icon>add</mat-icon>
              <span>Add Version</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="versions.length === 0">
          <mat-icon>layers</mat-icon>
          <h3>No versions found</h3>
          <p>Start by creating your first application version</p>
          <button mat-raised-button color="primary" (click)="handleCreate($event)">
            <mat-icon>add</mat-icon>
            Create First Version
          </button>
        </div>
      </div>

      <!-- Processing Overlay -->
      <div class="processing-overlay" *ngIf="isProcessing">
        <mat-spinner diameter="40"></mat-spinner>
        <p>{{ processingMessage }}</p>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <ng-template #editDialog>
      <div mat-dialog-title>{{ editingVersion?.id ? 'Edit' : 'Create' }} Version</div>
      <mat-dialog-content>
        <form [formGroup]="versionForm" class="version-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Version Number</mat-label>
              <input matInput formControlName="version_number" placeholder="1.0.0">
              <mat-hint>Semantic versioning recommended (major.minor.patch)</mat-hint>
              <mat-error *ngIf="versionForm.get('version_number')?.hasError('required')">
                Version number is required
              </mat-error>
              <mat-error *ngIf="versionForm.get('version_number')?.hasError('pattern')">
                Please use semantic versioning format (e.g., 1.0.0)
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Environment</mat-label>
              <mat-select formControlName="_environment">
                <mat-option value="3">Local</mat-option>
                <mat-option value="2">Development</mat-option>
                <mat-option value="0">Staging</mat-option>
                <mat-option value="1">Production</mat-option>
              </mat-select>
              <mat-error *ngIf="versionForm.get('_environment')?.hasError('required')">
                Environment is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Operating System</mat-label>
              <mat-select formControlName="operating_system">
                <mat-option [value]="null">All Platforms</mat-option>
                <mat-option value="Android">Android</mat-option>
                <mat-option value="IOS">iOS</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Expiration Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="expiration_date">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-hint>Optional: When this version should expire</mat-hint>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Backend Endpoint</mat-label>
            <input matInput formControlName="backend_endpoint" placeholder="https://api.example.com">
            <mat-hint>Backend API endpoint for this version</mat-hint>
            <mat-error *ngIf="versionForm.get('backend_endpoint')?.hasError('pattern')">
              Please enter a valid URL
            </mat-error>
          </mat-form-field>

          <mat-checkbox formControlName="active_ind" class="active-checkbox">
            Active Version
          </mat-checkbox>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="handleDialogCancel($event)">Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="handleSave($event)"
                [disabled]="!versionForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingVersion?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .version-control {
      padding: 16px;
      max-width: 1400px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
      position: relative;
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

    .header-text {
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

    .create-btn {
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(52, 197, 170, 0.2);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    /* Compact Stats */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

      &.total-icon { background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%); }
      &.active-icon { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }
      &.environments-icon { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
      &.platforms-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }

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

    .loading-section, .error-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-section p {
      margin-top: 16px;
      color: #6B7280;
    }

    .error-content {
      max-width: 400px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #EF4444;
    }

    .error-content h3 {
      font-size: 1.25rem;
      margin: 0 0 8px 0;
      color: #2F4858;
    }

    .error-content p {
      margin: 0 0 24px 0;
      color: #6B7280;
    }

    .versions-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .environment-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .environment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(196, 247, 239, 0.5);
    }

    .env-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .env-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .env-details h3 {
      margin: 0 0 2px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2F4858;
    }

    .env-details p {
      margin: 0;
      color: #6B7280;
      font-size: 0.8rem;
    }

    .env-actions button {
      color: #6B7280;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
        color: #34C5AA;
      }
    }

    .versions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .version-card {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
      background: white;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(47, 72, 88, 0.08);
        border-color: rgba(52, 197, 170, 0.3);
      }

      &.inactive {
        opacity: 0.6;
      }

      &.expired {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.03);
      }

      mat-card-header {
        padding: 12px !important;
      }

      mat-card-content {
        padding: 0 12px 12px !important;
      }
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .version-info h4 {
      margin: 0 0 6px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2F4858;
    }

    .version-meta {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .platform-chip, .status-chip {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }

    .status-chip {
      &.active { background: #22C55E; }
      &.inactive { background: #6B7280; }
      &.expired { background: #EF4444; }
    }

    /* Action Buttons */
    .version-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      padding: 0 !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
      position: relative !important;
      z-index: 10 !important;

      &:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }

      &:active {
        transform: translateY(0) !important;
      }

      &:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        transform: none !important;
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.edit-btn:hover { background: rgba(59, 130, 246, 0.1) !important; color: #3B82F6 !important; }
      &.toggle-btn:hover { background: rgba(245, 158, 11, 0.1) !important; color: #F59E0B !important; }
      &.duplicate-btn:hover { background: rgba(34, 197, 94, 0.1) !important; color: #22C55E !important; }
      &.delete-btn:hover { background: rgba(239, 68, 68, 0.1) !important; color: #EF4444 !important; }
    }

    .version-details {
      margin-top: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(196, 247, 239, 0.3);

      &:last-child {
        border-bottom: none;
      }
    }

    .detail-label {
      font-weight: 500;
      color: #6B7280;
      font-size: 0.85rem;
    }

    .detail-value {
      color: #2F4858;
      font-size: 0.85rem;

      &.endpoint {
        font-family: monospace;
        background: rgba(196, 247, 239, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &.expired {
        color: #EF4444;
        font-weight: 600;
      }
    }

    .version-status-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .add-version-card {
      border: 2px dashed #E5E7EB;
      border-radius: 10px;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #9CA3AF;
      background: rgba(196, 247, 239, 0.05);

      &:hover {
        border-color: #34C5AA;
        color: #34C5AA;
        background: rgba(196, 247, 239, 0.1);
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      span {
        font-weight: 500;
        font-size: 0.9rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #6B7280;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #9CA3AF;
      }

      h3 {
        font-size: 1.25rem;
        margin: 0 0 8px 0;
        color: #2F4858;
      }

      p {
        margin: 0 0 24px 0;
      }
    }

    .version-form {
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

    .active-checkbox {
      margin-top: 8px;
    }

    /* Processing Overlay */
    .processing-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;

      p {
        margin-top: 16px;
        font-size: 1rem;
        font-weight: 500;
      }
    }

    @media (max-width: 768px) {
      .version-control {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-text {
        justify-content: center;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .versions-grid {
        grid-template-columns: 1fr;
      }

      .environment-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .version-actions {
        gap: 2px;
      }
    }
  `]
})
export class VersionControlComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  isProcessing = false;
  processingMessage = '';
  versions: Version[] = [];
  errorMessage: string = '';

  versionForm!: FormGroup;
  editingVersion: Version | null = null;

  private environmentConfig = {
    '0': { name: 'Staging', icon: 'settings', color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' },
    '1': { name: 'Production', icon: 'public', color: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' },
    '2': { name: 'Development', icon: 'code', color: 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)' },
    '3': { name: 'Local', icon: 'computer', color: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' }
  };

  private platformConfig = {
    'Android': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    'IOS': 'linear-gradient(135deg, #000000 0%, #434343 100%)'
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadVersions();
  }

  private initializeForm(): void {
    const urlPattern = /^https?:\/\/.+/;
    const versionPattern = /^\d+\.\d+\.\d+$/;

    this.versionForm = this.fb.group({
      version_number: ['', [Validators.required, Validators.pattern(versionPattern)]],
      operating_system: [null],
      _environment: ['', Validators.required],
      backend_endpoint: ['', [Validators.pattern(urlPattern)]],
      active_ind: [true],
      expiration_date: [null]
    });
  }

  // Event Handlers
  handleEdit(event: Event, version: Version): void {
    this.stopEvent(event);
    this.performAction('edit', version);
  }

  handleToggle(event: Event, version: Version): void {
    this.stopEvent(event);
    this.performAction('toggle', version);
  }

  handleDuplicate(event: Event, version: Version): void {
    this.stopEvent(event);
    this.performAction('duplicate', version);
  }

  handleDelete(event: Event, version: Version): void {
    this.stopEvent(event);
    this.performAction('delete', version);
  }

  handleCreate(event: Event): void {
    this.stopEvent(event);
    this.performAction('create');
  }

  handleCreateForEnv(event: Event, environment: string): void {
    this.stopEvent(event);
    this.performAction('createForEnv', null, environment);
  }

  handleRefresh(event: Event): void {
    this.stopEvent(event);
    this.performAction('refresh');
  }

  handleDeploy(event: Event, environment: string): void {
    this.stopEvent(event);
    this.performAction('deploy', null, environment);
  }

  handleSave(event: Event): void {
    this.stopEvent(event);
    this.performAction('save');
  }

  handleDialogCancel(event: Event): void {
    this.stopEvent(event);
    this.dialog.closeAll();
    this.editingVersion = null;
    this.forceUpdate();
  }

  private stopEvent(event: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  private async performAction(action: string, version?: Version | null, param?: string): Promise<void> {
    if (this.isProcessing) {
      console.log('Action blocked - already processing');
      return;
    }

    console.log(`Performing action: ${action}`, { version, param });

    this.ngZone.run(() => {
      this.isProcessing = true;
      this.processingMessage = this.getProcessingMessage(action);
      this.forceUpdate();
    });

    try {
      switch (action) {
        case 'edit':
          if (version) await this.editVersion(version);
          break;
        case 'toggle':
          if (version) await this.toggleVersionStatus(version);
          break;
        case 'duplicate':
          if (version) await this.duplicateVersion(version);
          break;
        case 'delete':
          if (version) await this.deleteVersion(version);
          break;
        case 'create':
          this.openCreateDialog();
          break;
        case 'createForEnv':
          if (param) this.createVersionForEnvironment(param);
          break;
        case 'refresh':
          await this.loadVersions();
          break;
        case 'deploy':
          if (param) this.deployToEnvironment(param);
          break;
        case 'save':
          await this.saveVersion();
          break;
      }
    } catch (error) {
      console.error(`Error in action ${action}:`, error);
      this.showError(`Error in ${action}: ${error}`);
    } finally {
      this.ngZone.run(() => {
        this.isProcessing = false;
        this.processingMessage = '';
        this.forceUpdate();
      });
    }
  }

  private getProcessingMessage(action: string): string {
    const messages: { [key: string]: string } = {
      'edit': 'Opening editor...',
      'toggle': 'Updating status...',
      'duplicate': 'Duplicating version...',
      'delete': 'Deleting version...',
      'refresh': 'Loading versions...',
      'save': 'Saving version...',
      'deploy': 'Starting deployment...'
    };
    return messages[action] || 'Processing...';
  }

  private forceUpdate(): void {
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // Core Business Logic
  loadVersions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.errorMessage = '';
      const baseUrl = this.configService.getBaseUrl();

      const possibleEndpoints = [
        '/version/versions/',
        '/api/version/versions/',
        '/api/versions/',
        '/versions/'
      ];

      this.tryEndpoints(possibleEndpoints, 0, resolve, reject);
    });
  }

  private tryEndpoints(endpoints: string[], index: number, resolve: Function, reject: Function): void {
    if (index >= endpoints.length) {
      this.isLoading = false;
      this.errorMessage = 'Version control API endpoint not found. Please check your backend configuration.';
      this.forceUpdate();
      reject(new Error(this.errorMessage));
      return;
    }

    const baseUrl = this.configService.getBaseUrl();
    const endpoint = endpoints[index];

    this.http.get<VersionResponse>(`${baseUrl}${endpoint}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Endpoint ${endpoint} failed:`, error);
          if (index < endpoints.length - 1) {
            this.tryEndpoints(endpoints, index + 1, resolve, reject);
          } else {
            this.isLoading = false;
            this.errorMessage = this.getErrorMessage(error);
            this.forceUpdate();
            reject(error);
          }
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.versions = response.results || [];
            this.isLoading = false;
            this.errorMessage = '';
            localStorage.setItem('version_endpoint', endpoint);
            this.forceUpdate();
            resolve(undefined);
          }
        }
      });
  }

  private getVersionEndpoint(): string {
    return localStorage.getItem('version_endpoint') || '/version/versions/';
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection and backend server.';
    } else if (error.status === 401) {
      return 'Authentication failed. Please login again.';
    } else if (error.status === 403) {
      return 'Access denied. You do not have permission to access version control.';
    } else if (error.status === 404) {
      return 'Version control API not found. Please contact your administrator.';
    } else {
      return `Server error (${error.status}): ${error.message}`;
    }
  }

  async editVersion(version: Version): Promise<void> {
    try {
      this.editingVersion = { ...version };
      this.versionForm.reset();
      this.versionForm.patchValue({
        version_number: version.version_number || '',
        operating_system: version.operating_system,
        _environment: version._environment || '',
        backend_endpoint: version.backend_endpoint || '',
        active_ind: version.active_ind !== undefined ? version.active_ind : true,
        expiration_date: version.expiration_date ? new Date(version.expiration_date) : null
      });
      this.openDialog();
    } catch (error) {
      throw new Error(`Failed to edit version: ${error}`);
    }
  }

  openCreateDialog(): void {
    this.editingVersion = null;
    this.versionForm.reset({ active_ind: true });
    this.openDialog();
  }

  createVersionForEnvironment(environment: string): void {
    this.editingVersion = null;
    this.versionForm.reset({
      version_number: '',
      operating_system: null,
      _environment: environment,
      backend_endpoint: '',
      active_ind: true,
      expiration_date: null
    });
    this.openDialog();
  }

  async duplicateVersion(version: Version): Promise<void> {
    try {
      this.editingVersion = null;
      const nextVersion = this.generateNextVersion(version.version_number);

      this.versionForm.reset();
      this.versionForm.patchValue({
        version_number: nextVersion,
        operating_system: version.operating_system,
        _environment: version._environment,
        backend_endpoint: version.backend_endpoint || '',
        active_ind: true,
        expiration_date: version.expiration_date ? new Date(version.expiration_date) : null
      });

      this.openDialog();
    } catch (error) {
      throw new Error(`Failed to duplicate version: ${error}`);
    }
  }

  private openDialog(): void {
    const dialogRef = this.dialog.open(this.editDialog, {
      width: '600px',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'version-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.editingVersion = null;
      this.forceUpdate();
    });
  }

  async saveVersion(): Promise<void> {
    if (!this.versionForm.valid) {
      this.markFormGroupTouched();
      this.showError('Please fix form errors before saving');
      return;
    }

    this.isSaving = true;
    try {
      const formValue = this.versionForm.value;
      const versionData: any = {
        version_number: formValue.version_number?.trim(),
        operating_system: formValue.operating_system || null,
        _environment: formValue._environment,
        backend_endpoint: formValue.backend_endpoint?.trim() || '',
        active_ind: Boolean(formValue.active_ind)
      };

      if (formValue.expiration_date) {
        try {
          const date = new Date(formValue.expiration_date);
          versionData.expiration_date = date.toISOString().split('T')[0];
        } catch (error) {
          versionData.expiration_date = null;
        }
      } else {
        versionData.expiration_date = null;
      }

      const baseUrl = this.configService.getBaseUrl();
      const endpoint = this.getVersionEndpoint();

      let request: Observable<any>;
      if (this.editingVersion?.id) {
        const url = `${baseUrl}${endpoint}${this.editingVersion.id}/`;
        request = this.http.put(url, versionData);
      } else {
        const url = `${baseUrl}${endpoint}`;
        request = this.http.post(url, versionData);
      }

      await request.toPromise();
      this.showSuccess(`Version ${this.editingVersion?.id ? 'updated' : 'created'} successfully`);
      await this.loadVersions();
      this.dialog.closeAll();
      this.editingVersion = null;
    } catch (err: any) {
      let errorMessage = 'Error saving version';
      if (err.error?.detail) {
        errorMessage = `Error: ${err.error.detail}`;
      } else if (err.error?.message) {
        errorMessage = `Error: ${err.error.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      this.showError(errorMessage);
    } finally {
      this.isSaving = false;
      this.forceUpdate();
    }
  }

  async toggleVersionStatus(version: Version): Promise<void> {
    if (!version.id) {
      throw new Error('Version ID is missing');
    }

    const newStatus = !version.active_ind;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} version "${version.version_number}"?`)) {
      return;
    }

    const updatedVersion = { ...version, active_ind: newStatus };
    const baseUrl = this.configService.getBaseUrl();
    const endpoint = this.getVersionEndpoint();
    const url = `${baseUrl}${endpoint}${version.id}/`;

    try {
      await this.http.put(url, updatedVersion).toPromise();
      this.showSuccess(`Version "${version.version_number}" ${newStatus ? 'activated' : 'deactivated'} successfully`);
      await this.loadVersions();
    } catch (err: any) {
      let errorMessage = 'Error updating version status';
      if (err.error?.detail) {
        errorMessage = `Error: ${err.error.detail}`;
      }
      throw new Error(errorMessage);
    }
  }

  async deleteVersion(version: Version): Promise<void> {
    if (!version.id) {
      throw new Error('Version ID is missing');
    }

    const confirmMessage = `Are you sure you want to delete version "${version.version_number}"?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const baseUrl = this.configService.getBaseUrl();
    const endpoint = this.getVersionEndpoint();
    const url = `${baseUrl}${endpoint}${version.id}/`;

    try {
      await this.http.delete(url).toPromise();
      this.showSuccess(`Version "${version.version_number}" deleted successfully`);
      await this.loadVersions();
    } catch (err: any) {
      let errorMessage = 'Error deleting version';
      if (err.status === 404) {
        errorMessage = 'Version not found (may have been already deleted)';
      } else if (err.error?.detail) {
        errorMessage = `Error: ${err.error.detail}`;
      } else if (err.error?.message) {
        errorMessage = `Error: ${err.error.message}`;
      }
      throw new Error(errorMessage);
    }
  }

  deployToEnvironment(environment: string): void {
    this.showSuccess(`Deployment to ${this.getEnvironmentName(environment)} initiated`);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.versionForm.controls).forEach(key => {
      const control = this.versionForm.get(key);
      control?.markAsTouched();
    });
  }

  // Tracking Functions
  trackByVersion(index: number, version: Version): any {
    return version.id || index;
  }

  trackByEnvironment(index: number, env: any): any {
    return env.key;
  }

  // Utility Methods
  getActiveVersions(): Version[] {
    return this.versions.filter(v => v.active_ind);
  }

  getUniqueEnvironments(): string[] {
    const environments = new Set(this.versions.map(v => v._environment).filter(env => env !== null));
    return Array.from(environments) as string[];
  }

  getUniquePlatforms(): string[] {
    const platforms = new Set(this.versions.map(v => v.operating_system).filter(os => os !== null));
    return Array.from(platforms) as string[];
  }

  getEnvironmentGroups(): { key: string, versions: Version[] }[] {
    const groups: { [key: string]: Version[] } = {};

    this.versions.forEach(version => {
      const env = version._environment || 'unassigned';
      if (!groups[env]) {
        groups[env] = [];
      }
      groups[env].push(version);
    });

    const sortOrder = ['1', '0', '2', '3', 'unassigned'];
    return sortOrder
      .filter(key => groups[key])
      .map(key => ({ key, versions: groups[key] }));
  }

  getEnvironmentName(env: string): string {
    const config = this.environmentConfig[env as keyof typeof this.environmentConfig];
    return config ? config.name : 'Unknown';
  }

  getEnvironmentIcon(env: string): string {
    const config = this.environmentConfig[env as keyof typeof this.environmentConfig];
    return config ? config.icon : 'help';
  }

  getEnvironmentColor(env: string): string {
    const config = this.environmentConfig[env as keyof typeof this.environmentConfig];
    return config ? config.color : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)';
  }

  getPlatformColor(platform: string): string {
    return this.platformConfig[platform as keyof typeof this.platformConfig] ||
      'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)';
  }

  getVersionStatus(version: Version): string {
    if (!version.active_ind) return 'Inactive';
    if (this.isExpired(version)) return 'Expired';
    return 'Active';
  }

  getStatusClass(version: Version): string {
    if (!version.active_ind) return 'inactive';
    if (this.isExpired(version)) return 'expired';
    return 'active';
  }

  getVersionStatusColor(version: Version): string {
    if (!version.active_ind) return '#6B7280';
    if (this.isExpired(version)) return '#EF4444';
    return '#22C55E';
  }

  isExpired(version: Version): boolean {
    if (!version.expiration_date) return false;
    return new Date(version.expiration_date) < new Date();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  private generateNextVersion(currentVersion: string): string {
    if (!currentVersion) return '1.0.0';

    const parts = currentVersion.split('.');
    if (parts.length === 3) {
      const patch = parseInt(parts[2]) + 1;
      return `${parts[0]}.${parts[1]}.${patch}`;
    }

    return currentVersion + '_copy';
  }
}
