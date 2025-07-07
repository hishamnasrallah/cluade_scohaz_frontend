// src/app/components/template-builder/template-wizard/template-wizard.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule} from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  PDFTemplate,
  PDFTemplateParameter,
  PDFTemplateDataSource,
  WizardData,
  DesignerData,
  ContentTypeModel,
  PDFTemplateElement,
  PDFTemplateVariable
} from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-template-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    DragDropModule
  ],
  template: `
    <div class="wizard-container">
      <mat-stepper #stepper [linear]="true" class="template-wizard">
        <!-- Step 1: Basic Information -->
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">info</mat-icon>
              <div>
                <h2>Template Information</h2>
                <p>Provide basic details about your PDF template</p>
              </div>
            </div>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Template Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., Employee Report">
                <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                  Name is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Template Code</mat-label>
                <input matInput formControlName="code" placeholder="e.g., EMP_REPORT">
                <mat-hint>Unique identifier for the template</mat-hint>
                <mat-error *ngIf="basicInfoForm.get('code')?.hasError('required')">
                  Code is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Primary Language</mat-label>
                <mat-select formControlName="primary_language">
                  <mat-option value="en">English</mat-option>
                  <mat-option value="ar">Arabic</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="checkbox-field">
                <mat-slide-toggle formControlName="supports_bilingual">
                  Support Bilingual Content
                </mat-slide-toggle>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"
                        placeholder="Describe the purpose of this template"></textarea>
            </mat-form-field>

            <div *ngIf="basicInfoForm.get('supports_bilingual')?.value" class="arabic-fields">
              <mat-divider></mat-divider>
              <h3>Arabic Content</h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Arabic Name</mat-label>
                <input matInput formControlName="name_ara" dir="rtl">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Arabic Description</mat-label>
                <textarea matInput formControlName="description_ara" rows="3" dir="rtl"></textarea>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button (click)="cancel.emit()">Cancel</button>
              <button mat-button matStepperNext color="primary">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Page Setup -->
        <mat-step [stepControl]="pageSetupForm" label="Page Setup">
          <form [formGroup]="pageSetupForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">description</mat-icon>
              <div>
                <h2>Page Configuration</h2>
                <p>Set up the page layout and dimensions</p>
              </div>
            </div>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Page Size</mat-label>
                <mat-select formControlName="page_size">
                  <mat-option *ngFor="let size of designerData?.page_sizes || defaultPageSizes" [value]="size.value">
                    {{ size.label }}
                  </mat-option>
                </mat-select>
                <mat-hint *ngIf="!designerData && !loadingDesignerData">Using default page sizes</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Orientation</mat-label>
                <mat-select formControlName="orientation">
                  <mat-option value="portrait">Portrait</mat-option>
                  <mat-option value="landscape">Landscape</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="margins-section">
              <h3>Margins (in points)</h3>
              <div class="margins-grid" formGroupName="margins">
                <mat-form-field appearance="outline">
                  <mat-label>Top</mat-label>
                  <input matInput type="number" formControlName="top">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Bottom</mat-label>
                  <input matInput type="number" formControlName="bottom">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Left</mat-label>
                  <input matInput type="number" formControlName="left">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Right</mat-label>
                  <input matInput type="number" formControlName="right">
                </mat-form-field>
              </div>
            </div>

            <div class="page-options">
              <mat-slide-toggle formControlName="header_enabled">
                Enable Page Header
              </mat-slide-toggle>
              <mat-slide-toggle formControlName="footer_enabled">
                Enable Page Footer
              </mat-slide-toggle>
              <mat-slide-toggle formControlName="watermark_enabled">
                Enable Watermark
              </mat-slide-toggle>
            </div>

            <mat-form-field *ngIf="pageSetupForm.get('watermark_enabled')?.value"
                           appearance="outline" class="full-width">
              <mat-label>Watermark Text</mat-label>
              <input matInput formControlName="watermark_text" placeholder="e.g., CONFIDENTIAL">
            </mat-form-field>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-button matStepperNext color="primary">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Data Source -->
        <mat-step [stepControl]="dataSourceForm" label="Data Source">
          <form [formGroup]="dataSourceForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">storage</mat-icon>
              <div>
                <h2>Data Source Configuration</h2>
                <p>Define how the template will fetch data</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Data Source Type</mat-label>
              <mat-select formControlName="data_source_type" (selectionChange)="onDataSourceTypeChange()">
                <mat-option value="model">Model Query</mat-option>
                <mat-option value="raw_sql">Raw SQL</mat-option>
                <mat-option value="custom_function">Custom Function</mat-option>
                <mat-option value="api">External API</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Model Query Configuration -->
            <div *ngIf="dataSourceForm.get('data_source_type')?.value === 'model'" class="model-config">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Model</mat-label>
                <mat-select formControlName="content_type" (selectionChange)="onModelSelected($event.value)">
                  <mat-option *ngFor="let ct of contentTypes" [value]="ct.id">
                    <span class="model-option">
                      <strong>{{ ct.app_label }}</strong>.{{ ct.model }}
                    </span>
                  </mat-option>
                </mat-select>
                <mat-hint *ngIf="contentTypes.length === 0">No models available. Check API connection.</mat-hint>
              </mat-form-field>

              <div class="query-filter-section">
                <h3>Default Query Filters</h3>
                <p class="hint-text">Add filters that will be applied by default</p>

                <div class="filter-builder">
                  <!-- Existing filters -->
                  <div class="filters-list" *ngIf="queryFilters.length > 0">
                    <div *ngFor="let filter of queryFilters; let i = index" class="filter-row">
                      <!-- Field selection -->
                      <mat-form-field appearance="outline" class="filter-field">
                        <mat-label>Field</mat-label>
                        <mat-select [(ngModel)]="filter.field"
                                    (selectionChange)="onFilterFieldChange(filter)"
                                    [ngModelOptions]="{standalone: true}">
                          <mat-option *ngFor="let field of selectedContentType?.model_fields" [value]="field.name">
                            {{ field.verbose_name }} ({{ field.name }})
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <!-- Operator selection -->
                      <mat-form-field appearance="outline" class="filter-operator" *ngIf="filter.field">
                        <mat-label>Operator</mat-label>
                        <mat-select [(ngModel)]="filter.operator"
                                    (selectionChange)="onFilterOperatorChange(filter)"
                                    [ngModelOptions]="{standalone: true}">
                          <mat-option *ngFor="let op of getOperatorsForFilter(filter)" [value]="op.value">
                            {{ op.label }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <!-- Value input -->
                      <mat-form-field appearance="outline" class="filter-value" *ngIf="filter.field">
                        <mat-label>Value</mat-label>
                        <input matInput
                               [(ngModel)]="filter.value"
                               (blur)="onFilterValueChange(filter)"
                               [ngModelOptions]="{standalone: true}">
                      </mat-form-field>

                      <!-- Remove button -->
                      <button mat-icon-button color="warn" (click)="removeQueryFilter(i)" matTooltip="Remove filter">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Add filter button -->
                  <button mat-stroked-button (click)="addQueryFilter()" class="add-filter-btn">
                    <mat-icon>add</mat-icon>
                    Add Filter
                  </button>

                  <!-- Show current query filter JSON -->
                  <div class="query-preview" *ngIf="dataSourceForm.get('query_filter')?.value && Object.keys(dataSourceForm.get('query_filter')?.value).length > 0">
                    <h4>Query Preview:</h4>
                    <pre>{{ dataSourceForm.get('query_filter')?.value | json }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Raw SQL Configuration -->
            <div *ngIf="dataSourceForm.get('data_source_type')?.value === 'raw_sql'" class="sql-config">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>SQL Query</mat-label>
                <textarea matInput formControlName="raw_sql_query" rows="6"
                          placeholder="SELECT * FROM ..."></textarea>

              </mat-form-field>
            </div>

            <!-- Custom Function Configuration -->
            <div *ngIf="dataSourceForm.get('data_source_type')?.value === 'custom_function'" class="function-config">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Function Path</mat-label>
                <input matInput formControlName="custom_function_path"
                       placeholder="e.g., reporting_templates.custom_functions.fetch_employee_data">
                <mat-hint>Python module path to the function</mat-hint>
              </mat-form-field>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-button matStepperNext color="primary">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Parameters -->
        <mat-step [stepControl]="parametersForm" label="Parameters">
          <form [formGroup]="parametersForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">tune</mat-icon>
              <div>
                <h2>Template Parameters</h2>
                <p>Define input parameters for the template</p>
              </div>
            </div>

            <mat-slide-toggle formControlName="requires_parameters" class="mb-3">
              Template requires parameters
            </mat-slide-toggle>

            <div *ngIf="parametersForm.get('requires_parameters')?.value" class="parameters-section">
              <div class="parameters-list"
                   cdkDropList
                   (cdkDropListDropped)="dropParameter($event)">
                <div *ngFor="let param of parameters.controls; let i = index"
                     [formGroupName]="i"
                     class="parameter-item"
                     cdkDrag>
                  <div class="parameter-header">
                    <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                    <h4>Parameter {{ i + 1 }}</h4>
                    <button mat-icon-button (click)="removeParameter(i)" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="parameter-form">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Parameter Key</mat-label>
                        <input matInput formControlName="parameter_key"
                               placeholder="e.g., start_date">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Display Name</mat-label>
                        <input matInput formControlName="display_name"
                               placeholder="e.g., Start Date">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Type</mat-label>
                        <mat-select formControlName="parameter_type">
                          <mat-option *ngFor="let type of designerData?.parameter_types"
                                     [value]="type.value">
                            {{ type.label }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Widget Type</mat-label>
                        <mat-select formControlName="widget_type">
                          <mat-option *ngFor="let widget of getAvailableWidgets(param.get('parameter_type')?.value)"
                                     [value]="widget.value">
                            {{ widget.label }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>

                    <div class="parameter-options">
                      <mat-checkbox formControlName="is_required">Required</mat-checkbox>
                      <mat-checkbox formControlName="allow_user_override">Allow user override</mat-checkbox>
                    </div>
                  </div>
                </div>
              </div>

              <button mat-stroked-button (click)="addParameter()" class="add-parameter-btn">
                <mat-icon>add</mat-icon>
                Add Parameter
              </button>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-button matStepperNext color="primary">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 5: Additional Data Sources -->
        <mat-step [stepControl]="dataSourcesForm" label="Additional Data">
          <form [formGroup]="dataSourcesForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">layers</mat-icon>
              <div>
                <h2>Additional Data Sources</h2>
                <p>Add supplementary data sources for the template</p>
              </div>
            </div>

            <div class="data-sources-list">
              <mat-accordion>
                <mat-expansion-panel *ngFor="let source of dataSources.controls; let i = index"
                                    [formGroupName]="i">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      {{ source.get('display_name')?.value || 'Data Source ' + (i + 1) }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ source.get('fetch_method')?.value || 'Not configured' }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="data-source-form">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Source Key</mat-label>
                        <input matInput formControlName="source_key"
                               placeholder="e.g., user_cases">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Display Name</mat-label>
                        <input matInput formControlName="display_name"
                               placeholder="e.g., User Cases">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Fetch Method</mat-label>
                        <mat-select formControlName="fetch_method">
                          <mat-option *ngFor="let method of designerData?.fetch_methods"
                                     [value]="method.value">
                            {{ method.label }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Cache Timeout (seconds)</mat-label>
                        <input matInput type="number" formControlName="cache_timeout"
                               placeholder="0 for no cache">
                      </mat-form-field>
                    </div>

                    <button mat-button color="warn" (click)="removeDataSource(i)">
                      <mat-icon>delete</mat-icon>
                      Remove Data Source
                    </button>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <button mat-stroked-button (click)="addDataSource()" class="add-source-btn">
              <mat-icon>add</mat-icon>
              Add Data Source
            </button>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-button matStepperNext color="primary">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 6: Permissions -->
        <mat-step [stepControl]="permissionsForm" label="Permissions">
          <form [formGroup]="permissionsForm" class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">security</mat-icon>
              <div>
                <h2>Access Control</h2>
                <p>Configure who can use this template</p>
              </div>
            </div>

            <div class="permissions-options">
              <mat-slide-toggle formControlName="allow_self_generation">
                Allow users to generate reports for themselves
              </mat-slide-toggle>

              <mat-slide-toggle formControlName="allow_other_generation">
                Allow users to generate reports for others
              </mat-slide-toggle>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Restrict to Groups</mat-label>
              <mat-select formControlName="groups" multiple>
                <mat-option *ngFor="let group of availableGroups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
              <mat-hint>Leave empty for all users</mat-hint>
            </mat-form-field>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-button color="primary" (click)="completeWizard()">
                <mat-icon>check</mat-icon>
                Complete
              </button>
            </div>
          </form>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .wizard-container {
      height: 100%;
      overflow-y: auto;
      background: #f8fafb;
    }

    .template-wizard {
      height: 100%;
      background: transparent;
    }

    .step-content {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .step-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
    }

    .step-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #34c5aa, #2ba99b);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .step-header h2 {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .step-header p {
      margin: 0;
      color: #6b7280;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      height: 56px;
    }

    .arabic-fields {
      margin-top: 24px;
      padding-top: 24px;
    }

    .arabic-fields h3 {
      margin: 16px 0;
      color: #4b5563;
      font-size: 1.1rem;
    }

    /* Page Setup Styles */
    .margins-section {
      margin: 24px 0;
    }

    .margins-section h3 {
      margin: 0 0 16px 0;
      color: #4b5563;
      font-size: 1.1rem;
    }

    .margins-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .page-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }

    /* Data Source Styles */
    .model-config,
    .sql-config,
    .function-config {
      margin-top: 24px;
    }

    .query-filter-section {
      margin-top: 24px;
    }

    .query-filter-section h3 {
      margin: 0 0 8px 0;
      color: #4b5563;
      font-size: 1.1rem;
    }

    .hint-text {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0 0 16px 0;
    }

    /* Parameters Styles */
    .parameters-section {
      margin-top: 24px;
    }

    .parameters-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .parameter-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      cursor: move;

      &.cdk-drag-preview {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      &.cdk-drag-placeholder {
        opacity: 0.5;
      }
    }

    .parameter-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .drag-handle {
      color: #9ca3af;
      cursor: move;
    }

    .parameter-header h4 {
      flex: 1;
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
      color: #4b5563;
    }

    .parameter-options {
      display: flex;
      gap: 24px;
      margin-top: 16px;
    }

    .add-parameter-btn,
    .add-source-btn {
      width: 100%;
      border-style: dashed;
    }

    /* Data Sources Styles */
    .data-sources-list {
      margin-bottom: 24px;
    }

    .data-source-form {
      padding: 16px 0;
    }

    /* Permissions Styles */
    .permissions-options {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    /* Step Actions */
    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .mb-3 {
      margin-bottom: 24px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .step-content {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .margins-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    /* Query Filter Styles */
    .query-filter-section {
      margin-top: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .filters-list {
      margin-bottom: 16px;
    }

    .filter-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .filter-field {
      flex: 2;
    }

    .filter-operator {
      flex: 1;
    }

    .filter-value {
      flex: 2;
    }

    .add-filter-btn {
      width: 100%;
      border-style: dashed;
      margin-top: 8px;
    }

    .query-preview {
      margin-top: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 4px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4b5563;
      }

      pre {
        margin: 0;
        font-size: 0.875rem;
        color: #1f2937;
      }
    }
  `]
})
export class TemplateWizardComponent implements OnInit {
  @Input() template: PDFTemplate | null = null;
  @Output() save = new EventEmitter<PDFTemplate>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('stepper') stepper!: MatStepper;

