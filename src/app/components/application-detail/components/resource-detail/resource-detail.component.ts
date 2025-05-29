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
  template: `
    <div class="detail-overlay" (click)="onOverlayClick($event)">
      <mat-card class="detail-card" (click)="$event.stopPropagation()">
        <mat-card-header class="detail-header">
          <mat-card-title class="detail-title">
            {{ formatColumnName(resource.name) }} Details
          </mat-card-title>
          <button mat-icon-button (click)="onClose.emit()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content class="detail-content">
          <div class="detail-grid">
            <div *ngFor="let field of displayFields" class="detail-field">
              <div class="field-label">{{ formatColumnName(field.name) }}</div>
              <div class="field-value">
                <!-- File field -->
                <div *ngIf="isFileField(field) && getFieldValue(field.name)" class="file-value">
                  <a [href]="getFieldValue(field.name)"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="file-link">
                    <mat-icon class="file-icon">attachment</mat-icon>
                    View File
                  </a>
                </div>

                <!-- Boolean field -->
                <div *ngIf="isBooleanField(field)" class="boolean-value">
                  <mat-icon [class]="getBooleanIcon(getFieldValue(field.name))">
                    {{ getBooleanIcon(getFieldValue(field.name)) }}
                  </mat-icon>
                  <span>{{ formatBooleanValue(getFieldValue(field.name)) }}</span>
                </div>

                <!-- Date/DateTime field -->
                <div *ngIf="isDateTimeField(field)" class="datetime-value">
                  <mat-icon class="datetime-icon">schedule</mat-icon>
                  <span>{{ formatDateTimeValue(getFieldValue(field.name)) }}</span>
                </div>

                <!-- Regular field -->
                <div *ngIf="!isFileField(field) && !isBooleanField(field) && !isDateTimeField(field)"
                     class="regular-value">
                  {{ formatCellValue(getFieldValue(field.name)) }}
                </div>

                <!-- Empty field -->
                <div *ngIf="!getFieldValue(field.name)" class="empty-value">
                  <mat-icon class="empty-icon">remove</mat-icon>
                  <span>No data</span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions class="detail-actions">
          <button mat-button (click)="onClose.emit()" class="close-btn">
            Close
          </button>
          <button mat-raised-button
                  color="primary"
                  (click)="onEdit.emit(record)"
                  class="edit-btn"
                  *ngIf="resource.canUpdate">
            <mat-icon>edit</mat-icon>
            Edit
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .detail-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .detail-card {
      width: 90vw;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .detail-header {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      position: relative;
      padding: 24px;
    }

    .detail-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .close-button {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
    }

    .detail-content {
      padding: 32px;
      background: #fafafa;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .detail-field {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }

    .detail-field:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .field-value {
      font-size: 16px;
      color: #495057;
      font-weight: 500;
    }

    .file-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #007bff;
      text-decoration: none;
      padding: 8px 16px;
      background: rgba(0, 123, 255, 0.1);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .file-link:hover {
      background: rgba(0, 123, 255, 0.2);
      transform: translateY(-1px);
    }

    .file-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .boolean-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .boolean-value mat-icon.true {
      color: #28a745;
    }

    .boolean-value mat-icon.false {
      color: #6c757d;
    }

    .datetime-value {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .datetime-icon {
      color: #6f42c1;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .regular-value {
      word-break: break-word;
    }

    .empty-value {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      font-style: italic;
    }

    .empty-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .detail-actions {
      padding: 24px 32px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .close-btn {
      color: #6c757d;
      border: 1px solid #ddd;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
    }

    .edit-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .detail-card {
        width: 95vw;
        margin: 10px;
      }

      .detail-content {
        padding: 20px;
      }

      .detail-actions {
        flex-direction: column;
      }

      .detail-actions button {
        width: 100%;
      }
    }
  `]
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
