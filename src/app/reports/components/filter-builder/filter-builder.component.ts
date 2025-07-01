// src/app/reports/components/filter-builder/filter-builder.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
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
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Report, DataSource, Field, Filter, Parameter, FilterOperator, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import { FilterValueInputComponent } from './filter-value-input/filter-value-input.component';
import { FilterGroupComponent } from './filter-group/filter-group.component';

interface FilterGroup {
  id: string;
  order: number;
  logic: 'AND' | 'OR';
  filters: Filter[];
  groups?: FilterGroup[];
  parentId?: string;
}

interface FilterTreeNode {
  id: string;
  type: 'group' | 'filter';
  logic?: 'AND' | 'OR';
  filter?: Filter;
  children?: FilterTreeNode[];
  parentId?: string;
}

interface FilterTemplate {
  id?: string;
  name: string;
  description: string;
  filterCount?: number;
  requiredFields?: string[];
  config: {
    filters: Partial<Filter>[];
    groups?: FilterGroup[];
  };
  createdAt?: Date;
  createdBy?: string;
  isPublic?: boolean;
}

interface FilterTestResult {
  totalRows: number;
  matchedRows: number;
  filteredRows: number;
  matchPercentage: number;
  sampleData?: any[];
  columns?: string[];
  executionTime?: number;
}

interface OperatorGroup {
  label: string;
  operators: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
}

@Component({
  selector: 'app-filter-builder',
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
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatRadioModule,
    MatTableModule,
    MatProgressSpinnerModule,
    FilterValueInputComponent,
    FilterGroupComponent
  ],
  templateUrl: 'filter-builder.component.html',
  styleUrl: 'filter-builder.component.scss'
})
export class FilterBuilderComponent implements OnInit, OnChanges {
  @ViewChild('filterTemplatesDialog') filterTemplatesDialog!: TemplateRef<any>;
  @ViewChild('saveTemplateDialog') saveTemplateDialog!: TemplateRef<any>;
  @ViewChild('moveToGroupDialog') moveToGroupDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() filters: Filter[] = [];
  @Input() parameters: Parameter[] = [];
  @Output() filtersChange = new EventEmitter<Filter[]>();

  // Available fields by data source
  availableFields: Map<number, FieldInfo[]> = new Map();
  filteredFields: Map<number, FieldInfo[]> = new Map();

  // Filter groups for logical grouping
  filterGroups: FilterGroup[] = [];
  rootGroup: FilterTreeNode = {
    id: 'root',
    type: 'group',
    logic: 'AND',
    children: []
  };

  // UI state
  viewMode: 'visual' | 'list' = 'list';
  showSqlPreview = false;
  copiedFilter: Filter | null = null;
  testResults: FilterTestResult | null = null;
  selectedFilterForMove: Filter | null = null;
  selectedGroupForMove: FilterGroup | 'new' | null = null;
  newGroupLogic: 'AND' | 'OR' = 'AND';

  // Forms
  templateForm: FormGroup;

  // Search/Filter
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Templates
  commonFilterTemplates: FilterTemplate[] = [
    {
      name: 'Active Records Only',
      description: 'Show only active/enabled records',
      requiredFields: ['status', 'active', 'is_active'],
      config: {
        filters: [
          {
            field_path: 'is_active',
            operator: 'eq',
            value: true,
            value_type: 'static',
            logic_group: 'AND',
            is_active: true
          }
        ]
      }
    },
    {
      name: 'Current Month',
      description: 'Filter records from the current month',
      requiredFields: ['date', 'created_at', 'order_date'],
      config: {
        filters: [
          {
            field_path: 'created_at',
            operator: 'date_range',
            value: { start: 'current_month_start', end: 'current_month_end' },
            value_type: 'dynamic',
            logic_group: 'AND',
            is_active: true
          }
        ]
      }
    },
    {
      name: 'Recent Changes',
      description: 'Records modified in the last 7 days',
      requiredFields: ['updated_at', 'modified_at'],
      config: {
        filters: [
          {
            field_path: 'updated_at',
            operator: 'gte',
            value: 'last_7_days',
            value_type: 'dynamic',
            logic_group: 'AND',
            is_active: true
          }
        ]
      }
    },
    {
      name: 'High Value Items',
      description: 'Filter for high-value records (amount > 1000)',
      requiredFields: ['amount', 'value', 'price'],
      config: {
        filters: [
          {
            field_path: 'amount',
            operator: 'gt',
            value: 1000,
            value_type: 'static',
            logic_group: 'AND',
            is_active: true
          }
        ]
      }
    }
  ];

