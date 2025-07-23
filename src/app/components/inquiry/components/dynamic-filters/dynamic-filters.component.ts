// src/app/components/inquiry/components/dynamic-filters/dynamic-filters.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DynamicFilter } from '../../../../models/inquiry-execution.models';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-dynamic-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslatePipe
  ],
  templateUrl: './dynamic-filters.component.html',
  styleUrls: ['./dynamic-filters.component.scss']
})
export class DynamicFiltersComponent implements OnInit {
  @Input() filters: DynamicFilter[] = [];
  @Input() currentValues: Record<string, any> = {};
  @Output() filterChange = new EventEmitter<Record<string, any>>();
  @Output() clearFilters = new EventEmitter<void>();

  filterValues: Record<string, any> = {};
  showAdvanced = false;
  visibleFilters: DynamicFilter[] = [];
  advancedFilters: DynamicFilter[] = [];

  ngOnInit(): void {
    this.initializeFilterValues();
    this.categorizeFilters();
  }

  private initializeFilterValues(): void {
    this.filterValues = { ...this.currentValues };

    // Initialize missing filter values
    this.filters.forEach(filter => {
      if (!(filter.field in this.filterValues)) {
        this.filterValues[filter.field] = filter.value || null;
      }
    });
  }

  private categorizeFilters(): void {
    this.visibleFilters = this.filters.filter(f => !f.advanced);
    this.advancedFilters = this.filters.filter(f => f.advanced);
  }

  onFilterChange(filter: DynamicFilter): void {
    // Emit filter change after a short delay to debounce
    setTimeout(() => {
      this.filterChange.emit(this.filterValues);
    }, 300);
  }

  clearAllFilters(): void {
    this.filters.forEach(filter => {
      this.filterValues[filter.field] = filter.value || null;
    });
    this.clearFilters.emit();
  }

  toggleAdvancedFilters(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  getFilterClass(filter: DynamicFilter): string {
    const classes = ['filter-item'];

    if (filter.type === 'daterange') {
      classes.push('wide');
    }

    return classes.join(' ');
  }

  getMultiSelectText(filter: DynamicFilter): string {
    const values = this.filterValues[filter.field] || [];
    if (values.length === 0) return 'None selected';
    if (values.length === 1) return '1 selected';
    return `${values.length} selected`;
  }

  get hasActiveFilters(): boolean {
    return Object.keys(this.filterValues).some(key => {
      const value = this.filterValues[key];
      return value !== null && value !== undefined && value !== '' &&
        (!Array.isArray(value) || value.length > 0);
    });
  }

  get hasAdvancedFilters(): boolean {
    return this.advancedFilters.length > 0;
  }

  isFilterRequired(filterCode: string): boolean {
    const filter = this.filters.find(f => f.field === filterCode);
    return filter?.required || false;
  }
}
