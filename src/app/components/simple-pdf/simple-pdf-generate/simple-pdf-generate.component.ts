// src/app/components/simple-pdf/simple-pdf-generate/simple-pdf-generate.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SimplePDFTemplate, SimplePDFGenerateRequest } from '../../../models/simple-pdf.models';
import { SimplePDFService } from '../../../services/simple-pdf.service';

@Component({
  selector: 'app-simple-pdf-generate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="generate-container">
      <!-- Header -->
      <mat-card class="header-card">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-info">
              <h1>Generate PDF</h1>
              <p *ngIf="template">{{ template.name }}</p>
            </div>
          </div>
        </div>
      </mat-card>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading template...</p>
      </div>

      <!-- Error State -->
      <mat-card class="error-state" *ngIf="error && !loading">
        <mat-icon>error_outline</mat-icon>
        <h3>Error Loading Template</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadTemplate()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </mat-card>

      <!-- Generate Form -->
      <mat-card *ngIf="template && !loading && !error" class="generate-card">
        <mat-card-header>
          <mat-card-title>Generate PDF Report</mat-card-title>
          <mat-card-subtitle>
            Configure generation options for "{{ template.name }}"
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="generateForm">
            <!-- Template Info -->
            <div class="template-info">
              <div class="info-item">
                <span class="label">Template Code:</span>
                <span class="value">{{ template.code }}</span>
              </div>
              <div class="info-item">
                <span class="label">Page Size:</span>
                <span class="value">{{ template.page_size }}</span>
              </div>
              <div class="info-item" *ngIf="template.content_type_display">
                <span class="label">Data Source:</span>
                <span class="value">{{ template.content_type_display }}</span>
              </div>
              <div class="info-item">
                <span class="label">Elements:</span>
                <span class="value">{{ template.elements?.length || 0 }} elements</span>
              </div>
            </div>

            <!-- Object ID Input -->
            <mat-form-field appearance="outline" class="full-width"
                           *ngIf="template.content_type">
              <mat-label>Object ID (Optional)</mat-label>
              <input matInput type="number" formControlName="object_id"
                     placeholder="Leave empty to use first matching object">
              <mat-hint>
                Specify an ID to generate the report for a specific {{ template.content_type_display }} record
              </mat-hint>
            </mat-form-field>

            <!-- Preview Data -->
            <div class="preview-section" *ngIf="template.content_type">
              <h3>Data Preview</h3>
              <p class="hint">The PDF will be generated using data from the configured model.</p>

              <div class="filter-info" *ngIf="hasFilters()">
                <strong>Applied Filters:</strong>
                <div class="filter-list">
                  <span *ngFor="let filter of getFilterList()" class="filter-chip">
                    {{ filter.field }} = {{ filter.value }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Generation Status -->
            <div class="generation-status" *ngIf="generating">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Generating your PDF...</p>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="goBack()">Cancel</button>
          <button mat-raised-button color="primary"
                  (click)="generatePDF()"
                  [disabled]="generating">
            <mat-icon>picture_as_pdf</mat-icon>
            {{ generating ? 'Generating...' : 'Generate PDF' }}
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- No Data Source Message -->
      <mat-card *ngIf="template && !template.content_type && !loading && !error"
                class="no-data-source">
        <mat-card-content>
          <mat-icon>info</mat-icon>
          <h3>No Data Source Configured</h3>
          <p>This template doesn't have a data source configured. It will generate a static PDF.</p>
          <button mat-raised-button color="primary" (click)="generateStaticPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Generate Static PDF
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .generate-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f5f5f5;
    }

    /* Header */
    .header-card {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .header-info p {
      margin: 0;
      color: #666;
    }

    /* Loading & Error States */
    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      gap: 16px;
    }

    .error-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
    }

    .error-state h3 {
      margin: 0;
      color: #333;
    }

    .error-state p {
      margin: 0;
      color: #666;
    }

    /* Generate Card */
    .generate-card {
      mat-card-header {
        margin-bottom: 24px;
      }

      mat-card-title {
        font-size: 1.25rem;
      }
    }

    /* Template Info */
    .template-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
      }
    }

    /* Form */
    .full-width {
      width: 100%;
    }

    /* Preview Section */
    .preview-section {
      margin: 24px 0;

      h3 {
        margin: 0 0 8px 0;
        font-size: 1.125rem;
      }

      .hint {
        margin: 0 0 16px 0;
        color: #666;
        font-size: 0.875rem;
      }
    }

    .filter-info {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #90caf9;

      strong {
        display: block;
        margin-bottom: 8px;
        color: #1976d2;
      }
    }

    .filter-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-chip {
      background: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.875rem;
      border: 1px solid #90caf9;
    }

    /* Generation Status */
    .generation-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;

      p {
        margin: 0;
        color: #666;
      }
    }

    /* No Data Source */
    .no-data-source {
      text-align: center;

      mat-card-content {
        padding: 60px;
      }

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #1976d2;
        margin-bottom: 16px;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 1.25rem;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
      }
    }

    /* Actions */
    mat-card-actions {
      padding: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .generate-container {
        padding: 16px;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  `]
})
export class SimplePDFGenerateComponent implements OnInit {
  templateId!: number;
  template: SimplePDFTemplate | null = null;
  generateForm!: FormGroup;

  loading = true;
  error = '';
  generating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private simplePdfService: SimplePDFService,
    private snackBar: MatSnackBar
  ) {
    this.generateForm = this.fb.group({
      object_id: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.templateId = +params['id'];
      this.loadTemplate();
    });
  }

  loadTemplate(): void {
    this.loading = true;
    this.error = '';

    this.simplePdfService.getTemplate(this.templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading template:', error);
        this.error = 'Failed to load template. Please try again.';
        this.loading = false;
      }
    });
  }

  hasFilters(): boolean {
    return !!(this.template?.query_filter &&
      Object.keys(this.template.query_filter).length > 0);
  }

  getFilterList(): Array<{field: string, value: any}> {
    if (!this.template?.query_filter) return [];

    return Object.entries(this.template.query_filter).map(([field, value]) => ({
      field,
      value
    }));
  }

  generatePDF(): void {
    this.generating = true;

    const request: SimplePDFGenerateRequest = {
      template_id: this.templateId,
      object_id: this.generateForm.get('object_id')?.value || undefined
    };

    this.simplePdfService.generatePDF(request).subscribe({
      next: (response) => {
        const blob = response.body;
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${this.template?.code || 'report'}.pdf`;

        // Extract filename from Content-Disposition if available
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        if (blob) {
          this.simplePdfService.downloadPDF(blob, filename);
          this.snackBar.open('PDF generated successfully!', 'Close', { duration: 3000 });
          this.generating = false;
        }
      },
      error: (error) => {
        console.error('Error generating PDF:', error);
        let errorMessage = 'Failed to generate PDF';

        if (error.status === 404) {
          errorMessage = 'No data found for the specified criteria';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.generating = false;
      }
    });
  }

  generateStaticPDF(): void {
    this.generatePDF();
  }

  goBack(): void {
    this.router.navigate(['/simple-pdf']);
  }
}
