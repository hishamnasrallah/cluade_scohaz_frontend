import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ThemeConfig, ThemePreset } from '../../models/theme.model';
import { Observable } from 'rxjs';
import { ThemePreviewComponent } from '../../builder/components/theme-preview/theme-preview.component';
import { ColorPickerComponent } from '../theme-controls/color-picker/color-picker.component';
import { TypographyControlsComponent } from '../theme-controls/typography-controls/typography-controls.component';
import { SpacingControlsComponent } from '../theme-controls/spacing-controls/spacing-controls.component';
import { EffectsControlsComponent } from '../theme-controls/effects-controls/effects-controls.component';

@Component({
  selector: 'app-theme-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemePreviewComponent,
    ColorPickerComponent,
    TypographyControlsComponent,
    SpacingControlsComponent,
    EffectsControlsComponent
  ],
  styles: [`
    .slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      background: var(--border-default);
      cursor: pointer;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-primary-500);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-out);
    }

    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
    }

    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-primary-500);
      cursor: pointer;
      border: none;
      transition: all var(--duration-fast) var(--ease-out);
    }

    .slider::-moz-range-thumb:hover {
      transform: scale(1.2);
    }
  `],
  template: `
    <div class="theme-creator-container">
      <div class="theme-creator-grid">
        <!-- Theme Controls Panel -->
        <div class="theme-controls-panel">
          <header class="panel-header">
            <h2>Theme Creator</h2>
            <div class="header-actions">
              <button class="btn btn-sm btn-outline" (click)="resetTheme()">
                🔄 Reset
              </button>
              <button class="btn btn-sm btn-primary" (click)="exportTheme()">
                📤 Export
              </button>
              <button class="btn btn-sm btn-secondary" (click)="importTheme()">
                📥 Import
              </button>
              <input
                #importInput
                type="file"
                accept=".json"
                style="display: none"
                (change)="handleImport($event)"
              />
            </div>
          </header>

          <!-- Design Presets -->
          <section class="presets-section">
            <h3>Design Presets</h3>
            <div class="presets-grid" *ngIf="presets$ | async as presets">
              <button
                *ngFor="let preset of presets"
                class="preset-button"
                (click)="applyPreset(preset.id)"
                [title]="preset.description"
              >
                <span class="preset-name">{{ preset.name }}</span>
              </button>
            </div>
          </section>

          <!-- Tab Navigation -->
          <nav class="tab-navigation">
            <button
              *ngFor="let tab of tabs"
              class="tab-button"
              [class.active]="activeTab === tab.id"
              (click)="setActiveTab(tab.id)"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </nav>

          <!-- Tab Content -->
          <div class="tab-content" *ngIf="theme$ | async as theme">
            <!-- Colors Tab -->
            <div *ngIf="activeTab === 'colors'" class="tab-panel">
              <app-color-picker
                [theme]="theme"
                (themeChange)="updateTheme($event)"
              ></app-color-picker>
            </div>

            <!-- Typography Tab -->
            <div *ngIf="activeTab === 'typography'" class="tab-panel">
              <app-typography-controls
                [theme]="theme"
                (themeChange)="updateTheme($event)"
              ></app-typography-controls>
            </div>

            <!-- Layout Tab -->
            <div *ngIf="activeTab === 'layout'" class="tab-panel">
              <app-spacing-controls
                [theme]="theme"
                (themeChange)="updateTheme($event)"
              ></app-spacing-controls>
            </div>

            <!-- Effects Tab -->
            <div *ngIf="activeTab === 'effects'" class="tab-panel">
              <app-effects-controls
                [theme]="theme"
                (themeChange)="updateTheme($event)"
              ></app-effects-controls>
            </div>

            <!-- Accessibility Tab -->
            <div *ngIf="activeTab === 'accessibility'" class="tab-panel">
              <div class="control-group">
                <h4>Theme Mode</h4>
                <div class="button-group">
                  <button
                    class="mode-button"
                    [class.active]="theme.mode === 'light'"
                    (click)="updateThemeProperty('mode', 'light')"
                  >
                    ☀️ Light
                  </button>
                  <button
                    class="mode-button"
                    [class.active]="theme.mode === 'dark'"
                    (click)="updateThemeProperty('mode', 'dark')"
                  >
                    🌙 Dark
                  </button>
                  <button
                    class="mode-button"
                    [class.active]="theme.mode === 'auto'"
                    (click)="updateThemeProperty('mode', 'auto')"
                  >
                    🔄 Auto
                  </button>
                </div>
              </div>

              <div class="control-group">
                <h4>Accessibility Options</h4>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="theme.reducedMotion"
                    (change)="updateThemeProperty('reducedMotion', $any($event.target).checked)"
                  />
                  <span>Reduced Motion</span>
                </label>
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="theme.highContrast"
                    (change)="updateThemeProperty('highContrast', $any($event.target).checked)"
                  />
                  <span>High Contrast</span>
                </label>
              </div>

              <div class="control-group">
                <label>Focus Outline Width: {{ theme.focusOutlineWidth }}px</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  [value]="theme.focusOutlineWidth"
                  (input)="updateThemeProperty('focusOutlineWidth', +$any($event.target).value)"
                  class="slider"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Live Preview Panel -->
        <div class="preview-panel">
          <app-theme-preview></app-theme-preview>
        </div>
      </div>

      <!-- Export Modal -->
      <div class="modal-overlay" *ngIf="showExportModal" (click)="showExportModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Export Theme CSS</h3>
            <button class="close-button" (click)="showExportModal = false">✕</button>
          </div>
          <div class="modal-body">
            <textarea
              class="code-output"
              [value]="exportedCode"
              readonly
              rows="20"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="copyToClipboard(exportedCode)">
              📋 Copy to Clipboard
            </button>
            <button class="btn btn-secondary" (click)="exportJSON()">
              💾 Download JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./theme-creator.component.scss']
})
export class ThemeCreatorComponent implements OnInit {
  theme$: Observable<ThemeConfig>;
  presets$: Observable<ThemePreset[]>;
  activeTab: string = 'colors';
  showExportModal: boolean = false;
  exportedCode: string = '';

  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;

  tabs = [
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ];

  constructor(public themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
    this.presets$ = this.themeService.presets$;
  }

  ngOnInit(): void {
    // Initialize theme
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  applyPreset(presetId: string): void {
    this.themeService.applyPreset(presetId);
  }

  updateTheme(updates: Partial<ThemeConfig>): void {
    this.themeService.updateTheme(updates);
  }

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.themeService.updateThemeProperty(property, value);
  }

  resetTheme(): void {
    if (confirm('Are you sure you want to reset to default theme?')) {
      this.themeService.resetTheme();
    }
  }

  exportTheme(): void {
    this.exportedCode = this.themeService.generateCSS();
    this.showExportModal = true;
  }

  exportJSON(): void {
    const themeJson = this.themeService.exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importTheme(): void {
    this.importInput.nativeElement.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeJson = e.target?.result as string;
          this.themeService.importTheme(themeJson);
          alert('Theme imported successfully!');
        } catch (error) {
          alert('Failed to import theme. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }
}
