// application-detail.component.ts - SIMPLIFIED VERSION
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleCasePipe } from '@angular/common';

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
    ResourceTableComponent,
    ResourceFormComponent,
    ResourceDetailComponent
  ],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

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

    this.loadRelationOptions(resource);
    this.editModeService.exitEditMode();
  }

  editResource(resource: Resource, record: TableData): void {
    console.log('🔍 DEBUG: Opening edit dialog for resource:', resource, 'record:', record);
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {};
    this.showForm = true;

    this.loadRelationOptions(resource);

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

  // *** SIMPLIFIED RELATION OPTIONS LOADING ***
  private loadRelationOptions(resource: Resource): void {
    console.log('🔍 DEBUG: Loading relation options for resource:', resource.name);

    // Reset relation options
    this.relationOptions = {};

    if (!resource.fields || resource.fields.length === 0) {
      console.log('❌ No fields found for resource');
      return;
    }

    // Process each field that is a relation field
    resource.fields.forEach(field => {
      if (this.isRelationField(field)) {
        console.log(`✅ Loading options for relation field: ${field.name}`);
        this.loadOptionsForField(field);
      }
    });
  }

  private isRelationField(field: ResourceField): boolean {
    if (!field || !field.name) return false;

    // Skip choice fields (they have predefined choices)
    if (field.choices && field.choices.length > 0) {
      return false;
    }

    // Check for relation indicators
    return (
      (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) ||
      (field.relation_type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.relation_type)) ||
      (field.related_model && field.related_model.trim().length > 0) ||
      (field.limit_choices_to && field.limit_choices_to.trim().length > 0) ||
      field.name.endsWith('_id')
    );
  }

  private loadOptionsForField(field: ResourceField): void {
    console.log(`🔍 DEBUG: Loading options for field: ${field.name}`);

    // Initialize empty array
    this.relationOptions[field.name] = [];

    if (this.isLookupField(field)) {
      this.loadLookupOptions(field);
    } else if (field.related_model) {
      this.loadRelatedModelOptions(field);
    } else {
      this.loadFallbackOptions(field);
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
      // Pattern: "{'parent_lookup__name': 'Asset Type'}"
      const regex = /['"]parent_lookup__name['"]:\s*['"]([^'"]+)['"]/;
      const match = field.limit_choices_to.match(regex);
      return match ? match[1] : '';
    } catch (error) {
      console.error('❌ Error extracting lookup name:', error);
      return '';
    }
  }

  private loadLookupOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: Loading lookup options for ${field.name}`);

    const lookupName = this.extractLookupName(field);
    if (!lookupName) {
      console.error(`❌ Could not extract lookup name for field: ${field.name}`);
      this.relationOptions[field.name] = [];
      return;
    }

    // Complete URL with query parameter
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
      },
      error: (error) => {
        console.error(`❌ Error loading lookup options for ${field.name}:`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private loadRelatedModelOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: Loading related model options for ${field.name}`);

    if (!field.related_model) return;

    const parts = field.related_model.split('.');
    if (parts.length !== 2) {
      console.warn(`❌ Invalid related_model format: ${field.related_model}`);
      return;
    }

    const [appName, modelName] = parts;
    const url = `/${appName}/${modelName}/`;

    console.log(`🔍 DEBUG: Loading related model from: ${url}`);

    this.apiService.executeApiCall(url, 'GET').subscribe({
      next: (response) => {
        const data = response.results || response || [];
        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'model');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} related model options for ${field.name}`);
        } else {
          this.relationOptions[field.name] = [];
        }
      },
      error: (error) => {
        console.error(`❌ Error loading related model options for ${field.name}:`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private loadFallbackOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: Loading fallback options for ${field.name}`);

    // Try to guess from field name
    const baseName = field.name.replace(/_id$/, '');
    const url = `/${this.appName}/${baseName}/`;

    console.log(`🔍 DEBUG: Loading fallback from: ${url}`);

    this.apiService.executeApiCall(url, 'GET').subscribe({
      next: (response) => {
        const data = response.results || response || [];
        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'fallback');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} fallback options for ${field.name}`);
        } else {
          this.relationOptions[field.name] = [];
        }
      },
      error: (error) => {
        console.error(`❌ Error loading fallback options for ${field.name}:`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private formatOptions(data: any[], type: string): RelationOption[] {
    console.log(`🔍 DEBUG: Formatting ${data.length} ${type} options`);

    return data.map(item => {
      const id = item.id || item.pk;
      let display = '';

      // Try common display fields in order of preference
      if (item.name) display = item.name;
      else if (item.title) display = item.title;
      else if (item.label) display = item.label;
      else if (item.display_name) display = item.display_name;
      else if (item.full_name) display = item.full_name;
      else if (item.first_name && item.last_name) display = `${item.first_name} ${item.last_name}`;
      else if (item.first_name) display = item.first_name;
      else if (item.email) display = item.email;
      else if (item.username) display = item.username;
      else if (item.value) display = item.value; // For lookup items
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

    const preparedData = this.dataFormatter.prepareFormData(formData, resource.fields);

    let path: string;
    let method: string;

    if (this.editingRecord) {
      const recordId = this.editingRecord['id'] || this.editingRecord['pk'];
      path = this.cleanPath(resource.detailEndpoint?.path || '', recordId);
      method = 'PUT';
    } else {
      path = this.cleanPath(resource.listEndpoint?.path || '');
      method = 'POST';
    }

    console.log('🔍 DEBUG: Submitting data:', preparedData);

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

  // Notification methods
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

    // Remove other path parameters and format specifiers
    cleanedPath = cleanedPath.replace(/<[^>]+>/g, '');
    cleanedPath = cleanedPath.replace(/\.<format>/, '');
    cleanedPath = cleanedPath.replace(/\.format/, '');
    cleanedPath = cleanedPath.replace('.', '');
    cleanedPath = cleanedPath.replace(/\?\??$/, '');

    return cleanedPath;
  }
}
