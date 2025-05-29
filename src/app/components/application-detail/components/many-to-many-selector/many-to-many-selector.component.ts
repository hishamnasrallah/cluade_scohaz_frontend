// components/many-to-many-selector/many-to-many-selector.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { RelationOption } from '../../models/resource.model';

export interface ManyToManyData {
  fieldName: string;
  title: string;
  options: RelationOption[];
  selectedIds: any[];
  loading: boolean;
}

@Component({
  selector: 'app-many-to-many-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="many-to-many-dialog">
      <div class="dialog-header">
        <h2>Select {{ title }}</h2>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <!-- Search Filter -->
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search options</mat-label>
          <input matInput
                 [formControl]="searchControl"
                 placeholder="Type to search...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <!-- Selected Items Summary -->
        <div class="selected-summary" *ngIf="selectedItems.length > 0">
          <h4>Selected ({{ selectedItems.length }}):</h4>
          <mat-chip-set class="selected-chips">
            <mat-chip *ngFor="let item of selectedItems"
                      (removed)="toggleSelection(item.id)"
                      removable="true">
              {{ item.display }}
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-set>
        </div>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading options...</p>
        </div>

        <!-- Options List -->
        <div class="options-container" *ngIf="!loading">
          <div class="options-header">
            <span class="options-count">
              {{ filteredOptions.length }} option{{ filteredOptions.length !== 1 ? 's' : '' }} available
            </span>
            <div class="bulk-actions">
              <button mat-button
                      (click)="selectAll()"
                      [disabled]="filteredOptions.length === 0"
                      class="bulk-btn">
                <mat-icon>select_all</mat-icon>
                Select All
              </button>
              <button mat-button
                      (click)="deselectAll()"
                      [disabled]="selectedItems.length === 0"
                      class="bulk-btn">
                <mat-icon>deselect</mat-icon>
                Clear All
              </button>
            </div>
          </div>

          <mat-selection-list class="options-list" [multiple]="true">
            <mat-list-option
              *ngFor="let option of filteredOptions; trackBy: trackByOption"
              [selected]="isSelected(option.id)"
              (click)="toggleSelection(option.id)"
              class="option-item">

              <div class="option-content">
                <mat-checkbox
                  [checked]="isSelected(option.id)"
                  (change)="toggleSelection(option.id)"
                  (click)="$event.stopPropagation()"
                  class="option-checkbox">
                </mat-checkbox>
                <div class="option-text">
                  <span class="option-display">{{ option.display }}</span>
                  <span class="option-id">ID: {{ option.id }}</span>
                </div>
              </div>
            </mat-list-option>
          </mat-selection-list>

          <!-- No Options Message -->
          <div class="no-options" *ngIf="filteredOptions.length === 0 && !loading">
            <mat-icon class="no-options-icon">inbox</mat-icon>
            <p>No options available</p>
            <p class="no-options-subtitle" *ngIf="searchControl.value">
              Try adjusting your search terms
            </p>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          Cancel
        </button>
        <button mat-raised-button
                color="primary"
                (click)="onConfirm()"
                class="confirm-btn">
          <mat-icon>check</mat-icon>
          Confirm Selection ({{ selectedItems.length }})
        </button>
      </div>
    </div>
  `,
  styles: [`
    .many-to-many-dialog {
      width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      color: #666;
    }

    .dialog-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 16px 24px;
    }

    .search-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .selected-summary {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #bbdefb;
    }

    .selected-summary h4 {
      margin: 0 0 12px 0;
      color: #1565c0;
      font-size: 14px;
      font-weight: 600;
    }

    .selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .selected-chips mat-chip {
      background-color: #2196f3;
      color: white;
      font-size: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 14px;
    }

    .options-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .options-count {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .bulk-actions {
      display: flex;
      gap: 8px;
    }

    .bulk-btn {
      font-size: 12px;
      padding: 4px 12px;
      min-width: auto;
      height: 32px;
      color: #666;
    }

    .bulk-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .options-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      max-height: 300px;
    }

    .option-item {
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
    }

    .option-item:hover {
      background-color: #f8f9fa;
    }

    .option-item:last-child {
      border-bottom: none;
    }

    .option-content {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .option-checkbox {
      margin-right: 12px;
    }

    .option-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .option-display {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
    }

    .option-id {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .no-options {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
      text-align: center;
    }

    .no-options-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-options p {
      margin: 0;
      font-size: 16px;
    }

    .no-options-subtitle {
      font-size: 14px !important;
      margin-top: 8px !important;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      font-weight: 600;
    }

    .confirm-btn mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Scrollbar styling */
    .options-list::-webkit-scrollbar {
      width: 6px;
    }

    .options-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .options-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .options-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    @media (max-width: 768px) {
      .many-to-many-dialog {
        width: 95vw;
        max-height: 85vh;
      }

      .dialog-header,
      .dialog-content,
      .dialog-actions {
        padding-left: 16px;
        padding-right: 16px;
      }

      .options-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .bulk-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class ManyToManySelectorComponent implements OnInit {
  @Input() data!: ManyToManyData;
  @Output() onSelection = new EventEmitter<any[]>();
  @Output() onClose = new EventEmitter<void>();

  searchControl = new FormControl('');
  selectedIds: Set<any> = new Set();
  filteredOptions: RelationOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<ManyToManySelectorComponent>
  ) {}

  ngOnInit(): void {
    // Initialize selected IDs
    if (this.data.selectedIds) {
      this.selectedIds = new Set(this.data.selectedIds);
    }

    this.filteredOptions = [...this.data.options];

    // Setup search filter
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterOptions(searchTerm || '');
    });
  }

  get loading(): boolean {
    return this.data.loading;
  }

  get title(): string {
    return this.data.title || this.data.fieldName;
  }

  get selectedItems(): RelationOption[] {
    return this.data.options.filter(option => this.selectedIds.has(option.id));
  }

  private filterOptions(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredOptions = [...this.data.options];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredOptions = this.data.options.filter(option =>
      option.display.toLowerCase().includes(term) ||
      option.id.toString().toLowerCase().includes(term)
    );
  }

  isSelected(id: any): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelection(id: any): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  selectAll(): void {
    this.filteredOptions.forEach(option => {
      this.selectedIds.add(option.id);
    });
  }

  deselectAll(): void {
    this.selectedIds.clear();
  }

  trackByOption(index: number, option: RelationOption): any {
    return option.id;
  }

  onConfirm(): void {
    const selectedItems = Array.from(this.selectedIds);
    this.onSelection.emit(selectedItems);
    this.dialogRef.close(selectedItems);
  }

  onCancel(): void {
    this.onClose.emit();
    this.dialogRef.close();
  }
}
