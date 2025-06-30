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
    private router: Router,
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
        if (param.validation_rules.min_value !== null) {
          validators.push(Validators.min(param.validation_rules.min_value));
        }
        if (param.validation_rules.max_value !== null) {
          validators.push(Validators.max(param.validation_rules.max_value));
        }
      }

      if (param.parameter_type === 'text' && param.validation_rules) {
        if (param.validation_rules.min_length) {
          validators.push(Validators.minLength(param.validation_rules.min_length));
        }
        if (param.validation_rules.max_length) {
          validators.push(Validators.maxLength(param.validation_rules.max_length));
        }
        if (param.validation_rules.regex) {
          validators.push(Validators.pattern(param.validation_rules.regex));
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

      group[param.name] = [defaultValue, validators];
    }

    this.parametersForm = this.fb.group(group);
  }

  getParameterControl(paramName: string): any {
    return this.parametersForm.get(paramName);
  }

  getParameterError(param: Parameter): string {
    const control = this.getParameterControl(param.name);
    if (!control || !control.invalid || !control.touched) return '';

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

    const executionParams = {
      parameters: this.parametersForm.value,
      limit: this.optionsForm.get('limit')?.value || 1000,
      export_format: this.selectedFormat,
      save_result: this.optionsForm.get('save_result')?.value,
      result_name: this.optionsForm.get('result_name')?.value
    };

    this.reportService.executeReport(this.report.id, executionParams).subscribe({
      next: (result) => {
        this.executionResult = result;
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
        a.download = `${this.report.name}.${format === 'excel' ? 'xlsx' : format}`;
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
