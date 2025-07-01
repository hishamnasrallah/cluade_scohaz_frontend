// src/app/reports/components/report-preview/report-preview.component.ts

import { Component, Input, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Chart.js
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Models and Services
import {
  Report,
  DataSource,
  Field,
  Filter,
  Parameter,
  ExecutionResult,
  Column
} from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  xField: string;
  yField: string;
  aggregation?: string;
}

interface PreviewState {
  parameters: Record<string, any>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  } | null;
  filters: Record<string, string>;
}

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: 'report-preview.component.html',
  styleUrl: 'report-preview.component.scss'
})
export class ReportPreviewComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('sqlDialog') sqlDialog!: TemplateRef<any>;
  @ViewChild('chartDialog') chartDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() fields: Field[] = [];
  @Input() filters: Filter[] = [];
  @Input() parameters: Parameter[] = [];

  private destroy$ = new Subject<void>();

  // State
  isLoading = false;
  previewData: ExecutionResult | null = null;
  error: string | null = null;

  // UI State
  viewMode: 'table' | 'chart' | 'sql' = 'table';
  showParameterPanel = true;
  showColumnFilters = false;
  selectedRows: any[] = [];

  // Data
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  get allDisplayedColumns(): string[] {
    return ['select', ...this.displayedColumns];
  }

  totalRows = 0;

  // Forms
  parameterForm: FormGroup;
  columnFilterForm: FormGroup;

  // Preview state
  previewState: PreviewState = {
    parameters: {},
    pagination: { pageIndex: 0, pageSize: 25 },
    sort: null,
    filters: {}
  };

  // Configuration summary
  configSummary: any = {};

  // Chart
  chartCanvas: HTMLCanvasElement | null = null;
  currentChart: Chart | null = null;
  chartConfig: ChartConfig = {
    type: 'bar',
    xField: '',
    yField: ''
  };

  // SQL
  sqlQuery = '';
  showSqlHighlighted = true;

  // Cache
  private resultCache = new Map<string, ExecutionResult>();

  // Column visibility
  visibleColumns: Set<string> = new Set();

  // Export options
  exportFormats = ['csv', 'excel', 'pdf', 'json'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.parameterForm = this.fb.group({});
    this.columnFilterForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.buildConfigSummary();
    this.initializeParameterForm();
    this.setupColumnFilters();

    // Auto-run preview if no required parameters
    const hasRequiredParams = this.parameters.some(p => p.is_required && !p.default_value);
    if (!hasRequiredParams && this.report?.id) {
      this.runPreview();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.currentChart) {
      this.currentChart.destroy();
    }
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

  initializeParameterForm(): void {
    const group: any = {};

    this.parameters.forEach(param => {
      const defaultValue = param.default_value !== null && param.default_value !== undefined
        ? param.default_value
        : this.getDefaultValueForType(param.parameter_type);

      group[param.name] = [defaultValue];
      this.previewState.parameters[param.name] = defaultValue;
    });

    this.parameterForm = this.fb.group(group);

    // Subscribe to parameter changes
    this.parameterForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.previewState.parameters = values;
        // Clear cache when parameters change
        this.resultCache.clear();
      });
  }

  setupColumnFilters(): void {
    // Set up column filters after data is loaded
  }

  getDefaultValueForType(type: string): any {
    switch (type) {
      case 'number': return 0;
      case 'boolean': return false;
      case 'date': return new Date();
      case 'date_range': return { start: null, end: null };
      case 'multiselect': return [];
      default: return '';
    }
  }

  async runPreview(): Promise<void> {
    if (!this.report?.id) {
      this.snackBar.open('Please save the report first', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Validate required parameters
    const validationErrors = this.validateParameters();
    if (validationErrors.length > 0) {
      this.snackBar.open(`Missing required parameters: ${validationErrors.join(', ')}`, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Check cache
    const cacheKey = this.getCacheKey();
    const cached = this.resultCache.get(cacheKey);
    if (cached) {
      this.handlePreviewResult(cached);
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const result = await this.reportService.executeReport(this.report.id, {
        parameters: this.previewState.parameters,
        limit: this.previewState.pagination.pageSize,
        offset: this.previewState.pagination.pageIndex * this.previewState.pagination.pageSize,
        export_format: 'json'
      }).toPromise();

      if (result) {
        this.resultCache.set(cacheKey, result);
        this.handlePreviewResult(result);
      }
    } catch (err: any) {
      console.error('Error running preview:', err);
      this.error = err.error?.detail || err.error?.message || 'Failed to generate preview';
      this.snackBar.open('Error generating preview', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  handlePreviewResult(result: ExecutionResult): void {
    this.previewData = result;
    this.totalRows = result.row_count;

    // Set up table data
    this.dataSource.data = result.data || [];

    // Set up columns
    this.displayedColumns = result.columns.map(c => c.name);
    this.visibleColumns = new Set(
      result.columns
        .filter(c => this.fields.find(f => f.field_path === c.name)?.is_visible !== false)
        .map(c => c.name)
    );

    // Apply column visibility
    this.updateDisplayedColumns();

    // Set up sorting and pagination
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    // Set up column filters
    this.setupColumnFilterForm();

    // Generate SQL if needed
    if (this.viewMode === 'sql') {
      this.generateSqlQuery();
    }
  }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.previewData?.columns
      .filter(c => this.visibleColumns.has(c.name))
      .map(c => c.name) || [];
  }

  setupColumnFilterForm(): void {
    const group: any = {};

    this.displayedColumns.forEach(col => {
      group[col] = [''];
    });

    this.columnFilterForm = this.fb.group(group);

    // Apply column filters
    this.columnFilterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(filters => {
        this.applyColumnFilters(filters);
      });
  }

  applyColumnFilters(filters: Record<string, string>): void {
    let filteredData = this.previewData?.data || [];

    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filteredData = filteredData.filter(row => {
          const value = row[column];
          return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    this.dataSource.data = filteredData;
  }

  validateParameters(): string[] {
    const errors: string[] = [];

    this.parameters
      .filter(p => p.is_required)
      .forEach(param => {
        const value = this.parameterForm.get(param.name)?.value;
        if (value === null || value === undefined || value === '') {
          errors.push(param.display_name);
        }
      });

    return errors;
  }

  getCacheKey(): string {
    return JSON.stringify({
      reportId: this.report?.id,
      parameters: this.previewState.parameters,
      pagination: this.previewState.pagination,
      sort: this.previewState.sort
    });
  }

  // View mode methods
  setViewMode(mode: 'table' | 'chart' | 'sql'): void {
    this.viewMode = mode;

    if (mode === 'sql' && !this.sqlQuery) {
      this.generateSqlQuery();
    } else if (mode === 'chart' && this.previewData?.data.length) {
      setTimeout(() => this.openChartConfig(), 100);
    }
  }

  // Parameter methods
  toggleParameterPanel(): void {
    this.showParameterPanel = !this.showParameterPanel;
  }

  resetParameters(): void {
    this.parameters.forEach(param => {
      const defaultValue = param.default_value !== null && param.default_value !== undefined
        ? param.default_value
        : this.getDefaultValueForType(param.parameter_type);

      this.parameterForm.get(param.name)?.setValue(defaultValue);
    });

    this.runPreview();
  }

  getParameterIcon(type: string): string {
    const icons: Record<string, string> = {
      'text': 'text_fields',
      'number': 'pin',
      'date': 'calendar_today',
      'datetime': 'schedule',
      'date_range': 'date_range',
      'select': 'radio_button_checked',
      'multiselect': 'check_box',
      'boolean': 'toggle_on',
      'user': 'person'
    };
    return icons[type] || 'help_outline';
  }

  // Column methods
  toggleColumnFilters(): void {
    this.showColumnFilters = !this.showColumnFilters;
  }

  toggleColumnVisibility(column: string): void {
    if (this.visibleColumns.has(column)) {
      this.visibleColumns.delete(column);
    } else {
      this.visibleColumns.add(column);
    }
    this.updateDisplayedColumns();
  }

  clearColumnFilters(): void {
    this.columnFilterForm.reset();
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selectedRows.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selectedRows = [];
    } else {
      this.selectedRows = [...this.dataSource.data];
    }
  }

  toggleRowSelection(row: any): void {
    const index = this.selectedRows.indexOf(row);
    if (index >= 0) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(row);
    }
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  // Export methods
  exportData(format: string): void {
    if (!this.report?.id || !this.previewData) return;

    const exportData = this.selectedRows.length > 0 ? this.selectedRows : this.dataSource.data;

    if (format === 'json') {
      this.exportJson(exportData);
    } else {
      this.reportService.exportReport(
        this.report.id,
        format as 'csv' | 'excel' | 'pdf',
        this.previewState.parameters
      ).subscribe({
        next: (blob) => {
          this.downloadFile(blob, format);
        },
        error: (err) => {
          console.error('Export error:', err);
          this.snackBar.open('Export failed', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  exportJson(data: any[]): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadFile(blob, 'json');
  }

  downloadFile(blob: Blob, format: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.report?.name}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    this.snackBar.open(`Exported as ${format.toUpperCase()}`, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  // Chart methods
  openChartConfig(): void {
    // Set default fields if not set
    if (!this.chartConfig.xField && this.displayedColumns.length > 0) {
      this.chartConfig.xField = this.displayedColumns[0];
    }
    if (!this.chartConfig.yField && this.displayedColumns.length > 1) {
      this.chartConfig.yField = this.displayedColumns[1];
    }

    this.dialog.open(this.chartDialog, {
      width: '800px',
      height: '600px'
    });

    setTimeout(() => this.createChart(), 100);
  }

  createChart(): void {
    const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    if (!canvas || !this.previewData?.data.length) return;

    if (this.currentChart) {
      this.currentChart.destroy();
    }

    const chartData = this.prepareChartData();

    this.currentChart = new Chart(canvas, {
      type: this.chartConfig.type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.chartConfig.type === 'pie' || this.chartConfig.type === 'doughnut'
          },
          title: {
            display: true,
            text: `${this.getFieldLabel(this.chartConfig.yField)} by ${this.getFieldLabel(this.chartConfig.xField)}`
          }
        },
        scales: this.chartConfig.type !== 'pie' && this.chartConfig.type !== 'doughnut' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      }
    });
  }

  prepareChartData(): any {
    const data = this.previewData?.data || [];

    if (this.chartConfig.aggregation) {
      // Aggregate data
      const grouped = this.groupBy(data, this.chartConfig.xField);
      const labels = Object.keys(grouped);
      const values = labels.map(label => {
        const group = grouped[label];
        const yValues = group.map((item: any) => parseFloat(item[this.chartConfig.yField]) || 0);

        switch (this.chartConfig.aggregation) {
          case 'sum': return yValues.reduce((a, b) => a + b, 0);
          case 'avg': return yValues.reduce((a, b) => a + b, 0) / yValues.length;
          case 'count': return group.length;
          case 'min': return Math.min(...yValues);
          case 'max': return Math.max(...yValues);
          default: return yValues[0];
        }
      });

      return {
        labels,
        datasets: [{
          label: this.getFieldLabel(this.chartConfig.yField),
          data: values,
          backgroundColor: this.generateColors(labels.length),
          borderColor: this.generateColors(labels.length, 1),
          borderWidth: 1
        }]
      };
    } else {
      // Direct mapping
      return {
        labels: data.map(d => d[this.chartConfig.xField]),
        datasets: [{
          label: this.getFieldLabel(this.chartConfig.yField),
          data: data.map(d => parseFloat(d[this.chartConfig.yField]) || 0),
          backgroundColor: this.generateColors(data.length, 0.6),
          borderColor: this.generateColors(data.length, 1),
          borderWidth: 1
        }]
      };
    }
  }

  groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((result, item) => {
      const group = item[key] || 'Unknown';
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  generateColors(count: number, alpha = 0.6): string[] {
    const colors = [
      `rgba(52, 197, 170, ${alpha})`,
      `rgba(47, 72, 88, ${alpha})`,
      `rgba(196, 247, 239, ${alpha})`,
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  updateChart(): void {
    this.createChart();
  }

  // SQL methods
  generateSqlQuery(): void {
    // This is a simplified SQL generation - in production, this would be done server-side
    const tables = this.dataSources.map(ds => `${ds.model_name} AS ${ds.alias}`).join('\n  JOIN ');

    const columns = this.fields
      .filter(f => f.is_visible)
      .map(f => {
        let col = `${this.getDataSourceAlias(f.data_source)}.${f.field_path}`;
        if (f.aggregation) {
          col = `${f.aggregation.toUpperCase()}(${col})`;
        }
        return `${col} AS "${f.display_name}"`;
      })
      .join(',\n  ');

    const whereConditions = this.filters
      .filter(f => f.is_active)
      .map(f => this.filterToSql(f))
      .join('\n  AND ');

    const groupBy = this.fields
      .filter(f => f.aggregation === 'group_by')
      .map(f => `${this.getDataSourceAlias(f.data_source)}.${f.field_path}`)
      .join(', ');

    let sql = `SELECT\n  ${columns}\nFROM\n  ${tables}`;

    if (whereConditions) {
      sql += `\nWHERE\n  ${whereConditions}`;
    }

    if (groupBy) {
      sql += `\nGROUP BY\n  ${groupBy}`;
    }

    sql += '\nLIMIT 1000;';

    this.sqlQuery = sql;
  }

  filterToSql(filter: Filter): string {
    const alias = this.getDataSourceAlias(filter.data_source);
    const field = `${alias}.${filter.field_path}`;

    switch (filter.operator) {
      case 'eq': return `${field} = ${this.formatSqlValue(filter.value)}`;
      case 'ne': return `${field} != ${this.formatSqlValue(filter.value)}`;
      case 'gt': return `${field} > ${this.formatSqlValue(filter.value)}`;
      case 'gte': return `${field} >= ${this.formatSqlValue(filter.value)}`;
      case 'lt': return `${field} < ${this.formatSqlValue(filter.value)}`;
      case 'lte': return `${field} <= ${this.formatSqlValue(filter.value)}`;
      case 'contains': return `${field} LIKE '%${filter.value}%'`;
      case 'startswith': return `${field} LIKE '${filter.value}%'`;
      case 'endswith': return `${field} LIKE '%${filter.value}'`;
      case 'isnull': return `${field} IS NULL`;
      case 'isnotnull': return `${field} IS NOT NULL`;
      case 'in': return `${field} IN (${Array.isArray(filter.value) ? filter.value.map(v => this.formatSqlValue(v)).join(', ') : filter.value})`;
      case 'between': return `${field} BETWEEN ${this.formatSqlValue(filter.value[0])} AND ${this.formatSqlValue(filter.value[1])}`;
      default: return '';
    }
  }

  formatSqlValue(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    return value.toString();
  }

  openSqlDialog(): void {
    this.generateSqlQuery();
    this.dialog.open(this.sqlDialog, {
      width: '800px',
      maxHeight: '80vh'
    });
  }

  copySql(): void {
    navigator.clipboard.writeText(this.sqlQuery).then(() => {
      this.snackBar.open('SQL copied to clipboard', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  // Helper methods
  getDataSourceAlias(dataSourceId: number): string {
    const ds = this.dataSources.find(d => d.id === dataSourceId);
    return ds?.alias || 'unknown';
  }

  getDataSourceName(dataSourceId: number): string {
    const ds = this.dataSources.find(d => d.id === dataSourceId);
    return ds?.alias || 'Unknown';
  }

  getFieldLabel(fieldPath: string): string {
    const field = this.fields.find(f => f.field_path === fieldPath);
    return field?.display_name || fieldPath;
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
          const num = parseFloat(value);
          if (isNaN(num)) return value;
          return `${prefix}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

        case 'percentage':
          const pctValue = formatting.multiply_by_100 ? value * 100 : value;
          return `${pctValue.toFixed(formatting.decimals || 1)}%`;

        case 'date':
          return new Date(value).toLocaleDateString();

        case 'datetime':
          return new Date(value).toLocaleString();

        case 'number':
          const number = parseFloat(value);
          if (isNaN(number)) return value;
          if (formatting.thousands_separator) {
            return number.toLocaleString(undefined, {
              minimumFractionDigits: formatting.decimals || 0,
              maximumFractionDigits: formatting.decimals || 0
            });
          }
          return number.toFixed(formatting.decimals || 0);

        default:
          return value.toString();
      }
    }

    return value.toString();
  }

  formatFilterValue(filter: Filter): string {
    if (filter.value_type === 'parameter') {
      return `{{${filter.value}}}`;
    }
    if (filter.value_type === 'dynamic') {
      return `[${filter.value}]`;
    }
    if (Array.isArray(filter.value)) {
      return filter.value.join(', ');
    }
    return filter.value?.toString() || '';
  }

  getFormattingClass(value: any, formatting?: any): string {
    if (!formatting?.type || formatting.type !== 'conditional') return '';

    // Apply conditional formatting rules
    if (formatting.rules) {
      for (const rule of formatting.rules) {
        if (this.evaluateCondition(value, rule.condition)) {
          return `formatted-${rule.color}`;
        }
      }
    }

    return '';
  }

  evaluateCondition(value: any, condition: string): boolean {
    // Simple condition evaluation
    if (condition.startsWith('< ')) {
      return value < parseFloat(condition.substring(2));
    }
    if (condition.startsWith('> ')) {
      return value > parseFloat(condition.substring(2));
    }
    if (condition.startsWith('= ')) {
      return value == condition.substring(2);
    }
    return false;
  }

  // Refresh methods
  refreshPreview(): void {
    this.resultCache.clear();
    this.runPreview();
  }

  // Pagination
  onPageChange(event: any): void {
    this.previewState.pagination.pageIndex = event.pageIndex;
    this.previewState.pagination.pageSize = event.pageSize;
    this.runPreview();
  }

  // Sorting
  onSortChange(event: any): void {
    this.previewState.sort = {
      field: event.active,
      direction: event.direction
    };
    // Client-side sort is handled by MatTableDataSource
  }

  getColumnFormatting(column: string): any {
    const field = this.fields.find(f => f.field_path === column);
    return field?.formatting;
  }
}
