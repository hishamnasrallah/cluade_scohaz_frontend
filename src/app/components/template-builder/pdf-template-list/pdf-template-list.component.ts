// src/app/components/template-builder/pdf-template-list/pdf-template-list.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

import { PDFTemplate, TemplateCategory } from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';
import { TemplatePreviewDialogComponent } from '../template-preview-dialog/template-preview-dialog.component';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-pdf-template-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDivider
  ],
  template: `
    <div class="template-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <mat-icon class="header-icon">description</mat-icon>
            <div>
              <h1>PDF Templates</h1>
              <p>Create and manage PDF report templates</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createNewTemplate()">
              <mat-icon>add</mat-icon>
              New Template
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search templates</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search by name or code">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="filterType" (selectionChange)="applyFilter()">
              <mat-option value="">All Types</mat-option>
              <mat-option value="model">Model Query</mat-option>
              <mat-option value="raw_sql">Raw SQL</mat-option>
              <mat-option value="custom_function">Custom Function</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Language</mat-label>
            <mat-select [(ngModel)]="filterLanguage" (selectionChange)="applyFilter()">
              <mat-option value="">All Languages</mat-option>
              <mat-option value="en">English</mat-option>
              <mat-option value="ar">Arabic</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button (click)="clearFilters()" *ngIf="hasActiveFilters()">
            <mat-icon>clear</mat-icon>
            Clear Filters
          </button>
        </div>
      </mat-card>

      <!-- Templates Tabs -->
      <mat-tab-group [(selectedIndex)]="selectedTab" (selectedIndexChange)="onTabChange($event)">
        <!-- My Templates -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>person</mat-icon>
            <span>My Templates ({{ myTemplates.length }})</span>
          </ng-template>
          <ng-container *ngTemplateOutlet="templateGrid; context: { templates: myTemplates }"></ng-container>
        </mat-tab>

        <!-- Self Service -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>account_circle</mat-icon>
            <span>Self Service ({{ selfServiceTemplates.length }})</span>
          </ng-template>
          <ng-container *ngTemplateOutlet="templateGrid; context: { templates: selfServiceTemplates }"></ng-container>
        </mat-tab>

        <!-- Shared -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>group</mat-icon>
            <span>Shared ({{ sharedTemplates.length }})</span>
          </ng-template>
          <ng-container *ngTemplateOutlet="templateGrid; context: { templates: sharedTemplates }"></ng-container>
        </mat-tab>

        <!-- System -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>settings_applications</mat-icon>
            <span>System ({{ systemTemplates.length }})</span>
          </ng-template>
          <ng-container *ngTemplateOutlet="templateGrid; context: { templates: systemTemplates }"></ng-container>
        </mat-tab>
      </mat-tab-group>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading templates...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && getFilteredTemplates().length === 0">
        <img src="assets/images/empty-templates.svg" alt="No templates" class="empty-image">
        <h3>No templates found</h3>
        <p>{{ hasActiveFilters() ? 'Try adjusting your filters' : 'Create your first template to get started' }}</p>
        <button mat-raised-button color="primary" (click)="createNewTemplate()" *ngIf="!hasActiveFilters()">
          <mat-icon>add</mat-icon>
          Create Template
        </button>
      </div>
    </div>

    <!-- Template Grid Template -->
    <ng-template #templateGrid let-templates="templates">
      <div class="templates-grid" *ngIf="!loading">
        <mat-card
          *ngFor="let template of getFilteredTemplatesFromList(templates)"
          class="template-card"
          (click)="openTemplate(template)">

          <!-- Card Header -->
          <div class="card-header">
            <div class="template-type-icon" [class]="'type-' + template.data_source_type">
              <mat-icon>{{ getTypeIcon(template.data_source_type) }}</mat-icon>
            </div>
            <button mat-icon-button
                    [matMenuTriggerFor]="menu"
                    (click)="$event.stopPropagation()"
                    class="card-menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="editTemplate(template)">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item (click)="duplicateTemplate(template)">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>
              <button mat-menu-item (click)="previewTemplate(template)">
                <mat-icon>visibility</mat-icon>
                <span>Preview</span>
              </button>
              <button mat-menu-item (click)="generatePDF(template)">
                <mat-icon>picture_as_pdf</mat-icon>
                <span>Generate PDF</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="exportTemplate(template)">
                <mat-icon>download</mat-icon>
                <span>Export</span>
              </button>
              <button mat-menu-item
                      (click)="deleteTemplate(template)"
                      color="warn"
                      [disabled]="!template.can_delete">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </div>

          <!-- Card Content -->
          <mat-card-content>
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-code">{{ template.code }}</p>
            <p class="template-description">{{ template.description || 'No description' }}</p>

            <!-- Template Info -->
            <div class="template-info">
              <div class="info-item">
                <mat-icon>language</mat-icon>
                <span>{{ template.primary_language === 'ar' ? 'Arabic' : 'English' }}</span>
              </div>
              <div class="info-item" *ngIf="template.requires_parameters">
                <mat-icon>tune</mat-icon>
                <span>{{ template.parameters?.length || 0 }} Parameters</span>
              </div>
              <div class="info-item" *ngIf="template.created_by_name">
                <mat-icon>person</mat-icon>
                <span>{{ template.created_by_name }}</span>
              </div>
            </div>

            <!-- Template Tags -->
            <div class="template-tags">
              <mat-chip-set>
                <mat-chip *ngIf="template.supports_bilingual" color="primary">
                  <mat-icon>translate</mat-icon>
                  Bilingual
                </mat-chip>
                <mat-chip *ngIf="template.allow_self_generation">
                  <mat-icon>person</mat-icon>
                  Self Service
                </mat-chip>
                <mat-chip *ngIf="template.allow_other_generation" color="accent">
                  <mat-icon>group</mat-icon>
                  For Others
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>

          <!-- Card Footer -->
          <mat-card-actions>
            <span class="last-updated">
              Updated {{ formatDate(template.updated_at || template.created_at) }}
            </span>
            <button mat-button color="primary" (click)="generatePDF(template); $event.stopPropagation()">
              <mat-icon>picture_as_pdf</mat-icon>
              Generate
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </ng-template>
  `,
  styles: [`
    .template-list-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #34c5aa, #2ba99b);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .header-left h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-left p {
      margin: 0;
      color: #6b7280;
    }

    /* Filters */
    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    /* Tabs */
    ::ng-deep {
      .mat-mdc-tab-labels {
        background: white;
        border-radius: 12px 12px 0 0;
        padding: 0 16px;
      }

      .mat-mdc-tab-label {
        height: 56px;

        .mat-icon {
          margin-right: 8px;
        }
      }

      .mat-mdc-tab-body-wrapper {
        background: #f8fafb;
        border-radius: 0 0 12px 12px;
        padding: 24px;
      }
    }

    /* Template Grid */
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .template-card {
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: -16px -16px 16px -16px;
      padding: 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .template-type-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.type-model {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
      }

      &.type-raw_sql {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      &.type-custom_function {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }

      &.type-api {
        background: linear-gradient(135deg, #ec4899, #db2777);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .card-menu {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .template-card:hover .card-menu {
      opacity: 1;
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .template-name {
      margin: 0 0 4px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .template-code {
      margin: 0 0 12px 0;
      font-size: 0.875rem;
      color: #6b7280;
      font-family: monospace;
    }

    .template-description {
      margin: 0 0 16px 0;
      color: #4b5563;
      line-height: 1.5;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .template-info {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: #6b7280;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .template-tags {
      margin-bottom: 16px;

      mat-chip {
        font-size: 0.75rem;
        height: 24px;
        padding: 0 8px;

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin: 0 -16px -16px -16px;
      border-top: 1px solid #e5e7eb;
    }

    .last-updated {
      font-size: 0.875rem;
      color: #9ca3af;
    }

    /* Loading State */
    .loading-container {
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

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 12px;
      margin: 24px 0;

      .empty-image {
        width: 200px;
        height: 200px;
        margin-bottom: 24px;
        opacity: 0.5;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 1.5rem;
        color: #1f2937;
      }

      p {
        margin: 0 0 24px 0;
        color: #6b7280;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .template-list-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;

        .search-field {
          width: 100%;
        }
      }

      .templates-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PDFTemplateListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data
  allTemplates: PDFTemplate[] = [];
  myTemplates: PDFTemplate[] = [];
  selfServiceTemplates: PDFTemplate[] = [];
  sharedTemplates: PDFTemplate[] = [];
  systemTemplates: PDFTemplate[] = [];

  // UI State
  loading = true;
  selectedTab = 0;
  searchTerm = '';
  filterType = '';
  filterLanguage = '';

  constructor(
    private router: Router,
    private pdfTemplateService: PDFTemplateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.loading = true;
    this.pdfTemplateService.getMyTemplates().subscribe({
      next: (category) => {
        this.myTemplates = category.my_templates;
        this.selfServiceTemplates = category.self_service;
        this.sharedTemplates = category.shared_templates;
        this.systemTemplates = category.system_templates;

        this.allTemplates = [
          ...this.myTemplates,
          ...this.selfServiceTemplates,
          ...this.sharedTemplates,
          ...this.systemTemplates
        ];

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.loading = false;
        this.snackBar.open('Failed to load templates', 'Close', { duration: 3000 });
      }
    });
  }

  createNewTemplate(): void {
    this.router.navigate(['/settings/pdf-templates/new']);
  }

  openTemplate(template: PDFTemplate): void {
    if (template.can_edit) {
      this.editTemplate(template);
    } else {
      this.previewTemplate(template);
    }
  }

  editTemplate(template: PDFTemplate): void {
    this.router.navigate(['/settings/pdf-templates/edit', template.id]);
  }

  duplicateTemplate(template: PDFTemplate): void {
    const newName = prompt('Enter name for the duplicated template:', `${template.name} (Copy)`);
    if (newName) {
      this.pdfTemplateService.duplicateTemplate(template.id!, newName).subscribe({
        next: (newTemplate) => {
          this.snackBar.open('Template duplicated successfully', 'Close', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error duplicating template:', error);
          this.snackBar.open('Failed to duplicate template', 'Close', { duration: 3000 });
        }
      });
    }
  }

  previewTemplate(template: PDFTemplate): void {
    const dialogRef = this.dialog.open(TemplatePreviewDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      data: { template }
    });
  }

  generatePDF(template: PDFTemplate): void {
    // If template requires parameters, navigate to generation page
    if (template.requires_parameters) {
      this.router.navigate(['/settings/pdf-templates/generate', template.id]);
    } else {
      // Generate directly
      this.pdfTemplateService.generatePDF({
        template_id: template.id!
      }).subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            this.pdfTemplateService.downloadPDF(blob, `${template.code}.pdf`);
          }
        },
        error: (error) => {
          console.error('Error generating PDF:', error);
          this.snackBar.open('Failed to generate PDF', 'Close', { duration: 3000 });
        }
      });
    }
  }

  exportTemplate(template: PDFTemplate): void {
    this.pdfTemplateService.exportTemplate(template.id!).subscribe({
      next: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.code}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting template:', error);
        this.snackBar.open('Failed to export template', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTemplate(template: PDFTemplate): void {
    if (!template.can_delete) {
      this.snackBar.open('You cannot delete this template', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      this.pdfTemplateService.deleteTemplate(template.id!).subscribe({
        next: () => {
          this.snackBar.open('Template deleted successfully', 'Close', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.snackBar.open('Failed to delete template', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Filtering
  applyFilter(): void {
    // Filter is applied via getFilteredTemplates
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterType = '';
    this.filterLanguage = '';
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterType || this.filterLanguage);
  }

  getFilteredTemplates(): PDFTemplate[] {
    return this.getFilteredTemplatesFromList(this.getCurrentTabTemplates());
  }

  getFilteredTemplatesFromList(templates: PDFTemplate[]): PDFTemplate[] {
    return templates.filter(template => {
      // Search filter
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        const matchesSearch =
          template.name.toLowerCase().includes(search) ||
          template.code.toLowerCase().includes(search) ||
          (template.description && template.description.toLowerCase().includes(search));

        if (!matchesSearch) return false;
      }

      // Type filter
      if (this.filterType && template.data_source_type !== this.filterType) {
        return false;
      }

      // Language filter
      if (this.filterLanguage && template.primary_language !== this.filterLanguage) {
        return false;
      }

      return true;
    });
  }

  getCurrentTabTemplates(): PDFTemplate[] {
    switch (this.selectedTab) {
      case 0: return this.myTemplates;
      case 1: return this.selfServiceTemplates;
      case 2: return this.sharedTemplates;
      case 3: return this.systemTemplates;
      default: return [];
    }
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'model': 'storage',
      'raw_sql': 'code',
      'custom_function': 'functions',
      'api': 'api'
    };
    return icons[type] || 'description';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
