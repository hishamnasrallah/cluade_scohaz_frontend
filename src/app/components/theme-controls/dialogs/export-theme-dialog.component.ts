// src/app/components/theme-controls/dialogs/export-theme-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';
import { ExportOptions } from '../../theme-creator/utils/theme-import-export.util';

@Component({
  selector: 'app-export-theme-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="export-dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>download</mat-icon>
        Export Theme
      </h2>

      <mat-dialog-content>
        <div class="export-options">
          <div class="format-section">
            <h3>Export Format</h3>
            <mat-radio-group [(ngModel)]="exportOptions.format" class="format-radio-group">
              <mat-radio-button value="json" class="format-option">
                <div class="format-info">
                  <strong>JSON</strong>
                  <span class="format-description">Complete theme configuration for import</span>
                </div>
              </mat-radio-button>

              <mat-radio-button value="css" class="format-option">
                <div class="format-info">
                  <strong>CSS</strong>
                  <span class="format-description">CSS custom properties for web projects</span>
                </div>
              </mat-radio-button>

              <mat-radio-button value="scss" class="format-option">
                <div class="format-info">
                  <strong>SCSS</strong>
                  <span class="format-description">SCSS variables and mixins</span>
                </div>
              </mat-radio-button>

              <mat-radio-button value="both" class="format-option">
                <div class="format-info">
                  <strong>All Formats</strong>
                  <span class="format-description">Export JSON and CSS files</span>
                </div>
              </mat-radio-button>
            </mat-radio-group>
          </div>

          <mat-divider></mat-divider>

          <div class="options-section" *ngIf="exportOptions.format !== 'json'">
            <h3>Export Options</h3>

            <mat-checkbox [(ngModel)]="exportOptions.includeComments" class="option-checkbox">
              <div class="option-info">
                <strong>Include Comments</strong>
                <span class="option-description">Add helpful comments to the output</span>
              </div>
            </mat-checkbox>

            <mat-checkbox [(ngModel)]="exportOptions.minify" class="option-checkbox">
              <div class="option-info">
                <strong>Minify Output</strong>
                <span class="option-description">Remove whitespace for smaller file size</span>
              </div>
            </mat-checkbox>

            <mat-form-field appearance="outline" class="prefix-field">
              <mat-label>CSS Variable Prefix</mat-label>
              <input matInput
                     [(ngModel)]="exportOptions.cssPrefix"
                     placeholder="--theme">
              <mat-hint>Prefix for CSS custom properties</mat-hint>
            </mat-form-field>
          </div>

          <div class="preview-section">
            <h3>Theme Information</h3>
            <div class="theme-info">
              <div class="info-row">
                <span class="info-label">Theme Name:</span>
                <span class="info-value">{{ theme.brandName || 'Custom Theme' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mode:</span>
                <span class="info-value">{{ theme.mode || 'light' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Design Style:</span>
                <span class="info-value">{{ theme.designStyle || 'modern' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Primary Color:</span>
                <span class="info-value color-preview">
                  <span class="color-swatch" [style.background]="theme.primaryColor"></span>
                  {{ theme.primaryColor }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="onExport()"
                [disabled]="!exportOptions.format">
          <mat-icon>download</mat-icon>
          Export Theme
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    /* Container with overflow prevention */
    .export-dialog-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 600px;
      overflow: hidden;
    }

    /* Dialog title */
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 24px 24px 20px;
      font-size: 24px;
      font-weight: 500;
      color: #2F4858;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    h2[mat-dialog-title] mat-icon {
      color: #34C5AA;
    }

    /* Dialog content - prevent horizontal scroll */
    mat-dialog-content {
      padding: 0 !important;
      margin: 0 !important;
      height: calc(90vh - 120px);  // Account for header and actions

      overflow-x: hidden !important;
      overflow-y: auto;
      max-height: 60vh;
    }

    /* Export options container */
    .export-options {
      padding: 24px;
    }

    /* Section headings */
    h3 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #2F4858;
    }

    /* Format section */
    .format-section {
      margin-bottom: 24px;
    }

    .format-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .format-option {
      margin: 0;
    }

    ::ng-deep .format-option .mat-mdc-radio-button-label {
      width: 100%;
    }

    .format-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 0;
    }

    .format-info strong {
      font-size: 14px;
      color: #2F4858;
    }

    .format-description {
      font-size: 12px;
      color: #6B7280;
    }

    /* Divider */
    mat-divider {
      margin: 24px 0;
    }

    /* Options section */
    .options-section {
      margin: 24px 0;
    }

    .option-checkbox {
      display: block;
      margin-bottom: 16px;
    }

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .option-info strong {
      font-size: 14px;
      color: #2F4858;
    }

    .option-description {
      font-size: 12px;
      color: #6B7280;
    }

    /* Prefix field */
    .prefix-field {
      width: 100%;
      margin-top: 16px;
    }

    /* Preview section */
    .preview-section {
      margin-top: 24px;
      padding: 20px;
      background: #F8FAFB;
      border-radius: 8px;
    }

    .theme-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    .info-label {
      color: #6B7280;
      font-weight: 500;
    }

    .info-value {
      color: #2F4858;
      font-weight: 500;
    }

    .color-preview {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-swatch {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }

    /* Dialog actions */
    mat-dialog-actions {
      padding: 16px 24px !important;
      margin: 0 !important;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      gap: 12px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .export-dialog-container {
        max-width: 100vw;
      }

      .export-options {
        padding: 16px;
      }

      h2[mat-dialog-title] {
        padding: 20px 16px 16px;
        font-size: 20px;
      }

      mat-dialog-actions {
        padding: 12px 16px !important;
      }
    }
  `]
})
export class ExportThemeDialogComponent {
  exportOptions: ExportOptions = {
    format: 'json',
    includeComments: true,
    minify: false,
    cssPrefix: '--theme'
  };

  constructor(
    public dialogRef: MatDialogRef<ExportThemeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { theme: ThemeConfig }
  ) {}

  get theme(): ThemeConfig {
    return this.data.theme;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onExport(): void {
    this.dialogRef.close(this.exportOptions);
  }
}
