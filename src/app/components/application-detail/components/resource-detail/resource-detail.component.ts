// components/resource-detail/resource-detail.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardActions
} from '@angular/material/card';

import { Resource, TableData } from '../../models/resource.model';
import { DataFormatterService } from '../../services/data-formatter.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './resource-detail.component.html',
  styleUrl: './resource-detail.component.scss'
})
export class ResourceDetailComponent {
  @Input() resource!: Resource;
  @Input() record!: TableData;

  @Output() onEdit = new EventEmitter<TableData>();
  @Output() onClose = new EventEmitter<void>();

  constructor(private dataFormatter: DataFormatterService) {}

  get displayFields() {
    return this.resource.fields?.filter(field =>
        field && field.name && !field.name.startsWith('_')
    ) || [];
  }

  onOverlayClick(event: Event): void {
    this.onClose.emit();
  }

  getFieldValue(fieldName: string): any {
    return this.record[fieldName];
  }

  formatColumnName(name: string): string {
    return FieldTypeUtils.formatColumnName(name);
  }

  formatCellValue(value: any): string {
    return this.dataFormatter.formatCellValue(value);
  }

  formatBooleanValue(value: any): string {
    return value ? 'Yes' : 'No';
  }

  formatDateTimeValue(value: any): string {
    if (!value) return 'No date';
    try {
      const date = new Date(value);
      return date.toLocaleString();
    } catch {
      return String(value);
    }
  }

  getBooleanIcon(value: any): string {
    return value ? 'check_circle' : 'cancel';
  }

  isFileField(field: any): boolean {
    return FieldTypeUtils.isFileField(field);
  }

  isBooleanField(field: any): boolean {
    return FieldTypeUtils.isBooleanField(field);
  }

  isDateTimeField(field: any): boolean {
    return FieldTypeUtils.isDateTimeField(field) || FieldTypeUtils.isDateField(field);
  }
}