  // Form groups for each step
  basicInfoForm!: FormGroup;
  pageSetupForm!: FormGroup;
  dataSourceForm!: FormGroup;
  parametersForm!: FormGroup;
  dataSourcesForm!: FormGroup;
  permissionsForm!: FormGroup;

// Data
  designerData: DesignerData | null = null;
  contentTypes: ContentTypeModel[] = [];
  availableGroups: any[] = []; // This should come from your auth/user service

// Default values for dropdowns
  defaultPageSizes = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'legal', label: 'Legal (8.5 × 14 in)' }
  ];

  // Loading states
  loadingDesignerData = false;
  loadingContentTypes = false;
  queryFilters: any[] = [];
  selectedContentType: ContentTypeModel | null = null;
  private filterUpdateSubject = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private pdfTemplateService: PDFTemplateService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
    if (this.template) {
      this.populateFormsFromTemplate();
    }

    // Add this subscription to debounce filter updates
    this.filterUpdateSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.performQueryFilterUpdate();
    });
  }

  ngOnDestroy(): void {
    this.filterUpdateSubject.complete();
  }

  private initializeForms(): void {
    // Step 1: Basic Information
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      name_ara: [''],
      description: [''],
      description_ara: [''],
      code: ['', Validators.required],
      primary_language: ['en'],
      supports_bilingual: [false]
    });

    // Step 2: Page Setup
    this.pageSetupForm = this.fb.group({
      page_size: ['A4'],
      orientation: ['portrait'],
      margins: this.fb.group({
        top: [72],
        bottom: [72],
        left: [72],
        right: [72]
      }),
      header_enabled: [true],
      footer_enabled: [true],
      watermark_enabled: [false],
      watermark_text: ['']
    });

    // Step 3: Data Source
    this.dataSourceForm = this.fb.group({
      data_source_type: ['model'],
      content_type: [null],
      query_filter: [{}],
      custom_function_path: [''],
      raw_sql_query: ['']
    });

    // Step 4: Parameters
    this.parametersForm = this.fb.group({
      requires_parameters: [false],
      parameters: this.fb.array([])
    });

    // Step 5: Additional Data Sources
    this.dataSourcesForm = this.fb.group({
      data_sources: this.fb.array([])
    });

    // Step 6: Permissions
    this.permissionsForm = this.fb.group({
      allow_self_generation: [true],
      allow_other_generation: [false],
      groups: [[]]
    });
  }

  private loadInitialData(): void {
    // Load designer data
    this.loadingDesignerData = true;
    this.pdfTemplateService.getDesignerData().subscribe({
      next: (data) => {
        this.designerData = data;
        // Use defaults if backend doesn't provide values
        if (!this.designerData.page_sizes || this.designerData.page_sizes.length === 0) {
          this.designerData.page_sizes = this.defaultPageSizes;
        }
        this.loadingDesignerData = false;
      },
      error: (error) => {
        console.error('Error loading designer data:', error);
        // Use default values on error
        this.designerData = {
          page_sizes: this.defaultPageSizes,
          fonts: [
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Courier', label: 'Courier' },
            { value: 'Verdana', label: 'Verdana' }
          ],
          text_aligns: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' }
          ],
          parameter_types: [
            { value: 'string', label: 'Text' },
            { value: 'integer', label: 'Number' },
            { value: 'float', label: 'Decimal' },
            { value: 'date', label: 'Date' },
            { value: 'datetime', label: 'Date & Time' },
            { value: 'boolean', label: 'Yes/No' }
          ],
          widget_types: [
            { value: 'text', label: 'Text Input' },
            { value: 'number', label: 'Number Input' },
            { value: 'date', label: 'Date Picker' },
            { value: 'select', label: 'Dropdown' },
            { value: 'checkbox', label: 'Checkbox' },
            { value: 'radio', label: 'Radio Buttons' }
          ],
          fetch_methods: [
            { value: 'model_query', label: 'Model Query' },
            { value: 'raw_sql', label: 'Raw SQL' },
            { value: 'custom_function', label: 'Custom Function' },
            { value: 'api', label: 'External API' }
          ]
        };
        this.loadingDesignerData = false;
      }
    });

