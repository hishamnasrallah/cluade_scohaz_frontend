// src/app/components/inquiry/inquiry-executor/inquiry-executor.component.ts

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { InquiryExecutorService } from '../../../services/inquiry-executor.service';
import { DynamicFiltersComponent } from '../components/dynamic-filters/dynamic-filters.component';
// import { DynamicTableComponent } from '../components/dynamic-table/dynamic-table.component';
// import { SearchBarComponent } from '../components/search-bar/search-bar.component';
// import { DataVisualizerComponent } from '../components/data-visualizer/data-visualizer.component';
// import { ColumnSelectorComponent } from '../components/column-selector/column-selector.component';
import {
  InquirySchema,
  InquiryExecutionParams,
  InquiryExecutionResponse
} from '../../../models/inquiry-config.models';
import {
  DynamicColumn,
  DynamicFilter,
  SortState,
  InquiryStatistics
} from '../../../models/inquiry-execution.models';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {MatDivider} from '@angular/material/divider';
import {DynamicTableComponent} from '../components/dynamic-table/dynamic-table.component';
import {DataVisualizerComponent} from '../components/data-visualizer/data-visualizer.component';
import {SearchBarComponent} from '../components/search-bar/search-bar.component';

@Component({
  selector: 'app-inquiry-executor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    DynamicFiltersComponent,
    // DynamicTableComponent,
    // SearchBarComponent,
    // DataVisualizerComponent,
    // ColumnSelectorComponent,
    TranslatePipe,
    MatDivider,
    DynamicTableComponent,
    DataVisualizerComponent,
    SearchBarComponent
  ],
  templateUrl: './inquiry-executor.component.html',
  styleUrls: ['./inquiry-executor.component.scss']
})
export class InquiryExecutorComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // State
  inquiryCode: string = '';
  inquirySchema: InquirySchema | null = null;
  isLoading = false;
  showFilters = true;
  showVisualization = false;

  // Data
  tableData: any[] = [];
  columns: DynamicColumn[] = [];
  visibleColumns: DynamicColumn[] = [];
  filters: DynamicFilter[] = [];
  searchableFields: string[] = [];
  rowActions: any[] = [];

  // Filter and search
  filterForm: FormGroup;
  currentFilterValues: Record<string, any> = {};
  searchQuery = '';
  activeFilterCount = 0;

  // Sorting
  currentSort: SortState[] = [];

  // Pagination
  totalRecords = 0;
  pageSize = 25;
  pageIndex = 0;

  // Statistics
  statistics: InquiryStatistics | null = null;
  executionTime = 0;
  aggregationResults: any[] = [];

  // Visualization
  availableVisualizations: any[] = [];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private inquiryExecutorService: InquiryExecutorService,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.inquiryCode = this.route.snapshot.paramMap.get('code') || '';

    if (!this.inquiryCode) {
      this.router.navigate(['/inquiry']);
      return;
    }

    this.setupSearchDebounce();
    this.loadInquirySchema();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.executeInquiry();
      });
  }

  private loadInquirySchema(): void {
    this.isLoading = true;

    this.inquiryExecutorService.getInquirySchema(this.inquiryCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schema) => {
          this.inquirySchema = schema;
          this.setupInquiry(schema);
          this.executeInquiry();
        },
        error: (error) => {
          console.error('Error loading inquiry schema:', error);
          this.snackBar.open('Error loading inquiry configuration', 'Close', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
  }

  private setupInquiry(schema: InquirySchema): void {
    // Setup columns
    this.columns = schema.fields.map(field => ({
      field: field.field_path,
      header: field.display_name,
      type: this.mapFieldType(field.field_type),
      sortable: field.is_sortable,
      searchable: field.is_searchable,
      width: field.width,
      align: (field.alignment as 'left' | 'center' | 'right') || 'left',
      format: field.format_template,
      visible: field.is_visible !== false,
      aggregation: undefined // Will be set if field has aggregation
    }));

    // Load column preferences
    const savedColumns = this.inquiryExecutorService.getColumnPreferences(this.inquiryCode);
    if (savedColumns) {
      this.visibleColumns = this.columns.filter(col => savedColumns.includes(col.field));
    } else {
      this.visibleColumns = this.columns.filter(col => col.visible);
    }

    // Setup filters
    this.filters = schema.filters.map(filter => ({
      field: filter.field_path,
      label: filter.name,
      type: filter.filter_type as any,
      operator: filter.operator,
      value: filter.default_value,
      options: filter.choices?.map(choice => ({
        value: choice.value,
        label: choice.label,
        count: undefined,
        disabled: false
      })),
      placeholder: filter.placeholder,
      helpText: filter.help_text,
      required: filter.is_required,
      visible: !filter.is_advanced,
      advanced: filter.is_advanced
    }));

    // Setup searchable fields
    this.searchableFields = schema.fields
      .filter(field => field.is_searchable)
      .map(field => field.field_path);

    // Set page size
    this.pageSize = schema.inquiry.default_page_size;

    // Add to recent inquiries
    this.inquiryExecutorService.addToRecent({
      code: schema.inquiry.code,
      name: schema.inquiry.name,
      display_name: schema.inquiry.display_name,
      icon: schema.inquiry.icon,
      description: schema.inquiry.description
    });
  }

  executeInquiry(): void {
    if (!this.inquirySchema) return;

    const params: InquiryExecutionParams = {
      filters: this.currentFilterValues,
      search: this.searchQuery,
      sort: this.currentSort,
      page: this.pageIndex + 1,
      page_size: this.pageSize,
      include_aggregations: true
    };

    this.isLoading = true;

    this.inquiryExecutorService.executeInquiry(this.inquiryCode, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.handleExecutionResponse(response);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error executing inquiry:', error);
          this.snackBar.open('Error loading data', 'Close', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
  }

  private handleExecutionResponse(response: InquiryExecutionResponse): void {
    this.tableData = response.results;
    this.totalRecords = response.count;
    this.executionTime = response.execution_time_ms;

    // Update statistics
    this.inquiryExecutorService.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.statistics = stats;
        if (stats?.aggregations) {
          this.aggregationResults = Object.entries(stats.aggregations).map(([key, value]) => ({
            label: key,
            value: value
          }));
        }
      });
  }

  // Filter handling
  onFilterChange(filterValues: Record<string, any>): void {
    this.currentFilterValues = filterValues;
    this.activeFilterCount = Object.values(filterValues).filter(v =>
      v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
    ).length;

    this.pageIndex = 0; // Reset to first page
    this.executeInquiry();
  }

  onClearFilters(): void {
    this.currentFilterValues = {};
    this.activeFilterCount = 0;
    this.executeInquiry();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Search handling
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.pageIndex = 0; // Reset to first page
    this.searchSubject.next(query);
  }

  // Sort handling
  onSortChange(sort: SortState[]): void {
    this.currentSort = sort;
    this.executeInquiry();
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.executeInquiry();
  }

  // Column management
  openColumnSelector(): void {
    // This would open a dialog/panel for column selection
    // For now, just toggle visibility
  }

  onColumnSelectionChange(selectedColumns: string[]): void {
    this.visibleColumns = this.columns.filter(col =>
      selectedColumns.includes(col.field)
    );

    // Save preferences
    this.inquiryExecutorService.saveColumnPreferences(
      this.inquiryCode,
      selectedColumns
    );
  }

  // Visualization
  toggleVisualization(): void {
    this.showVisualization = !this.showVisualization;
  }

  onVisualizationConfigChange(config: any): void {
    // Handle visualization configuration changes
  }

  // Export
  exportData(format: string): void {
    const params: InquiryExecutionParams = {
      filters: this.currentFilterValues,
      search: this.searchQuery,
      sort: this.currentSort
    };

    this.inquiryExecutorService.exportData(this.inquiryCode, params, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, format);
          this.snackBar.open('Export completed successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.snackBar.open('Error exporting data', 'Close', {
            duration: 3000
          });
        }
      });
  }

  private downloadFile(blob: Blob, format: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.inquiryCode}_${new Date().toISOString()}.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Row actions
  onRowClick(row: any): void {
    // Handle row click
  }

  onSelectionChange(selectedRows: any[]): void {
    // Handle selection change
  }

  // Utility methods
  private mapFieldType(fieldType: string): DynamicColumn['type'] {
    const typeMap: Record<string, DynamicColumn['type']> = {
      'string': 'string',
      'number': 'number',
      'decimal': 'number',
      'boolean': 'boolean',
      'date': 'date',
      'datetime': 'date',
      'json': 'json',
      'reference': 'relation',
      'multi_reference': 'relation'
    };

    return typeMap[fieldType] || 'string';
  }

  formatAggregation(agg: any): string {
    if (typeof agg.value === 'number') {
      return agg.value.toLocaleString();
    }
    return agg.value;
  }
}
