// application-detail.component.ts - UPDATED to use Enhanced Edit Mode
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
import { EnhancedResourceFormComponent } from './components/resource-form/resource-form.component';
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
    EnhancedResourceFormComponent,
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
        this.apiData = data;
        const endpoints = data.applications?.applications?.[this.appName] || [];
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
        console.error('Error loading application:', error);
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

    return Array.from(resourceMap.values());
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
        console.error(`Error loading ${resource.name} data:`, error);
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
    this.selectedResource = resource;
    this.editingRecord = null;
    this.formValidationErrors = {};
    this.showForm = true;
    this.loadRelationOptionsForResource(resource);

    // Initialize edit mode service for create mode
    this.editModeService.exitEditMode();
  }

  editResource(resource: Resource, record: TableData): void {
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {};
    this.showForm = true;
    this.loadRelationOptionsForResource(resource);

    // Initialize edit mode service with the record
    const recordId = record['id'] || record['pk'];
    if (recordId) {
      this.editModeService.initializeEditMode(resource, recordId, {
        loadFreshData: false // Use existing data
      }).subscribe({
        next: (data) => {
          console.log('Edit mode initialized with fresh data:', data);
        },
        error: (error) => {
          console.warn('Failed to load fresh data, using existing:', error);
          // Fallback to existing data
          this.editModeService.setEditData(record);
        }
      });
    } else {
      // Fallback if no ID available
      this.editModeService.setEditData(record);
    }
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
        console.error('Error deleting record:', error);
        this.showErrorNotification('Failed to delete record');
      }
    });
  }

  handleFormSubmit(formData: any): void {
    this.submitting = true;
    const resource = this.selectedResource!;

    // Check if this is an auto-save operation
    const isAutoSave = formData._autoSave;
    delete formData._autoSave; // Remove flag from data

    // Use the enhanced data formatter to prepare data (handles files)
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

    console.log('Submitting data:', preparedData);
    console.log('Is FormData:', preparedData instanceof FormData);

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
        console.error('Error submitting form:', error);

        if (error.status === 400 && error.error) {
          this.handleValidationErrors(error.error);
        } else if (error.status === 413) {
          this.showErrorNotification('File is too large. Please choose a smaller file.');
        } else if (error.status === 415) {
          this.showErrorNotification('Unsupported file type. Please choose a different file.');
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

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  showErrorNotification(message: string): void {
    this.notificationType = 'error';
    this.notificationMessage = message;
    this.showNotification = true;

    // Auto-hide after 7 seconds for errors
    setTimeout(() => {
      this.hideNotification();
    }, 7000);
  }

  hideNotification(): void {
    this.showNotification = false;

    // Clear message after animation
    setTimeout(() => {
      this.notificationMessage = '';
    }, 300);
  }

  // Relation options loading
  private loadRelationOptionsForResource(resource: Resource): void {
    resource.fields.forEach(field => {
      if (this.shouldLoadRelationOptions(field)) {
        this.loadRelationOptions(field);
      }
    });
  }

  private shouldLoadRelationOptions(field: ResourceField): boolean {
    return !!(
      field.related_model ||
      field.relation_type ||
      this.isRelationField(field) ||
      field.name.endsWith('_id')
    );
  }

  private loadRelationOptions(field: ResourceField): void {
    this.relationOptions[field.name] = [];

    if (field.related_model) {
      if (field.related_model === 'lookup.lookup') {
        this.loadLookupOptions(field);
      } else {
        this.loadModelOptions(field);
      }
    } else {
      this.loadFallbackOptions(field);
    }
  }

  private loadLookupOptions(field: ResourceField): void {
    let lookupName = '';

    if (field.limit_choices_to) {
      try {
        let choicesString = field.limit_choices_to;
        if (typeof choicesString === 'string') {
          const nameMatch = choicesString.match(/'([^']+)'\s*:\s*'([^']+)'/);
          if (nameMatch && nameMatch[1].includes('name')) {
            lookupName = nameMatch[2];
          } else {
            const simpleMatch = choicesString.match(/'([^']+)'/g);
            if (simpleMatch && simpleMatch.length > 1) {
              lookupName = simpleMatch[1].replace(/'/g, '');
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing limit_choices_to:', error);
      }
    }

    if (!lookupName) {
      lookupName = FieldTypeUtils.formatColumnName(field.name);
    }

    const lookupUrl = `lookups/?name=${encodeURIComponent(lookupName)}`;

    this.apiService.executeApiCall(lookupUrl, 'GET').subscribe({
      next: (response) => {
        const data = response.results || response || [];
        this.relationOptions[field.name] = this.formatLookupOptions(data);
      },
      error: (error) => {
        console.warn(`Could not load lookup options for ${field.name} with name "${lookupName}":`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private loadModelOptions(field: ResourceField): void {
    const relatedModel = field.related_model!;
    const relatedEndpoint = this.findRelatedEndpointByModel(relatedModel);

    if (relatedEndpoint) {
      const path = this.cleanPath(relatedEndpoint.path);
      this.loadFromEndpoint(field, path);
    } else {
      this.tryModelPatterns(field, relatedModel);
    }
  }

  private findRelatedEndpointByModel(relatedModel: string): ApiEndpoint | null {
    if (!this.apiData?.applications?.applications) return null;

    const [app, model] = relatedModel.split('.');

    for (const appName in this.apiData.applications.applications) {
      const endpoints = this.apiData.applications.applications[appName] as ApiEndpoint[];

      const matchingEndpoint = endpoints.find((endpoint: ApiEndpoint) => {
        const endpointName = endpoint.name.toLowerCase();
        const endpointPath = endpoint.path.toLowerCase();

        return (
          endpoint.name.includes('-list') &&
          (
            endpointName.includes(model.toLowerCase()) ||
            endpointPath.includes(`${app}/${model}`) ||
            endpointPath.includes(`${model}/`)
          )
        );
      });

      if (matchingEndpoint) {
        return matchingEndpoint;
      }
    }

    return null;
  }

  private tryModelPatterns(field: ResourceField, relatedModel: string): void {
    const [app, model] = relatedModel.split('.');

    const endpointPatterns = [
      `${app}/${model}/`,
      `api/${app}/${model}/`,
      `${app}/${model}s/`,
      `api/${app}/${model}s/`,
      `${model}/`,
      `api/${model}/`,
      `${model}s/`,
      `api/${model}s/`,
    ];

    this.tryEndpointPatterns(field, endpointPatterns);
  }

  private loadFallbackOptions(field: ResourceField): void {
    let relatedResourceName = field.name.replace(/_id$/, '') || field.name;
    this.tryCommonEndpointPatterns(field, relatedResourceName);
  }

  private tryEndpointPatterns(field: ResourceField, patterns: string[]): void {
    let patternIndex = 0;

    const tryNext = () => {
      if (patternIndex >= patterns.length) {
        console.warn(`Could not load options for ${field.name} - all patterns failed`);
        this.relationOptions[field.name] = [];
        return;
      }

      const pattern = patterns[patternIndex];

      this.apiService.executeApiCall(pattern, 'GET').subscribe({
        next: (response) => {
          const data = response.results || response || [];
          this.relationOptions[field.name] = this.formatRelationOptions(data, field.related_model || field.name);
        },
        error: (error) => {
          patternIndex++;
          tryNext();
        }
      });
    };

    tryNext();
  }

  private loadFromEndpoint(field: ResourceField, endpoint: string): void {
    this.apiService.executeApiCall(endpoint, 'GET').subscribe({
      next: (response) => {
        const data = response.results || response || [];
        this.relationOptions[field.name] = this.formatRelationOptions(data, field.related_model || field.name);
      },
      error: (error) => {
        console.warn(`Could not load from endpoint ${endpoint}:`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private formatLookupOptions(data: any[]): RelationOption[] {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      id: item.id || item.pk,
      display: item.name || item.title || item.label || item.value || `Lookup #${item.id || item.pk || 'Unknown'}`
    }));
  }

  private tryCommonEndpointPatterns(field: ResourceField, resourceName: string): void {
    const commonPatterns = [
      `api/${resourceName}/`,
      `api/${resourceName}s/`,
      `${resourceName}/`,
      `${resourceName}s/`,
    ];

    this.tryEndpointPatterns(field, commonPatterns);
  }

  private formatRelationOptions(data: any[], resourceName: string): RelationOption[] {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      let display = '';

      if (item.name) display = item.name;
      else if (item.title) display = item.title;
      else if (item.label) display = item.label;
      else if (item.display_name) display = item.display_name;
      else if (item.full_name) display = item.full_name;
      else if (item.email) display = item.email;
      else if (item.username) display = item.username;
      else display = `${resourceName} #${item.id || item.pk || 'Unknown'}`;

      return {
        id: item.id || item.pk,
        display: display
      };
    });
  }

  private isRelationField(field: ResourceField): boolean {
    return ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type);
  }

  private cleanPath(path: string, id?: any): string {
    let cleanedPath = path.replace(/\/$/, '');
    if (id) {
      cleanedPath = cleanedPath.replace(/<pk>/, id);
    }
    cleanedPath = cleanedPath.replace(/<[^>]+>/g, '');
    cleanedPath = cleanedPath.replace(/\.<format>/, '');
    cleanedPath = cleanedPath.replace(/\./, '');
    cleanedPath = cleanedPath.replace(/\?\?$/, '');
    return cleanedPath;
  }
}
