// components/settings/inquiry-management/components/preview-viewer/preview-viewer.component.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { InquiryConfigService } from '../../../../../services/inquiry-config.service';
import {
  InquirySchema,
  InquiryExecutionParams,
  InquiryExecutionResponse,
  InquiryFieldSchema,
  InquiryFilterSchema
} from '../../../../../models/inquiry-config.models';
import { TranslatePipe } from '../../../../../pipes/translate.pipe';

interface TableColumn {
  field: string;
  header: string;
  sortable: boolean;
  type: string;
  width?: string;
  alignment?: string;
  formatTemplate?: string;
}

@Component({
  selector: 'app-preview-viewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    TranslatePipe,
    FormsModule
  ],
  templateUrl: './preview-viewer.component.html',
  styleUrls: ['./preview-viewer.component.scss']
})
export class PreviewViewerComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // State
  isLoading = false;
  isLoadingData = false;
  isExporting = false;
  inquiryCode: string = '';

  // Schema and data
  inquirySchema: InquirySchema | null = null;
  dataSource = new MatTableDataSource<any>();
  totalRecords = 0;

  // Table configuration
  displayedColumns: string[] = [];
  columns: TableColumn[] = [];

  // Filters
  filterForm!: FormGroup;
  searchQuery = '';
  showAdvancedFilters = false;

  // Pagination
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  // Aggregations
  aggregations: any = {};

  // Export formats
  availableExportFormats: Array<{ value: string; label: string; icon: string }> = [];

  // Execution time
  executionTime = 0;

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private inquiryService: InquiryConfigService,
    private snackBar: MatSnackBar
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.inquiryCode = this.route.snapshot.paramMap.get('code') || '';

    if (!this.inquiryCode) {
      this.router.navigate(['/settings/inquiry-management']);
      return;
    }

    this.loadInquirySchema();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({});
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.executeInquiry();
    });
  }

  private loadInquirySchema(): void {
    this.isLoading = true;

    this.inquiryService.getInquirySchema(this.inquiryCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schema) => {
          this.inquirySchema = schema;
          this.setupTable(schema.fields);
          this.setupFilters(schema.filters);
          this.setupExportFormats(schema.permissions.export_formats);
          this.pageSize = schema.inquiry.default_page_size;
          this.isLoading = false;

          // Load initial data
          this.executeInquiry();
        },
        error: (error) => {
          this.snackBar.open('Error loading inquiry schema', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoading = false;
        }
      });
  }

  private setupTable(fields: InquiryFieldSchema[]): void {
    this.columns = fields
      .filter(field => field.is_visible !== false)
      .map(field => ({
        field: field.field_path,
        header: field.display_name,
        sortable: field.is_sortable,
        type: field.field_type,
        width: field.width,
        alignment: field.alignment,
        formatTemplate: field.format_template
      }));

    this.displayedColumns = this.columns.map(col => col.field);
  }

  private setupFilters(filters: InquiryFilterSchema[]): void {
    const filterControls: any = {};

    filters.forEach(filter => {
      const defaultValue = filter.default_value || (filter.filter_type === 'multiselect' ? [] : '');
      filterControls[filter.code] = [defaultValue];
    });

    this.filterForm = this.fb.group(filterControls);

    // Apply default values if any
    const hasDefaults = filters.some(f => f.default_value !== null && f.default_value !== undefined);
    if (hasDefaults) {
      setTimeout(() => this.executeInquiry(), 100);
    }
  }

  private setupExportFormats(formats: string[]): void {
    const formatMap: { [key: string]: { label: string; icon: string } } = {
      'csv': { label: 'CSV', icon: 'table_chart' },
      'xlsx': { label: 'Excel', icon: 'description' },
      'json': { label: 'JSON', icon: 'code' },
      'pdf': { label: 'PDF', icon: 'picture_as_pdf' }
    };

    this.availableExportFormats = formats.map(format => ({
      value: format,
      label: formatMap[format]?.label || format.toUpperCase(),
      icon: formatMap[format]?.icon || 'download'
    }));
  }

  executeInquiry(): void {
    if (!this.inquirySchema) return;

    this.isLoadingData = true;

    const params: InquiryExecutionParams = {
      filters: this.getActiveFilters(),
      search: this.searchQuery,
      page: this.pageIndex + 1,
      page_size: this.pageSize,
      include_aggregations: true
    };

    // Add sorting
    if (this.sort?.active && this.sort.direction) {
      params.sort = [{
        field: this.sort.active,
        direction: this.sort.direction
      }];
    }

    this.inquiryService.executeInquiry(this.inquiryCode, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: InquiryExecutionResponse) => {
          this.dataSource.data = response.results;
          this.totalRecords = response.count;
          this.aggregations = response.aggregations || {};
          this.executionTime = response.execution_time_ms;
          this.isLoadingData = false;

          // Connect paginator and sort
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        },
        error: (error) => {
          this.snackBar.open('Error executing inquiry', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoadingData = false;
        }
      });
  }

  private getActiveFilters(): Record<string, any> {
    const filters: Record<string, any> = {};
    const formValues = this.filterForm.value;

    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== undefined && value !== '' &&
        (!Array.isArray(value) || value.length > 0)) {
        filters[key] = value;
      }
    });

    return filters;
  }

  // Table methods
  getCellValue(row: any, column: TableColumn): any {
    const keys = column.field.split('.');
    let value = row;

    for (const key of keys) {
      value = value?.[key];
    }

    return this.formatCellValue(value, column);
  }

  private formatCellValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return '-';

    // Apply format template if provided
    if (column.formatTemplate) {
      return this.applyFormatTemplate(value, column.formatTemplate);
    }

    // Default formatting based on type
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
      case 'decimal':
        return value.toLocaleString();
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  private applyFormatTemplate(value: any, template: string): string {
    // Simple template replacement
    return template.replace(/\{value\}/g, value);
  }

  // Filter methods
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.searchQuery = '';
    this.executeInquiry();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.executeInquiry();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.executeInquiry();
  }

  // Sorting
  onSortChange(sort: any): void {
    this.executeInquiry();
  }

  // Export
  exportData(format: string): void {
    if (!this.inquirySchema?.permissions.can_export) {
      this.snackBar.open('Export not allowed', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    this.isExporting = true;

    const params: InquiryExecutionParams = {
      filters: this.getActiveFilters(),
      search: this.searchQuery,
      export: format
    };

    // Add sorting
    if (this.sort?.active && this.sort.direction) {
      params.sort = [{
        field: this.sort.active,
        direction: this.sort.direction
      }];
    }

    this.inquiryService.executeInquiry(this.inquiryCode, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: any) => {
          // Handle file download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.inquiryCode}_export.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.isExporting = false;
          this.snackBar.open('Export completed successfully', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        },
        error: (error) => {
          this.snackBar.open('Error exporting data', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isExporting = false;
        }
      });
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/settings/inquiry-management']);
  }

  editInquiry(): void {
    this.router.navigate(['/settings/inquiry-management/edit', this.inquiryCode]);
  }

  // Utility methods
  getFilterByCode(code: string): InquiryFilterSchema | undefined {
    return this.inquirySchema?.filters.find(f => f.code === code);
  }

  isFilterRequired(code: string): boolean {
    return this.getFilterByCode(code)?.is_required || false;
  }

  isAdvancedFilter(code: string): boolean {
    return this.getFilterByCode(code)?.is_advanced || false;
  }

  getVisibleFilters(): InquiryFilterSchema[] {
    if (!this.inquirySchema) return [];

    return this.inquirySchema.filters.filter(f =>
      !f.is_advanced || this.showAdvancedFilters
    );
  }

  hasAdvancedFilters(): boolean {
    return this.inquirySchema?.filters.some(f => f.is_advanced) || false;
  }

  getActiveFilterCount(): number {
    const filters = this.getActiveFilters();
    return Object.keys(filters).length + (this.searchQuery ? 1 : 0);
  }

  protected readonly Object = Object;

  formatAggregationValue(value: any): string {
    if (value === null || value === undefined) return '0';

    // Check if it's a number
    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    // Try to parse as number
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return numValue.toLocaleString();
    }

    // Return as string if not a number
    return String(value);
  }
}
