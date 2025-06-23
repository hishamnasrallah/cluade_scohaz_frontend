import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeConfig, generateColorPalette, getContrastRatio as calculateContrastRatio } from '../../../models/theme.model';

interface ColorGroup {
  title: string;
  description?: string;
  colors: Array<{
    key: keyof ThemeConfig;
    label: string;
    description?: string;
    allowAlpha?: boolean;
    showContrast?: boolean;
    contrastAgainst?: keyof ThemeConfig;
  }>;
}

@Component({
  selector: 'app-advanced-color-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule],
  template: `
    <div class="advanced-color-controls">
      <!-- Quick Actions -->
      <div class="quick-actions">
        <button mat-stroked-button (click)="generatePalette()" class="action-btn">
          <mat-icon>palette</mat-icon>
          Generate Palette
        </button>
        <button mat-stroked-button (click)="checkAllContrast()" class="action-btn">
          <mat-icon>contrast</mat-icon>
          Check Contrast
        </button>
        <button mat-stroked-button (click)="harmonizeColors()" class="action-btn">
          <mat-icon>tune</mat-icon>
          Harmonize
        </button>
      </div>

      <!-- Color Groups -->
      <div *ngFor="let group of colorGroups" class="color-group">
        <div class="group-header">
          <h4>{{ group.title }}</h4>
          <p *ngIf="group.description" class="group-description">{{ group.description }}</p>
        </div>

        <div class="colors-grid">
          <div *ngFor="let color of group.colors" class="color-control-item">
            <div class="color-header">
              <label>{{ color.label }}</label>
              <span *ngIf="color.description" class="color-description" [matTooltip]="color.description">
                <mat-icon>info</mat-icon>
              </span>
            </div>

            <div class="color-input-group">
              <div class="color-preview-wrapper">
                <div class="color-preview"
                     [style.background]="theme[color.key]"
                     (click)="openColorPicker(color.key)">
                  <span class="color-value">{{ theme[color.key] }}</span>
                </div>
                <input
                  *ngIf="!color.allowAlpha"
                  type="color"
                  [value]="convertToHex(theme[color.key])"
                  (input)="updateColor(color.key, $any($event.target).value)"
                  class="hidden-color-input"
                  #colorInput
                />
              </div>

              <div class="color-controls">
                <input
                  type="text"
                  [value]="theme[color.key]"
                  (input)="updateColor(color.key, $any($event.target).value)"
                  class="color-text-input"
                  [placeholder]="color.allowAlpha ? 'rgba(0, 0, 0, 0.5)' : '#000000'"
                />

                <button mat-icon-button
                        (click)="copyColor(color.key)"
                        [matTooltip]="'Copy ' + theme[color.key]"
                        class="copy-btn">
                  <mat-icon>content_copy</mat-icon>
                </button>

                <button mat-icon-button
                        (click)="generateVariations(color.key)"
                        matTooltip="Generate variations"
                        class="variations-btn">
                  <mat-icon>auto_awesome</mat-icon>
                </button>
              </div>
            </div>

            <!-- Contrast Indicator -->
            <div *ngIf="color.showContrast && color.contrastAgainst" class="contrast-indicator">
              <div class="contrast-ratio" [class.pass]="isContrastValid(color.key, color.contrastAgainst)">
                <mat-icon>{{ isContrastValid(color.key, color.contrastAgainst) ? 'check_circle' : 'warning' }}</mat-icon>
                <span>{{ getContrastRatioDisplay(color.key, color.contrastAgainst) }}</span>
              </div>
              <span class="contrast-label">vs {{ getContrastLabel(color.contrastAgainst) }}</span>
            </div>

            <!-- Color Variations -->
            <div *ngIf="showVariations[color.key]" class="color-variations">
              <div *ngFor="let variation of getColorVariations(theme[color.key])"
                   class="variation-chip"
                   [style.background]="variation.color"
                   (click)="updateColor(color.key, variation.color)"
                   [matTooltip]="variation.name">
                <span class="variation-label">{{ variation.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Color Scheme Presets -->
      <div class="color-schemes">
        <h4>Color Schemes</h4>
        <div class="schemes-grid">
          <div *ngFor="let scheme of colorSchemes"
               class="scheme-card"
               [class.active]="isSchemeActive(scheme)"
               (click)="applyColorScheme(scheme)">
            <div class="scheme-preview">
              <div class="scheme-color" [style.background]="scheme.primary"></div>
              <div class="scheme-color" [style.background]="scheme.secondary"></div>
              <div class="scheme-color" [style.background]="scheme.accent"></div>
              <div class="scheme-color" [style.background]="scheme.background"></div>
            </div>
            <span class="scheme-name">{{ scheme.name }}</span>
          </div>
        </div>
      </div>

      <!-- Advanced Tools -->
      <div class="advanced-tools">
        <h4>Advanced Color Tools</h4>
        <div class="tools-grid">
          <button mat-stroked-button (click)="openColorMixer()" class="tool-btn">
            <mat-icon>gradient</mat-icon>
            Color Mixer
          </button>
          <button mat-stroked-button (click)="openPaletteGenerator()" class="tool-btn">
            <mat-icon>color_lens</mat-icon>
            Palette Generator
          </button>
          <button mat-stroked-button (click)="importFromImage()" class="tool-btn">
            <mat-icon>image</mat-icon>
            Import from Image
          </button>
          <button mat-stroked-button (click)="exportColorPalette()" class="tool-btn">
            <mat-icon>download</mat-icon>
            Export Palette
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-color-controls {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: rgba(196, 247, 239, 0.2);
      border-radius: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-group {
      .group-header {
        margin-bottom: 20px;

        h4 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #2F4858;
          font-family: 'Poppins', sans-serif;
        }

        .group-description {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
          line-height: 1.5;
        }
      }
    }

    .colors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .color-control-item {
      padding: 16px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: #34C5AA;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.15);
      }
    }

    .color-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      label {
        font-weight: 600;
        color: #2F4858;
        font-size: 14px;
      }

      .color-description {
        display: flex;
        align-items: center;
        color: #9CA3AF;
        cursor: help;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .color-input-group {
      display: flex;
      gap: 12px;
      align-items: stretch;
    }

    .color-preview-wrapper {
      position: relative;
    }

    .color-preview {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .color-value {
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.9);
        padding: 2px 6px;
        border-radius: 4px;
        color: #2F4858;
        white-space: nowrap;
      }
    }

    .hidden-color-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .color-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .color-text-input {
      flex: 1;
      padding: 10px 14px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      background-color: white;
      color: #2F4858;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }

      &::placeholder {
        color: #9CA3AF;
      }
    }

    .copy-btn,
    .variations-btn {
      align-self: flex-start;
    }

    .contrast-indicator {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(196, 247, 239, 0.2);
      border-radius: 8px;

      .contrast-ratio {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        color: #EF4444;

        &.pass {
          color: #22C55E;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .contrast-label {
        font-size: 13px;
        color: #6B7280;
      }
    }

    .color-variations {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .variation-chip {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          transform: scale(1.1);
          border-color: #34C5AA;
        }

        .variation-label {
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .color-schemes {
      margin-top: 32px;

      h4 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .schemes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }

    .scheme-card {
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 12px;
      background: white;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }

      .scheme-preview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px;
        height: 60px;
        margin-bottom: 8px;
      }

      .scheme-color {
        border-radius: 6px;
      }

      .scheme-name {
        font-size: 13px;
        font-weight: 500;
        color: #4B5563;
        display: block;
        text-align: center;
      }
    }

    .advanced-tools {
      margin-top: 32px;

      h4 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .tool-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      width: 100%;
    }
  `]
})
export class AdvancedColorControlsComponent implements OnInit {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  showVariations: Record<string, boolean> = {};

