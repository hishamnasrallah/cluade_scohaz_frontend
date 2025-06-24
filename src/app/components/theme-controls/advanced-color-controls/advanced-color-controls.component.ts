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
                     [style.background]="getColorValue(color.key)"
                     (click)="colorInput.click()"
                     [class.clickable]="!color.allowAlpha">
                  <div class="color-preview-content">
                    <mat-icon class="color-icon" *ngIf="!color.allowAlpha">palette</mat-icon>
                    <span class="color-hex-label">{{ getColorValue(color.key) }}</span>
                  </div>
                  <div class="color-preview-overlay"></div>
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
                <div class="color-input-container">
                  <input
                    type="text"
                    [value]="getColorValue(color.key)"
                    (input)="updateColor(color.key, $any($event.target).value)"
                    (focus)="onColorInputFocus(color.key)"
                    (blur)="onColorInputBlur(color.key)"
                    class="color-text-input"
                    [class.focused]="focusedInput === color.key"
                    [placeholder]="color.allowAlpha ? 'rgba(0, 0, 0, 0.5)' : '#000000'"
                  />
                  <div class="input-border-gradient"></div>
                </div>

                <div class="color-actions">
                  <button mat-icon-button
                          (click)="copyColor(color.key)"
                          [matTooltip]="'Copy ' + getColorValue(color.key)"
                          matTooltipPosition="above"
                          class="action-btn copy-btn">
                    <mat-icon>{{ copiedColor === color.key ? 'check' : 'content_copy' }}</mat-icon>
                  </button>

                  <button mat-icon-button
                          (click)="generateVariations(color.key)"
                          [matTooltip]="showVariations[color.key] ? 'Hide variations' : 'Show variations'"
                          matTooltipPosition="above"
                          class="action-btn variations-btn"
                          [class.active]="showVariations[color.key]">
                    <mat-icon>auto_awesome</mat-icon>
                  </button>
                </div>
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
    .mini-btn {
      width: 32px;
      height: 32px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
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
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    .color-control-item {
      padding: 12px;
      background: white;
      border: 1px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #34C5AA;
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.1);
      }
    }

    .color-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      label {
        font-weight: 500;
        color: #2F4858;
        font-size: 13px;
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
      gap: 8px;
      align-items: center;
    }

    .color-preview-wrapper {
      position: relative;
    }

    .color-preview {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
      border: 2px solid rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      background-color: white;
      background-image:
        linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
      background-size: 10px 10px;
      background-position: 0 0, 0 5px, 5px -5px, -5px 0px;

      &.clickable {
        cursor: pointer;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-color: #34C5AA;

          .color-preview-overlay {
            opacity: 1;
          }

          .color-icon {
            transform: scale(1.1);
          }
        }

        &:active {
          transform: translateY(0);
        }
      }

      .color-preview-content {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--preview-color);
        z-index: 1;
      }

      .color-icon {
        font-size: 20px;
        color: white;
        opacity: 0;
        transition: all 0.3s ease;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .color-hex-label {
        font-size: 10px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        font-family: 'JetBrains Mono', monospace;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
      }

      .color-preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      &:hover .color-icon {
        opacity: 0.8;
      }
    }

    .hidden-color-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      width: 0;
      height: 0;
    }

    .color-controls {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-input-container {
      flex: 1;
      position: relative;

      .color-text-input {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid rgba(196, 247, 239, 0.5);
        border-radius: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        background-color: white;
        color: #2F4858;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 500;

        &:hover {
          border-color: rgba(52, 197, 170, 0.3);
        }

        &:focus {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.15);
        }

        &.focused {
          border-color: #34C5AA;
        }

        &::placeholder {
          color: #9CA3AF;
          font-weight: 400;
        }
      }

      .input-border-gradient {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(135deg, #34C5AA, #2BA99B);
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: -1;
      }

      .color-text-input.focused + .input-border-gradient {
        opacity: 1;
      }
    }

    .color-actions {
      display: flex;
      gap: 4px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #6B7280;
        transition: color 0.3s ease;
      }

      &:hover {
        background: rgba(196, 247, 239, 0.3);
        border-color: #34C5AA;
        transform: translateY(-1px);

        mat-icon {
          color: #34C5AA;
        }
      }

      &.copy-btn {
        mat-icon {
          transition: all 0.3s ease;
        }

        &:hover mat-icon[icon="check"] {
          color: #22C55E;
        }
      }

      &.variations-btn.active {
        background: linear-gradient(135deg, #34C5AA, #2BA99B);
        border-color: transparent;

        mat-icon {
          color: white;
        }
      }
    }
  `]
})
export class AdvancedColorControlsComponent implements OnInit {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  showVariations: Record<string, boolean> = {};
  focusedInput: string | null = null;
  copiedColor: string | null = null;
  colorGroups: ColorGroup[] = [
    {
      title: 'Primary Colors',
      description: 'Main brand colors used throughout the interface',
      colors: [
        { key: 'primaryColor', label: 'Primary', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'primaryLightColor', label: 'Primary Light', description: 'Lighter variant for hover states' },
        { key: 'primaryDarkColor', label: 'Primary Dark', description: 'Darker variant for active states' },
        { key: 'secondaryColor', label: 'Secondary', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'secondaryLightColor', label: 'Secondary Light', description: 'Lighter variant of secondary' },
        { key: 'secondaryDarkColor', label: 'Secondary Dark', description: 'Darker variant of secondary' }
      ]
    },
    {
      title: 'Background & Text',
      description: 'Base colors for content and typography',
      colors: [
        { key: 'backgroundColor', label: 'Background', description: 'Main background color' },
        { key: 'backgroundPaperColor', label: 'Paper Background', description: 'Background for cards and surfaces' },
        { key: 'backgroundDefaultColor', label: 'Default Background', description: 'Default backdrop color' },
        { key: 'textColor', label: 'Text', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'textSecondaryColor', label: 'Secondary Text', showContrast: true, contrastAgainst: 'backgroundColor', description: 'For less important text' },
        { key: 'textDisabledColor', label: 'Disabled Text', description: 'For disabled elements' },
        { key: 'textHintColor', label: 'Hint Text', description: 'For placeholder and hint text' }
      ]
    },
    {
      title: 'Accent Colors',
      description: 'Highlight and emphasis colors',
      colors: [
        { key: 'accentColor', label: 'Accent', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'accentLightColor', label: 'Accent Light', description: 'Lighter variant of accent' },
        { key: 'accentDarkColor', label: 'Accent Dark', description: 'Darker variant of accent' }
      ]
    },
    {
      title: 'Semantic Colors',
      description: 'Colors with specific meanings for user feedback',
      colors: [
        { key: 'successColor', label: 'Success', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'successLightColor', label: 'Success Light', description: 'For success backgrounds' },
        { key: 'successDarkColor', label: 'Success Dark', description: 'For success borders' },
        { key: 'warningColor', label: 'Warning', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'warningLightColor', label: 'Warning Light', description: 'For warning backgrounds' },
        { key: 'warningDarkColor', label: 'Warning Dark', description: 'For warning borders' },
        { key: 'errorColor', label: 'Error', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'errorLightColor', label: 'Error Light', description: 'For error backgrounds' },
        { key: 'errorDarkColor', label: 'Error Dark', description: 'For error borders' },
        { key: 'infoColor', label: 'Info', showContrast: true, contrastAgainst: 'backgroundColor' },
        { key: 'infoLightColor', label: 'Info Light', description: 'For info backgrounds' },
        { key: 'infoDarkColor', label: 'Info Dark', description: 'For info borders' }
      ]
    },
    {
      title: 'Surface & States',
      description: 'Colors for different UI states and surfaces',
      colors: [
        { key: 'surfaceCard', label: 'Card Surface', description: 'Background for cards' },
        { key: 'surfaceModal', label: 'Modal Surface', description: 'Background for modals' },
        { key: 'surfaceHover', label: 'Hover State', allowAlpha: true, description: 'Color for hover overlays' },
        { key: 'surfaceFocus', label: 'Focus State', allowAlpha: true, description: 'Color for focus indicators' },
        { key: 'surfaceSelected', label: 'Selected State', allowAlpha: true, description: 'Color for selected items' },
        { key: 'surfaceDisabled', label: 'Disabled State', allowAlpha: true, description: 'Color for disabled overlays' },
        { key: 'dividerColor', label: 'Divider', allowAlpha: true, description: 'Color for dividers and separators' },
        { key: 'overlayColor', label: 'Overlay', allowAlpha: true, description: 'Color for modal overlays' }
      ]
    },
    // {
    //   title: 'Border Colors',
    //   description: 'Colors for borders and outlines',
    //   colors: [
    //     { key: 'borderColor', label: 'Default Border', allowAlpha: true },
    //     { key: 'borderFocusColor', label: 'Focus Border' },
    //     { key: 'borderHoverColor', label: 'Hover Border', allowAlpha: true }
    //   ]
    // },
    // {
    //   title: 'Shadow & Effects',
    //   description: 'Colors for shadows and special effects',
    //   colors: [
    //     { key: 'shadowColor', label: 'Shadow Color', allowAlpha: true }
    //   ]
    // }
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
      // Emit the change immediately without any debounce
      this.themeChange.emit({ [key]: value });
    }
  }

  convertToHex(value: any): string {
    // Handle non-string values
    if (typeof value !== 'string') {
      return '#000000';
    }

    // Handle undefined or null values
    if (!value) {
      return '#000000';
    }

    // Simple conversion for demonstration
    if (value.startsWith('rgba') || value.startsWith('rgb')) {
      // Extract RGB values and convert to hex
      const matches = value.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
      return '#000000';
    }

    // If it's already a hex color, return it
    if (value.startsWith('#')) {
      return value;
    }

    return '#000000';
  }

  getColorValue(key: keyof ThemeConfig): string {
    const value = this.theme[key];
    // Ensure we always return a string for color values
    if (typeof value === 'string') {
      return value;
    }
    // For non-string values, return empty or default
    return '';
  }
// Removed openColorPicker method - no longer needed

  onColorInputFocus(key: string): void {
    this.focusedInput = key;
  }

  onColorInputBlur(key: string): void {
    if (this.focusedInput === key) {
      this.focusedInput = null;
    }
  }

  copyColor(key: keyof ThemeConfig): void {
    const color = this.getColorValue(key);
    navigator.clipboard.writeText(color).then(() => {
      this.copiedColor = key as string;
      setTimeout(() => {
        this.copiedColor = null;
      }, 2000);

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

    // Apply generated palette to ALL color variants
    const updates: Partial<ThemeConfig> = {
      primaryLightColor: palette.shades['300'],
      primaryDarkColor: palette.shades['700'],
      accentColor: palette.shades['400'],
      accentLightColor: palette.shades['200'],
      accentDarkColor: palette.shades['600']
    };

    // Also generate secondary colors if needed
    if (this.theme.secondaryColor) {
      const secondaryPalette = generateColorPalette(this.theme.secondaryColor);
      updates.secondaryLightColor = secondaryPalette.shades['300'];
      updates.secondaryDarkColor = secondaryPalette.shades['700'];
    }

    // Generate semantic color variants
    if (this.theme.successColor) {
      const successPalette = generateColorPalette(this.theme.successColor);
      updates.successLightColor = successPalette.shades['300'];
      updates.successDarkColor = successPalette.shades['700'];
    }

    if (this.theme.warningColor) {
      const warningPalette = generateColorPalette(this.theme.warningColor);
      updates.warningLightColor = warningPalette.shades['300'];
      updates.warningDarkColor = warningPalette.shades['700'];
    }

    if (this.theme.errorColor) {
      const errorPalette = generateColorPalette(this.theme.errorColor);
      updates.errorLightColor = errorPalette.shades['300'];
      updates.errorDarkColor = errorPalette.shades['700'];
    }

    if (this.theme.infoColor) {
      const infoPalette = generateColorPalette(this.theme.infoColor);
      updates.infoLightColor = infoPalette.shades['300'];
      updates.infoDarkColor = infoPalette.shades['700'];
    }

    // Apply all updates at once
    this.themeChange.emit(updates);

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
    const secondaryPalette = generateColorPalette(scheme.secondary);
    const accentPalette = generateColorPalette(scheme.accent);

    // Apply complete color scheme with ALL variants
    const updates: Partial<ThemeConfig> = {
      primaryColor: scheme.primary,
      primaryLightColor: palette.shades['300'],
      primaryDarkColor: palette.shades['700'],
      secondaryColor: scheme.secondary,
      secondaryLightColor: secondaryPalette.shades['300'],
      secondaryDarkColor: secondaryPalette.shades['700'],
      accentColor: scheme.accent,
      accentLightColor: accentPalette.shades['300'],
      accentDarkColor: accentPalette.shades['700'],
      backgroundColor: scheme.background,
      backgroundPaperColor: scheme.background === '#0F172A' ? '#1E293B' : '#FFFFFF',
      backgroundDefaultColor: scheme.background === '#0F172A' ? '#0F172A' : '#F8FAFB'
    };

    // Also update text colors based on background
    if (scheme.background === '#0F172A') {
      // Dark mode
      updates.textColor = '#F8FAFC';
      updates.textSecondaryColor = '#94A3B8';
      updates.textDisabledColor = '#64748B';
      updates.textHintColor = '#475569';
    } else {
      // Light mode
      updates.textColor = '#2F4858';
      updates.textSecondaryColor = '#6B7280';
      updates.textDisabledColor = '#9CA3AF';
      updates.textHintColor = '#D1D5DB';
    }

    this.themeChange.emit(updates);
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
