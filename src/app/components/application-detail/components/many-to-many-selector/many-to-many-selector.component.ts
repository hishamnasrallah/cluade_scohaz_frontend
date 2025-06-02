// components/many-to-many-selector/many-to-many-selector.component.ts - ENHANCED PROFESSIONAL DESIGN
import { Component, Input, Output, EventEmitter, OnInit, Inject } from '@angular/core';
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
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

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
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="enhanced-selector-dialog">
      <!-- Modern Header with Gradient -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <mat-icon>link</mat-icon>
            </div>
            <div class="header-text">
              <h2 class="header-title">Select {{ title }}</h2>
              <p class="header-subtitle">Choose multiple items from the available options</p>
            </div>
          </div>
          <button mat-icon-button
                  (click)="onCancel()"
                  class="close-btn"
                  matTooltip="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar" [class.active]="loading"></div>
      </div>

      <!-- Enhanced Content Area -->
      <div class="dialog-content">
        <!-- Smart Search Section -->
        <div class="search-section">
          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search options</mat-label>
              <input matInput
                     [formControl]="searchControl"
                     placeholder="Type to filter options..."
                     autocomplete="off">
              <mat-icon matPrefix class="search-icon">search</mat-icon>
              <button mat-icon-button
                      matSuffix
                      *ngIf="searchControl.value"
                      (click)="clearSearch()"
                      matTooltip="Clear search">
                <mat-icon>clear</mat-icon>
              </button>
            </mat-form-field>

            <!-- Live Search Stats -->
            <div class="search-stats">
              <span class="stats-text">
                Showing {{ filteredOptions.length }} of {{ data?.options?.length || 0 }} options
              </span>
            </div>
          </div>
        </div>

        <!-- Selected Items Preview -->
        <div class="selection-preview" *ngIf="selectedItems.length > 0">
          <div class="preview-header">
            <div class="preview-info">
              <mat-icon class="preview-icon">playlist_add_check</mat-icon>
              <h4 class="preview-title">
                Selected Items ({{ selectedItems.length }})
              </h4>
            </div>
            <button mat-button
                    class="clear-all-btn"
                    (click)="deselectAll()"
                    matTooltip="Clear all selections">
              <mat-icon>clear_all</mat-icon>
              Clear All
            </button>
          </div>

          <div class="selected-chips-container">
            <mat-chip-set class="selected-chips" multiple>
              <mat-chip *ngFor="let item of selectedItems; trackBy: trackByItem"
                        (removed)="toggleSelection(item.id)"
                        removable="true"
                        class="selected-chip">
                <div class="chip-content">
                  <span class="chip-text">{{ item.display }}</span>
                  <span class="chip-id">{{ item.id }}</span>
                </div>
                <mat-icon matChipRemove>cancel</mat-icon>
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <!-- Enhanced Loading State -->
        <div class="loading-container" *ngIf="loading">
          <div class="loading-animation">
            <mat-spinner diameter="48"></mat-spinner>
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
          <h3 class="loading-title">Loading Options</h3>
          <p class="loading-subtitle">Please wait while we fetch the available options...</p>
        </div>

        <!-- Enhanced Options List -->
        <div class="options-container" *ngIf="!loading">
          <!-- Smart Header Controls -->
          <div class="options-header">
            <div class="options-info">
              <div class="options-count">
                <mat-icon class="count-icon">list</mat-icon>
                <span class="count-text">{{ filteredOptions.length }} option{{ filteredOptions.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>

            <div class="bulk-actions">
              <button mat-button
                      (click)="selectAll()"
                      [disabled]="filteredOptions.length === 0 || areAllSelected()"
                      class="bulk-btn select-all-btn"
                      matTooltip="Select all visible options">
                <mat-icon>select_all</mat-icon>
                Select All
              </button>
              <button mat-button
                      (click)="deselectAll()"
                      [disabled]="selectedItems.length === 0"
                      class="bulk-btn deselect-btn"
                      matTooltip="Clear all selections">
                <mat-icon>deselect</mat-icon>
                Clear All
              </button>
            </div>
          </div>

          <!-- Professional Options List -->
          <div class="options-list-wrapper" *ngIf="filteredOptions.length > 0">
            <mat-selection-list class="options-list" [multiple]="true">
              <mat-list-option
                *ngFor="let option of filteredOptions; trackBy: trackByOption; let i = index"
                [selected]="isSelected(option.id)"
                (click)="toggleSelection(option.id)"
                class="option-item"
                [class.selected-item]="isSelected(option.id)">

                <div class="option-content">
                  <div class="option-checkbox">
                    <mat-checkbox
                      [checked]="isSelected(option.id)"
                      (change)="toggleSelection(option.id)"
                      (click)="$event.stopPropagation()"
                      class="checkbox-control">
                    </mat-checkbox>
                  </div>

                  <div class="option-info">
                    <div class="option-main">
                      <span class="option-display">{{ option.display }}</span>
                      <span class="option-badge">ID: {{ option.id }}</span>
                    </div>
                  </div>

                  <div class="option-actions">
                    <mat-icon class="selection-indicator"
                             [class.selected]="isSelected(option.id)">
                      {{ isSelected(option.id) ? 'check_circle' : 'radio_button_unchecked' }}
                    </mat-icon>
                  </div>
                </div>
              </mat-list-option>
            </mat-selection-list>
          </div>

          <!-- Enhanced Empty State -->
          <div class="empty-options" *ngIf="filteredOptions.length === 0 && !loading">
            <div class="empty-content">
              <div class="empty-icon-wrapper">
                <mat-icon class="empty-icon">{{ searchControl.value ? 'search_off' : 'inbox' }}</mat-icon>
              </div>

              <h3 class="empty-title">
                {{ searchControl.value ? 'No Matching Options' : 'No Options Available' }}
              </h3>

              <p class="empty-message">
                <span *ngIf="!searchControl.value">
                  No {{ title.toLowerCase() }} options are currently available in the system.
                </span>
                <span *ngIf="searchControl.value">
                  No options match your search term "<strong>{{ searchControl.value }}</strong>".
                  <br>Try adjusting your search or clear the filter.
                </span>
              </p>

              <div class="empty-actions">
                <button mat-button
                        *ngIf="searchControl.value"
                        (click)="clearSearch()"
                        class="clear-search-btn">
                  <mat-icon>clear</mat-icon>
                  Clear Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Action Footer -->
      <div class="dialog-footer">
        <div class="footer-info">
          <div class="selection-summary">
            <mat-icon class="summary-icon">info</mat-icon>
            <span class="summary-text">
              {{ selectedItems.length }} of {{ data?.options?.length || 0 }} items selected
            </span>
          </div>
        </div>

        <div class="footer-actions">
          <button mat-button
                  (click)="onCancel()"
                  class="cancel-btn">
            <mat-icon>close</mat-icon>
            Cancel
          </button>

          <button mat-raised-button
                  color="primary"
                  (click)="onConfirm()"
                  class="confirm-btn"
                  [disabled]="selectedItems.length === 0">
            <mat-icon>check</mat-icon>
            Confirm Selection
            <span class="selection-count" *ngIf="selectedItems.length > 0">
              ({{ selectedItems.length }})
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './many-to-many-selector.component.scss'
})
export class ManyToManySelectorComponent implements OnInit {
  searchControl = new FormControl('');
  selectedIds: Set<any> = new Set();
  filteredOptions: RelationOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<ManyToManySelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ManyToManyData
  ) {
    console.log('🔍 DEBUG: ManyToMany dialog data:', data);
  }

  ngOnInit(): void {
    console.log('🔍 DEBUG: ManyToMany ngOnInit - data:', this.data);
    console.log('🔍 DEBUG: ManyToMany options:', this.data.options);
    console.log('🔍 DEBUG: ManyToMany selectedIds:', this.data.selectedIds);

    // Initialize selected IDs
    if (this.data.selectedIds && Array.isArray(this.data.selectedIds)) {
      this.selectedIds = new Set(this.data.selectedIds);
    }

    // Initialize filtered options
    this.filteredOptions = [...(this.data.options || [])];
    console.log('🔍 DEBUG: Initial filteredOptions:', this.filteredOptions);

    // Setup search filter
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterOptions(searchTerm || '');
    });
  }

  get loading(): boolean {
    return this.data?.loading || false;
  }

  get title(): string {
    return this.data?.title || this.data?.fieldName || 'Select Items';
  }

  get selectedItems(): RelationOption[] {
    const options = this.data?.options || [];
    return options.filter(option => this.selectedIds.has(option.id));
  }

  private filterOptions(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredOptions = [...(this.data.options || [])];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredOptions = (this.data.options || []).filter(option =>
      option.display.toLowerCase().includes(term) ||
      option.id.toString().toLowerCase().includes(term)
    );
  }

  isSelected(id: any): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelection(id: any): void {
    console.log('🔍 DEBUG: Toggling selection for ID:', id);
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      console.log('🔍 DEBUG: Removed ID:', id);
    } else {
      this.selectedIds.add(id);
      console.log('🔍 DEBUG: Added ID:', id);
    }
    console.log('🔍 DEBUG: Current selected IDs:', Array.from(this.selectedIds));
  }

  selectAll(): void {
    this.filteredOptions.forEach(option => {
      this.selectedIds.add(option.id);
    });
    console.log('🔍 DEBUG: Selected all, current IDs:', Array.from(this.selectedIds));
  }

  deselectAll(): void {
    this.selectedIds.clear();
    console.log('🔍 DEBUG: Deselected all');
  }

  areAllSelected(): boolean {
    return this.filteredOptions.length > 0 &&
      this.filteredOptions.every(option => this.selectedIds.has(option.id));
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  trackByOption(index: number, option: RelationOption): any {
    return option.id;
  }

  trackByItem(index: number, item: RelationOption): any {
    return item.id;
  }

  onConfirm(): void {
    const selectedItems = Array.from(this.selectedIds);
    console.log('🔍 DEBUG: Confirming selection:', selectedItems);
    this.dialogRef.close(selectedItems);
  }

  onCancel(): void {
    console.log('🔍 DEBUG: Cancelling selection');
    this.dialogRef.close();
  }
}
