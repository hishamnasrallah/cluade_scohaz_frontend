// src/app/reports/components/report-execution/report-execution.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { Report, Parameter, ExecutionResult } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-report-execution',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatDividerModule
  ],
  templateUrl: 'report-execution.component.html',
  styleUrl: 'report-execution.component.scss'
})
export class ReportExecutionComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  report: Report | null = null;
  isLoading = false;
  isExecuting = false;
  error: string | null = null;
  displayedColumns: string[] = [];

  // Forms
  parametersForm: FormGroup;
  optionsForm: FormGroup;

  // Execution
  executionResult: ExecutionResult | null = null;
  selectedFormat: 'json' | 'csv' | 'excel' | 'pdf' = 'json';
  saveResult = false;
  resultName = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,  // Make it public so template can access it
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.parametersForm = this.fb.group({});
    this.optionsForm = this.fb.group({
      limit: [1000, [Validators.min(1), Validators.max(10000)]],
      export_format: ['json'],
      save_result: [false],
      result_name: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(parseInt(id));
    }
  }

  loadReport(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.reportService.getReport(id).subscribe({
      next: (report) => {
        this.report = report;
        this.buildParametersForm();
        this.isLoading = false;

        // Auto-execute if no parameters
        if (!report.parameters || report.parameters.length === 0) {
          // Skip to results step
          setTimeout(() => {
            this.stepper.selectedIndex = 1;
            this.executeReport();
          }, 100);
        }
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.error = 'Failed to load report';
        this.isLoading = false;

        this.snackBar.open('Error loading report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  buildParametersForm(): void {
    if (!this.report?.parameters) return;

    const group: any = {};

    for (const param of this.report.parameters) {
      const validators = [];

      if (param.is_required) {
        validators.push(Validators.required);
      }

      // Add type-specific validators
      if (param.parameter_type === 'number' && param.validation_rules) {
        const rules = param.validation_rules;
        if (rules['min_value'] !== null && rules['min_value'] !== undefined) {
          validators.push(Validators.min(rules['min_value']));
        }
        if (rules['max_value'] !== null && rules['max_value'] !== undefined) {
          validators.push(Validators.max(rules['max_value']));
        }
      }

      if (param.parameter_type === 'text' && param.validation_rules) {
        const rules = param.validation_rules;
        if (rules['min_length']) {
          validators.push(Validators.minLength(rules['min_length']));
        }
        if (rules['max_length']) {
          validators.push(Validators.maxLength(rules['max_length']));
        }
        if (rules['regex']) {
          validators.push(Validators.pattern(rules['regex']));
        }
      }

      // Set default value
      let defaultValue = param.default_value;

      // Handle special default values
      if (param.parameter_type === 'date' || param.parameter_type === 'datetime') {
        if (defaultValue === 'today') {
          defaultValue = new Date();
        } else if (defaultValue === 'yesterday') {
          defaultValue = new Date(Date.now() - 24 * 60 * 60 * 1000);
        } else if (defaultValue === 'tomorrow') {
          defaultValue = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
      }

      // Handle number fields - convert empty strings to null
      if (param.parameter_type === 'number' || param.parameter_type === 'user') {
        if (defaultValue === '' || defaultValue === undefined) {
          defaultValue = null;
        } else if (typeof defaultValue === 'string' && defaultValue.trim() !== '') {
          defaultValue = parseFloat(defaultValue);
        }
      }

      // Handle select/multiselect fields
      if (param.parameter_type === 'select' || param.parameter_type === 'multiselect') {
        if (defaultValue === '' || defaultValue === undefined) {
          defaultValue = param.parameter_type === 'multiselect' ? [] : null;
        }
      }

      group[param.name] = [defaultValue, validators];
    }

    this.parametersForm = this.fb.group(group);
  }

  getParameterControl(paramName: string): any {
    return this.parametersForm.get(paramName);
  }

  getParameterError(param: Parameter): string {
    const control = this.getParameterControl(param.name);
    if (!control?.invalid || !control?.touched) return '';

    if (control.errors?.['required']) return `${param.display_name} is required`;
    if (control.errors?.['min']) return `Minimum value is ${control.errors['min'].min}`;
    if (control.errors?.['max']) return `Maximum value is ${control.errors['max'].max}`;
    if (control.errors?.['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    if (control.errors?.['maxlength']) return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
    if (control.errors?.['pattern']) return `Invalid format`;

    return 'Invalid value';
  }

  onFormatChange(): void {
    const format = this.optionsForm.get('export_format')?.value;
    this.selectedFormat = format;
  }

  onSaveToggle(): void {
    const saveResult = this.optionsForm.get('save_result')?.value;
    if (saveResult && !this.optionsForm.get('result_name')?.value) {
      const defaultName = `${this.report?.name} - ${new Date().toLocaleDateString()}`;
      this.optionsForm.patchValue({ result_name: defaultName });
    }
  }

  executeReport(): void {
    if (!this.report?.id) return;

    // Validate parameters
    if (this.parametersForm.invalid) {
      Object.keys(this.parametersForm.controls).forEach(key => {
        this.parametersForm.controls[key].markAsTouched();
      });

      this.snackBar.open('Please fill in all required parameters', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isExecuting = true;
    this.error = null;

    // ADD THE DEBUG LOGGING HERE ↓↓↓

    // Debug logging
    console.log('Report ID:', this.report.id);
    console.log('Full Report:', this.report);
    console.log('Report parameters:', this.report.parameters);
    console.log('Report data sources:', this.report.data_sources);
    console.log('Report fields:', this.report.fields);
    console.log('Report filters:', this.report.filters);

    // Add detailed filter logging
    if (this.report.filters && this.report.filters.length > 0) {
      this.report.filters.forEach((filter, index) => {
        console.log(`Filter ${index}:`, {
          field_path: filter.field_path,
          operator: filter.operator,
          value: filter.value,
          value_type: filter.value_type,
          field_type: filter.field_type
        });
      });
    }

    // Clean parameters - handle all types properly
    const cleanedParameters: any = {};
    if (this.report.parameters) {
      for (const param of this.report.parameters) {
        let value = this.parametersForm.value[param.name];

        // Handle different parameter types
        switch (param.parameter_type) {
          case 'number':
          case 'user':
            // Convert empty strings to null for numeric fields
            if (value === '' || value === undefined || value === null) {
              value = null;
            } else if (typeof value === 'string') {
              const parsed = parseFloat(value);
              value = isNaN(parsed) ? null : parsed;
            }
            break;

          case 'select':
            // For select, empty string should be null
            if (value === '' || value === undefined) {
              value = null;
            }
            break;

          case 'multiselect':
            // For multiselect, ensure it's an array
            if (!value || value === '') {
              value = [];
            } else if (!Array.isArray(value)) {
              value = [value];
            }
            // Filter out empty strings from the array
            value = value.filter((v: any) => v !== '' && v !== null && v !== undefined);
            break;

          case 'date':
          case 'datetime':
            // Convert date objects to ISO strings
            if (value instanceof Date) {
              value = value.toISOString();
            } else if (value === '' || value === undefined) {
              value = null;
            }
            break;

          case 'boolean':
            // Ensure boolean is actually boolean
            value = !!value;
            break;

          case 'text':
          default:
            // For text, empty string is okay unless required
            if (value === undefined || value === null) {
              value = '';
            }
            break;
        }

        cleanedParameters[param.name] = value;
      }
    }

    // Build execution params based on whether we're saving results
    const saveResult = this.optionsForm.get('save_result')?.value;

    const executionParams: any = {
      parameters: cleanedParameters,
      limit: this.optionsForm.get('limit')?.value || 1000,
      offset: 0,
      export_format: this.selectedFormat
    };


    // Only include save_result and result_name if user wants to save
    if (saveResult) {
      executionParams.save_result = true;
      const resultName = this.optionsForm.get('result_name')?.value?.trim();
      if (!resultName) {
        this.snackBar.open('Please provide a name for saved results', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        this.isExecuting = false;
        return;
      }
      executionParams.result_name = resultName;
    }

    this.reportService.executeReport(this.report.id, executionParams).subscribe({
      next: (result) => {
        this.executionResult = result;
        // Ensure we have valid columns before setting displayedColumns
        if (result.columns && result.columns.length > 0) {
          this.displayedColumns = result.columns.map(c => c.display_name || c.name);
          console.log('Set displayedColumns to:', this.displayedColumns);
        } else {
          this.displayedColumns = [];
          console.warn('No columns in result');
        }
        this.displayedColumns = result.columns.map(c => c.display_name);

        console.log('Column display names:', result.columns.map(c => ({ name: c.name, display: c.display_name })));

        // Debug: Check column names and data structure
        console.log('Result columns:', result.columns);
        console.log('Display columns:', this.displayedColumns);
        console.log('Sample data row:', result.data[0]);
        console.log('Data keys:', result.data[0] ? Object.keys(result.data[0]) : []);

        this.isExecuting = false;

        // Move to results step
        this.stepper.next();

        this.snackBar.open('Report executed successfully', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error executing report:', err);
        this.error = err.error?.detail || 'Failed to execute report';
        this.isExecuting = false;

        this.snackBar.open('Error executing report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  exportResults(format: 'csv' | 'excel' | 'pdf'): void {
    if (!this.report?.id) return;

    this.reportService.exportReport(
      this.report.id,
      format,
      this.parametersForm.value
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.report?.name || 'report'}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.snackBar.open(`Report exported as ${format.toUpperCase()}`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error exporting report:', err);
        this.snackBar.open('Error exporting report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewInReportViewer(): void {
    if (this.report?.id) {
      this.router.navigate(['/reports', this.report.id, 'view']);
    }
  }

  runAgain(): void {
    this.stepper.selectedIndex = 0;
    this.executionResult = null;
  }

  formatValue(value: any, formatting?: any): string {
    if (value === null || value === undefined) return '-';

    if (formatting?.type) {
      switch (formatting.type) {
        case 'currency':
          const prefix = formatting.prefix || '$';
          const decimals = formatting.decimals ?? 2;
          return `${prefix}${parseFloat(value).toFixed(decimals)}`;

        case 'percentage':
          const pctValue = formatting.multiply_by_100 ? value * 100 : value;
          return `${pctValue.toFixed(formatting.decimals || 1)}%`;

        case 'date':
          return new Date(value).toLocaleDateString();

        case 'datetime':
          return new Date(value).toLocaleString();

        case 'number':
          const num = parseFloat(value);
          if (formatting.thousands_separator) {
            return num.toLocaleString();
          }
          return num.toFixed(formatting.decimals || 0);

        default:
          return value.toString();
      }
    }

    return value.toString();
  }

  getDateRangeDefaults(param: Parameter): { start: Date | null, end: Date | null } {
    const today = new Date();
    const defaults = { start: null as Date | null, end: null as Date | null };

    if (param.default_value) {
      // Handle dynamic defaults
      switch (param.default_value.start) {
        case 'current_month_start':
          defaults.start = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'current_week_start':
          const day = today.getDay();
          defaults.start = new Date(today);
          defaults.start.setDate(today.getDate() - day);
          break;
        case 'current_year_start':
          defaults.start = new Date(today.getFullYear(), 0, 1);
          break;
        case 'today':
          defaults.start = new Date(today);
          break;
      }

      switch (param.default_value.end) {
        case 'current_month_end':
          defaults.end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'current_week_end':
          const day = today.getDay();
          defaults.end = new Date(today);
          defaults.end.setDate(today.getDate() + (6 - day));
          break;
        case 'current_year_end':
          defaults.end = new Date(today.getFullYear(), 11, 31);
          break;
        case 'today':
          defaults.end = new Date(today);
          break;
      }
    }

    return defaults;
  }
}
