// application-detail.component.ts - ENHANCED with File Upload Support
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

import { ResourceTableComponent } from './components/resource-table/resource-table.component';
import { ResourceFormComponent } from './components/resource-form/resource-form.component';
import { ResourceDetailComponent } from './components/resource-detail/resource-detail.component';

import { Resource, ResourceField, RelationOption, TableData, convertApiKeysToResourceFields } from './models/resource.model';
import { ApiResponse, ApiEndpoint } from '../../models/api.models';

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
  template: `
    <div class="app-detail-container">
      <!-- Header -->
      <header class="app-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1 class="app-title">{{ appName | titlecase }}</h1>
          <p class="app-subtitle">Application Management</p>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-text">Loading application data...</p>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && resources.length > 0" class="main-content">
        <mat-tab-group class="resource-tabs" animationDuration="300ms">
          <mat-tab *ngFor="let resource of resources" [label]="resource.name | titlecase">
            <div class="tab-content">
              <app-resource-table
                *ngIf="resource.hasListView"
                [resource]="resource"
                [data]="resourceData[resource.name] || []"
                [loading]="loadingData[resource.name] || false"
                (onCreate)="openCreateDialog(resource)"
                (onRefresh)="refreshResourceData(resource)"
                (onView)="viewResourceDetails(resource, $event)"
                (onEdit)="editResource(resource, $event)"
                (onDelete)="deleteResource(resource, $event)">
              </app-resource-table>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && resources.length === 0" class="empty-state">
        <mat-icon class="empty-icon">folder_open</mat-icon>
        <h2 class="empty-title">No Resources Found</h2>
        <p class="empty-subtitle">This application doesn't have any accessible resources.</p>
        <button mat-raised-button color="primary" (click)="goBack()" class="back-to-dashboard">
          <mat-icon>dashboard</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <!-- Form Modal -->
      <app-resource-form
        *ngIf="showForm"
        [resource]="selectedResource!"
        [editingRecord]="editingRecord"
        [submitting]="submitting"
        [relationOptions]="relationOptions"
        [validationErrors]="formValidationErrors"
        [showDebug]="false"
        (onSubmit)="handleFormSubmit($event)"
        (onCancel)="closeForm()">
      </app-resource-form>

      <!-- Detail Modal -->
      <app-resource-detail
        *ngIf="showDetail"
        [resource]="selectedResource!"
        [record]="detailRecord"
        (onEdit)="editFromDetail($event)"
        (onClose)="closeDetail()">
      </app-resource-detail>
    </div>
  `,
  styles: [`
    .app-detail-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .app-header {
      background: white;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid #e0e0e0;
    }

    .back-btn {
      margin-right: 16px;
      background: rgba(103, 126, 234, 0.1);
      color: #677eea;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .back-btn:hover {
      background: rgba(103, 126, 234, 0.2);
      transform: translateX(-2px);
    }

    .header-content {
      flex: 1;
    }

    .app-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .app-subtitle {
      color: #6c757d;
      margin: 4px 0 0 0;
      font-size: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 24px;
    }

    .loading-text {
      color: #6c757d;
      font-size: 18px;
      margin: 0;
    }

    .main-content {
      padding: 32px;
    }

    .resource-tabs {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .tab-content {
      padding: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      padding: 40px;
      text-align: center;
    }

    .empty-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #ced4da;
      margin-bottom: 24px;
    }

    .empty-title {
      font-size: 28px;
      font-weight: 600;
      color: #495057;
      margin: 0 0 12px 0;
    }

    .empty-subtitle {
      font-size: 16px;
      color: #6c757d;
      margin: 0 0 32px 0;
      max-width: 400px;
    }

    .back-to-dashboard {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(103, 126, 234, 0.4);
      transition: all 0.3s ease;
    }

    .back-to-dashboard:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(103, 126, 234, 0.6);
    }

    ::ng-deep .mat-mdc-tab-group {
      --mat-tab-header-active-focus-label-text-color: #667eea;
      --mat-tab-header-active-label-text-color: #667eea;
    }

    ::ng-deep .mat-mdc-tab-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    ::ng-deep .mat-mdc-tab {
      min-width: 120px;
      padding: 0 24px;
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      background: white;
    }

    ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }

    ::ng-deep .error-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
    }

    ::ng-deep .error-snackbar .mat-mdc-snack-bar-label {
      color: white !important;
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  appName: string = '';
  resources: Resource[] = [];
  loading = true;
  loadingData: { [key: string]: boolean } = {};
  resourceData: { [key: string]: TableData[] } = {};
  apiData: any = null; // Store API data for relation lookups

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dataFormatter: DataFormatterService,
    private formBuilder: FormBuilderService
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

  private loadApplicationData(): void {
    this.loading = true;

    this.apiService.getApplications().subscribe({
      next: (data) => {
        this.apiData = data; // Store for relation lookups
        const endpoints = data.applications?.applications?.[this.appName] || [];
        this.resources = this.processEndpoints(endpoints);
        this.loading = false;

        // Load data for each resource
        this.resources.forEach(resource => {
          if (resource.hasListView) {
            this.loadResourceData(resource);
          }
        });
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.loading = false;
        this.snackBar.open('Failed to load application data', 'Close', { duration: 3000 });
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
        this.snackBar.open(`Failed to load ${resource.name} data`, 'Close', { duration: 3000 });
      }
    });
  }

  refreshResourceData(resource: Resource): void {
    this.loadResourceData(resource);
  }

  openCreateDialog(resource: Resource): void {
    this.selectedResource = resource;
    this.editingRecord = null;
    this.formValidationErrors = {}; // Clear any previous errors
    this.showForm = true;
    this.loadRelationOptionsForResource(resource);
  }

  editResource(resource: Resource, record: TableData): void {
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {}; // Clear any previous errors
    this.showForm = true;
    this.loadRelationOptionsForResource(resource);
  }

  viewResourceDetails(resource: Resource, record: TableData): void {
    this.selectedResource = resource;
    this.detailRecord = record;
    this.showDetail = true;
  }

  deleteResource(resource: Resource, record: TableData): void {
    if (!confirm(`Are you sure you want to delete this ${resource.name}?`)) {
      return;
    }

    const recordId = record['id'] || record['pk'];
    const path = this.cleanPath(resource.detailEndpoint.path, recordId);

    this.apiService.executeApiCall(path, 'DELETE').subscribe({
      next: () => {
        this.snackBar.open(`${resource.name} deleted successfully`, 'Close', { duration: 3000 });
        this.loadResourceData(resource);
      },
      error: (error) => {
        console.error('Error deleting record:', error);
        this.snackBar.open('Failed to delete record', 'Close', { duration: 3000 });
      }
    });
  }

  // ENHANCED form submission with file support
  handleFormSubmit(formData: any): void {
    this.submitting = true;
    const resource = this.selectedResource!;

    // Use the enhanced data formatter to prepare data (handles files)
    const preparedData = this.dataFormatter.prepareFormData(formData, resource.fields);

    let path: string;
    let method: string;

    if (this.editingRecord) {
      const recordId = this.editingRecord['id'] || this.editingRecord['pk'];
      path = this.cleanPath(resource.detailEndpoint.path, recordId);
      method = 'PUT';
    } else {
      path = this.cleanPath(resource.listEndpoint.path);
      method = 'POST';
    }

    console.log('Submitting data:', preparedData);
    console.log('Is FormData:', preparedData instanceof FormData);

    this.apiService.executeApiCall(path, method, preparedData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.showForm = false;
        this.formValidationErrors = {}; // Clear validation errors on success

        const action = this.editingRecord ? 'updated' : 'created';
        this.snackBar.open(
          `${resource.name} ${action} successfully`,
          'Close',
          { duration: 3000 }
        );

        this.loadResourceData(resource);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error submitting form:', error);

        // Enhanced error handling
        if (error.status === 400 && error.error) {
          this.handleValidationErrors(error.error);
        } else if (error.status === 413) {
          // File too large
          this.snackBar.open(
            'File is too large. Please choose a smaller file.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        } else if (error.status === 415) {
          // Unsupported media type
          this.snackBar.open(
            'Unsupported file type. Please choose a different file.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        } else {
          // Other errors
          this.snackBar.open(
            `Failed to ${this.editingRecord ? 'update' : 'create'} ${resource.name}`,
            'Close',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      }
    });
  }

  private handleValidationErrors(errors: any): void {
    const errorMessage = this.parseValidationErrors(errors);

    // Show detailed error in snackbar
    this.snackBar.open(
      `Validation failed: ${errorMessage}`,
      'Close',
      {
        duration: 5000,
        panelClass: ['error-snackbar']
      }
    );

    // Send errors to form component for field-specific display
    this.formValidationErrors = errors;
  }

  private parseValidationErrors(errors: any): string {
    const errorMessages: string[] = [];

    for (const field in errors) {
      if (errors[field]) {
        const fieldLabel = this.formatFieldName(field);
        if (Array.isArray(errors[field])) {
          errorMessages.push(`${fieldLabel}: ${errors[field].join(', ')}`);
        } else {
          errorMessages.push(`${fieldLabel}: ${errors[field]}`);
        }
      }
    }

    return errorMessages.join('; ') || 'Please check your input and try again.';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedResource = null;
    this.editingRecord = null;
    this.formValidationErrors = {}; // Clear validation errors
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedResource = null;
    this.detailRecord = null;
  }

  editFromDetail(record: TableData): void {
    // Close detail view and open edit form
    this.showDetail = false;
    this.editingRecord = record;
    this.formValidationErrors = {}; // Clear any previous errors
    this.showForm = true;
    this.loadRelationOptionsForResource(this.selectedResource!);
  }

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
    // Initialize with empty array
    this.relationOptions[field.name] = [];

    if (field.related_model) {
      if (field.related_model === 'lookup.lookup') {
        // Handle lookup.lookup case - extract name from limit_choices_to
        this.loadLookupOptions(field);
      } else {
        // Handle other models like crm.crmstage
        this.loadModelOptions(field);
      }
    } else {
      // Fallback for fields without related_model
      this.loadFallbackOptions(field);
    }
  }

  private loadLookupOptions(field: ResourceField): void {
    let lookupName = '';

    // Extract lookup name from limit_choices_to
    if (field.limit_choices_to) {
      try {
        // Handle different formats of limit_choices_to
        let choicesString = field.limit_choices_to;

        // If it's a string that looks like a dict, parse it
        if (typeof choicesString === 'string') {
          // Extract the name from patterns like "{'parent_lookup__name': 'Applicant Type'}"
          const nameMatch = choicesString.match(/'([^']+)'\s*:\s*'([^']+)'/);
          if (nameMatch && nameMatch[1].includes('name')) {
            lookupName = nameMatch[2];
          } else {
            // Try other patterns
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
      // Fallback: try to use field name
      lookupName = this.formatColumnName(field.name);
    }

    // Call the lookups API
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
    const relatedModel = field.related_model!; // e.g., "crm.crmstage"

    // Convert model name to API endpoint
    // "crm.crmstage" -> try "api/crm/crmstage/" or similar patterns
    const [app, model] = relatedModel.split('.');

    const endpointPatterns = [
      `api/${app}/${model}/`,
      `api/${app}/${model}s/`,
      `${app}/${model}/`,
      `${app}/${model}s/`,
      `api/${model}/`,
      `api/${model}s/`,
      `${model}/`,
      `${model}s/`,
    ];

    // Also try to find exact endpoint from loaded API data
    const relatedEndpoints = this.findRelatedEndpointsByModel(relatedModel);
    if (relatedEndpoints.length > 0) {
      const listEndpoint = relatedEndpoints.find(ep => ep.name.includes('-list'));
      if (listEndpoint) {
        const path = this.cleanPath(listEndpoint.path);
        this.loadFromEndpoint(field, path);
        return;
      }
    }

    // Try common patterns
    this.tryEndpointPatterns(field, endpointPatterns);
  }

  private loadFallbackOptions(field: ResourceField): void {
    // Try to determine the related resource name from the field name
    let relatedResourceName = field.name.replace(/_id$/, '') || field.name;
    this.tryCommonEndpointPatterns(field, relatedResourceName);
  }

  private findRelatedEndpointsByModel(relatedModel: string): any[] {
    if (!this.apiData?.applications?.applications) return [];

    const allEndpoints = Object.values(this.apiData.applications.applications).flat();
    const [app, model] = relatedModel.split('.');

    return allEndpoints.filter(endpoint => {
      const name = endpoint.name.toLowerCase();
      return name.includes(model.toLowerCase()) ||
        name.includes(`${app}-${model}`.toLowerCase()) ||
        name.includes(`${app}_${model}`.toLowerCase());
    });
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
      console.log(`Trying pattern ${patternIndex + 1}/${patterns.length}:`, pattern);

      this.apiService.executeApiCall(pattern, 'GET').subscribe({
        next: (response) => {
          const data = response.results || response || [];
          console.log('Pattern success, loaded data:', data);
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
        console.log('Loaded from exact endpoint:', data);
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

  private findRelatedEndpoints(resourceName: string): any[] {
    if (!this.apiData?.applications?.applications) return [];

    const allEndpoints = Object.values(this.apiData.applications.applications).flat();
    return allEndpoints.filter(endpoint =>
      endpoint.name.toLowerCase().includes(resourceName.toLowerCase())
    );
  }

  private tryCommonEndpointPatterns(field: ResourceField, resourceName: string): void {
    const commonPatterns = [
      `api/${resourceName}/`,
      `api/${resourceName}s/`,
      `${resourceName}/`,
      `${resourceName}s/`,
    ];

    console.log('Trying fallback patterns:', commonPatterns);
    this.tryEndpointPatterns(field, commonPatterns);
  }

  private formatRelationOptions(data: any[], resourceName: string): RelationOption[] {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      let display = '';

      // Try common display field patterns
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
