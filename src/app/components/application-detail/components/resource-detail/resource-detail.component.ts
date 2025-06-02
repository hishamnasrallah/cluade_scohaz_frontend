// components/resource-detail/resource-detail.component.ts - ENHANCED with Foreign Key Resolution
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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

import { Resource, TableData, RelationOption } from '../../models/resource.model';
import { DataFormatterService } from '../../services/data-formatter.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';
import {ApiService} from '../../../../services/api.service';

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
  templateUrl: './resource-detail.component.html',
  styleUrl: './resource-detail.component.scss'
})
export class ResourceDetailComponent implements OnInit, OnChanges {
  @Input() resource!: Resource;
  @Input() record!: TableData;

  @Output() onEdit = new EventEmitter<TableData>();
  @Output() onClose = new EventEmitter<void>();

  // Foreign Key Resolution
  relationOptions: { [key: string]: RelationOption[] } = {};
  loadingRelations: { [key: string]: boolean } = {};

  constructor(
    private dataFormatter: DataFormatterService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadRelationOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resource'] || changes['record']) {
      this.loadRelationOptions();
    }
  }

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

  // *** FOREIGN KEY RESOLUTION METHODS ***
  private loadRelationOptions(): void {
    if (!this.resource.fields) return;

    const foreignKeyFields = this.resource.fields.filter(field =>
      this.isForeignKeyFieldByField(field)
    );

    console.log('🔍 DEBUG: Loading relation options for foreign key fields in detail view:', foreignKeyFields);

    foreignKeyFields.forEach(field => {
      this.loadOptionsForField(field);
    });
  }

  private isForeignKeyFieldByField(field: any): boolean {
    return FieldTypeUtils.isRelationField(field) && !FieldTypeUtils.isManyToManyField(field);
  }

  isForeignKeyField(field: any): boolean {
    return this.isForeignKeyFieldByField(field);
  }

  private loadOptionsForField(field: any): void {
    const fieldName = field.name;
    console.log(`🔍 DEBUG: Loading options for foreign key field in detail view: ${fieldName}`);

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

  getForeignKeyDisplayValue(field: any): string {
    const value = this.getFieldValue(field.name);

    if (value === null || value === undefined) {
      return 'Not selected';
    }

    const options = this.relationOptions[field.name];

    if (!options || options.length === 0) {
      if (this.loadingRelations[field.name]) {
        return 'Loading...';
      }
      return `ID: ${value}`;
    }

    const option = options.find(opt => opt.id == value);
    return option ? option.display : `ID: ${value}`;
  }

  isLoadingRelation(field: any): boolean {
    return this.loadingRelations[field.name] || false;
  }
}
