// src/app/reports/components/report-editor/report-editor.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

// Material imports
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';

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
    DragDropModule,
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
    DataSourceSelectorComponent,
    FieldBuilderComponent,
    FilterBuilderComponent,
    ParameterBuilderComponent,
    ReportPreviewComponent
  ],
  templateUrl: 'report-editor.component.html',
  styleUrl: 'report-editor.component.css',
})
export class ReportEditorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  mode: 'create' | 'edit' = 'create';
  report: Report | null = null;
  isDirty = false;
  isSaving = false;
  isValid = false;
  progressValue = 0;

  // Form
  basicInfoForm: FormGroup;

  // Report components
  dataSources: DataSource[] = [];
  fields: Field[] = [];
  filters: Filter[] = [];
  parameters: Parameter[] = [];

  // Tags
  tags: string[] = [];
  separatorKeysCodes = [13, 188]; // Enter, Comma

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
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
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.loadReport(parseInt(id));
    } else {
      this.mode = 'create';
      this.initializeNewReport();
    }

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

  loadReport(id: number): void {
    this.reportService.getReport(id).subscribe({
      next: (report) => {
        this.report = report;
        this.populateForm(report);
        this.loadReportComponents();
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.snackBar.open('Error loading report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/reports']);
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
  }

  loadReportComponents(): void {
    if (!this.report?.id) return;

    // Load data sources
    this.reportService.getDataSources(this.report.id).subscribe({
      next: (dataSources) => {
        this.dataSources = dataSources;
      }
    });

    // Load fields
    this.reportService.getFields(this.report.id).subscribe({
      next: (fields) => {
        this.fields = fields;
      }
    });

    // Load filters
    this.reportService.getFilters(this.report.id).subscribe({
      next: (filters) => {
        this.filters = filters;
      }
    });

    // Load parameters
    this.reportService.getParameters(this.report.id).subscribe({
      next: (parameters) => {
        this.parameters = parameters;
      }
    });
  }

  onStepChange(event: any): void {
    this.progressValue = ((event.selectedIndex + 1) / 6) * 100;
  }

  addTag(event: any): void {
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

  onDataSourcesChange(dataSources: DataSource[]): void {
    this.dataSources = dataSources;
    this.isDirty = true;
    this.validateReport();
  }

  onFieldsChange(fields: Field[]): void {
    this.fields = fields;
    this.isDirty = true;
    this.validateReport();
  }

  onFiltersChange(filters: Filter[]): void {
    this.filters = filters;
    this.isDirty = true;
    this.validateReport();
  }

  onParametersChange(parameters: Parameter[]): void {
    this.parameters = parameters;
    this.isDirty = true;
    this.validateReport();
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

  async saveReport(showMessage = true): Promise<void> {
    if (!this.isValid) return;

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
          this.mode = 'edit';

          // Save components
          await this.saveReportComponents();

          if (showMessage) {
            this.snackBar.open('Report created successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }

          // Navigate to edit mode
          this.router.navigate(['/reports', newReport.id, 'edit']);
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
      this.snackBar.open('Error saving report', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSaving = false;
    }
  }

  async saveReportComponents(): Promise<void> {
    if (!this.report?.id) return;

    // This would typically save all components
    // For now, we'll assume the sub-components handle their own saving
    console.log('Saving report components...');
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
