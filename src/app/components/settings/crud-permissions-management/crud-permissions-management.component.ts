// components/settings/crud-permissions-management/crud-permissions-management.component.ts
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { CrudPermissionsService, CRUDPermission, Group, ContentTypeApp, ContentTypeModel } from '../../../services/crud-permissions.service';

@Component({
  selector: 'app-crud-permissions-management',
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
    MatExpansionModule,
    MatTabsModule
  ],
  template: `
    <div class="crud-permissions-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>CRUD Permissions Management</h1>
            <p>Manage create, read, update, and delete permissions for groups and content types</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Permission
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>security</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ permissions.length }}</h3>
            <p>Total Permissions</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon groups-icon">
            <mat-icon>group</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueGroupsCount() }}</h3>
            <p>Groups</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon models-icon">
            <mat-icon>api</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueModelsCount() }}</h3>
            <p>Models</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon contexts-icon">
            <mat-icon>layers</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueContextsCount() }}</h3>
            <p>Contexts</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading permissions...</p>
      </div>

      <!-- Permissions List -->
      <div class="permissions-content" *ngIf="!isLoading">
        <mat-card *ngFor="let permission of permissions" class="permission-card">
          <mat-card-header>
            <div class="permission-header">
              <div class="permission-icon">
                <mat-icon>{{ getModelIcon(permission.content_type_name) }}</mat-icon>
              </div>
              <div class="permission-info">
                <h3>{{ permission.group_name }}</h3>
                <p class="model-name">{{ formatModelName(permission.content_type_name) }}</p>
                <div class="permission-badges">
                  <span class="context-badge">{{ permission.context }}</span>
                  <span class="permissions-summary">{{ getPermissionsSummary(permission) }}</span>
                </div>
              </div>
              <div class="permission-actions">
                <button mat-icon-button (click)="editPermission(permission)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="duplicatePermission(permission)" matTooltip="Duplicate">
                  <mat-icon>content_copy</mat-icon>
                </button>
                <button mat-icon-button (click)="deletePermission(permission)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- CRUD Permissions Grid -->
            <div class="crud-permissions-grid">
              <div class="crud-item" [class.enabled]="permission.can_create">
                <mat-icon>add_circle</mat-icon>
                <span>Create</span>
              </div>
              <div class="crud-item" [class.enabled]="permission.can_read">
                <mat-icon>visibility</mat-icon>
                <span>Read</span>
              </div>
              <div class="crud-item" [class.enabled]="permission.can_update">
                <mat-icon>edit</mat-icon>
                <span>Update</span>
              </div>
              <div class="crud-item" [class.enabled]="permission.can_delete">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </div>
            </div>

            <!-- Model Details -->
            <div class="model-details" *ngIf="permission.content_type_name">
              <div class="detail-row">
                <span class="detail-label">Application:</span>
                <span class="detail-value">{{ getAppFromContentType(permission.content_type_name) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Model:</span>
                <span class="detail-value">{{ getModelFromContentType(permission.content_type_name) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Context:</span>
                <span class="detail-value">{{ permission.context }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="permissions.length === 0">
          <mat-icon>security</mat-icon>
          <h3>No permissions found</h3>
          <p>Start by creating your first CRUD permission</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create First Permission
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <ng-template #editDialog>
      <div mat-dialog-title>{{ editingPermission?.id ? 'Edit' : 'Create' }} CRUD Permission</div>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="permissionForm" class="permission-form">

          <!-- Group Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Group</mat-label>
            <mat-select formControlName="group">
              <mat-option *ngFor="let group of groups" [value]="group.id">
                {{ group.name }}
              </mat-option>
            </mat-select>
            <mat-hint *ngIf="groups.length === 0">No groups available</mat-hint>
            <mat-error *ngIf="permissionForm.get('group')?.hasError('required')">
              Group is required
            </mat-error>
          </mat-form-field>

          <!-- Application Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Application</mat-label>
            <mat-select formControlName="selectedApp" (selectionChange)="onAppChange($event.value)">
              <mat-option *ngFor="let app of contentTypeApps; trackBy: trackByAppLabel" [value]="app.app_label">
                {{ getAppDisplayName(app) }}
              </mat-option>
            </mat-select>
            <mat-hint *ngIf="contentTypeApps.length === 0">No applications available</mat-hint>
            <mat-hint *ngIf="contentTypeApps.length > 0">{{ contentTypeApps.length }} applications available</mat-hint>
            <mat-error *ngIf="permissionForm.get('selectedApp')?.hasError('required')">
              Application is required
            </mat-error>
          </mat-form-field>

          <!-- Model Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Model</mat-label>
            <mat-select formControlName="content_type" [disabled]="!selectedAppModels.length">
              <mat-option *ngFor="let model of selectedAppModels; trackBy: trackByModelId" [value]="model.id">
                {{ formatSingleModelName(model.model) }}
              </mat-option>
            </mat-select>
            <mat-hint *ngIf="selectedAppModels.length === 0 && permissionForm.get('selectedApp')?.value">
              No models available for selected application
            </mat-hint>
            <mat-hint *ngIf="!permissionForm.get('selectedApp')?.value">
              Please select an application first
            </mat-hint>
            <mat-hint *ngIf="selectedAppModels.length > 0">
              {{ selectedAppModels.length }} models available
            </mat-hint>
            <mat-error *ngIf="permissionForm.get('content_type')?.hasError('required')">
              Model is required
            </mat-error>
          </mat-form-field>

          <!-- Context Multi-Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Context</mat-label>
            <mat-select formControlName="contextArray" multiple>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="api">API</mat-option>
              <mat-option value="form">Form</mat-option>
              <mat-option value="view">View</mat-option>
            </mat-select>
            <mat-error *ngIf="permissionForm.get('contextArray')?.hasError('required')">
              At least one context is required
            </mat-error>
          </mat-form-field>

          <!-- CRUD Permissions -->
          <div class="crud-permissions-section">
            <h4>Permissions</h4>
            <div class="crud-checkboxes">
              <mat-checkbox formControlName="can_create" class="crud-checkbox">
                <div class="checkbox-content">
                  <mat-icon>add_circle</mat-icon>
                  <span>Create</span>
                </div>
              </mat-checkbox>

              <mat-checkbox formControlName="can_read" class="crud-checkbox">
                <div class="checkbox-content">
                  <mat-icon>visibility</mat-icon>
                  <span>Read</span>
                </div>
              </mat-checkbox>

              <mat-checkbox formControlName="can_update" class="crud-checkbox">
                <div class="checkbox-content">
                  <mat-icon>edit</mat-icon>
                  <span>Update</span>
                </div>
              </mat-checkbox>

              <mat-checkbox formControlName="can_delete" class="crud-checkbox">
                <div class="checkbox-content">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </div>
              </mat-checkbox>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button type="button" mat-button (click)="selectAllPermissions()">
              <mat-icon>select_all</mat-icon>
              Select All
            </button>
            <button type="button" mat-button (click)="clearAllPermissions()">
              <mat-icon>clear_all</mat-icon>
              Clear All
            </button>
            <button type="button" mat-button (click)="selectReadOnlyPermissions()">
              <mat-icon>visibility</mat-icon>
              Read Only
            </button>
          </div>

        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="savePermission()"
                [disabled]="!permissionForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingPermission?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .crud-permissions-management {
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
      &.groups-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
      &.models-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
      &.contexts-icon { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
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

    .loading-details {
      margin-top: 16px;
      font-size: 0.9rem;
      color: #64748b;

      p {
        margin: 4px 0;
      }
    }

    .permissions-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .permission-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }

    .permission-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    .permission-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .permission-info {
      flex: 1;
    }

    .permission-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
    }

    .model-name {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.9rem;
      font-family: monospace;
    }

    .permission-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .context-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .permissions-summary {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
    }

    .permission-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .crud-permissions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .crud-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      transition: all 0.3s ease;
      opacity: 0.5;

      &.enabled {
        opacity: 1;
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;

        mat-icon {
          color: #16a34a;
        }
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #94a3b8;
      }

      span {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }

    .model-details {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .detail-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.9rem;
    }

    .detail-value {
      color: #334155;
      font-size: 0.9rem;
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

    .dialog-content {
      max-height: 70vh;
      overflow: auto;
    }

    .permission-form {
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .crud-permissions-section {
      margin: 24px 0;
    }

    .crud-permissions-section h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }

    .crud-checkboxes {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .crud-checkbox {
      .checkbox-content {
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px dashed #e2e8f0;
    }

    @media (max-width: 768px) {
      .crud-permissions-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .permission-header {
        flex-wrap: wrap;
      }

      .crud-permissions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .crud-checkboxes {
        grid-template-columns: 1fr;
      }

      .permission-form {
        min-width: auto;
      }
    }
  `]
})
export class CrudPermissionsManagementComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  permissions: CRUDPermission[] = [];
  groups: Group[] = [];
  contentTypeApps: ContentTypeApp[] = [];
  selectedAppModels: ContentTypeModel[] = [];

  // Loading state tracking
  private loadingStates = {
    permissions: false,
    groups: false,
    contentTypeApps: false
  };

  permissionForm!: FormGroup;
  editingPermission: CRUDPermission | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private crudPermissionsService: CrudPermissionsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForm(): void {
    this.permissionForm = this.fb.group({
      group: [null, Validators.required],
      selectedApp: ['', Validators.required],
      content_type: [null, Validators.required],
      contextArray: [[], Validators.required],
      can_create: [false],
      can_read: [false],
      can_update: [false],
      can_delete: [false]
    });

    // Add validation for contextArray to ensure at least one context is selected
    this.permissionForm.get('contextArray')?.setValidators([
      Validators.required,
      (control) => {
        const value = control.value;
        return Array.isArray(value) && value.length > 0 ? null : { required: true };
      }
    ]);

    console.log('Permission form initialized');
  }

  private loadData(): void {
    this.isLoading = true;
    // Track loading states
    this.loadingStates = {
      permissions: false,
      groups: false,
      contentTypeApps: false
    };
    this.loadPermissions();
    this.loadGroups();
    this.loadContentTypeApps();
  }

  private loadPermissions(): void {
    this.crudPermissionsService.getPermissions().subscribe({
      next: (response) => {
        this.permissions = response.results || [];
        this.loadingStates.permissions = true;
        this.checkLoadingComplete();
        console.log('Permissions loaded:', this.permissions.length);
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
        this.snackBar.open('Error loading permissions', 'Close', { duration: 3000 });
        this.loadingStates.permissions = true; // Mark as complete even on error
        this.checkLoadingComplete();
      }
    });
  }

  private loadGroups(): void {
    this.crudPermissionsService.getGroups().subscribe({
      next: (response) => {
        console.log('Raw groups response:', response);
        // Handle both array response and paginated response
        this.groups = Array.isArray(response) ? response : (response as any).results || [];
        this.loadingStates.groups = true;
        this.checkLoadingComplete();
        console.log('Groups loaded:', this.groups.length);
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.snackBar.open('Error loading groups', 'Close', { duration: 3000 });
        this.loadingStates.groups = true; // Mark as complete even on error
        this.checkLoadingComplete();
      }
    });
  }

  private loadContentTypeApps(): void {
    this.crudPermissionsService.getContentTypeApps().subscribe({
      next: (response) => {
        console.log('Raw content type apps response (string array):', response);

        // Convert string array to ContentTypeApp objects
        this.contentTypeApps = (response || []).map(appLabel => ({
          app_label: appLabel,
          app_name: undefined,
          model_count: undefined
        }));

        console.log('Converted apps:', this.contentTypeApps);

        this.loadingStates.contentTypeApps = true;
        this.checkLoadingComplete();
        console.log('Content type apps loaded:', this.contentTypeApps.length);
      },
      error: (err) => {
        console.error('Error loading content type apps:', err);
        this.snackBar.open('Error loading content type apps', 'Close', { duration: 3000 });
        this.loadingStates.contentTypeApps = true; // Mark as complete even on error
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    if (this.loadingStates.permissions && this.loadingStates.groups && this.loadingStates.contentTypeApps) {
      this.isLoading = false;
      console.log('All data loaded successfully');
    }
  }

  onAppChange(appLabel: string): void {
    if (!appLabel) {
      this.selectedAppModels = [];
      this.permissionForm.patchValue({ content_type: null });
      return;
    }

    console.log('Loading models for app:', appLabel);
    this.crudPermissionsService.getContentTypeModels(appLabel).subscribe({
      next: (response) => {
        console.log('Raw models response:', response);
        this.selectedAppModels = response || [];
        console.log('Models loaded for app', appLabel, ':', this.selectedAppModels.length);

        // Reset content_type selection when app changes
        this.permissionForm.patchValue({ content_type: null });

        if (this.selectedAppModels.length === 0) {
          this.snackBar.open(`No models found for application "${appLabel}"`, 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Error loading models for app:', appLabel, err);
        this.selectedAppModels = [];
        this.permissionForm.patchValue({ content_type: null });
        this.snackBar.open('Error loading models', 'Close', { duration: 3000 });
      }
    });
  }

  openCreateDialog(): void {
    this.editingPermission = null;
    this.selectedAppModels = []; // Clear selected models
    this.permissionForm.reset({
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
      contextArray: []
    });
    console.log('Opening create dialog with clean form');
    this.openDialog();
  }

  editPermission(permission: CRUDPermission): void {
    this.editingPermission = permission;
    console.log('Editing permission:', permission);

    // Extract app and model from content_type_name
    const [appLabel, modelName] = permission.content_type_name?.split('.') || ['', ''];
    console.log('Extracted app:', appLabel, 'model:', modelName);

    // Set initial form values (without content_type yet)
    this.permissionForm.patchValue({
      group: permission.group,
      selectedApp: appLabel,
      contextArray: permission.context.split(', ').map(c => c.trim()).filter(c => c),
      can_create: permission.can_create,
      can_read: permission.can_read,
      can_update: permission.can_update,
      can_delete: permission.can_delete
    });

    // Load models for the app first, then set content_type
    if (appLabel) {
      console.log('Loading models for editing...');
      this.crudPermissionsService.getContentTypeModels(appLabel).subscribe({
        next: (response) => {
          console.log('Models response for editing:', response);
          this.selectedAppModels = response || [];
          console.log('Models loaded for editing:', this.selectedAppModels.length);

          // Now set the content_type after models are loaded
          this.permissionForm.patchValue({
            content_type: permission.content_type
          });

          console.log('Form after setting content_type:', this.permissionForm.value);
          this.openDialog();
        },
        error: (err) => {
          console.error('Error loading models for editing:', err);
          this.selectedAppModels = [];
          this.snackBar.open('Error loading models for this application', 'Close', { duration: 3000 });
          this.openDialog(); // Still open dialog even if models fail to load
        }
      });
    } else {
      this.selectedAppModels = [];
      this.permissionForm.patchValue({ content_type: null });
      this.openDialog();
    }
  }

  duplicatePermission(permission: CRUDPermission): void {
    this.editingPermission = null;
    console.log('Duplicating permission:', permission);

    const [appLabel, modelName] = permission.content_type_name?.split('.') || ['', ''];
    console.log('Extracted app for duplicate:', appLabel, 'model:', modelName);

    // Set form values (without content_type yet)
    this.permissionForm.patchValue({
      group: permission.group,
      selectedApp: appLabel,
      contextArray: permission.context.split(', ').map(c => c.trim()).filter(c => c),
      can_create: permission.can_create,
      can_read: permission.can_read,
      can_update: permission.can_update,
      can_delete: permission.can_delete
    });

    // Load models for the app first
    if (appLabel) {
      this.crudPermissionsService.getContentTypeModels(appLabel).subscribe({
        next: (response) => {
          this.selectedAppModels = response || [];

          // Set the content_type after models are loaded
          this.permissionForm.patchValue({
            content_type: permission.content_type
          });

          this.openDialog();
        },
        error: (err) => {
          console.error('Error loading models for duplicate:', err);
          this.selectedAppModels = [];
          this.snackBar.open('Error loading models for this application', 'Close', { duration: 3000 });
          this.openDialog();
        }
      });
    } else {
      this.selectedAppModels = [];
      this.permissionForm.patchValue({ content_type: null });
      this.openDialog();
    }
  }

  private openDialog(): void {
    this.dialog.open(this.editDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  savePermission(): void {
    if (!this.permissionForm.valid) return;

    this.isSaving = true;
    const formData = this.permissionForm.value;

    // Convert contextArray to comma-separated string
    const permissionData: any = {
      group: formData.group,
      content_type: formData.content_type,
      context: formData.contextArray.join(', '),
      can_create: formData.can_create,
      can_read: formData.can_read,
      can_update: formData.can_update,
      can_delete: formData.can_delete
    };

    const request = this.editingPermission?.id
      ? this.crudPermissionsService.updatePermission(this.editingPermission.id, permissionData)
      : this.crudPermissionsService.createPermission(permissionData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Permission ${this.editingPermission?.id ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.loadPermissions();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving permission:', err);
        this.snackBar.open('Error saving permission', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  deletePermission(permission: CRUDPermission): void {
    if (confirm(`Are you sure you want to delete this permission for "${permission.group_name}"?`)) {
      if (!permission.id) return;

      this.crudPermissionsService.deletePermission(permission.id).subscribe({
        next: () => {
          this.snackBar.open('Permission deleted successfully', 'Close', { duration: 3000 });
          this.loadPermissions();
        },
        error: (err) => {
          console.error('Error deleting permission:', err);
          this.snackBar.open('Error deleting permission', 'Close', { duration: 3000 });
        }
      });
    }
  }

  refreshData(): void {
    console.log('Refreshing all data...');
    // Reset loading states
    this.loadingStates = {
      permissions: false,
      groups: false,
      contentTypeApps: false
    };
    this.loadData();
  }

  // Quick action methods
  selectAllPermissions(): void {
    this.permissionForm.patchValue({
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: true
    });
  }

  clearAllPermissions(): void {
    this.permissionForm.patchValue({
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false
    });
  }

  selectReadOnlyPermissions(): void {
    this.permissionForm.patchValue({
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false
    });
  }

  // Utility methods
  getUniqueGroupsCount(): number {
    const uniqueGroups = new Set(this.permissions.map(p => p.group));
    return uniqueGroups.size;
  }

  getUniqueModelsCount(): number {
    const uniqueModels = new Set(this.permissions.map(p => p.content_type));
    return uniqueModels.size;
  }

  getUniqueContextsCount(): number {
    const allContexts = this.permissions.flatMap(p => p.context.split(', ').map(c => c.trim()));
    const uniqueContexts = new Set(allContexts);
    return uniqueContexts.size;
  }

  getModelIcon(contentTypeName?: string): string {
    if (!contentTypeName) return 'api';

    const iconMap: { [key: string]: string } = {
      'auth': 'security',
      'user': 'person',
      'group': 'group',
      'permission': 'lock',
      'content': 'article',
      'post': 'post_add',
      'comment': 'comment',
      'file': 'attach_file',
      'image': 'image',
      'video': 'videocam',
      'order': 'shopping_cart',
      'product': 'inventory'
    };

    const appName = contentTypeName.split('.')[0];
    return iconMap[appName] || 'api';
  }

  formatModelName(contentTypeName?: string): string {
    if (!contentTypeName) return 'Unknown Model';
    return contentTypeName.replace('.', ' › ').replace(/_/g, ' ').toUpperCase();
  }

  getAppFromContentType(contentTypeName?: string): string {
    if (!contentTypeName) return 'Unknown';
    return this.crudPermissionsService.parseContentTypeName(contentTypeName).app;
  }

  getModelFromContentType(contentTypeName?: string): string {
    if (!contentTypeName) return 'Unknown';
    return this.crudPermissionsService.parseContentTypeName(contentTypeName).model;
  }

  // Utility method to format individual model names (for dropdown)
  formatSingleModelName(modelName: string): string {
    if (!modelName) return 'Unknown Model';

    // Convert snake_case to Title Case
    return modelName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Utility method to get a friendly app name
  getAppDisplayName(app: ContentTypeApp): string {
    // Since we're converting from string array, app_name will be undefined
    // So we'll always format the app_label
    if (app.app_label) {
      return this.formatAppLabel(app.app_label);
    }

    return 'Unknown Application';
  }

  // Utility method to format app labels (separate from model names)
  formatAppLabel(appLabel: string): string {
    if (!appLabel) return 'Unknown Application';

    // Handle special cases for better display
    const specialCases: { [key: string]: string } = {
      'auth': 'Authentication',
      'admin': 'Admin',
      'contenttypes': 'Content Types',
      'sessions': 'Sessions',
      'sites': 'Sites',
      'django_celery_beat': 'Django Celery Beat',
      'django_celery_results': 'Django Celery Results',
      'ab_app': 'AB App',
      'app_builder': 'App Builder',
      'conditional_approval': 'Conditional Approval',
      'license_subscription_manager': 'License Subscription Manager',
      'relational_app': 'Relational App',
      'version_control': 'Version Control'
    };

    // Check if we have a special case
    if (specialCases[appLabel]) {
      return specialCases[appLabel];
    }

    // Convert snake_case to Title Case
    return appLabel
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // TrackBy functions for performance
  trackByAppLabel(index: number, app: ContentTypeApp): string {
    return app.app_label || index.toString();
  }

  trackByModelId(index: number, model: ContentTypeModel): string {
    return model.id?.toString() || index.toString();
  }

  getPermissionsSummary(permission: CRUDPermission): string {
    return this.crudPermissionsService.getCRUDAbbreviation(permission);
  }

  // formatModelName(contentTypeName?: string): string {
  //   if (!contentTypeName) return 'Unknown Model';
  //
  //   if (typeof contentTypeName === 'string' && contentTypeName.includes('.')) {
  //     // Handle content_type_name format like "auth.group"
  //     return contentTypeName.replace('.', ' › ').replace(/_/g, ' ').toUpperCase();
  //   }
  //
  //   // Handle individual model names
  //   return contentTypeName
  //     .split('_')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');
  // }
  //
  // // Utility method to format individual model names (for dropdown)
  // formatSingleModelName(modelName: string): string {
  //   if (!modelName) return 'Unknown Model';
  //
  //   // Convert snake_case to Title Case
  //   return modelName
  //     .split('_')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(' ');
  // }
  //
  // // Utility method to get a friendly app name
  // getAppDisplayName(app: ContentTypeApp): string {
  //   return app.app_name || this.formatSingleModelName(app.app_label);
  // }
}
