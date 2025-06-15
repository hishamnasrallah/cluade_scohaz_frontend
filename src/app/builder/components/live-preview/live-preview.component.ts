// src/app/builder/components/live-preview/live-preview.component.ts

import { Component, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ComponentConfig } from '../../models/component-config.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CodeGeneratorService } from '../../services/code-generator.service';
import { NgIf, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-live-preview',
  template: `
    <div class="preview-container">
      <div class="preview-header">
        <h3>Live Preview</h3>
        <div class="preview-controls">
          <mat-button-toggle-group [(value)]="deviceView" class="device-toggle">
            <mat-button-toggle value="desktop" matTooltip="Desktop View">
              <mat-icon>computer</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="tablet" matTooltip="Tablet View">
              <mat-icon>tablet</mat-icon>
            </mat-button-toggle>
            <mat-button-toggle value="mobile" matTooltip="Mobile View">
              <mat-icon>smartphone</mat-icon>
            </mat-button-toggle>
          </mat-button-toggle-group>

          <button mat-icon-button (click)="refreshPreview()" matTooltip="Refresh">
            <mat-icon>refresh</mat-icon>
          </button>

          <button mat-icon-button (click)="toggleFullscreen()" matTooltip="Fullscreen">
            <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
        </div>
      </div>

      <div class="preview-frame" [ngClass]="deviceView">
        <iframe
          #previewFrame
          [srcdoc]="previewContent"
          class="preview-iframe"
          [style.width]="getDeviceWidth()"
          [style.height]="getDeviceHeight()">
        </iframe>
      </div>
    </div>
  `,
  imports: [
    NgIf,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  styles: [`
    .preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .preview-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }

    .preview-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .device-toggle {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .preview-frame {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow: auto;
    }

    .preview-iframe {
      background: white;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .preview-frame.mobile .preview-iframe {
      max-width: 375px;
      border-radius: 20px;
      box-shadow: 0 0 0 10px #1e293b, 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .preview-frame.tablet .preview-iframe {
      max-width: 768px;
      border-radius: 16px;
      box-shadow: 0 0 0 8px #334155, 0 10px 25px rgba(0, 0, 0, 0.15);
    }
  `]
})
export class LivePreviewComponent implements OnChanges {
  @Input() components: ComponentConfig[] = [];
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  previewContent: string = '';
  deviceView: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  isFullscreen = false;

  constructor(
    private sanitizer: DomSanitizer,
    private codeGenerator: CodeGeneratorService
  ) {}

  ngOnChanges(): void {
    this.generatePreview();
  }

  generatePreview(): void {
    const html = this.codeGenerator.generateHTML(this.components);
    const styles = this.getPreviewStyles();

    this.previewContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
          ${styles}
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Mock form data for preview
          window.formData = {};
        </script>
      </body>
      </html>
    `;
  }

  getPreviewStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Roboto, sans-serif;
        padding: 20px;
        background: #f8fafc;
      }

      .generated-form {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      /* Material Design Approximations */
      .mat-form-field {
        display: block;
        position: relative;
        margin-bottom: 20px;
      }

      .mat-label {
        display: block;
        margin-bottom: 8px;
        color: #475569;
        font-size: 14px;
        font-weight: 500;
      }

      input, textarea, select {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.2s ease;
        background: white;
      }

      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      button[color="primary"] {
        background: #4f46e5;
        color: white;
      }

      button[color="primary"]:hover {
        background: #4338ca;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }

      .mat-checkbox, .mat-slide-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        cursor: pointer;
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
      }

      .mat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
      }

      .mat-card-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .mat-card-subtitle {
        color: #64748b;
        margin-bottom: 16px;
      }

      @media (max-width: 768px) {
        body {
          padding: 16px;
        }

        .generated-form {
          padding: 16px;
        }
      }
    `;
  }

  getDeviceWidth(): string {
    switch (this.deviceView) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  }

  getDeviceHeight(): string {
    switch (this.deviceView) {
      case 'mobile': return '667px';
      case 'tablet': return '1024px';
      default: return '600px';
    }
  }

  refreshPreview(): void {
    this.generatePreview();
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    // Implement fullscreen logic
  }
}

// src/app/builder/components/live-preview/live-preview.component.html
/*
<div class="preview-wrapper" [class.fullscreen]="isFullscreen">
  <!-- Preview content -->
</div>
*/
