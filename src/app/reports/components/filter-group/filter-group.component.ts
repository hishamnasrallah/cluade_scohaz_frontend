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
  styleUrl: 'filter-group.component.scss'
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

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
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
    this.groupChange.emit({ group: this.group, action: 'add_filter' });
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

    // Get valid operators for the new field type
    const operators = this.reportService.getOperatorOptions(selectedField.type);

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
    if (!filter.field_path) return null;

    // Find the data source for this filter
    const dataSource = this.dataSources.find(ds =>
      ds.id === filter.data_source || ds.content_type_id === filter.data_source
    );

    if (!dataSource) {
      console.error('Data source not found for filter:', filter.data_source);
      return null;
    }

    // Get fields from availableFields Map
    const fields = this.availableFields.get(dataSource.id || dataSource.content_type_id!);

    if (!fields || fields.length === 0) {
      console.error('No fields found for data source:', dataSource);
      return null;
    }

    const fieldInfo = fields.find(f => f.path === filter.field_path);

    if (!fieldInfo) {
      console.error('Field not found:', filter.field_path, 'in fields:', fields);
    }

    return fieldInfo || null;
  }

  getOperatorsForFilter(filter: Filter): Array<{ value: string; label: string }> {
    const fieldInfo = this.getFieldInfo(filter);

    console.log('getOperatorsForFilter - fieldInfo:', fieldInfo);
    console.log('getOperatorsForFilter - filter:', filter);

    // If no field selected or field type is unknown, return basic operators
    if (!fieldInfo || !fieldInfo.type) {
      console.log('getOperatorsForFilter - returning default operators');
      return [
        { value: 'eq', label: 'Equals' },
        { value: 'ne', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'isnull', label: 'Is Null' },
        { value: 'isnotnull', label: 'Is Not Null' }
      ];
    }

    const operators = this.reportService.getOperatorOptions(fieldInfo.type);
    console.log('getOperatorsForFilter - operators from service:', operators);

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
}
