// components/resource-table/resource-table.component.ts - ENHANCED Professional Data Table
import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import {MatChip, MatChipSet, MatChipsModule} from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

import { Resource, TableData } from '../../models/resource.model';
import { DataFormatterService } from '../../services/data-formatter.service';
import { FormBuilderService } from '../../services/form-builder.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';
import {MatDivider} from '@angular/material/divider';
import { MatChipOption } from '@angular/material/chips';

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
    MatProgressSpinnerModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatBadgeModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDivider,
    MatChipsModule,
    MatChip,
    MatChipSet,
    MatChipOption
  ],
  template: `
    <div class="table-container">
      <!-- Enhanced Table Header -->
      <div class="table-header">
        <div class="header-main">
          <div class="table-info">
            <h3 class="table-title">
              {{ formatColumnName(resource.name) }}
              <mat-icon class="title-icon">{{ getResourceIcon() }}</mat-icon>
            </h3>
            <p class="table-subtitle">
              {{ getTableDescription() }}
            </p>
          </div>

          <div class="table-actions">
            <!-- Bulk Actions -->
            <div class="bulk-actions" *ngIf="selection.hasValue()">
              <button mat-button
                      [matMenuTriggerFor]="bulkMenu"
                      class="bulk-btn">
                <mat-icon>checklist</mat-icon>
                <span>{{ selection.selected.length }} selected</span>
                <mat-icon>expand_more</mat-icon>
              </button>

              <mat-menu #bulkMenu="matMenu">
                <button mat-menu-item (click)="bulkDelete()" class="bulk-delete">
                  <mat-icon>delete</mat-icon>
                  <span>Delete Selected</span>
                </button>
                <button mat-menu-item (click)="bulkExport()">
                  <mat-icon>download</mat-icon>
                  <span>Export Selected</span>
                </button>
                <button mat-menu-item (click)="deselectAll()">
                  <mat-icon>clear</mat-icon>
                  <span>Clear Selection</span>
                </button>
              </mat-menu>
            </div>

            <!-- Primary Actions -->
            <button mat-button
                    (click)="onRefresh.emit()"
                    class="refresh-btn"
                    matTooltip="Refresh Data">
              <mat-icon [class.spinning]="loading">refresh</mat-icon>
              <span class="btn-text">Refresh</span>
            </button>

            <button mat-raised-button
                    color="primary"
                    *ngIf="resource.canCreate"
                    (click)="onCreateNew()"
                    class="create-btn">
              <mat-icon>add</mat-icon>
              <span>Add {{ formatColumnName(resource.name) }}</span>
            </button>
          </div>
        </div>

        <!-- Enhanced Search and Filters -->
        <div class="table-controls">
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search {{ formatColumnName(resource.name) }}</mat-label>
              <input matInput
                     (keyup)="applyFilter($event)"
                     placeholder="Type to search..."
                     #searchInput>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="filter-section">
            <mat-form-field appearance="outline" class="page-size-field">
              <mat-label>Show</mat-label>
              <mat-select [value]="pageSize" (selectionChange)="updatePageSize($event.value)">
                <mat-option [value]="5">5 per page</mat-option>
                <mat-option [value]="10">10 per page</mat-option>
                <mat-option [value]="25">25 per page</mat-option>
                <mat-option [value]="50">50 per page</mat-option>
                <mat-option [value]="100">100 per page</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button
                    [matMenuTriggerFor]="filterMenu"
                    class="filter-btn">
              <mat-icon>filter_list</mat-icon>
              <span>Filters</span>
              <span *ngIf="activeFilters > 0"
                    [matBadge]="activeFilters"
                    matBadgeSize="small"
                    matBadgeColor="accent"
                    matBadgeOverlap="false"
                    class="badge-indicator">
              </span>

            </button>

            <mat-menu #filterMenu="matMenu" class="filter-menu">
              <div class="filter-content" (click)="$event.stopPropagation()">
                <h4>Filter Options</h4>
                <div class="filter-chips">
                  <mat-chip-set multiple>
                    <mat-chip-option *ngFor="let filter of availableFilters"
                                     [selected]="filter.active"
                                     (click)="toggleFilter(filter)">
                      {{ filter.label }}
                    </mat-chip-option>
                  </mat-chip-set>


                </div>
                <div class="filter-actions">
                  <button mat-button (click)="clearAllFilters()">Clear All</button>
                  <button mat-button color="primary" (click)="applyFilters()">Apply</button>
                </div>
              </div>
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="loading-text">Loading {{ formatColumnName(resource.name) }}...</p>
        </div>
      </div>

      <!-- Enhanced Data Table -->
      <div class="table-wrapper" *ngIf="!loading">
        <table mat-table
               [dataSource]="dataSource"
               matSort
               class="resource-table"
               multiTemplateDataRows>

          <!-- Selection Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef class="select-header">
              <mat-checkbox (change)="$event ? toggleAllRows() : null"
                            [checked]="selection.hasValue() && isAllSelected()"
                            [indeterminate]="selection.hasValue() && !isAllSelected()"
                            [aria-label]="checkboxLabel()"
                            class="select-all-checkbox">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" class="select-cell">
              <mat-checkbox (click)="$event.stopPropagation()"
                            (change)="$event ? selection.toggle(row) : null"
                            [checked]="selection.isSelected(row)"
                            [aria-label]="checkboxLabel(row)"
                            class="row-checkbox">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Dynamic Data Columns -->
          <ng-container *ngFor="let col of displayColumns" [matColumnDef]="col">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="data-header">
              <div class="header-content">
                <span class="header-label">{{ formatColumnName(col) }}</span>
                <mat-icon class="header-icon"
                          *ngIf="getFieldType(col)"
                          [matTooltip]="getFieldTypeTooltip(col)">
                  {{ getFieldTypeIcon(col) }}
                </mat-icon>
              </div>
            </th>
            <td mat-cell *matCellDef="let element" class="data-cell" [attr.data-label]="formatColumnName(col)">
              <div class="cell-content">
                <!-- File field -->
                <div *ngIf="getFieldType(col) === 'FileField' && element[col]" class="file-cell">
                  <a [href]="element[col]"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="file-link">
                    <mat-icon class="file-icon">attachment</mat-icon>
                    <span class="file-text">View File</span>
                  </a>
                </div>

                <!-- Boolean field -->
                <div *ngIf="isBooleanField(col)" class="boolean-cell">
                  <mat-icon [class]="getBooleanClass(element[col])">
                    {{ getBooleanIcon(element[col]) }}
                  </mat-icon>
                  <span class="boolean-text">{{ formatBooleanValue(element[col]) }}</span>
                </div>

                <!-- Date/DateTime field -->
                <div *ngIf="isDateTimeField(col)" class="datetime-cell">
                  <mat-icon class="datetime-icon">schedule</mat-icon>
                  <div class="datetime-content">
                    <span class="datetime-value">{{ formatDateTimeValue(element[col]) }}</span>
                    <span class="datetime-relative">{{ getRelativeTime(element[col]) }}</span>
                  </div>
                </div>

                <!-- Status/Badge field -->
                <div *ngIf="isStatusField(col)" class="status-cell">
                  <mat-chip [class]="getStatusClass(element[col])">
                    {{ element[col] }}
                  </mat-chip>
                </div>

                <!-- Email field -->
                <div *ngIf="isEmailField(col)" class="email-cell">
                  <a [href]="'mailto:' + element[col]" class="email-link">
                    <mat-icon class="email-icon">email</mat-icon>
                    <span>{{ element[col] }}</span>
                  </a>
                </div>

                <!-- URL field -->
                <div *ngIf="isUrlField(col)" class="url-cell">
                  <a [href]="element[col]" target="_blank" rel="noopener noreferrer" class="url-link">
                    <mat-icon class="url-icon">link</mat-icon>
                    <span>{{ formatUrl(element[col]) }}</span>
                  </a>
                </div>

                <!-- Regular field -->
                <div *ngIf="!getFieldType(col) && !isSpecialField(col)" class="regular-cell">
                  <span class="cell-value" [title]="formatCellValue(element[col])">
                    {{ truncateText(formatCellValue(element[col]), 50) }}
                  </span>
                </div>

                <!-- Empty field -->
                <div *ngIf="!element[col] && element[col] !== 0 && element[col] !== false" class="empty-cell">
                  <mat-icon class="empty-icon">remove</mat-icon>
                  <span class="empty-text">No data</span>
                </div>
              </div>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">
              <span>Actions</span>
            </th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <div class="action-buttons">
                <button mat-icon-button
                        *ngIf="resource.canRead"
                        (click)="onView.emit(element); $event.stopPropagation()"
                        matTooltip="View Details"
                        class="action-btn view-btn">
                  <mat-icon>visibility</mat-icon>
                </button>

                <button mat-icon-button
                        *ngIf="resource.canUpdate"
                        (click)="onEdit.emit(element); $event.stopPropagation()"
                        matTooltip="Edit Record"
                        class="action-btn edit-btn">
                  <mat-icon>edit</mat-icon>
                </button>

                <button mat-icon-button
                        *ngIf="resource.canDelete"
                        (click)="confirmDelete(element); $event.stopPropagation()"
                        matTooltip="Delete Record"
                        class="action-btn delete-btn">
                  <mat-icon>delete</mat-icon>
                </button>

                <button mat-icon-button
                        [matMenuTriggerFor]="rowMenu"
                        matTooltip="More Actions"
                        class="action-btn more-btn">
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #rowMenu="matMenu">
                  <button mat-menu-item (click)="duplicateRecord(element)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicate</span>
                  </button>
                  <button mat-menu-item (click)="exportRecord(element)">
                    <mat-icon>download</mat-icon>
                    <span>Export</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="viewHistory(element)">
                    <mat-icon>history</mat-icon>
                    <span>View History</span>
                  </button>
                </mat-menu>
              </div>
            </td>
          </ng-container>

          <!-- Table Headers and Rows -->
          <tr mat-header-row *matHeaderRowDef="allColumns; sticky: true" class="table-header-row"></tr>
          <tr mat-row
              *matRowDef="let row; columns: allColumns;"
              class="table-row"
              [class.selected]="selection.isSelected(row)"
              (click)="selectRow(row)"></tr>
        </table>

        <!-- Enhanced Paginator -->
        <mat-paginator #paginator
                       [pageSizeOptions]="[5, 10, 25, 50, 100]"
                       [pageSize]="pageSize"
                       [showFirstLastButtons]="true"
                       class="table-paginator">
        </mat-paginator>
      </div>

      <!-- Enhanced Empty State -->
      <div class="empty-state" *ngIf="!loading && (!data || data.length === 0)">
        <div class="empty-container">
          <div class="empty-animation">
            <div class="empty-icon-wrapper">
              <mat-icon class="empty-icon">{{ getEmptyStateIcon() }}</mat-icon>
            </div>
            <div class="empty-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>

          <h3 class="empty-title">{{ getEmptyStateTitle() }}</h3>
          <p class="empty-subtitle">{{ getEmptyStateMessage() }}</p>

          <div class="empty-actions">
            <button mat-raised-button
                    color="primary"
                    *ngIf="resource.canCreate"
                    (click)="onCreateNew()"
                    class="create-first-btn">
              <mat-icon>add</mat-icon>
              Create First {{ formatColumnName(resource.name) }}
            </button>

            <button mat-button
                    (click)="onRefresh.emit()"
                    class="refresh-empty-btn">
              <mat-icon>refresh</mat-icon>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- Table Stats Footer -->
      <div class="table-footer" *ngIf="!loading && data && data.length > 0">
        <div class="footer-content">
          <div class="stats-info">
            <span class="record-count">
              {{ getRecordCountText() }}
            </span>
            <span class="last-updated" *ngIf="lastUpdated">
              Last updated: {{ formatLastUpdated(lastUpdated) }}
            </span>
          </div>

          <div class="footer-actions">
            <button mat-button class="export-all-btn" (click)="exportAll()">
              <mat-icon>download</mat-icon>
              Export All
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Enhanced Table Header */
    .table-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid #e2e8f0;
      padding: 24px 32px;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      gap: 32px;
    }

    .table-info {
      flex: 1;
      min-width: 0;
    }

    .table-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .table-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .bulk-actions {
      display: flex;
      align-items: center;
    }

    .bulk-btn {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      font-weight: 600;
      height: 40px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }

    .refresh-btn {
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      font-weight: 600;
      height: 40px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(34, 197, 94, 0.1);
        border-color: #22c55e;
      }

      .spinning {
        animation: spin 1s linear infinite;
      }
    }

    .create-btn {
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      font-weight: 600;
      padding: 0 20px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      mat-icon {
        margin-right: 8px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* Table Controls */
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .search-section {
      flex: 1;
      max-width: 400px;
    }

    .search-field {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: white;
          border-radius: 10px;
        }

        .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #e2e8f0;
          }
        }

        &:hover .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #667eea;
          }
        }
      }
    }

    .filter-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-size-field {
      width: 140px;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: white;
        border-radius: 10px;
      }
    }

    .filter-btn {
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #64748b;
      font-weight: 500;
      padding: 0 16px;
      position: relative;

      &:hover {
        background: rgba(102, 126, 234, 0.08);
        border-color: #667eea;
        color: #667eea;
      }
    }

    /* Loading Overlay */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .loading-content {
      text-align: center;
    }

    .loading-text {
      margin-top: 16px;
      color: #64748b;
      font-weight: 500;
    }

    /* Enhanced Table */
    .table-wrapper {
      flex: 1;
      overflow: auto;
      position: relative;
    }

    .resource-table {
      width: 100%;
      background: white;

      .mat-mdc-header-row {
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
      }

      .mat-mdc-row {
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          background: rgba(102, 126, 234, 0.04);
          transform: scale(1.01);
        }

        &.selected {
          background: rgba(102, 126, 234, 0.08);
        }
      }
    }

    /* Table Headers */
    .select-header,
    .data-header,
    .actions-header {
      font-weight: 600;
      color: #475569;
      padding: 16px 20px;
      border-bottom: 2px solid #e2e8f0;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .header-label {
      font-weight: 600;
    }

    .header-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    /* Table Cells */
    .select-cell,
    .data-cell,
    .actions-cell {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }

    .cell-content {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 24px;
    }

    /* Specialized Cell Types */
    .file-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #667eea;
      text-decoration: none;
      padding: 6px 12px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.2);
        transform: translateY(-1px);
      }
    }

    .file-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .boolean-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;

        &.boolean-true {
          color: #22c55e;
        }

        &.boolean-false {
          color: #94a3b8;
        }
      }
    }

    .datetime-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .datetime-icon {
      color: #8b5cf6;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .datetime-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .datetime-value {
      font-size: 0.9rem;
      color: #334155;
      font-weight: 500;
    }

    .datetime-relative {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .status-cell {
      mat-chip {
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 12px;
        height: 24px;

        &.status-active {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        &.status-inactive {
          background: rgba(148, 163, 184, 0.1);
          color: #64748b;
        }

        &.status-pending {
          background: rgba(249, 115, 22, 0.1);
          color: #ea580c;
        }
      }
    }

    .email-cell {
      .email-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #667eea;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .email-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .url-cell {
      .url-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #667eea;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }

      .url-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .regular-cell {
      .cell-value {
        color: #334155;
        font-weight: 500;
      }
    }

    .empty-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
      font-style: italic;
      font-size: 0.85rem;
    }

    .empty-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      transition: all 0.2s ease;

      &.view-btn:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &.edit-btn:hover {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &.delete-btn:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      &.more-btn:hover {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* Enhanced Empty State */
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 60px 40px;
      background: #f8fafc;
    }

    .empty-container {
      text-align: center;
      max-width: 400px;
    }

    .empty-animation {
      position: relative;
      margin-bottom: 32px;
    }

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      animation: emptyFloat 3s ease-in-out infinite;
    }

    .empty-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #94a3b8;
    }

    .empty-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #cbd5e1;
      border-radius: 50%;
      animation: emptyDots 1.5s infinite;

      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.5s; }
      &:nth-child(3) { animation-delay: 1s; }
    }

    @keyframes emptyFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes emptyDots {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 12px 0;
    }

    .empty-subtitle {
      color: #64748b;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .create-first-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      height: 48px;
      padding: 0 24px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    .refresh-empty-btn {
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-weight: 600;
      height: 48px;
      padding: 0 24px;

      &:hover {
        background: rgba(248, 250, 252, 0.8);
        border-color: #cbd5e1;
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    /* Table Footer */
    .table-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px 24px;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .stats-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .record-count {
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;
    }

    .last-updated {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .export-all-btn {
      color: #667eea;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: rgba(102, 126, 234, 0.08);
      }
    }

    /* Enhanced Paginator */
    ::ng-deep .table-paginator {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;

      .mat-mdc-paginator-container {
        padding: 12px 24px;
      }

      .mat-mdc-paginator-range-label {
        color: #64748b;
        font-weight: 500;
      }

      .mat-mdc-icon-button {
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }
      }
    }

    /* Menu Styling */
    ::ng-deep .filter-menu,
    ::ng-deep .mat-mdc-menu-panel {
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

      .mat-mdc-menu-content {
        padding: 16px;
      }

      .mat-mdc-menu-item {
        border-radius: 8px;
        margin-bottom: 4px;
        font-weight: 500;

        &:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
        }

        &.bulk-delete:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
        }
      }
    }

    .filter-content {
      min-width: 250px;
      padding: 16px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 1rem;
        font-weight: 600;
        color: #334155;
      }
    }

    .filter-chips {
      margin-bottom: 16px;

      mat-chip {
        margin: 4px;
        font-size: 0.8rem;
        border-radius: 16px;

        &[selected] {
          background: #667eea;
          color: white;
        }
      }
    }

    .filter-actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;

      button {
        flex: 1;
        height: 36px;
        border-radius: 8px;
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .table-header {
        padding: 20px 24px;
      }

      .header-main {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .table-actions {
        justify-content: center;
      }

      .table-controls {
        flex-direction: column;
        gap: 16px;
      }

      .search-section {
        max-width: none;
      }
    }

    @media (max-width: 768px) {
      .table-header {
        padding: 16px 20px;
      }

      .select-cell,
      .data-cell,
      .actions-cell {
        padding: 12px 16px;
      }

      .table-wrapper {
        overflow-x: auto;
      }

      .resource-table {
        min-width: 600px;
      }

      .empty-state {
        padding: 40px 20px;
      }

      .empty-actions {
        flex-direction: column;
        align-items: center;
      }

      .create-first-btn,
      .refresh-empty-btn {
        width: 100%;
        max-width: 280px;
      }
    }

    @media (max-width: 480px) {
      .table-header {
        padding: 12px 16px;
      }

      .table-title {
        font-size: 1.25rem;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      .create-btn,
      .refresh-btn,
      .bulk-btn {
        width: 100%;
        justify-content: center;
      }

      .btn-text {
        display: inline;
      }

      .footer-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }

    /* Utility Classes */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }
  `]
})
export class ResourceTableComponent implements OnInit {
  @Input() resource!: Resource;
  @Input() data: TableData[] = [];
  @Input() loading = false;

