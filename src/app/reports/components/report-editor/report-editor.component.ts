// src/app/reports/components/report-editor/report-editor.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize, switchMap } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// Material imports
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services and Models
import { ReportService } from '../../../services/report.service';
import { Report, DataSource, Field, Filter, Parameter } from '../../../models/report.models';

// Sub-components
import { DataSourceSelectorComponent } from '../data-source-selector/data-source-selector.component';
import { FieldBuilderComponent } from '../field-builder/field-builder.component';
import { FilterBuilderComponent } from '../filter-builder/filter-builder.component';
import { ParameterBuilderComponent } from '../parameter-builder/parameter-builder.component';
import { ReportPreviewComponent } from '../report-preview/report-preview.component';

@Component({
  selector: 'app-report-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    DataSourceSelectorComponent,
    FieldBuilderComponent,
    FilterBuilderComponent,
    ParameterBuilderComponent,
    ReportPreviewComponent
  ],
  templateUrl: 'report-editor.component.html',
  styleUrl: 'report-editor.component.scss',
})
export class ReportEditorComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private destroy$ = new Subject<void>();

  mode: 'create' | 'edit' = 'create';
  report: Report | null = null;
  isDirty = false;
  isSaving = false;
  isValid = false;
  progressValue = 0;
  isLoadingComponents = false;
  componentsLoaded = false;

  // Form
  basicInfoForm: FormGroup;

  // Report components
  dataSources: DataSource[] = [];
  fields: Field[] = [];
  filters: Filter[] = [];
  parameters: Parameter[] = [];

  // Tags
  tags: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  private reportId: number | null = null;


  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      report_type: ['ad_hoc', Validators.required],
      category: [''],
      is_active: [true],
      is_public: [false]
    });
  }

  ngOnInit(): void {
    // First check if we're in create or edit mode based on initial route
    const initialId = this.route.snapshot.paramMap.get('id');

    if (!initialId) {
      // Create mode - initialize immediately
      this.mode = 'create';
      this.reportId = null;
      this.initializeNewReport();
      this.componentsLoaded = true;
    }

    // Subscribe to route parameter changes
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params.get('id');
      const newReportId = id ? parseInt(id) : null;

      // Only process if the report ID has actually changed
      if (newReportId !== this.reportId) {
        if (newReportId) {
          // Switching to edit mode
          this.reportId = newReportId;
          this.mode = 'edit';
          this.resetEditorState();
          this.loadReport(newReportId);
        } else if (this.reportId !== null) {
          // Switching from edit to create mode
          this.reportId = null;
          this.mode = 'create';
          this.resetEditorState();
          this.initializeNewReport();
          this.componentsLoaded = true;
        }
      }
    });

    // Subscribe to form changes
    this.basicInfoForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isDirty = true;
        this.validateReport();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private resetEditorState(): void {
    // Reset state
    this.isDirty = false;
    this.isSaving = false;
    this.isValid = false;
    this.progressValue = 0;
    this.isLoadingComponents = false;
    this.componentsLoaded = false;

    // Reset forms
    this.basicInfoForm.reset({
      report_type: 'ad_hoc',
      is_active: true,
      is_public: false
    });

    // Reset component data
    this.tags = [];
    this.dataSources = [];
    this.fields = [];
    this.filters = [];
    this.parameters = [];

    // Reset report object
    this.report = null;

    // Reset stepper to first step
    if (this.stepper) {
      this.stepper.reset();
    }
  }

  loadReport(id: number): void {
    this.isLoadingComponents = true;

    this.reportService.getReport(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error loading report:', err);
          this.snackBar.open('Error loading report', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/reports']);
          return of(null);
        })
      )
      .subscribe(report => {
        if (report) {
          this.report = report;
          this.populateForm(report);
          this.loadReportComponents();
        } else {
          this.isLoadingComponents = false;
          this.componentsLoaded = false;
        }
      });
  }

  initializeNewReport(): void {
    this.report = {
      name: '',
      report_type: 'ad_hoc',
      is_active: true,
      is_public: false,
      tags: [],
      shared_with_users: [],
      shared_with_groups: []
    };
  }

  populateForm(report: Report): void {
    this.basicInfoForm.patchValue({
      name: report.name,
      description: report.description,
      report_type: report.report_type,
      category: report.category,
      is_active: report.is_active,
      is_public: report.is_public
    });
    this.tags = report.tags || [];

    // Force change detection
    this.cdr.detectChanges();
  }

  loadReportComponents(): void {
    if (!this.report?.id) {
      this.isLoadingComponents = false;
      this.componentsLoaded = true;
      return;
    }

    this.isLoadingComponents = true;

    // Load all components in parallel
    forkJoin({
      dataSources: this.reportService.getDataSources(this.report.id).pipe(
        catchError(err => {
          console.error('Error loading data sources:', err);
          return of([]);
        })
      ),
      fields: this.reportService.getFields(this.report.id).pipe(
        catchError(err => {
          console.error('Error loading fields:', err);
          return of([]);
        })
      ),
      filters: this.reportService.getFilters(this.report.id).pipe(
        catchError(err => {
          console.error('Error loading filters:', err);
          return of([]);
        })
      ),
      parameters: this.reportService.getParameters(this.report.id).pipe(
        catchError(err => {
          console.error('Error loading parameters:', err);
          return of([]);
        })
      )
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingComponents = false;
          this.componentsLoaded = true;
          this.validateReport();
          // Force change detection to update all bindings
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          // Ensure data sources have all required properties
          this.dataSources = result.dataSources.map(ds => ({
            ...ds,
            // Ensure these properties exist even if not returned by API
            select_related: ds.select_related || [],
            prefetch_related: ds.prefetch_related || [],
            available_fields: ds.available_fields || []
          }));

          this.fields = result.fields;
          this.filters = result.filters;
          this.parameters = result.parameters;

          // Log for debugging
          console.log('Report components loaded:', {
            dataSources: this.dataSources,
            fields: this.fields.length,
            filters: this.filters.length,
            parameters: this.parameters.length
          });

          // Force change detection after data is loaded
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading report components:', err);
          this.snackBar.open('Error loading report components', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onStepChange(event: any): void {
    this.progressValue = ((event.selectedIndex + 1) / 6) * 100;
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      this.isDirty = true;
    }
    event.chipInput?.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.isDirty = true;
    }
  }

  async onDataSourcesChange(dataSources: DataSource[]): Promise<void> {
    console.log('ReportEditor - onDataSourcesChange:', dataSources);
    this.dataSources = [...dataSources]; // Create new array reference
    this.isDirty = true;
    this.validateReport();

    // Force change detection to ensure child components receive the update
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  onFieldsChange(fields: Field[]): void {
    this.fields = [...fields]; // Create new array reference
    this.isDirty = true;
    this.validateReport();
    this.cdr.detectChanges();
  }

  onFiltersChange(filters: Filter[]): void {
    this.filters = [...filters]; // Create new array reference
    this.isDirty = true;
    this.validateReport();
    this.cdr.detectChanges();
  }

  onParametersChange(parameters: Parameter[]): void {
    this.parameters = [...parameters]; // Create new array reference
    this.isDirty = true;
    this.validateReport();
    this.cdr.detectChanges();
  }

  validateReport(): void {
    this.isValid =
      this.basicInfoForm.valid &&
      this.dataSources.length > 0 &&
      this.fields.length > 0;
  }

  async saveDraft(): Promise<void> {
    if (!this.basicInfoForm.valid) {
      this.snackBar.open('Please fill in required fields', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    await this.saveReport(false);
  }

  async saveReport(showMessage = true, switchToEditMode = true): Promise<void> {
    if (!this.basicInfoForm.valid) return;

    // Validate components
    const validation = this.validateComponents();
    if (!validation.valid) {
      this.snackBar.open(validation.errors.join('. '), 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSaving = true;

    const reportData: Partial<Report> = {
      ...this.basicInfoForm.value,
      tags: this.tags
    };

    try {
      if (this.mode === 'create' || !this.report?.id) {
        // Create new report
        const newReport = await this.reportService.createReport(reportData).toPromise();
        if (newReport) {
          this.report = newReport;

          // Save components
          await this.saveReportComponents();

          if (showMessage) {
            this.snackBar.open('Report created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }

          // Only switch to edit mode if explicitly requested
          if (switchToEditMode) {
            this.mode = 'edit';
            // Navigate to edit mode
            this.router.navigate(['/reports', newReport.id, 'edit'], { replaceUrl: true });
          }
        }
      } else {
        // Update existing report
        await this.reportService.updateReport(this.report.id, reportData).toPromise();

        // Save components
        await this.saveReportComponents();

        if (showMessage) {
          this.snackBar.open('Report updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      }

      this.isDirty = false;
    } catch (error) {
      console.error('Error saving report:', error);

      // If we created a new report but failed to save components, offer to retry
      if (this.mode === 'create' && this.report?.id) {
        const retry = confirm('Failed to save some report components. Would you like to retry?');
        if (retry) {
          try {
            await this.saveReportComponents();
            this.snackBar.open('Report components saved successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            this.snackBar.open('Failed to save some components. Please try editing the report.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        }
      } else {
        this.snackBar.open('Error saving report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    } finally {
      this.isSaving = false;
    }
  }

  async saveReportComponents(): Promise<void> {
    if (!this.report?.id) return;

    console.log('Saving report components...');

    try {
      // Save data sources
      const dataSourcePromises = this.dataSources
        .filter(ds => !ds.id || ds.id < 0) // Only save new data sources (with temp IDs)
        .map(ds => {
          const dataSourceData = {
            ...ds,
            report: this.report!.id,
            id: undefined // Remove temporary ID
          };
          return this.reportService.createDataSource(dataSourceData).toPromise();
        });

      const savedDataSources = await Promise.all(dataSourcePromises);
      console.log('Saved data sources:', savedDataSources);

      // Update local data sources with saved IDs
      const dataSourceMap = new Map<number, number>(); // Map temp ID to real ID
      this.dataSources.forEach((ds, index) => {
        if (ds.id && ds.id < 0) {
          const saved = savedDataSources.find(s => s?.alias === ds.alias);
          if (saved && saved.id) {
            dataSourceMap.set(ds.id, saved.id);
            this.dataSources[index] = saved;
          }
        }
      });

      // Save fields with updated data source references
      const fieldPromises = this.fields
        .filter(field => !field.id || field.id < 0)
        .map(field => {
          const fieldData = {
            ...field,
            report: this.report!.id,
            // Update data_source reference if it was a temp ID
            data_source: dataSourceMap.get(field.data_source) || field.data_source,
            id: undefined // Remove temporary ID
          };
          return this.reportService.createField(fieldData).toPromise();
        });

      const savedFields = await Promise.all(fieldPromises);
      console.log('Saved fields:', savedFields);

      // Update local fields with saved data
      this.fields = this.fields.map(field => {
        if (field.id && field.id < 0) {
          const saved = savedFields.find(s =>
            s?.field_path === field.field_path &&
            s?.data_source === (dataSourceMap.get(field.data_source) || field.data_source)
          );
          return saved || field;
        }
        return field;
      });

      // Save filters with updated data source references
      const filterPromises = this.filters
        .filter(filter => !filter.id || filter.id < 0)
        .map(filter => {
          const filterData = {
            ...filter,
            report: this.report!.id,
            // Update data_source reference if it was a temp ID
            data_source: dataSourceMap.get(filter.data_source) || filter.data_source,
            id: undefined // Remove temporary ID
          };
          return this.reportService.createFilter(filterData).toPromise();
        });

      const savedFilters = await Promise.all(filterPromises);
      console.log('Saved filters:', savedFilters);

      // Update local filters with saved data
      this.filters = this.filters.map(filter => {
        if (filter.id && filter.id < 0) {
          const saved = savedFilters.find(s =>
            s?.field_path === filter.field_path &&
            s?.data_source === (dataSourceMap.get(filter.data_source) || filter.data_source)
          );
          return saved || filter;
        }
        return filter;
      });

      // Save parameters
      const parameterPromises = this.parameters
        .filter(param => !param.id || param.id < 0)
        .map(param => {
          const paramData = {
            ...param,
            report: this.report!.id,
            id: undefined // Remove temporary ID
          };
          return this.reportService.createParameter(paramData).toPromise();
        });

      const savedParameters = await Promise.all(parameterPromises);
      console.log('Saved parameters:', savedParameters);

      // Update local parameters with saved data
      this.parameters = this.parameters.map(param => {
        if (param.id && param.id < 0) {
          const saved = savedParameters.find(s => s?.name === param.name);
          return saved || param;
        }
        return param;
      });

    } catch (error) {
      console.error('Error saving report components:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }
  private validateComponents(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate data sources
    if (this.dataSources.length === 0) {
      errors.push('At least one data source is required');
    }

    // Validate fields
    if (this.fields.length === 0) {
      errors.push('At least one field is required');
    }

    // Check for fields without proper data source references
    const validDataSourceIds = new Set(this.dataSources.map(ds => ds.id || ds.content_type_id));
    const invalidFields = this.fields.filter(f => !validDataSourceIds.has(f.data_source));
    if (invalidFields.length > 0) {
      errors.push(`${invalidFields.length} fields have invalid data source references`);
    }

    // Check for filters without proper data source references
    const invalidFilters = this.filters.filter(f => !validDataSourceIds.has(f.data_source));
    if (invalidFilters.length > 0) {
      errors.push(`${invalidFilters.length} filters have invalid data source references`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async saveAndExecute(): Promise<void> {
    await this.saveReport(false);

    if (this.report?.id) {
      this.router.navigate(['/reports', this.report.id, 'execute']);
    }
  }

  goBack(): void {
    if (this.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/reports']);
      }
    } else {
      this.router.navigate(['/reports']);
    }
  }
}
