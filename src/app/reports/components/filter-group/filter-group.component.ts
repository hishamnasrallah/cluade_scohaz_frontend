// src/app/reports/components/filter-builder/filter-group/filter-group.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Filter, DataSource, Parameter, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import { FilterValueInputComponent } from '../filter-value-input/filter-value-input.component';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

interface FilterTreeNode {
  id: string;
  type: 'group' | 'filter';
  logic?: 'AND' | 'OR';
  filter?: Filter;
  children?: FilterTreeNode[];
  parentId?: string;
}

@Component({
  selector: 'app-filter-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    FilterValueInputComponent
  ],
  templateUrl: 'filter-group.component.html',
  styleUrl: 'filter-group.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush

})
export class FilterGroupComponent implements OnInit {
  @Input() group!: FilterTreeNode;
  @Input() dataSources: DataSource[] = [];
  @Input() parameters: Parameter[] = [];
  @Input() availableFields: Map<number, FieldInfo[]> = new Map();
  @Input() isRoot = false;

  @Output() groupChange = new EventEmitter<{ group: FilterTreeNode; action: string }>();
  @Output() filterChange = new EventEmitter<{ filter: Filter; group: FilterTreeNode }>();
  @Output() filterRemove = new EventEmitter<{ filter: Filter; group: FilterTreeNode }>();

  private idCounter = 0;
  private operatorsCache = new Map<string, Array<{ value: string; label: string }>>();
  private filterOperators = new Map<string, Array<{ value: string; label: string }>>();
  filterOperatorsMap = new Map<string, Array<{ value: string; label: string }>>();
  private groupedOperatorsCache = new Map<string, Array<{ label: string; operators: Array<{ value: string; label: string; icon: string }> }>>();

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    console.log('=== FILTER-GROUP COMPONENT INITIALIZED ===');
    console.log('Group:', this.group);
    console.log('DataSources:', this.dataSources);
    console.log('Available Fields:', this.availableFields);
    console.log('Is Root:', this.isRoot);

    // Ensure group has required properties
    if (!this.group.children) {
      this.group.children = [];
    }
    if (!this.group.logic) {
      this.group.logic = 'AND';
    }

    // Debug available fields
    console.log('FilterGroup initialized');
    console.log('Available fields Map:', this.availableFields);
    console.log('Available fields size:', this.availableFields?.size || 0);
    console.log('Data sources:', this.dataSources);

