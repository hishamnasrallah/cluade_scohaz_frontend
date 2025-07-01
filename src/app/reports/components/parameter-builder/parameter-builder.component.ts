// src/app/reports/components/parameter-builder/parameter-builder.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

// Material imports
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Models and Services
import { Report, Parameter, ParameterChoice, ChoicesQuery, ContentType, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface ParameterTemplate {
  name: string;
  description: string;
  parameters: Partial<Parameter>[];
}

interface TestResults {
  valid: boolean;
  errors: string[];
  processedValue: any;
}

@Component({
  selector: 'app-parameter-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: 'parameter-builder.component.html',
  styleUrl: 'parameter-builder.component.scss'
})
export class ParameterBuilderComponent implements OnInit {
  @ViewChild('parameterTemplatesDialog') parameterTemplatesDialog!: TemplateRef<any>;
  @ViewChild('testParameterDialog') testParameterDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() parameters: Parameter[] = [];
  @Output() parametersChange = new EventEmitter<Parameter[]>();

  // UI state
  expandedIndex = -1;
  showPreview = false;
  selectedDateRangeDefault = '';
  contentTypeGroups: Record<string, { label: string; content_types: ContentType[] }> = {};
  contentTypeFields: Map<number, FieldInfo[]> = new Map();

  // Forms
  parameterForms: FormGroup[] = [];

  // Testing
  testingParameter: Parameter | null = null;
  testValue: any = null;
  testResults: TestResults | null = null;

  // Parameter types
  parameterTypes = [
    { value: 'text', label: 'Text', icon: 'text_fields' },
    { value: 'number', label: 'Number', icon: 'pin' },
    { value: 'date', label: 'Date', icon: 'calendar_today' },
    { value: 'datetime', label: 'Date & Time', icon: 'schedule' },
    { value: 'date_range', label: 'Date Range', icon: 'date_range' },
    { value: 'select', label: 'Select (Single)', icon: 'radio_button_checked' },
    { value: 'multiselect', label: 'Select (Multiple)', icon: 'check_box' },
    { value: 'boolean', label: 'Yes/No', icon: 'toggle_on' }
  ];

  // Templates
  parameterTemplates: ParameterTemplate[] = [
    {
      name: 'Date Range Filter',
      description: 'Add start and end date parameters for filtering by date range',
      parameters: [
        {
          name: 'date_range',
          display_name: 'Date Range',
          parameter_type: 'date_range',
          is_required: false,
          default_value: { start: 'current_month_start', end: 'current_month_end' },
          help_text: 'Select the date range for the report'
        }
      ]
    },
    {
      name: 'Status Filter',
      description: 'Add a dropdown to filter by status',
      parameters: [
        {
          name: 'status',
          display_name: 'Status',
          parameter_type: 'select',
          is_required: false,
          choices_static: [
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' }
          ],
          default_value: 'all',
          help_text: 'Filter records by status'
        }
      ]
    },
    {
      name: 'Pagination',
      description: 'Add page size and offset parameters',
      parameters: [
        {
          name: 'page_size',
          display_name: 'Page Size',
          parameter_type: 'number',
          is_required: false,
          default_value: 50,
          validation_rules: { min_value: 10, max_value: 500 },
          help_text: 'Number of records per page'
        },
        {
          name: 'page',
          display_name: 'Page',
          parameter_type: 'number',
          is_required: false,
          default_value: 1,
          validation_rules: { min_value: 1 },
          help_text: 'Page number'
        }
      ]
    },
    {
      name: 'Search and Filter',
      description: 'Add text search and category filter',
      parameters: [
        {
          name: 'search',
          display_name: 'Search',
          parameter_type: 'text',
          is_required: false,
          placeholder: 'Search...',
          help_text: 'Search in all text fields'
        },
        {
          name: 'category',
          display_name: 'Category',
          parameter_type: 'multiselect',
          is_required: false,
          choices_static: [],
          help_text: 'Filter by categories'
        }
      ]
    }
  ];

  // Temporary ID counter for new parameters
  private tempIdCounter = -1;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadContentTypes();
    this.initializeForms();
  }

  loadContentTypes(): void {
    this.reportService.getContentTypes().subscribe({
      next: (contentTypes) => {
        this.contentTypeGroups = contentTypes;
      },
      error: (err) => {
        console.error('Error loading content types:', err);
      }
    });
  }

  initializeForms(): void {
    this.parameterForms = [];
    for (let i = 0; i < this.parameters.length; i++) {
      this.createParameterForm(i);

      // Initialize validation rules if not present
      if (!this.parameters[i].validation_rules) {
        this.parameters[i].validation_rules = {};
      }

      // Initialize choices arrays if not present
      if (!this.parameters[i].choices_static) {
        this.parameters[i].choices_static = [];
      }

      if (!this.parameters[i].choices_query) {
        this.parameters[i].choices_query = {
          content_type_id: 0,
          value_field: '',
          label_field: '',
          order_by: ''
        };
      }
    }
  }

  createParameterForm(index: number): void {
    const param = this.parameters[index];

    this.parameterForms[index] = this.fb.group({
      name: [param.name || '', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9_]*$/)
      ]],
      display_name: [param.display_name || '', Validators.required],
      parameter_type: [param.parameter_type || 'text', Validators.required],
      is_required: [param.is_required || false],
      help_text: [param.help_text || '']
    });
  }

  getParameterForm(index: number): FormGroup {
    if (!this.parameterForms[index]) {
      this.createParameterForm(index);
    }
    return this.parameterForms[index];
  }

  // Parameter management
  addParameter(): void {
    const newParam: Parameter = {
      report: this.report?.id || 0,
      name: '',
      display_name: '',
      parameter_type: 'text',
      is_required: false,
      order: this.parameters.length,
      validation_rules: {},
      choices_static: []
    };

    if (!this.report?.id) {
      // For new reports without ID
      (newParam as any).id = this.tempIdCounter--;
      this.parameters.push(newParam);
      this.createParameterForm(this.parameters.length - 1);
      this.expandedIndex = this.parameters.length - 1;
      this.parametersChange.emit(this.parameters);
    } else {
      // Save to backend
      this.reportService.createParameter(newParam).subscribe({
        next: (created) => {
          this.parameters.push(created);
          this.createParameterForm(this.parameters.length - 1);
          this.expandedIndex = this.parameters.length - 1;
          this.parametersChange.emit(this.parameters);

          this.snackBar.open('Parameter added', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Error adding parameter:', err);
          this.snackBar.open('Error adding parameter', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  removeParameter(index: number): void {
    const param = this.parameters[index];

    if (confirm(`Remove parameter "${param.display_name || param.name}"?`)) {
      if (!param.id || param.id < 0) {
        // Remove locally
        this.parameters.splice(index, 1);
        this.parameterForms.splice(index, 1);
        this.updateParameterOrders();
        this.parametersChange.emit(this.parameters);
      } else {
        // Delete from backend
        this.reportService.deleteParameter(param.id).subscribe({
          next: () => {
            this.parameters.splice(index, 1);
            this.parameterForms.splice(index, 1);
            this.updateParameterOrders();
            this.parametersChange.emit(this.parameters);

            this.snackBar.open('Parameter removed', 'Close', {
              duration: 2000,
              panelClass: ['info-snackbar']
            });
          },
          error: (err) => {
            console.error('Error removing parameter:', err);
            this.snackBar.open('Error removing parameter', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  duplicateParameter(param: Parameter, index: number): void {
    const duplicate: Parameter = {
      ...param,
      name: `${param.name}_copy`,
      display_name: `${param.display_name} (Copy)`,
      order: this.parameters.length
    };

    delete (duplicate as any).id;

    if (!this.report?.id) {
      (duplicate as any).id = this.tempIdCounter--;
      this.parameters.push(duplicate);
      this.createParameterForm(this.parameters.length - 1);
      this.parametersChange.emit(this.parameters);
    } else {
      this.reportService.createParameter(duplicate).subscribe({
        next: (created) => {
          this.parameters.push(created);
          this.createParameterForm(this.parameters.length - 1);
          this.parametersChange.emit(this.parameters);

          this.snackBar.open('Parameter duplicated', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        }
      });
    }
  }

  updateParameterName(param: Parameter, index: number): void {
    const form = this.getParameterForm(index);
    const name = form.get('name')?.value;

    if (name && name !== param.name) {
      param.name = name;

      // Auto-generate display name if empty
      if (!param.display_name) {
        param.display_name = name.replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        form.patchValue({ display_name: param.display_name });
      }

      this.saveParameter(param);
    }
  }

  onParameterTypeChange(param: Parameter, index: number): void {
    const form = this.getParameterForm(index);
    const newType = form.get('parameter_type')?.value;

    param.parameter_type = newType;

    // Reset type-specific configurations
    param.default_value = null;
    param.validation_rules = {};

    // Set appropriate defaults based on type
    switch (newType) {
      case 'date_range':
        param.default_value = { start: null, end: null };
        break;
      case 'select':
      case 'multiselect':
        if (!param.choices_static || param.choices_static.length === 0) {
          param.choices_static = [
            { value: '', label: 'Option 1' }
          ];
        }
        break;
      case 'boolean':
        param.default_value = false;
        break;
      case 'number':
        param.validation_rules = {
          min_value: null,
          max_value: null,
          integer_only: false,
          positive_only: false
        };
        break;
    }

    this.saveParameter(param);
  }

  saveParameter(param: Parameter): void {
    if (!param.id || param.id < 0) {
      // For new reports, just emit changes
      this.parametersChange.emit(this.parameters);
      return;
    }

    // Get the form values
    const index = this.parameters.indexOf(param);
    const form = this.getParameterForm(index);

    const updates: Partial<Parameter> = {
      ...form.value,
      default_value: param.default_value,
      validation_rules: param.validation_rules,
      choices_static: param.choices_static,
      choices_query: param.choices_query,
      placeholder: param.placeholder
    };

    this.reportService.updateParameter(param.id, updates).subscribe({
      next: (updated) => {
        Object.assign(param, updated);
        this.parametersChange.emit(this.parameters);
      },
      error: (err) => {
        console.error('Error updating parameter:', err);
        this.snackBar.open('Error updating parameter', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Drag and drop
  onDrop(event: CdkDragDrop<Parameter[]>): void {
    moveItemInArray(this.parameters, event.previousIndex, event.currentIndex);

    // Move corresponding forms
    moveItemInArray(this.parameterForms, event.previousIndex, event.currentIndex);

    this.updateParameterOrders();
  }

  updateParameterOrders(): void {
    const updates: Promise<any>[] = [];

    this.parameters.forEach((param, index) => {
      param.order = index;

      if (param.id && param.id > 0) {
        const update = this.reportService.updateParameter(param.id, { order: index });
        updates.push(update.toPromise());
      }
    });

    if (updates.length > 0) {
      Promise.all(updates).then(() => {
        this.parametersChange.emit(this.parameters);
      });
    } else {
      this.parametersChange.emit(this.parameters);
    }
  }

  // Choice management for select/multiselect
  addChoice(param: Parameter): void {
    if (!param.choices_static) {
      param.choices_static = [];
    }

    param.choices_static.push({
      value: `option_${param.choices_static.length + 1}`,
      label: `Option ${param.choices_static.length + 1}`
    });

    this.saveParameter(param);
  }

  removeChoice(param: Parameter, index: number): void {
    if (param.choices_static) {
      param.choices_static.splice(index, 1);
      this.saveParameter(param);
    }
  }

  // Dynamic query configuration
  onQueryDataSourceChange(param: Parameter): void {
    if (!param.choices_query) return;

    // Reset field selections
    param.choices_query.value_field = '';
    param.choices_query.label_field = '';

    // Load fields for the selected content type
    this.loadFieldsForContentType(param.choices_query.content_type_id);

    this.saveParameter(param);
  }

  loadFieldsForContentType(contentTypeId: number): void {
    if (!contentTypeId || this.contentTypeFields.has(contentTypeId)) {
      return;
    }

    this.reportService.getContentTypeFields(contentTypeId).subscribe({
      next: (response) => {
        this.contentTypeFields.set(contentTypeId, response.fields);
      },
      error: (err) => {
        console.error('Error loading fields:', err);
      }
    });
  }

  getFieldsForContentType(contentTypeId: number): FieldInfo[] {
    return this.contentTypeFields.get(contentTypeId) || [];
  }

  // Date validation
  onDateValidationChange(param: Parameter): void {
    if (!param.validation_rules) return;

    // Ensure mutually exclusive options
    if (param.validation_rules['future_only'] && param.validation_rules['past_only']) {
      if (param.validation_rules['future_only']) {
        param.validation_rules['past_only'] = false;
      } else {
        param.validation_rules['future_only'] = false;
      }
    }

    this.saveParameter(param);
  }

  // Date range defaults
  onDateRangeDefaultChange(param: Parameter): void {
    if (!this.selectedDateRangeDefault) {
      param.default_value = null;
      return;
    }

    switch (this.selectedDateRangeDefault) {
      case 'current_week':
        param.default_value = {
          start: 'current_week_start',
          end: 'current_week_end'
        };
        break;
      case 'current_month':
        param.default_value = {
          start: 'current_month_start',
          end: 'current_month_end'
        };
        break;
      case 'current_quarter':
        param.default_value = {
          start: 'current_quarter_start',
          end: 'current_quarter_end'
        };
        break;
      case 'current_year':
        param.default_value = {
          start: 'current_year_start',
          end: 'current_year_end'
        };
        break;
      case 'last_7_days':
        param.default_value = {
          start: 'today-7',
          end: 'today'
        };
        break;
      case 'last_30_days':
        param.default_value = {
          start: 'today-30',
          end: 'today'
        };
        break;
      case 'last_90_days':
        param.default_value = {
          start: 'today-90',
          end: 'today'
        };
        break;
      case 'custom':
        param.default_value = {
          start: null,
          end: null
        };
        break;
    }

    this.saveParameter(param);
  }

  // Testing
  testParameter(param: Parameter): void {
    this.testingParameter = param;
    this.testValue = param.default_value;
    this.testResults = null;

    this.dialog.open(this.testParameterDialog, {
      width: '600px'
    });
  }

  runTest(): void {
    if (!this.testingParameter) return;

    const results: TestResults = {
      valid: true,
      errors: [],
      processedValue: this.testValue
    };

    // Validate based on parameter type
    switch (this.testingParameter.parameter_type) {
      case 'text':
        this.validateTextParameter(results);
        break;
      case 'number':
        this.validateNumberParameter(results);
        break;
      case 'date':
        this.validateDateParameter(results);
        break;
      // Add other validations
    }

    this.testResults = results;
  }

  validateTextParameter(results: TestResults): void {
    if (!this.testingParameter?.validation_rules) return;

    const rules = this.testingParameter.validation_rules;

    if (this.testingParameter.is_required && !this.testValue) {
      results.valid = false;
      results.errors.push('Value is required');
    }

    if (rules['min_length'] && this.testValue?.length < rules['min_length']) {
      results.valid = false;
      results.errors.push(`Minimum length is ${rules['min_length']}`);
    }

    if (rules['max_length'] && this.testValue?.length > rules['max_length']) {
      results.valid = false;
      results.errors.push(`Maximum length is ${rules['max_length']}`);
    }

    if (rules['regex']) {
      try {
        const regex = new RegExp(rules['regex']);
        if (!regex.test(this.testValue)) {
          results.valid = false;
          results.errors.push('Value does not match required pattern');
        }
      } catch (e) {
        results.errors.push('Invalid regex pattern');
      }
    }
  }

  validateNumberParameter(results: TestResults): void {
    if (!this.testingParameter?.validation_rules) return;

    const rules = this.testingParameter.validation_rules;
    const numValue = parseFloat(this.testValue);

    if (isNaN(numValue)) {
      results.valid = false;
      results.errors.push('Invalid number');
      return;
    }

    if (rules['integer_only'] && !Number.isInteger(numValue)) {
      results.valid = false;
      results.errors.push('Must be an integer');
    }

    if (rules['positive_only'] && numValue < 0) {
      results.valid = false;
      results.errors.push('Must be positive');
    }

    if (rules['min_value'] !== null && numValue < rules['min_value']) {
      results.valid = false;
      results.errors.push(`Minimum value is ${rules['min_value']}`);
    }

    if (rules['max_value'] !== null && numValue > rules['max_value']) {
      results.valid = false;
      results.errors.push(`Maximum value is ${rules['max_value']}`);
    }

    results.processedValue = numValue;
  }

  validateDateParameter(results: TestResults): void {
    // Date validation logic
  }

  // Templates
  showParameterTemplates(): void {
    this.dialog.open(this.parameterTemplatesDialog, {
      width: '800px',
      maxHeight: '80vh'
    });
  }

  applyTemplate(template: ParameterTemplate): void {
    for (const paramTemplate of template.parameters) {
      const newParam: Parameter = {
        ...paramTemplate,
        report: this.report?.id || 0,
        order: this.parameters.length
      } as Parameter;

      if (!this.report?.id) {
        (newParam as any).id = this.tempIdCounter--;
        this.parameters.push(newParam);
        this.createParameterForm(this.parameters.length - 1);
      } else {
        this.reportService.createParameter(newParam).subscribe({
          next: (created) => {
            this.parameters.push(created);
            this.createParameterForm(this.parameters.length - 1);
          }
        });
      }
    }

    this.parametersChange.emit(this.parameters);
    this.dialog.closeAll();

    this.snackBar.open(`Applied "${template.name}" template`, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  // Quick templates
  addDateRangeTemplate(): void {
    const template = this.parameterTemplates.find(t => t.name === 'Date Range Filter');
    if (template) {
      this.applyTemplate(template);
    }
  }

  addStatusFilterTemplate(): void {
    const template = this.parameterTemplates.find(t => t.name === 'Status Filter');
    if (template) {
      this.applyTemplate(template);
    }
  }

  addPaginationTemplate(): void {
    const template = this.parameterTemplates.find(t => t.name === 'Pagination');
    if (template) {
      this.applyTemplate(template);
    }
  }

  // Import/Export
  importParameters(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const imported = JSON.parse(event.target.result);
            this.applyImportedParameters(imported);
          } catch (error) {
            this.snackBar.open('Invalid parameter file', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  applyImportedParameters(imported: any[]): void {
    // Validate and apply imported parameters
    for (const paramData of imported) {
      if (paramData.name && paramData.parameter_type) {
        const newParam: Parameter = {
          ...paramData,
          report: this.report?.id || 0,
          order: this.parameters.length
        };

        if (!this.report?.id) {
          (newParam as any).id = this.tempIdCounter--;
          this.parameters.push(newParam);
          this.createParameterForm(this.parameters.length - 1);
        } else {
          this.reportService.createParameter(newParam).subscribe({
            next: (created) => {
              this.parameters.push(created);
              this.createParameterForm(this.parameters.length - 1);
            }
          });
        }
      }
    }

    this.parametersChange.emit(this.parameters);

    this.snackBar.open('Parameters imported', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  exportParameters(): void {
    const exportData = this.parameters.map(p => ({
      name: p.name,
      display_name: p.display_name,
      parameter_type: p.parameter_type,
      is_required: p.is_required,
      default_value: p.default_value,
      validation_rules: p.validation_rules,
      choices_static: p.choices_static,
      help_text: p.help_text,
      placeholder: p.placeholder
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.report?.name || 'report'}_parameters_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  clearAllParameters(): void {
    if (confirm('Remove all parameters?')) {
      const deletions = this.parameters
        .filter(param => param.id && param.id > 0)
        .map(param => this.reportService.deleteParameter(param.id!));

      if (deletions.length > 0) {
        Promise.all(deletions.map(obs => obs.toPromise())).then(() => {
          this.parameters = [];
          this.parameterForms = [];
          this.parametersChange.emit(this.parameters);

          this.snackBar.open('All parameters removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        });
      } else {
        this.parameters = [];
        this.parameterForms = [];
        this.parametersChange.emit(this.parameters);
      }
    }
  }

  // Helper methods
  getParameterIcon(type: string): string {
    const typeConfig = this.parameterTypes.find(t => t.value === type);
    return typeConfig?.icon || 'help_outline';
  }

  getParameterTypeLabel(type: string): string {
    const typeConfig = this.parameterTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  }
}
