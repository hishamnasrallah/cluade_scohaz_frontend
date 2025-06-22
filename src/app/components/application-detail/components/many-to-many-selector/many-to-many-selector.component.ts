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
import { MatExpansionModule } from '@angular/material/expansion';

import { RelationOption } from '../../models/resource.model';
import {MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelTitle} from '@angular/material/expansion';

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
    MatDividerModule,
    MatExpansionPanelTitle,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionModule
  ],
  templateUrl:'many-to-many-selector.component.html',
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