    // Check fields after a delay
    setTimeout(() => {
      console.log('FilterGroup - checking fields after delay:');
      this.dataSources.forEach(ds => {
        const key = ds.id || ds.content_type_id;
        const fields = this.availableFields.get(key!);
        console.log(`Data source ${ds.alias} (key: ${key}) has ${fields?.length || 0} fields`);
      });

      // Force change detection
      if (this.cdr) {
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  onDrop(event: CdkDragDrop<FilterTreeNode[]>): void {
    // Ensure children array exists
    if (!this.group.children) {
      this.group.children = [];
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(this.group.children, event.previousIndex, event.currentIndex);
    } else {
      const previousData = event.previousContainer.data || [];
      transferArrayItem(
        previousData,
        this.group.children,
        event.previousIndex,
        event.currentIndex
      );

      // Update parent reference and filter properties
      const movedItem = this.group.children[event.currentIndex];
      if (movedItem) {
        movedItem.parentId = this.group.id;

        // Update the filter's logic group to match new parent
        if (movedItem.type === 'filter' && movedItem.filter) {
          movedItem.filter.logic_group = this.group.logic || 'AND';
        }
      }
    }

    // Emit change with drag_drop action to trigger synchronization
    this.groupChange.emit({ group: this.group, action: 'drag_drop' });
  }

  toggleLogic(): void {
    this.group.logic = this.group.logic === 'AND' ? 'OR' : 'AND';

    // Update all child filters' logic_group
    this.updateChildFiltersLogic();

    this.groupChange.emit({ group: this.group, action: 'toggle_logic' });
  }

  updateChildFiltersLogic(): void {
    if (!this.group.children) return;

    this.group.children.forEach(child => {
      if (child.type === 'filter' && child.filter) {
        child.filter.logic_group = this.group.logic!;
      }
    });
  }

  addFilter(): void {
    const primaryDataSource = this.dataSources.find(ds => ds.is_primary) || this.dataSources[0];
    if (!primaryDataSource) return;

    // Get first available field as default
    const availableFields = this.getFieldsForDataSource(primaryDataSource);
    const defaultField = availableFields[0];

    if (!defaultField) {
      console.error('No fields available for data source:', primaryDataSource);
      return;
    }

    const newFilter: Filter = {
      report: 0, // Will be set by parent
      data_source: primaryDataSource.id || primaryDataSource.content_type_id!,
      field_path: defaultField.path,
      field_name: defaultField.name,
      field_type: defaultField.type, // IMPORTANT: Set the field type from the field info
      operator: 'eq',
      value: '',
      value_type: 'static',
      logic_group: this.group.logic || 'AND',
      group_order: this.getGroupOrder(),
      parent_group: this.isRoot ? undefined : parseInt(this.group.id.replace('group-', '')) || undefined,
      is_active: true,
      is_required: false
    };

    const filterNode: FilterTreeNode = {
      id: `filter-${Date.now()}-${this.idCounter++}`,
      type: 'filter',
      filter: newFilter,
      parentId: this.group.id
    };

    if (!this.group.children) {
      this.group.children = [];
    }

    this.group.children.push(filterNode);

    // Pre-populate operators for the new filter
    const filterKey = `filter_${newFilter.id || filterNode.id}`;
    const operators = this.reportService.getOperatorOptions(defaultField.type);
    this.filterOperatorsMap.set(filterKey, operators);

    this.groupChange.emit({ group: this.group, action: 'add_filter' });
    this.cdr.markForCheck();
  }

  private getGroupOrder(): number {
    // Extract group order from group ID or use default
    const match = this.group.id.match(/group-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  addSubGroup(): void {
    const subGroup: FilterTreeNode = {
      id: `group-${Date.now()}-${this.idCounter++}`,
      type: 'group',
      logic: this.group.logic === 'AND' ? 'OR' : 'AND',
      children: [],
      parentId: this.group.id
    };

    if (!this.group.children) {
      this.group.children = [];
    }

    this.group.children.push(subGroup);
    this.groupChange.emit({ group: this.group, action: 'add_group' });
  }

  deleteGroup(): void {
    if (confirm('Delete this group and all its filters?')) {
      this.groupChange.emit({ group: this.group, action: 'delete' });
    }
  }

  removeFilter(node: FilterTreeNode): void {
    if (!this.group.children || !node.filter) return;

    const index = this.group.children.indexOf(node);
    if (index > -1) {
      this.group.children.splice(index, 1);
      this.filterRemove.emit({ filter: node.filter, group: this.group });
    }
  }

  onFieldSelectChange(filter: Filter, event: any): void {
    console.log('onFieldSelectChange - event.value:', event.value);

    const selectedField = event.value as FieldInfo;

    if (!selectedField) {
      console.error('No field selected');
      return;
    }

    // Find which data source this field belongs to
    let matchingDataSource: DataSource | null = null;
    for (const ds of this.dataSources) {
      const fields = this.getFieldsForDataSource(ds);
      if (fields.some(f => f.path === selectedField.path)) {
        matchingDataSource = ds;
        break;
      }
    }

    if (matchingDataSource) {
      // Update the filter's data_source to match
      filter.data_source = matchingDataSource.id || matchingDataSource.content_type_id!;
    }

    // Update filter with new field information
    filter.field_path = selectedField.path;
    filter.field_name = selectedField.name;
    filter.field_type = selectedField.type;
    // Clear the grouped operators cache for this filter
    const cacheKey = `${filter.id}_${filter.field_path}_${filter.field_type || 'unknown'}`;
    this.groupedOperatorsCache.delete(cacheKey);
    // Clear the operators cache for this filter to force refresh
    this.operatorsCache.delete(cacheKey);

// Get valid operators for the new field type
    const operators = this.reportService.getOperatorOptions(selectedField.type);

// Store operators in the map using filter's unique identifier
    const filterKey = `filter_${filter.id || Date.now()}`;
    this.filterOperatorsMap.set(filterKey, operators);

    // Add console.log AFTER operators is declared
    console.log('onFieldSelectChange - operators after update:', operators);

    if (operators.length > 0) {
      // Set to first available operator (typically 'eq')
      filter.operator = operators[0].value as any;
    } else {
      filter.operator = 'eq'; // Fallback to 'eq' if no operators found
    }

    // Reset value based on field type and operator
    filter.value = this.getDefaultValueForFieldType(selectedField.type, filter.operator);
    filter.value_type = 'static'; // Reset to static

    // Log for debugging
    console.log('Field changed:', {
      field: selectedField.path,
      type: selectedField.type,
      operator: filter.operator,
      defaultValue: filter.value,
      availableOperators: operators
    });

    this.filterChange.emit({ filter, group: this.group });

    // Force change detection after a microtask to ensure bindings are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }
  private getFilterKey(filter: Filter): string {
    return `${filter.id || 'temp'}_${filter.field_path}_${filter.field_type}`;
  }

  getFilterOperators(filter: Filter): Array<{ value: string; label: string }> {
    const filterKey = `filter_${filter.id || 'temp'}`;

    // Check if we have stored operators for this filter
    if (this.filterOperatorsMap.has(filterKey)) {
      return this.filterOperatorsMap.get(filterKey)!;
    }

    // Get the field info to determine the correct type
    const fieldInfo = this.getFieldInfo(filter);
    const fieldType = fieldInfo?.type || filter.field_type || 'CharField';

    console.log('getFilterOperators - using field type:', fieldType, 'for filter:', filter);

    // Get operators based on the correct field type
    const operators = this.reportService.getOperatorOptions(fieldType);
    this.filterOperatorsMap.set(filterKey, operators);

    return operators;
  }
  getGroupedOperators(filter: Filter): Array<{ label: string; operators: Array<{ value: string; label: string; icon: string }> }> {
    console.log('DEBUG: getGroupedOperators - FUNCTION CALLED');

    try {
      console.log('DEBUG: getGroupedOperators - Input filter:', filter);

      // Check if filter exists
      if (!filter) {
        console.error('DEBUG: getGroupedOperators - Filter is null or undefined!');
        return [];
      }

      // Get the flat list of operators
      const operators = this.getFilterOperators(filter);
      console.log('DEBUG: getGroupedOperators - Operators received:', operators);

      // Check if operators is valid
      if (!operators || !Array.isArray(operators)) {
        console.error('DEBUG: getGroupedOperators - Invalid operators:', operators);
        return [];
      }

      // Group operators by category
      const groups: Array<{ label: string; operators: Array<{ value: string; label: string; icon: string }> }> = [];

      // Basic operators (always included)
      const basicOps = operators.filter(op => op && ['eq', 'ne'].includes(op.value));
      console.log('DEBUG: getGroupedOperators - Basic operators:', basicOps);
      if (basicOps.length > 0) {
        groups.push({
          label: 'Basic',
          operators: basicOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      // Comparison operators
      const comparisonOps = operators.filter(op =>
        op && ['gt', 'gte', 'lt', 'lte', 'between'].includes(op.value)
      );
      console.log('DEBUG: getGroupedOperators - Comparison operators:', comparisonOps);
      if (comparisonOps.length > 0) {
        groups.push({
          label: 'Comparison',
          operators: comparisonOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      // Text operators
      const textOps = operators.filter(op =>
        op && ['contains', 'icontains', 'startswith', 'endswith', 'regex'].includes(op.value)
      );
      console.log('DEBUG: getGroupedOperators - Text operators:', textOps);
      if (textOps.length > 0) {
        groups.push({
          label: 'Text',
          operators: textOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      // List operators
      const listOps = operators.filter(op => op && ['in', 'not_in'].includes(op.value));
      console.log('DEBUG: getGroupedOperators - List operators:', listOps);
      if (listOps.length > 0) {
        groups.push({
          label: 'List',
          operators: listOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      // Null check operators
      const nullOps = operators.filter(op => op && ['isnull', 'isnotnull'].includes(op.value));
      console.log('DEBUG: getGroupedOperators - Null operators:', nullOps);
      if (nullOps.length > 0) {
        groups.push({
          label: 'Null Check',
          operators: nullOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      // Date operators
      const dateOps = operators.filter(op => op && ['date_range'].includes(op.value));
      console.log('DEBUG: getGroupedOperators - Date operators:', dateOps);
      if (dateOps.length > 0) {
        groups.push({
          label: 'Date',
          operators: dateOps.map(op => ({
            value: op.value,
            label: op.label,
            icon: this.getOperatorIcon(op.value)
          }))
        });
      }

      console.log('DEBUG: getGroupedOperators - Final groups:', groups);
      console.log('DEBUG: getGroupedOperators - Number of groups:', groups.length);

      return groups;

    } catch (error: any) {
      console.error('DEBUG: getGroupedOperators - ERROR:', error);
      console.error('DEBUG: getGroupedOperators - Error stack:', error?.stack);
      console.error('DEBUG: getGroupedOperators - Error message:', error?.message);
      return [];
    }
  }

  testMethod(): string {
    console.log('DEBUG: testMethod called from template');
    return 'TEST';
  }

  private getOperatorIcon(operator: string): string {
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

  private getDefaultValueForFieldType(fieldType: string, operator: string): any {
    // Special handling for operators that don't need values
    if (operator === 'isnull' || operator === 'isnotnull') {
      return null;
    }

    // Special handling for range operators
    if (operator === 'between') {
      return fieldType.toLowerCase().includes('date') ? [null, null] : [0, 0];
    }

    if (operator === 'date_range') {
      return { start: null, end: null };
    }

    if (operator === 'in' || operator === 'not_in') {
      return [];
    }

    // Default values by field type
    switch (fieldType.toLowerCase()) {
      case 'booleanfield':
        return false;
      case 'integerfield':
      case 'floatfield':
      case 'decimalfield':
        return 0;
      case 'datefield':
      case 'datetimefield':
        return null; // Will be handled by date picker
      default:
        return '';
    }
  }

  getFieldInfo(filter: Filter): FieldInfo | null {
    // First check if filter already has the field info we need
    if (filter.field_type && filter.field_path) {
      console.log('getFieldInfo: Using filter field_type directly:', filter.field_type);
      return {
        name: filter.field_name || filter.field_path,
        path: filter.field_path,
        verbose_name: filter.field_name || filter.field_path,
        type: filter.field_type,
        is_relation: false
      };
    }

    if (!filter.data_source || !filter.field_path) {
      console.warn('getFieldInfo: Missing data_source or field_path', filter);
      return null;
    }

    const dataSource = this.dataSources.find(ds =>
      ds.id === filter.data_source || ds.content_type_id === filter.data_source
    );

    if (!dataSource) {
      console.warn('getFieldInfo: Data source not found for filter:', filter.data_source);
      return null;
    }

    const key = dataSource.id || dataSource.content_type_id;
    const fields = this.availableFields.get(key!);

    if (!fields || fields.length === 0) {
      console.warn('getFieldInfo: No fields found for data source:', dataSource.alias, 'key:', key);
      return null;
    }

    const fieldInfo = fields.find(f => f.path === filter.field_path);

    if (fieldInfo) {
      console.log('getFieldInfo: Found field:', fieldInfo);
      // Update the filter's field_type to match
      if (!filter.field_type || filter.field_type !== fieldInfo.type) {
        filter.field_type = fieldInfo.type;
        // Emit change to update the filter
        this.filterChange.emit({ filter, group: this.group });
      }
    } else {
      console.warn('getFieldInfo: Field not found for path:', filter.field_path);
    }

    return fieldInfo || null;
  }

  getOperatorsForFilter(filter: Filter): Array<{ value: string; label: string }> {
    const fieldInfo = this.getFieldInfo(filter);

    if (!fieldInfo || !fieldInfo.type) {
      return [
        { value: 'eq', label: 'Equals' },
        { value: 'ne', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'isnull', label: 'Is Null' },
        { value: 'isnotnull', label: 'Is Not Null' }
      ];
    }

    // Check cache first
    if (this.operatorsCache.has(fieldInfo.type)) {
      return this.operatorsCache.get(fieldInfo.type)!;
    }

    // Get operators and cache them
    const operators = this.reportService.getOperatorOptions(fieldInfo.type);
    this.operatorsCache.set(fieldInfo.type, operators);

    return operators || [];
  }

  getOperatorsForFilterCached(filter: Filter): Array<{ value: string; label: string }> {
    const filterKey = this.getFilterKey(filter);

    // First check the filterOperators map
    if (this.filterOperators.has(filterKey)) {
      return this.filterOperators.get(filterKey)!;
    }

    // Then check the cache
    const cacheKey = `${filter.data_source}_${filter.field_path}_${filter.field_type || 'unknown'}`;
    if (this.operatorsCache.has(cacheKey)) {
      return this.operatorsCache.get(cacheKey)!;
    }

    const operators = this.getOperatorsForFilter(filter);
    this.operatorsCache.set(cacheKey, operators);
    this.filterOperators.set(filterKey, operators);
    return operators;
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

    this.filterChange.emit({ filter, group: this.group });
    this.cdr.detectChanges();
  }

  onFilterChange(filter: Filter): void {
    // Don't emit change for toggle updates - handle locally
    if (event && (event as any).source?.checked !== undefined) {
      // This is a toggle change, handle it differently
      this.updateFilterLocally(filter);
    } else {
      this.filterChange.emit({ filter, group: this.group });
    }
  }
  private updateFilterLocally(filter: Filter): void {
    // Update filter locally without emitting to parent
    // This prevents re-renders that cause focus loss
    setTimeout(() => {
      this.filterChange.emit({ filter, group: this.group });
    }, 100);
  }

  onFilterValueChange(filter: Filter, value: any): void {
    filter.value = value;
    this.filterChange.emit({ filter, group: this.group });
  }

  onChildGroupChange(event: any): void {
    this.groupChange.emit(event);
  }

  onChildFilterChange(event: any): void {
    this.filterChange.emit(event);
  }

  onChildFilterRemove(event: any): void {
    this.filterRemove.emit(event);
  }

  getFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    const key = dataSource.id || dataSource.content_type_id;
    if (!key) {
      console.error('No key for data source:', dataSource);
      return [];
    }

    const fields = this.availableFields.get(key) || [];
    console.log(`Getting fields for data source ${dataSource.alias} (key: ${key}):`, fields.length, 'fields');
    return fields;
  }

  // getFieldInfo(filter: Filter): FieldInfo | null {
  //   const dataSource = this.dataSources.find(ds =>
  //     ds.id === filter.data_source || ds.content_type_id === filter.data_source
  //   );
  //   if (!dataSource) return null;
  //
  //   const fields = this.getFieldsForDataSource(dataSource);
  //   return fields.find(f => f.path === filter.field_path) || null;
  // }
  //
  // getOperatorsForFilter(filter: Filter): Array<{ value: string; label: string }> {
  //   const fieldInfo = this.getFieldInfo(filter);
  //
  //   // If no field selected, return default operators
  //   if (!fieldInfo || !filter.field_path) {
  //     return this.reportService.getOperatorOptions('default');
  //   }
  //
  //   return this.reportService.getOperatorOptions(fieldInfo.type);
  // }
  compareOperators(o1: any, o2: any): boolean {
    return o1 === o2;
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

  onToggleChange(filter: Filter, event: any): void {
    filter.is_active = event.checked;
    // Emit directly without setTimeout
    this.filterChange.emit({ filter, group: this.group });
  }
  getCachedGroupedOperators(filter: Filter): Array<{ label: string; operators: Array<{ value: string; label: string; icon: string }> }> {
    // Create a unique key for this filter
    const cacheKey = `${filter.id}_${filter.field_path}_${filter.field_type || 'unknown'}`;

    // Check cache first
    if (this.groupedOperatorsCache.has(cacheKey)) {
      return this.groupedOperatorsCache.get(cacheKey)!;
    }

    // Get grouped operators and cache them
    const groups = this.getGroupedOperators(filter);
    this.groupedOperatorsCache.set(cacheKey, groups);

    return groups;
  }
}