  @Output() onCreate = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onView = new EventEmitter<TableData>();
  @Output() onEdit = new EventEmitter<TableData>();
  @Output() onDelete = new EventEmitter<TableData>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<TableData>();
  selection = new SelectionModel<TableData>(true, []);

  pageSize = 10;
  activeFilters = 0;
  availableFilters: any[] = [];
  lastUpdated?: Date;

  constructor(
    private dataFormatter: DataFormatterService,
    private formBuilder: FormBuilderService
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.data;
    this.lastUpdated = new Date();
    this.initializeFilters();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(): void {
    this.dataSource.data = this.data;
    this.lastUpdated = new Date();
    this.selection.clear();
  }

  // Enhanced UI Methods
  getResourceIcon(): string {
    const typeIcons: { [key: string]: string } = {
      'user': 'person',
      'users': 'group',
      'product': 'inventory',
      'products': 'inventory',
      'order': 'receipt',
      'orders': 'receipt',
      'payment': 'payment',
      'payments': 'payment',
      'category': 'category',
      'categories': 'category',
      'file': 'folder',
      'files': 'folder',
      'setting': 'settings',
      'settings': 'settings',
      'log': 'description',
      'logs': 'description'
    };

    return typeIcons[this.resource.name.toLowerCase()] || 'storage';
  }

  getTableDescription(): string {
    const count = this.data?.length || 0;
    const capabilities = [];
    if (this.resource.canCreate) capabilities.push('Create');
    if (this.resource.canRead) capabilities.push('Read');
    if (this.resource.canUpdate) capabilities.push('Update');
    if (this.resource.canDelete) capabilities.push('Delete');

    return `${count} record${count !== 1 ? 's' : ''} • ${capabilities.join(', ')} operations available`;
  }

  getEmptyStateIcon(): string {
    return this.data?.length === 0 ? 'inbox' : 'search_off';
  }

  getEmptyStateTitle(): string {
    return this.data?.length === 0 ?
      `No ${this.formatColumnName(this.resource.name)} Found` :
      'No Results Found';
  }

  getEmptyStateMessage(): string {
    return this.data?.length === 0 ?
      `There are no ${this.resource.name.toLowerCase()} records in the system yet. Create your first record to get started.` :
      'Try adjusting your search criteria or filters to find what you\'re looking for.';
  }

  getRecordCountText(): string {
    const total = this.data?.length || 0;
    const filtered = this.dataSource.filteredData?.length || 0;

    if (total === filtered) {
      return `${total} record${total !== 1 ? 's' : ''} total`;
    } else {
      return `${filtered} of ${total} record${total !== 1 ? 's' : ''} shown`;
    }
  }

  // Table functionality
  get displayColumns(): string[] {
    return this.formBuilder.getTableColumns(this.resource, this.data);
  }

  get allColumns(): string[] {
    return ['select', ...this.displayColumns, 'actions'];
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updatePageSize(newSize: number): void {
    this.pageSize = newSize;
    if (this.paginator) {
      this.paginator.pageSize = newSize;
    }
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  selectRow(row: TableData): void {
    this.selection.toggle(row);
  }

  deselectAll(): void {
    this.selection.clear();
  }

  checkboxLabel(row?: TableData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  // Field type detection and formatting
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

  getFieldTypeIcon(columnName: string): string {
    const fieldType = this.getFieldType(columnName);
    const iconMap: { [key: string]: string } = {
      'CharField': 'text_fields',
      'TextField': 'subject',
      'IntegerField': 'numbers',
      'DecimalField': 'calculate',
      'BooleanField': 'toggle_on',
      'DateField': 'event',
      'DateTimeField': 'schedule',
      'EmailField': 'email',
      'URLField': 'link',
      'FileField': 'attachment',
      'ImageField': 'image',
      'ForeignKey': 'link',
      'ManyToManyField': 'hub'
    };
    return iconMap[fieldType || ''] || 'text_fields';
  }

  getFieldTypeTooltip(columnName: string): string {
    const fieldType = this.getFieldType(columnName);
    return fieldType ? `Field Type: ${fieldType}` : '';
  }

  isSpecialField(columnName: string): boolean {
    return this.isBooleanField(columnName) ||
      this.isDateTimeField(columnName) ||
      this.isStatusField(columnName) ||
      this.isEmailField(columnName) ||
      this.isUrlField(columnName) ||
      (this.getFieldType(columnName) === 'FileField');
  }

  isBooleanField(columnName: string): boolean {
    const fieldType = this.getFieldType(columnName);
    return fieldType === 'BooleanField' || fieldType === 'NullBooleanField';
  }

  isDateTimeField(columnName: string): boolean {
    const fieldType = this.getFieldType(columnName);
    return fieldType === 'DateTimeField' || fieldType === 'DateField';
  }

  isStatusField(columnName: string): boolean {
    return columnName.toLowerCase().includes('status') ||
      columnName.toLowerCase().includes('state');
  }

  isEmailField(columnName: string): boolean {
    return this.getFieldType(columnName) === 'EmailField' ||
      columnName.toLowerCase().includes('email');
  }

  isUrlField(columnName: string): boolean {
    return this.getFieldType(columnName) === 'URLField' ||
      columnName.toLowerCase().includes('url') ||
      columnName.toLowerCase().includes('link');
  }

  getBooleanIcon(value: any): string {
    return value ? 'check_circle' : 'cancel';
  }

  getBooleanClass(value: any): string {
    return value ? 'boolean-true' : 'boolean-false';
  }

  formatBooleanValue(value: any): string {
    return value ? 'Yes' : 'No';
  }

  formatDateTimeValue(value: any): string {
    if (!value) return 'No date';
    try {
      const date = new Date(value);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
      return String(value);
    }
  }

  getRelativeTime(value: any): string {
    if (!value) return '';
    try {
      const date = new Date(value);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return '';
    }
  }

  getStatusClass(value: any): string {
    if (!value) return '';
    const status = value.toString().toLowerCase();
    if (status.includes('active') || status.includes('enabled') || status.includes('success')) {
      return 'status-active';
    }
    if (status.includes('inactive') || status.includes('disabled') || status.includes('failed')) {
      return 'status-inactive';
    }
    if (status.includes('pending') || status.includes('processing')) {
      return 'status-pending';
    }
    return '';
  }

  formatUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  formatLastUpdated(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  // Action methods
  onCreateNew(): void {
    this.onCreate.emit();
  }

  confirmDelete(element: TableData): void {
    const confirmed = confirm(`Are you sure you want to delete this ${this.resource.name}? This action cannot be undone.`);
    if (confirmed) {
      this.onDelete.emit(element);
    }
  }

  bulkDelete(): void {
    const selectedCount = this.selection.selected.length;
    const confirmed = confirm(`Are you sure you want to delete ${selectedCount} selected record${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`);

    if (confirmed) {
      // Emit bulk delete for each selected item
      this.selection.selected.forEach(item => {
        this.onDelete.emit(item);
      });
      this.selection.clear();
    }
  }

  bulkExport(): void {
    console.log('Bulk export:', this.selection.selected);
    // Implementation for bulk export
  }

  duplicateRecord(element: TableData): void {
    console.log('Duplicate record:', element);
    // Implementation for duplicating record
  }

  exportRecord(element: TableData): void {
    console.log('Export record:', element);
    // Implementation for exporting single record
  }

  exportAll(): void {
    console.log('Export all records');
    // Implementation for exporting all data
  }

  viewHistory(element: TableData): void {
    console.log('View history:', element);
    // Implementation for viewing record history
  }

  // Filter methods
  initializeFilters(): void {
    this.availableFilters = [
      { id: 'recent', label: 'Recent', active: false },
      { id: 'active', label: 'Active', active: false },
      { id: 'inactive', label: 'Inactive', active: false }
    ];
  }

  toggleFilter(filter: any): void {
    filter.active = !filter.active;
    this.updateActiveFiltersCount();
  }

  updateActiveFiltersCount(): void {
    this.activeFilters = this.availableFilters.filter(f => f.active).length;
  }

  clearAllFilters(): void {
    this.availableFilters.forEach(f => f.active = false);
    this.updateActiveFiltersCount();
  }

  applyFilters(): void {
    // Implementation for applying filters
    console.log('Apply filters:', this.availableFilters.filter(f => f.active));
  }
}
