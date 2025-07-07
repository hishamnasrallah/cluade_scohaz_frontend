// src/app/components/template-builder/template-builder.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { PDFTemplateService } from '../../services/pdf-template.service';
import { PDFTemplate } from '../../models/pdf-template.models';
import { TemplateWizardComponent } from './template-wizard/template-wizard.component';
import { TemplateDragDropComponent } from './template-drag-drop/template-drag-drop.component';

@Component({
  selector: 'app-template-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    TemplateWizardComponent,
    TemplateDragDropComponent
  ],
  template: `
    <div class="template-builder-container">
      <!-- Header -->
      <div class="builder-header">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-info">
              <h1>{{ mode === 'selection' ? 'Create PDF Template' : (template?.name || 'New Template') }}</h1>
              <p>{{ getHeaderDescription() }}</p>
            </div>
          </div>
          <div class="header-actions" *ngIf="mode !== 'selection'">
            <button mat-button (click)="switchMode()" class="switch-mode-btn">
              <mat-icon>{{ mode === 'wizard' ? 'dashboard' : 'linear_scale' }}</mat-icon>
              Switch to {{ mode === 'wizard' ? 'Designer' : 'Wizard' }}
            </button>
            <button mat-button (click)="saveTemplate()" class="save-btn" [disabled]="saving">
              <mat-icon>save</mat-icon>
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button mat-button (click)="previewTemplate()" class="preview-btn">
              <mat-icon>visibility</mat-icon>
              Preview
            </button>
          </div>
        </div>
      </div>

      <!-- Mode Selection -->
      <div class="mode-selection" *ngIf="mode === 'selection' && !loading">
        <div class="selection-container">
          <div class="selection-header">
            <mat-icon class="selection-icon">description</mat-icon>
            <h2>Choose Your Building Method</h2>
            <p>Select how you want to create your PDF template</p>
          </div>

          <div class="mode-cards">
            <!-- Wizard Mode Card -->
            <div class="mode-card wizard-card" (click)="selectMode('wizard')" matRipple>
              <div class="card-icon">
                <mat-icon>linear_scale</mat-icon>
              </div>
              <div class="card-content">
                <h3>Step-by-Step Wizard</h3>
                <p>Guided process through each configuration step</p>
                <div class="features">
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Easy to follow</span>
                  </div>
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Best for beginners</span>
                  </div>
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Structured workflow</span>
                  </div>
                </div>
              </div>
              <div class="card-action">
                <span>Start with Wizard</span>
                <mat-icon>arrow_forward</mat-icon>
              </div>
            </div>

            <!-- Drag & Drop Mode Card -->
            <div class="mode-card designer-card" (click)="selectMode('dragdrop')" matRipple>
              <div class="card-icon">
                <mat-icon>dashboard</mat-icon>
              </div>
              <div class="card-content">
                <h3>Visual Designer</h3>
                <p>Drag and drop elements to design your template</p>
                <div class="features">
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Visual editing</span>
                  </div>
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Real-time preview</span>
                  </div>
                  <div class="feature">
                    <mat-icon>check_circle</mat-icon>
                    <span>Flexible design</span>
                  </div>
                </div>
              </div>
              <div class="card-action">
                <span>Open Designer</span>
                <mat-icon>arrow_forward</mat-icon>
              </div>
            </div>
          </div>

          <!-- Recent Templates -->
          <div class="recent-templates" *ngIf="recentTemplates.length > 0">
            <h3>Or start from a recent template</h3>
            <div class="template-list">
              <div
                *ngFor="let tmpl of recentTemplates"
                class="template-item"
                (click)="loadTemplate(tmpl.id!)"
                matRipple>
                <mat-icon>description</mat-icon>
                <div class="template-info">
                  <h4>{{ tmpl.name }}</h4>
                  <p>{{ tmpl.description || 'No description' }}</p>
                </div>
                <span class="template-date">{{ formatDate(tmpl.updated_at!) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading template...</p>
      </div>

      <!-- Wizard Mode -->
      <app-template-wizard
        *ngIf="mode === 'wizard' && !loading"
        [template]="template"
        (save)="onSaveTemplate($event)"
        (cancel)="onCancel()">
      </app-template-wizard>

      <!-- Drag & Drop Mode -->
      <app-template-drag-drop
        *ngIf="mode === 'dragdrop' && !loading"
        [template]="template"
        (save)="onSaveTemplate($event)"
        (cancel)="onCancel()">
      </app-template-drag-drop>
    </div>
  `,
  styles: [`
    .template-builder-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafb;
      overflow: hidden;
    }

    /* Header Styles */
    .builder-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

    .back-btn {
      color: #6b7280;
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-info p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .switch-mode-btn {
      color: #6b7280;
    }

    .save-btn {
      background: #34c5aa;
      color: white;

      &:hover:not(:disabled) {
        background: #2ba99b;
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    .preview-btn {
      border: 1px solid #e5e7eb;
      color: #6b7280;

      &:hover {
        background: #f9fafb;
      }
    }

    /* Mode Selection Styles */
    .mode-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      overflow-y: auto;
    }

    .selection-container {
      max-width: 1000px;
      width: 100%;
    }

    .selection-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .selection-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #34c5aa;
      margin-bottom: 16px;
    }

    .selection-header h2 {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #1f2937;
    }

    .selection-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1.125rem;
    }

    .mode-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .mode-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }

      &.wizard-card:hover {
        border-color: #3b82f6;
      }

      &.designer-card:hover {
        border-color: #34c5aa;
      }
    }

    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: white;
      }
    }

    .wizard-card .card-icon {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .designer-card .card-icon {
      background: linear-gradient(135deg, #34c5aa, #2ba99b);
    }

    .card-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .card-content p {
      margin: 0 0 24px 0;
      color: #6b7280;
      line-height: 1.5;
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #4b5563;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #10b981;
      }
    }

    .card-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f3f4f6;
      color: #6b7280;
      font-weight: 500;

      mat-icon {
        transition: transform 0.2s ease;
      }
    }

    .mode-card:hover .card-action mat-icon {
      transform: translateX(4px);
    }

    /* Recent Templates */
    .recent-templates {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .recent-templates h3 {
      margin: 0 0 24px 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .template-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .template-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f9fafb;
        border-color: #34c5aa;
      }

      mat-icon {
        color: #6b7280;
      }
    }

    .template-info {
      flex: 1;

      h4 {
        margin: 0;
        font-weight: 500;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .template-date {
      font-size: 0.875rem;
      color: #9ca3af;
    }

    /* Loading State */
    .loading-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;

      p {
        color: #6b7280;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .builder-header {
        padding: 12px 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .mode-selection {
        padding: 24px 16px;
      }

      .mode-cards {
        grid-template-columns: 1fr;
      }

      .recent-templates {
        padding: 24px;
      }
    }
  `]
})
export class TemplateBuilderComponent implements OnInit, OnDestroy {
  mode: 'selection' | 'wizard' | 'dragdrop' = 'selection';
  template: PDFTemplate | null = null;
  templateId: number | null = null;
  loading = false;
  saving = false;
  recentTemplates: PDFTemplate[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pdfTemplateService: PDFTemplateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check for template ID in route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.templateId = +params['id'];
        this.loadTemplate(this.templateId);
      } else {
        // Check for mode in query params
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
          if (queryParams['mode'] === 'wizard' || queryParams['mode'] === 'dragdrop') {
            this.mode = queryParams['mode'];
          }
        });
        this.loadRecentTemplates();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTemplate(id: number): void {
    this.loading = true;
    this.pdfTemplateService.getTemplate(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (template) => {
          this.template = template;
          this.templateId = id;
          // Default to drag & drop for existing templates
          this.mode = 'dragdrop';
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading template:', error);
          this.snackBar.open('Failed to load template', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadRecentTemplates(): void {
    this.pdfTemplateService.getMyTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category) => {
          // Combine all templates and sort by updated date
          const allTemplates = [
            ...category.self_service,
            ...category.my_templates,
            ...category.shared_templates
          ];

          this.recentTemplates = allTemplates
            .sort((a, b) => {
              const dateA = new Date(a.updated_at || a.created_at || 0);
              const dateB = new Date(b.updated_at || b.created_at || 0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5); // Show only 5 most recent
        },
        error: (error) => {
          console.error('Error loading recent templates:', error);
        }
      });
  }

  selectMode(mode: 'wizard' | 'dragdrop'): void {
    this.mode = mode;
    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode },
      queryParamsHandling: 'merge'
    });
  }

  switchMode(): void {
    const newMode = this.mode === 'wizard' ? 'dragdrop' : 'wizard';

    // Confirm if there are unsaved changes
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to switch modes?')) {
        this.mode = newMode;
      }
    } else {
      this.mode = newMode;
    }
  }

  goBack(): void {
    if (this.mode === 'selection') {
      this.router.navigate(['/settings/pdf-templates']);
    } else {
      if (this.hasUnsavedChanges()) {
        if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
          this.mode = 'selection';
        }
      } else {
        this.mode = 'selection';
      }
    }
  }

  getHeaderDescription(): string {
    switch (this.mode) {
      case 'selection':
        return 'Choose how you want to build your PDF template';
      case 'wizard':
        return 'Follow the steps to configure your template';
      case 'dragdrop':
        return 'Design your template visually';
      default:
        return '';
    }
  }

  saveTemplate(): void {
    // This will be called from child components
    console.log('Save template triggered from header');
  }

  previewTemplate(): void {
    // This will be implemented to show preview
    console.log('Preview template');
  }

  onSaveTemplate(template: PDFTemplate): void {
    this.saving = true;

    const save$ = this.templateId
      ? this.pdfTemplateService.updateTemplate(this.templateId, template)
      : this.pdfTemplateService.createTemplate(template);

    save$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedTemplate) => {
        this.template = savedTemplate;
        this.templateId = savedTemplate.id!;
        this.saving = false;
        this.snackBar.open('Template saved successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (error) => {
        console.error('Error saving template:', error);
        this.saving = false;
        this.snackBar.open('Failed to save template', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/settings/pdf-templates']);
      }
    } else {
      this.router.navigate(['/settings/pdf-templates']);
    }
  }

  hasUnsavedChanges(): boolean {
    // This should be implemented based on actual form state
    return false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
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
