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
    console.log('Data sources before save:', this.dataSources);

    try {
      // Step 1: Save data sources FIRST and wait for all to complete
      const dataSourceMap = new Map<number, number>(); // Map old ID to new ID

      // Save all new data sources
      for (const ds of this.dataSources) {
        if (!ds.id || ds.id < 0) {
          console.log('Saving data source:', ds);

          const dataSourceData = {
            report: this.report.id,
            content_type_id: ds.content_type_id,
            alias: ds.alias,
            is_primary: ds.is_primary,
            select_related: ds.select_related || [],
            prefetch_related: ds.prefetch_related || []
          };

          try {
            const saved = await this.reportService.createDataSource(dataSourceData).toPromise();
            console.log('Saved data source:', saved);

            if (saved && saved.id) {
              // Map both the temporary ID and content_type_id to the new ID
              if (ds.id) {
                dataSourceMap.set(ds.id, saved.id);
              }
              if (ds.content_type_id) {
                dataSourceMap.set(ds.content_type_id, saved.id);
              }

              // Update the data source in our array
              const index = this.dataSources.indexOf(ds);
              if (index >= 0) {
                this.dataSources[index] = saved;
              }
            }
          } catch (err) {
            console.error('Error saving data source:', ds, err);
            throw new Error(`Failed to save data source: ${ds.alias}`);
          }
        }
      }

      console.log('Data source map after save:', dataSourceMap);
      console.log('Updated data sources:', this.dataSources);

      // Step 2: Save fields with corrected data source references
      for (const field of this.fields) {
        if (!field.id || field.id < 0) {
          // Find the correct data source ID
          let correctedDataSource = field.data_source;

          // Try to map from our saved data sources
          if (dataSourceMap.has(field.data_source)) {
            correctedDataSource = dataSourceMap.get(field.data_source)!;
          } else {
            // If not in map, find by content_type_id
            const originalDs = this.dataSources.find(ds =>
              ds.id === field.data_source ||
              ds.content_type_id === field.data_source
            );

            if (originalDs && originalDs.id && originalDs.id > 0) {
              correctedDataSource = originalDs.id;
            }
          }

          console.log(`Field ${field.field_path}: mapping data_source ${field.data_source} to ${correctedDataSource}`);

          // In the save fields section (around line 570)
          const fieldData = {
            report: this.report.id,
            data_source: correctedDataSource,
            field_path: field.field_path,
            field_name: field.field_name || field.field_path,
            display_name: field.display_name,
            field_type: typeof field.field_type === 'string' && field.field_type.includes('Field')
              ? this.getFieldTypeCode(field.field_type)
              : field.field_type, // If it's already a code, use it as is
            aggregation: field.aggregation || '',
            order: field.order,
            is_visible: field.is_visible,
            width: field.width || null,
            formatting: field.formatting || {}
          };

          console.log('Creating field with data:', fieldData);

          try {
            const saved = await this.reportService.createField(fieldData).toPromise();
            if (saved) {
              const index = this.fields.indexOf(field);
              if (index >= 0) {
                this.fields[index] = saved;
              }
            }
          } catch (err: any) {
            console.error('Error saving field:', field, err);
            console.error('Error response:', err.error);
            throw new Error(`Failed to save field ${field.display_name}: ${JSON.stringify(err.error)}`);
          }
        }
      }

      // Step 3: Save filters with corrected data source references
      for (const filter of this.filters) {
        if (!filter.id || filter.id < 0) {
          // Find the correct data source ID
          let correctedDataSource = filter.data_source;

          if (dataSourceMap.has(filter.data_source)) {
            correctedDataSource = dataSourceMap.get(filter.data_source)!;
          } else {
            const originalDs = this.dataSources.find(ds =>
              ds.id === filter.data_source ||
              ds.content_type_id === filter.data_source
            );

            if (originalDs && originalDs.id && originalDs.id > 0) {
              correctedDataSource = originalDs.id;
            }
          }

          const filterData = {
            ...filter,
            report: this.report.id,
            data_source: correctedDataSource,
            id: undefined
          };

          try {
            const saved = await this.reportService.createFilter(filterData).toPromise();
            if (saved) {
              const index = this.filters.indexOf(filter);
              if (index >= 0) {
                this.filters[index] = saved;
              }
            }
          } catch (err) {
            console.error('Error saving filter:', filter, err);
            throw new Error(`Failed to save filter: ${filter.field_path}`);
          }
        }
      }

      // Step 4: Save parameters
      for (const param of this.parameters) {
        if (!param.id || param.id < 0) {
          const paramData = {
            ...param,
            report: this.report.id,
            id: undefined
          };

          try {
            const saved = await this.reportService.createParameter(paramData).toPromise();
            if (saved) {
              const index = this.parameters.indexOf(param);
              if (index >= 0) {
                this.parameters[index] = saved;
              }
            }
          } catch (err) {
            console.error('Error saving parameter:', param, err);
            throw new Error(`Failed to save parameter: ${param.name}`);
          }
        }
      }

    } catch (error) {
      console.error('Error saving report components:', error);
      throw error;
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

  private getFieldTypeCode(fieldTypeName: string): string {
    const typeMapping: Record<string, string> = {
      'BigAutoField': 'NUMBER',
      'AutoField': 'NUMBER',
      'IntegerField': 'NUMBER',
      'BigIntegerField': 'NUMBER',
      'SmallIntegerField': 'NUMBER',
      'PositiveIntegerField': 'NUMBER',
      'PositiveSmallIntegerField': 'NUMBER',
      'FloatField': 'DECIMAL',
      'DecimalField': 'DECIMAL',
      'CharField': 'TEXT',
      'TextField': 'TEXTAREA',
      'SlugField': 'SLUG',
      'BooleanField': 'BOOLEAN',
      'NullBooleanField': 'BOOLEAN',
      'DateField': 'DATE',
      'DateTimeField': 'DATETIME',
      'TimeField': 'TIME',
      'EmailField': 'EMAIL',
      'URLField': 'URL',
      'FileField': 'FILE',
      'ImageField': 'IMAGE',
      'ForeignKey': 'FOREIGN_KEY',
      'ManyToManyField': 'MANY_TO_MANY',
      'OneToOneField': 'ONE_TO_ONE',
      'UUIDField': 'UUID',
      'GenericIPAddressField': 'IP_ADDRESS',
      'JSONField': 'JSON'
    };

    return typeMapping[fieldTypeName] || 'TEXT';
  }

}