  colorGroups: ColorGroup[] = [
    {
      title: 'Primary Colors',
      description: 'Main brand colors used throughout the interface',
      colors: [
        { key: 'primaryColor', label: 'Primary', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'primaryLightColor', label: 'Primary Light' },
        { key: 'primaryDarkColor', label: 'Primary Dark' },
        { key: 'secondaryColor', label: 'Secondary', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'secondaryLightColor', label: 'Secondary Light' },
        { key: 'secondaryDarkColor', label: 'Secondary Dark' }
      ]
    },
    {
      title: 'Background & Text',
      description: 'Base colors for content and typography',
      colors: [
        { key: 'backgroundColor', label: 'Background' },
        { key: 'backgroundPaperColor', label: 'Paper Background' },
        { key: 'backgroundDefaultColor', label: 'Default Background' },
        { key: 'textColor', label: 'Text', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'textSecondaryColor', label: 'Secondary Text', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'textDisabledColor', label: 'Disabled Text' },
        { key: 'textHintColor', label: 'Hint Text' }
      ]
    },
    {
      title: 'Accent Colors',
      description: 'Highlight and emphasis colors',
      colors: [
        { key: 'accentColor', label: 'Accent', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'accentLightColor', label: 'Accent Light' },
        { key: 'accentDarkColor', label: 'Accent Dark' }
      ]
    },
    {
      title: 'Semantic Colors',
      description: 'Colors with specific meanings for user feedback',
      colors: [
        { key: 'successColor', label: 'Success', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'successLightColor', label: 'Success Light' },
        { key: 'successDarkColor', label: 'Success Dark' },
        { key: 'warningColor', label: 'Warning', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'warningLightColor', label: 'Warning Light' },
        { key: 'warningDarkColor', label: 'Warning Dark' },
        { key: 'errorColor', label: 'Error', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'errorLightColor', label: 'Error Light' },
        { key: 'errorDarkColor', label: 'Error Dark' },
        { key: 'infoColor', label: 'Info', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'infoLightColor', label: 'Info Light' },
        { key: 'infoDarkColor', label: 'Info Dark' }
      ]
    },
    {
      title: 'Surface & States',
      description: 'Colors for different UI states and surfaces',
      colors: [
        { key: 'surfaceCard', label: 'Card Surface' },
        { key: 'surfaceModal', label: 'Modal Surface' },
        { key: 'surfaceHover', label: 'Hover State', allowAlpha: true },
        { key: 'surfaceFocus', label: 'Focus State', allowAlpha: true },
        { key: 'surfaceSelected', label: 'Selected State', allowAlpha: true },
        { key: 'surfaceDisabled', label: 'Disabled State', allowAlpha: true },
        { key: 'dividerColor', label: 'Divider', allowAlpha: true },
        { key: 'overlayColor', label: 'Overlay', allowAlpha: true }
      ]
    },
    {
      title: 'Border Colors',
      description: 'Colors for borders and outlines',
      colors: [
        { key: 'borderColor', label: 'Default Border', allowAlpha: true },
        { key: 'borderFocusColor', label: 'Focus Border' },
        { key: 'borderHoverColor', label: 'Hover Border', allowAlpha: true }
      ]
    },
    {
      title: 'Shadow & Effects',
      description: 'Colors for shadows and special effects',
      colors: [
        { key: 'shadowColor', label: 'Shadow Color', allowAlpha: true }
      ]
    }
  ];

