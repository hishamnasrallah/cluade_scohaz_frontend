// src/app/builder/components/theme-preview-dialog/theme-preview-dialog.component.ts

import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ThemeCustomizerService } from '../../services/theme-customizer.service';
import { Theme } from '../../models/theme.model';
import { ComponentConfig } from '../../models/component-config.model';
import { CodeGeneratorService } from '../../services/code-generator.service';

export interface ThemePreviewData {
  components: ComponentConfig[];
  currentTheme?: Theme;
}

@Component({
  selector: 'app-theme-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="theme-preview-dialog">
      <mat-dialog-title>
        <div class="dialog-header">
          <span>Theme Preview</span>
          <div class="header-actions">
            <mat-form-field appearance="outline" class="theme-selector">
              <mat-label>Select Theme</mat-label>
              <mat-select [(ngModel)]="selectedThemeId" (selectionChange)="onThemeChange()">
                <mat-option *ngFor="let theme of themes" [value]="theme.id">
                  {{ theme.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-icon-button (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </mat-dialog-title>

      <mat-dialog-content>
        <div class="preview-container">
          <iframe #previewFrame
                  src="about:blank"
                  class="preview-iframe">
          </iframe>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Cancel</button>
        <button mat-raised-button color="primary" (click)="applyTheme()">
          Apply Theme
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .theme-preview-dialog {
      width: 900px;
      max-width: 90vw;
      height: 600px;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .theme-selector {
      width: 200px;
    }

    mat-dialog-content {
      flex: 1;
      padding: 0 !important;
      overflow: hidden;
      height: calc(90vh - 120px);  // Account for header and actions

    }

    .preview-container {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      position: relative;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    ::ng-deep .mat-mdc-dialog-content {
      max-height: none !important;
    }

    ::ng-deep .mat-mdc-form-field-wrapper {
      height: 40px;
    }
  `]
})
export class ThemePreviewDialogComponent implements AfterViewInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  themes: Theme[] = [];
  selectedThemeId: string;
  selectedTheme: Theme | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ThemePreviewData,
    private dialogRef: MatDialogRef<ThemePreviewDialogComponent>,
    private themeService: ThemeCustomizerService,
    private codeGenerator: CodeGeneratorService
  ) {
    this.themes = this.themeService.getAllThemes();
    // @ts-ignore
    this.selectedThemeId = data.currentTheme?.id || this.themeService.getActiveTheme(this.editingTheme.id)?.id || 'material-light';
  }

  ngAfterViewInit(): void {
    this.onThemeChange();
  }

  onThemeChange(): void {
    this.selectedTheme = this.themes.find(t => t.id === this.selectedThemeId) || null;
    if (this.selectedTheme) {
      this.renderPreview();
    }
  }

  private renderPreview(): void {
    if (!this.selectedTheme || !this.previewFrame) return;

    const iframe = this.previewFrame.nativeElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    const css = this.themeService.generateCSS(this.selectedTheme);
    const formHtml = this.codeGenerator.generateHTML(this.data.components);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
          ${css}
          ${this.getPreviewStyles()}
        </style>
      </head>
      <body class="${this.isThemeDark(this.selectedTheme) ? 'theme-dark' : 'theme-light'}">
        <div class="preview-header">
          <h2>${this.selectedTheme.name} Theme Preview</h2>
          <p>Preview how your form looks with this theme</p>
        </div>
        ${formHtml}
      </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();
  }

  private getPreviewStyles(): string {
    return `
      body {
        margin: 0;
        padding: 24px;
        font-family: var(--theme-font-family);
        background: var(--theme-background);
        color: var(--theme-text-primary);
        min-height: 100vh;
      }

      .preview-header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--theme-divider);
      }

      .preview-header h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        color: var(--theme-text-primary);
      }

      .preview-header p {
        margin: 0;
        color: var(--theme-text-secondary);
      }

      .generated-form {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
        background: var(--theme-background-paper);
        border-radius: var(--theme-radius-large);
        box-shadow: var(--theme-shadow-medium);
      }

      /* Material approximations with theme */
      .mat-form-field {
        display: block;
        margin-bottom: 20px;
      }

      .mat-label {
        display: block;
        margin-bottom: 8px;
        color: var(--theme-text-secondary);
        font-size: 14px;
        font-weight: 500;
      }

      input, textarea, select {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid var(--theme-input-border);
        border-radius: var(--theme-radius-medium);
        font-size: 16px;
        font-family: var(--theme-font-family);
        background: var(--theme-input-background);
        color: var(--theme-input-text);
        transition: all var(--theme-transition-short);
      }

      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: var(--theme-input-focus-border);
        box-shadow: 0 0 0 3px rgba(var(--theme-primary), 0.1);
      }

      input::placeholder, textarea::placeholder {
        color: var(--theme-input-placeholder);
      }

      button {
        padding: 12px 24px;
        border: none;
        border-radius: var(--theme-radius-medium);
        font-size: 14px;
        font-weight: 500;
        font-family: var(--theme-font-family);
        cursor: pointer;
        transition: all var(--theme-transition-short);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      button[color="primary"] {
        background: var(--theme-primary);
        color: var(--theme-primary-contrast);
      }

      button[color="primary"]:hover {
        background: var(--theme-primary-dark);
        box-shadow: var(--theme-shadow-small);
      }

      button[color="accent"] {
        background: var(--theme-accent);
        color: var(--theme-accent-contrast);
      }

      button[color="warn"] {
        background: var(--theme-warn);
        color: var(--theme-warn-contrast);
      }

      .mat-checkbox, .mat-slide-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        cursor: pointer;
        color: var(--theme-text-primary);
      }

      .mat-radio-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .mat-radio-button {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: var(--theme-text-primary);
      }

      .mat-card {
        background: var(--theme-background-paper);
        border-radius: var(--theme-radius-large);
        padding: 24px;
        box-shadow: var(--theme-shadow-small);
        margin-bottom: 16px;
      }

      .mat-card-title {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--theme-text-primary);
      }

      .mat-card-subtitle {
        color: var(--theme-text-secondary);
        margin-bottom: 16px;
      }

      .mat-divider {
        height: 1px;
        background: var(--theme-divider);
        margin: 20px 0;
      }

      .mat-icon {
        font-family: 'Material Icons';
        font-size: 24px;
        color: var(--theme-text-secondary);
      }

      /* Dark theme specific */
      body.theme-dark {
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--theme-input-text);
          -webkit-box-shadow: 0 0 0px 1000px var(--theme-input-background) inset;
        }
      }
    `;
  }

  private isThemeDark(theme: Theme): boolean {
    const bg = theme.colors.background.default;
    const rgb = this.hexToRgb(bg);
    if (!rgb) return false;

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance < 0.5;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  applyTheme(): void {
    if (this.selectedTheme) {
      this.dialogRef.close(this.selectedTheme);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
