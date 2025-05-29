// components/resource-table/resource-table.component.ts - FIXED
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Resource, TableData } from '../../models/resource.model';
import { DataFormatterService } from '../../services/data-formatter.service';
import { FormBuilderService } from '../../services/form-builder.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';

@Component({
  selector: 'app-resource-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './resource-table.component.html',
  styleUrl: './resource-table.component.scss'
})
export class ResourceTableComponent {
  @Input() resource!: Resource;
  @Input() data: TableData[] = [];
  @Input() loading = false;

  @Output() onCreate = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onView = new EventEmitter<TableData>();
  @Output() onEdit = new EventEmitter<TableData>();
  @Output() onDelete = new EventEmitter<TableData>();

  constructor(
      private dataFormatter: DataFormatterService,
      private formBuilder: FormBuilderService
  ) {}

  get displayColumns(): string[] {
    return this.formBuilder.getTableColumns(this.resource, this.data);
  }

  get allColumns(): string[] {
    return this.formBuilder.getDisplayColumns(this.resource, this.data);
  }

  formatColumnName(name: string): string {
    return FieldTypeUtils.formatColumnName(name);
  }

  formatCellValue(value: any): string {
    return this.dataFormatter.formatCellValue(value);
  }

  getFieldType(columnName: string): string | null {
    const field = this.resource.fields?.find((f: any) => f.name === columnName);
    return field ? field.type : null;
  }

  // FIXED: Properly handle boolean return type
  isRelation(columnName: string): boolean {
    const field = this.resource.fields?.find((f: any) => f.name === columnName);
    if (!field || !field.type) return false;
    return ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type);
  }
}