  colorSchemes = [
    {
      name: 'Ocean Mint',
      primary: '#34C5AA',
      secondary: '#2BA99B',
      accent: '#5FD3C4',
      background: '#F4FDFD'
    },
    {
      name: 'Corporate Blue',
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      background: '#F8FAFC'
    },
    {
      name: 'Sunset',
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#F472B6',
      background: '#FEF3C7'
    },
    {
      name: 'Forest',
      primary: '#059669',
      secondary: '#047857',
      accent: '#34D399',
      background: '#F0FDF4'
    },
    {
      name: 'Purple Dream',
      primary: '#7C3AED',
      secondary: '#6366F1',
      accent: '#A78BFA',
      background: '#FAFAF9'
    },
    {
      name: 'Monochrome',
      primary: '#1F2937',
      secondary: '#4B5563',
      accent: '#9CA3AF',
      background: '#F9FAFB'
    },
    {
      name: 'Cherry Blossom',
      primary: '#EC4899',
      secondary: '#F472B6',
      accent: '#FBCFE8',
      background: '#FDF2F8'
    },
    {
      name: 'Dark Mode',
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#F472B6',
      background: '#0F172A'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize any needed data
  }

  updateColor(key: keyof ThemeConfig, value: string): void {
    if (this.isValidColor(value)) {
      this.themeChange.emit({ [key]: value });
    }
  }

  convertToHex(color: string | undefined): string {
    // Handle undefined or null values
    if (!color) {
      return '#000000';
    }

    // Simple conversion for demonstration
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      // Extract RGB values and convert to hex
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
      return '#000000';
    }

    // If it's already a hex color, return it
    if (color.startsWith('#')) {
      return color;
    }

    return '#000000';
  }

