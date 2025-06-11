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
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Field Types Management</h1>
            <p>Configure available field types for dynamic form generation</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Field Type
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>input</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ fieldTypes.length }}</h3>
            <p>Total Field Types</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveCount() }}</h3>
            <p>Active Types</p>
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
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading field types...</p>
      </div>

      <!-- Field Types Grid -->
      <div class="field-types-grid" *ngIf="!isLoading">
        <mat-card *ngFor="let fieldType of fieldTypes" class="field-type-card"
                  [class.inactive]="!fieldType.active_ind">
          <mat-card-header>
            <div class="card-header-content">
              <div class="field-type-icon" [style.background]="getFieldTypeColor(fieldType.code)">
                <mat-icon>{{ getFieldTypeIcon(fieldType.code) }}</mat-icon>
              </div>
              <div class="field-type-info">
                <h3>{{ fieldType.name }}</h3>
                <p>{{ fieldType.name_ara }}</p>
                <div class="field-type-code">{{ fieldType.code }}</div>
              </div>
              <div class="card-actions">
                <button mat-icon-button (click)="editFieldType(fieldType)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        (click)="toggleStatus(fieldType)"
                        [matTooltip]="fieldType.active_ind ? 'Deactivate' : 'Activate'">
                  <mat-icon>{{ fieldType.active_ind ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteFieldType(fieldType)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="field-type-description">
              {{ getFieldTypeDescription(fieldType.code) }}
            </div>
            <div class="field-type-category">
              <mat-chip [style.background]="getCategoryColor(getFieldTypeCategory(fieldType.code))">
                {{ getFieldTypeCategory(fieldType.code) }}
              </mat-chip>
            </div>
          </mat-card-content>

          <div class="status-indicator" [class]="fieldType.active_ind ? 'active' : 'inactive'">
            <span>{{ fieldType.active_ind ? 'Active' : 'Inactive' }}</span>
          </div>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="fieldTypes.length === 0">
          <mat-icon>input</mat-icon>
          <h3>No field types found</h3>
          <p>Start by creating your first field type</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create First Field Type
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <ng-template #editDialog>
      <div mat-dialog-title>{{ editingFieldType?.id ? 'Edit' : 'Create' }} Field Type</div>
      <mat-dialog-content>
        <form [formGroup]="fieldTypeForm" class="field-type-form">
          <mat-form-field appearance="outline">
            <mat-label>Name (English)</mat-label>
            <input matInput formControlName="name" placeholder="Enter field type name">
            <mat-error *ngIf="fieldTypeForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Name (Arabic)</mat-label>
            <input matInput formControlName="name_ara" placeholder="Enter Arabic name">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput
                   formControlName="code"
                   placeholder="FIELD_TYPE_CODE"
                   style="text-transform: uppercase;">
            <mat-hint>Use uppercase letters and underscores only</mat-hint>
            <mat-error *ngIf="fieldTypeForm.get('code')?.hasError('required')">
              Code is required
            </mat-error>
            <mat-error *ngIf="fieldTypeForm.get('code')?.hasError('pattern')">
              Code must contain only uppercase letters and underscores
            </mat-error>
          </mat-form-field>

          <mat-checkbox formControlName="active_ind" class="active-checkbox">
            Active
          </mat-checkbox>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveFieldType()"
                [disabled]="!fieldTypeForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingFieldType?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .field-types-management {
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
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
      &.categories-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
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

    .field-types-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .field-type-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      &.inactive {
        opacity: 0.6;
        border-color: #e2e8f0;
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--field-type-color, linear-gradient(90deg, #667eea, #764ba2));
      }
    }

    .card-header-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    .field-type-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .field-type-info {
      flex: 1;
    }

    .field-type-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
    }

    .field-type-info p {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .field-type-code {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-family: monospace;
      font-weight: 600;
      display: inline-block;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .field-type-description {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .field-type-category {
      margin-bottom: 16px;
    }

    .field-type-category mat-chip {
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;

      &.active {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.inactive {
        background: rgba(148, 163, 184, 0.1);
        color: #64748b;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
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

    .field-type-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .active-checkbox {
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .field-types-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .field-types-grid {
        grid-template-columns: 1fr;
      }

      .card-header-content {
        flex-wrap: wrap;
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
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        this.snackBar.open('Error loading field types', 'Close', { duration: 3000 });
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
      maxHeight: '90vh'
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
          { duration: 3000 }
        );
        this.loadFieldTypes();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving field type:', err);
        this.snackBar.open('Error saving field type', 'Close', { duration: 3000 });
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
            { duration: 2000 }
          );
          this.loadFieldTypes();
        },
        error: (err) => {
          console.error('Error updating field type status:', err);
          this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        }
      });
  }

  deleteFieldType(fieldType: FieldType): void {
    if (confirm(`Are you sure you want to delete "${fieldType.name}"?`)) {
      this.apiService.executeApiCall(`define/api/field-types/${fieldType.id}/`, 'DELETE')
        .subscribe({
          next: () => {
            this.snackBar.open('Field type deleted successfully', 'Close', { duration: 3000 });
            this.loadFieldTypes();
          },
          error: (err) => {
            console.error('Error deleting field type:', err);
            this.snackBar.open('Error deleting field type', 'Close', { duration: 3000 });
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
    return this.fieldTypeMetadata[code]?.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  getFieldTypeCategory(code: string): string {
    return this.fieldTypeMetadata[code]?.category || 'Other';
  }

  getFieldTypeDescription(code: string): string {
    return this.fieldTypeMetadata[code]?.description || 'Custom field type';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Basic Input': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
