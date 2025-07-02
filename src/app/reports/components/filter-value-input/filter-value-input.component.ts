// src/app/reports/components/filter-builder/filter-value-input/filter-value-input.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, of, Subject } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Filter, Parameter, DataSource, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface SelectOption {
  value: any;
  label: string;
}

interface DynamicValueGroup {
  label: string;
  values: Array<{
    type: string;
    label: string;
    icon: string;
  }>;
}

@Component({
  selector: 'app-filter-value-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'filter-value-input.component.html',
  styleUrl: 'filter-value-input.component.scss'
})
export class FilterValueInputComponent implements OnInit, OnChanges {
  @Input() filter!: Filter;
  @Input() fieldInfo: FieldInfo | null = null;
  @Input() parameters: Parameter[] = [];
  @Input() dataSources: DataSource[] = [];
  @Output() valueChange = new EventEmitter<any>();
  @Output() valueTypeChange = new EventEmitter<void>();

  // For date range
  dateRangeStart: Date | null = null;
  dateRangeEnd: Date | null = null;

  // For between operator
  betweenStart: number | null = null;
  betweenEnd: number | null = null;

  // For list values
  listValues: any[] = [];

  // For select/multiselect
  selectOptions: SelectOption[] = [];
  filteredSelectOptions: Observable<SelectOption[]> = of([]);
  selectSearchValue = '';
  multiSelectSearch = '';

  // For loading related data
  isLoadingOptions = false;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.initializeValues();

