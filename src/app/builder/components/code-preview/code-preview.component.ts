// src/app/builder/components/code-preview/code-preview.component.ts

import { Component, Input, OnChanges } from '@angular/core';
import { ComponentConfig } from '../../models/component-config.model';
import { CodeGeneratorService } from '../../services/code-generator.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-code-preview',
  templateUrl: './code-preview.component.html',
  imports: [
    MatIconButton,
    MatIcon,
    MatTabsModule,
    NgIf,
    MatTooltipModule
  ],
  styleUrls: ['./code-preview.component.scss']
})
export class CodePreviewComponent implements OnChanges {
  @Input() schema: ComponentConfig[] = [];

  generatedHTML: string = '';
  generatedTypeScript: string = '';
  generatedModule: string = '';
  generatedCSS: string = '';

  selectedTabIndex: number = 0;
  isFullscreen: boolean = false;

  constructor(
    private generator: CodeGeneratorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(): void {
    this.generateAllCode();
  }

  private generateAllCode(): void {
    this.generatedHTML = this.generator.generateHTML(this.schema);
    this.generatedTypeScript = this.generator.generateTypeScriptComponent(this.schema);
    this.generatedModule = this.generator.generateModuleImports();
    this.generatedCSS = this.generateCSS();
  }

  private generateCSS(): string {
    return `.generated-form {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
}

.radio-group-container,
.slider-container {
  margin-bottom: 16px;
}

.radio-group-label,
.slider-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  margin-bottom: 8px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider-value {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
}

mat-card {
  margin-bottom: 16px;
}

mat-expansion-panel {
  margin-bottom: 8px;
}

/* Responsive layout */
@media (max-width: 768px) {
  .generated-form {
    padding: 16px;
  }
}`;
  }

  copyToClipboard(content: string, type: string): void {
    navigator.clipboard.writeText(content).then(() => {
      this.snackBar.open(`${type} code copied to clipboard!`, 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }).catch(err => {
      this.snackBar.open('Failed to copy code', 'Close', {
        duration: 2000,
        panelClass: ['error-snackbar']
      });
    });
  }

  downloadCode(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadAllFiles(): void {
    // Create a timestamp for unique filenames
    const timestamp = new Date().toISOString().split('T')[0];

    // Download all files
    this.downloadCode(this.generatedHTML, `generated-form-${timestamp}.component.html`);
    this.downloadCode(this.generatedTypeScript, `generated-form-${timestamp}.component.ts`);
    this.downloadCode(this.generatedCSS, `generated-form-${timestamp}.component.scss`);
    this.downloadCode(this.generatedModule, `generated-form-${timestamp}.module.ts`);

    this.snackBar.open('All files downloaded!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  getCodeByTab(): string {
    switch (this.selectedTabIndex) {
      case 0: return this.generatedHTML;
      case 1: return this.generatedTypeScript;
      case 2: return this.generatedCSS;
      case 3: return this.generatedModule;
      default: return '';
    }
  }

  getFilenameByTab(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    switch (this.selectedTabIndex) {
      case 0: return `generated-form-${timestamp}.component.html`;
      case 1: return `generated-form-${timestamp}.component.ts`;
      case 2: return `generated-form-${timestamp}.component.scss`;
      case 3: return `generated-form-${timestamp}.module.ts`;
      default: return 'generated-code.txt';
    }
  }

  getLanguageByTab(): string {
    switch (this.selectedTabIndex) {
      case 0: return 'HTML';
      case 1: return 'TypeScript';
      case 2: return 'CSS';
      case 3: return 'TypeScript';
      default: return 'Code';
    }
  }
}
