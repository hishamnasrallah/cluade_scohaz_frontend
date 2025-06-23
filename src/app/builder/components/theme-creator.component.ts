// src/app/components/theme-creator/theme-creator.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeCustomizerService } from '../../builder/services/theme-customizer.service';
import { Theme } from '../../builder/models/theme.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-theme-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    <div class="theme-creator-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <button mat-icon-button (click)="navigateBack()" matTooltip="Back to Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>Theme Creator</h1>
          <div class="header-actions">
            <button mat-stroked-button (click)="resetTheme()">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
            <button mat-raised-button color="primary" (click)="saveTheme()">
              <mat-icon>save</mat-icon>
              Save Theme
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Theme List Sidebar -->
        <mat-card class="theme-list">
          <mat-card-header>
            <mat-card-title>Available Themes</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-nav-list>
              <mat-list-item *ngFor="let theme of themes"
                             [class.active]="selectedTheme?.id === theme.id"
                             (click)="selectTheme(theme)">
                <mat-icon matListItemIcon>palette</mat-icon>
                <span matListItemTitle>{{ theme.name }}</span>
                <button mat-icon-button
                        [matMenuTriggerFor]="menu"
                        (click)="$event.stopPropagation()"
                        *ngIf="!theme.isPredefined">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="duplicateTheme(theme)">
                    <mat-icon>content_copy</mat-icon>
                    Duplicate
                  </button>
                  <button mat-menu-item (click)="exportTheme(theme)">
                    <mat-icon>download</mat-icon>
                    Export
                  </button>
                  <button mat-menu-item (click)="deleteTheme(theme)" class="delete-option">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </mat-list-item>
            </mat-nav-list>
            <div class="theme-actions">
              <button mat-stroked-button (click)="createNewTheme()" class="full-width">
                <mat-icon>add</mat-icon>
                Create New Theme
              </button>
              <button mat-stroked-button (click)="importTheme()" class="full-width">
                <mat-icon>upload</mat-icon>
                Import Theme
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Theme Editor -->
        <div class="theme-editor" *ngIf="selectedTheme">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-form-field appearance="outline" class="theme-name-field">
                  <mat-label>Theme Name</mat-label>
                  <input matInput [(ngModel)]="editingTheme.name"
                  >
                </mat-form-field>
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-tab-group>
                <!-- Colors Tab -->
                <mat-tab label="Colors">
                  <div class="tab-content">
                    <mat-accordion multi>
                      <!-- Primary Color -->
                      <mat-expansion-panel expanded>
                        <mat-expansion-panel-header>
                          <mat-panel-title>Primary Color</mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="color-group">
                          <div class="color-input">
                            <label>Main</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.primary.main"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.primary.main"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Light</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.primary.light"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.primary.light"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Dark</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.primary.dark"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.primary.dark"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <!-- Accent Color -->
                      <mat-expansion-panel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>Accent Color</mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="color-group">
                          <div class="color-input">
                            <label>Main</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.accent.main"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.accent.main"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Light</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.accent.light"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.accent.light"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Dark</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.accent.dark"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.accent.dark"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <!-- Background Colors -->
                      <mat-expansion-panel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>Background Colors</mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="color-group">
                          <div class="color-input">
                            <label>Default</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.background.default"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.background.default"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Paper</label>
                            <input type="color"
                                   [(ngModel)]="editingTheme.colors.background.paper"
                                   (change)="updatePreview()">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.background.paper"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <!-- Text Colors -->
                      <mat-expansion-panel>
                        <mat-expansion-panel-header>
                          <mat-panel-title>Text Colors</mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="color-group">
                          <div class="color-input">
                            <label>Primary</label>
                            <input type="color"
                                   [value]="getRgbaColor(editingTheme.colors.text.primary)"
                                   (change)="setTextColor('primary', $event)"
                                   class="color-picker">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.text.primary"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                          <div class="color-input">
                            <label>Secondary</label>
                            <input type="color"
                                   [value]="getRgbaColor(editingTheme.colors.text.secondary)"
                                   (change)="setTextColor('secondary', $event)"
                                   class="color-picker">
                            <input type="text"
                                   [(ngModel)]="editingTheme.colors.text.secondary"
                                   (change)="updatePreview()"
                                   class="hex-input">
                          </div>
                        </div>
                      </mat-expansion-panel>
                    </mat-accordion>
                  </div>
                </mat-tab>

                <!-- Typography Tab -->
                <mat-tab label="Typography">
                  <div class="tab-content">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Font Family</mat-label>
                      <mat-select [(ngModel)]="editingTheme.typography.fontFamily"
                                  (selectionChange)="updatePreview()">
                        <mat-option value='"Roboto", "Helvetica Neue", sans-serif'>Roboto</mat-option>
                        <mat-option value='"Inter", sans-serif'>Inter</mat-option>
                        <mat-option value='"Poppins", sans-serif'>Poppins</mat-option>
                        <mat-option value='"Open Sans", sans-serif'>Open Sans</mat-option>
                        <mat-option value='"Lato", sans-serif'>Lato</mat-option>
                        <mat-option value='"Montserrat", sans-serif'>Montserrat</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div class="typography-sizes">
                      <h3>Font Sizes</h3>
                      <div class="size-inputs">
                        <mat-form-field appearance="outline">
                          <mat-label>Small</mat-label>
                          <input matInput [(ngModel)]="editingTheme.typography.fontSize.small"
                                 (change)="updatePreview()">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Medium</mat-label>
                          <input matInput [(ngModel)]="editingTheme.typography.fontSize.medium"
                                 (change)="updatePreview()">
                        </mat-form-field>
                        <mat-form-field appearance="outline">
                          <mat-label>Large</mat-label>
                          <input matInput [(ngModel)]="editingTheme.typography.fontSize.large"
                                 (change)="updatePreview()">
                        </mat-form-field>
                      </div>
                    </div>
                  </div>
                </mat-tab>

                <!-- Spacing Tab -->
                <mat-tab label="Spacing">
                  <div class="tab-content">
                    <div class="spacing-inputs">
                      <mat-form-field appearance="outline">
                        <mat-label>Base Unit (px)</mat-label>
                        <input matInput type="number"
                               [(ngModel)]="editingTheme.spacing.unit"
                               (change)="updateSpacing()">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Small</mat-label>
                        <input matInput [(ngModel)]="editingTheme.spacing.small"
                               (change)="updatePreview()">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Medium</mat-label>
                        <input matInput [(ngModel)]="editingTheme.spacing.medium"
                               (change)="updatePreview()">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Large</mat-label>
                        <input matInput [(ngModel)]="editingTheme.spacing.large"
                               (change)="updatePreview()">
                      </mat-form-field>
                    </div>
                  </div>
                </mat-tab>

                <!-- Borders & Shadows Tab -->
                <mat-tab label="Borders & Shadows">
                  <div class="tab-content">
                    <h3>Border Radius</h3>
                    <div class="radius-inputs">
                      <mat-form-field appearance="outline">
                        <mat-label>Small</mat-label>
                        <input matInput [(ngModel)]="editingTheme.borderRadius.small"
                               (change)="updatePreview()">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Medium</mat-label>
                        <input matInput [(ngModel)]="editingTheme.borderRadius.medium"
                               (change)="updatePreview()">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Large</mat-label>
                        <input matInput [(ngModel)]="editingTheme.borderRadius.large"
                               (change)="updatePreview()">
                      </mat-form-field>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Preview Panel -->
        <mat-card class="preview-panel">
          <mat-card-header>
            <mat-card-title>Live Preview</mat-card-title>
            <button mat-icon-button (click)="applyTheme()" matTooltip="Apply Theme">
              <mat-icon>visibility</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <div class="preview-container" #previewContainer>
              <iframe #previewFrame
                      src="about:blank"
                      class="preview-iframe"
                      (load)="onPreviewLoad()">
              </iframe>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Hidden file input for import -->
      <input type="file"
             #fileInput
             accept=".json"
             style="display: none"
             (change)="onFileSelected($event)">
    </div>
  `,
  styles: [`
    .theme-creator-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--theme-background, #f5f5f5);
    }

    .header {
      background: var(--theme-background-paper, #fff);
      border-bottom: 1px solid var(--theme-divider, #e0e0e0);
      padding: 16px 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header h1 {
      margin: 0;
      flex: 1;
      font-size: 24px;
      color: var(--theme-text-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .content {
      flex: 1;
      display: grid;
      grid-template-columns: 300px 1fr 400px;
      gap: 24px;
      padding: 24px;
      overflow: hidden;
    }

    .theme-list {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .theme-list mat-card-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    .theme-list mat-nav-list {
      padding: 8px 0;
    }

    .theme-list mat-list-item {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .theme-list mat-list-item:hover {
      background: rgba(0,0,0,0.04);
    }

    .theme-list mat-list-item.active {
      background: rgba(63, 81, 181, 0.12);
      color: var(--theme-primary);
    }

    .theme-actions {
      padding: 16px;
      border-top: 1px solid var(--theme-divider);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .theme-editor {
      height: 100%;
      overflow: hidden;
    }

    .theme-editor mat-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .theme-editor mat-card-content {
      flex: 1;
      overflow: hidden;
    }

    .theme-name-field {
      width: 300px;
    }

    .tab-content {
      padding: 24px;
      height: calc(100vh - 300px);
      overflow-y: auto;
    }

    .color-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .color-input {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-input label {
      width: 80px;
      font-weight: 500;
      color: var(--theme-text-secondary);
    }

    .color-input input[type="color"] {
      width: 50px;
      height: 40px;
      border: 1px solid var(--theme-border);
      border-radius: 4px;
      cursor: pointer;
    }

    .hex-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--theme-border);
      border-radius: 4px;
      font-family: monospace;
    }

    .typography-sizes,
    .spacing-inputs,
    .radius-inputs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .preview-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .preview-container {
      flex: 1;
      position: relative;
      background: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    .delete-option {
      color: var(--theme-warn);
    }

    ::ng-deep .mat-mdc-tab-body-wrapper {
      height: 100%;
    }

    @media (max-width: 1200px) {
      .content {
        grid-template-columns: 250px 1fr;
      }

      .preview-panel {
        display: none;
      }
    }
  `]
})
export class ThemeCreatorComponent implements OnInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  themes: Theme[] = [];
  selectedTheme: Theme | null = null;
  editingTheme!: Theme;

  constructor(
    private themeService: ThemeCustomizerService,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    this.selectActiveTheme();
  }

  loadThemes(): void {
    this.themes = this.themeService.getAllThemes();
  }

  selectActiveTheme(): void {
    const activeTheme = this.themeService.getActiveTheme(this.editingTheme.id);
    // @ts-ignore
    if (activeTheme) {
      this.selectTheme(activeTheme);
    }
  }

  selectTheme(theme: Theme): void {
    this.selectedTheme = theme;
    this.editingTheme = JSON.parse(JSON.stringify(theme)); // Deep clone
    this.updatePreview();
  }

  createNewTheme(): void {
    const newTheme = this.themeService.createDefaultTheme('New Theme');
    // @ts-ignore
    this.themeService.saveTheme(newTheme);
    this.loadThemes();
    // @ts-ignore
    this.selectTheme(newTheme);
    this.showNotification('New theme created');
  }

  duplicateTheme(theme: Theme): void {
    const duplicated = this.themeService.cloneTheme(theme.id, `${theme.name} Copy`);
    this.loadThemes();
    // @ts-ignore
    this.selectTheme(duplicated);
    this.showNotification('Theme duplicated');
  }

  saveTheme(): void {
    if (!this.editingTheme || this.editingTheme.isPredefined) {
      this.showNotification('Cannot modify predefined themes', 'error');
      return;
    }

    try {
      this.themeService.saveTheme(this.editingTheme);
      this.loadThemes();
      this.showNotification('Theme saved successfully');
    } catch (error) {
      this.showNotification('Failed to save theme', 'error');
    }
  }

  deleteTheme(theme: Theme): void {
    if (confirm(`Are you sure you want to delete "${theme.name}"?`)) {
      try {
        this.themeService.deleteTheme(theme.id);
        this.loadThemes();
        if (this.selectedTheme?.id === theme.id) {
          this.selectedTheme = null;
        }
        this.showNotification('Theme deleted');
      } catch (error) {
        this.showNotification('Failed to delete theme', 'error');
      }
    }
  }

  exportTheme(theme: Theme): void {
    const json = this.themeService.exportTheme(theme.id);
    // @ts-ignore
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showNotification('Theme exported');
  }

  importTheme(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const imported = this.themeService.importTheme(e.target.result);
          this.loadThemes();
          // @ts-ignore
          this.selectTheme(imported);
          this.showNotification('Theme imported successfully');
        } catch (error) {
          this.showNotification('Failed to import theme', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  applyTheme(): void {
    this.themeService.getActiveTheme(this.editingTheme.id);
    this.showNotification('Theme applied');
  }

  updatePreview(): void {
    if (this.previewFrame?.nativeElement?.contentWindow) {
      this.renderPreview();
    }
  }

  onPreviewLoad(): void {
    this.renderPreview();
  }

  private renderPreview(): void {
    const iframe = this.previewFrame.nativeElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!doc) return;

    const css = this.themeService.generateCSS(this.editingTheme);
    const html = this.generatePreviewHTML();

    doc.open();
    doc.write(html);
    doc.close();

    // Apply theme styles
    const style = doc.createElement('style');
    style.textContent = css + this.getPreviewStyles();
    doc.head.appendChild(style);
  }

  private generatePreviewHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      </head>
      <body>
        <div class="preview-content">
          <div class="preview-header">
            <h2>Theme Preview</h2>
            <p>See how your theme looks in action</p>
          </div>

          <div class="preview-section">
            <h3>Buttons</h3>
            <div class="button-group">
              <button class="btn btn-primary">Primary</button>
              <button class="btn btn-accent">Accent</button>
              <button class="btn btn-warn">Warning</button>
            </div>
          </div>

          <div class="preview-section">
            <h3>Form Elements</h3>
            <div class="form-group">
              <label>Text Input</label>
              <input type="text" placeholder="Enter some text">
            </div>
            <div class="form-group">
              <label>Select</label>
              <select>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>

          <div class="preview-section">
            <h3>Cards</h3>
            <div class="card">
              <h4>Card Title</h4>
              <p>This is a sample card with your theme colors applied.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPreviewStyles(): string {
    return `
      body {
        margin: 0;
        padding: 20px;
        font-family: var(--theme-font-family);
        background: var(--theme-background);
        color: var(--theme-text-primary);
      }

      .preview-content {
        max-width: 600px;
        margin: 0 auto;
      }

      .preview-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .preview-header h2 {
        margin: 0;
        font-size: 28px;
      }

      .preview-header p {
        color: var(--theme-text-secondary);
      }

      .preview-section {
        margin-bottom: 32px;
      }

      .preview-section h3 {
        margin-bottom: 16px;
        color: var(--theme-text-primary);
      }

      .button-group {
        display: flex;
        gap: 12px;
      }

      .btn {
        padding: 10px 24px;
        border: none;
        border-radius: var(--theme-radius-medium);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--theme-transition-standard);
      }

      .btn-primary {
        background: var(--theme-primary);
        color: var(--theme-primary-contrast);
      }

      .btn-accent {
        background: var(--theme-accent);
        color: var(--theme-accent-contrast);
      }

      .btn-warn {
        background: var(--theme-warn);
        color: var(--theme-warn-contrast);
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--theme-text-primary);
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--theme-input-border);
        border-radius: var(--theme-radius-medium);
        background: var(--theme-input-background);
        color: var(--theme-input-text);
        font-size: 14px;
        transition: border-color var(--theme-transition-short);
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--theme-input-focus-border);
      }

      .card {
        padding: 24px;
        background: var(--theme-background-paper);
        border-radius: var(--theme-radius-large);
        box-shadow: var(--theme-shadow-small);
      }

      .card h4 {
        margin: 0 0 12px 0;
        color: var(--theme-text-primary);
      }

      .card p {
        margin: 0;
        color: var(--theme-text-secondary);
      }
    `;
  }

  resetTheme(): void {
    if (this.selectedTheme) {
      this.selectTheme(this.selectedTheme);
      this.showNotification('Theme reset to last saved state');
    }
  }

  updateSpacing(): void {
    // Update spacing values based on unit
    const unit = this.editingTheme.spacing.unit;
    this.editingTheme.spacing.small = `${unit}px`;
    this.editingTheme.spacing.medium = `${unit * 2}px`;
    this.editingTheme.spacing.large = `${unit * 3}px`;
    this.editingTheme.spacing.xlarge = `${unit * 4}px`;
    this.updatePreview();
  }

  getRgbaColor(rgba: string): string {
    // Convert rgba to hex for color picker
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    return rgba;
  }

  setTextColor(type: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const hex = input.value;
    const rgba = this.hexToRgba(hex, type === 'secondary' ? 0.54 : 0.87);
    (this.editingTheme.colors.text as any)[type] = rgba;
    this.updatePreview();
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`${type}-snackbar`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