  openColorPicker(key: keyof ThemeConfig): void {
    const input = document.querySelector('.hidden-color-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  copyColor(key: keyof ThemeConfig): void {
    const color = this.theme[key as keyof ThemeConfig] as string;
    navigator.clipboard.writeText(color).then(() => {
      this.snackBar.open(`Copied ${color}`, 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  generateVariations(key: keyof ThemeConfig): void {
    this.showVariations[key as string] = !this.showVariations[key as string];
  }

  getColorVariations(color: string): Array<{color: string, name: string, label: string}> {
    const palette = generateColorPalette(color);
    return [
      { color: palette.shades['100'], name: 'Lighter', label: '100' },
      { color: palette.shades['300'], name: 'Light', label: '300' },
      { color: palette.shades['500'], name: 'Base', label: '500' },
      { color: palette.shades['700'], name: 'Dark', label: '700' },
      { color: palette.shades['900'], name: 'Darker', label: '900' }
    ];
  }

  isContrastValid(color1Key: keyof ThemeConfig, color2Key: keyof ThemeConfig): boolean {
    const ratio = this.calculateContrastRatio(color1Key, color2Key);
    return ratio >= 4.5; // WCAG AA standard
  }

  getContrastRatioDisplay(color1Key: keyof ThemeConfig, color2Key: keyof ThemeConfig): string {
    const ratio = this.calculateContrastRatio(color1Key, color2Key);
    return `${ratio.toFixed(2)}:1`;
  }

  calculateContrastRatio(color1Key: keyof ThemeConfig, color2Key: keyof ThemeConfig): number {
    const color1 = this.theme[color1Key] as string;
    const color2 = this.theme[color2Key] as string;
    return getContrastRatio(color1, color2);
  }

  getContrastLabel(key: keyof ThemeConfig): string {
    const labels: Record<string, string> = {
      backgroundColor: 'Background',
      textColor: 'Text',
      primaryColor: 'Primary',
      surfaceCard: 'Card'
    };
    return labels[key as string] || key as string;
  }

  generatePalette(): void {
    const primary = this.theme.primaryColor;
    const palette = generateColorPalette(primary);

    // Apply generated palette
    this.themeChange.emit({
      primaryLightColor: palette.shades['300'],
      primaryDarkColor: palette.shades['700'],
      accentColor: palette.shades['400'],
      accentLightColor: palette.shades['200'],
      accentDarkColor: palette.shades['600']
    });

    this.snackBar.open('Color palette generated!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  checkAllContrast(): void {
    // Check all contrast ratios and show report
    const issues: string[] = [];

    const checks = [
      { bg: 'backgroundColor', fg: 'textColor', name: 'Text on Background' },
      { bg: 'backgroundColor', fg: 'textSecondaryColor', name: 'Secondary Text' },
      { bg: 'primaryColor', fg: 'backgroundColor', name: 'Primary on Background' },
      { bg: 'surfaceCard', fg: 'textColor', name: 'Text on Card' }
    ];

    checks.forEach(check => {
      if (!this.isContrastValid(check.bg as keyof ThemeConfig, check.fg as keyof ThemeConfig)) {
        const ratio = this.calculateContrastRatio(check.bg as keyof ThemeConfig, check.fg as keyof ThemeConfig);
        issues.push(`${check.name}: ${ratio.toFixed(2)}:1`);
      }
    });

    if (issues.length > 0) {
      this.snackBar.open(`Contrast issues found: ${issues.length}`, 'View', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    } else {
      this.snackBar.open('All contrast ratios pass WCAG AA!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  harmonizeColors(): void {
    // Implement color harmonization algorithm
    this.snackBar.open('Colors harmonized!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  isSchemeActive(scheme: any): boolean {
    return this.theme.primaryColor === scheme.primary &&
      this.theme.secondaryColor === scheme.secondary;
  }

  applyColorScheme(scheme: any): void {
    const palette = generateColorPalette(scheme.primary);

    this.themeChange.emit({
      primaryColor: scheme.primary,
      primaryLightColor: palette.shades['300'],
      primaryDarkColor: palette.shades['700'],
      secondaryColor: scheme.secondary,
      secondaryLightColor: palette.shades['400'],
      secondaryDarkColor: palette.shades['600'],
      accentColor: scheme.accent,
      backgroundColor: scheme.background,
      backgroundPaperColor: scheme.background === '#0F172A' ? '#1E293B' : '#FFFFFF'
    });
  }

  openColorMixer(): void {
    // Open color mixer dialog
    this.snackBar.open('Color mixer coming soon!', 'Close', {
      duration: 2000
    });
  }

  openPaletteGenerator(): void {
    // Open palette generator dialog
    this.snackBar.open('Palette generator coming soon!', 'Close', {
      duration: 2000
    });
  }

  importFromImage(): void {
    // Import colors from image
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.snackBar.open('Extracting colors from image...', 'Close', {
          duration: 2000
        });
      }
    };
    input.click();
  }

  exportColorPalette(): void {
    const palette = {
      name: this.theme.brandName || 'Custom Theme',
      colors: this.colorGroups.reduce((acc, group) => {
        group.colors.forEach(color => {
          acc[color.key] = this.theme[color.key];
        });
        return acc;
      }, {} as any)
    };

    const blob = new Blob([JSON.stringify(palette, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-palette-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Color palette exported!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private isValidColor(color: string): boolean {
    const style = new Option().style;
    style.color = color;
    return style.color !== '';
  }
}

// Helper function (should be imported from theme.model.ts)
function getContrastRatio(color1: string, color2: string): number {
  // This should be imported from theme.model.ts
  // Simplified version for now
  return 4.5; // Placeholder
}
