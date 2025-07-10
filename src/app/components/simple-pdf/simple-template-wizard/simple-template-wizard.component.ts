// src/app/components/simple-pdf/simple-template-wizard/simple-template-wizard.component.ts

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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  SimplePDFTemplate,
  SimplePDFElement,
  ContentType,
  ContentTypeField,
  BulkCreateRequest
} from '../../../models/simple-pdf.models';
import { SimplePDFService } from '../../../services/simple-pdf.service';

@Component({
  selector: 'app-simple-template-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="wizard-container">
      <mat-stepper #stepper [linear]="true" class="simple-wizard">

        <!-- Step 1: Basic Information -->
        <mat-step [stepControl]="basicInfoForm" label="Basic Information">
          <form [formGroup]="basicInfoForm" class="step-content">
            <div class="step-header">
              <mat-icon>info</mat-icon>
              <div>
                <h2>Template Information</h2>
                <p>Provide basic details about your PDF template</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Template Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g., Employee Report">
              <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Template Code</mat-label>
              <input matInput formControlName="code" placeholder="e.g., EMP_REPORT">
              <mat-hint>Unique identifier for the template</mat-hint>
              <mat-error *ngIf="basicInfoForm.get('code')?.hasError('required')">
                Code is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Page Size</mat-label>
              <mat-select formControlName="page_size">
                <mat-option value="A4">A4</mat-option>
                <mat-option value="letter">Letter</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="active">Active</mat-checkbox>

            <div class="step-actions">
              <button mat-button (click)="cancel.emit()">Cancel</button>
              <button mat-raised-button color="primary" matStepperNext [disabled]="!basicInfoForm.valid">
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Data Source -->
        <mat-step [stepControl]="dataSourceForm" label="Data Source">
          <form [formGroup]="dataSourceForm" class="step-content">
            <div class="step-header">
              <mat-icon>storage</mat-icon>
              <div>
                <h2>Data Source</h2>
                <p>Select the model to fetch data from</p>
              </div>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content Type</mat-label>
              <mat-select formControlName="content_type" (selectionChange)="onContentTypeChange($event.value)">
                <mat-option [value]="null">None</mat-option>
                <mat-option *ngFor="let ct of contentTypes" [value]="ct.id">
                  {{ ct.app_label }}.{{ ct.model }}
                </mat-option>
              </mat-select>
              <mat-hint>Select a model to generate reports from</mat-hint>
            </mat-form-field>

            <div class="query-filters" *ngIf="dataSourceForm.get('content_type')?.value">
              <h3>Query Filters (Optional)</h3>
              <p class="hint">Add filters to limit the data</p>

              <div class="filter-list">
                <div *ngFor="let filter of queryFilters; let i = index" class="filter-row">
                  <mat-form-field appearance="outline" class="filter-field">
                    <mat-label>Field</mat-label>
                    <mat-select [(ngModel)]="filter.field" [ngModelOptions]="{standalone: true}"
                                (selectionChange)="updateQueryFilter()">
                      <mat-option *ngFor="let field of modelFields" [value]="field.name">
                        {{ field.verbose_name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="filter-value">
                    <mat-label>Value</mat-label>
                    <input matInput [(ngModel)]="filter.value" [ngModelOptions]="{standalone: true}"
                           (ngModelChange)="updateQueryFilter()">
                  </mat-form-field>

                  <button mat-icon-button color="warn" (click)="removeFilter(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <button mat-stroked-button (click)="addFilter()" class="add-filter-btn">
                <mat-icon>add</mat-icon>
                Add Filter
              </button>
            </div>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-raised-button color="primary" matStepperNext>
                Next
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Add Elements -->
        <mat-step [stepControl]="elementsForm" label="Elements">
          <form [formGroup]="elementsForm" class="step-content">
            <div class="step-header">
              <mat-icon>text_fields</mat-icon>
              <div>
                <h2>Template Elements</h2>
                <p>Add text elements to your template</p>
              </div>
            </div>

            <div class="elements-list">
              <mat-card *ngFor="let element of elements.controls; let i = index"
                        [formGroupName]="i" class="element-card">
                <mat-card-header>
                  <mat-card-title>Element {{ i + 1 }}</mat-card-title>
                  <button mat-icon-button color="warn" (click)="removeElement(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-header>

                <mat-card-content>
                  <div class="element-position">
                    <mat-form-field appearance="outline">
                      <mat-label>X Position</mat-label>
                      <input matInput type="number" formControlName="x_position">
                      <mat-hint>From left edge (points)</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Y Position</mat-label>
                      <input matInput type="number" formControlName="y_position">
                      <mat-hint>From top edge (points)</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Font Size</mat-label>
                      <input matInput type="number" formControlName="font_size">
                    </mat-form-field>
                  </div>

                  <mat-checkbox formControlName="is_dynamic" class="dynamic-checkbox">
                    Dynamic Content
                  </mat-checkbox>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Text Content</mat-label>
                    <textarea matInput formControlName="text_content" rows="2"
                              [placeholder]="element.get('is_dynamic')?.value ?
                                'e.g., user.email or user.get_full_name()' :
                                'Static text content'">
                    </textarea>
                    <mat-hint *ngIf="element.get('is_dynamic')?.value">
                      Use dot notation for model fields (e.g., user.email)
                    </mat-hint>
                  </mat-form-field>
                </mat-card-content>
              </mat-card>
            </div>

            <button mat-raised-button (click)="addElement()" class="add-element-btn">
              <mat-icon>add</mat-icon>
              Add Element
            </button>

            <div class="step-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Previous
              </button>
              <button mat-raised-button color="primary" (click)="completeWizard()">
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
      background: #f5f5f5;
    }

    .simple-wizard {
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

      mat-icon {
        width: 48px;
        height: 48px;
        background: #1976d2;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      h2 {
        margin: 0 0 4px 0;
        font-size: 1.5rem;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .hint {
      color: #666;
      font-size: 0.875rem;
      margin: 0 0 16px 0;
    }

    /* Query Filters */
    .query-filters {
      margin-top: 24px;
      padding: 16px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;

      h3 {
        margin: 0 0 8px 0;
        font-size: 1.125rem;
      }
    }

    .filter-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .filter-field {
      flex: 1;
    }

    .filter-value {
      flex: 1;
    }

    .add-filter-btn {
      width: 100%;
      border-style: dashed;
    }

    /* Elements */
    .elements-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .element-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      mat-card-title {
        font-size: 1.125rem;
        margin: 0;
      }
    }

    .element-position {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .dynamic-checkbox {
      margin-bottom: 16px;
    }

    .add-element-btn {
      width: 100%;
      margin-bottom: 24px;
    }

    /* Step Actions */
    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .step-content {
        padding: 16px;
      }

      .element-position {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SimpleTemplateWizardComponent implements OnInit {
  @Input() template: SimplePDFTemplate | null = null;
  @Output() save = new EventEmitter<BulkCreateRequest>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('stepper') stepper!: MatStepper;

  // Form groups
  basicInfoForm!: FormGroup;
  dataSourceForm!: FormGroup;
  elementsForm!: FormGroup;

  // Data
  contentTypes: ContentType[] = [];
  modelFields: ContentTypeField[] = [];
  queryFilters: any[] = [];
  loadingContentTypes = false;

  constructor(
    private fb: FormBuilder,
    private simplePdfService: SimplePDFService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadContentTypes();
    if (this.template) {
      this.populateFormsFromTemplate();
    }
  }

  private initializeForms(): void {
    // Basic Info Form
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      page_size: ['A4'],
      active: [true]
    });

    // Data Source Form
    this.dataSourceForm = this.fb.group({
      content_type: [null],
      query_filter: [{}]
    });

    // Elements Form
    this.elementsForm = this.fb.group({
      elements: this.fb.array([])
    });

    // Add at least one element by default
    if (!this.template) {
      this.addElement();
    }
  }

  private loadContentTypes(): void {
    this.loadingContentTypes = true;
    this.simplePdfService.getContentTypes().subscribe({
      next: (types) => {
        this.contentTypes = types;
        this.loadingContentTypes = false;
      },
      error: (error) => {
        console.error('Error loading content types:', error);
        this.loadingContentTypes = false;
      }
    });
  }

  private populateFormsFromTemplate(): void {
    if (!this.template) return;

    // Populate basic info
    this.basicInfoForm.patchValue({
      name: this.template.name,
      code: this.template.code,
      page_size: this.template.page_size,
      active: this.template.active
    });

    // Populate data source
    this.dataSourceForm.patchValue({
      content_type: this.template.content_type,
      query_filter: this.template.query_filter
    });

    // Load model fields if content type is set
    if (this.template.content_type) {
      this.loadModelFields(this.template.content_type);
      this.parseQueryFilter(this.template.query_filter);
    }

    // Populate elements
    if (this.template.elements) {
      this.template.elements.forEach(element => {
        this.addElement(element);
      });
    }
  }

  // Form array getter
  get elements(): FormArray {
    return this.elementsForm.get('elements') as FormArray;
  }

  // Element management
  addElement(element?: SimplePDFElement): void {
    const elementForm = this.fb.group({
      x_position: [element?.x_position || 100, [Validators.required, Validators.min(0)]],
      y_position: [element?.y_position || 100, [Validators.required, Validators.min(0)]],
      text_content: [element?.text_content || '', Validators.required],
      is_dynamic: [element?.is_dynamic || false],
      font_size: [element?.font_size || 12, [Validators.required, Validators.min(6), Validators.max(72)]]
    });

    this.elements.push(elementForm);
  }

  removeElement(index: number): void {
    this.elements.removeAt(index);
  }

  // Content Type handling
  onContentTypeChange(contentTypeId: number | null): void {
    this.modelFields = [];
    this.queryFilters = [];
    this.dataSourceForm.patchValue({ query_filter: {} });

    if (contentTypeId) {
      this.loadModelFields(contentTypeId);
    }
  }

  private loadModelFields(contentTypeId: number): void {
    this.simplePdfService.getContentTypeFields(contentTypeId).subscribe({
      next: (data) => {
        this.modelFields = data.fields;
      },
      error: (error) => {
        console.error('Error loading model fields:', error);
      }
    });
  }

  // Query Filter handling
  addFilter(): void {
    this.queryFilters.push({
      field: '',
      value: ''
    });
  }

  removeFilter(index: number): void {
    this.queryFilters.splice(index, 1);
    this.updateQueryFilter();
  }

  updateQueryFilter(): void {
    const queryFilter: any = {};
    this.queryFilters.forEach(filter => {
      if (filter.field && filter.value) {
        queryFilter[filter.field] = filter.value;
      }
    });
    this.dataSourceForm.patchValue({ query_filter: queryFilter });
  }

  private parseQueryFilter(queryFilter: any): void {
    this.queryFilters = [];
    if (queryFilter && typeof queryFilter === 'object') {
      Object.entries(queryFilter).forEach(([field, value]) => {
        this.queryFilters.push({ field, value });
      });
    }
  }

  // Complete wizard
  completeWizard(): void {
    if (this.isFormValid()) {
      const formData = this.collectFormData();
      this.save.emit(formData);
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  private isFormValid(): boolean {
    return this.basicInfoForm.valid &&
      this.dataSourceForm.valid &&
      this.elementsForm.valid &&
      this.elements.length > 0;
  }

  private collectFormData(): BulkCreateRequest {
    const basicInfo = this.basicInfoForm.value;
    const dataSource = this.dataSourceForm.value;
    const elements = this.elements.value;

    return {
      name: basicInfo.name,
      code: basicInfo.code,
      page_size: basicInfo.page_size,
      content_type: dataSource.content_type,
      query_filter: dataSource.query_filter,
      active: basicInfo.active,
      elements: elements
    };
  }
}