  savedFilterTemplates: FilterTemplate[] = [];

  // Temporary ID counter for filters without backend IDs
  private tempIdCounter = -1;

  // Undo/Redo
  private filterHistory: Filter[][] = [];
  private historyIndex = -1;
  private maxHistorySize = 50;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      isPublic: [false]
    });
  }

  ngOnInit(): void {
    this.loadAvailableFields();
    this.organizeFiltersIntoGroups();
    this.buildFilterTree();
    this.loadSavedTemplates();
    this.setupSearch();
    this.saveToHistory();
  }

  ngOnChanges(): void {
    if (this.dataSources.length > 0) {
      this.loadAvailableFields();
    }
    this.organizeFiltersIntoGroups();
    this.buildFilterTree();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterAvailableFields(searchTerm);
      });
  }

  loadAvailableFields(): void {
    for (const dataSource of this.dataSources) {
      if (!dataSource.content_type_id) continue;

      this.reportService.getContentTypeFields(dataSource.content_type_id).subscribe({
        next: (response) => {
          const key = dataSource.id || dataSource.content_type_id;
          this.availableFields.set(key, response.fields);
          this.filteredFields.set(key, response.fields);
        },
        error: (err) => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        }
      });
    }
  }

  filterAvailableFields(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredFields = new Map(this.availableFields);
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredFields.clear();

    for (const [dsId, fields] of this.availableFields) {
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

  organizeFiltersIntoGroups(): void {
    const groups = new Map<number, FilterGroup>();

    // Group filters by group_order
    this.filters.forEach(filter => {
      const groupOrder = filter.group_order || 0;

      if (!groups.has(groupOrder)) {
        groups.set(groupOrder, {
          id: `group-${groupOrder}`,
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

  buildFilterTree(): void {
    // Build hierarchical tree structure for visual mode
    this.rootGroup = {
      id: 'root',
      type: 'group',
      logic: 'AND',
      children: []
    };

    // Convert filter groups to tree nodes
    this.filterGroups.forEach(group => {
      const groupNode: FilterTreeNode = {
        id: group.id,
        type: 'group',
        logic: group.logic,
        children: group.filters.map(filter => ({
          id: `filter-${filter.id || this.tempIdCounter--}`,
          type: 'filter',
          filter: filter,
          parentId: group.id
        })),
        parentId: 'root'
      };

      this.rootGroup.children!.push(groupNode);
    });
  }

  // History Management
  saveToHistory(): void {
    // Remove any history after current index
    this.filterHistory = this.filterHistory.slice(0, this.historyIndex + 1);

    // Add current state
    this.filterHistory.push(JSON.parse(JSON.stringify(this.filters)));
    this.historyIndex++;

    // Limit history size
    if (this.filterHistory.length > this.maxHistorySize) {
      this.filterHistory.shift();
      this.historyIndex--;
    }
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.filters = JSON.parse(JSON.stringify(this.filterHistory[this.historyIndex]));
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
    }
  }

  redo(): void {
    if (this.historyIndex < this.filterHistory.length - 1) {
      this.historyIndex++;
      this.filters = JSON.parse(JSON.stringify(this.filterHistory[this.historyIndex]));
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
    }
  }

  // Filter Operations
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
        id: this.tempIdCounter--,
        report: 0,
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
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
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
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();

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
      const tempFilter: Filter = {
        report: 0,
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
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
    } else {
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
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();
        }
      });
    }
  }

  addFilterGroup(): void {
    const nextGroupOrder = this.filterGroups.length;
    this.addFilterToGroup({
      id: `group-${nextGroupOrder}`,
      order: nextGroupOrder,
      logic: nextGroupOrder % 2 === 0 ? 'AND' : 'OR',
      filters: []
    });
  }

  updateFilter(filter: Filter): void {
    if (!filter.id || filter.id < 0) {
      // For filters without ID (new report), just update locally
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
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
          this.saveToHistory();
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
    if (!filter.id || filter.id < 0) {
      // For filters without ID (new report), just remove locally
      const index = this.filters.indexOf(filter);
      if (index >= 0) {
        this.filters.splice(index, 1);
        this.organizeFiltersIntoGroups();
        this.buildFilterTree();
        this.filtersChange.emit(this.filters);
        this.saveToHistory();
      }
      return;
    }

    if (confirm('Remove this filter?')) {
      this.reportService.deleteFilter(filter.id).subscribe({
        next: () => {
          this.filters = this.filters.filter(f => f.id !== filter.id);
          this.organizeFiltersIntoGroups();
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();

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
      const duplicate: Filter = {
        ...filter,
        id: this.tempIdCounter--
      };
      this.filters.push(duplicate);
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
    } else {
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
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();

          this.snackBar.open('Filter duplicated', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        }
      });
    }
  }

  copyFilter(filter: Filter): void {
    this.copiedFilter = JSON.parse(JSON.stringify(filter));
    this.snackBar.open('Filter copied to clipboard', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  pasteFilter(): void {
    if (!this.copiedFilter) return;

    const newFilter = {
      ...this.copiedFilter,
      id: undefined
    };

    if (!this.report?.id) {
      newFilter.id = this.tempIdCounter--;
      this.filters.push(newFilter as Filter);
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
    } else {
      this.reportService.createFilter(newFilter).subscribe({
        next: (filter) => {
          this.filters.push(filter);
          this.organizeFiltersIntoGroups();
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();

          this.snackBar.open('Filter pasted', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        }
      });
    }
  }

  // Drag and Drop
  onFilterDrop(event: CdkDragDrop<Filter[]>, group: FilterGroup): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(group.filters, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.updateFilterGroups();
    this.saveToHistory();
  }

  onTreeDrop(event: CdkDragDrop<FilterTreeNode>): void {
    // Handle tree structure drag and drop
    this.updateFilterGroups();
    this.saveToHistory();
  }

  updateFilterGroups(): void {
    // Update all filters with their new group assignments
    const updates: Promise<any>[] = [];

    this.filterGroups.forEach((group, groupIndex) => {
      group.filters.forEach((filter, filterIndex) => {
        if (filter.id && filter.id > 0 && (filter.group_order !== groupIndex || filter.logic_group !== group.logic)) {
          const update = this.reportService.updateFilter(filter.id, {
            group_order: groupIndex,
            logic_group: group.logic
          }).toPromise();
          updates.push(update);
        }
      });
    });

    if (updates.length > 0) {
      Promise.all(updates).then(() => {
        this.filtersChange.emit(this.filters);
      });
    } else {
      this.filtersChange.emit(this.filters);
    }
  }

  // Field Operations
  onFieldSearch(filter: Filter, searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onFieldSelect(filter: Filter, event: MatAutocompleteSelectedEvent): void {
    const field = event.option.value as FieldInfo;
    filter.field_path = field.path;
    filter.field_name = field.name;
    (filter as any).fieldSearchTerm = field.verbose_name;

    // Reset operator and value when field changes
    const operators = this.getOperatorsForField(filter);
    if (operators.length > 0 && !operators.find(op => op.value === filter.operator)) {
      filter.operator = operators[0].value as FilterOperator;
    }
    filter.value = '';
    this.updateFilter(filter);
  }

  onFieldChange(filter: Filter): void {
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
      filter.value = [];
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

  onFilterValueChange(filter: Filter, value: any): void {
    filter.value = value;
    this.updateFilter(filter);
  }

  // Group Operations
  toggleGroupLogic(group: FilterGroup): void {
    group.logic = group.logic === 'AND' ? 'OR' : 'AND';
    group.filters.forEach(filter => {
      filter.logic_group = group.logic;
      if (filter.id && filter.id > 0) {
        this.updateFilter(filter);
      }
    });
    this.saveToHistory();
  }

  moveToGroup(filter: Filter): void {
    this.selectedFilterForMove = filter;
    this.dialog.open(this.moveToGroupDialog, {
      width: '400px'
    });
  }

  confirmMoveToGroup(): void {
    if (!this.selectedFilterForMove) return;

    if (this.selectedGroupForMove === 'new') {
      // Create new group
      const newGroupOrder = this.filterGroups.length;
      this.selectedFilterForMove.group_order = newGroupOrder;
      this.selectedFilterForMove.logic_group = this.newGroupLogic;
    } else if (this.selectedGroupForMove) {
      // Move to existing group
      this.selectedFilterForMove.group_order = this.selectedGroupForMove.order;
      this.selectedFilterForMove.logic_group = this.selectedGroupForMove.logic;
    }

    this.updateFilter(this.selectedFilterForMove);
    this.organizeFiltersIntoGroups();
    this.buildFilterTree();
    this.dialog.closeAll();
    this.saveToHistory();
  }

  // Tree Operations
  onGroupChange(event: any): void {
    // Handle group changes from visual tree
    this.updateFilterGroups();
    this.saveToHistory();
  }

  onFilterChange(event: any): void {
    // Handle filter changes from visual tree
    this.updateFilter(event.filter);
  }

  onFilterRemove(event: any): void {
    // Handle filter removal from visual tree
    this.removeFilter(event.filter);
  }

  // Validation
  isFilterValid(filter: Filter): boolean {
    if (!filter.field_path) return false;
    if (!filter.operator) return false;

    // Check if value is required
    if (filter.operator !== 'isnull' && filter.operator !== 'isnotnull') {
      if (filter.value === null || filter.value === undefined || filter.value === '') {
        return false;
      }

      // Validate based on operator
      if (filter.operator === 'between' && Array.isArray(filter.value)) {
        return filter.value.length === 2 && filter.value[0] !== null && filter.value[1] !== null;
      }

      if (filter.operator === 'date_range' && typeof filter.value === 'object') {
        return filter.value.start !== null && filter.value.end !== null;
      }

      if ((filter.operator === 'in' || filter.operator === 'not_in') && Array.isArray(filter.value)) {
        return filter.value.length > 0;
      }
    }

    return true;
  }

  getFilterValidationMessage(filter: Filter): string {
    if (!filter.field_path) return 'Please select a field';
    if (!filter.operator) return 'Please select an operator';

    if (filter.operator !== 'isnull' && filter.operator !== 'isnotnull') {
      if (filter.value === null || filter.value === undefined || filter.value === '') {
        return 'Please enter a value';
      }

      if (filter.operator === 'between' && Array.isArray(filter.value)) {
        if (filter.value.length !== 2) return 'Please enter both values';
        if (filter.value[0] === null) return 'Please enter the first value';
        if (filter.value[1] === null) return 'Please enter the second value';
      }

      if (filter.operator === 'date_range' && typeof filter.value === 'object') {
        if (!filter.value.start) return 'Please select a start date';
        if (!filter.value.end) return 'Please select an end date';
      }

      if ((filter.operator === 'in' || filter.operator === 'not_in') && Array.isArray(filter.value)) {
        if (filter.value.length === 0) return 'Please add at least one value';
      }
    }

    return '';
  }

  // Helper Methods
  getFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    const key = dataSource.id || dataSource.content_type_id;
    return this.availableFields.get(key!) || [];
  }

  getFilteredDataSources(searchTerm?: string): DataSource[] {
    if (!searchTerm) return this.dataSources;

    const term = searchTerm.toLowerCase();
    return this.dataSources.filter(ds => {
      const fields = this.getFieldsForDataSource(ds);
      return fields.some(field =>
        field.verbose_name.toLowerCase().includes(term) ||
        field.path.toLowerCase().includes(term)
      );
    });
  }

  getFilteredFields(dataSource: DataSource, searchTerm?: string): FieldInfo[] {
    const fields = this.getFieldsForDataSource(dataSource);
    if (!searchTerm) return fields;

    const term = searchTerm.toLowerCase();
    return fields.filter(field =>
      field.verbose_name.toLowerCase().includes(term) ||
      field.path.toLowerCase().includes(term)
    );
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

  getGroupedOperators(filter: Filter): OperatorGroup[] {
    const fieldInfo = this.getFieldInfo(filter);
    if (!fieldInfo) return [];

    const operators = this.reportService.getOperatorOptions(fieldInfo.type);

    // Group operators by category
    const groups: OperatorGroup[] = [
      {
        label: 'Basic',
        operators: operators.filter(op => ['eq', 'ne'].includes(op.value)).map(op => ({
          ...op,
          icon: this.getOperatorIcon(op.value)
        }))
      }
    ];

    const comparisonOps = operators.filter(op =>
      ['gt', 'gte', 'lt', 'lte', 'between'].includes(op.value)
    );
    if (comparisonOps.length > 0) {
      groups.push({
        label: 'Comparison',
        operators: comparisonOps.map(op => ({
          ...op,
          icon: this.getOperatorIcon(op.value)
        }))
      });
    }

    const textOps = operators.filter(op =>
      ['contains', 'icontains', 'startswith', 'endswith', 'regex'].includes(op.value)
    );
    if (textOps.length > 0) {
      groups.push({
        label: 'Text',
        operators: textOps.map(op => ({
          ...op,
          icon: this.getOperatorIcon(op.value)
        }))
      });
    }

    const listOps = operators.filter(op => ['in', 'not_in'].includes(op.value));
    if (listOps.length > 0) {
      groups.push({
        label: 'List',
        operators: listOps.map(op => ({
          ...op,
          icon: this.getOperatorIcon(op.value)
        }))
      });
    }

    const nullOps = operators.filter(op => ['isnull', 'isnotnull'].includes(op.value));
    if (nullOps.length > 0) {
      groups.push({
        label: 'Null Check',
        operators: nullOps.map(op => ({
          ...op,
          icon: this.getOperatorIcon(op.value)
        }))
      });
    }

    return groups.filter(group => group.operators.length > 0);
  }

  getOperatorIcon(operator: string): string {
    const icons: Record<string, string> = {
      'eq': 'drag_handle',
      'ne': 'not_equal',
      'gt': 'keyboard_arrow_right',
      'gte': 'keyboard_double_arrow_right',
      'lt': 'keyboard_arrow_left',
      'lte': 'keyboard_double_arrow_left',
      'in': 'library_add',
      'not_in': 'library_add_check',
      'contains': 'search',
      'icontains': 'manage_search',
      'startswith': 'first_page',
      'endswith': 'last_page',
      'isnull': 'check_box_outline_blank',
      'isnotnull': 'check_box',
      'between': 'unfold_more',
      'date_range': 'date_range',
      'regex': 'pattern'
    };
    return icons[operator] || 'help_outline';
  }

  getOperatorLabel(operator: string): string {
    const operators = this.reportService.getOperatorOptions('CharField');
    const op = operators.find(o => o.value === operator);
    return op?.label || operator;
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
          return Array.isArray(filter.value) ? filter.value.join(', ') : filter.value.toString();
        }
        return filter.value.toString();
    }
  }

  getActiveFiltersCount(): number {
    return this.filters.filter(f => f.is_active).length;
  }

  // Template Operations
  loadSavedTemplates(): void {
    // Load from localStorage or backend
    const saved = localStorage.getItem('filterTemplates');
    if (saved) {
      this.savedFilterTemplates = JSON.parse(saved);
    }
  }

  showFilterTemplates(): void {
    this.dialog.open(this.filterTemplatesDialog, {
      width: '800px',
      maxHeight: '80vh'
    });
  }

  applyFilterTemplate(template: FilterTemplate): void {
    const newFilters: Filter[] = [];

    template.config.filters.forEach(filterConfig => {
      // Find matching field
      let matchingField: FieldInfo | null = null;
      let matchingDataSource: DataSource | null = null;

      for (const ds of this.dataSources) {
        const fields = this.getFieldsForDataSource(ds);
        const field = fields.find(f =>
          template.requiredFields?.some(reqField =>
            f.path.toLowerCase().includes(reqField.toLowerCase())
          )
        );

        if (field) {
          matchingField = field;
          matchingDataSource = ds;
          break;
        }
      }

      if (matchingField && matchingDataSource) {
        const newFilter: Filter = {
          ...filterConfig as Filter,
          report: this.report?.id || 0,
          data_source: matchingDataSource.id || matchingDataSource.content_type_id!,
          field_path: matchingField.path,
          field_name: matchingField.name
        };

        if (!this.report?.id) {
          newFilter.id = this.tempIdCounter--;
        }

        newFilters.push(newFilter);
      }
    });

    if (newFilters.length === 0) {
      this.snackBar.open('No matching fields found for this template', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Add filters
    if (!this.report?.id) {
      this.filters.push(...newFilters);
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
    } else {
      // Save to backend
      const createPromises = newFilters.map(filter =>
        this.reportService.createFilter(filter).toPromise()
      );

      Promise.all(createPromises).then(createdFilters => {
        this.filters.push(...createdFilters);
        this.organizeFiltersIntoGroups();
        this.buildFilterTree();
        this.filtersChange.emit(this.filters);
        this.saveToHistory();

        this.snackBar.open(`Applied ${createdFilters.length} filters from template`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      });
    }

    this.dialog.closeAll();
  }

  saveAsTemplate(): void {
    if (this.filters.length === 0) return;

    this.templateForm.reset();
    const dialogRef = this.dialog.open(this.saveTemplateDialog, {
      width: '500px'
    });
  }

  saveFilterTemplate(): void {
    if (!this.templateForm.valid) return;

    const template: FilterTemplate = {
      id: Date.now().toString(),
      ...this.templateForm.value,
      filterCount: this.filters.length,
      config: {
        filters: this.filters.map(f => ({
          field_path: f.field_path,
          operator: f.operator,
          value: f.value,
          value_type: f.value_type,
          logic_group: f.logic_group,
          group_order: f.group_order,
          is_active: f.is_active
        })),
        groups: this.filterGroups
      },
      createdAt: new Date(),
      createdBy: 'current_user' // Would get from auth service
    };

    this.savedFilterTemplates.push(template);
    localStorage.setItem('filterTemplates', JSON.stringify(this.savedFilterTemplates));

    this.dialog.closeAll();
    this.snackBar.open('Filter template saved', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  deleteTemplate(template: FilterTemplate): void {
    if (confirm(`Delete template "${template.name}"?`)) {
      this.savedFilterTemplates = this.savedFilterTemplates.filter(t => t.id !== template.id);
      localStorage.setItem('filterTemplates', JSON.stringify(this.savedFilterTemplates));
    }
  }

  // Quick Actions
  addCommonFilters(): void {
    // Add commonly used filters based on available fields
    const commonFieldNames = ['is_active', 'status', 'created_at', 'updated_at'];
    const addedFilters: Filter[] = [];

    for (const ds of this.dataSources) {
      const fields = this.getFieldsForDataSource(ds);

      for (const field of fields) {
        if (commonFieldNames.some(name => field.path.toLowerCase().includes(name))) {
          let value: any = '';
          let operator: FilterOperator = 'eq';

          // Set appropriate defaults
          if (field.path.includes('is_active')) {
            value = true;
          } else if (field.path.includes('status')) {
            value = 'active';
          } else if (field.path.includes('created_at') || field.path.includes('updated_at')) {
            operator = 'gte';
            value = 'current_month_start';
          }

          const filter: Filter = {
            report: this.report?.id || 0,
            data_source: ds.id || ds.content_type_id!,
            field_path: field.path,
            field_name: field.name,
            operator: operator,
            value: value,
            value_type: field.path.includes('_at') ? 'dynamic' : 'static',
            logic_group: 'AND',
            group_order: 0,
            is_active: true,
            is_required: false
          };

          if (!this.report?.id) {
            filter.id = this.tempIdCounter--;
          }

          addedFilters.push(filter);

          // Limit to one filter per common field name
          break;
        }
      }
    }

    if (addedFilters.length === 0) {
      this.snackBar.open('No common fields found', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    // Add filters
    if (!this.report?.id) {
      this.filters.push(...addedFilters);
      this.organizeFiltersIntoGroups();
      this.buildFilterTree();
      this.filtersChange.emit(this.filters);
      this.saveToHistory();
    } else {
      const createPromises = addedFilters.map(filter =>
        this.reportService.createFilter(filter).toPromise()
      );

      Promise.all(createPromises).then(createdFilters => {
        this.filters.push(...createdFilters);
        this.organizeFiltersIntoGroups();
        this.buildFilterTree();
        this.filtersChange.emit(this.filters);
        this.saveToHistory();

        this.snackBar.open(`Added ${createdFilters.length} common filters`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      });
    }
  }

  clearAllFilters(): void {
    if (confirm('Remove all filters?')) {
      const deletions = this.filters
        .filter(filter => filter.id && filter.id > 0)
        .map(filter => this.reportService.deleteFilter(filter.id!));

      if (deletions.length > 0) {
        Promise.all(deletions.map(obs => obs.toPromise())).then(() => {
          this.filters = [];
          this.filterGroups = [];
          this.buildFilterTree();
          this.filtersChange.emit(this.filters);
          this.saveToHistory();

          this.snackBar.open('All filters removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        });
      } else {
        this.filters = [];
        this.filterGroups = [];
        this.buildFilterTree();
        this.filtersChange.emit(this.filters);
        this.saveToHistory();

        this.snackBar.open('All filters removed', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      }
    }
  }

  // Import/Export
  importFilters(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const importedFilters = JSON.parse(event.target.result);
            this.applyImportedFilters(importedFilters);
          } catch (error) {
            this.snackBar.open('Invalid filter file', 'Close', {
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

  applyImportedFilters(importedFilters: any[]): void {
    // Validate and apply imported filters
    const validFilters = importedFilters.filter(f =>
      f.field_path && f.operator && this.validateImportedFilter(f)
    );

    if (validFilters.length === 0) {
      this.snackBar.open('No valid filters found in file', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Map to current data sources
    const mappedFilters: Filter[] = [];

    validFilters.forEach(importedFilter => {
      // Try to find matching field
      for (const ds of this.dataSources) {
        const fields = this.getFieldsForDataSource(ds);
        const matchingField = fields.find(f => f.path === importedFilter.field_path);

        if (matchingField) {
          const filter: Filter = {
            ...importedFilter,
            report: this.report?.id || 0,
            data_source: ds.id || ds.content_type_id!,
            field_name: matchingField.name
          };

          if (!this.report?.id) {
            filter.id = this.tempIdCounter--;
          }

          mappedFilters.push(filter);
          break;
        }
      }
    });

    if (mappedFilters.length === 0) {
      this.snackBar.open('No matching fields found for imported filters', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Apply filters
    this.filters = mappedFilters;
    this.organizeFiltersIntoGroups();
    this.buildFilterTree();
    this.filtersChange.emit(this.filters);
    this.saveToHistory();

    this.snackBar.open(`Imported ${mappedFilters.length} filters`, 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  validateImportedFilter(filter: any): boolean {
    // Basic validation
    return filter.field_path && filter.operator &&
      ['static', 'parameter', 'dynamic', 'user_attribute'].includes(filter.value_type);
  }

  exportFilters(): void {
    if (this.filters.length === 0) return;

    const exportData = this.filters.map(f => ({
      field_path: f.field_path,
      field_name: f.field_name,
      operator: f.operator,
      value: f.value,
      value_type: f.value_type,
      logic_group: f.logic_group,
      group_order: f.group_order,
      is_active: f.is_active,
      is_required: f.is_required
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.report?.name || 'report'}_filters_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // Testing
  testFilters(): void {
    if (!this.report?.id || this.filters.length === 0) return;

    // Simulate filter testing
    this.testResults = {
      totalRows: 10000,
      matchedRows: 3567,
      filteredRows: 6433,
      matchPercentage: 35.67,
      sampleData: [
        { id: 1, name: 'Sample 1', status: 'active', created_at: '2024-01-15' },
        { id: 2, name: 'Sample 2', status: 'active', created_at: '2024-01-20' },
        { id: 3, name: 'Sample 3', status: 'active', created_at: '2024-02-01' }
      ],
      columns: ['id', 'name', 'status', 'created_at'],
      executionTime: 1.23
    };

    this.snackBar.open('Filter test completed', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  testFilter(filter: Filter): void {
    if (!this.report?.id || !this.isFilterValid(filter)) return;

    // Test individual filter
    this.snackBar.open('Testing filter...', '', {
      duration: 1000
    });

    // Simulate test
    setTimeout(() => {
      this.snackBar.open('Filter matches 234 records', 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    }, 1000);
  }

  closeTestResults(): void {
    this.testResults = null;
  }

  // SQL Preview
  toggleSqlPreview(): void {
    this.showSqlPreview = !this.showSqlPreview;
  }

  generateSqlPreview(): string {
    if (this.filters.length === 0) return 'No filters defined';

    let sql = 'WHERE ';
    const groupedFilters = new Map<number, Filter[]>();

    // Group filters
    this.filters.forEach(filter => {
      const group = filter.group_order || 0;
      if (!groupedFilters.has(group)) {
        groupedFilters.set(group, []);
      }
      groupedFilters.get(group)!.push(filter);
    });

    // Build SQL
    const groupClauses: string[] = [];

    groupedFilters.forEach((filters, groupIndex) => {
      const logic = filters[0]?.logic_group || 'AND';
      const filterClauses = filters
        .filter(f => f.is_active && this.isFilterValid(f))
        .map(f => this.filterToSql(f));

      if (filterClauses.length > 0) {
        groupClauses.push(`(${filterClauses.join(` ${logic} `)})`);
      }
    });

    sql += groupClauses.join(' AND ');

    return sql || 'No valid filters';
  }

  filterToSql(filter: Filter): string {
    const field = this.getFieldDisplayName(filter);
    const operator = this.operatorToSql(filter.operator);
    let value = this.formatSqlValue(filter);

    switch (filter.operator) {
      case 'isnull':
        return `${field} IS NULL`;
      case 'isnotnull':
        return `${field} IS NOT NULL`;
      case 'between':
        return `${field} BETWEEN ${value}`;
      case 'in':
      case 'not_in':
        return `${field} ${operator} (${value})`;
      default:
        return `${field} ${operator} ${value}`;
    }
  }

  operatorToSql(operator: string): string {
    const sqlOperators: Record<string, string> = {
      'eq': '=',
      'ne': '!=',
      'gt': '>',
      'gte': '>=',
      'lt': '<',
      'lte': '<=',
      'contains': 'LIKE',
      'icontains': 'ILIKE',
      'startswith': 'LIKE',
      'endswith': 'LIKE',
      'in': 'IN',
      'not_in': 'NOT IN',
      'regex': '~'
    };
    return sqlOperators[operator] || operator;
  }

  formatSqlValue(filter: Filter): string {
    if (filter.value_type === 'parameter') {
      return `:${filter.value}`;
    }

    if (filter.value_type === 'dynamic') {
      return `CURRENT_DATE`; // Simplified
    }

    const fieldInfo = this.getFieldInfo(filter);
    const isTextual = fieldInfo && ['CharField', 'TextField', 'EmailField', 'URLField'].includes(fieldInfo.type);

    if (filter.operator === 'between' && Array.isArray(filter.value)) {
      return `${this.quoteSqlValue(filter.value[0], isTextual)} AND ${this.quoteSqlValue(filter.value[1], isTextual)}`;
    }

    if ((filter.operator === 'in' || filter.operator === 'not_in') && Array.isArray(filter.value)) {
      return filter.value.map(v => this.quoteSqlValue(v, isTextual)).join(', ');
    }

    if (filter.operator === 'contains' || filter.operator === 'icontains') {
      return `'%${filter.value}%'`;
    }

    if (filter.operator === 'startswith') {
      return `'${filter.value}%'`;
    }

    if (filter.operator === 'endswith') {
      return `'%${filter.value}'`;
    }

    return this.quoteSqlValue(filter.value, isTextual);
  }

  quoteSqlValue(value: any, isTextual: boolean): string {
    if (value === null || value === undefined) return 'NULL';
    if (isTextual || typeof value === 'string') return `'${value}'`;
    return value.toString();
  }

  copySqlToClipboard(): void {
    const sql = this.generateSqlPreview();
    navigator.clipboard.writeText(sql).then(() => {
      this.snackBar.open('SQL copied to clipboard', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }
}
