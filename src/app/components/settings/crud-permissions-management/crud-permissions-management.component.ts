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
      <!-- Compact Ocean Mint Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-icon">
              <mat-icon>security</mat-icon>
            </div>
            <div>
              <h1>CRUD Permissions</h1>
              <p>Manage access control for groups and content types</p>
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
            <button mat-button
                    (click)="toggleBulkMode()"
                    class="bulk-mode-btn"
                    *ngIf="permissions.length > 0">
              <mat-icon>{{ bulkModeEnabled ? 'close' : 'checklist' }}</mat-icon>
              {{ bulkModeEnabled ? 'Exit Bulk Mode' : 'Bulk Mode' }}
            </button>
            <button mat-raised-button
                    color="primary"
                    (click)="openCreateDialog()"
                    class="create-btn"
                    *ngIf="!bulkModeEnabled">
              <mat-icon>add</mat-icon>
              Add Permission
            </button>
            <button mat-raised-button
                    color="primary"
                    (click)="openBulkCreateDialog()"
                    class="create-btn"
                    *ngIf="!bulkModeEnabled">
              <mat-icon>add_circle_outline</mat-icon>
              Bulk Add
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>security</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ permissions.length }}</h3>
            <p>Permissions</p>
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
        <mat-spinner diameter="40" color="primary"></mat-spinner>
        <p>Loading permissions...</p>
      </div>

      <!-- Permissions List -->
      <div class="permissions-container" *ngIf="!isLoading">
        <div class="permissions-list">
          <div *ngFor="let permission of permissions"
               class="permission-item"
               [class.selectable]="bulkModeEnabled"
               [class.selected]="isPermissionSelected(permission.id!)"
               (click)="bulkModeEnabled && permission.id && togglePermissionSelection(permission.id)">

            <!-- Bulk Selection Checkbox -->
            <mat-checkbox
              *ngIf="bulkModeEnabled && permission.id"
              class="bulk-selection-checkbox"
              [checked]="isPermissionSelected(permission.id)"
              (click)="$event.stopPropagation()"
              (change)="togglePermissionSelection(permission.id)">
            </mat-checkbox>

            <!-- Permission Header -->
            <div class="permission-header">
              <div class="header-left">
                <div class="permission-icon" [style.background]="getPermissionGradient(permission)">
                  <mat-icon>{{ getModelIcon(permission.content_type_name) }}</mat-icon>
                </div>
                <div class="permission-info">
                  <h3>{{ permission.group_name }}</h3>
                  <span class="model-name">{{ formatModelName(permission.content_type_name) }}</span>
                </div>
              </div>
              <div class="header-right">
                <div class="permission-badges">
                  <mat-chip class="context-chip">{{ permission.context }}</mat-chip>
                  <mat-chip class="crud-chip">{{ getPermissionsSummary(permission) }}</mat-chip>
                </div>
                <div class="permission-actions" *ngIf="!bulkModeEnabled">
                  <button mat-icon-button
                          (click)="editPermission(permission)"
                          class="action-btn"
                          matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="duplicatePermission(permission)"
                          class="action-btn"
                          matTooltip="Duplicate">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="deletePermission(permission)"
                          class="action-btn delete"
                          matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- CRUD Indicators -->
            <div class="crud-indicators">
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

            <!-- Additional Details -->
            <div class="permission-details">
              <div class="detail-item">
                <span class="detail-label">Application:</span>
                <span class="detail-value">{{ getAppFromContentType(permission.content_type_name) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Model:</span>
                <span class="detail-value">{{ getModelFromContentType(permission.content_type_name) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="permissions.length === 0">
            <mat-icon>security</mat-icon>
            <h3>No permissions found</h3>
            <p>Create your first CRUD permission</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Create Permission
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Controls -->
      <div class="bulk-controls" *ngIf="bulkModeEnabled && selectedPermissionIds.size > 0">
        <span class="selected-count">{{ selectedPermissionIds.size }} selected</span>
        <button mat-button (click)="selectAllPermissionsInList()">Select All</button>
        <button mat-button (click)="deselectAllPermissionsInList()">Clear</button>
        <button mat-raised-button color="primary" (click)="bulkUpdateSelectedPermissions()">
          <mat-icon>edit</mat-icon>
          Bulk Update
        </button>
        <button mat-raised-button color="warn" (click)="bulkDeleteSelectedPermissions()">
          <mat-icon>delete</mat-icon>
          Bulk Delete
        </button>
      </div>
    </div>

    <!-- Compact Dialog -->
    <ng-template #editDialog>
      <h2 mat-dialog-title>
        <mat-icon>{{ editingPermission?.id ? 'edit' : 'add' }}</mat-icon>
        {{ editingPermission?.id ? 'Edit' : (isBulkMode ? 'Bulk Create' : 'Create') }} Permission
      </h2>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="permissionForm" class="compact-form">

          <!-- Group Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Group</mat-label>
            <mat-select formControlName="group">
              <mat-option *ngFor="let group of groups" [value]="group.id">
                {{ group.name }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>group</mat-icon>
            <mat-hint *ngIf="groups.length === 0">No groups available</mat-hint>
          </mat-form-field>

          <!-- Application Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Application</mat-label>
            <mat-select formControlName="selectedApp" (selectionChange)="onAppChange($event.value)">
              <mat-option *ngFor="let app of contentTypeApps; trackBy: trackByAppLabel" [value]="app.app_label">
                {{ getAppDisplayName(app) }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>apps</mat-icon>
            <mat-hint>{{ contentTypeApps.length }} applications available</mat-hint>
          </mat-form-field>

          <!-- Model Selection -->
          <mat-form-field appearance="outline" *ngIf="!isBulkMode">
            <mat-label>Model</mat-label>
            <mat-select formControlName="content_type" [disabled]="!selectedAppModels.length">
              <mat-option *ngFor="let model of selectedAppModels; trackBy: trackByModelId" [value]="model.id">
                {{ formatSingleModelName(model.model) }}
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>api</mat-icon>
            <mat-hint *ngIf="selectedAppModels.length === 0 && permissionForm.get('selectedApp')?.value">
              No models available for selected application
            </mat-hint>
            <mat-hint *ngIf="!permissionForm.get('selectedApp')?.value">
              Please select an application first
            </mat-hint>
          </mat-form-field>

          <!-- Bulk Model Selection -->
          <div class="bulk-model-selection" *ngIf="isBulkMode && selectedAppModels.length > 0">
            <label class="bulk-label">
              <mat-icon>api</mat-icon>
              Select Models
            </label>
            <div class="model-checkboxes">
              <mat-checkbox
                *ngFor="let model of selectedAppModels"
                [checked]="isModelSelected(model.id)"
                (change)="toggleModelSelection(model.id)"
                class="model-checkbox">
                {{ formatSingleModelName(model.model) }}
              </mat-checkbox>
            </div>
            <div class="bulk-actions">
              <button mat-button (click)="selectAllModels()">Select All</button>
              <button mat-button (click)="deselectAllModels()">Clear</button>
            </div>
          </div>

          <!-- Context Selection -->
          <mat-form-field appearance="outline">
            <mat-label>Context</mat-label>
            <mat-select formControlName="contextArray" multiple>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="api">API</mat-option>
              <mat-option value="form">Form</mat-option>
              <mat-option value="view">View</mat-option>
            </mat-select>
            <mat-icon matPrefix>layers</mat-icon>
          </mat-form-field>

          <!-- CRUD Permissions -->
          <div class="crud-section">
            <h4>
              <mat-icon>lock</mat-icon>
              Permissions
            </h4>
            <div class="crud-grid">
              <mat-checkbox formControlName="can_create" class="crud-checkbox create">
                <mat-icon>add_circle</mat-icon>
                Create
              </mat-checkbox>
              <mat-checkbox formControlName="can_read" class="crud-checkbox read">
                <mat-icon>visibility</mat-icon>
                Read
              </mat-checkbox>
              <mat-checkbox formControlName="can_update" class="crud-checkbox update">
                <mat-icon>edit</mat-icon>
                Update
              </mat-checkbox>
              <mat-checkbox formControlName="can_delete" class="crud-checkbox delete">
                <mat-icon>delete</mat-icon>
                Delete
              </mat-checkbox>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button mat-button (click)="selectAllPermissions()">
              <mat-icon>select_all</mat-icon>
              All
            </button>
            <button mat-button (click)="clearAllPermissions()">
              <mat-icon>clear_all</mat-icon>
              None
            </button>
            <button mat-button (click)="selectReadOnlyPermissions()">
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
                [disabled]="!permissionForm.valid || isSaving || (isBulkMode && selectedModelIds.size === 0)">
          <mat-spinner diameter="16" *ngIf="isSaving"></mat-spinner>
          {{ editingPermission?.id ? 'Update' : (isBulkMode ? 'Bulk Create' : 'Create') }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .crud-permissions-management {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
    }

    /* Compact Ocean Mint Header */
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
      &.groups-icon { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }
      &.models-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
      &.contexts-icon { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

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

    /* Loading */
    .loading-section {
      text-align: center;
      padding: 40px;

      p {
        margin-top: 12px;
        color: #6B7280;
      }
    }

    /* Permissions Container */
    .permissions-container {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
      max-height: calc(100vh - 300px);
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #F3F4F6;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(52, 197, 170, 0.3);
        border-radius: 3px;

        &:hover {
          background: rgba(52, 197, 170, 0.5);
        }
      }
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Permission Item */
    .permission-item {
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      background: #FAFBFC;
      overflow: hidden;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(52, 197, 170, 0.3);
        background: rgba(196, 247, 239, 0.05);
        transform: translateY(-1px);
      }
    }

    .permission-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .permission-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .permission-info h3 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2F4858;
    }

    .model-name {
      font-size: 0.8rem;
      color: #6B7280;
      font-family: monospace;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .permission-badges {
      display: flex;
      gap: 6px;
    }

    .context-chip, .crud-chip {
      height: 22px;
      font-size: 0.7rem;
      padding: 0 10px;
    }

    .context-chip {
      background: rgba(102, 126, 234, 0.1);
      color: #667EEA;
    }

    .crud-chip {
      background: rgba(34, 197, 94, 0.1);
      color: #16A34A;
    }

    .permission-actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      color: #6B7280;

      &:hover {
        color: #34C5AA;
      }

      &.delete:hover {
        color: #EF4444;
      }
    }

    /* CRUD Indicators */
    .crud-indicators {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 0 16px 16px;
    }

    .crud-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      background: white;
      font-size: 0.8rem;
      color: #9CA3AF;
      transition: all 0.2s ease;
      opacity: 0.6;

      &.enabled {
        opacity: 1;
        border-color: rgba(34, 197, 94, 0.3);
        background: rgba(34, 197, 94, 0.05);
        color: #16A34A;

        mat-icon {
          color: #16A34A;
        }
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      span {
        font-weight: 500;
      }
    }

    /* Permission Details */
    .permission-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 0 16px 16px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #F3F4F6;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #6B7280;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.8rem;
      color: #2F4858;
      font-weight: 500;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #9CA3AF;
      }

      h3 {
        font-size: 1.25rem;
        margin: 12px 0 8px;
        color: #2F4858;
      }

      p {
        margin: 0 0 20px;
        color: #6B7280;
      }
    }

    /* Compact Dialog */
    .dialog-content {
      padding: 20px 24px !important;
      overflow-y: auto !important;
      max-height: 60vh !important;
    }

    .compact-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .compact-form mat-form-field {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: white !important;
      }
    }

    .crud-section {
      margin-top: 8px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .crud-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #2F4858;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #34C5AA;
      }
    }

    .crud-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .crud-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      font-size: 0.875rem;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.create mat-icon { color: #3B82F6; }
      &.read mat-icon { color: #10B981; }
      &.update mat-icon { color: #F59E0B; }
      &.delete mat-icon { color: #EF4444; }
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: rgba(196, 247, 239, 0.15);
      border-radius: 8px;
      border: 1px dashed rgba(52, 197, 170, 0.3);

      button {
        font-size: 0.8rem;
        color: #34C5AA;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    /* Dialog */
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

    mat-dialog-actions {
      padding: 12px 24px !important;
      border-top: 1px solid #E5E7EB;
      gap: 8px;

      button {
        min-width: 80px;
      }

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    }

    /* Bulk Mode Styles */
    .bulk-mode-btn {
      background: rgba(102, 126, 234, 0.1);
      color: #667EEA;

      &:hover {
        background: rgba(102, 126, 234, 0.2);
      }
    }

    .bulk-model-selection {
      width: 100%;
      margin-top: 16px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .bulk-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #2F4858;
      margin-bottom: 12px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #34C5AA;
      }
    }

    .model-checkboxes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;
      background: white;
      border-radius: 6px;
      border: 1px solid #F3F4F6;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #F3F4F6;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(52, 197, 170, 0.3);
        border-radius: 3px;

        &:hover {
          background: rgba(52, 197, 170, 0.5);
        }
      }
    }

    .model-checkbox {
      padding: 4px 8px;
      font-size: 0.875rem;
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;

      button {
        font-size: 0.8rem;
        color: #34C5AA;
      }
    }

    .permission-item.selectable {
      cursor: pointer;
      position: relative;

      &.selected {
        background: rgba(102, 126, 234, 0.05);
        border-color: rgba(102, 126, 234, 0.3);
      }
    }

    .bulk-selection-checkbox {
      position: absolute;
      top: 16px;
      left: 16px;
    }

    .bulk-controls {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;

      .selected-count {
        font-weight: 600;
        color: #2F4858;
        margin-right: 12px;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .crud-permissions-management {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .permission-header {
        flex-wrap: wrap;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
        margin-top: 8px;
      }

      .crud-indicators {
        grid-template-columns: repeat(2, 1fr);
      }

      .permission-details {
        grid-template-columns: 1fr;
      }

      .crud-grid {
        grid-template-columns: 1fr;
      }

      .model-checkboxes {
        grid-template-columns: 1fr;
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

  // Bulk mode properties
  bulkModeEnabled = false;
  selectedPermissionIds: Set<number> = new Set();
  selectedModelIds: Set<number> = new Set();
  isBulkMode = false;

  // Loading state tracking
  private loadingStates = {
    permissions: false,
    groups: false,
    contentTypeApps: false
  };

  permissionForm!: FormGroup;
  editingPermission: CRUDPermission | null = null;

  // Ocean Mint gradients
  private gradients = [
    'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
    'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  ];

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
        this.snackBar.open('Error loading permissions', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
        this.snackBar.open('Error loading groups', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
        this.snackBar.open('Error loading content type apps', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
          this.snackBar.open(`No models found for application "${appLabel}"`, 'Close', {
            duration: 3000,
            panelClass: ['info-snackbar']
          });
        }
      },
      error: (err) => {
        console.error('Error loading models for app:', appLabel, err);
        this.selectedAppModels = [];
        this.permissionForm.patchValue({ content_type: null });
        this.snackBar.open('Error loading models', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openCreateDialog(): void {
    this.isBulkMode = false; // Ensure bulk mode is off
    this.editingPermission = null;
    this.selectedAppModels = []; // Clear selected models
    this.permissionForm.reset({
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
      contextArray: []
    });

    // Restore content_type requirement for single mode
    this.permissionForm.get('content_type')?.setValidators([Validators.required]);
    this.permissionForm.get('content_type')?.updateValueAndValidity();

    console.log('Opening create dialog with clean form');
    this.openDialog();
  }

  editPermission(permission: CRUDPermission): void {
    this.isBulkMode = false; // Ensure bulk mode is off
    this.editingPermission = permission;
    console.log('Editing permission:', permission);

    // Restore content_type requirement for edit mode
    this.permissionForm.get('content_type')?.setValidators([Validators.required]);
    this.permissionForm.get('content_type')?.updateValueAndValidity();

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
          this.snackBar.open('Error loading models for this application', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
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
          this.snackBar.open('Error loading models for this application', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
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
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'compact-dialog'
    });
  }


  deletePermission(permission: CRUDPermission): void {
    if (confirm(`Are you sure you want to delete this permission for "${permission.group_name}"?`)) {
      if (!permission.id) return;

      this.crudPermissionsService.deletePermission(permission.id).subscribe({
        next: () => {
          this.snackBar.open('Permission deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadPermissions();
        },
        error: (err) => {
          console.error('Error deleting permission:', err);
          this.snackBar.open('Error deleting permission', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
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

  getPermissionGradient(permission: CRUDPermission): string {
    // Generate consistent gradient based on app name
    const appName = permission.content_type_name?.split('.')[0] || '';
    const hashCode = appName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return this.gradients[hashCode % this.gradients.length];
  }

  // Bulk mode methods
  toggleBulkMode(): void {
    this.bulkModeEnabled = !this.bulkModeEnabled;
    if (!this.bulkModeEnabled) {
      this.selectedPermissionIds.clear();
    }
  }

  togglePermissionSelection(permissionId: number): void {
    if (this.selectedPermissionIds.has(permissionId)) {
      this.selectedPermissionIds.delete(permissionId);
    } else {
      this.selectedPermissionIds.add(permissionId);
    }
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionIds.has(permissionId);
  }

  selectAllPermissionsInList(): void {
    this.permissions.forEach(p => {
      if (p.id) this.selectedPermissionIds.add(p.id);
    });
  }

  deselectAllPermissionsInList(): void {
    this.selectedPermissionIds.clear();
  }

  // Model selection methods for bulk create
  toggleModelSelection(modelId: number): void {
    if (this.selectedModelIds.has(modelId)) {
      this.selectedModelIds.delete(modelId);
    } else {
      this.selectedModelIds.add(modelId);
    }
  }

  isModelSelected(modelId: number): boolean {
    return this.selectedModelIds.has(modelId);
  }

  selectAllModels(): void {
    this.selectedAppModels.forEach(model => {
      if (model.id) this.selectedModelIds.add(model.id);
    });
  }

  deselectAllModels(): void {
    this.selectedModelIds.clear();
  }

  openBulkCreateDialog(): void {
    this.isBulkMode = true;
    this.editingPermission = null;
    this.selectedModelIds.clear();
    this.selectedAppModels = [];
    this.permissionForm.reset({
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
      contextArray: []
    });

    // Remove content_type requirement for bulk mode
    this.permissionForm.get('content_type')?.clearValidators();
    this.permissionForm.get('content_type')?.updateValueAndValidity();

    this.openDialog();
  }

  bulkUpdateSelectedPermissions(): void {
    if (this.selectedPermissionIds.size === 0) {
      this.snackBar.open('Please select permissions to update', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Open dialog to get new permission values
    const dialogRef = this.dialog.open(this.editDialog, {
      width: '400px',
      data: { bulkUpdate: true }
    });
  }

  bulkDeleteSelectedPermissions(): void {
    if (this.selectedPermissionIds.size === 0) {
      this.snackBar.open('Please select permissions to delete', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedPermissionIds.size} permissions?`)) {
      const ids = Array.from(this.selectedPermissionIds);
      this.crudPermissionsService.bulkDeletePermissions(ids).subscribe({
        next: (response) => {
          this.snackBar.open(
            `${response.deleted_count} permissions deleted successfully`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.selectedPermissionIds.clear();
          this.toggleBulkMode();
          this.loadPermissions();
        },
        error: (err) => {
          console.error('Error deleting permissions:', err);
          this.snackBar.open('Error deleting permissions', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  savePermission(): void {
    if (!this.permissionForm.valid) return;

    this.isSaving = true;
    const formData = this.permissionForm.value;

    if (this.isBulkMode) {
      // Bulk create
      if (this.selectedModelIds.size === 0) {
        this.snackBar.open('Please select at least one model', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isSaving = false;
        return;
      }

      const bulkData = {
        group: formData.group,
        content_types: Array.from(this.selectedModelIds),
        contexts: formData.contextArray,
        can_create: formData.can_create,
        can_read: formData.can_read,
        can_update: formData.can_update,
        can_delete: formData.can_delete
      };

      this.crudPermissionsService.bulkCreatePermissions(bulkData).subscribe({
        next: (response) => {
          this.snackBar.open(
            `${response.created_count} permissions created successfully`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          if (response.errors.length > 0) {
            console.warn('Bulk create errors:', response.errors);
          }
          this.loadPermissions();
          this.dialog.closeAll();
          this.isSaving = false;
          this.isBulkMode = false;
          this.selectedModelIds.clear();
        },
        error: (err) => {
          console.error('Error creating permissions:', err);
          this.snackBar.open('Error creating permissions', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSaving = false;
        }
      });
    } else {
      // Single create/update (existing code)
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
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.loadPermissions();
          this.dialog.closeAll();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error saving permission:', err);
          this.snackBar.open('Error saving permission', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSaving = false;
        }
      });
    }
  }
}
