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
  templateUrl: './many-to-many-selector.component.html',
  styleUrl: './many-to-many-selector.component.scss'
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