// Load content types
    this.loadingContentTypes = true;
    this.pdfTemplateService.getContentTypes().subscribe({
      next: (types) => {
        console.log('Loaded content types:', types); // Debug log
        this.contentTypes = types;
        this.loadingContentTypes = false;
      },
      error: (error) => {
        console.error('Error loading content types:', error);
        console.error('Error details:', error.message, error.status); // More debug info
        this.contentTypes = []; // Ensure empty array on error
        this.loadingContentTypes = false;
      }
    });

    // TODO: Load available groups from your auth service
    this.availableGroups = [
      { id: 1, name: 'Administrators' },
      { id: 2, name: 'Managers' },
      { id: 3, name: 'Employees' }
    ];
  }

  private populateFormsFromTemplate(): void {
    if (!this.template) return;

    // Populate basic info
    this.basicInfoForm.patchValue({
      name: this.template.name,
      name_ara: this.template.name_ara,
      description: this.template.description,
      description_ara: this.template.description_ara,
      code: this.template.code,
      primary_language: this.template.primary_language,
      supports_bilingual: this.template.supports_bilingual
    });

    // Populate page setup
    this.pageSetupForm.patchValue({
      page_size: this.template.page_size,
      orientation: this.template.orientation,
      margins: {
        top: this.template.margin_top,
        bottom: this.template.margin_bottom,
        left: this.template.margin_left,
        right: this.template.margin_right
      },
      header_enabled: this.template.header_enabled,
      footer_enabled: this.template.footer_enabled,
      watermark_enabled: this.template.watermark_enabled,
      watermark_text: this.template.watermark_text
    });

    // Populate data source
    this.dataSourceForm.patchValue({
      data_source_type: this.template.data_source_type,
      content_type: this.template.content_type,
      query_filter: this.template.query_filter,
      custom_function_path: this.template.custom_function_path,
      raw_sql_query: this.template.raw_sql_query
    });

    // Populate parameters
    if (this.template.parameters) {
      this.parametersForm.patchValue({
        requires_parameters: this.template.requires_parameters
      });
      this.template.parameters.forEach(param => {
        this.addParameter(param);
      });
    }

    // Populate data sources
    if (this.template.data_sources) {
      this.template.data_sources.forEach(source => {
        this.addDataSource(source);
      });
    }

    // Populate permissions
    this.permissionsForm.patchValue({
      allow_self_generation: this.template.allow_self_generation,
      allow_other_generation: this.template.allow_other_generation,
      groups: this.template.groups || []
    });
  }

  // Form array getters
  get parameters(): FormArray {
    return this.parametersForm.get('parameters') as FormArray;
  }

  get dataSources(): FormArray {
    return this.dataSourcesForm.get('data_sources') as FormArray;
  }

  // Parameter management
  addParameter(param?: PDFTemplateParameter): void {
    const parameterForm = this.fb.group({
      parameter_key: [param?.parameter_key || '', Validators.required],
      display_name: [param?.display_name || '', Validators.required],
      display_name_ara: [param?.display_name_ara || ''],
      description: [param?.description || ''],
      description_ara: [param?.description_ara || ''],
      parameter_type: [param?.parameter_type || 'string'],
      is_required: [param?.is_required ?? true],
      default_value: [param?.default_value || ''],
      widget_type: [param?.widget_type || 'text'],
      widget_config: [param?.widget_config || {}],
      validation_rules: [param?.validation_rules || {}],
      query_field: [param?.query_field || ''],
      query_operator: [param?.query_operator || 'exact'],
      allow_user_override: [param?.allow_user_override ?? true],
      restricted_to_groups: [param?.restricted_to_groups || []],
      order: [param?.order ?? this.parameters.length],
      active_ind: [param?.active_ind ?? true]
    });

    this.parameters.push(parameterForm);
  }

  removeParameter(index: number): void {
    this.parameters.removeAt(index);
  }

  dropParameter(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.parameters.controls, event.previousIndex, event.currentIndex);
    // Update order values
    this.parameters.controls.forEach((control, index) => {
      control.patchValue({ order: index });
    });
  }

  // Data source management
  addDataSource(source?: PDFTemplateDataSource): void {
    const dataSourceForm = this.fb.group({
      source_key: [source?.source_key || '', Validators.required],
      display_name: [source?.display_name || '', Validators.required],
      fetch_method: [source?.fetch_method || 'model_query'],
      content_type: [source?.content_type || null],
      query_path: [source?.query_path || ''],
      filter_config: [source?.filter_config || {}],
      custom_function_path: [source?.custom_function_path || ''],
      raw_sql: [source?.raw_sql || ''],
      post_process_function: [source?.post_process_function || ''],
      cache_timeout: [source?.cache_timeout || 0],
      order: [source?.order ?? this.dataSources.length],
      active_ind: [source?.active_ind ?? true]
    });

    this.dataSources.push(dataSourceForm);
  }

  removeDataSource(index: number): void {
    this.dataSources.removeAt(index);
  }

  // Event handlers
  onDataSourceTypeChange(): void {
    const type = this.dataSourceForm.get('data_source_type')?.value;

    // Clear filters when changing data source type
    this.queryFilters = [];
    this.selectedContentType = null;

    // Reset fields based on type
    if (type !== 'model') {
      this.dataSourceForm.patchValue({ content_type: null, query_filter: {} }, { emitEvent: false });
    }
    if (type !== 'raw_sql') {
      this.dataSourceForm.patchValue({ raw_sql_query: '' }, { emitEvent: false });
    }
    if (type !== 'custom_function') {
      this.dataSourceForm.patchValue({ custom_function_path: '' }, { emitEvent: false });
    }
  }


  addQueryFilter(): void {
    const contentTypeId = this.dataSourceForm.get('content_type')?.value;
    if (!contentTypeId) {
      this.snackBar.open('Please select a model first', 'Close', { duration: 3000 });
      return;
    }

    this.selectedContentType = this.contentTypes.find(ct => ct.id === contentTypeId) || null;

    if (!this.selectedContentType || !this.selectedContentType.model_fields) {
      this.snackBar.open('No fields available for this model', 'Close', { duration: 3000 });
      return;
    }

    const newFilter = {
      id: Date.now(),
      field: '',
      fieldType: '',
      operator: 'exact',
      value: ''
    };

    this.queryFilters.push(newFilter);
    // Don't update immediately when adding empty filter
  }

  removeQueryFilter(index: number): void {
    this.queryFilters.splice(index, 1);
    this.scheduleQueryFilterUpdate();
  }
  onFilterFieldChange(filter: any): void {
    const field = this.selectedContentType?.model_fields?.find(f => f.name === filter.field);
    if (field) {
      filter.fieldType = field.type;
      filter.operator = 'exact'; // Reset operator when field changes
      filter.value = ''; // Reset value when field changes
    }
    this.scheduleQueryFilterUpdate();
  }
  onFilterOperatorChange(filter: any): void {
    this.scheduleQueryFilterUpdate();
  }

  onFilterValueChange(filter: any): void {
    this.scheduleQueryFilterUpdate();
  }

  scheduleQueryFilterUpdate(): void {
    this.filterUpdateSubject.next();
  }
  updateQueryFilter(): void {
    // Convert filters array to Django query format
    const queryFilter: any = {};

    this.queryFilters.forEach(filter => {
      if (filter.field && filter.value !== '') {
        const key = filter.operator === 'exact' ? filter.field : `${filter.field}__${filter.operator}`;
        queryFilter[key] = filter.value;
      }
    });

    this.dataSourceForm.patchValue({ query_filter: queryFilter });
  }

  getOperatorsForField(fieldType: string): Array<{value: string, label: string}> {
    const operators: Record<string, Array<{value: string, label: string}>> = {
      'CharField': [
        { value: 'exact', label: 'Equals' },
        { value: 'icontains', label: 'Contains' },
        { value: 'istartswith', label: 'Starts with' },
        { value: 'iendswith', label: 'Ends with' }
      ],
      'IntegerField': [
        { value: 'exact', label: 'Equals' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' }
      ],
      'DateField': [
        { value: 'exact', label: 'Equals' },
        { value: 'gt', label: 'After' },
        { value: 'gte', label: 'On or after' },
        { value: 'lt', label: 'Before' },
        { value: 'lte', label: 'On or before' }
      ],
      'BooleanField': [
        { value: 'exact', label: 'Equals' }
      ],
      'ForeignKey': [
        { value: 'exact', label: 'Equals' },
        { value: 'in', label: 'In list' }
      ]
    };

    return operators[fieldType] || [{ value: 'exact', label: 'Equals' }];
  }

  getAvailableWidgets(parameterType: string): any[] {
    if (!this.designerData) return [];

    const widgetMap: Record<string, string[]> = {
      'integer': ['number', 'text'],
      'float': ['number', 'text'],
      'string': ['text', 'select', 'radio'],
      'date': ['date', 'text'],
      'datetime': ['datetime', 'text'],
      'boolean': ['checkbox', 'select'],
      'user_id': ['user_search', 'select'],
      'model_id': ['model_search', 'select']
    };

    const availableTypes = widgetMap[parameterType] || ['text'];
    return this.designerData.widget_types.filter(w => availableTypes.includes(w.value));
  }

  completeWizard(): void {
    if (this.isFormValid()) {
      const wizardData = this.collectWizardData();
      const template = this.buildTemplateFromWizardData(wizardData);
      this.save.emit(template);
    }
  }

  private isFormValid(): boolean {
    return this.basicInfoForm.valid &&
      this.pageSetupForm.valid &&
      this.dataSourceForm.valid &&
      this.parametersForm.valid &&
      this.dataSourcesForm.valid &&
      this.permissionsForm.valid;
  }

  private collectWizardData(): WizardData {
    return {
      basicInfo: this.basicInfoForm.value,
      pageSetup: this.pageSetupForm.value,
      dataSource: this.dataSourceForm.value,
      parameters: this.parameters.value,
      dataSources: this.dataSources.value,
      design: {
        elements: [], // Elements will be added in designer mode
        variables: []
      },
      permissions: this.permissionsForm.value
    };
  }

  private buildTemplateFromWizardData(data: WizardData): PDFTemplate {
    return {
      // Basic info
      ...data.basicInfo,

      // Page setup
      page_size: data.pageSetup.page_size as 'A4' | 'A3' | 'letter' | 'legal',
      orientation: data.pageSetup.orientation as 'portrait' | 'landscape',
      margin_top: data.pageSetup.margins.top,
      margin_bottom: data.pageSetup.margins.bottom,
      margin_left: data.pageSetup.margins.left,
      margin_right: data.pageSetup.margins.right,
      header_enabled: data.pageSetup.header_enabled,
      footer_enabled: data.pageSetup.footer_enabled,
      watermark_enabled: data.pageSetup.watermark_enabled,
      watermark_text: data.pageSetup.watermark_text,

      // Data source
      data_source_type: data.dataSource.data_source_type as 'model' | 'raw_sql' | 'custom_function' | 'api',
      content_type: data.dataSource.content_type,
      query_filter: data.dataSource.query_filter,
      custom_function_path: data.dataSource.custom_function_path,
      raw_sql_query: data.dataSource.raw_sql_query,

      // Parameters and sources
      parameters: data.parameters,
      data_sources: data.dataSources,
      elements: data.design.elements,
      variables: data.design.variables,

      // Permissions
      ...data.permissions,
      requires_parameters: data.permissions.requires_parameters || data.parameters.length > 0,

      // Defaults
      is_system_template: false,
      active_ind: true
    };
  }

  onModelSelected(contentTypeId: number): void {
    const selectedModel = this.contentTypes.find(ct => ct.id === contentTypeId);
    if (selectedModel && selectedModel.model_fields) {
      console.log('Selected model fields:', selectedModel.model_fields);
      // You can store these fields for later use in query building
      // this.selectedModelFields = selectedModel.model_fields;
    }
  }
  getFieldType(fieldName: string): string {
    if (!this.selectedContentType || !this.selectedContentType.model_fields) {
      return '';
    }
    const field = this.selectedContentType.model_fields.find(f => f.name === fieldName);
    return field ? field.type : '';
  }

  getOperatorsForFilter(filter: any): Array<{value: string, label: string}> {
    return this.getOperatorsForField(filter.fieldType || '');
  }

  performQueryFilterUpdate(): void {
    const queryFilter: any = {};

    this.queryFilters.forEach(filter => {
      if (filter.field && filter.value !== '' && filter.value !== null && filter.value !== undefined) {
        const key = filter.operator === 'exact' ? filter.field : `${filter.field}__${filter.operator}`;
        queryFilter[key] = filter.value;
      }
    });

    // Only update if the value actually changed
    const currentValue = this.dataSourceForm.get('query_filter')?.value;
    if (JSON.stringify(currentValue) !== JSON.stringify(queryFilter)) {
      this.dataSourceForm.patchValue({ query_filter: queryFilter }, { emitEvent: false });
    }
  }

  protected readonly Object = Object;
}
