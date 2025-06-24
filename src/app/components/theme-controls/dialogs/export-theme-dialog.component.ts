// src/app/components/theme-creator/dialogs/export-theme-dialog.component.ts
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';
import { ExportFormat, ExportOptions } from '../../theme-creator';

export interface ExportDialogData {
  theme: ThemeConfig;
}

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
    MatTooltipModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>download</mat-icon>
      Export Theme
    </h2>

    <mat-dialog-content>
      <div class="export-options">
        <h3>Export Format</h3>
        <mat-radio-group [(ngModel)]="selectedFormat" class="format-group">
          <mat-radio-button value="json" class="format-option">
            <div class="format-content">
              <div class="format-header">
                <mat-icon>code</mat-icon>
                <span class="format-name">JSON</span>
              </div>
              <p class="format-description">Complete theme configuration for re-importing</p>
            </div>
          </mat-radio-button>

          <mat-radio-button value="css" class="format-option">
            <div class="format-content">
              <div class="format-header">
                <mat-icon>style</mat-icon>
                <span class="format-name">CSS</span>
              </div>
              <p class="format-description">CSS custom properties for web projects</p>
            </div>
          </mat-radio-button>

          <mat-radio-button value="scss" class="format-option">
            <div class="format-content">
              <div class="format-header">
                <mat-icon>sass</mat-icon>
                <span class="format-name">SCSS</span>
              </div>
              <p class="format-description">SCSS variables and mixins for Sass projects</p>
            </div>
          </mat-radio-button>

          <mat-radio-button value="both" class="format-option">
            <div class="format-content">
              <div class="format-header">
                <mat-icon>folder_zip</mat-icon>
                <span class="format-name">All Formats</span>
              </div>
              <p class="format-description">Export all formats separately</p>
            </div>
          </mat-radio-button>
        </mat-radio-group>

        <div class="additional-options" *ngIf="selectedFormat === 'css' || selectedFormat === 'scss'">
          <h3>Additional Options</h3>

          <mat-checkbox [(ngModel)]="includeComments" class="option-checkbox">
            <span class="option-label">Include comments</span>
            <mat-icon class="info-icon"
                      matTooltip="Add helpful comments to explain sections">
              info_outline
            </mat-icon>
          </mat-checkbox>

          <mat-checkbox [(ngModel)]="minify" class="option-checkbox">
            <span class="option-label">Minify output</span>
            <mat-icon class="info-icon"
                      matTooltip="Remove whitespace and comments for smaller file size">
              info_outline
            </mat-icon>
          </mat-checkbox>

          <mat-form-field appearance="outline" class="prefix-field">
            <mat-label>CSS Variable Prefix</mat-label>
            <input matInput
                   [(ngModel)]="cssPrefix"
                   placeholder="--theme"
                   [disabled]="selectedFormat === 'scss'">
            <mat-hint>Prefix for CSS custom properties</mat-hint>
          </mat-form-field>
        </div>

        <div class="preview-section">
          <h3>Preview</h3>
          <div class="preview-content">
            <div class="file-preview">
              <mat-icon>description</mat-icon>
              <div class="file-info">
                <span class="file-name">theme-{{ sanitizedBrandName }}-{{ timestamp }}.{{ getFileExtension() }}</span>
                <span class="file-details">{{ getFormatDescription() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="export()"
              [disabled]="!selectedFormat">
        <mat-icon>download</mat-icon>
        Export
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-dialog-content {
      min-width: 500px;
      max-width: 600px;
      max-height: 70vh;
      overflow-y: auto;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-family: 'Poppins', sans-serif;

      mat-icon {
        color: #34C5AA;
      }
    }

    h3 {
      margin: 24px 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #2F4858;
      font-family: 'Poppins', sans-serif;

      &:first-child {
        margin-top: 0;
      }
    }

    .format-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .format-option {
      ::ng-deep .mdc-radio {
        margin-right: 12px;
      }

      .format-content {
        flex: 1;
        padding: 16px;
        background: rgba(196, 247, 239, 0.1);
        border-radius: 12px;
        border: 2px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(196, 247, 239, 0.2);
          border-color: rgba(52, 197, 170, 0.3);
        }
      }

      &.mat-mdc-radio-checked .format-content {
        background: rgba(196, 247, 239, 0.3);
        border-color: #34C5AA;
      }
    }

    .format-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #34C5AA;
      }

      .format-name {
        font-weight: 600;
        font-size: 15px;
        color: #2F4858;
      }
    }

    .format-description {
      margin: 0;
      font-size: 13px;
      color: #6B7280;
      line-height: 1.4;
    }

    .additional-options {
      margin-top: 24px;
      padding: 20px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 12px;
    }

    .option-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .option-label {
        margin-right: 8px;
      }

      .info-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #9CA3AF;
        cursor: help;
      }
    }

    .prefix-field {
      width: 100%;
      margin-top: 8px;
    }

    .preview-section {
      margin-top: 24px;
    }

    .preview-content {
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 12px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #34C5AA;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .file-name {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 500;
        color: #2F4858;
      }

      .file-details {
        font-size: 12px;
        color: #6B7280;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0 -24px -24px;
      border-top: 1px solid rgba(196, 247, 239, 0.3);

      button {
        mat-icon {
          margin-right: 4px;
        }
      }
    }
  `]
})
export class ExportThemeDialogComponent {
  selectedFormat: ExportFormat = 'json';
  includeComments = true;
  minify = false;
  cssPrefix = '--theme';

  sanitizedBrandName: string;
  timestamp = Date.now();

  constructor(
    public dialogRef: MatDialogRef<ExportThemeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData
  ) {
    const brandName = data.theme.brandName || 'theme';
    this.sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
  }

  getFileExtension(): string {
    switch (this.selectedFormat) {
      case 'json': return 'json';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'both': return 'zip';
      default: return 'json';
    }
  }

  getFormatDescription(): string {
    switch (this.selectedFormat) {
      case 'json': return 'Theme configuration file';
      case 'css': return 'CSS custom properties';
      case 'scss': return 'SCSS variables and mixins';
      case 'both': return 'All formats in separate files';
      default: return '';
    }
  }

  export(): void {
    const options: ExportOptions = {
      format: this.selectedFormat,
      includeComments: this.includeComments,
      minify: this.minify,
      cssPrefix: this.cssPrefix
    };

    this.dialogRef.close(options);
  }
}
