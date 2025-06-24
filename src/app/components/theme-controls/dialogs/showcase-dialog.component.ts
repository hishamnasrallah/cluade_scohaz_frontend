// src/app/components/theme-controls/dialogs/showcase-dialog.component.ts
import { Component, Inject, ViewChild, ElementRef, AfterViewInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeConfig } from '../../../models/theme.model';
import { ThemeShowcaseUtil } from '../../theme-creator/utils/theme-showcase.util';

export interface ShowcaseDialogData {
  theme: ThemeConfig;
}

@Component({
  selector: 'app-showcase-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <div class="showcase-dialog">
      <h2 mat-dialog-title>
        <mat-icon>preview</mat-icon>
        Theme Showcase
      </h2>

      <mat-dialog-content>
        <mat-tab-group>
          <!-- Preview Tab -->
          <mat-tab label="Preview">
            <div class="preview-container">
              <div class="preview-toolbar">
                <button mat-icon-button (click)="refreshPreview()" matTooltip="Refresh Preview">
                  <mat-icon>refresh</mat-icon>
                </button>
                <button mat-icon-button (click)="openInNewTab()" matTooltip="Open in New Tab">
                  <mat-icon>open_in_new</mat-icon>
                </button>
              </div>
              <div class="iframe-wrapper">
                <iframe #previewFrame
                        class="preview-iframe"
                        [srcdoc]="showcaseHtml"
                        sandbox="allow-same-origin allow-scripts"
                        (load)="onIframeLoad()">
                </iframe>
                <div class="loading-overlay" *ngIf="isLoading">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>
              </div>
            </div>
          </mat-tab>
          <!-- Code Tab -->
          <mat-tab label="HTML Code">
            <div class="code-container">
              <div class="code-toolbar">
                <button mat-stroked-button (click)="copyCode()">
                  <mat-icon>content_copy</mat-icon>
                  Copy Code
                </button>
                <span class="code-info">{{ codeSize }} • {{ lineCount }} lines</span>
              </div>
              <pre class="code-preview"><code [innerHTML]="highlightedCode"></code></pre>
            </div>
          </mat-tab>

          <!-- Settings Tab -->
          <mat-tab label="Settings">
            <div class="settings-container">
              <h4>Showcase Options</h4>

              <div class="setting-item">
                <mat-checkbox [(ngModel)]="options.includeMetadata">
                  Include metadata comments
                </mat-checkbox>
              </div>

              <div class="setting-item">
                <mat-checkbox [(ngModel)]="options.includeAllComponents">
                  Include all component examples
                </mat-checkbox>
              </div>

              <div class="setting-item">
                <mat-checkbox [(ngModel)]="options.includeFontLinks">
                  Include Google Font links
                </mat-checkbox>
              </div>

              <div class="setting-item">
                <mat-checkbox [(ngModel)]="options.includeAnimations">
                  Include animation examples
                </mat-checkbox>
              </div>

              <div class="setting-item">
                <mat-checkbox [(ngModel)]="options.minify">
                  Minify HTML output
                </mat-checkbox>
              </div>

              <button mat-raised-button color="primary" (click)="regenerateShowcase()">
                <mat-icon>refresh</mat-icon>
                Regenerate Showcase
              </button>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Close</button>
        <button mat-raised-button color="primary" (click)="download()">
          <mat-icon>download</mat-icon>
          Download HTML
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .showcase-dialog {
      width: 90vw;
      max-width: 1200px;
      height: 80vh;
      overflow: hidden;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 16px 24px;
      font-family: 'Poppins', sans-serif;
      color: #2F4858;

      mat-icon {
        color: #34C5AA;
      }
    }

    mat-dialog-content {
      padding: 0;
      margin: 0;
      height: calc(100% - 56px - 56px);  // Subtract header and footer heights exactly
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    ::ng-deep .mat-mdc-tab-group {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ::ng-deep .mat-mdc-tab-header {
      flex-shrink: 0;
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-tab-body {
      height: 100%;
      overflow: hidden;
    }

    ::ng-deep .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .preview-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 12px;
      box-sizing: border-box;
    }

    .code-container,
    .settings-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 12px;
    }

    .preview-toolbar,
    .code-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    .iframe-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }

    .preview-iframe {
      flex: 1;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      background: white;
      display: block;

    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .code-preview {
      flex: 1;
      overflow: auto;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 16px;
      border-radius: 8px;
      margin: 0;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;
      min-height: 0;

      code {
        white-space: pre;
      }
    }

    .code-info {
      font-size: 12px;
      color: #6B7280;
    }

    .settings-container {
      overflow-y: auto;

      h4 {
        margin: 0 0 24px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
      }

      .setting-item {
        margin-bottom: 16px;
      }
    }

    mat-dialog-actions {
      height: 56px;  // Fixed height
      padding: 12px 24px;
      margin: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;

      button {
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    // Syntax highlighting
    .code-preview {
      .token.tag { color: #569cd6; }
      .token.attr-name { color: #9cdcfe; }
      .token.attr-value { color: #ce9178; }
      .token.punctuation { color: #808080; }
      .token.comment { color: #6a9955; }
      .token.string { color: #ce9178; }
      .token.property { color: #9cdcfe; }
      .token.value { color: #ce9178; }
      .token.selector { color: #d7ba7d; }
      .token.rule { color: #c586c0; }
    }
  `]
})
export class ShowcaseDialogComponent implements AfterViewInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  showcaseHtml: string = '';
  highlightedCode: SafeHtml = '';
  codeSize: string = '0 KB';
  lineCount: number = 0;
  isLoading: boolean = true;

  options = {
    includeMetadata: true,
    includeAllComponents: true,
    includeFontLinks: true,
    includeAnimations: true,
    minify: false
  };

  constructor(
    public dialogRef: MatDialogRef<ShowcaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShowcaseDialogData,
    private sanitizer: DomSanitizer
  ) {
    this.generateShowcase();
  }

  ngAfterViewInit(): void {
    // Initialize the preview iframe
    if (this.previewFrame && this.previewFrame.nativeElement) {
      const iframe = this.previewFrame.nativeElement;

      // Wait for iframe to load
      iframe.onload = () => {
        this.applyIframeStyles(iframe);
      };

      // If already loaded (when srcdoc is used)
      setTimeout(() => {
        if (iframe.contentDocument) {
          this.applyIframeStyles(iframe);
        }
      }, 100);
    }
  }
  onIframeLoad(): void {
    this.isLoading = false;
    if (this.previewFrame && this.previewFrame.nativeElement) {
      this.applyIframeStyles(this.previewFrame.nativeElement);
    }
  }

  refreshPreview(): void {
    this.isLoading = true;
    this.generateShowcase();
  }
  private applyIframeStyles(iframe: HTMLIFrameElement): void {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Ensure the iframe has proper viewport settings
      const viewport = iframeDoc.querySelector('meta[name="viewport"]');
      if (!viewport) {
        const meta = iframeDoc.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0';
        iframeDoc.head.appendChild(meta);
      }

      // Force a reflow to ensure styles are applied
      iframeDoc.body.style.display = 'none';
      iframeDoc.body.offsetHeight; // Force reflow
      iframeDoc.body.style.display = 'block';
    } catch (error) {
      console.error('Error applying iframe styles:', error);
    }
  }

  generateShowcase(): void {
    this.showcaseHtml = ThemeShowcaseUtil.generateShowcase(this.data.theme, this.options);
    this.updateCodeView();

    // Force refresh of iframe after content update
    if (this.previewFrame && this.previewFrame.nativeElement) {
      const iframe = this.previewFrame.nativeElement;
      // Reset srcdoc to force reload
      iframe.srcdoc = '';
      setTimeout(() => {
        iframe.srcdoc = this.showcaseHtml;
      }, 10);
    }
  }

  updateCodeView(): void {
    // Calculate size
    const sizeInBytes = new Blob([this.showcaseHtml]).size;
    this.codeSize = this.formatFileSize(sizeInBytes);

    // Count lines
    this.lineCount = this.showcaseHtml.split('\n').length;

    // Simple syntax highlighting
    let highlighted = this.escapeHtml(this.showcaseHtml);

    // Highlight HTML tags
    highlighted = highlighted.replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9-]*)(.*?)(&gt;)/g,
      '$1<span class="token tag">$2</span>$3$4');

    // Highlight attributes
    highlighted = highlighted.replace(/(\s)([a-zA-Z-]+)(=)/g,
      '$1<span class="token attr-name">$2</span>$3');

    // Highlight attribute values
    highlighted = highlighted.replace(/(=)(&quot;)(.*?)(&quot;)/g,
      '$1<span class="token punctuation">$2</span><span class="token attr-value">$3</span><span class="token punctuation">$4</span>');

    // Highlight comments
    highlighted = highlighted.replace(/(&lt;!--)(.*?)(--&gt;)/g,
      '<span class="token comment">$1$2$3</span>');

    // Highlight CSS properties in style tags
    highlighted = highlighted.replace(/([\s{;])([a-zA-Z-]+)(:)/g,
      '$1<span class="token property">$2</span>$3');

    // Highlight CSS values
    highlighted = highlighted.replace(/(:)(\s*)([^;}\s]+)/g,
      '$1$2<span class="token value">$3</span>');

    this.highlightedCode = this.sanitizer.sanitize(SecurityContext.HTML, highlighted) || '';
  }

  escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return Math.round(bytes / 1048576) + ' MB';
  }


  regenerateShowcase(): void {
    this.generateShowcase();
  }

  openInNewTab(): void {
    const blob = new Blob([this.showcaseHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.showcaseHtml).then(() => {
      // You could show a snackbar here
      console.log('Code copied to clipboard');
    });
  }

  download(): void {
    const brandName = this.data.theme.brandName || 'theme';
    const sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${sanitizedBrandName}-showcase-${timestamp}.html`;

    const blob = new Blob([this.showcaseHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
