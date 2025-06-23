// src/app/components/theme-controls/dialogs/palette-generator-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PaletteGeneratorData {
  baseColor: string;
}

export interface GeneratedPalette {
  name: string;
  colors: string[];
  type: string;
}

@Component({
  selector: 'app-palette-generator-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <div class="palette-generator-dialog">
      <h2 mat-dialog-title>
        <mat-icon>color_lens</mat-icon>
        Palette Generator
      </h2>

      <mat-dialog-content>
        <mat-tab-group>
          <!-- Harmony Tab -->
          <mat-tab label="Color Harmony">
            <div class="tab-content">
              <div class="base-color-section">
                <h4>Base Color</h4>
                <div class="color-input-wrapper">
                  <input type="color"
                         [(ngModel)]="baseColor"
                         (ngModelChange)="generateHarmonyPalettes()"
                         class="color-picker">
                  <input type="text"
                         [(ngModel)]="baseColor"
                         (ngModelChange)="generateHarmonyPalettes()"
                         class="color-text"
                         placeholder="#34C5AA">
                  <div class="color-preview" [style.background]="baseColor"></div>
                </div>
              </div>

              <div class="harmony-palettes">
                <div *ngFor="let palette of harmonyPalettes" class="palette-card">
                  <h5>{{ palette.name }}</h5>
                  <div class="palette-colors">
                    <div *ngFor="let color of palette.colors"
                         class="color-swatch"
                         [style.background]="color"
                         [matTooltip]="color"
                         (click)="copyColor(color)">
                    </div>
                  </div>
                  <button mat-stroked-button
                          class="apply-btn"
                          (click)="applyPalette(palette)">
                    Apply Palette
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Shades Tab -->
          <mat-tab label="Shades & Tints">
            <div class="tab-content">
              <div class="shades-controls">
                <div class="control-item">
                  <label>Number of Shades</label>
                  <mat-select [(ngModel)]="shadeCount" (selectionChange)="generateShades()">
                    <mat-option [value]="5">5 Shades</mat-option>
                    <mat-option [value]="7">7 Shades</mat-option>
                    <mat-option [value]="9">9 Shades</mat-option>
                    <mat-option [value]="11">11 Shades</mat-option>
                  </mat-select>
                </div>
              </div>

              <div class="shades-preview">
                <h4>Generated Shades</h4>
                <div class="shades-grid">
                  <div *ngFor="let shade of shades; let i = index"
                       class="shade-item">
                    <div class="shade-color"
                         [style.background]="shade"
                         (click)="copyColor(shade)"></div>
                    <span class="shade-label">{{ getShadeLabel(i) }}</span>
                    <span class="shade-value">{{ shade }}</span>
                  </div>
                </div>
              </div>

              <div class="tints-preview">
                <h4>Generated Tints</h4>
                <div class="shades-grid">
                  <div *ngFor="let tint of tints; let i = index"
                       class="shade-item">
                    <div class="shade-color"
                         [style.background]="tint"
                         (click)="copyColor(tint)"></div>
                    <span class="shade-label">{{ getTintLabel(i) }}</span>
                    <span class="shade-value">{{ tint }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Theme Tab -->
          <mat-tab label="Theme Palettes">
            <div class="tab-content">
              <div class="theme-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Theme Style</mat-label>
                  <mat-select [(ngModel)]="themeStyle" (selectionChange)="generateThemePalette()">
                    <mat-option value="professional">Professional</mat-option>
                    <mat-option value="vibrant">Vibrant</mat-option>
                    <mat-option value="pastel">Pastel</mat-option>
                    <mat-option value="dark">Dark Mode</mat-option>
                    <mat-option value="earth">Earth Tones</mat-option>
                    <mat-option value="ocean">Ocean Theme</mat-option>
                    <mat-option value="sunset">Sunset</mat-option>
                    <mat-option value="forest">Forest</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="theme-palette-preview">
                <div class="theme-colors">
                  <div class="theme-color-item" *ngFor="let item of themePalette">
                    <div class="color-box" [style.background]="item.color"></div>
                    <div class="color-info">
                      <span class="color-name">{{ item.name }}</span>
                      <span class="color-hex">{{ item.color }}</span>
                    </div>
                  </div>
                </div>

                <div class="theme-preview">
                  <h5>Preview</h5>
                  <div class="preview-card"
                       [style.background]="themePalette[4]?.color"
                       [style.color]="themePalette[2]?.color">
                    <div class="preview-header"
                         [style.background]="themePalette[0]?.color"
                         [style.color]="'white'">
                      Header Example
                    </div>
                    <div class="preview-content">
                      <h6 [style.color]="themePalette[2]?.color">Content Title</h6>
                      <p [style.color]="themePalette[3]?.color">
                        This is sample text showing how the theme colors work together.
                      </p>
                      <button class="preview-btn"
                              [style.background]="themePalette[1]?.color"
                              [style.color]="'white'">
                        Action Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- AI Suggestions Tab -->
          <mat-tab label="Smart Suggestions">
            <div class="tab-content">
              <div class="ai-controls">
                <mat-form-field appearance="outline">
                  <mat-label>Palette Mood</mat-label>
                  <mat-select [(ngModel)]="paletteMood" (selectionChange)="generateAIPalette()">
                    <mat-option value="energetic">Energetic & Bold</mat-option>
                    <mat-option value="calm">Calm & Serene</mat-option>
                    <mat-option value="professional">Professional & Trustworthy</mat-option>
                    <mat-option value="playful">Playful & Fun</mat-option>
                    <mat-option value="elegant">Elegant & Sophisticated</mat-option>
                    <mat-option value="natural">Natural & Organic</mat-option>
                    <mat-option value="tech">Tech & Modern</mat-option>
                    <mat-option value="vintage">Vintage & Classic</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-checkbox [(ngModel)]="includeNeutrals"
                              (change)="generateAIPalette()">
                  Include Neutral Colors
                </mat-checkbox>
              </div>

              <div class="ai-suggestions">
                <div *ngFor="let suggestion of aiSuggestions" class="suggestion-card">
                  <h5>{{ suggestion.name }}</h5>
                  <p class="suggestion-desc">{{ suggestion.description }}</p>
                  <div class="suggestion-colors">
                    <div *ngFor="let color of suggestion.colors"
                         class="color-chip"
                         [style.background]="color.value"
                         [matTooltip]="color.role">
                      <span class="color-role">{{ color.role }}</span>
                    </div>
                  </div>
                  <button mat-raised-button
                          color="primary"
                          (click)="applySuggestion(suggestion)">
                    Use This Palette
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="onApply()"
                [disabled]="!selectedPalette">
          Apply Selected Palette
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .palette-generator-dialog {
      width: 700px;
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

    .tab-content {
      padding: 24px 0;
      min-height: 400px;
    }

    .base-color-section {
      margin-bottom: 32px;

      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .color-input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 300px;
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
      width: 60px;
      height: 36px;
      border-radius: 8px;
      border: 2px solid rgba(0, 0, 0, 0.1);
    }

    .harmony-palettes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .palette-card {
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.15);
        border-color: #34C5AA;
      }

      h5 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: #2F4858;
      }

      .palette-colors {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
      }

      .color-swatch {
        flex: 1;
        height: 40px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;

        &:hover {
          transform: scale(1.05);
          border-color: #34C5AA;
        }
      }

      .apply-btn {
        width: 100%;
      }
    }

    .shades-controls {
      margin-bottom: 24px;

      mat-form-field {
        width: 200px;
      }
    }

    .shades-preview,
    .tints-preview {
      margin-bottom: 32px;

      h4 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .shades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .shade-item {
      text-align: center;

      .shade-color {
        height: 60px;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;

        &:hover {
          transform: scale(1.05);
          border-color: #34C5AA;
        }
      }

      .shade-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #4B5563;
      }

      .shade-value {
        display: block;
        font-size: 11px;
        color: #6B7280;
        font-family: 'JetBrains Mono', monospace;
      }
    }

    .theme-controls {
      margin-bottom: 24px;

      mat-form-field {
        width: 100%;
        max-width: 300px;
      }
    }

    .theme-palette-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    .theme-colors {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .theme-color-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .color-box {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        border: 2px solid rgba(0, 0, 0, 0.1);
      }

      .color-info {
        display: flex;
        flex-direction: column;

        .color-name {
          font-weight: 600;
          color: #2F4858;
          font-size: 14px;
        }

        .color-hex {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #6B7280;
        }
      }
    }

    .theme-preview {
      h5 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .preview-card {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .preview-header {
          padding: 16px;
          font-weight: 600;
        }

        .preview-content {
          padding: 20px;

          h6 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
          }

          p {
            margin: 0 0 16px;
            line-height: 1.5;
          }

          .preview-btn {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }
        }
      }
    }

    .ai-controls {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 24px;

      mat-form-field {
        flex: 1;
        max-width: 300px;
      }
    }

    .ai-suggestions {
      display: grid;
      gap: 20px;
    }

    .suggestion-card {
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      padding: 20px;

      h5 {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .suggestion-desc {
        margin: 0 0 16px;
        font-size: 14px;
        color: #6B7280;
      }

      .suggestion-colors {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }

      .color-chip {
        flex: 1;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }

        .color-role {
          font-size: 11px;
          font-weight: 600;
          color: white;
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 8px;
          border-radius: 4px;
        }
      }
    }

    ::ng-deep .mat-mdc-tab-labels {
      background: rgba(196, 247, 239, 0.2);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
    }

    ::ng-deep .mat-mdc-tab-label-active {
      background: white;
      border-radius: 8px;
    }
  `]
})
export class PaletteGeneratorDialogComponent {
  baseColor: string = '#34C5AA';
  harmonyPalettes: GeneratedPalette[] = [];
  shades: string[] = [];
  tints: string[] = [];
  shadeCount: number = 9;
  themeStyle: string = 'professional';
  themePalette: any[] = [];
  paletteMood: string = 'professional';
  includeNeutrals: boolean = true;
  aiSuggestions: any[] = [];
  selectedPalette: GeneratedPalette | null = null;

  constructor(
    public dialogRef: MatDialogRef<PaletteGeneratorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaletteGeneratorData
  ) {
    if (data?.baseColor) {
      this.baseColor = data.baseColor;
    }
    this.generateHarmonyPalettes();
    this.generateShades();
    this.generateThemePalette();
    this.generateAIPalette();
  }

  generateHarmonyPalettes(): void {
    const hsl = this.hexToHsl(this.baseColor);
    if (!hsl) return;

    this.harmonyPalettes = [
      {
        name: 'Monochromatic',
        type: 'monochromatic',
        colors: this.generateMonochromatic(hsl)
      },
      {
        name: 'Analogous',
        type: 'analogous',
        colors: this.generateAnalogous(hsl)
      },
      {
        name: 'Complementary',
        type: 'complementary',
        colors: this.generateComplementary(hsl)
      },
      {
        name: 'Split Complementary',
        type: 'split-complementary',
        colors: this.generateSplitComplementary(hsl)
      },
      {
        name: 'Triadic',
        type: 'triadic',
        colors: this.generateTriadic(hsl)
      },
      {
        name: 'Tetradic',
        type: 'tetradic',
        colors: this.generateTetradic(hsl)
      }
    ];
  }

  generateShades(): void {
    const hsl = this.hexToHsl(this.baseColor);
    if (!hsl) return;

    this.shades = [];
    this.tints = [];

    const shadeStep = hsl.l / (this.shadeCount - 1);
    const tintStep = (100 - hsl.l) / (this.shadeCount - 1);

    // Generate shades (darker)
    for (let i = 0; i < this.shadeCount; i++) {
      const lightness = hsl.l - (shadeStep * i);
      this.shades.push(this.hslToHex({ ...hsl, l: Math.max(0, lightness) }));
    }

    // Generate tints (lighter)
    for (let i = 0; i < this.shadeCount; i++) {
      const lightness = hsl.l + (tintStep * i);
      this.tints.push(this.hslToHex({ ...hsl, l: Math.min(100, lightness) }));
    }
  }

  generateThemePalette(): void {
    const styles: Record<string, any[]> = {
      professional: [
        { name: 'Primary', color: '#1E40AF' },
        { name: 'Secondary', color: '#475569' },
        { name: 'Text', color: '#0F172A' },
        { name: 'Text Secondary', color: '#64748B' },
        { name: 'Background', color: '#FFFFFF' },
        { name: 'Surface', color: '#F8FAFC' }
      ],
      vibrant: [
        { name: 'Primary', color: '#F59E0B' },
        { name: 'Secondary', color: '#EC4899' },
        { name: 'Text', color: '#18181B' },
        { name: 'Text Secondary', color: '#52525B' },
        { name: 'Background', color: '#FFFBEB' },
        { name: 'Surface', color: '#FEF3C7' }
      ],
      pastel: [
        { name: 'Primary', color: '#C084FC' },
        { name: 'Secondary', color: '#FBCFE8' },
        { name: 'Text', color: '#44403C' },
        { name: 'Text Secondary', color: '#78716C' },
        { name: 'Background', color: '#FAF5FF' },
        { name: 'Surface', color: '#F3E8FF' }
      ],
      dark: [
        { name: 'Primary', color: '#60A5FA' },
        { name: 'Secondary', color: '#A78BFA' },
        { name: 'Text', color: '#F8FAFC' },
        { name: 'Text Secondary', color: '#CBD5E1' },
        { name: 'Background', color: '#0F172A' },
        { name: 'Surface', color: '#1E293B' }
      ],
      earth: [
        { name: 'Primary', color: '#92400E' },
        { name: 'Secondary', color: '#B45309' },
        { name: 'Text', color: '#1C1917' },
        { name: 'Text Secondary', color: '#57534E' },
        { name: 'Background', color: '#FEF3C7' },
        { name: 'Surface', color: '#FDE68A' }
      ],
      ocean: [
        { name: 'Primary', color: this.baseColor },
        { name: 'Secondary', color: '#06B6D4' },
        { name: 'Text', color: '#164E63' },
        { name: 'Text Secondary', color: '#0E7490' },
        { name: 'Background', color: '#F0FDFA' },
        { name: 'Surface', color: '#CCFBF1' }
      ],
      sunset: [
        { name: 'Primary', color: '#F97316' },
        { name: 'Secondary', color: '#EF4444' },
        { name: 'Text', color: '#7C2D12' },
        { name: 'Text Secondary', color: '#9A3412' },
        { name: 'Background', color: '#FFF7ED' },
        { name: 'Surface', color: '#FED7AA' }
      ],
      forest: [
        { name: 'Primary', color: '#059669' },
        { name: 'Secondary', color: '#10B981' },
        { name: 'Text', color: '#14532D' },
        { name: 'Text Secondary', color: '#166534' },
        { name: 'Background', color: '#F0FDF4' },
        { name: 'Surface', color: '#D1FAE5' }
      ]
    };

    // @ts-ignore
    this.themePalette = styles[this.themeStyle] || styles.professional;
  }

  generateAIPalette(): void {
    // Simulate AI-generated palette suggestions based on mood
    const suggestions: Record<string, any[]> = {
      energetic: [
        {
          name: 'Dynamic Energy',
          description: 'Bold and vibrant colors that convey excitement and movement',
          colors: [
            { role: 'Primary', value: '#F59E0B' },
            { role: 'Secondary', value: '#EF4444' },
            { role: 'Accent', value: '#8B5CF6' },
            { role: 'Background', value: '#FEF3C7' }
          ]
        }
      ],
      calm: [
        {
          name: 'Serene Waters',
          description: 'Soft, peaceful colors inspired by nature',
          colors: [
            { role: 'Primary', value: '#34C5AA' },
            { role: 'Secondary', value: '#93C5FD' },
            { role: 'Accent', value: '#C7D2FE' },
            { role: 'Background', value: '#F0F9FF' }
          ]
        }
      ],
      professional: [
        {
          name: 'Corporate Confidence',
          description: 'Trustworthy and sophisticated color scheme',
          colors: [
            { role: 'Primary', value: '#1E40AF' },
            { role: 'Secondary', value: '#475569' },
            { role: 'Accent', value: '#34C5AA' },
            { role: 'Background', value: '#F8FAFC' }
          ]
        }
      ],
      playful: [
        {
          name: 'Candy Pop',
          description: 'Fun and whimsical colors that spark joy',
          colors: [
            { role: 'Primary', value: '#EC4899' },
            { role: 'Secondary', value: '#F472B6' },
            { role: 'Accent', value: '#FBBF24' },
            { role: 'Background', value: '#FDF2F8' }
          ]
        }
      ],
      elegant: [
        {
          name: 'Refined Luxury',
          description: 'Sophisticated and timeless color palette',
          colors: [
            { role: 'Primary', value: '#4C1D95' },
            { role: 'Secondary', value: '#6B7280' },
            { role: 'Accent', value: '#D4AF37' },
            { role: 'Background', value: '#FAF5FF' }
          ]
        }
      ],
      natural: [
        {
          name: 'Earth & Sky',
          description: 'Organic colors inspired by nature',
          colors: [
            { role: 'Primary', value: '#059669' },
            { role: 'Secondary', value: '#D97706' },
            { role: 'Accent', value: '#7C3AED' },
            { role: 'Background', value: '#ECFDF5' }
          ]
        }
      ],
      tech: [
        {
          name: 'Digital Future',
          description: 'Modern, tech-forward color scheme',
          colors: [
            { role: 'Primary', value: '#2563EB' },
            { role: 'Secondary', value: '#7C3AED' },
            { role: 'Accent', value: '#06B6D4' },
            { role: 'Background', value: '#EFF6FF' }
          ]
        }
      ],
      vintage: [
        {
          name: 'Retro Classic',
          description: 'Nostalgic colors with a modern twist',
          colors: [
            { role: 'Primary', value: '#DC2626' },
            { role: 'Secondary', value: '#CA8A04' },
            { role: 'Accent', value: '#15803D' },
            { role: 'Background', value: '#FEF9C3' }
          ]
        }
      ]
    };

    // @ts-ignore
    this.aiSuggestions = suggestions[this.paletteMood] || suggestions.professional;
  }

  // Color harmony generation methods
  generateMonochromatic(hsl: { h: number; s: number; l: number }): string[] {
    return [
      this.hslToHex({ ...hsl, l: 20 }),
      this.hslToHex({ ...hsl, l: 40 }),
      this.hslToHex({ ...hsl, l: 60 }),
      this.hslToHex({ ...hsl, l: 80 }),
      this.hslToHex({ ...hsl, l: 95 })
    ];
  }

  generateAnalogous(hsl: { h: number; s: number; l: number }): string[] {
    return [
      this.hslToHex({ h: (hsl.h - 60 + 360) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex(hsl),
      this.hslToHex({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h + 60) % 360, s: hsl.s, l: hsl.l })
    ];
  }

  generateComplementary(hsl: { h: number; s: number; l: number }): string[] {
    return [
      this.hslToHex({ ...hsl, l: 30 }),
      this.hslToHex(hsl),
      this.hslToHex({ ...hsl, l: 70 }),
      this.hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: 70 })
    ];
  }

  generateSplitComplementary(hsl: { h: number; s: number; l: number }): string[] {
    const complement = (hsl.h + 180) % 360;
    return [
      this.hslToHex(hsl),
      this.hslToHex({ ...hsl, l: 70 }),
      this.hslToHex({ h: (complement - 30 + 360) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (complement + 30) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: complement, s: hsl.s * 0.5, l: 85 })
    ];
  }

  generateTriadic(hsl: { h: number; s: number; l: number }): string[] {
    return [
      this.hslToHex(hsl),
      this.hslToHex({ ...hsl, l: 70 }),
      this.hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: hsl.h, s: hsl.s * 0.3, l: 90 })
    ];
  }

  generateTetradic(hsl: { h: number; s: number; l: number }): string[] {
    return [
      this.hslToHex(hsl),
      this.hslToHex({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }),
      this.hslToHex({ h: hsl.h, s: hsl.s * 0.3, l: 95 })
    ];
  }

  getShadeLabel(index: number): string {
    const labels = ['900', '800', '700', '600', '500', '400', '300', '200', '100'];
    return labels[index] || `${900 - index * 100}`;
  }

  getTintLabel(index: number): string {
    const labels = ['500', '400', '300', '200', '100', '50', '25', '10', '5'];
    return labels[index] || `${500 - index * 50}`;
  }

  copyColor(color: string): void {
    navigator.clipboard.writeText(color);
    // You could add a snackbar notification here
  }

  applyPalette(palette: GeneratedPalette): void {
    this.selectedPalette = palette;
  }

  applySuggestion(suggestion: any): void {
    this.selectedPalette = {
      name: suggestion.name,
      type: 'ai-generated',
      colors: suggestion.colors.map((c: any) => c.value)
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    this.dialogRef.close(this.selectedPalette);
  }

  // Color utility functions
  private hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private hslToHex(hsl: { h: number; s: number; l: number }): string {
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

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
