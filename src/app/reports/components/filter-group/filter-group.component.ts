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

    // Ensure the cdkDropListData always has a valid array
    if (!this.group.children) {
      this.group.children = [];
    }
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

      // Update parent reference
      const movedItem = this.group.children[event.currentIndex];
      if (movedItem) {
        movedItem.parentId = this.group.id;
      }
    }

    this.groupChange.emit({ group: this.group, action: 'reorder' });
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

    const newFilter: Filter = {
      report: 0, // Will be set by parent
      data_source: primaryDataSource.id || primaryDataSource.content_type_id!,
      field_path: '',
      field_name: '',
      operator: 'eq',
      value: '',
      value_type: 'static',
      logic_group: this.group.logic || 'AND',
      group_order: 0,
      parent_group: parseInt(this.group.id) || undefined,
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

  onFieldChange(filter: Filter): void {
    // Reset operator and value when field changes
    const fieldInfo = this.getFieldInfo(filter);
    if (fieldInfo) {
      const operators = this.reportService.getOperatorOptions(fieldInfo.type);
      if (operators.length > 0 && !operators.find(op => op.value === filter.operator)) {
        filter.operator = operators[0].value as any;
      }
      filter.value = '';
    }

    this.filterChange.emit({ filter, group: this.group });
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
    this.filterChange.emit({ filter, group: this.group });
  }

  onFilterValueChange(filter: Filter): void {
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
    return this.availableFields.get(key!) || [];
  }

  getFieldInfo(filter: Filter): FieldInfo | null {
    const dataSource = this.dataSources.find(ds =>
      ds.id === filter.data_source || ds.content_type_id === filter.data_source
    );
    if (!dataSource) return null;

    const fields = this.getFieldsForDataSource(dataSource);
    return fields.find(f => f.path === filter.field_path) || null;
  }

  getOperatorsForFilter(filter: Filter): Array<{ value: string; label: string }> {
    const fieldInfo = this.getFieldInfo(filter);
    if (!fieldInfo) return [];

    return this.reportService.getOperatorOptions(fieldInfo.type);
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
}