    if (this.needsRelatedData()) {
      this.loadRelatedData();
    }
  }

  ngOnChanges(): void {
    this.initializeValues();

    if (this.needsRelatedData()) {
      this.loadRelatedData();
    }
  }

  initializeValues(): void {
    // Initialize date range values
    if (this.filter.operator === 'date_range' && this.filter.value) {
      if (typeof this.filter.value === 'object' && 'start' in this.filter.value) {
        this.dateRangeStart = this.filter.value.start ? new Date(this.filter.value.start) : null;
        this.dateRangeEnd = this.filter.value.end ? new Date(this.filter.value.end) : null;
      }
    }

    // Initialize between values
    if (this.filter.operator === 'between' && Array.isArray(this.filter.value)) {
      this.betweenStart = this.filter.value[0];
      this.betweenEnd = this.filter.value[1];
    }

    // Initialize list values
    if ((this.filter.operator === 'in' || this.filter.operator === 'not_in') &&
      Array.isArray(this.filter.value)) {
      this.listValues = [...this.filter.value];
    }
  }

  filterSelectOptions(search: string): void {
    if (!search) {
      this.filteredSelectOptions = of(this.selectOptions);
      return;
    }

    const searchLower = search.toLowerCase();
    this.filteredSelectOptions = of(
      this.selectOptions.filter(option =>
        option.label.toLowerCase().includes(searchLower)
      )
    );
  }

  filterMultiSelectOptions(search: string): void {
    // Trigger change detection for multi-select filtering
    this.multiSelectSearch = search;
  }

  getFilteredMultiSelectOptions(): SelectOption[] {
    if (!this.multiSelectSearch) {
      return this.selectOptions;
    }

    const searchLower = this.multiSelectSearch.toLowerCase();
    return this.selectOptions.filter(option =>
      option.label.toLowerCase().includes(searchLower)
    );
  }

  onSelectOption(event: MatAutocompleteSelectedEvent): void {
    this.filter.value = event.option.value.value;
    this.selectSearchValue = event.option.value.label;
    this.onValueChange();
  }

  displaySelectOption(option: SelectOption): string {
    return option?.label || '';
  }

  getInputType(): string {
    if (!this.fieldInfo) return 'text';

    // Check operator first
    if (this.filter.operator === 'isnull' || this.filter.operator === 'isnotnull') {
      return 'none';
    }

    if (this.filter.operator === 'between') {
      if (['IntegerField', 'FloatField', 'DecimalField'].includes(this.fieldInfo.type)) {
        return 'between';
      }
    }

    if (this.filter.operator === 'date_range') {
      return 'date_range';
    }

    if (this.filter.operator === 'in' || this.filter.operator === 'not_in') {
      if (this.fieldInfo.is_relation) {
        return 'multiselect';
      }
      return 'list';
    }

    // Based on field type
    switch (this.fieldInfo.type) {
      case 'BooleanField':
        return 'boolean';
      case 'IntegerField':
      case 'FloatField':
      case 'DecimalField':
        return 'number';
      case 'DateField':
      case 'DateTimeField':
        return 'date';
      case 'ForeignKey':
        return 'select';
      case 'ManyToManyField':
        return 'multiselect';
      default:
        return 'text';
    }
  }

  getPlaceholder(): string {
    if (!this.fieldInfo) return 'Enter value';

    switch (this.fieldInfo.type) {
      case 'EmailField':
        return 'email@example.com';
      case 'URLField':
        return 'https://example.com';
      case 'IntegerField':
        return 'Enter number';
      case 'FloatField':
      case 'DecimalField':
        return 'Enter decimal number';
      default:
        return 'Enter value';
    }
  }

  needsRelatedData(): boolean {
    if (!this.fieldInfo?.is_relation) return false;

    return this.filter.value_type === 'static' &&
      (this.getInputType() === 'select' || this.getInputType() === 'multiselect');
  }

  async loadRelatedData(): Promise<void> {
    if (!this.fieldInfo?.is_relation || !this.filter.data_source) return;

    this.isLoadingOptions = true;

    try {
      // Get the data source to find content type
      const dataSource = this.dataSources.find(ds =>
        ds.id === this.filter.data_source || ds.content_type_id === this.filter.data_source
      );

      if (!dataSource || !dataSource.content_type_id) {
        throw new Error('Data source or content type not found');
      }

      // Parse the field path to determine if it's a relation through another model
      const fieldParts = this.fieldInfo.path.split('__');
      let targetContentTypeId = dataSource.content_type_id;

      // If the field path has multiple parts, we need to find the related model's content type
      if (fieldParts.length > 1 && this.fieldInfo.is_relation) {
        // For now, we'll use the current content type
        // In a real implementation, the backend would provide the related content type ID
        console.log('Loading options for related field:', this.fieldInfo.path);
      }

      // Fetch options from the service
      const options = await this.reportService.getRelatedFieldOptions(
        targetContentTypeId,
        {
          limit: 100,
          value_field: 'id',
          label_field: 'name' // This would be configurable based on the model
        }
      ).toPromise();

      if (options) {
        this.selectOptions = options;
      } else {
        this.selectOptions = [];
      }

      this.filteredSelectOptions = of(this.selectOptions);

      // Set initial display value if filter has a value
      if (this.filter.value && this.getInputType() === 'select') {
        const selected = this.selectOptions.find(opt => opt.value === this.filter.value);
        if (selected) {
          this.selectSearchValue = selected.label;
        }
      }
    } catch (error) {
      console.error('Error loading related data:', error);
      // Provide user feedback
      this.selectOptions = [];
      this.filteredSelectOptions = of([]);
    } finally {
      this.isLoadingOptions = false;
    }
  }

  onValueChange(): void {
    this.valueChange.emit(this.filter.value);
  }

  onValueTypeChange(): void {
    // Reset value when value type changes
    this.filter.value = null;
    this.dateRangeStart = null;
    this.dateRangeEnd = null;
    this.betweenStart = null;
    this.betweenEnd = null;
    this.listValues = [];

    this.valueTypeChange.emit();
  }

  onDateRangeChange(): void {
    this.filter.value = {
      start: this.dateRangeStart?.toISOString().split('T')[0] || null,
      end: this.dateRangeEnd?.toISOString().split('T')[0] || null
    };
    this.onValueChange();
  }

  onBetweenChange(): void {
    this.filter.value = [this.betweenStart, this.betweenEnd];
    this.onValueChange();
  }

  addListValue(value: string): void {
    if (!value || this.listValues.includes(value)) return;

    this.listValues.push(value);
    this.filter.value = [...this.listValues];
    this.onValueChange();
  }

  removeListValue(index: number): void {
    this.listValues.splice(index, 1);
    this.filter.value = [...this.listValues];
    this.onValueChange();
  }

  getMultiSelectDisplay(): string {
    if (!Array.isArray(this.filter.value) || this.filter.value.length === 0) {
      return '';
    }

    if (this.filter.value.length === 1) {
      const option = this.selectOptions.find(o => o.value === this.filter.value[0]);
      return option?.label || this.filter.value[0];
    }

    return `${this.filter.value.length} items selected`;
  }

  getCompatibleParameters(): Parameter[] {
    if (!this.fieldInfo) return [];

    // Filter parameters based on field type compatibility
    return this.parameters.filter(param => {
      // For date fields
      if (['DateField', 'DateTimeField'].includes(this.fieldInfo!.type)) {
        return ['date', 'datetime', 'date_range'].includes(param.parameter_type);
      }

      // For numeric fields
      if (['IntegerField', 'FloatField', 'DecimalField'].includes(this.fieldInfo!.type)) {
        return param.parameter_type === 'number';
      }

      // For boolean fields
      if (this.fieldInfo!.type === 'BooleanField') {
        return param.parameter_type === 'boolean';
      }

      // For text fields
      if (['CharField', 'TextField', 'EmailField', 'URLField'].includes(this.fieldInfo!.type)) {
        return param.parameter_type === 'text';
      }

      // For foreign keys
      if (this.fieldInfo!.is_relation) {
        return ['select', 'multiselect'].includes(param.parameter_type);
      }

      return false;
    });
  }

  getDynamicValueGroups(): DynamicValueGroup[] {
    if (!this.fieldInfo) return [];

    const groups: DynamicValueGroup[] = [];

    // Date dynamic values
    if (['DateField', 'DateTimeField'].includes(this.fieldInfo.type)) {
      groups.push({
        label: 'Date Values',
        values: [
          { type: 'today', label: 'Today', icon: 'today' },
          { type: 'yesterday', label: 'Yesterday', icon: 'event' },
          { type: 'tomorrow', label: 'Tomorrow', icon: 'event' },
          { type: 'current_week_start', label: 'Start of Week', icon: 'first_page' },
          { type: 'current_week_end', label: 'End of Week', icon: 'last_page' },
          { type: 'current_month_start', label: 'Start of Month', icon: 'first_page' },
          { type: 'current_month_end', label: 'End of Month', icon: 'last_page' },
          { type: 'current_year_start', label: 'Start of Year', icon: 'first_page' },
          { type: 'current_year_end', label: 'End of Year', icon: 'last_page' }
        ]
      });
    }

    // User dynamic values (for user-related fields)
    if (this.fieldInfo.path.toLowerCase().includes('user') ||
      this.fieldInfo.path.toLowerCase().includes('owner') ||
      this.fieldInfo.path.toLowerCase().includes('created_by')) {
      groups.push({
        label: 'User Values',
        values: [
          { type: 'current_user_id', label: 'Current User ID', icon: 'badge' },
          { type: 'current_user_email', label: 'Current User Email', icon: 'email' }
        ]
      });
    }

    return groups;
  }

  showValuePreview(): boolean {
    return this.filter.value_type === 'parameter' &&
      this.filter.value &&
      this.parameters.some(p => p.name === this.filter.value);
  }

  getValuePreview(): string {
    if (this.filter.value_type === 'parameter') {
      const param = this.parameters.find(p => p.name === this.filter.value);
      if (param?.default_value) {
        return `Default: ${param.default_value}`;
      }
      return 'No default value';
    }

    if (this.filter.value_type === 'dynamic') {
      const dynamicValues = this.reportService.getDynamicValues();
      const dynamic = dynamicValues.find(dv => dv.type === this.filter.value);
      return dynamic ? `Will be: ${dynamic.label}` : '';
    }

    return '';
  }
}
