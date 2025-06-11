// components/settings/fields-management/fields-management.component.ts
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
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
import { ApiService, Field, FieldType } from '../../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

interface LookupItem {
  id: number;
  name: string;
  name_ara?: string;
  parent_lookup?: number | null;
  type: number;
}

@Component({
  selector: 'app-fields-management',
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
    <div class="fields-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Fields Management</h1>
            <p>Create and manage dynamic fields with validation rules and properties</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Field
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>dynamic_form</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ fields.length }}</h3>
            <p>Total Fields</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveCount() }}</h3>
            <p>Active Fields</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon mandatory-icon">
            <mat-icon>star</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getMandatoryCount() }}</h3>
            <p>Required Fields</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon nested-icon">
            <mat-icon>account_tree</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getNestedCount() }}</h3>
            <p>Nested Fields</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading fields...</p>
      </div>

      <!-- Fields List -->
      <div class="fields-content" *ngIf="!isLoading">
        <mat-card *ngFor="let field of getParentFields()" class="field-card">
          <mat-card-header>
            <div class="field-header">
              <div class="field-icon" [style.background]="getFieldTypeColor(field._field_type)">
                <mat-icon>{{ getFieldTypeIcon(field._field_type) }}</mat-icon>
              </div>
              <div class="field-info">
                <h3>{{ field._field_display_name }}</h3>
                <p class="field-name">{{ field._field_name }}</p>
                <div class="field-badges">
                  <span class="field-type-badge">{{ getFieldTypeName(field._field_type) }}</span>
                  <span class="mandatory-badge" *ngIf="field._mandatory">Required</span>
                  <span class="hidden-badge" *ngIf="field._is_hidden">Hidden</span>
                  <span class="disabled-badge" *ngIf="field._is_disabled">Disabled</span>
                </div>
              </div>
              <div class="field-actions">
                <button mat-icon-button (click)="editField(field)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        (click)="toggleStatus(field)"
                        [matTooltip]="field.active_ind ? 'Deactivate' : 'Activate'">
                  <mat-icon>{{ field.active_ind ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="duplicateField(field)" matTooltip="Duplicate">
                  <mat-icon>content_copy</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteField(field)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Field Properties -->
            <div class="field-properties">
              <div class="property-row" *ngIf="field._lookup">
                <span class="property-label">Lookup:</span>
                <span class="property-value">{{ getLookupName(field._lookup) }}</span>
              </div>
              <div class="property-row" *ngIf="field._max_length">
                <span class="property-label">Max Length:</span>
                <span class="property-value">{{ field._max_length }}</span>
              </div>
              <div class="property-row" *ngIf="field._min_length">
                <span class="property-label">Min Length:</span>
                <span class="property-value">{{ field._min_length }}</span>
              </div>
              <div class="property-row" *ngIf="field._value_greater_than !== null">
                <span class="property-label">Min Value:</span>
                <span class="property-value">{{ field._value_greater_than }}</span>
              </div>
              <div class="property-row" *ngIf="field._value_less_than !== null">
                <span class="property-label">Max Value:</span>
                <span class="property-value">{{ field._value_less_than }}</span>
              </div>
              <div class="property-row" *ngIf="field._default_value">
                <span class="property-label">Default Value:</span>
                <span class="property-value">{{ field._default_value }}</span>
              </div>
            </div>

            <!-- Child Fields -->
            <div class="child-fields" *ngIf="field.id && getChildFields(field.id).length > 0">
              <h4>Child Fields ({{ field.id ? getChildFields(field.id).length : 0 }})</h4>
              <div class="child-fields-list">
                <div *ngFor="let child of field.id ? getChildFields(field.id) : []" class="child-field-item">
                  <div class="child-field-icon">
                    <mat-icon>{{ getFieldTypeIcon(child._field_type) }}</mat-icon>
                  </div>
                  <div class="child-field-info">
                    <span class="child-field-name">{{ child._field_display_name }}</span>
                    <span class="child-field-type">{{ getFieldTypeName(child._field_type) }}</span>
                  </div>
                  <div class="child-field-actions">
                    <button mat-icon-button (click)="editField(child)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <button mat-button (click)="addChildField(field)" class="add-child-btn">
                <mat-icon>add</mat-icon>
                Add Child Field
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="fields.length === 0">
          <mat-icon>dynamic_form</mat-icon>
          <h3>No fields found</h3>
          <p>Start by creating your first dynamic field</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create First Field
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <ng-template #editDialog>
      <div mat-dialog-title>{{ editingField?.id ? 'Edit' : 'Create' }} Field</div>
      <mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Info">
            <form [formGroup]="fieldForm" class="field-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Field Name (Internal)</mat-label>
                  <input matInput formControlName="_field_name" placeholder="field_name">
                  <mat-error *ngIf="fieldForm.get('_field_name')?.hasError('required')">
                    Field name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Display Name</mat-label>
                  <input matInput formControlName="_field_display_name" placeholder="Field Display Name">
                  <mat-error *ngIf="fieldForm.get('_field_display_name')?.hasError('required')">
                    Display name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Field Type</mat-label>
                <mat-select formControlName="_field_type" (selectionChange)="onFieldTypeChange($event.value)">
                  <mat-option *ngFor="let type of fieldTypes" [value]="type.id">
                    {{ type.name }} ({{ type.code }})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="fieldForm.get('_field_type')?.hasError('required')">
                  Field type is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="showLookupField()">
                <mat-label>Lookup</mat-label>
                <mat-select formControlName="_lookup">
                  <mat-option [value]="null">No Lookup</mat-option>
                  <mat-option *ngFor="let lookup of parentLookups" [value]="lookup.id">
                    {{ lookup.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="!editingField?.id">
                <mat-label>Parent Field</mat-label>
                <mat-select formControlName="_parent_field">
                  <mat-option [value]="null">No Parent (Root Field)</mat-option>
                  <mat-option *ngFor="let field of getParentFields()" [value]="field.id">
                    {{ field._field_display_name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <div class="checkbox-row">
                <mat-checkbox formControlName="_mandatory">Required Field</mat-checkbox>
                <mat-checkbox formControlName="_is_hidden">Hidden</mat-checkbox>
                <mat-checkbox formControlName="_is_disabled">Disabled</mat-checkbox>
                <mat-checkbox formControlName="active_ind">Active</mat-checkbox>
              </div>
            </form>
          </mat-tab>

          <!-- Validation Tab -->
          <mat-tab label="Validation" *ngIf="showValidationTab()">
            <form [formGroup]="fieldForm" class="validation-form">
              <!-- Text Validation -->
              <div *ngIf="isTextFieldType()" class="validation-group">
                <h4>Text Validation</h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Length</mat-label>
                    <input matInput type="number" formControlName="_min_length">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Length</mat-label>
                    <input matInput type="number" formControlName="_max_length">
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline">
                  <mat-label>Regex Pattern</mat-label>
                  <input matInput formControlName="_regex_pattern" placeholder="^[a-zA-Z0-9]+$">
                </mat-form-field>
              </div>

              <!-- Number Validation -->
              <div *ngIf="isNumberFieldType()" class="validation-group">
                <h4>Number Validation</h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Value</mat-label>
                    <input matInput type="number" formControlName="_value_greater_than">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Value</mat-label>
                    <input matInput type="number" formControlName="_value_less_than">
                  </mat-form-field>
                </div>
                <div class="checkbox-row">
                  <mat-checkbox formControlName="_integer_only">Integer Only</mat-checkbox>
                  <mat-checkbox formControlName="_positive_only">Positive Only</mat-checkbox>
                </div>
                <mat-form-field appearance="outline" *ngIf="isDecimalFieldType()">
                  <mat-label>Decimal Precision</mat-label>
                  <input matInput type="number" formControlName="_precision">
                </mat-form-field>
              </div>

              <!-- Date Validation -->
              <div *ngIf="isDateFieldType()" class="validation-group">
                <h4>Date Validation</h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Date</mat-label>
                    <input matInput type="date" formControlName="_date_greater_than">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Date</mat-label>
                    <input matInput type="date" formControlName="_date_less_than">
                  </mat-form-field>
                </div>
                <div class="checkbox-row">
                  <mat-checkbox formControlName="_future_only">Future Dates Only</mat-checkbox>
                  <mat-checkbox formControlName="_past_only">Past Dates Only</mat-checkbox>
                </div>
              </div>

              <!-- File Validation -->
              <div *ngIf="isFileFieldType()" class="validation-group">
                <h4>File Validation</h4>
                <mat-form-field appearance="outline">
                  <mat-label>Allowed File Types</mat-label>
                  <input matInput formControlName="_file_types" placeholder=".pdf,.docx,.jpg,.png">
                  <mat-hint>Comma-separated file extensions</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Max File Size (bytes)</mat-label>
                  <input matInput type="number" formControlName="_max_file_size">
                </mat-form-field>
              </div>

              <!-- Default Value -->
              <div class="validation-group">
                <h4>Default Value</h4>
                <mat-form-field appearance="outline">
                  <mat-label>Default Value</mat-label>
                  <input matInput formControlName="_default_value">
                </mat-form-field>
              </div>
            </form>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveField()"
                [disabled]="!fieldForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingField?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .fields-management {
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
      &.mandatory-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
      &.nested-icon { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
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

    .fields-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .field-card {
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

    .field-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    .field-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .field-info {
      flex: 1;
    }

    .field-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
    }

    .field-name {
      margin: 0 0 8px 0;
      color: #64748b;
      font-size: 0.9rem;
      font-family: monospace;
    }

    .field-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .field-type-badge, .mandatory-badge, .hidden-badge, .disabled-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .field-type-badge {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }

    .mandatory-badge {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .hidden-badge {
      background: rgba(148, 163, 184, 0.1);
      color: #64748b;
    }

    .disabled-badge {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .field-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .field-properties {
      margin-bottom: 16px;
    }

    .property-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .property-label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.9rem;
    }

    .property-value {
      color: #334155;
      font-size: 0.9rem;
    }

    .child-fields {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #f1f5f9;
    }

    .child-fields h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 12px 0;
    }

    .child-fields-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .child-field-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .child-field-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(102, 126, 234, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
    }

    .child-field-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .child-field-name {
      font-weight: 500;
      color: #334155;
      font-size: 0.9rem;
    }

    .child-field-type {
      color: #64748b;
      font-size: 0.8rem;
    }

    .add-child-btn {
      color: #667eea;
      border: 2px dashed #e2e8f0;
      border-radius: 8px;
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

    .field-form, .validation-form {
      padding: 20px 0;
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

    .checkbox-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .validation-group {
      margin-bottom: 24px;
    }

    .validation-group h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }

    @media (max-width: 768px) {
      .fields-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .field-header {
        flex-wrap: wrap;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .checkbox-row {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class FieldsManagementComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  fields: Field[] = [];
  fieldTypes: FieldType[] = [];
  parentLookups: LookupItem[] = [];

  // Fix: Use definite assignment assertion to tell TypeScript this will be initialized
  fieldForm!: FormGroup;
  editingField: Field | null = null;
  selectedFieldType: FieldType | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForm(): void {
    this.fieldForm = this.fb.group({
      _field_name: ['', Validators.required],
      _field_display_name: ['', Validators.required],
      _field_type: [null, Validators.required],
      _lookup: [null],
      _parent_field: [null],
      _mandatory: [false],
      _is_hidden: [false],
      _is_disabled: [false],
      active_ind: [true],
      // Validation fields
      _min_length: [null],
      _max_length: [null],
      _regex_pattern: [''],
      _value_greater_than: [null],
      _value_less_than: [null],
      _integer_only: [false],
      _positive_only: [false],
      _precision: [null],
      _date_greater_than: [null],
      _date_less_than: [null],
      _future_only: [false],
      _past_only: [false],
      _file_types: [''],
      _max_file_size: [null],
      _default_value: ['']
    });
  }

  private loadData(): void {
    this.isLoading = true;

    // Load fields
    this.apiService.getFields().subscribe({
      next: (response) => {
        this.fields = response.results;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading fields:', err);
        this.snackBar.open('Error loading fields', 'Close', { duration: 3000 });
        this.checkLoadingComplete();
      }
    });

    // Load field types
    this.apiService.getFieldTypes().subscribe({
      next: (response) => {
        this.fieldTypes = response.results;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading field types:', err);
        this.checkLoadingComplete();
      }
    });

    // Load parent lookups
    this.loadParentLookups();
  }

  private loadParentLookups(): void {
    const baseUrl = this.configService.getBaseUrl();
    this.http.get<LookupItem[]>(`${baseUrl}/lookups/lookup/parents/`)
      .subscribe({
        next: (response) => {
          this.parentLookups = response;
          this.checkLoadingComplete();
        },
        error: (err) => {
          console.error('Error loading parent lookups:', err);
          this.checkLoadingComplete();
        }
      });
  }

  private checkLoadingComplete(): void {
    if (this.fields.length >= 0 && this.fieldTypes.length >= 0 && this.parentLookups.length >= 0) {
      this.isLoading = false;
    }
  }

  openCreateDialog(): void {
    this.editingField = null;
    this.fieldForm.reset({ active_ind: true, _mandatory: false });
    this.openDialog();
  }

  editField(field: Field): void {
    this.editingField = field;
    this.fieldForm.patchValue(field);
    this.selectedFieldType = this.fieldTypes.find(ft => ft.id === field._field_type) || null;
    this.openDialog();
  }

  addChildField(parentField: Field): void {
    this.editingField = null;
    this.fieldForm.reset({
      active_ind: true,
      _mandatory: false,
      _parent_field: parentField.id
    });
    this.openDialog();
  }

  private openDialog(): void {
    this.dialog.open(this.editDialog, {
      width: '700px',
      maxHeight: '90vh'
    });
  }

  onFieldTypeChange(fieldTypeId: number): void {
    this.selectedFieldType = this.fieldTypes.find(ft => ft.id === fieldTypeId) || null;
  }

  saveField(): void {
    if (!this.fieldForm.valid) return;

    this.isSaving = true;
    const fieldData = this.fieldForm.value;

    // Clean up null values
    Object.keys(fieldData).forEach(key => {
      if (fieldData[key] === null || fieldData[key] === '') {
        delete fieldData[key];
      }
    });

    const request = this.editingField?.id
      ? this.apiService.executeApiCall(`define/api/fields/${this.editingField.id}/`, 'PUT', fieldData)
      : this.apiService.executeApiCall('define/api/fields/', 'POST', fieldData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Field ${this.editingField?.id ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.loadData();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving field:', err);
        this.snackBar.open('Error saving field', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  toggleStatus(field: Field): void {
    const updatedField = { ...field, active_ind: !field.active_ind };

    this.apiService.executeApiCall(`define/api/fields/${field.id}/`, 'PUT', updatedField)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Field ${updatedField.active_ind ? 'activated' : 'deactivated'}`,
            'Close',
            { duration: 2000 }
          );
          this.loadData();
        },
        error: (err) => {
          console.error('Error updating field status:', err);
          this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        }
      });
  }

  duplicateField(field: Field): void {
    const duplicatedField = {
      ...field,
      _field_name: field._field_name + '_copy',
      _field_display_name: field._field_display_name + ' (Copy)',
      id: undefined
    };

    this.editingField = null;
    this.fieldForm.patchValue(duplicatedField);
    this.selectedFieldType = this.fieldTypes.find(ft => ft.id === field._field_type) || null;
    this.openDialog();
  }

  deleteField(field: Field): void {
    if (confirm(`Are you sure you want to delete "${field._field_display_name}"?`)) {
      this.apiService.executeApiCall(`define/api/fields/${field.id}/`, 'DELETE')
        .subscribe({
          next: () => {
            this.snackBar.open('Field deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting field:', err);
            this.snackBar.open('Error deleting field', 'Close', { duration: 3000 });
          }
        });
    }
  }

  refreshData(): void {
    this.loadData();
  }

  // Utility methods
  getParentFields(): Field[] {
    return this.fields.filter(field => !field._parent_field);
  }

  getChildFields(parentId: number): Field[] {
    return this.fields.filter(field => field._parent_field === parentId);
  }

  getActiveCount(): number {
    return this.fields.filter(field => field.active_ind).length;
  }

  getMandatoryCount(): number {
    return this.fields.filter(field => field._mandatory).length;
  }

  getNestedCount(): number {
    return this.fields.filter(field => field._parent_field).length;
  }

  getFieldTypeName(fieldTypeId: number): string {
    const fieldType = this.fieldTypes.find(ft => ft.id === fieldTypeId);
    return fieldType ? fieldType.name : 'Unknown';
  }

  getFieldTypeIcon(fieldTypeId: number): string {
    const fieldType = this.fieldTypes.find(ft => ft.id === fieldTypeId);
    if (!fieldType) return 'input';

    const iconMap: { [key: string]: string } = {
      'TEXT': 'text_fields',
      'TEXTAREA': 'subject',
      'NUMBER': 'pin',
      'DECIMAL': 'calculate',
      'BOOLEAN': 'toggle_on',
      'DATE': 'date_range',
      'DATETIME': 'schedule',
      'TIME': 'access_time',
      'CHOICE': 'radio_button_checked',
      'MULTI_CHOICE': 'check_box',
      'LOOKUP': 'search',
      'FILE': 'attach_file',
      'IMAGE': 'image',
      'EMAIL': 'email',
      'PHONE_NUMBER': 'phone'
    };

    return iconMap[fieldType.code] || 'input';
  }

  getFieldTypeColor(fieldTypeId: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return colors[fieldTypeId % colors.length];
  }

  getLookupName(lookupId: number): string {
    const lookup = this.parentLookups.find(l => l.id === lookupId);
    return lookup ? lookup.name : 'Unknown Lookup';
  }

  // Form validation helpers
  showLookupField(): boolean {
    if (!this.selectedFieldType) return false;
    return ['LOOKUP', 'CHOICE', 'MULTI_CHOICE'].includes(this.selectedFieldType.code);
  }

  showValidationTab(): boolean {
    return this.selectedFieldType !== null;
  }

  isTextFieldType(): boolean {
    if (!this.selectedFieldType) return false;
    return ['TEXT', 'TEXTAREA', 'EMAIL', 'URL'].includes(this.selectedFieldType.code);
  }

  isNumberFieldType(): boolean {
    if (!this.selectedFieldType) return false;
    return ['NUMBER', 'DECIMAL', 'CURRENCY', 'PERCENTAGE'].includes(this.selectedFieldType.code);
  }

  isDecimalFieldType(): boolean {
    if (!this.selectedFieldType) return false;
    return ['DECIMAL', 'CURRENCY'].includes(this.selectedFieldType.code);
  }

  isDateFieldType(): boolean {
    if (!this.selectedFieldType) return false;
    return ['DATE', 'DATETIME', 'TIME'].includes(this.selectedFieldType.code);
  }

  isFileFieldType(): boolean {
    if (!this.selectedFieldType) return false;
    return ['FILE', 'IMAGE'].includes(this.selectedFieldType.code);
  }
}
