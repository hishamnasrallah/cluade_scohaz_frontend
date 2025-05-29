// application-detail.component.ts - DEBUG VERSION with Enhanced Logging
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
    this.loadRelationOptionsForResource(resource);
    this.editModeService.exitEditMode();
  }

  editResource(resource: Resource, record: TableData): void {
    console.log('🔍 DEBUG: Opening edit dialog for resource:', resource, 'record:', record);
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {};
    this.showForm = true;
    this.loadRelationOptionsForResource(resource);

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
    console.log('🔍 DEBUG: Is FormData:', preparedData instanceof FormData);

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

  // ENHANCED RELATION OPTIONS LOADING WITH DEBUG
  private loadRelationOptionsForResource(resource: Resource): void {
    console.log('🔍 DEBUG: ======= LOADING RELATION OPTIONS =======');
    console.log(`🔍 DEBUG: Loading relation options for resource: ${resource.name}`);
    console.log('🔍 DEBUG: Resource fields:', resource.fields);

    // Reset relation options
    this.relationOptions = {};

    resource.fields.forEach((field, index) => {
      console.log(`🔍 DEBUG: Checking field ${index + 1}/${resource.fields.length}:`, field);

      if (this.shouldLoadRelationOptions(field)) {
        console.log(`✅ Loading options for relation field: ${field.name}`, field);
        this.loadRelationOptions(field);
      } else {
        console.log(`⏭️ Skipping field ${field.name} - not a relation field`);
      }
    });

    console.log('🔍 DEBUG: ======= END RELATION OPTIONS LOADING =======');
  }

  private shouldLoadRelationOptions(field: ResourceField): boolean {
    if (!field || !field.name) {
      console.log(`❌ Field is null or has no name:`, field);
      return false;
    }

    console.log(`🔍 DEBUG: Checking shouldLoadRelationOptions for field: ${field.name}`);
    console.log(`🔍 DEBUG: - related_model: ${field.related_model}`);
    console.log(`🔍 DEBUG: - relation_type: ${field.relation_type}`);
    console.log(`🔍 DEBUG: - type: ${field.type}`);
    console.log(`🔍 DEBUG: - name ends with _id: ${field.name.endsWith('_id')}`);

    // Check for explicit relation markers
    if (field.related_model || field.relation_type) {
      console.log(`✅ Field ${field.name} has related_model or relation_type - should load options`);
      return true;
    }

    // Check field types that indicate relations
    if (['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) {
      console.log(`✅ Field ${field.name} has relation type ${field.type} - should load options`);
      return true;
    }

    // Check naming patterns
    if (field.name.endsWith('_id')) {
      console.log(`✅ Field ${field.name} ends with _id - should load options`);
      return true;
    }

    console.log(`❌ Field ${field.name} is not a relation field`);
    return false;
  }

  private loadRelationOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: *** Loading relation options for field: ${field.name} ***`, field);

    // Initialize empty options
    this.relationOptions[field.name] = [];

    if (field.related_model) {
      console.log(`🔍 DEBUG: Field has related_model: ${field.related_model}`);
      if (field.related_model === 'lookup.lookup') {
        console.log(`🔍 DEBUG: Loading lookup options for ${field.name}`);
        this.loadLookupOptions(field);
      } else {
        console.log(`🔍 DEBUG: Loading ForeignKey options for ${field.name}`);
        this.loadForeignKeyOptions(field);
      }
    } else {
      console.log(`🔍 DEBUG: No related_model, trying fallback options for ${field.name}`);
      this.loadFallbackOptions(field);
    }
  }

  // ENHANCED: Better Foreign Key handling for patterns like "bbb_app.contact"
  private loadForeignKeyOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: *** LOADING FOREIGN KEY OPTIONS ***`);
    console.log(`🔍 DEBUG: Field: ${field.name}, related_model: ${field.related_model}`);

    if (!field.related_model) {
      console.warn(`❌ No related_model specified for field: ${field.name}`);
      return;
    }

    // Parse related_model (e.g., "bbb_app.contact" -> app: "bbb_app", model: "contact")
    const parts = field.related_model.split('.');
    console.log(`🔍 DEBUG: Parsing related_model parts:`, parts);

    if (parts.length !== 2) {
      console.warn(`❌ Invalid related_model format: ${field.related_model} (expected format: app.model)`);
      return;
    }

    const [appName, modelName] = parts;
    console.log(`🔍 DEBUG: Parsed - appName: "${appName}", modelName: "${modelName}"`);

    // Find the corresponding list endpoint
    console.log(`🔍 DEBUG: Searching for related endpoint...`);
    const relatedEndpoint = this.findRelatedListEndpoint(appName, modelName);

    if (relatedEndpoint) {
      console.log(`✅ Found related endpoint for ${field.name}:`, relatedEndpoint);
      this.loadOptionsFromEndpoint(field, relatedEndpoint);
    } else {
      console.warn(`❌ Could not find list endpoint for ${field.related_model}`);
      console.log(`🔍 DEBUG: Trying fallback endpoint patterns...`);
      this.tryFallbackEndpointPatterns(field, appName, modelName);
    }
  }

  private findRelatedListEndpoint(appName: string, modelName: string): ApiEndpoint | null {
    console.log(`🔍 DEBUG: *** FINDING RELATED LIST ENDPOINT ***`);
    console.log(`🔍 DEBUG: Looking for: appName="${appName}", modelName="${modelName}"`);

    if (!this.apiData?.applications?.applications) {
      console.warn('❌ No API data available');
      return null;
    }

    console.log(`🔍 DEBUG: Available applications:`, Object.keys(this.apiData.applications.applications));

    // Look through all applications for the matching endpoint
    for (const currentAppName in this.apiData.applications.applications) {
      console.log(`🔍 DEBUG: Checking application: ${currentAppName}`);
      const endpoints = this.apiData.applications.applications[currentAppName] as ApiEndpoint[];
      console.log(`🔍 DEBUG: Endpoints in ${currentAppName}:`, endpoints.map(e => `${e.name} (${e.path})`));

      for (const endpoint of endpoints) {
        console.log(`🔍 DEBUG: Checking endpoint: ${endpoint.name} (${endpoint.path})`);

        // Check if this is a list endpoint for the target model
        if (this.isMatchingListEndpoint(endpoint, appName, modelName)) {
          console.log(`✅ Found matching endpoint: ${endpoint.path} (${endpoint.name})`);
          return endpoint;
        }
      }
    }

    console.log(`❌ No matching endpoint found for ${appName}.${modelName}`);
    return null;
  }

  private isMatchingListEndpoint(endpoint: ApiEndpoint, targetApp: string, targetModel: string): boolean {
    console.log(`🔍 DEBUG: *** CHECKING ENDPOINT MATCH ***`);
    console.log(`🔍 DEBUG: Endpoint: ${endpoint.name} (${endpoint.path})`);
    console.log(`🔍 DEBUG: Target: ${targetApp}.${targetModel}`);

    // Must be a list endpoint
    if (!endpoint.name.includes('-list')) {
      console.log(`❌ Not a list endpoint (doesn't contain '-list')`);
      return false;
    }

    // Must support GET method
    if (!endpoint.methods.includes('GET')) {
      console.log(`❌ Doesn't support GET method`);
      return false;
    }

    // Check path patterns
    const pathPatterns = [
      `${targetApp}/${targetModel}/`,      // bbb_app/contact/
      `${targetApp}/${targetModel}s/`,     // bbb_app/contacts/
      `api/${targetApp}/${targetModel}/`,  // api/bbb_app/contact/
      `api/${targetApp}/${targetModel}s/`, // api/bbb_app/contacts/
      `${targetModel}/`,                   // contact/
      `${targetModel}s/`,                  // contacts/
    ];

    const normalizedPath = endpoint.path.toLowerCase().replace(/\/<[^>]+>/g, '/').replace(/\?\??$/, ''); // Remove parameters and query strings
    console.log(`🔍 DEBUG: Normalized path: "${normalizedPath}"`);

    for (const pattern of pathPatterns) {
      console.log(`🔍 DEBUG: Checking pattern: "${pattern}"`);
      if (normalizedPath.includes(pattern.toLowerCase())) {
        console.log(`✅ Path "${endpoint.path}" matches pattern "${pattern}"`);
        return true;
      }
    }

    // Check endpoint name patterns
    const namePatterns = [
      `${targetModel}-list`,
      `${targetModel}s-list`,
      `${targetApp.replace('_', '-')}-${targetModel}-list`,
    ];

    console.log(`🔍 DEBUG: Checking name patterns:`, namePatterns);
    for (const pattern of namePatterns) {
      console.log(`🔍 DEBUG: Checking name pattern: "${pattern}" against "${endpoint.name}"`);
      if (endpoint.name.toLowerCase() === pattern.toLowerCase()) {
        console.log(`✅ Name "${endpoint.name}" matches pattern "${pattern}"`);
        return true;
      }
    }

    console.log(`❌ No match found for endpoint ${endpoint.name}`);
    return false;
  }

  private loadOptionsFromEndpoint(field: ResourceField, endpoint: ApiEndpoint): void {
    const path = this.cleanPath(endpoint.path);
    console.log(`🔍 DEBUG: *** LOADING OPTIONS FROM ENDPOINT ***`);
    console.log(`🔍 DEBUG: Loading options from endpoint: ${path}`);

    this.apiService.executeApiCall(path, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Received response for ${field.name}:`, response);
        const data = response.results || response || [];
        console.log(`🔍 DEBUG: Data array length: ${Array.isArray(data) ? data.length : 'Not an array'}`);
        console.log(`🔍 DEBUG: Sample data:`, Array.isArray(data) ? data.slice(0, 3) : data);

        this.relationOptions[field.name] = this.formatRelationOptions(data, field.related_model || field.name);
        console.log(`✅ Formatted options for ${field.name}:`, this.relationOptions[field.name]);

        // Trigger change detection
        setTimeout(() => {
          console.log(`🔍 DEBUG: Current relationOptions state:`, this.relationOptions);
        }, 100);
      },
      error: (error) => {
        console.error(`❌ Error loading options for ${field.name} from ${path}:`, error);
        this.relationOptions[field.name] = [];
      }
    });
  }

  private tryFallbackEndpointPatterns(field: ResourceField, appName: string, modelName: string): void {
    console.log(`🔍 DEBUG: *** TRYING FALLBACK PATTERNS ***`);
    console.log(`🔍 DEBUG: Trying fallback patterns for ${field.name}`);

    const fallbackPatterns = [
      `${appName}/${modelName}/`,
      `${appName}/${modelName}s/`,
      `api/${appName}/${modelName}/`,
      `api/${appName}/${modelName}s/`,
      `${modelName}/`,
      `${modelName}s/`,
    ];

    console.log(`🔍 DEBUG: Fallback patterns:`, fallbackPatterns);
    this.tryEndpointPatterns(field, fallbackPatterns);
  }

  private loadLookupOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: *** LOADING LOOKUP OPTIONS ***`);
    console.log(`🔍 DEBUG: Loading lookup options for field: ${field.name}`);

    let lookupName = '';

    // Parse limit_choices_to to extract the lookup name
    if (field.limit_choices_to) {
      try {
        const choicesString = field.limit_choices_to;
        console.log(`🔍 DEBUG: Parsing limit_choices_to: ${choicesString}`);

        // Handle patterns like "{'parent_lookup__name': 'Asset Type'}"
        const nameMatch = choicesString.match(/'([^']+)'\s*:\s*'([^']+)'/);
        if (nameMatch && nameMatch[1].includes('name')) {
          lookupName = nameMatch[2];
        } else {
          // Try to extract any string in quotes
          const simpleMatch = choicesString.match(/'([^']+)'/g);
          if (simpleMatch && simpleMatch.length > 1) {
            lookupName = simpleMatch[1].replace(/'/g, '');
          }
        }
      } catch (error) {
        console.warn('⚠️ Error parsing limit_choices_to:', error);
      }
    }

    if (!lookupName) {
      lookupName = FieldTypeUtils.formatColumnName(field.name);
    }

    console.log(`🔍 DEBUG: Using lookup name: ${lookupName}`);

    // Try different lookup URL patterns
    const lookupPatterns = [
      `api/lookup/?name=${encodeURIComponent(lookupName)}`,
      `lookup/?name=${encodeURIComponent(lookupName)}`,
      `lookups/?name=${encodeURIComponent(lookupName)}`,
      `api/lookups/?name=${encodeURIComponent(lookupName)}`,
    ];

    console.log(`🔍 DEBUG: Lookup patterns:`, lookupPatterns);
    this.tryLookupPatterns(field, lookupPatterns, lookupName);
  }

  private tryLookupPatterns(field: ResourceField, patterns: string[], lookupName: string): void {
    let patternIndex = 0;

    const tryNext = () => {
      if (patternIndex >= patterns.length) {
        console.warn(`❌ Could not load lookup options for ${field.name} with name "${lookupName}"`);
        this.relationOptions[field.name] = [];
        return;
      }

      const pattern = patterns[patternIndex];
      console.log(`🔍 DEBUG: Trying lookup pattern: ${pattern}`);

      this.apiService.executeApiCall(pattern, 'GET').subscribe({
        next: (response) => {
          console.log(`✅ Lookup response for ${field.name}:`, response);
          const data = response.results || response || [];
          this.relationOptions[field.name] = this.formatLookupOptions(data);
          console.log(`✅ Formatted lookup options for ${field.name}:`, this.relationOptions[field.name]);
        },
        error: (error) => {
          console.warn(`⚠️ Lookup pattern ${pattern} failed:`, error);
          patternIndex++;
          tryNext();
        }
      });
    };

    tryNext();
  }

  private loadFallbackOptions(field: ResourceField): void {
    console.log(`🔍 DEBUG: *** LOADING FALLBACK OPTIONS ***`);
    console.log(`🔍 DEBUG: Loading fallback options for field: ${field.name}`);

    // Try to infer the related resource name from field name
    let relatedResourceName = field.name.replace(/_id$/, '') || field.name;
    console.log(`🔍 DEBUG: Inferred resource name: ${relatedResourceName}`);

    const fallbackPatterns = [
      `api/${relatedResourceName}/`,
      `api/${relatedResourceName}s/`,
      `${relatedResourceName}/`,
      `${relatedResourceName}s/`,
      `${this.appName}/${relatedResourceName}/`,
      `${this.appName}/${relatedResourceName}s/`,
    ];

    console.log(`🔍 DEBUG: Fallback patterns:`, fallbackPatterns);
    this.tryEndpointPatterns(field, fallbackPatterns);
  }

  private tryEndpointPatterns(field: ResourceField, patterns: string[]): void {
    let patternIndex = 0;

    const tryNext = () => {
      if (patternIndex >= patterns.length) {
        console.warn(`❌ Could not load options for ${field.name} - all patterns failed`);
        this.relationOptions[field.name] = [];
        return;
      }

      const pattern = patterns[patternIndex];
      console.log(`🔍 DEBUG: Trying endpoint pattern: ${pattern}`);

      this.apiService.executeApiCall(pattern, 'GET').subscribe({
        next: (response) => {
          console.log(`✅ Pattern ${pattern} succeeded for ${field.name}:`, response);
          const data = response.results || response || [];
          this.relationOptions[field.name] = this.formatRelationOptions(data, field.related_model || field.name);
          console.log(`✅ Formatted options for ${field.name}:`, this.relationOptions[field.name]);
        },
        error: (error) => {
          console.warn(`⚠️ Pattern ${pattern} failed:`, error);
          patternIndex++;
          tryNext();
        }
      });
    };

    tryNext();
  }

  private formatLookupOptions(data: any[]): RelationOption[] {
    if (!Array.isArray(data)) {
      console.warn('⚠️ Lookup data is not an array:', data);
      return [];
    }

    return data.map(item => ({
      id: item.id || item.pk,
      display: item.name || item.title || item.label || item.value || `Lookup #${item.id || item.pk || 'Unknown'}`
    }));
  }

  private formatRelationOptions(data: any[], resourceName: string): RelationOption[] {
    console.log(`🔍 DEBUG: *** FORMATTING RELATION OPTIONS ***`);
    console.log(`🔍 DEBUG: Formatting options for ${resourceName}:`, data);

    if (!Array.isArray(data)) {
      console.warn('⚠️ Relation data is not an array:', data);
      return [];
    }

    const formatted = data.map(item => {
      let display = '';

      // Try different common fields for display
      if (item.name) display = item.name;
      else if (item.title) display = item.title;
      else if (item.label) display = item.label;
      else if (item.display_name) display = item.display_name;
      else if (item.full_name) display = item.full_name;
      else if (item.email) display = item.email;
      else if (item.username) display = item.username;
      else if (item.first_name && item.last_name) display = `${item.first_name} ${item.last_name}`;
      else if (item.first_name) display = item.first_name;
      else display = `${resourceName} #${item.id || item.pk || 'Unknown'}`;

      return {
        id: item.id || item.pk,
        display: display
      };
    });

    console.log(`✅ Formatted relation options:`, formatted);
    return formatted;
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
