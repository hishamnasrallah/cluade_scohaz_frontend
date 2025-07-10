// src/app/components/simple-pdf/simple-template-builder/simple-template-builder.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SimplePDFTemplate } from '../../../models/simple-pdf.models';
import { SimplePDFService } from '../../../services/simple-pdf.service';
import { SimpleTemplateWizardComponent } from '../simple-template-wizard/simple-template-wizard.component';
import { SimpleTemplateDragDropComponent } from '../simple-template-drag-drop/simple-template-drag-drop.component';

@Component({
  selector: 'app-simple-template-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSnackBarModule,
    SimpleTemplateWizardComponent,
    SimpleTemplateDragDropComponent
  ],
  template: `
    <div class="builder-container">
      <!-- Header -->
      <div class="builder-header">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-info">
              <h1>{{ getTitle() }}</h1>
              <p>{{ getDescription() }}</p>
            </div>
          </div>
          <div class="header-actions" *ngIf="mode !== 'selection'">
            <button mat-button (click)="switchMode()" class="switch-mode-btn">
              <mat-icon>{{ mode === 'wizard' ? 'dashboard' : 'linear_scale' }}</mat-icon>
              Switch to {{ mode === 'wizard' ? 'Designer' : 'Wizard' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mode Selection -->
      <div class="mode-selection" *ngIf="mode === 'selection' && !loading">
        <div class="selection-content">
          <div class="selection-header">
            <mat-icon>description</mat-icon>
            <h2>Choose Your Building Method</h2>
            <p>Select how you want to create your PDF template</p>
          </div>

          <div class="mode-cards">
            <!-- Wizard Mode -->
            <mat-card class="mode-card" (click)="selectMode('wizard')" matRipple>
              <mat-card-content>
                <div class="card-icon wizard-icon">
                  <mat-icon>linear_scale</mat-icon>
                </div>
                <h3>Step-by-Step Wizard</h3>
                <p>Guided process through each configuration step</p>
                <ul class="features-list">
                  <li>Easy to follow</li>
                  <li>Best for beginners</li>
                  <li>Structured workflow</li>
                </ul>
              </mat-card-content>
              <mat-card-actions>
                <span>Start with Wizard</span>
                <mat-icon>arrow_forward</mat-icon>
              </mat-card-actions>
            </mat-card>

            <!-- Designer Mode -->
            <mat-card class="mode-card" (click)="selectMode('dragdrop')" matRipple>
              <mat-card-content>
                <div class="card-icon designer-icon">
                  <mat-icon>dashboard</mat-icon>
                </div>
                <h3>Visual Designer</h3>
                <p>Drag and drop elements to design your template</p>
                <ul class="features-list">
                  <li>Visual editing</li>
                  <li>Real-time preview</li>
                  <li>Flexible design</li>
                </ul>
              </mat-card-content>
              <mat-card-actions>
                <span>Open Designer</span>
                <mat-icon>arrow_forward</mat-icon>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading template...</p>
      </div>

      <!-- Wizard Mode -->
      <app-simple-template-wizard
        *ngIf="mode === 'wizard' && !loading"
        [template]="template"
        (save)="onSaveTemplate($event)"
        (cancel)="onCancel()">
      </app-simple-template-wizard>

      <!-- Drag & Drop Mode -->
      <app-simple-template-drag-drop
        *ngIf="mode === 'dragdrop' && !loading"
        [template]="template"
        (save)="onSaveTemplate($event)"
        (cancel)="onCancel()">
      </app-simple-template-drag-drop>
    </div>
  `,
  styles: [`
    .builder-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
      overflow: hidden;
    }

    /* Header */
    .builder-header {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
      color: #666;
    }

    .header-info h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .header-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .switch-mode-btn {
      color: #666;
    }

    /* Mode Selection */
    .mode-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .selection-content {
      max-width: 800px;
      width: 100%;
    }

    .selection-header {
      text-align: center;
      margin-bottom: 48px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1976d2;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px 0;
        font-size: 1.75rem;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .mode-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .mode-card {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      mat-card-content {
        padding: 32px;
        text-align: center;
      }

      mat-card-actions {
        padding: 16px;
        background: #f5f5f5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #666;
        font-weight: 500;
      }
    }

    .card-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: white;
      }
    }

    .wizard-icon {
      background: linear-gradient(135deg, #42a5f5, #1976d2);
    }

    .designer-icon {
      background: linear-gradient(135deg, #66bb6a, #43a047);
    }

    .mode-card h3 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .mode-card p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;
      display: inline-block;

      li {
        padding: 4px 0;
        color: #666;
        position: relative;
        padding-left: 24px;

        &:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #66bb6a;
          font-weight: bold;
        }
      }
    }

    /* Loading */
    .loading-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;

      p {
        color: #666;
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

      .mode-selection {
        padding: 24px 16px;
      }

      .mode-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SimpleTemplateBuilderComponent implements OnInit {
  mode: 'selection' | 'wizard' | 'dragdrop' = 'selection';
  template: SimplePDFTemplate | null = null;
  templateId: number | null = null;
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private simplePdfService: SimplePDFService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check for template ID in route params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.templateId = +params['id'];
        this.loadTemplate();
      }
    });

    // Check for mode in query params
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'wizard' || params['mode'] === 'dragdrop') {
        this.mode = params['mode'];
      }
    });
  }

  loadTemplate(): void {
    if (!this.templateId) return;

    this.loading = true;
    this.simplePdfService.getTemplate(this.templateId).subscribe({
      next: (template) => {
        this.template = template;
        // Default to designer mode for existing templates
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
    this.mode = this.mode === 'wizard' ? 'dragdrop' : 'wizard';
  }

  goBack(): void {
    if (this.mode === 'selection') {
      this.router.navigate(['/settings/simple-pdf/list']);
    } else {
      this.mode = 'selection';
    }
  }


  getTitle(): string {
    if (this.mode === 'selection') {
      return this.templateId ? 'Edit Template' : 'Create PDF Template';
    }
    return this.template?.name || 'New Template';
  }

  getDescription(): string {
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

  onSaveTemplate(templateData: any): void {
    const saveObservable = this.templateId
      ? this.simplePdfService.updateTemplate(this.templateId, templateData)
      : this.simplePdfService.bulkCreateTemplate(templateData);

    saveObservable.subscribe({
      next: (savedTemplate) => {
        this.snackBar.open('Template saved successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/simple-pdf']);
      },
      error: (error) => {
        console.error('Error saving template:', error);
        this.snackBar.open('Failed to save template', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/simple-pdf/list']);
  }
}
