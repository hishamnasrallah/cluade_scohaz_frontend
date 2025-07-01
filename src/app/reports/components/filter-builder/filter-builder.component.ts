import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
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
import { Report, DataSource, Field, Filter, FilterOperator } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import { Observable } from 'rxjs';
import {CommonModule} from '@angular/common'; // Import Observable

interface FilterGroup {
  logic: 'AND' | 'OR';
  filters: Filter[];
  order: number;
}

@Component({
  selector: 'app-filter-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
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
export class FilterBuilderComponent implements OnInit, OnChanges {
  @ViewChild('filterConfigDialog') filterConfigDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() filters: Filter[] = []; // Ensure this is correctly typed as an Input
  @Output() filtersChange = new EventEmitter<Filter[]>();

  // Filter groups
  filterGroups: FilterGroup[] = [];

  // Add flag to prevent circular updates
  private isInternalUpdate = false;

  private filterIdCounter = 0;
  private filterIdMap = new WeakMap<Filter, string>();

  // Available fields
  availableFields: Map<number, any[]> = new Map();
  filteredFields: Map<number, any[]> = new Map(); // Declared as class property

  // Forms
  fieldForm!: FormGroup;
  formattingForm!: FormGroup;
  filterConfigForm!: FormGroup; // Declared as class property

  // UI state
  searchTerm: string = ''; // Declared as class property
  editingFieldIndex: number = -1;

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
// Operator options - defined once as class properties
  private readonly baseOperators = [
    { value: 'eq', label: 'Equals' },
    { value: 'ne', label: 'Not Equals' },
    { value: 'isnull', label: 'Is Null' },
    { value: 'isnotnull', label: 'Is Not Null' }
  ];

  private readonly numericOperators = [
    { value: 'gt', label: 'Greater Than' },
    { value: 'gte', label: 'Greater Than or Equal' },
    { value: 'lt', label: 'Less Than' },
    { value: 'lte', label: 'Less Than or Equal' },
    { value: 'between', label: 'Between' }
  ];

  private readonly textOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'icontains', label: 'Contains (Case Insensitive)' },
    { value: 'startswith', label: 'Starts With' },
    { value: 'endswith', label: 'Ends With' },
    { value: 'regex', label: 'Regex' }
  ];

  private readonly listOperators = [
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' }
  ];

  private readonly dateOperators = [
    { value: 'date_range', label: 'Date Range' },
    ...this.numericOperators
  ];

  // Pre-computed operator sets for each field type
  private readonly operatorsByFieldType: Record<string, Array<{ value: string; label: string }>> = {
    'integerfield': [...this.baseOperators, ...this.numericOperators],
    'floatfield': [...this.baseOperators, ...this.numericOperators],
    'decimalfield': [...this.baseOperators, ...this.numericOperators],
    'charfield': [...this.baseOperators, ...this.textOperators, ...this.listOperators],
    'textfield': [...this.baseOperators, ...this.textOperators, ...this.listOperators],
    'emailfield': [...this.baseOperators, ...this.textOperators, ...this.listOperators],
    'urlfield': [...this.baseOperators, ...this.textOperators, ...this.listOperators],
    'datefield': [...this.baseOperators, ...this.dateOperators],
    'datetimefield': [...this.baseOperators, ...this.dateOperators],
    'booleanfield': this.baseOperators.filter(op => ['eq', 'ne'].includes(op.value)),
    'foreignkey': [...this.baseOperators, ...this.listOperators],
    'manytomanyfield': [...this.baseOperators, ...this.listOperators]
  };

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.formattingForm = this.fb.group({
      type: [''],
      prefix: ['$'],
      suffix: [''],
      decimals: [2],
      thousands_separator: [true],
      date_format: ['MM/DD/YYYY'],
      multiply_by_100: [false]
    });

    this.fieldForm = this.fb.group({
      display_name: ['', Validators.required],
      aggregation: [''],
      width: [null],
      order: [0],
      is_visible: [true],
      formatting: this.formattingForm
    });

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

    // Organize existing filters if any (initial load)
    if (this.filters && this.filters.length > 0) {
      this.organizeFiltersIntoGroups();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reorganize filters into groups when the 'filters' input changes
    if (changes['filters'] && !changes['filters'].firstChange && !this.isInternalUpdate) {
      const currentFilters = changes['filters'].currentValue;
      const previousFilters = changes['filters'].previousValue;

      // Check if the change is substantial (not just a reference change)
      if (JSON.stringify(currentFilters) !== JSON.stringify(previousFilters)) {
        this.organizeFiltersIntoGroups();
      }
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
          this.filterFields();
        },
        error: (err) => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        }
      });
    }
  }

  filterFields(): void {
    const term = this.searchTerm.toLowerCase();

    if (!term) {
      this.filteredFields = new Map(this.availableFields);
    } else {
      this.filteredFields.clear();

      for (const [dsId, fields] of this.availableFields.entries()) {
        const filtered = fields.filter(field =>
          field.verbose_name.toLowerCase().includes(term) ||
          field.path.toLowerCase().includes(term) ||
          field.type.toLowerCase().includes(term)
        );

        if (filtered.length > 0) {
          this.filteredFields.set(dsId, filtered);
        }
      }
    }
  }

  organizeFiltersIntoGroups(): void {
    const groupsMap = new Map<number, FilterGroup>();

    for (const filter of this.filters) {
      const groupOrder = filter.group_order || 0;
      if (!groupsMap.has(groupOrder)) {
        groupsMap.set(groupOrder, {
          logic: filter.logic_group || 'AND',
          filters: [],
          order: groupOrder
        });
      }
      groupsMap.get(groupOrder)!.filters.push(filter);
    }

    // Ensure new array reference for filterGroups
    this.filterGroups = Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
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
    const groupToRemove = this.filterGroups[groupIndex];

    // Collect all delete observables
    const deleteObservables: Observable<any>[] = [];
    for (const filter of groupToRemove.filters) {
      if (filter.id) {
        deleteObservables.push(this.reportService.deleteFilter(filter.id));
      }
    }

    // Execute all deletes and then update the UI
    if (deleteObservables.length > 0) {
      Promise.all(deleteObservables.map(obs => obs!.toPromise())).then(() => {
        this.filterGroups = this.filterGroups.filter((_, i) => i !== groupIndex);
        this.updateFiltersFromGroups();
        this.snackBar.open('Filter group removed', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      }).catch(err => {
        console.error('Error deleting filters in group:', err);
        this.snackBar.open('Error removing filter group', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
    } else {
      // No filters with IDs to delete, just remove from local array
      this.filterGroups = this.filterGroups.filter((_, i) => i !== groupIndex);
      this.updateFiltersFromGroups();
      this.snackBar.open('Filter group removed', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    }
  }

  updateGroupLogic(groupIndex: number, logic: 'AND' | 'OR'): void {
    const groupToUpdate = this.filterGroups[groupIndex];

    // Create new filter objects for the group's filters
    const updatedFiltersInGroup = groupToUpdate.filters.map(filter => {
      const updatedFilter = { ...filter, logic_group: logic };
      // If filter has an ID, send update to backend
      if (updatedFilter.id) {
        this.reportService.updateFilter(updatedFilter.id, { logic_group: logic }).subscribe({
          error: (err) => console.error('Error updating filter logic_group on backend:', err)
        });
      }
      return updatedFilter;
    });

    // Create a new group object with the updated logic and filters
    const updatedGroup = { ...groupToUpdate, logic: logic, filters: updatedFiltersInGroup };

    // Create a new filterGroups array with the updated group
    this.filterGroups = this.filterGroups.map((group, i) => {
      if (i === groupIndex) {
        return updatedGroup;
      }
      return group;
    });

    this.updateFiltersFromGroups(); // Propagate changes
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

      // Set flag before updating
      this.isInternalUpdate = true;

      // Update the filters array
      this.filters = this.filterGroups.flatMap(g => g.filters || []);
      this.filtersChange.emit([...this.filters]);

      // Reset flag
      Promise.resolve().then(() => {
        this.isInternalUpdate = false;
      });

      // Reset flag after a microtask to ensure change detection completes
      Promise.resolve().then(() => {
        this.isInternalUpdate = false;
      });

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
    const filterToRemove = this.filterGroups[groupIndex].filters[filterIndex];

    const performRemoval = () => {
      // Create a new filters array for the group
      const updatedGroupFilters = this.filterGroups[groupIndex].filters.filter((_, i) => i !== filterIndex);

      if (updatedGroupFilters.length === 0) {
        // If group becomes empty, remove the group entirely
        this.filterGroups = this.filterGroups.filter((_, i) => i !== groupIndex);
      } else {
        // Otherwise, update the specific group with its new filters array
        this.filterGroups = this.filterGroups.map((group, i) => {
          if (i === groupIndex) {
            return { ...group, filters: updatedGroupFilters };
          }
          return group;
        });
      }
      this.isInternalUpdate = true;
      this.updateFiltersFromGroups();
      Promise.resolve().then(() => {
        this.isInternalUpdate = false;
      });
    };

    if (filterToRemove.id) {
      this.reportService.deleteFilter(filterToRemove.id).subscribe({
        next: () => {
          performRemoval();
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
    } else {
      // If filter doesn't have ID, just remove from local array
      performRemoval();
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
    // Update the filter in the group's array
    // Create a new filter object to ensure immutability
    const updatedFilter = { ...filter };
    this.filterGroups[groupIndex].filters[filterIndex] = updatedFilter;

    if (!filter.id) {
      // If filter doesn't have ID, just update local array
      this.isInternalUpdate = true;
      this.updateFiltersFromGroups();
      Promise.resolve().then(() => {
        this.isInternalUpdate = false;
      });
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

    const fieldTypeLower = field.type.toLowerCase();
    return this.operatorsByFieldType[fieldTypeLower] || this.baseOperators;
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

  // TrackBy functions for performance optimization
  trackByGroup(index: number, group: FilterGroup): number {
    return group.order;
  }

  trackByFilter(index: number, filter: Filter): string {
    // Use id if available
    if (filter.id) {
      return `filter-${filter.id}`;
    }

    // For new filters, use a stable ID from WeakMap
    let stableId = this.filterIdMap.get(filter);
    if (!stableId) {
      stableId = `temp-${++this.filterIdCounter}`;
      this.filterIdMap.set(filter, stableId);
    }

    return stableId;
  }

  trackByDataSource(index: number, dataSource: DataSource): number | string {
    return dataSource.id || dataSource.content_type_id || index;
  }
}
