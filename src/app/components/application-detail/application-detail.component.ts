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
  template: `
    <div class="app-detail-container">
      <!-- Header -->
      <header class="app-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1 class="app-title">{{ appName | titlecase }}</h1>
          <p class="app-subtitle">Application Management Dashboard</p>
        </div>
        <div class="header-actions">
          <button mat-icon-button
                  class="refresh-btn"
                  (click)="loadApplicationData()"
                  [disabled]="loading"
                  matTooltip="Refresh application data">
            <mat-icon [class.spinning]="loading">refresh</mat-icon>
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-content">
          <mat-spinner diameter="50"></mat-spinner>
          <p class="loading-text">Loading application data...</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading && resources.length > 0" class="main-content">
        <div class="content-header">
          <h2 class="section-title">Resources</h2>
          <p class="section-subtitle">Manage your application resources with enhanced editing capabilities</p>
        </div>

        <mat-tab-group class="resource-tabs"
                       animationDuration="300ms"
                       [selectedIndex]="selectedTabIndex"
                       (selectedTabChange)="onTabChange($event)">
          <mat-tab *ngFor="let resource of resources; let i = index"
                   [label]="resource.name | titlecase">
            <ng-template matTabContent>
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

                <!-- No List View Available -->
                <div *ngIf="!resource.hasListView" class="no-list-view">
                  <mat-icon class="info-icon">info</mat-icon>
                  <h3>No List View Available</h3>
                  <p>This resource doesn't support list operations.</p>
                  <div class="resource-actions">
                    <button mat-raised-button
                            color="primary"
                            *ngIf="resource.canCreate"
                            (click)="openCreateDialog(resource)">
                      <mat-icon>add</mat-icon>
                      Create New {{ resource.name | titlecase }}
                    </button>
                  </div>
                </div>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && resources.length === 0" class="empty-state">
        <div class="empty-content">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <h2 class="empty-title">No Resources Found</h2>
          <p class="empty-subtitle">
            This application doesn't have any accessible resources.
            <br>Please check your API configuration or contact your administrator.
          </p>
          <div class="empty-actions">
            <button mat-raised-button color="primary" (click)="goBack()" class="back-to-dashboard">
              <mat-icon>dashboard</mat-icon>
              Back to Dashboard
            </button>
            <button mat-stroked-button (click)="loadApplicationData()" class="retry-btn">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Form Modal -->
      <app-enhanced-resource-form
        *ngIf="showForm"
        [resource]="selectedResource!"
        [editingRecord]="editingRecord"
        [submitting]="submitting"
        [relationOptions]="relationOptions"
        [validationErrors]="formValidationErrors"
        [showDebug]="false"
        (onSubmit)="handleFormSubmit($event)"
        (onCancel)="closeForm()">
      </app-enhanced-resource-form>

      <!-- Detail Modal -->
      <app-resource-detail
        *ngIf="showDetail"
        [resource]="selectedResource!"
        [record]="detailRecord"
        (onEdit)="editFromDetail($event)"
        (onClose)="closeDetail()">
      </app-resource-detail>

      <!-- Success/Error Messages -->
      <div class="notification-container"
           [class.show]="showNotification"
           [class.success]="notificationType === 'success'"
           [class.error]="notificationType === 'error'">
        <mat-icon>{{ notificationType === 'success' ? 'check_circle' : 'error' }}</mat-icon>
        <span>{{ notificationMessage }}</span>
        <button mat-icon-button (click)="hideNotification()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .app-detail-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .app-header {
      background: white;
      padding: 24px 32px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .back-btn {
      margin-right: 16px;
      background: rgba(103, 126, 234, 0.1);
      color: #677eea;
      border-radius: 12px;
      transition: all 0.3s ease;
      width: 48px;
      height: 48px;
    }

    .back-btn:hover {
      background: rgba(103, 126, 234, 0.2);
      transform: translateX(-2px);
      box-shadow: 0 4px 12px rgba(103, 126, 234, 0.3);
    }

    .header-content {
      flex: 1;
    }

    .app-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .app-subtitle {
      color: #6c757d;
      margin: 4px 0 0 0;
      font-size: 1rem;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .refresh-btn {
      background: rgba(40, 167, 69, 0.1);
      color: #28a745;
      border-radius: 12px;
      transition: all 0.3s ease;
      width: 48px;
      height: 48px;
    }

    .refresh-btn:hover {
      background: rgba(40, 167, 69, 0.2);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 24px;
      animation: fadeIn 0.5s ease-out;
    }

    .loading-content {
      text-align: center;
    }

    .loading-text {
      color: #6c757d;
      font-size: 1.125rem;
      margin: 0;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
    }

    .loading-progress {
      width: 200px;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 16px;
    }

    .progress-bar {
      width: 30%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
      animation: progressMove 2s ease-in-out infinite;
    }

    @keyframes progressMove {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(300%); }
      100% { transform: translateX(-100%); }
    }

    .main-content {
      padding: 32px;
      animation: slideIn 0.5s ease-out 0.2s both;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .content-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .section-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #495057;
      margin: 0 0 8px 0;
    }

    .section-subtitle {
      color: #6c757d;
      font-size: 1rem;
      margin: 0;
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

    .no-list-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 40px;
      text-align: center;
      background: #f8f9fa;
    }

    .info-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #17a2b8;
      margin-bottom: 16px;
    }

    .no-list-view h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #495057;
      margin: 0 0 8px 0;
    }

    .no-list-view p {
      color: #6c757d;
      margin: 0 0 24px 0;
      font-size: 1rem;
    }

    .resource-actions {
      display: flex;
      gap: 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      padding: 48px;
      text-align: center;
      animation: fadeIn 0.6s ease-out;
    }

    .empty-content {
      max-width: 500px;
    }

    .empty-icon {
      font-size: 6rem;
      width: 6rem;
      height: 6rem;
      color: #ced4da;
      margin-bottom: 24px;
      opacity: 0.7;
    }

    .empty-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #495057;
      margin: 0 0 16px 0;
    }

    .empty-subtitle {
      font-size: 1rem;
      color: #6c757d;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .back-to-dashboard {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 15px rgba(103, 126, 234, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-to-dashboard:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(103, 126, 234, 0.6);
    }

    .retry-btn {
      color: #6c757d;
      border: 2px solid #6c757d;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .retry-btn:hover {
      color: #495057;
      border-color: #495057;
      background: rgba(73, 80, 87, 0.05);
    }

    /* Tab customization */
    ::ng-deep .mat-mdc-tab-group {
      --mat-tab-header-active-focus-label-text-color: #667eea;
      --mat-tab-header-active-label-text-color: #667eea;
      --mat-tab-header-active-focus-indicator-color: #667eea;
      --mat-tab-header-active-ripple-color: rgba(102, 126, 234, 0.12);
    }

    ::ng-deep .mat-mdc-tab-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    ::ng-deep .mat-mdc-tab {
      min-width: 120px;
      padding: 0 24px;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: capitalize;
      transition: all 0.3s ease;
    }

    ::ng-deep .mat-mdc-tab:hover {
      background: rgba(102, 126, 234, 0.05);
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      background: white;
    }

    ::ng-deep .mdc-tab-indicator__content--underline {
      border-color: #667eea;
      border-width: 3px;
      border-radius: 2px;
    }

    /* Notification styles */
    .notification-container {
      position: fixed;
      top: 100px;
      right: 24px;
      background: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      z-index: 1001;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }

    .notification-container.show {
      transform: translateX(0);
      opacity: 1;
    }

    .notification-container.success {
      border-left: 4px solid #28a745;
      color: #155724;
      background: #d4edda;
    }

    .notification-container.error {
      border-left: 4px solid #dc3545;
      color: #721c24;
      background: #f8d7da;
    }

    .notification-container mat-icon:first-child {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .notification-container.success mat-icon:first-child {
      color: #28a745;
    }

    .notification-container.error mat-icon:first-child {
      color: #dc3545;
    }

    .notification-container span {
      flex: 1;
      font-weight: 500;
    }

    .notification-container button {
      width: 32px;
      height: 32px;
      color: inherit;
    }

    /* Responsive design */
    @media (max-width: 1200px) {
      .main-content {
        padding: 24px;
      }
    }

    @media (max-width: 768px) {
      .app-header {
        padding: 16px 20px;
      }

      .app-title {
        font-size: 1.5rem;
      }

      .back-btn, .refresh-btn {
        width: 40px;
        height: 40px;
      }

      .main-content {
        padding: 16px;
      }

      .empty-state {
        padding: 32px 16px;
      }

      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
      }

      .empty-title {
        font-size: 1.5rem;
      }

      .empty-actions {
        flex-direction: column;
        align-items: center;
      }

      .back-to-dashboard, .retry-btn {
        width: 100%;
        max-width: 280px;
      }

      .notification-container {
        right: 16px;
        left: 16px;
        min-width: auto;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        padding: 12px 16px;
      }

      .app-title {
        font-size: 1.25rem;
      }

      .main-content {
        padding: 12px;
      }

      .resource-tabs {
        border-radius: 8px;
      }
    }

    /* Print styles */
    @media print {
      .app-header .back-btn,
      .app-header .refresh-btn,
      .back-to-dashboard,
      .retry-btn {
        display: none;
      }

      .app-detail-container {
        background: white;
      }

      .resource-tabs,
      .main-content {
        box-shadow: none;
      }

      .notification-container {
        display: none;
      }
    }
  `]
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
