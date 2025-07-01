// src/app/reports/components/report-preview/report-preview.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Report, DataSource, Field, Filter, Parameter, ExecutionResult } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: 'report-preview.component.html',
  styleUrl: 'report-preview.component.scss'
})
export class ReportPreviewComponent implements OnInit {
  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() fields: Field[] = [];
  @Input() filters: Filter[] = [];
  @Input() parameters: Parameter[] = [];

  isLoading = false;
  previewData: ExecutionResult | null = null;
  error: string | null = null;

  // Configuration summary
  configSummary: any = {};

  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildConfigSummary();
  }

  buildConfigSummary(): void {
    this.configSummary = {
      dataSources: this.dataSources.length,
      fields: this.fields.length,
      visibleFields: this.fields.filter(f => f.is_visible).length,
      aggregatedFields: this.fields.filter(f => f.aggregation).length,
      filters: this.filters.length,
      activeFilters: this.filters.filter(f => f.is_active).length,
      parameters: this.parameters.length,
      requiredParameters: this.parameters.filter(p => p.is_required).length
    };
  }
  get displayedColumns(): string[] {
    return this.previewData?.columns?.map(c => c.name) || [];
  }
  formatFilterValue(filter: Filter): string {
    if (filter.value_type === 'parameter') {
      return `{{${filter.value}}}`;
    }
    return filter.value;
  }
  runPreview(): void {
    if (!this.report?.id) {
      this.snackBar.open('Please save the report first', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Build default parameter values
    const defaultParams: Record<string, any> = {};
    this.parameters.forEach(param => {
      if (param.default_value !== null && param.default_value !== undefined) {
        defaultParams[param.name] = param.default_value;
      }
    });

    this.reportService.previewReport(this.report.id, defaultParams).subscribe({
      next: (result) => {
        this.previewData = result;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error running preview:', err);
        this.error = err.error?.detail || 'Failed to generate preview';
        this.isLoading = false;
        this.snackBar.open('Error generating preview', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  exportPreview(format: 'csv' | 'excel'): void {
    if (!this.report?.id || !this.previewData) {
      this.snackBar.open('No report or preview data available', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.reportService.exportReport(this.report.id, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.report?.name}_preview.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.snackBar.open(`Preview exported as ${format.toUpperCase()}`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error exporting preview:', err);
        this.snackBar.open('Error exporting preview', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getFieldDisplayName(fieldPath: string): string {
    const field = this.fields.find(f => f.field_path === fieldPath);
    return field?.display_name || fieldPath;
  }

  getDataSourceName(dataSourceId: number): string {
    const ds = this.dataSources.find(d => d.id === dataSourceId);
    return ds?.alias || 'Unknown';
  }

  getParameterType(type: string): string {
    const types: Record<string, string> = {
      'text': 'Text',
      'number': 'Number',
      'date': 'Date',
      'datetime': 'Date & Time',
      'date_range': 'Date Range',
      'select': 'Select',
      'multiselect': 'Multi-Select',
      'boolean': 'Yes/No',
      'user': 'User'
    };
    return types[type] || type;
  }

  getOperatorLabel(operator: string): string {
    const operators: Record<string, string> = {
      'eq': 'Equals',
      'ne': 'Not Equals',
      'gt': 'Greater Than',
      'gte': 'Greater Than or Equal',
      'lt': 'Less Than',
      'lte': 'Less Than or Equal',
      'in': 'In List',
      'not_in': 'Not In List',
      'contains': 'Contains',
      'icontains': 'Contains (Case Insensitive)',
      'startswith': 'Starts With',
      'endswith': 'Ends With',
      'isnull': 'Is Null',
      'isnotnull': 'Is Not Null',
      'between': 'Between',
      'date_range': 'Date Range'
    };
    return operators[operator] || operator;
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
}
