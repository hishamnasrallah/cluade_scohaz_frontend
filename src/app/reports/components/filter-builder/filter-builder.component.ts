// src/app/reports/components/filter-builder/filter-builder.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Report, DataSource, Filter, FilterOperator } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface FilterGroup {
  logic: 'AND' | 'OR';
  filters: Filter[];
  order: number;
}

@Component({
  selector: 'app-filter-builder',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    FormsModule
  ],
  templateUrl: 'filter-builder.component.html',
  styleUrl: 'filter-builder.component.scss'
})


export class FilterBuilderComponent implements OnInit {
  @ViewChild('filterConfigDialog') filterConfigDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() filters: Filter[] = [];
  @Output() filtersChange = new EventEmitter<Filter[]>();

  // Filter groups
  filterGroups: FilterGroup[] = [];

  // Available fields
  availableFields: Map<number, any[]> = new Map();

  // Forms
  filterConfigForm: FormGroup;

  // Editing state
  editingFilter: Filter | null = null;
  editingGroupIndex: number = -1;
  editingFilterIndex: number = -1;

  // Dynamic values
  dynamicValues = [
    { type: 'today', label: 'Today' },
    { type: 'yesterday', label: 'Yesterday' },
    { type: 'tomorrow', label: 'Tomorrow' },
    { type: 'current_week_start', label: 'Start of Current Week' },
    { type: 'current_week_end', label: 'End of Current Week' },
    { type: 'current_month_start', label: 'Start of Current Month' },
    { type: 'current_month_end', label: 'End of Current Month' },
    { type: 'current_year_start', label: 'Start of Current Year' },
    { type: 'current_year_end', label: 'End of Current Year' },
    { type: 'current_user_id', label: 'Current User ID' },
    { type: 'current_user_email', label: 'Current User Email' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.filterConfigForm = this.fb.group({
      is_required: [false],
      parameter_name: [''],
      dynamic_value: [''],
      user_attribute: ['']
    });
  }

  ngOnInit(): void {
    // Initialize empty filter groups array
    this.filterGroups = [];

    // Load available fields
    this.loadAvailableFields();

    // Organize existing filters if any
    if (this.filters && this.filters.length > 0) {
      this.organizeFiltersIntoGroups();
    }
  }

  loadAvailableFields(): void {
    if (!this.dataSources || this.dataSources.length === 0) {
      return;
    }

    for (const dataSource of this.dataSources) {
      if (!dataSource.content_type_id) continue;

      const key = dataSource.id || dataSource.content_type_id;

      this.reportService.getContentTypeFields(dataSource.content_type_id).subscribe({
        next: (response) => {
          this.availableFields.set(key, response.fields);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        }
      });
    }
  }

  organizeFiltersIntoGroups(): void {
    const groups = new Map<number, FilterGroup>();

    for (const filter of this.filters) {
      const groupOrder = filter.group_order || 0;

      if (!groups.has(groupOrder)) {
        groups.set(groupOrder, {
          logic: filter.logic_group || 'AND',
          filters: [],
          order: groupOrder
        });
      }

      groups.get(groupOrder)!.filters.push(filter);
    }

    this.filterGroups = Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }

  addFilterGroup(): void {
    try {
      const newGroup: FilterGroup = {
        logic: 'AND',
        filters: [],
        order: this.filterGroups.length
      };

      // Create a new array to avoid mutation issues
      this.filterGroups = [...this.filterGroups, newGroup];

      // Trigger change detection
      this.cdr.detectChanges();

      // Add a filter to the new group after a microtask
      Promise.resolve().then(() => {
        this.addFilter(this.filterGroups.length - 1);
      });
    } catch (error) {
      console.error('Error adding filter group:', error);
      this.snackBar.open('Error adding filter group', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeFilterGroup(groupIndex: number): void {
    const group = this.filterGroups[groupIndex];

    // Remove all filters in the group
    for (const filter of group.filters) {
      if (filter.id) {
        this.reportService.deleteFilter(filter.id).subscribe();
      }
    }

    this.filterGroups.splice(groupIndex, 1);
    this.updateFiltersFromGroups();
  }

  updateGroupLogic(groupIndex: number, logic: 'AND' | 'OR'): void {
    this.filterGroups[groupIndex].logic = logic;

    // Update all filters in the group
    for (const filter of this.filterGroups[groupIndex].filters) {
      filter.logic_group = logic;
      if (filter.id) {
        this.reportService.updateFilter(filter.id, { logic_group: logic }).subscribe();
      }
    }

    this.updateFiltersFromGroups();
  }

  addFilter(groupIndex: number): void {
    try {
      // Validate group exists
      if (!this.filterGroups || !this.filterGroups[groupIndex]) {
        console.error('Filter group not found at index:', groupIndex);
        return;
      }

      // Validate data sources exist
      if (!this.dataSources || this.dataSources.length === 0) {
        this.snackBar.open('Please add data sources first', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      const group = this.filterGroups[groupIndex];
      const dataSourceId = this.dataSources[0]?.id || this.dataSources[0]?.content_type_id || 0;

      // Create a simple filter object without backend call for now
      const newFilter: Filter = {
        report: this.report?.id || 0,
        data_source: dataSourceId,
        field_path: '',
        field_name: '',
        operator: 'eq' as FilterOperator,
        value: null,
        value_type: 'static',
        logic_group: group.logic,
        group_order: group.order,
        is_active: true,
        is_required: false
      };

      // Initialize filters array if needed
      if (!group.filters) {
        group.filters = [];
      }

      // Add filter to group
      group.filters = [...group.filters, newFilter];

      // Update the filters array
      this.filters = this.filterGroups.flatMap(g => g.filters || []);
      this.filtersChange.emit([...this.filters]);

      // Trigger change detection
      this.cdr.markForCheck();

      this.snackBar.open('Filter added', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });

    } catch (error) {
      console.error('Error in addFilter:', error);
      this.snackBar.open('Error adding filter', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeFilter(groupIndex: number, filterIndex: number): void {
    const filter = this.filterGroups[groupIndex].filters[filterIndex];

    if (filter.id) {
      this.reportService.deleteFilter(filter.id).subscribe({
        next: () => {
          this.filterGroups[groupIndex].filters.splice(filterIndex, 1);

          // Remove group if empty
          if (this.filterGroups[groupIndex].filters.length === 0) {
            this.filterGroups.splice(groupIndex, 1);
          }

          this.updateFiltersFromGroups();

          this.snackBar.open('Filter removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        }
      });
    } else {
      // If filter doesn't have ID, just remove from local array
      this.filterGroups[groupIndex].filters.splice(filterIndex, 1);

      // Remove group if empty
      if (this.filterGroups[groupIndex].filters.length === 0) {
        this.filterGroups.splice(groupIndex, 1);
      }

      this.updateFiltersFromGroups();
    }
  }

  onFieldChange(filter: Filter, groupIndex: number, filterIndex: number): void {
    // Update data source based on field
    const field = this.findFieldByPath(filter.field_path);
    if (field) {
      const dataSource = this.dataSources.find(ds =>
        this.availableFields.get(ds.id!)?.includes(field)
      );

      if (dataSource) {
        filter.data_source = dataSource.id!;
        filter.field_name = field.name;

        // Reset operator and value
        filter.operator = 'eq' as FilterOperator;
        filter.value = null;

        this.updateFilter(filter, groupIndex, filterIndex);
      }
    }
  }

  onOperatorChange(filter: Filter, groupIndex: number, filterIndex: number): void {
    // Reset value based on operator
    switch (filter.operator) {
      case 'isnull':
      case 'isnotnull':
        filter.value = null;
        break;
      case 'between':
        filter.value = { min: null, max: null };
        break;
      case 'date_range':
        filter.value = { start: null, end: null };
        break;
      case 'in':
      case 'not_in':
        filter.value = [];
        break;
      default:
        if (typeof filter.value === 'object') {
          filter.value = null;
        }
    }

    this.updateFilter(filter, groupIndex, filterIndex);
  }

  onValueTypeChange(filter: Filter, groupIndex: number, filterIndex: number): void {
    // Reset value when changing type
    if (filter.value_type === 'parameter') {
      filter.value = '';
    } else if (filter.value_type === 'dynamic') {
      filter.value = '';
    }

    this.updateFilter(filter, groupIndex, filterIndex);
  }

  updateFilter(filter: Filter, groupIndex: number, filterIndex: number): void {
    if (!filter.id) {
      // If filter doesn't have ID, just update local array
      this.updateFiltersFromGroups();
      return;
    }

    const updates: Partial<Filter> = {
      data_source: filter.data_source,
      field_path: filter.field_path,
      field_name: filter.field_name,
      operator: filter.operator,
      value: filter.value,
      value_type: filter.value_type,
      is_active: filter.is_active
    };

    this.reportService.updateFilter(filter.id, updates).subscribe({
      next: (updated) => {
        this.filterGroups[groupIndex].filters[filterIndex] = updated;
        this.updateFiltersFromGroups();
      }
    });
  }

  configureFilter(filter: Filter, groupIndex: number, filterIndex: number): void {
    this.editingFilter = filter;
    this.editingGroupIndex = groupIndex;
    this.editingFilterIndex = filterIndex;

    this.filterConfigForm.patchValue({
      is_required: filter.is_required,
      parameter_name: filter.value_type === 'parameter' ? filter.value : '',
      dynamic_value: filter.value_type === 'dynamic' ? filter.value : '',
      user_attribute: filter.value_type === 'user_attribute' ? filter.value : ''
    });

    this.dialog.open(this.filterConfigDialog, {
      width: '500px',
      maxWidth: '90vw'
    });
  }

  saveFilterConfig(): void {
    if (!this.editingFilter?.id) return;

    const config = this.filterConfigForm.value;
    const updates: Partial<Filter> = {
      is_required: config.is_required
    };

    // Update value based on type
    if (this.editingFilter.value_type === 'parameter') {
      updates.value = config.parameter_name;
    } else if (this.editingFilter.value_type === 'dynamic') {
      updates.value = config.dynamic_value;
    } else if (this.editingFilter.value_type === 'user_attribute') {
      updates.value = config.user_attribute;
    }

    this.reportService.updateFilter(this.editingFilter.id, updates).subscribe({
      next: (updated) => {
        this.filterGroups[this.editingGroupIndex].filters[this.editingFilterIndex] = updated;
        this.updateFiltersFromGroups();

        this.dialog.closeAll();
        this.snackBar.open('Filter configured', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  clearAllFilters(): void {
    if (confirm('Remove all filters?')) {
      const deletions = this.filters
        .filter(f => f.id)
        .map(f => this.reportService.deleteFilter(f.id!));

      Promise.all(deletions.map(obs => obs.toPromise())).then(() => {
        this.filterGroups = [];
        this.filters = [];
        this.filtersChange.emit(this.filters);

        this.snackBar.open('All filters removed', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      });
    }
  }

  updateFiltersFromGroups(): void {
    try {
      // Safely flatten filters from groups
      const allFilters: Filter[] = [];

      for (const group of this.filterGroups) {
        if (group && group.filters && Array.isArray(group.filters)) {
          allFilters.push(...group.filters);
        }
      }

      this.filters = [...allFilters]; // Create new array reference
      this.filtersChange.emit(this.filters);

      // Manually trigger change detection
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  }

  // Helper methods
  getFieldsForDataSource(dataSource: DataSource): any[] {
    const key = dataSource.id || dataSource.content_type_id;
    return this.availableFields.get(key!) || [];
  }

  findFieldByPath(path: string): any {
    for (const fields of this.availableFields.values()) {
      const field = fields.find(f => f.path === path);
      if (field) return field;
    }
    return null;
  }

  getOperatorsForField(filter: Filter): { value: string; label: string }[] {
    const field = this.findFieldByPath(filter.field_path);
    if (!field) return [{ value: 'eq', label: 'Equals' }];

    return this.reportService.getOperatorOptions(field.type);
  }

  getValueInputType(filter: Filter): string {
    if (filter.operator === 'isnull' || filter.operator === 'isnotnull') {
      return 'none';
    }

    if (filter.operator === 'between') {
      return 'between';
    }

    if (filter.operator === 'date_range') {
      return 'daterange';
    }

    if (filter.operator === 'in' || filter.operator === 'not_in') {
      return 'list';
    }

    const field = this.findFieldByPath(filter.field_path);
    if (!field) return 'text';

    const fieldType = field.type.toLowerCase();

    if (fieldType.includes('boolean')) return 'boolean';
    if (fieldType.includes('date')) return 'date';
    if (fieldType.includes('integer') || fieldType.includes('float') || fieldType.includes('decimal')) return 'number';

    return 'text';
  }

  getValuePlaceholder(filter: Filter): string {
    if (filter.value_type === 'parameter') {
      return 'Select parameter...';
    }

    if (filter.value_type === 'dynamic') {
      return 'Select dynamic value...';
    }

    if (filter.operator === 'contains' || filter.operator === 'icontains') {
      return 'Contains...';
    }

    if (filter.operator === 'startswith') {
      return 'Starts with...';
    }

    if (filter.operator === 'endswith') {
      return 'Ends with...';
    }

    return 'Enter value...';
  }

  getListValues(filter: Filter): string[] {
    if (Array.isArray(filter.value)) {
      return filter.value;
    }
    return [];
  }

  addListValue(filter: Filter, event: any, groupIndex: number, filterIndex: number): void {
    const value = (event.value || '').trim();
    if (value) {
      if (!Array.isArray(filter.value)) {
        filter.value = [];
      }
      filter.value.push(value);
      this.updateFilter(filter, groupIndex, filterIndex);
    }
    event.chipInput?.clear();
  }

  removeListValue(filter: Filter, value: string, groupIndex: number, filterIndex: number): void {
    if (Array.isArray(filter.value)) {
      const index = filter.value.indexOf(value);
      if (index >= 0) {
        filter.value.splice(index, 1);
        this.updateFilter(filter, groupIndex, filterIndex);
      }
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

  getAvailableParameters(): any[] {
    // This would be populated from the parameters component
    return [];
  }

  getInterpolationString(type: string): string {
    return `{{${type}}}`;
  }
}
