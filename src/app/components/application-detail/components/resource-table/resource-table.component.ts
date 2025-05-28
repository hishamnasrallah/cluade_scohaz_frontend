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
  template: `
    <div class="table-container">
      <div class="actions-bar">
        <button mat-raised-button color="primary"
                *ngIf="resource.canCreate"
                (click)="onCreate.emit()">
          <mat-icon>add</mat-icon>
          Add New {{ formatColumnName(resource.name) }}
        </button>
        <button mat-button (click)="onRefresh.emit()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <div *ngIf="loading" class="loading-data">
        <mat-spinner diameter="30"></mat-spinner>
        <span>Loading data...</span>
      </div>

      <div *ngIf="!loading && data && data.length > 0" class="table-wrapper">
        <table mat-table [dataSource]="data" class="resource-table">
          <!-- Dynamic columns -->
          <ng-container *ngFor="let col of displayColumns" [matColumnDef]="col">
            <th mat-header-cell *matHeaderCellDef class="table-header">
              {{ formatColumnName(col) }}
            </th>
            <td mat-cell *matCellDef="let element" class="table-cell">
              <!-- File field -->
              <span *ngIf="getFieldType(col) === 'FileField' && element[col]" class="file-link">
                <a [href]="element[col]" target="_blank" rel="noopener noreferrer" class="file-url">
                  <mat-icon class="file-icon">attachment</mat-icon>
                  View File
                </a>
              </span>
              <span *ngIf="getFieldType(col) === 'FileField' && !element[col]" class="no-file">
                No file
              </span>

              <!-- Regular fields -->
              <span *ngIf="getFieldType(col) !== 'FileField' && !isRelation(col)" class="cell-content">
                {{ formatCellValue(element[col]) }}
              </span>

              <!-- Relation fields -->
              <span *ngIf="isRelation(col)" class="relation-field">
                {{ element[col] || 'N/A' }}
              </span>
            </td>
          </ng-container>

          <!-- Actions column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <div class="action-buttons">
                <button mat-icon-button
                        *ngIf="resource.canRead"
                        (click)="onView.emit(element)"
                        matTooltip="View Details"
                        class="action-btn view-btn">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button
                        *ngIf="resource.canUpdate"
                        (click)="onEdit.emit(element)"
                        matTooltip="Edit"
                        class="action-btn edit-btn">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        *ngIf="resource.canDelete"
                        (click)="onDelete.emit(element)"
                        matTooltip="Delete"
                        color="warn"
                        class="action-btn delete-btn">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="allColumns" class="table-header-row"></tr>
          <tr mat-row *matRowDef="let row; columns: allColumns;" class="table-row"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 20]"
                       showFirstLastButtons
                       class="table-paginator">
        </mat-paginator>
      </div>

      <div *ngIf="!loading && (!data || data.length === 0)" class="no-data">
        <mat-icon class="no-data-icon">inbox</mat-icon>
        <p class="no-data-text">No {{ resource.name }} records found</p>
        <button mat-raised-button color="primary"
                *ngIf="resource.canCreate"
                (click)="onCreate.emit()"
                class="create-first-btn">
          Create First {{ formatColumnName(resource.name) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .actions-bar {
      display: flex;
      gap: 12px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #dee2e6;
    }

    .loading-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px;
      color: #6c757d;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .resource-table {
      width: 100%;
      background: white;
    }

    .table-header {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      padding: 16px;
      border-bottom: 2px solid #dee2e6;
    }

    .table-header-row {
      background: #f8f9fa;
    }

    .table-cell {
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .table-row {
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background-color: #f8f9fa;
    }

    .cell-content {
      color: #495057;
    }

    .file-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .file-url {
      color: #007bff;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(0, 123, 255, 0.1);
      transition: all 0.2s ease;
      font-size: 14px;
    }

    .file-url:hover {
      background: rgba(0, 123, 255, 0.2);
      text-decoration: none;
      transform: translateY(-1px);
    }

    .file-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .no-file {
      color: #6c757d;
      font-style: italic;
      font-size: 14px;
    }

    .relation-field {
      color: #6c757d;
      font-style: italic;
    }

    .actions-header {
      width: 140px;
      text-align: center;
    }

    .actions-cell {
      width: 140px;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: center;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .view-btn:hover {
      background: rgba(0, 123, 255, 0.1);
      color: #007bff;
    }

    .edit-btn:hover {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
    }

    .delete-btn:hover {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      background: #f8f9fa;
    }

    .no-data-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ced4da;
      margin-bottom: 16px;
    }

    .no-data-text {
      color: #6c757d;
      font-size: 18px;
      margin-bottom: 20px;
    }

    .create-first-btn {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
    }

    .table-paginator {
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
    }
  `]
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
