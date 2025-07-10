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
      <!-- Compact Ocean Mint Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-icon">
              <mat-icon>dynamic_form</mat-icon>
            </div>
            <div>
              <h1>Fields Management</h1>
              <p>Create and manage dynamic fields</p>
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
              Add Field
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats Cards -->
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
            <p>Active</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon mandatory-icon">
            <mat-icon>star</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getMandatoryCount() }}</h3>
            <p>Required</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon nested-icon">
            <mat-icon>account_tree</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getNestedCount() }}</h3>
            <p>Nested</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40" color="primary"></mat-spinner>
        <p>Loading fields...</p>
      </div>

      <!-- Fields Container -->
      <div class="fields-container" *ngIf="!isLoading">
        <div class="fields-list">
          <div *ngFor="let field of getParentFields()"
               class="field-item"
               [class.expanded]="field.expanded">

            <!-- Field Header -->
            <div class="field-header" (click)="toggleFieldExpansion(field)">
              <div class="header-left">
                <div class="field-icon" [style.background]="getFieldTypeColor(field._field_type)">
                  <mat-icon>{{ getFieldTypeIcon(field._field_type) }}</mat-icon>
                </div>
                <div class="field-info">
                  <h3>{{ field._field_display_name }}</h3>
                  <span class="field-name">{{ field._field_name }}</span>
                </div>
              </div>
              <div class="header-right">
                <div class="field-badges">
                  <mat-chip class="type-chip">{{ getFieldTypeName(field._field_type) }}</mat-chip>
                  <mat-chip class="mandatory-chip" *ngIf="field._mandatory">Required</mat-chip>
                  <mat-chip class="hidden-chip" *ngIf="field._is_hidden">Hidden</mat-chip>
                  <mat-chip class="disabled-chip" *ngIf="field._is_disabled">Disabled</mat-chip>
                </div>
                <mat-icon class="expand-icon" *ngIf="field.id && getChildFields(field.id).length > 0">
                  {{ field.expanded ? 'expand_less' : 'expand_more' }}
                </mat-icon>
                <div class="field-actions">
                  <button mat-icon-button
                          (click)="editField(field, $event)"
                          class="action-btn"
                          matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="toggleStatus(field, $event)"
                          class="action-btn"
                          [matTooltip]="field.active_ind ? 'Deactivate' : 'Activate'">
                    <mat-icon>{{ field.active_ind ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="duplicateField(field, $event)"
                          class="action-btn"
                          matTooltip="Duplicate">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                  <button mat-icon-button
                          (click)="deleteField(field, $event)"
                          class="action-btn delete"
                          matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Field Properties -->
            <div class="field-properties" *ngIf="hasProperties(field)">
              <div class="property-item" *ngIf="field._lookup">
                <mat-icon>search</mat-icon>
                <span class="property-label">Lookup:</span>
                <span class="property-value">{{ getLookupName(field._lookup) }}</span>
              </div>
              <div class="property-item" *ngIf="field._max_length">
                <mat-icon>text_format</mat-icon>
                <span class="property-label">Max Length:</span>
                <span class="property-value">{{ field._max_length }}</span>
              </div>
              <div class="property-item" *ngIf="field._min_length">
                <mat-icon>short_text</mat-icon>
                <span class="property-label">Min Length:</span>
                <span class="property-value">{{ field._min_length }}</span>
              </div>
              <div class="property-item" *ngIf="field._value_greater_than !== null">
                <mat-icon>arrow_upward</mat-icon>
                <span class="property-label">Min Value:</span>
                <span class="property-value">{{ field._value_greater_than }}</span>
              </div>
              <div class="property-item" *ngIf="field._value_less_than !== null">
                <mat-icon>arrow_downward</mat-icon>
                <span class="property-label">Max Value:</span>
                <span class="property-value">{{ field._value_less_than }}</span>
              </div>
              <div class="property-item" *ngIf="field._default_value">
                <mat-icon>settings_suggest</mat-icon>
                <span class="property-label">Default:</span>
                <span class="property-value">{{ field._default_value }}</span>
              </div>
            </div>

            <!-- Child Fields -->
            <div class="children-container" *ngIf="field.expanded && field.id && getChildFields(field.id).length > 0">
              <div class="children-list">
                <div *ngFor="let child of field.id ? getChildFields(field.id) : []"
                     class="child-item">
                  <div class="child-left">
                    <mat-icon class="child-icon" [style.color]="getFieldTypeIconColor(child._field_type)">
                      {{ getFieldTypeIcon(child._field_type) }}
                    </mat-icon>
                    <span class="child-name">{{ child._field_display_name }}</span>
                    <mat-chip class="child-type">{{ getFieldTypeName(child._field_type) }}</mat-chip>
                  </div>
                  <div class="child-actions">
                    <button mat-icon-button
                            (click)="editField(child)"
                            matTooltip="Edit"
                            class="mini-btn">
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
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="fields.length === 0">
            <mat-icon>dynamic_form</mat-icon>
            <h3>No fields found</h3>
            <p>Create your first dynamic field</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Create Field
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Dialog -->
    <ng-template #editDialog>
      <h2 mat-dialog-title>
        <mat-icon>{{ editingField?.id ? 'edit' : 'add' }}</mat-icon>
        {{ editingField?.id ? 'Edit' : 'Create' }} Field
      </h2>

      <mat-dialog-content class="dialog-content">
        <mat-tab-group class="compact-tabs">
          <!-- Basic Information Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>info</mat-icon>
              Basic Info
            </ng-template>
            <form [formGroup]="fieldForm" class="compact-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Field Name (Internal)</mat-label>
                  <input matInput formControlName="_field_name" placeholder="field_name">
                  <mat-icon matPrefix>label</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Display Name</mat-label>
                  <input matInput formControlName="_field_display_name" placeholder="Display Name">
                  <mat-icon matPrefix>text_fields</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Field Type</mat-label>
                <mat-select formControlName="_field_type" (selectionChange)="onFieldTypeChange($event.value)">
                  <mat-option *ngFor="let type of fieldTypes" [value]="type.id">
                    {{ type.name }} ({{ type.code }})
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="showLookupField()">
                <mat-label>Lookup</mat-label>
                <mat-select formControlName="_lookup">
                  <mat-option [value]="null">No Lookup</mat-option>
                  <mat-option *ngFor="let lookup of parentLookups" [value]="lookup.id">
                    {{ lookup.name }}
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="!editingField?.id">
                <mat-label>Parent Field</mat-label>
                <mat-select formControlName="_parent_field">
                  <mat-option [value]="null">No Parent (Root Field)</mat-option>
                  <mat-option *ngFor="let field of getParentFields()" [value]="field.id">
                    {{ field._field_display_name }}
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>account_tree</mat-icon>
              </mat-form-field>

              <div class="checkbox-group">
                <mat-checkbox formControlName="_mandatory">
                  <mat-icon>star</mat-icon>
                  Required Field
                </mat-checkbox>
                <mat-checkbox formControlName="_is_hidden">
                  <mat-icon>visibility_off</mat-icon>
                  Hidden
                </mat-checkbox>
                <mat-checkbox formControlName="_is_disabled">
                  <mat-icon>block</mat-icon>
                  Disabled
                </mat-checkbox>
                <mat-checkbox formControlName="active_ind">
                  <mat-icon>check_circle</mat-icon>
                  Active
                </mat-checkbox>
              </div>
            </form>
          </mat-tab>

          <!-- Validation Tab -->
          <mat-tab *ngIf="showValidationTab()">
            <ng-template mat-tab-label>
              <mat-icon>rule</mat-icon>
              Validation
            </ng-template>
            <form [formGroup]="fieldForm" class="compact-form validation-form">
              <!-- Text Validation -->
              <div *ngIf="isTextFieldType()" class="validation-section">
                <h4>
                  <mat-icon>text_fields</mat-icon>
                  Text Validation
                </h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Length</mat-label>
                    <input matInput type="number" formControlName="_min_length">
                    <mat-icon matPrefix>short_text</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Length</mat-label>
                    <input matInput type="number" formControlName="_max_length">
                    <mat-icon matPrefix>text_format</mat-icon>
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline">
                  <mat-label>Regex Pattern</mat-label>
                  <input matInput formControlName="_regex_pattern" placeholder="^[a-zA-Z0-9]+$">
                  <mat-icon matPrefix>pattern</mat-icon>
                </mat-form-field>
              </div>

              <!-- Number Validation -->
              <div *ngIf="isNumberFieldType()" class="validation-section">
                <h4>
                  <mat-icon>pin</mat-icon>
                  Number Validation
                </h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Value</mat-label>
                    <input matInput type="number" formControlName="_value_greater_than">
                    <mat-icon matPrefix>arrow_upward</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Value</mat-label>
                    <input matInput type="number" formControlName="_value_less_than">
                    <mat-icon matPrefix>arrow_downward</mat-icon>
                  </mat-form-field>
                </div>
                <div class="checkbox-group">
                  <mat-checkbox formControlName="_integer_only">
                    <mat-icon>looks_one</mat-icon>
                    Integer Only
                  </mat-checkbox>
                  <mat-checkbox formControlName="_positive_only">
                    <mat-icon>add</mat-icon>
                    Positive Only
                  </mat-checkbox>
                </div>
                <mat-form-field appearance="outline" *ngIf="isDecimalFieldType()">
                  <mat-label>Decimal Precision</mat-label>
                  <input matInput type="number" formControlName="_precision">
                  <mat-icon matPrefix>more_horiz</mat-icon>
                </mat-form-field>
              </div>

              <!-- Date Validation -->
              <div *ngIf="isDateFieldType()" class="validation-section">
                <h4>
                  <mat-icon>date_range</mat-icon>
                  Date Validation
                </h4>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Min Date</mat-label>
                    <input matInput type="date" formControlName="_date_greater_than">
                    <mat-icon matPrefix>arrow_back</mat-icon>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max Date</mat-label>
                    <input matInput type="date" formControlName="_date_less_than">
                    <mat-icon matPrefix>arrow_forward</mat-icon>
                  </mat-form-field>
                </div>
                <div class="checkbox-group">
                  <mat-checkbox formControlName="_future_only">
                    <mat-icon>update</mat-icon>
                    Future Dates Only
                  </mat-checkbox>
                  <mat-checkbox formControlName="_past_only">
                    <mat-icon>history</mat-icon>
                    Past Dates Only
                  </mat-checkbox>
                </div>
              </div>

              <!-- File Validation -->
              <div *ngIf="isFileFieldType()" class="validation-section">
                <h4>
                  <mat-icon>attach_file</mat-icon>
                  File Validation
                </h4>
                <mat-form-field appearance="outline">
                  <mat-label>Allowed File Types</mat-label>
                  <input matInput formControlName="_file_types" placeholder=".pdf,.docx,.jpg,.png">
                  <mat-icon matPrefix>extension</mat-icon>
                  <mat-hint>Comma-separated file extensions</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Max File Size (bytes)</mat-label>
                  <input matInput type="number" formControlName="_max_file_size">
                  <mat-icon matPrefix>storage</mat-icon>
                </mat-form-field>
              </div>

              <!-- Default Value -->
              <div class="validation-section">
                <h4>
                  <mat-icon>settings_suggest</mat-icon>
                  Default Value
                </h4>
                <mat-form-field appearance="outline">
                  <mat-label>Default Value</mat-label>
                  <input matInput formControlName="_default_value">
                  <mat-icon matPrefix>input</mat-icon>
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
          <mat-spinner diameter="16" *ngIf="isSaving"></mat-spinner>
          {{ editingField?.id ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .fields-management {
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
      &.mandatory-icon { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
      &.nested-icon { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

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

    /* Fields Container */
    .fields-container {
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

    .fields-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Field Item */
    .field-item {
      border: 1px solid #E5E7EB;
      border-radius: 10px;
      overflow: hidden;
      transition: all 0.2s ease;

      &.expanded {
        border-color: rgba(52, 197, 170, 0.3);
        box-shadow: 0 2px 4px rgba(52, 197, 170, 0.1);
      }
    }

    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      cursor: pointer;
      background: #FAFBFC;
      transition: background 0.2s ease;

      &:hover {
        background: #F3F4F6;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .field-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .field-info h3 {
      margin: 0 0 2px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #2F4858;
    }

    .field-name {
      font-size: 0.75rem;
      color: #6B7280;
      font-family: monospace;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .field-badges {
      display: flex;
      gap: 6px;
    }

    .type-chip, .mandatory-chip, .hidden-chip, .disabled-chip {
      height: 22px;
      font-size: 0.7rem;
      padding: 0 10px;
    }

    .type-chip {
      background: rgba(102, 126, 234, 0.1);
      color: #667EEA;
    }

    .mandatory-chip {
      background: rgba(245, 158, 11, 0.1);
      color: #F59E0B;
    }

    .hidden-chip {
      background: rgba(107, 114, 128, 0.1);
      color: #6B7280;
    }

    .disabled-chip {
      background: rgba(239, 68, 68, 0.1);
      color: #EF4444;
    }

    .expand-icon {
      color: #6B7280;
      margin-right: 8px;
    }

    .field-actions {
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

    /* Field Properties */
    .field-properties {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      padding: 12px;
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
      border-bottom: 1px solid #E5E7EB;
    }

    .property-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #F3F4F6;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #34C5AA;
      }
    }

    .property-label {
      font-size: 0.75rem;
      color: #6B7280;
      font-weight: 500;
    }

    .property-value {
      font-size: 0.8rem;
      color: #2F4858;
      font-weight: 500;
    }

    /* Children Container */
    .children-container {
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
    }

    .children-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .child-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(52, 197, 170, 0.3);
        background: rgba(196, 247, 239, 0.1);
      }
    }

    .child-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .child-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .child-name {
      font-weight: 500;
      color: #2F4858;
      font-size: 0.875rem;
    }

    .child-type {
      height: 18px;
      font-size: 0.65rem;
      padding: 0 8px;
      background: rgba(102, 126, 234, 0.1);
      color: #667EEA;
    }

    .mini-btn {
      width: 28px;
      height: 28px;
      color: #6B7280;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: #34C5AA;
      }
    }

    .add-child-btn {
      margin: 8px;
      color: #34C5AA;
      border: 2px dashed rgba(52, 197, 170, 0.3);
      border-radius: 8px;
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
      padding: 0 !important;
      overflow: hidden !important;
    }

    .compact-tabs {
      ::ng-deep .mat-mdc-tab-label {
        min-width: 120px;

        mat-icon {
          margin-right: 8px;
        }
      }

      ::ng-deep .mat-mdc-tab-body-content {
        padding: 20px 24px;
      }
    }

    .compact-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .compact-form mat-form-field {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: white !important;
      }
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;

      mat-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #34C5AA;
        }
      }
    }

    .validation-section {
      margin-bottom: 20px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .validation-section h4 {
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
      .fields-management {
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

      .field-header {
        flex-wrap: wrap;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
        margin-top: 8px;
      }

      .field-properties {
        grid-template-columns: 1fr;
      }

      .checkbox-group {
        grid-template-columns: 1fr;
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

  // Ocean Mint gradients
  private gradients = [
    'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
    'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  ];

  private iconColors = ['#34C5AA', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];

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
        this.fields = response.results.map((field: any) => ({
          ...field,
          expanded: false
        }));
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading fields:', err);
        this.snackBar.open('Error loading fields', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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
    this.http.get<LookupItem[]>(`${baseUrl}/lookups/management/parents/`)
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

  toggleFieldExpansion(field: any): void {
    if (field.id && this.getChildFields(field.id).length > 0) {
      field.expanded = !field.expanded;
    }
  }

  openCreateDialog(): void {
    this.editingField = null;
    this.fieldForm.reset({ active_ind: true, _mandatory: false });
    this.openDialog();
  }

  editField(field: Field, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
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
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'compact-dialog'
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
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.loadData();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving field:', err);
        this.snackBar.open('Error saving field', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSaving = false;
      }
    });
  }

  toggleStatus(field: Field, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const updatedField = { ...field, active_ind: !field.active_ind };

    this.apiService.executeApiCall(`define/api/fields/${field.id}/`, 'PUT', updatedField)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Field ${updatedField.active_ind ? 'activated' : 'deactivated'}`,
            'Close',
            {
              duration: 2000,
              panelClass: ['info-snackbar']
            }
          );
          this.loadData();
        },
        error: (err) => {
          console.error('Error updating field status:', err);
          this.snackBar.open('Error updating status', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  duplicateField(field: Field, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
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

  deleteField(field: Field, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm(`Are you sure you want to delete "${field._field_display_name}"?`)) {
      this.apiService.executeApiCall(`define/api/fields/${field.id}/`, 'DELETE')
        .subscribe({
          next: () => {
            this.snackBar.open('Field deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadData();
          },
          error: (err) => {
            console.error('Error deleting field:', err);
            this.snackBar.open('Error deleting field', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
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
    return this.gradients[fieldTypeId % this.gradients.length];
  }

  getFieldTypeIconColor(fieldTypeId: number): string {
    return this.iconColors[fieldTypeId % this.iconColors.length];
  }

  getLookupName(lookupId: number): string {
    const lookup = this.parentLookups.find(l => l.id === lookupId);
    return lookup ? lookup.name : 'Unknown Lookup';
  }

  hasProperties(field: Field): boolean {
    return !!(field._lookup || field._max_length || field._min_length ||
      field._value_greater_than !== null || field._value_less_than !== null ||
      field._default_value);
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
