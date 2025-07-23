// src/app/components/inquiry/components/dynamic-table/dynamic-table.component.ts

import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CdkTableModule } from '@angular/cdk/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DynamicColumn, SortState, RowAction } from '../../../../models/inquiry-execution.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

import { MatNoDataRow } from '@angular/material/table';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSortModule,
    MatProgressBarModule,
    CdkTableModule,
    ScrollingModule,
    TranslatePipe,
    MatNoDataRow
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  @Input() columns: DynamicColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() sortable = true;
  @Input() selectable = false;
  @Input() rowActions: RowAction[] = [];

  @Output() sortChange = new EventEmitter<SortState[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [];

  ngAfterViewInit(): void {
    if (this.sort && this.sortable) {
      this.dataSource.sort = this.sort;

      this.sort.sortChange.subscribe(() => {
        const sortState: SortState[] = this.sort.active ? [{
          field: this.sort.active,
          direction: this.sort.direction || 'asc'
        }] : [];

        this.sortChange.emit(sortState);
      });
    }
  }

  ngOnChanges(): void {
    this.dataSource.data = this.data;
    this.updateDisplayedColumns();
  }

  private updateDisplayedColumns(): void {
    const columns = this.columns.map(col => col.field);

    if (this.selectable) {
      columns.unshift('select');
    }

    if (this.rowActions.length > 0) {
      columns.push('actions');
    }

    this.displayedColumns = columns;
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }

    this.selectionChange.emit(this.selection.selected);
  }

  toggleRow(row: any): void {
    this.selection.toggle(row);
    this.selectionChange.emit(this.selection.selected);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  // Cell value formatting
  getCellValue(row: any, column: DynamicColumn): any {
    const keys = column.field.split('.');
    let value = row;

    for (const key of keys) {
      value = value?.[key];
    }

    return this.formatCellValue(value, column);
  }

  private formatCellValue(value: any, column: DynamicColumn): string {
    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return value.toLocaleString();
      case 'json':
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }

  getCellClass(column: DynamicColumn, row: any): string {
    const classes = [`cell-type-${column.type}`];

    if (column.align) {
      classes.push(`text-${column.align}`);
    }

    return classes.join(' ');
  }

  // Row actions
  getRowActions(row: any): RowAction[] {
    return this.rowActions.filter(action =>
      !action.condition || action.condition(row)
    );
  }

  executeAction(action: RowAction, row: any): void {
    action.action(row);
  }

  // Export selected
  exportSelected(): void {
    console.log('Export selected rows:', this.selection.selected);
  }

  clearSelection(): void {
    this.selection.clear();
    this.selectionChange.emit([]);
  }
}
