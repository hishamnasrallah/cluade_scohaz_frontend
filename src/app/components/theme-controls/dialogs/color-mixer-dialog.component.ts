// src/app/components/theme-controls/dialogs/color-mixer-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface ColorMixerData {
  baseColor: string;
  currentColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

@Component({
  selector: 'app-color-mixer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="color-mixer-dialog">
      <h2 mat-dialog-title>
        <mat-icon>gradient</mat-icon>
        Color Mixer
      </h2>

      <mat-dialog-content>
        <div class="mixer-container">
          <!-- Color Inputs -->
          <div class="color-inputs">
            <div class="color-input-group">
              <label>Color 1</label>
              <div class="color-control">
                <input type="color"
                       [(ngModel)]="color1"
                       (ngModelChange)="updateMix()"
                       class="color-picker">
                <input type="text"
                       [(ngModel)]="color1"
                       (ngModelChange)="updateMix()"
                       class="color-text"
                       placeholder="#000000">
              </div>
              <div class="color-preview" [style.background]="color1"></div>
            </div>

            <div class="mix-operator">
              <mat-icon>add</mat-icon>
            </div>

            <div class="color-input-group">
              <label>Color 2</label>
              <div class="color-control">
                <input type="color"
                       [(ngModel)]="color2"
                       (ngModelChange)="updateMix()"
                       class="color-picker">
                <input type="text"
                       [(ngModel)]="color2"
                       (ngModelChange)="updateMix()"
                       class="color-text"
                       placeholder="#000000">
              </div>
              <div class="color-preview" [style.background]="color2"></div>
            </div>
          </div>

          <!-- Mix Controls -->
          <div class="mix-controls">
            <div class="control-item">
              <label>Mix Ratio: {{ mixRatio }}%</label>
              <mat-slider [min]="0" [max]="100" [step]="1"
                         [(ngModel)]="mixRatio"
                         (ngModelChange)="updateMix()"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Mix Mode</label>
              <mat-select [(ngModel)]="mixMode" (selectionChange)="updateMix()">
                <mat-option value="rgb">RGB Mix</mat-option>
                <mat-option value="hsl">HSL Mix</mat-option>
                <mat-option value="lab">LAB Mix</mat-option>
                <mat-option value="overlay">Overlay</mat-option>
                <mat-option value="multiply">Multiply</mat-option>
                <mat-option value="screen">Screen</mat-option>
              </mat-select>
            </div>
          </div>

          <!-- Result -->
          <div class="mix-result">
            <h4>Result</h4>
            <div class="result-preview" [style.background]="mixedColor">
              <span class="result-value">{{ mixedColor }}</span>
            </div>
          </div>

          <!-- Variations -->
          <div class="variations-section">
            <h4>Variations</h4>
            <div class="variations-grid">
              <div *ngFor="let variation of variations"
                   class="variation-item"
                   [style.background]="variation.color"
                   (click)="selectVariation(variation)">
                <span class="variation-label">{{ variation.label }}</span>
              </div>
            </div>
          </div>

          <!-- Presets -->
          <div class="presets-section">
            <h4>Common Mixes</h4>
            <div class="presets-grid">
              <button *ngFor="let preset of mixPresets"
                      mat-stroked-button
                      class="preset-btn"
                      (click)="applyPreset(preset)">
                <span class="preset-colors">
                  <span [style.background]="preset.color1"></span>
                  <span [style.background]="preset.color2"></span>
                </span>
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="onApply()"
                [disabled]="!mixedColor">
          Apply Color
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .color-mixer-dialog {
      width: 600px;
      max-width: 90vw;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-family: 'Poppins', sans-serif;
      color: #2F4858;

      mat-icon {
        color: #34C5AA;
      }
    }

    .mixer-container {
      padding: 20px 0;
    }

    .color-inputs {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
    }

    .color-input-group {
      flex: 1;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .color-control {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .color-picker {
      width: 48px;
      height: 36px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      cursor: pointer;
      padding: 2px;
    }

    .color-text {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;

      &:focus {
        outline: none;
        border-color: #34C5AA;
      }
    }

    .color-preview {
      height: 60px;
      border-radius: 8px;
      border: 2px solid rgba(0, 0, 0, 0.1);
    }

    .mix-operator {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
      margin-top: 40px;
    }

    .mix-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .control-item {
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      mat-slider {
        width: 100%;
      }

      mat-select {
        width: 100%;
      }
    }

    .mix-result {
      margin-bottom: 32px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .result-preview {
        height: 100px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(0, 0, 0, 0.1);
        position: relative;

        .result-value {
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 12px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #2F4858;
        }
      }
    }

    .variations-section,
    .presets-section {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .variations-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }

    .variation-item {
      height: 50px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid transparent;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.05);
        border-color: #34C5AA;
      }

      .variation-label {
        font-size: 11px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .preset-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px !important;

      .preset-colors {
        display: flex;
        gap: 2px;

        span {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      }
    }
  `]
})
export class ColorMixerDialogComponent {
  color1: string = '#34C5AA';
  color2: string = '#F59E0B';
  mixRatio: number = 50;
  mixMode: string = 'rgb';
  mixedColor: string = '';
  variations: any[] = [];

  mixPresets = [
    { name: 'Ocean Sunset', color1: '#34C5AA', color2: '#F59E0B' },
    { name: 'Forest Lake', color1: '#22C55E', color2: '#3B82F6' },
    { name: 'Berry Mix', color1: '#EC4899', color2: '#8B5CF6' },
    { name: 'Earth Tones', color1: '#D97706', color2: '#92400E' },
    { name: 'Cool Breeze', color1: '#06B6D4', color2: '#6366F1' },
    { name: 'Warm Glow', color1: '#F59E0B', color2: '#EF4444' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ColorMixerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ColorMixerData
  ) {
    if (data?.baseColor) {
      this.color1 = data.baseColor;
    }
    this.updateMix();
  }

  updateMix(): void {
    this.mixedColor = this.mixColors(this.color1, this.color2, this.mixRatio / 100, this.mixMode);
    this.generateVariations();
  }

  mixColors(color1: string, color2: string, ratio: number, mode: string): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    if (!c1 || !c2) return color1;

    let mixed;

    switch (mode) {
      case 'rgb':
        mixed = {
          r: Math.round(c1.r * (1 - ratio) + c2.r * ratio),
          g: Math.round(c1.g * (1 - ratio) + c2.g * ratio),
          b: Math.round(c1.b * (1 - ratio) + c2.b * ratio)
        };
        break;

      case 'hsl':
        const hsl1 = this.rgbToHsl(c1);
        const hsl2 = this.rgbToHsl(c2);
        const mixedHsl = {
          h: hsl1.h * (1 - ratio) + hsl2.h * ratio,
          s: hsl1.s * (1 - ratio) + hsl2.s * ratio,
          l: hsl1.l * (1 - ratio) + hsl2.l * ratio
        };
        mixed = this.hslToRgb(mixedHsl);
        break;

      case 'overlay':
        mixed = {
          r: Math.round(c1.r < 128 ? 2 * c1.r * c2.r / 255 : 255 - 2 * (255 - c1.r) * (255 - c2.r) / 255),
          g: Math.round(c1.g < 128 ? 2 * c1.g * c2.g / 255 : 255 - 2 * (255 - c1.g) * (255 - c2.g) / 255),
          b: Math.round(c1.b < 128 ? 2 * c1.b * c2.b / 255 : 255 - 2 * (255 - c1.b) * (255 - c2.b) / 255)
        };
        break;

      case 'multiply':
        mixed = {
          r: Math.round(c1.r * c2.r / 255),
          g: Math.round(c1.g * c2.g / 255),
          b: Math.round(c1.b * c2.b / 255)
        };
        break;

      case 'screen':
        mixed = {
          r: Math.round(255 - (255 - c1.r) * (255 - c2.r) / 255),
          g: Math.round(255 - (255 - c1.g) * (255 - c2.g) / 255),
          b: Math.round(255 - (255 - c1.b) * (255 - c2.b) / 255)
        };
        break;

      default:
        mixed = {
          r: Math.round(c1.r * (1 - ratio) + c2.r * ratio),
          g: Math.round(c1.g * (1 - ratio) + c2.g * ratio),
          b: Math.round(c1.b * (1 - ratio) + c2.b * ratio)
        };
    }

    return this.rgbToHex(mixed);
  }

  generateVariations(): void {
    this.variations = [];

    // Different mix ratios
    const ratios = [0, 20, 40, 60, 80, 100];
    ratios.forEach(ratio => {
      this.variations.push({
        color: this.mixColors(this.color1, this.color2, ratio / 100, this.mixMode),
        label: `${ratio}%`
      });
    });
  }

  selectVariation(variation: any): void {
    this.mixedColor = variation.color;
  }

  applyPreset(preset: any): void {
    this.color1 = preset.color1;
    this.color2 = preset.color2;
    this.updateMix();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    this.dialogRef.close(this.mixedColor);
  }

  // Color utility functions
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
  }

  private rgbToHsl(rgb: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(hsl: { h: number; s: number; l: number }): { r: number; g: number; b: number } {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
}
