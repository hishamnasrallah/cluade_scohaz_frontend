// src/app/components/template-builder/pdf-generate/pdf-generate.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, debounceTime, switchMap, map, startWith } from 'rxjs';

import { PDFTemplate, PDFGenerationLog } from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';
import { ApiService } from '../../../services/api.service';

interface UserOption {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
}

@Component({
  selector: 'app-pdf-generate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="generate-container">
      <!-- Header -->
      <div class="page-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-info">
          <h1>Generate PDF Report</h1>
          <p *ngIf="template">{{ template.name || '' }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading template...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <h3>Error Loading Template</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadTemplate()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper" *ngIf="template && !loading && !error">
        <mat-stepper linear #stepper>
          <!-- Step 1: Parameters -->
          <mat-step [stepControl]="parametersForm" label="Fill Parameters">
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>Template Parameters</mat-card-title>
                <mat-card-subtitle>
                  Fill in the required information to generate your PDF report
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="parametersForm" class="parameters-form">
                  <div class="form-grid">
                    <ng-container *ngFor="let param of template.parameters">
                      <div class="form-field" [ngSwitch]="param.widget_type">

                        <!-- Text Input -->
                        <mat-form-field appearance="outline" *ngSwitchCase="'text'">
                          <mat-label>{{ param.display_name }}</mat-label>
                          <input matInput
                                 [formControlName]="param.parameter_key"
                                 [placeholder]="param.description || ''"
                                 [required]="param.is_required">
                          <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                          <mat-error>{{ getErrorMessage(param) }}</mat-error>
                        </mat-form-field>

                        <!-- Number Input -->
                        <mat-form-field appearance="outline" *ngSwitchCase="'number'">
                          <mat-label>{{ param.display_name }}</mat-label>
                          <input matInput
                                 type="number"
                                 [formControlName]="param.parameter_key"
                                 [placeholder]="param.description || ''"
                                 [required]="param.is_required">
                          <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                          <mat-error>{{ getErrorMessage(param) }}</mat-error>
                        </mat-form-field>

                        <!-- Date Picker -->
                        <mat-form-field appearance="outline" *ngSwitchCase="'date'">
                          <mat-label>{{ param.display_name }}</mat-label>
                          <input matInput
                                 [matDatepicker]="picker"
                                 [formControlName]="param.parameter_key"
                                 [required]="param.is_required">
                          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                          <mat-datepicker #picker></mat-datepicker>
                          <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                          <mat-error>{{ getErrorMessage(param) }}</mat-error>
                        </mat-form-field>

                        <!-- Select Dropdown -->
                        <mat-form-field appearance="outline" *ngSwitchCase="'select'">
                          <mat-label>{{ param.display_name }}</mat-label>
                          <mat-select [formControlName]="param.parameter_key"
                                     [required]="param.is_required">
                            <mat-option *ngFor="let choice of param.choices"
                                       [value]="choice.value">
                              {{ choice.label }}
                            </mat-option>
                          </mat-select>
                          <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                          <mat-error>{{ getErrorMessage(param) }}</mat-error>
                        </mat-form-field>

                        <!-- Checkbox -->
                        <div class="checkbox-field" *ngSwitchCase="'checkbox'">
                          <mat-checkbox [formControlName]="param.parameter_key">
                            {{ param.display_name }}
                          </mat-checkbox>
                          <p class="field-description" *ngIf="param.description">
                            {{ param.description }}
                          </p>
                        </div>

                        <!-- User Search -->
                        <mat-form-field appearance="outline" *ngSwitchCase="'user_search'">
                          <mat-label>{{ param.display_name }}</mat-label>
                          <input matInput
                                 [formControlName]="param.parameter_key + '_display'"
                                 [matAutocomplete]="userAuto"
                                 [required]="param.is_required"
                                 placeholder="Search by name or email">
                          <mat-autocomplete #userAuto="matAutocomplete"
                                           [displayWith]="displayUser"
                                           (optionSelected)="onUserSelected($event, param.parameter_key)">
                            <mat-option *ngFor="let user of filteredUsers$ | async"
                                       [value]="user">
                              <div class="user-option">
                                <span class="user-name">{{ user.full_name || user.username }}</span>
                                <span class="user-email">{{ user.email }}</span>
                              </div>
                            </mat-option>
                          </mat-autocomplete>
                          <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                          <mat-error>{{ getErrorMessage(param) }}</mat-error>
                        </mat-form-field>

                        <!-- Default -->
                        <mat-form-field appearance="outline" *ngSwitchDefault>
                          <mat-label>{{ param.display_name }}</mat-label>
                          <input matInput
                                 [formControlName]="param.parameter_key"
                                 [placeholder]="param.description || ''"
                                 [required]="param.is_required">
                          <mat-hint>Widget: {{ param.widget_type }}</mat-hint>
                        </mat-form-field>
                      </div>
                    </ng-container>
                  </div>

                  <div class="form-info" *ngIf="template.allow_other_generation">
                    <mat-icon>info</mat-icon>
                    <p>This template allows generating reports for other users.</p>
                  </div>
                </form>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button (click)="resetForm()">
                  <mat-icon>refresh</mat-icon>
                  Reset
                </button>
                <button mat-raised-button color="primary"
                        matStepperNext
                        [disabled]="!parametersForm.valid">
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 2: Options -->
          <mat-step [stepControl]="optionsForm" label="Generation Options">
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>PDF Options</mat-card-title>
                <mat-card-subtitle>
                  Configure how you want to generate the PDF
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="optionsForm" class="options-form">
                  <mat-form-field appearance="outline" *ngIf="template.supports_bilingual">
                    <mat-label>Language</mat-label>
                    <mat-select formControlName="language">
                      <mat-option value="en">English</mat-option>
                      <mat-option value="ar">Arabic</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Filename (optional)</mat-label>
                    <input matInput formControlName="filename"
                           placeholder="Leave empty for default">
                    <mat-hint>Default: {{ template.code }}_{{ getCurrentDate() }}.pdf</mat-hint>
                  </mat-form-field>

                  <div class="generate-for-section" *ngIf="template.allow_other_generation && canGenerateForOthers">
                    <h3>Generate for Another User</h3>
                    <mat-form-field appearance="outline">
                      <mat-label>Select User (optional)</mat-label>
                      <input matInput
                             formControlName="generate_for_display"
                             [matAutocomplete]="targetUserAuto"
                             placeholder="Leave empty to generate for yourself">
                      <mat-autocomplete #targetUserAuto="matAutocomplete"
                                       [displayWith]="displayUser"
                                       (optionSelected)="onTargetUserSelected($event)">
                        <mat-option *ngFor="let user of filteredTargetUsers$ | async"
                                   [value]="user">
                          <div class="user-option">
                            <span class="user-name">{{ user.full_name || user.username }}</span>
                            <span class="user-email">{{ user.email }}</span>
                          </div>
                        </mat-option>
                      </mat-autocomplete>
                      <mat-hint>You have permission to generate reports for other users</mat-hint>
                    </mat-form-field>
                  </div>
                </form>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Previous
                </button>
                <button mat-raised-button color="primary" matStepperNext>
                  Next
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>

          <!-- Step 3: Review & Generate -->
          <mat-step label="Review & Generate">
            <mat-card class="step-card">
              <mat-card-header>
                <mat-card-title>Review Your Request</mat-card-title>
                <mat-card-subtitle>
                  Confirm the details before generating the PDF
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="review-section">
                  <h3>Template</h3>
                  <div class="review-item">
                    <span class="label">Name:</span>
                    <span class="value">{{ template.name || '' }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Code:</span>
                    <span class="value">{{ template.code || '' }}</span>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="review-section">
                  <h3>Parameters</h3>
                  <div class="review-item" *ngFor="let param of template.parameters">
                    <span class="label">{{ param.display_name }}:</span>
                    <span class="value">{{ getParameterDisplayValue(param) }}</span>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="review-section">
                  <h3>Options</h3>
                  <div class="review-item" *ngIf="template.supports_bilingual">
                    <span class="label">Language:</span>
                    <span class="value">{{ optionsForm.get('language')?.value === 'ar' ? 'Arabic' : 'English' }}</span>
                  </div>
                  <div class="review-item">
                    <span class="label">Filename:</span>
                    <span class="value">{{ getFilename() }}</span>
                  </div>
                  <div class="review-item" *ngIf="optionsForm.get('generate_for_user_id')?.value">
                    <span class="label">Generate for:</span>
                    <span class="value">{{ optionsForm.get('generate_for_display')?.value?.full_name || 'Self' }}</span>
                  </div>
                </div>

                <div class="generation-status" *ngIf="generating">
                  <mat-spinner diameter="40"></mat-spinner>
                  <p>Generating your PDF...</p>
                </div>

                <div class="generation-success" *ngIf="generationSuccess">
                  <mat-icon>check_circle</mat-icon>
                  <h3>PDF Generated Successfully!</h3>
                  <p>Your PDF has been downloaded.</p>
                  <button mat-raised-button color="primary" (click)="generateAnother()">
                    <mat-icon>add</mat-icon>
                    Generate Another
                  </button>
                </div>
              </mat-card-content>

              <mat-card-actions *ngIf="!generating && !generationSuccess">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Previous
                </button>
                <button mat-raised-button color="primary" (click)="generatePDF()">
                  <mat-icon>picture_as_pdf</mat-icon>
                  Generate PDF
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-step>
        </mat-stepper>

        <!-- Recent Generations -->
        <mat-card class="recent-generations" *ngIf="recentLogs.length > 0">
          <mat-card-header>
            <mat-card-title>Recent Generations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="log-item" *ngFor="let log of recentLogs">
              <mat-icon [class]="'status-' + log.status">
                {{ log.status === 'completed' ? 'check_circle' :
                   log.status === 'failed' ? 'error' : 'pending' }}
              </mat-icon>
              <div class="log-info">
                <span class="log-filename">{{ log.file_name }}</span>
                <span class="log-date">{{ formatDate(log.created_at) }}</span>
              </div>
              <span class="log-size" *ngIf="log.file_size">
                {{ formatFileSize(log.file_size) }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .generate-container {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f8fafb;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .back-btn {
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-info p {
      margin: 0;
      color: #6b7280;
    }

    /* Loading & Error States */
    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      gap: 16px;
      text-align: center;
    }

    .error-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ef4444;
    }

    .error-state h3 {
      margin: 0;
      color: #1f2937;
    }

    .error-state p {
      margin: 0;
      color: #6b7280;
    }

    /* Stepper */
    ::ng-deep {
      .mat-stepper-horizontal {
        background: transparent;
      }

      .mat-step-header {
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        margin: 0 8px 24px 8px;
      }

      .mat-step-header.cdk-keyboard-focused,
      .mat-step-header.cdk-program-focused,
      .mat-step-header:hover {
        background: white;
      }
    }

    /* Step Cards */
    .step-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    mat-card-subtitle {
      color: #6b7280;
    }

    /* Forms */
    .parameters-form,
    .options-form {
      max-width: 800px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-field {
      mat-form-field {
        width: 100%;
      }
    }

    .checkbox-field {
      padding: 12px 0;
    }

    .field-description {
      margin: 4px 0 0 32px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .form-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      margin-top: 16px;

      mat-icon {
        color: #3b82f6;
        margin-top: 2px;
      }

      p {
        margin: 0;
        color: #4b5563;
      }
    }

    /* User Autocomplete */
    .user-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: 500;
      color: #1f2937;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Generate For Section */
    .generate-for-section {
      margin-top: 24px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    /* Review Section */
    .review-section {
      margin: 24px 0;

      h3 {
        margin: 0 0 16px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .review-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;

      .label {
        color: #6b7280;
        font-weight: 500;
      }

      .value {
        color: #1f2937;

        &.code {
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
        }
      }
    }

    mat-divider {
      margin: 24px 0;
    }

    /* Generation Status */
    .generation-status,
    .generation-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      gap: 16px;
    }

    .generation-success {
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #10b981;
      }

      h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #1f2937;
      }

      p {
        margin: 0;
        color: #6b7280;
      }
    }

    /* Recent Generations */
    .recent-generations {
      margin-top: 32px;
    }

    .log-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;

        &.status-completed { color: #10b981; }
        &.status-failed { color: #ef4444; }
        &.status-pending,
        &.status-processing { color: #f59e0b; }
      }
    }

    .log-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .log-filename {
      font-weight: 500;
      color: #1f2937;
    }

    .log-date {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .log-size {
      font-size: 0.875rem;
      color: #6b7280;
    }

    /* Card Actions */
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      margin: 0 -16px -16px -16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .generate-container {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .review-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class PDFGenerateComponent implements OnInit {
  templateId!: number;
  template: PDFTemplate | null = null;
  parametersForm!: FormGroup;
  optionsForm!: FormGroup;

  // State
  loading = true;
  error = '';
  generating = false;
  generationSuccess = false;
  canGenerateForOthers = false;

  // Data
  recentLogs: PDFGenerationLog[] = [];
  filteredUsers$!: Observable<UserOption[]>;
  filteredTargetUsers$!: Observable<UserOption[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private pdfTemplateService: PDFTemplateService,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.templateId = +params['id'];
      this.loadTemplate();
    });

    // Check permissions
    this.canGenerateForOthers = true; // This should come from auth service
  }

  loadTemplate(): void {
    this.loading = true;
    this.error = '';

    this.pdfTemplateService.getTemplate(this.templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.initializeForms();
        this.loadRecentLogs();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.error = 'Failed to load template. Please try again.';
        this.loading = false;
      }
    });
  }

  private initializeForms(): void {
    if (!this.template) return;

    // Initialize parameters form
    const paramControls: any = {};
    this.template.parameters?.forEach(param => {
      const validators = [];
      if (param.is_required) {
        validators.push(Validators.required);
      }

      // Add type-specific validators
      if (param.parameter_type === 'integer' || param.parameter_type === 'float') {
        if (param.validation_rules?.min !== undefined) {
          validators.push(Validators.min(param.validation_rules.min));
        }
        if (param.validation_rules?.max !== undefined) {
          validators.push(Validators.max(param.validation_rules.max));
        }
      }

      paramControls[param.parameter_key] = [param.default_value || '', validators];

      // Add display control for user search
      if (param.widget_type === 'user_search') {
        paramControls[param.parameter_key + '_display'] = [''];
      }
    });

    this.parametersForm = this.fb.group(paramControls);

    // Initialize options form
    this.optionsForm = this.fb.group({
      language: [this.template.primary_language],
      filename: [''],
      generate_for_user_id: [null],
      generate_for_display: ['']
    });

    // Setup user search autocomplete
    this.setupUserSearch();
  }

  private setupUserSearch(): void {
    // Setup for parameter user search
    this.template?.parameters?.forEach(param => {
      if (param.widget_type === 'user_search') {
        const displayControl = this.parametersForm.get(param.parameter_key + '_display');
        if (displayControl) {
          this.filteredUsers$ = displayControl.valueChanges.pipe(
            startWith(''),
            debounceTime(300),
            switchMap(value => this.searchUsers(value))
          );
        }
      }
    });

    // Setup for target user search
    const targetUserControl = this.optionsForm.get('generate_for_display');
    if (targetUserControl) {
      this.filteredTargetUsers$ = targetUserControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        switchMap(value => this.searchUsers(value))
      );
    }
  }

  private searchUsers(query: string | UserOption): Observable<UserOption[]> {
    const searchTerm = typeof query === 'string' ? query : query?.username || '';

    // Mock user search - replace with actual API call
    return new Observable(observer => {
      // Simulate API delay
      setTimeout(() => {
        const mockUsers: UserOption[] = [
          { id: 1, username: 'john.doe', email: 'john@example.com', full_name: 'John Doe' },
          { id: 2, username: 'jane.smith', email: 'jane@example.com', full_name: 'Jane Smith' },
          { id: 3, username: 'bob.wilson', email: 'bob@example.com', full_name: 'Bob Wilson' }
        ];

        const filtered = mockUsers.filter(user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        observer.next(filtered);
        observer.complete();
      }, 500);
    });
  }

  displayUser(user: UserOption | null): string {
    return user ? (user.full_name || user.username) : '';
  }

  onUserSelected(event: any, paramKey: string): void {
    const user = event.option.value as UserOption;
    this.parametersForm.patchValue({
      [paramKey]: user.id
    });
  }

  onTargetUserSelected(event: any): void {
    const user = event.option.value as UserOption;
    this.optionsForm.patchValue({
      generate_for_user_id: user.id
    });
  }

  resetForm(): void {
    this.parametersForm.reset();
    this.template?.parameters?.forEach(param => {
      if (param.default_value) {
        this.parametersForm.patchValue({
          [param.parameter_key]: param.default_value
        });
      }
    });
  }

  getErrorMessage(param: any): string {
    const control = this.parametersForm.get(param.parameter_key);
    if (control?.hasError('required')) {
      return `${param.display_name} is required`;
    }
    if (control?.hasError('min')) {
      return `${param.display_name} must be at least ${param.validation_rules?.min}`;
    }
    if (control?.hasError('max')) {
      return `${param.display_name} must be at most ${param.validation_rules?.max}`;
    }
    return '';
  }

  getParameterDisplayValue(param: any): string {
    const value = this.parametersForm.get(param.parameter_key)?.value;

    if (param.widget_type === 'user_search') {
      const displayValue = this.parametersForm.get(param.parameter_key + '_display')?.value;
      return displayValue?.full_name || displayValue?.username || value || 'Not selected';
    }

    if (param.widget_type === 'checkbox') {
      return value ? 'Yes' : 'No';
    }

    if (param.parameter_type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    return value || 'Not provided';
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getFilename(): string {
    const customFilename = this.optionsForm.get('filename')?.value;
    if (customFilename) {
      return customFilename.endsWith('.pdf') ? customFilename : `${customFilename}.pdf`;
    }
    return `${this.template?.code}_${this.getCurrentDate()}.pdf`;
  }

  generatePDF(): void {
    if (!this.parametersForm.valid || !this.template) return;

    this.generating = true;

    const parameters = this.parametersForm.value;
    // Remove display fields
    Object.keys(parameters).forEach(key => {
      if (key.endsWith('_display')) {
        delete parameters[key];
      }
    });

    const request = {
      template_id: this.template.id!,
      parameters,
      language: this.optionsForm.get('language')?.value,
      filename: this.getFilename(),
      generate_for_user_id: this.optionsForm.get('generate_for_user_id')?.value
    };

    this.pdfTemplateService.generatePDF(request).subscribe({
      next: (response) => {
        const blob = response.body;
        if (blob) {
          this.pdfTemplateService.downloadPDF(blob, request.filename!);
          this.generationSuccess = true;
          this.generating = false;
          this.loadRecentLogs();
        }
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
        this.snackBar.open('Failed to generate PDF', 'Close', { duration: 3000 });
        this.generating = false;
      }
    });
  }

  generateAnother(): void {
    this.generationSuccess = false;
    this.resetForm();
    // Reset stepper to first step
  }

  private loadRecentLogs(): void {
    if (!this.template) return;

    const params = new URLSearchParams({
      template: this.template.id!.toString(),
      generated_by: 'current_user' // This should use actual user ID
    });

    this.pdfTemplateService.getGenerationLogs().subscribe({
      next: (response) => {
        this.recentLogs = response.results.slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading logs:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  goBack(): void {
    this.router.navigate(['/settings/pdf-templates']);
  }
}
