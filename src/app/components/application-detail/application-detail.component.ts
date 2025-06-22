// application-detail.component.ts - ENHANCED with Ocean Mint Theme
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { ApiService } from '../../services/api.service';
import { DataFormatterService } from './services/data-formatter.service';
import { FormBuilderService } from './services/form-builder.service';
import { EditModeService } from './services/edit-mode.service';

import { ResourceTableComponent } from './components/resource-table/resource-table.component';
import { ResourceFormComponent } from './components/resource-form/resource-form.component';
import { ResourceDetailComponent } from './components/resource-detail/resource-detail.component';

import { Resource, ResourceField, RelationOption, TableData, convertApiKeysToResourceFields } from './models/resource.model';
import { ApiResponse, ApiEndpoint } from '../../models/api.models';
import { FieldTypeUtils } from './utils/field-type.utils';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    ResourceTableComponent,
    ResourceFormComponent,
    ResourceDetailComponent
  ],
  templateUrl:"application-detail.component.html",
  styleUrl:'application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  appName: string = '';
  resources: Resource[] = [];
  loading = true;
  loadingData: { [key: string]: boolean } = {};
  resourceData: { [key: string]: TableData[] } = {};
  apiData: any = null;
  selectedTabIndex = 0;

  // Form state
  showForm = false;
  selectedResource: Resource | null = null;
  editingRecord: any = null;
  submitting = false;
  relationOptions: { [key: string]: RelationOption[] } = {};
  formValidationErrors: any = {};

  // Detail view state
  showDetail = false;
  detailRecord: any = null;

  // Notification state
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dataFormatter: DataFormatterService,
    private formBuilder: FormBuilderService,
    private editModeService: EditModeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appName = params['appName'];
      this.loadApplicationData();
    });
  }

  // Enhanced UI Methods
  getAppIcon(): string {
    const icons = ['apps', 'api', 'cloud', 'storage', 'analytics', 'security'];
    return icons[Math.abs(this.appName.length) % icons.length];
  }

  getTabLabel(resource: Resource): string {
    const count = this.resourceData[resource.name]?.length || 0;
    return count > 0 ? `${resource.name} (${count})` : resource.name;
  }

  getResourceIcon(resource: Resource): string {
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

    return typeIcons[resource.name.toLowerCase()] || 'storage';
  }

  getResourceDescription(resource: Resource): string {
    const count = this.resourceData[resource.name]?.length || 0;
    const actions = [];
    if (resource.canCreate) actions.push('Create');
    if (resource.canRead) actions.push('Read');
    if (resource.canUpdate) actions.push('Update');
    if (resource.canDelete) actions.push('Delete');

    return `${count} record${count !== 1 ? 's' : ''} • ${actions.join(', ')} operations`;
  }

  getTotalEndpoints(): number {
    return this.resources.reduce((total, resource) => total + resource.endpoints.length, 0);
  }

  getActiveResources(): number {
    return this.resources.filter(resource =>
      resource.hasListView || resource.hasDetailView
    ).length;
  }

  getNotificationTitle(): string {
    return this.notificationType === 'success' ? 'Success' : 'Error';
  }

  // Navigation and Actions
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportData(): void {
    this.snackBar.open('Export functionality coming soon!', 'Close', { duration: 3000 });
  }

  refreshAll(): void {
    this.loadApplicationData();
  }

  viewApiDocs(): void {
    this.snackBar.open('API documentation coming soon!', 'Close', { duration: 3000 });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  // Existing methods with enhanced notifications
  public loadApplicationData(): void {
    this.loading = true;

    this.apiService.getApplications().subscribe({
      next: (data) => {
        console.log('🔍 DEBUG: Full API Data received:', data);
        this.apiData = data;
        const endpoints = data.applications?.applications?.[this.appName] || [];
        console.log(`🔍 DEBUG: Endpoints for app "${this.appName}":`, endpoints);
        this.resources = this.processEndpoints(endpoints);
        this.loading = false;

        // Load data for each resource
        this.resources.forEach(resource => {
          if (resource.hasListView) {
            this.loadResourceData(resource);
          }
        });

        this.showSuccessNotification('Application data loaded successfully');
      },
      error: (error) => {
        console.error('❌ Error loading application:', error);
        this.loading = false;
        this.showErrorNotification('Failed to load application data');
      }
    });
  }

  private processEndpoints(endpoints: ApiEndpoint[]): Resource[] {
    const resourceMap = new Map<string, Resource>();

    endpoints.forEach(endpoint => {
      const resourceName = endpoint.name.split('-')[0];

      if (!resourceMap.has(resourceName)) {
        resourceMap.set(resourceName, {
          name: resourceName,
          endpoints: [],
          hasListView: false,
          hasDetailView: false,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
          fields: [],
          listEndpoint: null,
          detailEndpoint: null
        });
      }

      const resource = resourceMap.get(resourceName)!;
      resource.endpoints.push(endpoint);

      if (endpoint.name.includes('-list')) {
        resource.hasListView = endpoint.methods.includes('GET');
        resource.canCreate = endpoint.methods.includes('POST');
        resource.listEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0) {
          resource.fields = convertApiKeysToResourceFields(endpoint.keys);
        }
      }

      if (endpoint.name.includes('-detail')) {
        resource.hasDetailView = true;
        resource.canRead = endpoint.methods.includes('GET');
        resource.canUpdate = endpoint.methods.includes('PUT') || endpoint.methods.includes('PATCH');
        resource.canDelete = endpoint.methods.includes('DELETE');
        resource.detailEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0 && resource.fields.length === 0) {
          resource.fields = convertApiKeysToResourceFields(endpoint.keys);
        }
      }
    });

    const processedResources = Array.from(resourceMap.values());
    console.log('🔍 DEBUG: Processed resources:', processedResources);
    return processedResources;
  }

  private loadResourceData(resource: Resource): void {
    if (!resource.listEndpoint) return;

    this.loadingData[resource.name] = true;
    const path = this.cleanPath(resource.listEndpoint.path);

    this.apiService.executeApiCall(path, 'GET').subscribe({
      next: (response) => {
        this.resourceData[resource.name] = response.results || response || [];
        this.loadingData[resource.name] = false;
      },
      error: (error) => {
        console.error(`❌ Error loading ${resource.name} data:`, error);
        this.resourceData[resource.name] = [];
        this.loadingData[resource.name] = false;
        this.showErrorNotification(`Failed to load ${resource.name} data`);
      }
    });
  }

  refreshResourceData(resource: Resource): void {
    this.loadResourceData(resource);
    this.showSuccessNotification(`${resource.name} data refreshed`);
  }

  openCreateDialog(resource: Resource): void {
    console.log('🔍 DEBUG: Opening create dialog for resource:', resource);
    this.selectedResource = resource;
    this.editingRecord = null;
    this.formValidationErrors = {};
    this.showForm = true;

    this.loadRelationOptionsWithCallback(resource, () => {
      console.log('✅ Relation options loaded for create dialog');
    });

    this.editModeService.exitEditMode();
  }

  editResource(resource: Resource, record: TableData): void {
    console.log('🔍 DEBUG: Opening edit dialog for resource:', resource, 'record:', record);
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {};
    this.showForm = true;

    this.loadRelationOptionsWithCallback(resource, () => {
      console.log('✅ Relation options loaded for edit dialog');
    });

    const recordId = record['id'] || record['pk'];
    if (recordId) {
      this.editModeService.initializeEditMode(resource, recordId, {
        loadFreshData: false
      }).subscribe({
        next: (data) => {
          console.log('✅ Edit mode initialized with fresh data:', data);
        },
        error: (error) => {
          console.warn('⚠️ Failed to load fresh data, using existing:', error);
          this.editModeService.setEditData(record);
        }
      });
    } else {
      this.editModeService.setEditData(record);
    }
  }

  private loadRelationOptionsWithCallback(resource: Resource, callback?: () => void): void {
    console.log('🔍 DEBUG: Loading relation options for resource:', resource.name);

    this.relationOptions = {};

    if (!resource.fields || resource.fields.length === 0) {
      console.log('❌ No fields found for resource');
      if (callback) callback();
      return;
    }

    const relationFields = resource.fields.filter(field => this.isRelationField(field));
    if (relationFields.length === 0) {
      console.log('ℹ️ No relation fields found for resource');
      if (callback) callback();
      return;
    }

    let loadedCount = 0;
    const totalCount = relationFields.length;

    console.log(`🔍 DEBUG: Found ${totalCount} relation fields to load`);

    relationFields.forEach(field => {
      console.log(`✅ Loading options for relation field: ${field.name}`);
      this.loadOptionsForField(field, () => {
        loadedCount++;
        console.log(`✅ Loaded ${loadedCount}/${totalCount} relation fields`);

        if (loadedCount === totalCount) {
          console.log('✅ All relation options loaded');
          if (callback) callback();
        }
      });
    });
  }

  private isRelationField(field: ResourceField): boolean {
    if (!field || !field.name) return false;

    if (field.choices && field.choices.length > 0) {
      return false;
    }

    return (
      (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) ||
      (field.relation_type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.relation_type)) ||
      (field.related_model && field.related_model.trim().length > 0) ||
      (field.limit_choices_to && field.limit_choices_to.trim().length > 0) ||
      field.name.endsWith('_id')
    );
  }

  private loadOptionsForField(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading options for field: ${field.name}`);
    console.log(`🔍 DEBUG: Field details:`, {
      name: field.name,
      type: field.type,
      relation_type: field.relation_type,
      related_model: field.related_model,
      limit_choices_to: field.limit_choices_to
    });

    this.relationOptions[field.name] = [];

    if (this.isLookupField(field)) {
      this.loadLookupOptions(field, callback);
    } else if (field.related_model) {
      this.loadRelatedModelOptions(field, callback);
    } else {
      this.loadFallbackOptions(field, callback);
    }
  }

  private isLookupField(field: ResourceField): boolean {
    return field.related_model === 'lookup.lookup' &&
      field.relation_type === 'OneToOneField' &&
      !!field.limit_choices_to &&
      field.limit_choices_to.includes('parent_lookup__name');
  }

  private extractLookupName(field: ResourceField): string {
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

  private loadLookupOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading lookup options for ${field.name}`);

    const lookupName = this.extractLookupName(field);
    if (!lookupName) {
      console.error(`❌ Could not extract lookup name for field: ${field.name}`);
      this.relationOptions[field.name] = [];
      if (callback) callback();
      return;
    }

    const lookupUrl = `/lookups/?name=${encodeURIComponent(lookupName)}`;
    console.log(`🔍 DEBUG: Loading lookup from URL: ${lookupUrl}`);

    this.apiService.executeApiCall(lookupUrl, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Lookup response for ${field.name}:`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'lookup');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} lookup options for ${field.name}`);
        } else {
          console.warn(`⚠️ Lookup response is not an array for ${field.name}`);
          this.relationOptions[field.name] = [];
        }

        if (callback) callback();
      },
      error: (error) => {
        console.error(`❌ Error loading lookup options for ${field.name}:`, error);
        this.relationOptions[field.name] = [];
        if (callback) callback();
      }
    });
  }

  private loadRelatedModelOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading related model options for ${field.name}`);
    console.log(`🔍 DEBUG: Related model: ${field.related_model}`);

    if (!field.related_model) {
      if (callback) callback();
      return;
    }

    const parts = field.related_model.split('.');
    if (parts.length !== 2) {
      console.warn(`❌ Invalid related_model format: ${field.related_model}`);
      if (callback) callback();
      return;
    }

    const [appName, modelName] = parts;

    const possibleUrls = [
      `${appName}/${modelName}/`,
      `/${appName}/${modelName}/`,
      `api/${appName}/${modelName}/`,
      `/api/${appName}/${modelName}/`,
    ];

    console.log(`🔍 DEBUG: Trying URLs for ${field.name}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0, callback);
  }

  private tryLoadFromUrls(field: ResourceField, urls: string[], index: number, callback?: () => void): void {
    if (index >= urls.length) {
      console.error(`❌ All URL patterns failed for ${field.name}`);
      this.relationOptions[field.name] = [];
      if (callback) callback();
      return;
    }

    const url = urls[index];
    console.log(`🔍 DEBUG: Trying URL ${index + 1}/${urls.length}: ${url}`);

    this.apiService.executeApiCall(url, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Success loading from URL: ${url}`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'model');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} related model options for ${field.name}`);
        } else {
          console.warn(`⚠️ Response is not an array for ${field.name}:`, data);
          this.relationOptions[field.name] = [];
        }

        if (callback) callback();
      },
      error: (error) => {
        console.warn(`⚠️ Failed to load from URL: ${url}`, error);
        this.tryLoadFromUrls(field, urls, index + 1, callback);
      }
    });
  }

  private loadFallbackOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading fallback options for ${field.name}`);

    const baseName = field.name.replace(/_id$/, '').replace(/s$/, '');
    const possibleUrls = [
      `${this.appName}/${baseName}/`,
      `/${this.appName}/${baseName}/`,
      `${this.appName}/${field.name.replace(/_id$/, '')}/`,
      `/${this.appName}/${field.name.replace(/_id$/, '')}/`,
    ];

    console.log(`🔍 DEBUG: Fallback URLs for ${field.name}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0, callback);
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

  viewResourceDetails(resource: Resource, record: TableData): void {
    this.selectedResource = resource;
    this.detailRecord = record;
    this.showDetail = true;
  }

  deleteResource(resource: Resource, record: TableData): void {
    const resourceName = FieldTypeUtils.formatColumnName(resource.name);

    if (!confirm(`Are you sure you want to delete this ${resourceName}?\n\nThis action cannot be undone.`)) {
      return;
    }

    const recordId = record['id'] || record['pk'];
    const path = this.cleanPath(resource.detailEndpoint?.path || '', recordId);

    this.apiService.executeApiCall(path, 'DELETE').subscribe({
      next: () => {
        this.showSuccessNotification(`${resourceName} deleted successfully`);
        this.loadResourceData(resource);
      },
      error: (error) => {
        console.error('❌ Error deleting record:', error);
        this.showErrorNotification('Failed to delete record');
      }
    });
  }

  handleFormSubmit(formData: any): void {
    this.submitting = true;
    const resource = this.selectedResource!;

    const isAutoSave = formData._autoSave;
    delete formData._autoSave;

    // Extract metadata from form data
    const changedFields = formData._changedFields;
    const allFields = formData._allFields;
    const changedCount = formData._changedCount;
    const totalCount = formData._totalCount;

    // Remove metadata fields from formData
    delete formData._changedFields;
    delete formData._allFields;
    delete formData._changedCount;
    delete formData._totalCount;

    let path: string;
    let method: string;
    let dataToSend: any;

    if (this.editingRecord) {
      const recordId = this.editingRecord['id'] || this.editingRecord['pk'];
      path = this.cleanPath(resource.detailEndpoint?.path || '', recordId);

      // Check if the endpoint supports PATCH method
      const supportsPatch = resource.detailEndpoint?.methods?.includes('PATCH') || false;
      const supportsPut = resource.detailEndpoint?.methods?.includes('PUT') || false;

      // Determine which method to use
      if (isAutoSave && supportsPatch) {
        // Auto-save uses PATCH with changed fields + required fields
        method = 'PATCH';
        dataToSend = this.addRequiredFieldsToChanges(changedFields || formData, resource, allFields);
      } else if (supportsPatch && !supportsPut) {
        // If only PATCH is supported, use it with required fields
        method = 'PATCH';
        dataToSend = this.addRequiredFieldsToChanges(changedFields || formData, resource, allFields);
      } else if (supportsPut && !supportsPatch) {
        // If only PUT is supported, use it with all data
        method = 'PUT';
        dataToSend = allFields || this.getAllFormData(resource);
      } else if (supportsPatch && supportsPut) {
        // If both are supported, decide based on number of changed fields
        if (changedCount && totalCount && changedCount < totalCount / 2) {
          // If less than half the fields changed, use PATCH with required fields
          method = 'PATCH';
          dataToSend = this.addRequiredFieldsToChanges(changedFields || formData, resource, allFields);
        } else {
          // Otherwise use PUT with all data
          method = 'PUT';
          dataToSend = allFields || this.getAllFormData(resource);
        }
      } else {
        // Fallback to PUT if nothing else works
        method = 'PUT';
        dataToSend = allFields || this.getAllFormData(resource);
      }
    } else {
      // Creating new record
      path = this.cleanPath(resource.listEndpoint?.path || '');
      method = 'POST';
      dataToSend = formData;
    }

    // Prepare the data (handles file uploads, etc.)
    const preparedData = this.dataFormatter.prepareFormData(dataToSend, resource.fields);

    console.log('🔍 DEBUG: HTTP Method:', method);
    console.log('🔍 DEBUG: Endpoint Path:', path);
    console.log('🔍 DEBUG: Data to send:', dataToSend);
    console.log('🔍 DEBUG: Prepared data:', preparedData);

    this.apiService.executeApiCall(path, method, preparedData).subscribe({
      next: (response) => {
        this.submitting = false;

        if (!isAutoSave) {
          this.showForm = false;
          this.editModeService.exitEditMode();
        }

        this.formValidationErrors = {};

        const action = this.editingRecord ? 'updated' : 'created';
        const message = isAutoSave ?
          `${resource.name} auto-saved` :
          `${resource.name} ${action} successfully`;

        this.showSuccessNotification(message);
        this.loadResourceData(resource);
      },
      error: (error) => {
        this.submitting = false;
        console.error('❌ Error submitting form:', error);

        if (error.status === 400 && error.error) {
          this.handleValidationErrors(error.error);
        } else {
          const action = this.editingRecord ? 'update' : 'create';
          this.showErrorNotification(`Failed to ${action} ${resource.name}`);
        }
      }
    });
  }

  private addRequiredFieldsToChanges(changedData: any, resource: Resource, allFields: any): any {
    const result = { ...changedData };

    // Add ALL fields that have values in the original record to avoid data loss
    resource.fields.forEach(field => {
      if (!field.read_only) {
        const fieldName = field.name;

        // Skip if field was already changed
        if (fieldName in result) {
          return;
        }

        // FIX: Don't include file fields unless they were actually changed
        if (FieldTypeUtils.isFileField(field)) {
          return; // Skip file fields - they're handled separately
        }

        // Include field if it has a value in the original data
        if (allFields && fieldName in allFields) {
          const value = allFields[fieldName];

          // Include all non-null, non-undefined, non-empty values
          if (value !== null && value !== undefined && value !== '') {
            result[fieldName] = value;
          } else if (field.required) {
            // For required fields, include even if null/empty to let server validate
            result[fieldName] = value;
          }
        }

        // Special handling for relational fields - always include if they have a value
        if (FieldTypeUtils.isRelationField(field) && allFields && fieldName in allFields) {
          const value = allFields[fieldName];
          if (value !== null && value !== undefined) {
            result[fieldName] = value;
          }
        }
      }
    });

    console.log('🔍 DEBUG: Data to send with all necessary fields:', result);
    console.log('🔍 DEBUG: Total fields being sent:', Object.keys(result).length);
    return result;
  }

  private getAllFormData(resource: Resource): any {
    // Get all data from edit mode service (original + changes)
    const allData = this.editModeService.getAllData();

    // Remove read-only fields and system fields
    const fieldsToRemove = ['id', 'pk', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    resource.fields.forEach(field => {
      if (field.read_only) {
        fieldsToRemove.push(field.name);
      }
    });

    // Create a clean copy without system fields
    const cleanData: any = {};
    Object.keys(allData).forEach(key => {
      if (!fieldsToRemove.includes(key)) {
        // FIX: Skip file fields that don't have new data
        const field = resource.fields.find(f => f.name === key);
        if (field && FieldTypeUtils.isFileField(field) && !allData[key]) {
          return; // Skip this field
        }
        cleanData[key] = allData[key];
      }
    });

    console.log('🔍 DEBUG: All form data for PUT request:', cleanData);
    return cleanData;
  }

  private handleValidationErrors(errors: any): void {
    const errorMessage = this.parseValidationErrors(errors);
    this.showErrorNotification(`Validation failed: ${errorMessage}`);
    this.formValidationErrors = errors;
  }

  private parseValidationErrors(errors: any): string {
    const errorMessages: string[] = [];

    for (const field in errors) {
      if (errors[field]) {
        const fieldLabel = FieldTypeUtils.formatColumnName(field);
        if (Array.isArray(errors[field])) {
          errorMessages.push(`${fieldLabel}: ${errors[field].join(', ')}`);
        } else {
          errorMessages.push(`${fieldLabel}: ${errors[field]}`);
        }
      }
    }

    return errorMessages.join('; ') || 'Please check your input and try again.';
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedResource = null;
    this.editingRecord = null;
    this.formValidationErrors = {};
    this.editModeService.exitEditMode();
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedResource = null;
    this.detailRecord = null;
  }

  editFromDetail(record: TableData): void {
    this.showDetail = false;
    this.editResource(this.selectedResource!, record);
  }

  // Enhanced notification methods
  showSuccessNotification(message: string): void {
    this.notificationType = 'success';
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  showErrorNotification(message: string): void {
    this.notificationType = 'error';
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 7000);
  }

  hideNotification(): void {
    this.showNotification = false;

    setTimeout(() => {
      this.notificationMessage = '';
    }, 300);
  }

  private cleanPath(path: string, id?: any): string {
    let cleanedPath = path;

    if (id) {
      cleanedPath = cleanedPath.replace(/<pk>/, String(id));
    }

    cleanedPath = cleanedPath.replace(/<[^>]+>/g, '');
    cleanedPath = cleanedPath.replace(/\.<format>/, '');
    cleanedPath = cleanedPath.replace(/\.format/, '');
    cleanedPath = cleanedPath.replace('.', '');
    cleanedPath = cleanedPath.replace(/\?\??$/, '');

    return cleanedPath;
  }
}
