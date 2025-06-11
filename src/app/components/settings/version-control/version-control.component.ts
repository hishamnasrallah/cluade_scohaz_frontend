// components/settings/version-control/version-control.component.ts
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
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

interface Version {
  id?: number;
  version_number: string;
  operating_system: 'IOS' | 'Android' | null;
  _environment: '0' | '1' | '2' | '3' | null; // Staging, Prod, Dev, Local
  backend_endpoint: string;
  active_ind: boolean;
  expiration_date: string | null;
  created_date?: string;
  updated_date?: string;
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
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Version Control</h1>
            <p>Manage application versions, environments, and deployment settings</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              New Version
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
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
            <p>Active Versions</p>
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

      <!-- Versions by Environment -->
      <div class="versions-content" *ngIf="!isLoading">
        <div class="environment-section" *ngFor="let env of getEnvironmentGroups()">
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
              <button mat-button (click)="deployToEnvironment(env.key)">
                <mat-icon>publish</mat-icon>
                Deploy
              </button>
            </div>
          </div>

          <div class="versions-grid">
            <mat-card *ngFor="let version of env.versions"
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
                  <div class="version-actions">
                    <button mat-icon-button (click)="editVersion(version)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button
                            (click)="toggleVersionStatus(version)"
                            [matTooltip]="version.active_ind ? 'Deactivate' : 'Activate'">
                      <mat-icon>{{ version.active_ind ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button mat-icon-button
                            (click)="duplicateVersion(version)"
                            matTooltip="Duplicate">
                      <mat-icon>content_copy</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteVersion(version)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </mat-card-header>

              <mat-card-content>
                <div class="version-details">
                  <div class="detail-row" *ngIf="version.backend_endpoint">
                    <span class="detail-label">Endpoint:</span>
                    <span class="detail-value endpoint">{{ version.backend_endpoint }}</span>
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
            <div class="add-version-card" (click)="createVersionForEnvironment(env.key)">
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
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create First Version
          </button>
        </div>
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
          </mat-form-field>

          <mat-checkbox formControlName="active_ind" class="active-checkbox">
            Active Version
          </mat-checkbox>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveVersion()"
                [disabled]="!versionForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingVersion?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .version-control {
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

      &.total-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.active-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
      &.environments-icon { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
      &.platforms-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
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

    .versions-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .environment-section {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
    }

    .environment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f1f5f9;
    }

    .env-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .env-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .env-details h3 {
      margin: 0 0 4px 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #334155;
    }

    .env-details p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .versions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .version-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      &.inactive {
        opacity: 0.6;
      }

      &.expired {
        border-color: #fecaca;
        background: #fef2f2;
      }
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .version-info h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
    }

    .version-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .platform-chip, .status-chip {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }

    .status-chip {
      &.active { background: #22c55e; }
      &.inactive { background: #64748b; }
      &.expired { background: #ef4444; }
    }

    .version-actions {
      display: flex;
      gap: 4px;
    }

    .version-details {
      margin-top: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .detail-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.9rem;
    }

    .detail-value {
      color: #334155;
      font-size: 0.9rem;

      &.endpoint {
        font-family: monospace;
        background: #f8fafc;
        padding: 2px 6px;
        border-radius: 4px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &.expired {
        color: #ef4444;
        font-weight: 600;
      }
    }

    .version-status-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .add-version-card {
      border: 2px dashed #e2e8f0;
      border-radius: 16px;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
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
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      span {
        font-weight: 500;
      }
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

    @media (max-width: 768px) {
      .version-control {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
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
        gap: 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VersionControlComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  versions: Version[] = [];

  versionForm: FormGroup;
  editingVersion: Version | null = null;

  private environmentConfig = {
    '0': { name: 'Staging', icon: 'settings', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    '1': { name: 'Production', icon: 'public', color: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' },
    '2': { name: 'Development', icon: 'code', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    '3': { name: 'Local', icon: 'computer', color: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }
  };

  private platformConfig = {
    'Android': 'linear-gradient(135deg, #a4d037 0%, #8bc34a 100%)',
    'IOS': 'linear-gradient(135deg, #000000 0%, #434343 100%)'
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.versionForm = this.fb.group({
      version_number: ['', Validators.required],
      operating_system: [null],
      _environment: ['', Validators.required],
      backend_endpoint: [''],
      active_ind: [true],
      expiration_date: [null]
    });
  }

  ngOnInit(): void {
    this.loadVersions();
  }

  loadVersions(): void {
    this.isLoading = true;
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<{count: number, results: Version[]}>(`${baseUrl}/version/versions/`)
      .subscribe({
        next: (response) => {
          this.versions = response.results;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading versions:', err);
          this.snackBar.open('Error loading versions', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  openCreateDialog(): void {
    this.editingVersion = null;
    this.versionForm.reset({ active_ind: true });
    this.openDialog();
  }

  editVersion(version: Version): void {
    this.editingVersion = version;
    this.versionForm.patchValue({
      ...version,
      expiration_date: version.expiration_date ? new Date(version.expiration_date) : null
    });
    this.openDialog();
  }

  createVersionForEnvironment(environment: string): void {
    this.editingVersion = null;
    this.versionForm.reset({
      active_ind: true,
      _environment: environment
    });
    this.openDialog();
  }

  duplicateVersion(version: Version): void {
    this.editingVersion = null;
    const duplicatedVersion = {
      ...version,
      version_number: this.generateNextVersion(version.version_number),
      id: undefined
    };
    this.versionForm.patchValue({
      ...duplicatedVersion,
      expiration_date: duplicatedVersion.expiration_date ? new Date(duplicatedVersion.expiration_date) : null
    });
    this.openDialog();
  }

  private openDialog(): void {
    this.dialog.open(this.editDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  saveVersion(): void {
    if (!this.versionForm.valid) return;

    this.isSaving = true;
    const versionData = { ...this.versionForm.value };

    // Format date properly
    if (versionData.expiration_date) {
      versionData.expiration_date = versionData.expiration_date.toISOString().split('T')[0];
    }

    const baseUrl = this.configService.getBaseUrl();
    const request = this.editingVersion?.id
      ? this.http.put(`${baseUrl}/version/versions/${this.editingVersion.id}/`, versionData)
      : this.http.post(`${baseUrl}/version/versions/`, versionData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Version ${this.editingVersion?.id ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.loadVersions();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving version:', err);
        this.snackBar.open('Error saving version', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  toggleVersionStatus(version: Version): void {
    const updatedVersion = { ...version, active_ind: !version.active_ind };
    const baseUrl = this.configService.getBaseUrl();

    this.http.put(`${baseUrl}/version/versions/${version.id}/`, updatedVersion)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Version ${updatedVersion.active_ind ? 'activated' : 'deactivated'}`,
            'Close',
            { duration: 2000 }
          );
          this.loadVersions();
        },
        error: (err) => {
          console.error('Error updating version status:', err);
          this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        }
      });
  }

  deleteVersion(version: Version): void {
    if (confirm(`Are you sure you want to delete version "${version.version_number}"?`)) {
      const baseUrl = this.configService.getBaseUrl();

      this.http.delete(`${baseUrl}/version/versions/${version.id}/`)
        .subscribe({
          next: () => {
            this.snackBar.open('Version deleted successfully', 'Close', { duration: 3000 });
            this.loadVersions();
          },
          error: (err) => {
            console.error('Error deleting version:', err);
            this.snackBar.open('Error deleting version', 'Close', { duration: 3000 });
          }
        });
    }
  }

  deployToEnvironment(environment: string): void {
    this.snackBar.open(
      `Deployment to ${this.getEnvironmentName(environment)} initiated`,
      'Close',
      { duration: 3000 }
    );
    // Here you would implement actual deployment logic
  }

  refreshData(): void {
    this.loadVersions();
  }

  // Utility methods
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

    // Sort by environment priority (Production, Staging, Development, Local)
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
    return config ? config.color : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
  }

  getPlatformColor(platform: string): string {
    return this.platformConfig[platform as keyof typeof this.platformConfig] ||
      'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
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
    if (!version.active_ind) return '#64748b';
    if (this.isExpired(version)) return '#ef4444';
    return '#22c55e';
  }

  isExpired(version: Version): boolean {
    if (!version.expiration_date) return false;
    return new Date(version.expiration_date) < new Date();
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
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
