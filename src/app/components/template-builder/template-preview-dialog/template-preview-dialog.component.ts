// src/app/components/template-builder/template-preview-dialog/template-preview-dialog.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  PDFTemplate,
  TemplatePreview,
  ValidateParametersResponse
} from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';

@Component({
  selector: 'app-template-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="preview-dialog">
      <mat-dialog-content>
        <div class="dialog-header">
          <h2>{{ data.template.name }}</h2>
          <div class="header-actions">
            <button mat-icon-button (click)="toggleFullscreen()" matTooltip="Toggle fullscreen">
              <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
            </button>
            <button mat-icon-button mat-dialog-close>
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>

        <mat-tab-group [(selectedIndex)]="selectedTab">
          <!-- Parameters Tab -->
          <mat-tab label="Parameters" *ngIf="data.template.requires_parameters">
            <div class="tab-content parameters-tab">
              <form [formGroup]="parametersForm" class="parameters-form">
                <div class="form-description">
                  <mat-icon>info</mat-icon>
                  <p>Fill in the required parameters to generate the PDF</p>
                </div>

                <div class="parameters-grid">
                  <ng-container *ngFor="let param of data.template.parameters">
                    <div class="parameter-field" [ngSwitch]="param.widget_type">
                      <!-- Text Input -->
                      <mat-form-field appearance="outline" *ngSwitchCase="'text'">
                        <mat-label>{{ param.display_name }}</mat-label>
                        <input matInput [formControlName]="param.parameter_key"
                               [placeholder]="param.description || ''"
                               [required]="param.is_required">
                        <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                        <mat-error>{{ param.display_name }} is required</mat-error>
                      </mat-form-field>

                      <!-- Number Input -->
                      <mat-form-field appearance="outline" *ngSwitchCase="'number'">
                        <mat-label>{{ param.display_name }}</mat-label>
                        <input matInput
                               [formControlName]="param.parameter_key"
                               [placeholder]="param.description || ''"
                               [required]="param.is_required">
                        <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                        <mat-error>{{ param.display_name }} is required</mat-error>
                      </mat-form-field>

                      <!-- Date Picker -->
                      <mat-form-field appearance="outline" *ngSwitchCase="'date'">
                        <mat-label>{{ param.display_name }}</mat-label>
                        <input matInput [matDatepicker]="picker"
                               [formControlName]="param.parameter_key"
                               [required]="param.is_required">
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        <mat-hint *ngIf="param.description">{{ param.description }}</mat-hint>
                        <mat-error>{{ param.display_name }} is required</mat-error>
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
                        <mat-error>{{ param.display_name }} is required</mat-error>
                      </mat-form-field>

                      <!-- Checkbox -->
                      <div class="checkbox-field" *ngSwitchCase="'checkbox'">
                        <mat-checkbox [formControlName]="param.parameter_key">
                          {{ param.display_name }}
                        </mat-checkbox>
                        <p class="checkbox-description" *ngIf="param.description">
                          {{ param.description }}
                        </p>
                      </div>

                      <!-- Default case -->
                      <mat-form-field appearance="outline" *ngSwitchDefault>
                        <mat-label>{{ param.display_name }}</mat-label>
                        <input matInput [formControlName]="param.parameter_key"
                               [placeholder]="param.description || ''"
                               [required]="param.is_required">
                        <mat-hint>Widget type: {{ param.widget_type }}</mat-hint>
                      </mat-form-field>
                    </div>
                  </ng-container>
                </div>

                <div class="form-actions">
                  <button mat-button (click)="resetParameters()">
                    <mat-icon>refresh</mat-icon>
                    Reset
                  </button>
                  <button mat-raised-button color="primary"
                          (click)="validateAndPreview()"
                          [disabled]="!parametersForm.valid || validating">
                    <mat-icon>check</mat-icon>
                    {{ validating ? 'Validating...' : 'Validate & Preview' }}
                  </button>
                </div>
              </form>
            </div>
          </mat-tab>

          <!-- Data Preview Tab -->
          <mat-tab label="Data Preview" [disabled]="!previewData">
            <div class="tab-content data-preview-tab">
              <div class="preview-header">
                <h3>Data that will be used in the template</h3>
                <button mat-button (click)="refreshPreview()">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              </div>

              <mat-accordion *ngIf="previewData">
                <mat-expansion-panel *ngFor="let item of getDataItems()" [expanded]="item.key === 'main'">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      {{ item.key }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ getDataTypeDescription(item.value) }}
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="data-content">
                    <pre>{{ item.value | json }}</pre>
                  </div>
                </mat-expansion-panel>
              </mat-accordion>

              <div class="parameters-used" *ngIf="previewData?.parameters_used">
                <h4>Parameters Used</h4>
                <mat-chip-set>
                  <mat-chip *ngFor="let param of getParameterEntries()">
                    <strong>{{ param.key }}:</strong> {{ param.value }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </mat-tab>

          <!-- PDF Preview Tab -->
          <mat-tab label="PDF Preview" [disabled]="!pdfUrl">
            <div class="tab-content pdf-preview-tab">
              <div class="preview-toolbar">
                <button mat-button (click)="generatePDF()">
                  <mat-icon>refresh</mat-icon>
                  Regenerate
                </button>
                <button mat-button (click)="downloadPDF()">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
                <button mat-button (click)="printPDF()">
                  <mat-icon>print</mat-icon>
                  Print
                </button>
              </div>

              <div class="pdf-container" *ngIf="pdfUrl">
                <iframe [src]="pdfUrl" frameborder="0"></iframe>
              </div>

              <div class="generating-state" *ngIf="generatingPDF">
                <mat-spinner></mat-spinner>
                <p>Generating PDF...</p>
              </div>
            </div>
          </mat-tab>

          <!-- Template Info Tab -->
          <mat-tab label="Template Info">
            <div class="tab-content info-tab">
              <div class="info-section">
                <h3>Basic Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name:</label>
                    <span>{{ data.template.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>Code:</label>
                    <span class="code">{{ data.template.code }}</span>
                  </div>
                  <div class="info-item">
                    <label>Language:</label>
                    <span>{{ data.template.primary_language === 'ar' ? 'Arabic' : 'English' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Bilingual:</label>
                    <span>{{ data.template.supports_bilingual ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Page Size:</label>
                    <span>{{ data.template.page_size }}</span>
                  </div>
                  <div class="info-item">
                    <label>Orientation:</label>
                    <span>{{ data.template.orientation }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h3>Data Source</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Type:</label>
                    <span>{{ data.template.data_source_type }}</span>
                  </div>
                  <div class="info-item" *ngIf="data.template.content_type_display">
                    <label>Model:</label>
                    <span>{{ data.template.content_type_display }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h3>Permissions</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Self Generation:</label>
                    <span>{{ data.template.allow_self_generation ? 'Allowed' : 'Not Allowed' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Generate for Others:</label>
                    <span>{{ data.template.allow_other_generation ? 'Allowed' : 'Not Allowed' }}</span>
                  </div>
                  <div class="info-item" *ngIf="data.template.groups && data.template.groups.length > 0">
                    <label>Restricted to Groups:</label>
                    <span>{{ data.template.groups.length }} groups</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h3>Metadata</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Created by:</label>
                    <span>{{ data.template.created_by_name || 'System' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Created at:</label>
                    <span>{{ formatDate(data.template.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Last updated:</label>
                    <span>{{ formatDate(data.template.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary"
                (click)="generateAndDownload()"
                [disabled]="data.template.requires_parameters && !parametersForm.valid">
          <mat-icon>picture_as_pdf</mat-icon>
          Generate PDF
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .preview-dialog {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    mat-dialog-content {
      flex: 1;
      padding: 0;
      max-height: none;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: white;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
    }

    .tab-content {
      padding: 24px;
      height: 100%;
      overflow-y: auto;
    }

    /* Parameters Tab */
    .parameters-form {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-description {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;
      margin-bottom: 24px;

      mat-icon {
        color: #3b82f6;
      }

      p {
        margin: 0;
        color: #4b5563;
      }
    }

    .parameters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .parameter-field {
      mat-form-field {
        width: 100%;
      }
    }

    .checkbox-field {
      padding: 8px 0;
    }

    .checkbox-description {
      margin: 4px 0 0 32px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    /* Data Preview Tab */
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .preview-header h3 {
      margin: 0;
      color: #1f2937;
    }

    .data-content {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;

      pre {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .parameters-used {
      margin-top: 24px;
      padding: 16px;
      background: #f3f4f6;
      border-radius: 8px;

      h4 {
        margin: 0 0 12px 0;
        color: #4b5563;
      }

      mat-chip {
        font-size: 0.875rem;
      }
    }

    /* PDF Preview Tab */
    .pdf-preview-tab {
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .preview-toolbar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .pdf-container {
      flex: 1;
      position: relative;
      background: #e5e7eb;

      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    }

    .generating-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      gap: 16px;

      p {
        color: #6b7280;
      }
    }

    /* Template Info Tab */
    .info-section {
      margin-bottom: 32px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
      }

      span {
        color: #1f2937;

        &.code {
          font-family: monospace;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }
    }

    /* Dialog Actions */
    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      gap: 12px;
    }
  `]
})
export class TemplatePreviewDialogComponent implements OnInit {
  parametersForm!: FormGroup;
  selectedTab = 0;
  isFullscreen = false;

  // State
  validating = false;
  generatingPDF = false;
  previewData: TemplatePreview | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  pdfBlob: Blob | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { template: PDFTemplate },
    private dialogRef: MatDialogRef<TemplatePreviewDialogComponent>,
    private fb: FormBuilder,
    private pdfTemplateService: PDFTemplateService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // If no parameters required, go directly to PDF preview
    if (!this.data.template.requires_parameters) {
      this.selectedTab = 2;
      this.generatePDF();
    }
  }

  private initializeForm(): void {
    const controls: any = {};

    if (this.data.template.parameters) {
      this.data.template.parameters.forEach(param => {
        const validators = [];
        if (param.is_required) {
          validators.push((control: any) => control.value !== null && control.value !== '' ? null : { required: true });
        }

        controls[param.parameter_key] = [
          param.default_value || '',
          validators
        ];
      });
    }

    this.parametersForm = this.fb.group(controls);
  }

  resetParameters(): void {
    this.parametersForm.reset();
    this.data.template.parameters?.forEach(param => {
      if (param.default_value) {
        this.parametersForm.patchValue({
          [param.parameter_key]: param.default_value
        });
      }
    });
  }

  validateAndPreview(): void {
    if (!this.parametersForm.valid) {
      Object.keys(this.parametersForm.controls).forEach(key => {
        const control = this.parametersForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.validating = true;
    const parameters = this.parametersForm.value;

    // Validate parameters
    this.pdfTemplateService.validateParameters(this.data.template.id!, parameters).subscribe({
      next: (response) => {
        if (response.valid) {
          // Load preview data
          this.loadPreviewData(parameters);
        } else {
          this.snackBar.open(response.error || 'Invalid parameters', 'Close', { duration: 3000 });
        }
        this.validating = false;
      },
      error: (error) => {
        console.error('Error validating parameters:', error);
        this.snackBar.open('Failed to validate parameters', 'Close', { duration: 3000 });
        this.validating = false;
      }
    });
  }

  private loadPreviewData(parameters: any): void {
    this.pdfTemplateService.previewData(this.data.template.id!, parameters).subscribe({
      next: (preview) => {
        this.previewData = preview;
        this.selectedTab = 1; // Switch to data preview tab
      },
      error: (error) => {
        console.error('Error loading preview data:', error);
        this.snackBar.open('Failed to load preview data', 'Close', { duration: 3000 });
      }
    });
  }

  refreshPreview(): void {
    if (this.parametersForm.valid) {
      this.loadPreviewData(this.parametersForm.value);
    }
  }

  generatePDF(): void {
    const parameters = this.data.template.requires_parameters ? this.parametersForm.value : {};

    this.generatingPDF = true;
    this.pdfTemplateService.testGenerate(this.data.template.id!, parameters).subscribe({
      next: (blob) => {
        this.pdfBlob = blob;
        const url = window.URL.createObjectURL(blob);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.selectedTab = 2; // Switch to PDF preview tab
        this.generatingPDF = false;
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
        this.snackBar.open('Failed to generate PDF', 'Close', { duration: 3000 });
        this.generatingPDF = false;
      }
    });
  }

  downloadPDF(): void {
    if (this.pdfBlob) {
      this.pdfTemplateService.downloadPDF(this.pdfBlob, `${this.data.template.code}_preview.pdf`);
    }
  }

  printPDF(): void {
    if (this.pdfUrl) {
      window.print();
    }
  }

  generateAndDownload(): void {
    const parameters = this.data.template.requires_parameters ? this.parametersForm.value : {};

    this.pdfTemplateService.generatePDF({
      template_id: this.data.template.id!,
      parameters
    }).subscribe({
      next: (response) => {
        const blob = response.body;
        if (blob) {
          this.pdfTemplateService.downloadPDF(blob, `${this.data.template.code}.pdf`);
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
        this.snackBar.open('Failed to generate PDF', 'Close', { duration: 3000 });
      }
    });
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      this.dialogRef.updateSize('100vw', '100vh');
      this.dialogRef.updatePosition({ top: '0', left: '0' });
    } else {
      this.dialogRef.updateSize('90vw', '90vh');
      this.dialogRef.updatePosition();
    }
  }

  // Helper methods
  getDataItems(): any[] {
    if (!this.previewData?.data) return [];
    return Object.entries(this.previewData.data).map(([key, value]) => ({ key, value }));
  }

  getDataTypeDescription(value: any): string {
    if (Array.isArray(value)) {
      return `Array (${value.length} items)`;
    }
    if (value && typeof value === 'object') {
      if (value.model) {
        return `Model: ${value.model}`;
      }
      return `Object (${Object.keys(value).length} properties)`;
    }
    return typeof value;
  }

  getParameterEntries(): any[] {
    if (!this.previewData?.parameters_used) return [];
    return Object.entries(this.previewData.parameters_used).map(([key, value]) => ({ key, value }));
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }
}
