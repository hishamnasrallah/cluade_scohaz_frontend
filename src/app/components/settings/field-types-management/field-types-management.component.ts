// components/settings/field-types-management/field-types-management.component.ts
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService, FieldType } from '../../../services/api.service';

@Component({
  selector: 'app-field-types-management',
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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="field-types-management">
      <!-- Compact Ocean Mint Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-icon">
              <mat-icon>input</mat-icon>
            </div>
            <div>
              <h1>Field Types</h1>
              <p>Configure field types for dynamic forms</p>
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
            <button mat-raised-button
                    color="primary"
                    (click)="openCreateDialog()"
                    class="create-btn">
              <mat-icon>add</mat-icon>
              Add Field Type
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>input</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ fieldTypes.length }}</h3>
            <p>Total Types</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveCount() }}</h3>
            <p>Active</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon categories-icon">
            <mat-icon>category</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getUniqueCategories().length }}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40" color="primary"></mat-spinner>
        <p>Loading field types...</p>
      </div>

      <!-- Field Types Container -->
      <div class="field-types-container" *ngIf="!isLoading">
        <div class="field-types-grid">
          <div *ngFor="let fieldType of fieldTypes"
               class="field-type-card"
               [class.inactive]="!fieldType.active_ind">

            <!-- Card Header -->
            <div class="card-header">
              <div class="field-type-icon" [style.background]="getFieldTypeColor(fieldType.code)">
                <mat-icon>{{ getFieldTypeIcon(fieldType.code) }}</mat-icon>
              </div>
              <div class="field-type-info">
                <h3>{{ fieldType.name }}</h3>
                <p>{{ fieldType.name_ara || 'No Arabic name' }}</p>
              </div>
              <div class="status-badge" [class.active]="fieldType.active_ind">
                {{ fieldType.active_ind ? 'Active' : 'Inactive' }}
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <div class="field-type-code">
                <mat-icon>code</mat-icon>
                <span>{{ fieldType.code }}</span>
              </div>
              <p class="field-type-description">
                {{ getFieldTypeDescription(fieldType.code) }}
              </p>
              <mat-chip class="category-chip" [style.background]="getCategoryColor(getFieldTypeCategory(fieldType.code))">
                {{ getFieldTypeCategory(fieldType.code) }}
              </mat-chip>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
              <button mat-icon-button
                      (click)="editFieldType(fieldType)"
                      class="action-btn"
                      matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button
                      (click)="toggleStatus(fieldType)"
                      class="action-btn"
                      [matTooltip]="fieldType.active_ind ? 'Deactivate' : 'Activate'">
                <mat-icon>{{ fieldType.active_ind ? 'toggle_on' : 'toggle_off' }}</mat-icon>
              </button>
              <button mat-icon-button
                      (click)="deleteFieldType(fieldType)"
                      class="action-btn delete"
                      matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="fieldTypes.length === 0">
            <mat-icon>input</mat-icon>
            <h3>No field types found</h3>
            <p>Create your first field type</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Create Field Type
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Dialog -->
    <ng-template #editDialog>
      <h2 mat-dialog-title>
        <mat-icon>{{ editingFieldType?.id ? 'edit' : 'add' }}</mat-icon>
        {{ editingFieldType?.id ? 'Edit' : 'Create' }} Field Type
      </h2>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="fieldTypeForm" class="compact-form">
          <mat-form-field appearance="outline">
            <mat-label>Name (English)</mat-label>
            <input matInput formControlName="name" placeholder="Field type name">
            <mat-icon matPrefix>label</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Name (Arabic)</mat-label>
            <input matInput formControlName="name_ara" placeholder="Arabic name" dir="rtl">
            <mat-icon matPrefix>translate</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput
                   formControlName="code"
                   placeholder="FIELD_TYPE_CODE"
                   style="text-transform: uppercase;">
            <mat-icon matPrefix>code</mat-icon>
            <mat-hint>Use uppercase letters and underscores only</mat-hint>
          </mat-form-field>

          <mat-checkbox formControlName="active_ind" class="status-checkbox">
            <mat-icon>{{ fieldTypeForm.get('active_ind')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
            Active Status
          </mat-checkbox>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveFieldType()"
                [disabled]="!fieldTypeForm.valid || isSaving">
          <mat-spinner diameter="16" *ngIf="isSaving"></mat-spinner>
          {{ editingFieldType?.id ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .field-types-management {
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
      &.active-icon { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }
      &.categories-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }

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

    /* Field Types Container */
    .field-types-container {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .field-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    /* Field Type Card */
    .field-type-card {
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      background: #FAFBFC;
      overflow: hidden;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        border-color: rgba(52, 197, 170, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(47, 72, 88, 0.08);
      }

      &.inactive {
        opacity: 0.7;

        .field-type-icon {
          filter: grayscale(50%);
        }
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--field-type-color);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .field-type-icon {
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

    .field-type-info {
      flex: 1;
    }

    .field-type-info h3 {
      margin: 0 0 2px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #2F4858;
    }

    .field-type-info p {
      margin: 0;
      color: #6B7280;
      font-size: 0.8rem;
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      background: rgba(107, 114, 128, 0.1);
      color: #6B7280;

      &.active {
        background: rgba(34, 197, 94, 0.1);
        color: #16A34A;
      }
    }

    .card-content {
      padding: 0 16px 16px;
    }

    .field-type-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F3F4F6;
      color: #475569;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-family: monospace;
      font-weight: 600;
      margin-bottom: 8px;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .field-type-description {
      color: #6B7280;
      font-size: 0.85rem;
      line-height: 1.4;
      margin: 8px 0;
    }

    .category-chip {
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
      height: 24px;
      padding: 0 12px;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      padding: 8px 12px;
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
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

    /* Empty State */
    .empty-state {
      grid-column: 1 / -1;
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

    .status-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #34C5AA;
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

    /* Responsive */
    @media (max-width: 768px) {
      .field-types-management {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .field-types-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FieldTypesManagementComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  fieldTypes: FieldType[] = [];

  fieldTypeForm: FormGroup;
  editingFieldType: FieldType | null = null;

  // Field type metadata for better UI
  private fieldTypeMetadata: { [key: string]: { icon: string, color: string, category: string, description: string } } = {
    'TEXT': {
      icon: 'text_fields',
      color: 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
      category: 'Basic Input',
      description: 'Single line text input field for short text content'
    },
    'TEXTAREA': {
      icon: 'subject',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      category: 'Basic Input',
      description: 'Multi-line text area for longer text content'
    },
    'NUMBER': {
      icon: 'pin',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'Numeric',
      description: 'Numeric input field with validation'
    },
    'DECIMAL': {
      icon: 'calculate',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      category: 'Numeric',
      description: 'Decimal number input with precision control'
    },
    'BOOLEAN': {
      icon: 'toggle_on',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      category: 'Selection',
      description: 'True/false checkbox or toggle input'
    },
    'DATE': {
      icon: 'date_range',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      category: 'Date & Time',
      description: 'Date picker input field'
    },
    'DATETIME': {
      icon: 'schedule',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'Date & Time',
      description: 'Date and time picker input field'
    },
    'TIME': {
      icon: 'access_time',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      category: 'Date & Time',
      description: 'Time picker input field'
    },
    'CHOICE': {
      icon: 'radio_button_checked',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'Selection',
      description: 'Single choice from predefined options'
    },
    'MULTI_CHOICE': {
      icon: 'check_box',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      category: 'Selection',
      description: 'Multiple choice from predefined options'
    },
    'LOOKUP': {
      icon: 'search',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      category: 'Reference',
      description: 'Lookup field referencing other data sources'
    },
    'FILE': {
      icon: 'attach_file',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      category: 'Media',
      description: 'File upload input with type restrictions'
    },
    'IMAGE': {
      icon: 'image',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'Media',
      description: 'Image upload with preview capabilities'
    },
    'EMAIL': {
      icon: 'email',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      category: 'Specialized',
      description: 'Email address input with validation'
    },
    'PHONE_NUMBER': {
      icon: 'phone',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'Specialized',
      description: 'Phone number input with formatting'
    },
    'URL': {
      icon: 'link',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      category: 'Specialized',
      description: 'URL input with validation'
    }
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService
  ) {
    this.fieldTypeForm = this.fb.group({
      name: ['', Validators.required],
      name_ara: [''],
      code: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
      active_ind: [true]
    });
  }

  ngOnInit(): void {
    this.loadFieldTypes();
  }

  loadFieldTypes(): void {
    this.isLoading = true;
    this.apiService.getFieldTypes().subscribe({
      next: (response) => {
        this.fieldTypes = response.results;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading field types:', err);
        this.snackBar.open('Error loading field types', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  openCreateDialog(): void {
    this.editingFieldType = null;
    this.fieldTypeForm.reset({ active_ind: true });
    this.openDialog();
  }

  editFieldType(fieldType: FieldType): void {
    this.editingFieldType = fieldType;
    this.fieldTypeForm.patchValue(fieldType);
    this.openDialog();
  }

  private openDialog(): void {
    this.dialog.open(this.editDialog, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'compact-dialog'
    });
  }

  saveFieldType(): void {
    if (!this.fieldTypeForm.valid) return;

    this.isSaving = true;
    const fieldTypeData = this.fieldTypeForm.value;

    // Transform code to uppercase
    fieldTypeData.code = fieldTypeData.code.toUpperCase();

    const request = this.editingFieldType?.id
      ? this.apiService.executeApiCall(`define/api/field-types/${this.editingFieldType.id}/`, 'PUT', fieldTypeData)
      : this.apiService.executeApiCall('define/api/field-types/', 'POST', fieldTypeData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Field type ${this.editingFieldType?.id ? 'updated' : 'created'} successfully`,
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.loadFieldTypes();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving field type:', err);
        this.snackBar.open('Error saving field type', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSaving = false;
      }
    });
  }

  toggleStatus(fieldType: FieldType): void {
    const updatedFieldType = { ...fieldType, active_ind: !fieldType.active_ind };

    this.apiService.executeApiCall(`define/api/field-types/${fieldType.id}/`, 'PUT', updatedFieldType)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Field type ${updatedFieldType.active_ind ? 'activated' : 'deactivated'}`,
            'Close',
            {
              duration: 2000,
              panelClass: ['info-snackbar']
            }
          );
          this.loadFieldTypes();
        },
        error: (err) => {
          console.error('Error updating field type status:', err);
          this.snackBar.open('Error updating status', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  deleteFieldType(fieldType: FieldType): void {
    if (confirm(`Are you sure you want to delete "${fieldType.name}"?`)) {
      this.apiService.executeApiCall(`define/api/field-types/${fieldType.id}/`, 'DELETE')
        .subscribe({
          next: () => {
            this.snackBar.open('Field type deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadFieldTypes();
          },
          error: (err) => {
            console.error('Error deleting field type:', err);
            this.snackBar.open('Error deleting field type', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  refreshData(): void {
    this.loadFieldTypes();
  }

  getActiveCount(): number {
    return this.fieldTypes.filter(ft => ft.active_ind).length;
  }

  getUniqueCategories(): string[] {
    const categories = new Set(
      this.fieldTypes.map(ft => this.getFieldTypeCategory(ft.code))
    );
    return Array.from(categories);
  }

  getFieldTypeIcon(code: string): string {
    return this.fieldTypeMetadata[code]?.icon || 'input';
  }

  getFieldTypeColor(code: string): string {
    return this.fieldTypeMetadata[code]?.color || 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)';
  }

  getFieldTypeCategory(code: string): string {
    return this.fieldTypeMetadata[code]?.category || 'Other';
  }

  getFieldTypeDescription(code: string): string {
    return this.fieldTypeMetadata[code]?.description || 'Custom field type';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Basic Input': 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
      'Numeric': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Selection': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Date & Time': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Reference': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Media': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Specialized': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Other': 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
    };
    return colors[category] || colors['Other'];
  }
}
