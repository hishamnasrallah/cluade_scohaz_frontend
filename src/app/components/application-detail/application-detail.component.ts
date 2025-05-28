// application-detail.component.ts - FIXED VERSION
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ApiResponse, ApiEndpoint } from '../../models/api.models';
import { NgForOf, NgIf, TitleCasePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardSubtitle,
  MatCardActions
} from '@angular/material/card';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

interface TableData {
  [key: string]: any;
}

@Component({
  selector: 'app-application-detail',
  standalone: true,
  template: `
    <div class="app-detail-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ appName | titlecase }} Application</h1>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading application...</p>
      </div>

      <div *ngIf="!loading && resources.length > 0">
        <mat-tab-group>
          <mat-tab *ngFor="let resource of resources" [label]="resource.name | titlecase">
            <div class="resource-content">
              <!-- List View for GET method on collection endpoints -->
              <div *ngIf="resource.hasListView" class="list-view">
                <mat-card>
                  <mat-card-header>
                    <mat-card-title>{{ resource.name | titlecase }} List</mat-card-title>
                    <mat-card-subtitle>Manage {{ resource.name }} records</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="actions-bar">
                      <button mat-raised-button color="primary"
                              *ngIf="resource.canCreate"
                              (click)="openCreateDialog(resource)">
                        <mat-icon>add</mat-icon>
                        Add New {{ resource.name | titlecase }}
                      </button>
                      <button mat-button (click)="refreshList(resource)">
                        <mat-icon>refresh</mat-icon>
                        Refresh
                      </button>
                    </div>

                    <div *ngIf="loadingData[resource.name]" class="loading-data">
                      <mat-spinner diameter="30"></mat-spinner>
                      <span>Loading data...</span>
                    </div>

                    <div *ngIf="!loadingData[resource.name] && resourceData[resource.name] && resourceData[resource.name].length > 0">
                      <table mat-table [dataSource]="resourceData[resource.name]" class="full-width-table">
                        <!-- Dynamic columns based on keys -->
                        <ng-container *ngFor="let col of getColumns(resource)" [matColumnDef]="col">
                          <th mat-header-cell *matHeaderCellDef>{{ formatColumnName(col) }}</th>
                          <td mat-cell *matCellDef="let element">
                            <span *ngIf="!isRelation(resource, col)">{{ formatCellValue(element[col]) }}</span>
                            <span *ngIf="isRelation(resource, col)" class="relation-field">
                              {{ element[col] || 'N/A' }}
                            </span>
                          </td>
                        </ng-container>

                        <!-- Actions column -->
                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef>Actions</th>
                          <td mat-cell *matCellDef="let element">
                            <button mat-icon-button
                                    *ngIf="resource.canRead"
                                    (click)="viewDetails(resource, element)"
                                    matTooltip="View Details">
                              <mat-icon>visibility</mat-icon>
                            </button>
                            <button mat-icon-button
                                    *ngIf="resource.canUpdate"
                                    (click)="editRecord(resource, element)"
                                    matTooltip="Edit">
                              <mat-icon>edit</mat-icon>
                            </button>
                            <button mat-icon-button
                                    *ngIf="resource.canDelete"
                                    (click)="deleteRecord(resource, element)"
                                    matTooltip="Delete"
                                    color="warn">
                              <mat-icon>delete</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="getDisplayColumns(resource)"></tr>
                        <tr mat-row *matRowDef="let row; columns: getDisplayColumns(resource);"></tr>
                      </table>

                      <mat-paginator [pageSizeOptions]="[5, 10, 20]"
                                     showFirstLastButtons>
                      </mat-paginator>
                    </div>

                    <div *ngIf="!loadingData[resource.name] && (!resourceData[resource.name] || resourceData[resource.name].length === 0)"
                         class="no-data">
                      <mat-icon>inbox</mat-icon>
                      <p>No {{ resource.name }} records found</p>
                      <button mat-raised-button color="primary"
                              *ngIf="resource.canCreate"
                              (click)="openCreateDialog(resource)">
                        Create First {{ resource.name | titlecase }}
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Form View (shown in dialogs) -->
              <div *ngIf="selectedResource === resource && showForm" class="form-overlay">
                <mat-card class="form-card">
                  <mat-card-header>
                    <mat-card-title>
                      {{ editingRecord ? 'Edit' : 'Create' }} {{ resource.name | titlecase }}
                    </mat-card-title>
                    <button mat-icon-button (click)="closeForm()" class="close-button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </mat-card-header>
                  <mat-card-content>
                    <form [formGroup]="dynamicForm" (ngSubmit)="submitForm(resource)">
                      <div class="form-fields">
                        <div *ngFor="let field of getFormFields(resource)" class="form-field-container">

                          <!-- Debug info - remove this after testing -->
                          <div class="debug-info" style="font-size: 10px; color: #666; margin-bottom: 4px;">
                            Field: {{ field?.name || 'NO NAME' }} | Type: {{ field?.type || 'NO TYPE' }} | Required: {{ field?.required || false }}
                          </div>

                          <!-- Skip fields without name or type -->
                          <div *ngIf="!field || !field.name || !field.type" class="error-field">
                            <span style="color: red; font-size: 12px;">Invalid field data</span>
                          </div>

                          <!-- Boolean checkbox - handle separately -->
                          <div *ngIf="field && field.name && field.type === 'BooleanField'" class="checkbox-field">
                            <mat-checkbox [formControlName]="field.name">
                              {{ formatColumnName(field.name) }} {{ field.help_text ? '(' + field.help_text + ')' : '' }}
                            </mat-checkbox>
                            <mat-error *ngIf="dynamicForm.get(field.name)?.hasError('required')">
                              {{ formatColumnName(field.name) }} is required
                            </mat-error>
                          </div>

                          <!-- File field - handle separately (outside mat-form-field) -->
                          <div *ngIf="field && field.name && field.type === 'FileField'" class="file-field">
                            <label class="file-label">{{ formatColumnName(field.name) }}</label>
                            <input type="file"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   class="file-input">
                            <mat-error *ngIf="dynamicForm.get(field.name)?.hasError('required')">
                              {{ formatColumnName(field.name) }} is required
                            </mat-error>
                          </div>

                          <!-- All other fields use mat-form-field -->
                          <mat-form-field *ngIf="field && field.name && field.type && field.type !== 'BooleanField' && field.type !== 'FileField'"
                                          appearance="fill"
                                          [class.field-has-error]="dynamicForm.get(field.name)?.invalid && dynamicForm.get(field.name)?.touched">
                            <mat-label>{{ formatColumnName(field.name) }}</mat-label>

                            <!-- Text fields (CharField, TextField, EmailField, URLField) -->
                            <input *ngIf="isTextInput(field)"
                                   matInput
                                   [type]="getInputType(field.type)"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   [placeholder]="'Enter ' + formatColumnName(field.name)">

                            <!-- Number fields (IntegerField, BigIntegerField, DecimalField, FloatField) -->
                            <input *ngIf="isNumberInput(field)"
                                   matInput
                                   type="number"
                                   [step]="getNumberStep(field.type)"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   [placeholder]="'Enter ' + formatColumnName(field.name)">

                            <!-- DateField -->
                            <ng-container *ngIf="field.type === 'DateField'">
                              <input matInput
                                     [matDatepicker]="picker"
                                     [formControlName]="field.name"
                                     [required]="field.required"
                                     [placeholder]="'Select ' + formatColumnName(field.name)">
                              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                              <mat-datepicker #picker></mat-datepicker>
                            </ng-container>

                            <!-- DateTimeField -->
                            <input *ngIf="field.type === 'DateTimeField'"
                                   matInput
                                   type="datetime-local"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   [placeholder]="'Select ' + formatColumnName(field.name)">

                            <!-- TimeField -->
                            <input *ngIf="field.type === 'TimeField'"
                                   matInput
                                   type="time"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   [placeholder]="'Select ' + formatColumnName(field.name)">

                            <!-- Select for choices -->
                            <mat-select *ngIf="hasChoices(field)"
                                        [formControlName]="field.name"
                                        [required]="field.required">
                              <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                              <mat-option *ngFor="let choice of field.choices" [value]="choice.value">
                                {{ choice.label }}
                              </mat-option>
                            </mat-select>

                            <!-- Relation fields -->
                            <mat-select *ngIf="isRelationField(field)"
                                        [formControlName]="field.name"
                                        [required]="field.required">
                              <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                              <mat-option *ngFor="let option of relationOptions[field.name]" [value]="option.id">
                                {{ option.display }}
                              </mat-option>
                            </mat-select>

                            <!-- Fallback for any unhandled field types -->
                            <input *ngIf="isUnhandledField(field)"
                                   matInput
                                   type="text"
                                   [formControlName]="field.name"
                                   [required]="field.required"
                                   [placeholder]="'Enter ' + formatColumnName(field.name) + ' (' + field.type + ')'">

                            <mat-error *ngIf="dynamicForm.get(field.name)?.hasError('required')">
                              {{ formatColumnName(field.name) }} is required
                            </mat-error>
                            <mat-error *ngFor="let error of getFieldErrors(field.name)">
                              {{ error }}
                            </mat-error>
                          </mat-form-field>
                        </div>
                      </div>

                      <mat-card-actions align="end">
                        <button mat-button type="button" (click)="closeForm()">Cancel</button>
                        <button mat-raised-button color="primary" type="submit"
                                [disabled]="!dynamicForm.valid || submitting">
                          <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
                          {{ submitting ? 'Saving...' : 'Save' }}
                        </button>
                      </mat-card-actions>
                    </form>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Detail View (shown in dialogs) -->
              <div *ngIf="selectedResource === resource && showDetail" class="detail-overlay">
                <mat-card class="detail-card">
                  <mat-card-header>
                    <mat-card-title>{{ resource.name | titlecase }} Details</mat-card-title>
                    <button mat-icon-button (click)="closeDetail()" class="close-button">
                      <mat-icon>close</mat-icon>
                    </button>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="detail-fields" *ngIf="detailRecord">
                      <div *ngFor="let field of getDetailFields(resource)" class="detail-field">
                        <label>{{ formatColumnName(field.name) }}:</label>
                        <span>{{ formatCellValue(detailRecord[field.name]) || 'N/A' }}</span>
                      </div>
                    </div>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-button (click)="closeDetail()">Close</button>
                    <button mat-raised-button color="primary"
                            *ngIf="resource.canUpdate"
                            (click)="editFromDetail(resource, detailRecord)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div *ngIf="!loading && resources.length === 0" class="no-data">
        <p>No resources found for this application.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Go Back
        </button>
      </div>
    </div>
  `,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe,
    NgForOf,
    NgIf,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  styles: [`
    .app-detail-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h1 {
      margin-left: 16px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .resource-content {
      padding: 20px 0;
      position: relative;
    }

    .actions-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .loading-data {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      justify-content: center;
    }

    .full-width-table {
      width: 100%;
    }

    .relation-field {
      color: #666;
      font-style: italic;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .form-overlay, .detail-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .form-card, .detail-card {
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .close-button {
      position: absolute;
      right: 8px;
      top: 8px;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }

    .form-field-container {
      width: 100%;
    }

    .debug-info {
      font-size: 10px;
      color: #666;
      margin-bottom: 4px;
      padding: 2px 4px;
      background-color: #f0f0f0;
      border-radius: 2px;
    }

    .error-field {
      padding: 8px;
      border: 1px solid #f44336;
      border-radius: 4px;
      background-color: #ffebee;
    }

    mat-form-field {
      width: 100%;
    }

    .checkbox-field {
      margin: 16px 0;
      width: 100%;
    }

    .checkbox-field mat-checkbox {
      width: 100%;
    }

    .file-field {
      margin: 16px 0;
      width: 100%;
    }

    .file-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 8px;
    }

    .file-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .file-input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .checkbox-errors {
      margin-top: 8px;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
    }

    ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }

    ::ng-deep .error-snackbar .mat-simple-snackbar-action {
      color: white !important;
    }

    .detail-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }

    .detail-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-field label {
      font-weight: 500;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }

    .detail-field span {
      font-size: 16px;
      color: #333;
    }

    mat-card-actions {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }

    .mat-row:hover {
      background-color: #f5f5f5;
    }

    .mat-mdc-form-field-error {
      font-size: 12px;
      margin-top: 4px;
    }

    .mat-form-field.mat-form-field-invalid .mat-form-field-label {
      color: #f44336;
    }

    .field-has-error {
      animation: shake 0.3s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .method-info {
      margin-top: 8px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  appName: string = '';
  endpoints: ApiEndpoint[] = [];
  resources: any[] = [];
  loading = true;
  loadingData: { [key: string]: boolean } = {};
  resourceData: { [key: string]: any[] } = {};

  // Form related
  showForm = false;
  showDetail = false;
  selectedResource: any = null;
  editingRecord: any = null;
  detailRecord: any = null;
  dynamicForm!: FormGroup;
  submitting = false;
  relationOptions: { [key: string]: any[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.dynamicForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appName = params['appName'];
      this.loadEndpoints();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  loadEndpoints(): void {
    this.loading = true;
    this.apiService.getApplications().subscribe({
      next: (data) => {
        console.log('Full API Response:', data); // Debug log
        this.endpoints = data.applications?.applications?.[this.appName] || [];
        console.log('Endpoints for', this.appName, ':', this.endpoints); // Debug log
        this.processEndpoints();
        this.loading = false;

        // Load initial data for each resource
        this.resources.forEach(resource => {
          if (resource.hasListView) {
            this.loadResourceData(resource);
          }
        });
      },
      error: (error) => {
        console.error('Error loading endpoints:', error);
        this.loading = false;
        this.snackBar.open('Failed to load application', 'Close', { duration: 3000 });
      }
    });
  }

  processEndpoints(): void {
    const resourceMap = new Map<string, any>();

    this.endpoints.forEach(endpoint => {
      console.log('Processing endpoint:', endpoint); // Debug log
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

      const resource = resourceMap.get(resourceName);
      resource.endpoints.push(endpoint);

      if (endpoint.name.includes('-list')) {
        resource.hasListView = endpoint.methods.includes('GET');
        resource.canCreate = endpoint.methods.includes('POST');
        resource.listEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0) {
          resource.fields = endpoint.keys;
          console.log(`Fields for ${resourceName}:`, resource.fields); // Debug log
        }
      }

      if (endpoint.name.includes('-detail')) {
        resource.hasDetailView = true;
        resource.canRead = endpoint.methods.includes('GET');
        resource.canUpdate = endpoint.methods.includes('PUT') || endpoint.methods.includes('PATCH');
        resource.canDelete = endpoint.methods.includes('DELETE');
        resource.detailEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0 && resource.fields.length === 0) {
          resource.fields = endpoint.keys;
          console.log(`Fields for ${resourceName} (from detail):`, resource.fields); // Debug log
        }
      }
    });

    this.resources = Array.from(resourceMap.values());
    console.log('Processed resources:', this.resources); // Debug log
  }

  loadResourceData(resource: any): void {
    if (!resource.listEndpoint) return;

    this.loadingData[resource.name] = true;
    const path = this.cleanPath(resource.listEndpoint.path);

    this.apiService.executeApiCall(path, 'GET').subscribe({
      next: (response) => {
        if (response.results) {
          this.resourceData[resource.name] = response.results;
        } else if (Array.isArray(response)) {
          this.resourceData[resource.name] = response;
        } else {
          this.resourceData[resource.name] = [];
        }
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

  refreshList(resource: any): void {
    this.loadResourceData(resource);
  }

  // FIXED: Get columns method with proper validation
  getColumns(resource: any): string[] {
    if (!resource.fields || resource.fields.length === 0) {
      const data = this.resourceData[resource.name];
      if (data && data.length > 0) {
        return Object.keys(data[0]).filter(key => !key.startsWith('_') && key !== 'id');
      }
      return [];
    }

    // Return all field names that exist and are not null/undefined
    return resource.fields
      .filter((field: any) => field && field.name)
      .map((field: any) => field.name);
  }

  getDisplayColumns(resource: any): string[] {
    return [...this.getColumns(resource), 'actions'];
  }

  formatColumnName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // FIXED: Format cell values properly
  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  isRelation(resource: any, columnName: string): boolean {
    const field = resource.fields?.find((f: any) => f.name === columnName);
    return field && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type);
  }

  isRelationField(field: any): boolean {
    return ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type);
  }

  // FIXED: Input type checking methods
  isTextInput(field: any): boolean {
    return ['CharField', 'TextField', 'EmailField', 'URLField'].includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  isNumberInput(field: any): boolean {
    return ['IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField'].includes(field.type);
  }

  hasChoices(field: any): boolean {
    return field.choices && Array.isArray(field.choices) && field.choices.length > 0;
  }

  isUnhandledField(field: any): boolean {
    // Check if this field type is not handled by any of the other conditions
    const handledTypes = [
      'CharField', 'TextField', 'EmailField', 'URLField',
      'IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField',
      'DateField', 'DateTimeField', 'TimeField',
      'BooleanField', 'FileField'
    ];

    return field &&
      field.name &&
      field.type &&
      !handledTypes.includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  getNumberStep(fieldType: string): string {
    switch (fieldType) {
      case 'DecimalField':
      case 'FloatField':
        return '0.01';
      default:
        return '1';
    }
  }

  getInputType(type: string): string {
    switch (type) {
      case 'EmailField':
        return 'email';
      case 'URLField':
        return 'url';
      default:
        return 'text';
    }
  }

  openCreateDialog(resource: any): void {
    this.selectedResource = resource;
    this.editingRecord = null;
    this.showForm = true;
    this.buildForm(resource);
  }

  editRecord(resource: any, record: any): void {
    this.selectedResource = resource;
    this.editingRecord = record;
    this.showForm = true;
    this.buildForm(resource, record);
  }

  viewDetails(resource: any, record: any): void {
    this.selectedResource = resource;
    this.detailRecord = record;
    this.showDetail = true;
  }

  editFromDetail(resource: any, record: any): void {
    this.showDetail = false;
    this.editRecord(resource, record);
  }

  deleteRecord(resource: any, record: any): void {
    if (!confirm(`Are you sure you want to delete this ${resource.name}?`)) {
      return;
    }

    const path = this.cleanPath(resource.detailEndpoint.path, record.id || record.pk);

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

  // FIXED: Build form method with proper field validation and comprehensive type handling
  buildForm(resource: any, record?: any): void {
    const formControls: any = {};
    const formFields = this.getFormFields(resource);

    console.log('Building form for resource:', resource.name);
    console.log('Form fields:', formFields);

    formFields.forEach(field => {
      // Skip invalid fields
      if (!field || !field.name || !field.type) {
        console.log('Skipping invalid field:', field);
        return;
      }

      console.log(`Processing field: ${field.name} (${field.type})`);

      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      let defaultValue = this.getDefaultValue(field, record);

      console.log(`Default value for ${field.name}:`, defaultValue);

      formControls[field.name] = [defaultValue, validators];

      // Load relation options if needed
      if (this.isRelationField(field)) {
        this.loadRelationOptions(field);
      }
    });

    console.log('Form controls:', formControls);
    this.dynamicForm = this.fb.group(formControls);
    console.log('Dynamic form created:', this.dynamicForm);
  }

  private getDefaultValue(field: any, record?: any): any {
    // If editing and record has value
    if (record && record[field.name] !== undefined && record[field.name] !== null) {
      let value = record[field.name];

      // Handle different field types for editing
      switch (field.type) {
        case 'DateField':
        case 'DateTimeField':
          return value ? new Date(value) : null;
        case 'BooleanField':
          return !!value;
        case 'DecimalField':
        case 'FloatField':
          return value ? parseFloat(value) : 0;
        case 'IntegerField':
        case 'BigIntegerField':
          return value ? parseInt(value) : 0;
        default:
          return value;
      }
    }

    // Default values for new records
    switch (field.type) {
      case 'BooleanField':
        return field.default !== null ? field.default : false;
      case 'IntegerField':
      case 'BigIntegerField':
        return field.default !== null ? field.default : null;
      case 'DecimalField':
      case 'FloatField':
        return field.default !== null ? field.default : null;
      case 'DateField':
      case 'DateTimeField':
      case 'TimeField':
        return field.default !== null ? field.default : null;
      default:
        return field.default !== null ? field.default : null;
    }
  }

  loadRelationOptions(field: any): void {
    // Check if this is a lookup field
    if (field.related_model === 'lookup.lookup' && field.limit_choices_to) {
      // Extract the parent lookup name from limit_choices_to
      const limitChoicesMatch = field.limit_choices_to.match(/['"]parent_lookup__name['"]\s*:\s*['"]([^'"]+)['"]/);

      if (limitChoicesMatch && limitChoicesMatch[1]) {
        const parentLookupName = limitChoicesMatch[1];

        // Call the lookup API
        this.apiService.executeApiCall(`/lookups/?name=${encodeURIComponent(parentLookupName)}`, 'GET').subscribe({
          next: (response) => {
            // Handle the response - assuming it returns an array of lookup items
            if (response && Array.isArray(response)) {
              this.relationOptions[field.name] = response.map((item: any) => ({
                id: item.id || item.pk,
                display: item.name || item.label || item.display_name || 'Unknown'
              }));
            } else if (response && response.results) {
              // Handle paginated response
              this.relationOptions[field.name] = response.results.map((item: any) => ({
                id: item.id || item.pk,
                display: item.name || item.label || item.display_name || 'Unknown'
              }));
            } else {
              this.relationOptions[field.name] = [];
            }
          },
          error: (error) => {
            console.error(`Error loading lookup options for ${field.name}:`, error);
            this.relationOptions[field.name] = [];
            this.snackBar.open(`Failed to load options for ${this.formatColumnName(field.name)}`, 'Close', { duration: 3000 });
          }
        });
      }
    } else if (field.related_model) {
      // For other related models, try to load from their respective endpoints
      const modelParts = field.related_model.split('.');
      const modelName = modelParts[modelParts.length - 1];

      // Try to load from a standard endpoint pattern
      this.apiService.executeApiCall(`/${modelName}/`, 'GET').subscribe({
        next: (response) => {
          if (response && Array.isArray(response)) {
            this.relationOptions[field.name] = response.map((item: any) => ({
              id: item.id || item.pk,
              display: item.name || item.username || item.title || `${modelName} ${item.id || item.pk}`
            }));
          } else if (response && response.results) {
            this.relationOptions[field.name] = response.results.map((item: any) => ({
              id: item.id || item.pk,
              display: item.name || item.username || item.title || `${modelName} ${item.id || item.pk}`
            }));
          } else {
            this.relationOptions[field.name] = [];
          }
        },
        error: (error) => {
          console.error(`Error loading options for ${field.name}:`, error);
          this.relationOptions[field.name] = [];
        }
      });
    }
  }

  // FIXED: Get form fields method - return all fields that should be in forms
  getFormFields(resource: any): any[] {
    if (!resource.fields) {
      console.log('No fields found for resource:', resource.name);
      return [];
    }

    console.log('All fields for resource', resource.name, ':', resource.fields);

    // Filter out read-only fields and ensure field exists and has a name
    const formFields = resource.fields.filter((field: any) => {
      if (!field) {
        console.log('Skipping null/undefined field');
        return false;
      }
      if (!field.name) {
        console.log('Skipping field without name:', field);
        return false;
      }
      if (!field.type) {
        console.log('Skipping field without type:', field.name);
        return false;
      }
      if (field.read_only) {
        console.log('Skipping read-only field:', field.name);
        return false;
      }
      console.log('Including field in form:', field.name, '(', field.type, ')');
      return true;
    });

    console.log('Final form fields for', resource.name, ':', formFields);
    return formFields;
  }

  // FIXED: Get detail fields method - return all fields for detail view
  getDetailFields(resource: any): any[] {
    if (!resource.fields) {
      return [];
    }

    // Return all fields that exist and have a name
    return resource.fields.filter((field: any) =>
      field &&
      field.name
    );
  }

  submitForm(resource: any): void {
    // First, check if the form is valid
    if (!this.dynamicForm.valid) {
      // Mark all controls as touched to show validation messages
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const formData = this.dynamicForm.value;

    let path: string;
    let method: string;

    // Determine if it's a create or update operation
    if (this.editingRecord) {
      // Editing existing record
      path = this.cleanPath(resource.detailEndpoint.path, this.editingRecord.id || this.editingRecord.pk);
      method = 'PUT';
    } else {
      // Creating new record
      path = this.cleanPath(resource.listEndpoint.path);
      method = 'POST';
    }

    // Execute the API call using ApiService
    this.apiService.executeApiCall(path, method, formData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.showForm = false;

        this.snackBar.open(
          `${resource.name} ${this.editingRecord ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 3000 }
        );

        this.loadResourceData(resource); // Refresh the list data
      },
      error: (error) => {
        this.submitting = false;

        if (error.status === 400 && error.error) {
          const serverErrors = error.error;

          // Assign backend validation errors to specific fields
          for (const field in serverErrors) {
            if (this.dynamicForm.get(field)) {
              this.dynamicForm.get(field)?.setErrors({
                serverError: serverErrors[field]
              });
            } else {
              console.warn(`Form field '${field}' was not found in the form group.`);
            }
          }

          this.snackBar.open(
            'There were validation errors in the form. Please fix them and try again.',
            'Close',
            { duration: 4000, panelClass: 'error-snackbar' }
          );
        } else {
          // Handle unexpected errors
          console.error('Unexpected error submitting form:', error);

          this.snackBar.open(
            `Failed to ${this.editingRecord ? 'update' : 'create'} ${resource.name}`,
            'Close',
            { duration: 3000, panelClass: 'error-snackbar' }
          );
        }
      }
    });
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedResource = null;
    this.editingRecord = null;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedResource = null;
    this.detailRecord = null;
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.dynamicForm.get(fieldName);
    if (!control || !control.errors) {
      return [];
    }

    const errors: string[] = [];

    // Check for server errors
    if (control.errors['serverError']) {
      if (Array.isArray(control.errors['serverError'])) {
        errors.push(...control.errors['serverError']);
      } else {
        errors.push(control.errors['serverError']);
      }
    }

    // Log for debugging
    if (errors.length > 0) {
      console.log(`Field ${fieldName} has errors:`, errors);
    }

    return errors;
  }

  cleanPath(path: string, id?: any): string {
    let cleanedPath = path.replace(/\/$/, ''); // Remove trailing slash

    if (id) {
      cleanedPath = cleanedPath.replace(/<pk>/, id);
    }

    cleanedPath = cleanedPath.replace(/<[^>]+>/g, ''); // Replace other path parameters
    cleanedPath = cleanedPath.replace(/\.<format>/, ''); // Remove format parameter
    cleanedPath = cleanedPath.replace(/\./, ''); // Remove remaining dots
    cleanedPath = cleanedPath.replace(/\?\?$/, ''); // Remove trailing ??

    return cleanedPath;
  }
}
