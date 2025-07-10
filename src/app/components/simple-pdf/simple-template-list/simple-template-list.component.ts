// src/app/components/simple-pdf/simple-template-list/simple-template-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { SimplePDFTemplate } from '../../../models/simple-pdf.models';
import { SimplePDFService } from '../../../services/simple-pdf.service';

@Component({
  selector: 'app-simple-template-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="template-list-container">
      <!-- Header -->
      <mat-card class="header-card">
        <div class="header-content">
          <div class="header-left">
            <h1>Simple PDF Templates</h1>
            <p>Create and manage simple PDF report templates</p>
          </div>
          <button mat-raised-button color="primary" (click)="createNewTemplate()">
            <mat-icon>add</mat-icon>
            New Template
          </button>
        </div>
      </mat-card>

      <!-- Search -->
      <mat-card class="search-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search templates</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="filterTemplates()"
                 placeholder="Search by name or code">
          <mat-icon matPrefix>search</mat-icon>
          <button mat-icon-button matSuffix *ngIf="searchTerm" (click)="clearSearch()">
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>
      </mat-card>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <mat-spinner></mat-spinner>
        <p>Loading templates...</p>
      </div>

      <!-- Templates Table -->
      <mat-card *ngIf="!loading && filteredTemplates.length > 0">
        <table mat-table [dataSource]="filteredTemplates" class="templates-table">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let template">
              <div class="template-name">
                <strong>{{ template.name }}</strong>
                <span class="template-code">{{ template.code }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Content Type Column -->
          <ng-container matColumnDef="content_type">
            <th mat-header-cell *matHeaderCellDef>Content Type</th>
            <td mat-cell *matCellDef="let template">
              <mat-chip *ngIf="template.content_type_display">
                {{ template.content_type_display }}
              </mat-chip>
              <span *ngIf="!template.content_type_display" class="no-content">-</span>
            </td>
          </ng-container>

          <!-- Elements Column -->
          <ng-container matColumnDef="elements">
            <th mat-header-cell *matHeaderCellDef>Elements</th>
            <td mat-cell *matCellDef="let template">
              {{ template.elements?.length || 0 }} elements
            </td>
          </ng-container>

          <!-- Created Column -->
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let template">
              <div class="created-info">
                <span>{{ formatDate(template.created_at) }}</span>
                <span class="created-by" *ngIf="template.created_by_name">
                  by {{ template.created_by_name }}
                </span>
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let template">
              <mat-chip [color]="template.active ? 'primary' : 'warn'" selected>
                {{ template.active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
            <td mat-cell *matCellDef="let template" class="actions-cell">
              <button mat-icon-button (click)="editTemplate(template, $event)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button (click)="generatePDF(template, $event)" matTooltip="Generate PDF">
                <mat-icon>picture_as_pdf</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="duplicateTemplate(template, $event)">
                  <mat-icon>content_copy</mat-icon>
                  <span>Duplicate</span>
                </button>
                <button mat-menu-item (click)="toggleActive(template, $event)">
                  <mat-icon>{{ template.active ? 'block' : 'check_circle' }}</mat-icon>
                  <span>{{ template.active ? 'Deactivate' : 'Activate' }}</span>
                </button>
                <button mat-menu-item (click)="deleteTemplate(template, $event)" class="delete-item">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="template-row"
              (click)="editTemplate(row, $event)"></tr>
        </table>
      </mat-card>

      <!-- Empty State -->
      <mat-card class="empty-state" *ngIf="!loading && filteredTemplates.length === 0">
        <mat-icon>description</mat-icon>
        <h3>{{ searchTerm ? 'No templates found' : 'No templates yet' }}</h3>
        <p>{{ searchTerm ? 'Try adjusting your search' : 'Create your first template to get started' }}</p>
        <button mat-raised-button color="primary" (click)="createNewTemplate()" *ngIf="!searchTerm">
          <mat-icon>add</mat-icon>
          Create Template
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .template-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .header-card {
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left h1 {
      margin: 0 0 4px 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .header-left p {
      margin: 0;
      color: #666;
    }

    /* Search */
    .search-card {
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background: white;
      border-radius: 4px;
      gap: 16px;
    }

    /* Table */
    .templates-table {
      width: 100%;
    }

    .template-row {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .template-name {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .template-code {
      font-size: 0.875rem;
      color: #666;
      font-family: monospace;
    }

    .no-content {
      color: #999;
    }

    .created-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 0.875rem;
    }

    .created-by {
      color: #666;
    }

    .actions-header,
    .actions-cell {
      text-align: right;
    }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
      gap: 16px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ddd;
      }

      h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #333;
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    /* Menu */
    ::ng-deep .delete-item {
      color: #f44336;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .template-list-container {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .templates-table {
        display: block;
        overflow-x: auto;
      }
    }
  `]
})
export class SimpleTemplateListComponent implements OnInit {
  templates: SimplePDFTemplate[] = [];
  filteredTemplates: SimplePDFTemplate[] = [];
  displayedColumns: string[] = ['name', 'content_type', 'elements', 'created', 'status', 'actions'];

  loading = true;
  searchTerm = '';

  constructor(
    private router: Router,
    private simplePdfService: SimplePDFService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.simplePdfService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.filterTemplates();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.templates = [];
        this.filteredTemplates = [];
        this.snackBar.open('Failed to load templates', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  filterTemplates(): void {
    if (!this.searchTerm) {
      this.filteredTemplates = [...this.templates];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredTemplates = this.templates.filter(template =>
        template.name.toLowerCase().includes(search) ||
        template.code.toLowerCase().includes(search)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterTemplates();
  }

  createNewTemplate(): void {
    this.router.navigate(['/settings/simple-pdf/new']);
  }

  editTemplate(template: SimplePDFTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/settings/simple-pdf/edit', template.id]);
  }

  generatePDF(template: SimplePDFTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/settings/simple-pdf/generate', template.id]);
  }

  duplicateTemplate(template: SimplePDFTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const newName = prompt('Enter name for the duplicated template:', `${template.name} (Copy)`);
    if (newName) {
      this.simplePdfService.duplicateTemplate(template.id!, newName).subscribe({
        next: () => {
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

  toggleActive(template: SimplePDFTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const updatedTemplate = { ...template, active: !template.active };
    this.simplePdfService.updateTemplate(template.id!, { active: updatedTemplate.active }).subscribe({
      next: () => {
        template.active = updatedTemplate.active;
        this.snackBar.open(`Template ${template.active ? 'activated' : 'deactivated'}`, 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating template:', error);
        this.snackBar.open('Failed to update template', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTemplate(template: SimplePDFTemplate, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      this.simplePdfService.deleteTemplate(template.id!).subscribe({
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

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
