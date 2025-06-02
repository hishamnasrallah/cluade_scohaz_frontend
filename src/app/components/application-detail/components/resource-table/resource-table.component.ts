// components/resource-table/resource-table.component.ts - ENHANCED with Foreign Key Display
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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

import { Resource, TableData, RelationOption } from '../../models/resource.model';
import { DataFormatterService } from '../../services/data-formatter.service';
import { FormBuilderService } from '../../services/form-builder.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';
// import { ApiService } from '../../../services/api.service';
import {MatDivider} from '@angular/material/divider';
import { MatChipOption } from '@angular/material/chips';
import {ApiService} from '../../../../services/api.service';

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
  templateUrl:'./resource-table.component.html',
  styleUrl: './resource-table.component.scss'
})
export class ResourceTableComponent implements OnInit, OnChanges {
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

  // Foreign Key Resolution
  relationOptions: { [key: string]: RelationOption[] } = {};
  loadingRelations: { [key: string]: boolean } = {};

  constructor(
    private dataFormatter: DataFormatterService,
    private formBuilder: FormBuilderService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.data;
    this.lastUpdated = new Date();
    this.initializeFilters();
    this.loadRelationOptions();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data;
      this.lastUpdated = new Date();
      this.selection.clear();
    }

    if (changes['resource']) {
      this.loadRelationOptions();
    }
  }

  // *** FOREIGN KEY RESOLUTION METHODS ***
  private loadRelationOptions(): void {
    if (!this.resource.fields) return;

    const foreignKeyFields = this.resource.fields.filter(field =>
      this.isForeignKeyFieldByField(field)
    );

    console.log('🔍 DEBUG: Loading relation options for foreign key fields:', foreignKeyFields);

    foreignKeyFields.forEach(field => {
      this.loadOptionsForField(field);
    });
  }

  private isForeignKeyFieldByField(field: any): boolean {
    return FieldTypeUtils.isRelationField(field) && !FieldTypeUtils.isManyToManyField(field);
  }

  isForeignKeyField(columnName: string): boolean {
    const field = this.resource.fields?.find(f => f.name === columnName);
    return field ? this.isForeignKeyFieldByField(field) : false;
  }

  private loadOptionsForField(field: any): void {
    const fieldName = field.name;
    console.log(`🔍 DEBUG: Loading options for foreign key field: ${fieldName}`);

    this.loadingRelations[fieldName] = true;
    this.relationOptions[fieldName] = [];

    if (this.isLookupField(field)) {
      this.loadLookupOptions(field);
    } else if (field.related_model) {
      this.loadRelatedModelOptions(field);
    } else {
      this.loadFallbackOptions(field);
    }
  }

  private isLookupField(field: any): boolean {
    return field.related_model === 'lookup.lookup' &&
      field.relation_type === 'OneToOneField' &&
      !!field.limit_choices_to &&
      field.limit_choices_to.includes('parent_lookup__name');
  }

  private extractLookupName(field: any): string {
    if (!field.limit_choices_to) return '';

    try {
      const regex = /['"]parent_lookup__name['"]:\s*['"]([^'"]+)['"]/;
      const match = field.limit_choices_to.match(regex);
      return match ? match[1] : '';
    } catch (error) {
      console.error('❌ Error extracting lookup name:', error);
      return '';
    }
  }

  private loadLookupOptions(field: any): void {
    const fieldName = field.name;
    const lookupName = this.extractLookupName(field);

    if (!lookupName) {
      console.error(`❌ Could not extract lookup name for field: ${fieldName}`);
      this.loadingRelations[fieldName] = false;
      return;
    }

    const lookupUrl = `/lookups/?name=${encodeURIComponent(lookupName)}`;
    console.log(`🔍 DEBUG: Loading lookup from URL: ${lookupUrl}`);

    this.apiService.executeApiCall(lookupUrl, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Lookup response for ${fieldName}:`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[fieldName] = this.formatOptions(data, 'lookup');
          console.log(`✅ Loaded ${this.relationOptions[fieldName].length} lookup options for ${fieldName}`);
        } else {
          console.warn(`⚠️ Lookup response is not an array for ${fieldName}`);
          this.relationOptions[fieldName] = [];
        }

        this.loadingRelations[fieldName] = false;
      },
      error: (error) => {
        console.error(`❌ Error loading lookup options for ${fieldName}:`, error);
        this.relationOptions[fieldName] = [];
        this.loadingRelations[fieldName] = false;
      }
    });
  }

  private loadRelatedModelOptions(field: any): void {
    const fieldName = field.name;
    console.log(`🔍 DEBUG: Loading related model options for ${fieldName}`);
    console.log(`🔍 DEBUG: Related model: ${field.related_model}`);

    if (!field.related_model) {
      this.loadingRelations[fieldName] = false;
      return;
    }

    const parts = field.related_model.split('.');
    if (parts.length !== 2) {
      console.warn(`❌ Invalid related_model format: ${field.related_model}`);
      this.loadingRelations[fieldName] = false;
      return;
    }

    const [appName, modelName] = parts;

    const possibleUrls = [
      `${appName}/${modelName}/`,
      `/${appName}/${modelName}/`,
      `api/${appName}/${modelName}/`,
      `/api/${appName}/${modelName}/`,
    ];

    console.log(`🔍 DEBUG: Trying URLs for ${fieldName}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0);
  }

  private tryLoadFromUrls(field: any, urls: string[], index: number): void {
    const fieldName = field.name;

    if (index >= urls.length) {
      console.error(`❌ All URL patterns failed for ${fieldName}`);
      this.relationOptions[fieldName] = [];
      this.loadingRelations[fieldName] = false;
      return;
    }

    const url = urls[index];
    console.log(`🔍 DEBUG: Trying URL ${index + 1}/${urls.length}: ${url}`);

    this.apiService.executeApiCall(url, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Success loading from URL: ${url}`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[fieldName] = this.formatOptions(data, 'model');
          console.log(`✅ Loaded ${this.relationOptions[fieldName].length} related model options for ${fieldName}`);
        } else {
          console.warn(`⚠️ Response is not an array for ${fieldName}:`, data);
          this.relationOptions[fieldName] = [];
        }

        this.loadingRelations[fieldName] = false;
      },
      error: (error) => {
        console.warn(`⚠️ Failed to load from URL: ${url}`, error);
        this.tryLoadFromUrls(field, urls, index + 1);
      }
    });
  }

  private loadFallbackOptions(field: any): void {
    const fieldName = field.name;
    console.log(`🔍 DEBUG: Loading fallback options for ${fieldName}`);

    const baseName = fieldName.replace(/_id$/, '').replace(/s$/, '');
    const possibleUrls = [
      `${this.resource.name}/${baseName}/`,
      `/${this.resource.name}/${baseName}/`,
      `${this.resource.name}/${fieldName.replace(/_id$/, '')}/`,
      `/${this.resource.name}/${fieldName.replace(/_id$/, '')}/`,
    ];

    console.log(`🔍 DEBUG: Fallback URLs for ${fieldName}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0);
  }

  private formatOptions(data: any[], type: string): RelationOption[] {
    console.log(`🔍 DEBUG: Formatting ${data.length} ${type} options`);

    return data.map(item => {
      const id = item.id || item.pk;
      let display = '';

      if (item.name) display = item.name;
      else if (item.title) display = item.title;
      else if (item.label) display = item.label;
      else if (item.display_name) display = item.display_name;
      else if (item.full_name) display = item.full_name;
      else if (item.first_name && item.last_name) display = `${item.first_name} ${item.last_name}`;
      else if (item.first_name) display = item.first_name;
      else if (item.email) display = item.email;
      else if (item.username) display = item.username;
      else if (item.value) display = item.value;
      else display = `Item #${id}`;

      return {
        id: id,
        display: display || `Item #${id}`
      };
    });
  }

  getForeignKeyDisplayValue(columnName: string, value: any): string {
    if (value === null || value === undefined) {
      return 'Not selected';
    }

    const options = this.relationOptions[columnName];

    if (!options || options.length === 0) {
      if (this.loadingRelations[columnName]) {
        return 'Loading...';
      }
      return `ID: ${value}`;
    }

    const option = options.find(opt => opt.id == value);
    return option ? option.display : `ID: ${value}`;
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
