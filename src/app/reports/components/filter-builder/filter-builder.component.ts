// src/app/reports/components/filter-builder/filter-builder.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Report, DataSource, Field, Filter, Parameter, FilterOperator, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface FilterGroup {
  order: number;
  logic: 'AND' | 'OR';
  filters: Filter[];
}

@Component({
  selector: 'app-filter-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: 'filter-builder.component.html',
  styleUrl: 'filter-builder.component.scss'
})
export class FilterBuilderComponent implements OnInit, OnChanges {
  @ViewChild('quickActionsDialog') quickActionsDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() filters: Filter[] = [];
  @Input() parameters: Parameter[] = [];
  @Output() filtersChange = new EventEmitter<Filter[]>();

  // Available fields by data source
  availableFields: Map<number, FieldInfo[]> = new Map();

  // Filter groups for logical grouping
  filterGroups: FilterGroup[] = [];

  // Temporary ID counter for filters without backend IDs
  private tempIdCounter = -1;

  constructor(
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAvailableFields();
    this.organizeFiltersIntoGroups();
  }

  ngOnChanges(): void {
    if (this.dataSources.length > 0) {
      this.loadAvailableFields();
    }
    this.organizeFiltersIntoGroups();
  }

  loadAvailableFields(): void {
    for (const dataSource of this.dataSources) {
      if (!dataSource.content_type_id) continue;

      this.reportService.getContentTypeFields(dataSource.content_type_id).subscribe({
        next: (response) => {
          const key = dataSource.id || dataSource.content_type_id;
          this.availableFields.set(key, response.fields);
        },
        error: (err) => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        }
      });
    }
  }

  organizeFiltersIntoGroups(): void {
    const groups = new Map<number, FilterGroup>();

    // Group filters by group_order
    this.filters.forEach(filter => {
      const groupOrder = filter.group_order || 0;

      if (!groups.has(groupOrder)) {
        groups.set(groupOrder, {
          order: groupOrder,
          logic: filter.logic_group || 'AND',
          filters: []
        });
      }

      groups.get(groupOrder)!.filters.push(filter);
    });

    // Convert to array and sort by order
    this.filterGroups = Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }

  addFilter(): void {
    if (this.dataSources.length === 0) {
      this.snackBar.open('Please add data sources first', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const primaryDataSource = this.dataSources.find(ds => ds.is_primary) || this.dataSources[0];

    if (!this.report?.id) {
      // For new reports without ID, create a temporary filter
      const tempFilter: Filter = {
        id: this.tempIdCounter--, // Temporary negative ID for tracking
        report: 0, // Temporary value
        data_source: primaryDataSource.id || primaryDataSource.content_type_id!,
        field_path: '',
        field_name: '',
        operator: 'eq',
        value: '',
        value_type: 'static',
        logic_group: 'AND',
        group_order: 0,
        is_active: true,
        is_required: false
      };

      this.filters.push(tempFilter);
      this.organizeFiltersIntoGroups();
      this.filtersChange.emit(this.filters);

      this.snackBar.open('Filter added (will be saved with report)', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    } else {
      // For existing reports, save to backend
      const newFilter: Partial<Filter> = {
        report: this.report.id,
        data_source: primaryDataSource.id!,
        field_path: '',
        operator: 'eq',
        value: '',
        value_type: 'static',
        logic_group: 'AND',
        group_order: 0,
        is_active: true,
        is_required: false
      };

      this.reportService.createFilter(newFilter).subscribe({
        next: (filter) => {
          this.filters.push(filter);
          this.organizeFiltersIntoGroups();
          this.filtersChange.emit(this.filters);

          this.snackBar.open('Filter added', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Error adding filter:', err);
          this.snackBar.open('Error adding filter', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  addFilterToGroup(group: FilterGroup): void {
    if (this.dataSources.length === 0) return;

    const primaryDataSource = this.dataSources.find(ds => ds.is_primary) || this.dataSources[0];

    if (!this.report?.id) {
      // For new reports without ID, create a temporary filter
      const tempFilter: Filter = {
        report: 0, // Temporary value
        data_source: primaryDataSource.id || primaryDataSource.content_type_id!,
        field_path: '',
        field_name: '',
        operator: 'eq',
        value: '',
        value_type: 'static',
        logic_group: group.logic,
        group_order: group.order,
        is_active: true,
        is_required: false
      };

      this.filters.push(tempFilter);
      this.organizeFiltersIntoGroups();
      this.filtersChange.emit(this.filters);
    } else {
      // For existing reports, save to backend
      const newFilter: Partial<Filter> = {
        report: this.report.id,
        data_source: primaryDataSource.id!,
        field_path: '',
        operator: 'eq',
        value: '',
        value_type: 'static',
        logic_group: group.logic,
        group_order: group.order,
        is_active: true,
        is_required: false
      };

      this.reportService.createFilter(newFilter).subscribe({
        next: (filter) => {
          this.filters.push(filter);
          this.organizeFiltersIntoGroups();
          this.filtersChange.emit(this.filters);
        }
      });
    }
  }

  addFilterGroup(): void {
    const nextGroupOrder = this.filterGroups.length;
    this.addFilterToGroup({
      order: nextGroupOrder,
      logic: nextGroupOrder % 2 === 0 ? 'AND' : 'OR',
      filters: []
    });
  }

  updateFilter(filter: Filter): void {
    if (!filter.id) {
      // For filters without ID (new report), just update locally
      this.filtersChange.emit(this.filters);
      return;
    }

    const updates: Partial<Filter> = {
      field_path: filter.field_path,
      operator: filter.operator,
      value: filter.value,
      value_type: filter.value_type,
      logic_group: filter.logic_group,
      is_active: filter.is_active,
      is_required: filter.is_required
    };

    this.reportService.updateFilter(filter.id, updates).subscribe({
      next: (updated) => {
        const index = this.filters.findIndex(f => f.id === updated.id);
        if (index >= 0) {
          this.filters[index] = updated;
          this.filtersChange.emit(this.filters);
        }
      },
      error: (err) => {
        console.error('Error updating filter:', err);
        this.snackBar.open('Error updating filter', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeFilter(filter: Filter): void {
    if (!filter.id) {
      // For filters without ID (new report), just remove locally
      const index = this.filters.indexOf(filter);
      if (index >= 0) {
        this.filters.splice(index, 1);
        this.organizeFiltersIntoGroups();
        this.filtersChange.emit(this.filters);
      }
      return;
    }

    if (confirm('Remove this filter?')) {
      this.reportService.deleteFilter(filter.id).subscribe({
        next: () => {
          this.filters = this.filters.filter(f => f.id !== filter.id);
          this.organizeFiltersIntoGroups();
          this.filtersChange.emit(this.filters);

          this.snackBar.open('Filter removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        },
        error: (err) => {
          console.error('Error removing filter:', err);
          this.snackBar.open('Error removing filter', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  duplicateFilter(filter: Filter): void {
    if (!this.report?.id) {
      // For new reports without ID, duplicate locally
      const duplicate: Filter = {
        ...filter,
        // Create a new object without ID
        id: undefined
      };
      delete duplicate.id;

      this.filters.push(duplicate);
      this.organizeFiltersIntoGroups();
      this.filtersChange.emit(this.filters);

      this.snackBar.open('Filter duplicated', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } else {
      // For existing reports, save to backend
      const duplicate: Partial<Filter> = {
        report: this.report.id,
        data_source: filter.data_source,
        field_path: filter.field_path,
        field_name: filter.field_name,
        operator: filter.operator,
        value: filter.value,
        value_type: filter.value_type,
        logic_group: filter.logic_group,
        group_order: filter.group_order,
        is_active: filter.is_active,
        is_required: false
      };

      this.reportService.createFilter(duplicate).subscribe({
        next: (newFilter) => {
          this.filters.push(newFilter);
          this.organizeFiltersIntoGroups();
          this.filtersChange.emit(this.filters);

          this.snackBar.open('Filter duplicated', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        }
      });
    }
  }

  onFilterDrop(event: CdkDragDrop<Filter[]>, group: FilterGroup): void {
    moveItemInArray(group.filters, event.previousIndex, event.currentIndex);

    // Update all filters in the group with new order
    const updates = group.filters.map((filter, index) => {
      if (filter.id) {
        return this.reportService.updateFilter(filter.id, { group_order: group.order });
      }
      return null;
    }).filter(obs => obs !== null);

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs!.toPromise())).then(() => {
        this.filtersChange.emit(this.filters);
      });
    } else {
      // If no filters have IDs, just emit the change
      this.filtersChange.emit(this.filters);
    }
  }

  onFieldChange(filter: Filter): void {
    // Reset operator and value when field changes
    const fieldInfo = this.getFieldInfo(filter);
    if (fieldInfo) {
      filter.field_name = fieldInfo.name;
      const operators = this.getOperatorsForField(filter);
      if (operators.length > 0 && !operators.find(op => op.value === filter.operator)) {
        filter.operator = operators[0].value as FilterOperator;
      }
      filter.value = '';
      this.updateFilter(filter);
    }
  }

  onOperatorChange(filter: Filter): void {
    // Reset value when operator changes
    if (filter.operator === 'between' || filter.operator === 'date_range') {
      filter.value = filter.operator === 'date_range'
        ? { start: null, end: null }
        : [null, null];
    } else if (filter.operator === 'in' || filter.operator === 'not_in') {
      filter.value = '';
    } else if (filter.operator === 'isnull' || filter.operator === 'isnotnull') {
      filter.value = null;
    } else {
      filter.value = '';
    }
    this.updateFilter(filter);
  }

  onValueTypeChange(filter: Filter): void {
    // Reset value when value type changes
    filter.value = '';
    this.updateFilter(filter);
  }

  getFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    const key = dataSource.id || dataSource.content_type_id;
    return this.availableFields.get(key!) || [];
  }

  getFieldInfo(filter: Filter): FieldInfo | null {
    const dataSource = this.dataSources.find(ds => ds.id === filter.data_source);
    if (!dataSource) return null;

    const fields = this.getFieldsForDataSource(dataSource);
    return fields.find(f => f.path === filter.field_path) || null;
  }

  getFieldDisplayName(filter: Filter): string {
    const fieldInfo = this.getFieldInfo(filter);
    return fieldInfo?.verbose_name || filter.field_path;
  }

  getOperatorsForField(filter: Filter): Array<{ value: string; label: string }> {
    const fieldInfo = this.getFieldInfo(filter);
    if (!fieldInfo) return [];

    return this.reportService.getOperatorOptions(fieldInfo.type);
  }

  getOperatorLabel(operator: string): string {
    const operators = this.reportService.getOperatorOptions('CharField');
    const op = operators.find(o => o.value === operator);
    return op?.label || operator;
  }

  getInputType(filter: Filter): string {
    const fieldInfo = this.getFieldInfo(filter);
    if (!fieldInfo) return 'text';

    switch (fieldInfo.type.toLowerCase()) {
      case 'integerfield':
      case 'floatfield':
      case 'decimalfield':
        return 'number';
      case 'datefield':
        return 'date';
      case 'datetimefield':
        return 'datetime-local';
      case 'emailfield':
        return 'email';
      case 'urlfield':
        return 'url';
      default:
        return 'text';
    }
  }

  formatFilterValue(filter: Filter): string {
    if (filter.value === null || filter.value === undefined) {
      return 'N/A';
    }

    switch (filter.value_type) {
      case 'parameter':
        return `{{${filter.value}}}`;
      case 'dynamic':
        const dynamicValues = this.reportService.getDynamicValues();
        const dynamicValue = dynamicValues.find(dv => dv.type === filter.value);
        return dynamicValue?.label || filter.value;
      case 'user_attribute':
        return `User.${filter.value}`;
      default:
        if (filter.operator === 'between' && Array.isArray(filter.value)) {
          return `${filter.value[0]} to ${filter.value[1]}`;
        }
        if (filter.operator === 'date_range' && typeof filter.value === 'object') {
          return `${filter.value.start || 'Start'} to ${filter.value.end || 'End'}`;
        }
        if (filter.operator === 'in' || filter.operator === 'not_in') {
          return filter.value.toString();
        }
        return filter.value.toString();
    }
  }

  getFieldIcon(type: string): string {
    const icons: Record<string, string> = {
      'CharField': 'text_fields',
      'TextField': 'subject',
      'IntegerField': 'pin',
      'FloatField': 'calculate',
      'DecimalField': 'calculate',
      'BooleanField': 'toggle_on',
      'DateField': 'calendar_today',
      'DateTimeField': 'schedule',
      'EmailField': 'email',
      'URLField': 'link',
      'ForeignKey': 'link',
      'ManyToManyField': 'call_split'
    };
    return icons[type] || 'text_fields';
  }

  getActiveFiltersCount(): number {
    return this.filters.filter(f => f.is_active).length;
  }

  // Quick Actions
  addCommonFilters(): void {
    // This would add commonly used filters based on the data sources
    this.snackBar.open('Feature coming soon', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  clearAllFilters(): void {
    if (confirm('Remove all filters?')) {
      // Handle filters with IDs (need to delete from backend)
      const deletions = this.filters
        .filter(filter => filter.id)
        .map(filter => this.reportService.deleteFilter(filter.id!));

      if (deletions.length > 0) {
        Promise.all(deletions.map(obs => obs.toPromise())).then(() => {
          this.filters = [];
          this.filterGroups = [];
          this.filtersChange.emit(this.filters);

          this.snackBar.open('All filters removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        });
      } else {
        // No filters have IDs, just clear locally
        this.filters = [];
        this.filterGroups = [];
        this.filtersChange.emit(this.filters);

        this.snackBar.open('All filters removed', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      }
    }
  }

  enableAllFilters(): void {
    const updates = this.filters
      .filter(filter => filter.id && !filter.is_active)
      .map(filter => this.reportService.updateFilter(filter.id!, { is_active: true }));

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs.toPromise())).then(() => {
        this.filters.forEach(filter => filter.is_active = true);
        this.filtersChange.emit(this.filters);

        this.snackBar.open('All filters enabled', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      });
    }
  }

  disableAllFilters(): void {
    const updates = this.filters
      .filter(filter => filter.id && filter.is_active)
      .map(filter => this.reportService.updateFilter(filter.id!, { is_active: false }));

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs.toPromise())).then(() => {
        this.filters.forEach(filter => filter.is_active = false);
        this.filtersChange.emit(this.filters);

        this.snackBar.open('All filters disabled', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      });
    }
  }

  showQuickActions(): void {
    this.dialog.open(this.quickActionsDialog, {
      width: '400px'
    });
  }
}
