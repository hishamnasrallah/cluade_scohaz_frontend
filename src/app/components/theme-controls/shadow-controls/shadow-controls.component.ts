// src/app/components/theme-controls/shadow-controls/shadow-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';

interface ShadowPreset {
  name: string;
  icon: string;
  intensity: number;
  small: string;
  medium: string;
  large: string;
  color: string;
}

@Component({
  selector: 'app-shadow-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <div class="shadow-controls">
      <!-- Enable/Disable Shadows -->
      <div class="control-section">
        <mat-checkbox
          [checked]="theme.enableShadows"
          (change)="updateProperty('enableShadows', $event.checked)"
          class="enable-checkbox">
          Enable Shadows
        </mat-checkbox>
      </div>

      <!-- Shadow Presets -->
      <div class="control-section" *ngIf="theme.enableShadows">
        <h4>Shadow Presets</h4>

        <div class="presets-grid">
          <div *ngFor="let preset of shadowPresets"
               class="preset-card"
               [class.active]="isPresetActive(preset)"
               (click)="applyPreset(preset)">
            <div class="preset-icon">{{ preset.icon }}</div>
            <div class="preset-preview"
                 [style.box-shadow]="preset.medium"></div>
            <span class="preset-name">{{ preset.name }}</span>
          </div>
        </div>
      </div>

      <!-- Shadow Intensity -->
      <div class="control-section" *ngIf="theme.enableShadows">
        <h4>Shadow Intensity</h4>

        <div class="control-item">
          <label>Intensity: {{ (theme.shadowIntensity * 100).toFixed(0) }}%</label>
          <mat-slider
            [min]="0"
            [max]="1"
            [step]="0.05"
            [(ngModel)]="theme.shadowIntensity"
            (ngModelChange)="updateProperty('shadowIntensity', $event.value)"
            [discrete]="true">
            <input matSliderThumb>
          </mat-slider>

          <div class="intensity-preview">
            <div class="preview-box"
                 [style.box-shadow]="generateShadow('medium')">
              Preview
            </div>
          </div>
        </div>
      </div>

      <!-- Shadow Color -->
      <div class="control-section" *ngIf="theme.enableShadows">
        <h4>Shadow Color</h4>

        <div class="color-control">
          <div class="color-input-group">
            <div class="color-preview"
                 [style.background]="theme.shadowColor"
                 (click)="colorPicker.click()"></div>
            <input #colorPicker
                   type="color"
                   [(ngModel)]="shadowHexColor"
                   (ngModelChange)="updateShadowColorFromHex($event)"
                   class="hidden-input" />
            <input type="text"
                   [(ngModel)]="theme.shadowColor"
                   (ngModelChange)="updateProperty('shadowColor', $any($event.target).value)"
                   class="color-text"
                   placeholder="rgba(0, 0, 0, 0.1)" />

            <button mat-icon-button
                    (click)="resetShadowColor()"
                    matTooltip="Reset to default">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Individual Shadow Controls -->
      <div class="control-section" *ngIf="theme.enableShadows">
        <h4>Shadow Sizes</h4>

        <div class="shadow-sizes">
          <!-- Small Shadow -->
          <div class="shadow-size-control">
            <label>Small Shadow</label>
            <div class="shadow-editor">
              <div class="shadow-inputs">
                <input type="number"
                       [(ngModel)]="smallShadow.x"
                       (ngModelChange)="updateShadowSize('small')"
                       placeholder="X"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="smallShadow.y"
                       (ngModelChange)="updateShadowSize('small')"
                       placeholder="Y"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="smallShadow.blur"
                       (ngModelChange)="updateShadowSize('small')"
                       placeholder="Blur"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="smallShadow.spread"
                       (ngModelChange)="updateShadowSize('small')"
                       placeholder="Spread"
                       class="shadow-input" />
              </div>
              <div class="shadow-preview-box small"
                   [style.box-shadow]="theme.shadowSmall">
                Small
              </div>
            </div>
          </div>

          <!-- Medium Shadow -->
          <div class="shadow-size-control">
            <label>Medium Shadow</label>
            <div class="shadow-editor">
              <div class="shadow-inputs">
                <input type="number"
                       [(ngModel)]="mediumShadow.x"
                       (ngModelChange)="updateShadowSize('medium')"
                       placeholder="X"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="mediumShadow.y"
                       (ngModelChange)="updateShadowSize('medium')"
                       placeholder="Y"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="mediumShadow.blur"
                       (ngModelChange)="updateShadowSize('medium')"
                       placeholder="Blur"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="mediumShadow.spread"
                       (ngModelChange)="updateShadowSize('medium')"
                       placeholder="Spread"
                       class="shadow-input" />
              </div>
              <div class="shadow-preview-box medium"
                   [style.box-shadow]="theme.shadowMedium">
                Medium
              </div>
            </div>
          </div>

          <!-- Large Shadow -->
          <div class="shadow-size-control">
            <label>Large Shadow</label>
            <div class="shadow-editor">
              <div class="shadow-inputs">
                <input type="number"
                       [(ngModel)]="largeShadow.x"
                       (ngModelChange)="updateShadowSize('large')"
                       placeholder="X"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="largeShadow.y"
                       (ngModelChange)="updateShadowSize('large')"
                       placeholder="Y"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="largeShadow.blur"
                       (ngModelChange)="updateShadowSize('large')"
                       placeholder="Blur"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="largeShadow.spread"
                       (ngModelChange)="updateShadowSize('large')"
                       placeholder="Spread"
                       class="shadow-input" />
              </div>
              <div class="shadow-preview-box large"
                   [style.box-shadow]="theme.shadowLarge">
                Large
              </div>
            </div>
          </div>

          <!-- Inset Shadow -->
          <div class="shadow-size-control">
            <label>Inset Shadow</label>
            <div class="shadow-editor">
              <div class="shadow-inputs">
                <input type="number"
                       [(ngModel)]="insetShadow.x"
                       (ngModelChange)="updateShadowSize('inset')"
                       placeholder="X"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="insetShadow.y"
                       (ngModelChange)="updateShadowSize('inset')"
                       placeholder="Y"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="insetShadow.blur"
                       (ngModelChange)="updateShadowSize('inset')"
                       placeholder="Blur"
                       class="shadow-input" />
                <input type="number"
                       [(ngModel)]="insetShadow.spread"
                       (ngModelChange)="updateShadowSize('inset')"
                       placeholder="Spread"
                       class="shadow-input" />
              </div>
              <div class="shadow-preview-box inset"
                   [style.box-shadow]="theme.shadowInset">
                Inset
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blur Effects -->
      <div class="control-section">
        <h4>Blur Effects</h4>

        <mat-checkbox
          [checked]="theme.enableBlur"
          (change)="updateProperty('enableBlur', $event.checked)"
          class="enable-checkbox">
          Enable Blur Effects
        </mat-checkbox>

        <div class="blur-controls" *ngIf="theme.enableBlur">
          <div class="control-item">
            <label>Blur Intensity: {{ theme.blurIntensity }}px</label>
            <mat-slider
              [min]="0"
              [max]="30"
              [step]="1"
              [(ngModel)]="theme.blurIntensity"
              (ngModelChange)="updateProperty('blurIntensity', $event.value)"
              [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="blur-sizes">
            <div class="control-item">
              <label>Small Blur: {{ theme.blurSmall }}px</label>
              <mat-slider
                [min]="0"
                [max]="20"
                [step]="1"
                [(ngModel)]="theme.blurSmall"
                (ngModelChange)="updateProperty('blurSmall', $event.value)"
                [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Medium Blur: {{ theme.blurMedium }}px</label>
              <mat-slider
                [min]="0"
                [max]="30"
                [step]="1"
                [(ngModel)]="theme.blurMedium"
                (ngModelChange)="updateProperty('blurMedium', $event.value)"
                [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Large Blur: {{ theme.blurLarge }}px</label>
              <mat-slider
                [min]="0"
                [max]="50"
                [step]="1"
                [(ngModel)]="theme.blurLarge"
                (ngModelChange)="updateProperty('blurLarge', $event.value)"
                [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
            </div>
          </div>

          <!-- Blur Preview -->
          <div class="blur-preview">
            <div class="blur-background">
              <div class="blur-content">Background Content</div>
            </div>
            <div class="blur-overlay" [style.backdrop-filter]="'blur(' + theme.blurIntensity + 'px)'">
              <p>Glassmorphic overlay with blur effect</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Preview -->
      <div class="control-section" *ngIf="theme.enableShadows || theme.enableBlur">
        <h4>Interactive Preview</h4>

        <div class="interactive-preview">
          <div class="preview-grid">
            <div class="preview-item card"
                 [style.box-shadow]="theme.shadowMedium">
              <h5>Card Shadow</h5>
              <p>Medium shadow for cards</p>
            </div>

            <div class="preview-item button"
                 [style.box-shadow]="theme.shadowSmall">
              Button Shadow
            </div>

            <div class="preview-item modal"
                 [style.box-shadow]="theme.shadowLarge">
              <h5>Modal Shadow</h5>
              <p>Large shadow for modals</p>
            </div>

            <div class="preview-item glass"
                 *ngIf="theme.enableBlur"
                 [style.backdrop-filter]="'blur(' + theme.blurMedium + 'px)'"
                 [style.box-shadow]="theme.shadowSmall">
              <h5>Glass Effect</h5>
              <p>Blur + Shadow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shadow-controls {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .control-section {
      h4 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .enable-checkbox {
      font-weight: 500;

      ::ng-deep .mdc-checkbox__background {
        border-color: #34C5AA !important;
      }

      ::ng-deep .mdc-checkbox--selected .mdc-checkbox__background {
        background-color: #34C5AA !important;
        border-color: #34C5AA !important;
      }
    }

    .presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .preset-card {
      text-align: center;
      padding: 20px;
      background: white;
      border: 2px solid transparent;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(52, 197, 170, 0.3);
      }

      &.active {
        border-color: #34C5AA;
        background: rgba(196, 247, 239, 0.2);
      }

      .preset-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }

      .preset-preview {
        width: 60px;
        height: 60px;
        background: white;
        border-radius: 12px;
        margin: 0 auto 12px;
        transition: all 0.3s ease;
      }

      .preset-name {
        font-size: 14px;
        font-weight: 600;
        color: #4B5563;
      }
    }

    .control-item {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 12px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      mat-slider {
        width: 100%;
      }
    }

    .intensity-preview {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    .preview-box {
      width: 120px;
      height: 80px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #2F4858;
      transition: all 0.3s ease;
    }

    .color-control {
      .color-input-group {
        display: flex;
        align-items: center;
        gap: 12px;

        .color-preview {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.05);
          }
        }

        .hidden-input {
          display: none;
        }

        .color-text {
          flex: 1;
          padding: 10px 14px;
          border: 2px solid rgba(196, 247, 239, 0.5);
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          background-color: white;
          color: #2F4858;
          transition: all 0.2s ease;

          &:focus {
            outline: none;
            border-color: #34C5AA;
            box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
          }
        }
      }
    }

    .shadow-sizes {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .shadow-size-control {
      label {
        display: block;
        margin-bottom: 12px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 600;
      }
    }

    .shadow-editor {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .shadow-inputs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      flex: 1;
    }

    .shadow-input {
      padding: 8px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      background: white;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }

      &::placeholder {
        color: #9CA3AF;
        font-size: 11px;
      }
    }

    .shadow-preview-box {
      width: 100px;
      height: 60px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
      color: #4B5563;
      flex-shrink: 0;

      &.small {
        width: 80px;
        height: 50px;
        font-size: 12px;
      }

      &.medium {
        width: 100px;
        height: 60px;
      }

      &.large {
        width: 120px;
        height: 70px;
      }

      &.inset {
        background: #F4FDFD;
      }
    }

    .blur-controls {
      margin-top: 20px;
    }

    .blur-sizes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }

    .blur-preview {
      margin-top: 24px;
      position: relative;
      height: 200px;
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid rgba(196, 247, 239, 0.5);
    }

    .blur-background {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      .blur-content {
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
    }

    .blur-overlay {
      position: absolute;
      inset: 20px;
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;

      p {
        margin: 0;
        font-weight: 600;
        color: #2F4858;
        text-align: center;
      }
    }

    .interactive-preview {
      background: rgba(196, 247, 239, 0.1);
      padding: 32px;
      border-radius: 16px;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .preview-item {
      background: white;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;

      &.card {
        h5 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2F4858;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
        }
      }

      &.button {
        padding: 12px 24px;
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        font-weight: 600;
        text-align: center;
        cursor: pointer;

        &:hover {
          transform: translateY(-1px);
        }
      }

      &.modal {
        min-height: 120px;

        h5 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2F4858;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
        }
      }

      &.glass {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);

        h5 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #2F4858;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
        }
      }
    }
  `]
})
export class ShadowControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  // Shadow values parsed from strings
  smallShadow = { x: 0, y: 1, blur: 3, spread: 0 };
  mediumShadow = { x: 0, y: 4, blur: 6, spread: 0 };
  largeShadow = { x: 0, y: 10, blur: 15, spread: 0 };
  insetShadow = { x: 0, y: 2, blur: 4, spread: 0 };

  shadowPresets: ShadowPreset[] = [
    {
      name: 'None',
      icon: '⬜',
      intensity: 0,
      small: 'none',
      medium: 'none',
      large: 'none',
      color: 'rgba(0, 0, 0, 0)'
    },
    {
      name: 'Subtle',
      icon: '🔲',
      intensity: 0.1,
      small: '0 1px 3px rgba(0, 0, 0, 0.06)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.08)',
      large: '0 10px 15px rgba(0, 0, 0, 0.1)',
      color: 'rgba(0, 0, 0, 0.1)'
    },
    {
      name: 'Normal',
      icon: '⬛',
      intensity: 0.15,
      small: '0 1px 3px rgba(0, 0, 0, 0.12)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.15)',
      large: '0 10px 15px rgba(0, 0, 0, 0.18)',
      color: 'rgba(0, 0, 0, 0.15)'
    },
    {
      name: 'Strong',
      icon: '🌑',
      intensity: 0.25,
      small: '0 2px 4px rgba(0, 0, 0, 0.2)',
      medium: '0 5px 10px rgba(0, 0, 0, 0.25)',
      large: '0 15px 25px rgba(0, 0, 0, 0.3)',
      color: 'rgba(0, 0, 0, 0.25)'
    },
    {
      name: 'Colored',
      icon: '🔵',
      intensity: 0.2,
      small: '0 2px 4px rgba(52, 197, 170, 0.2)',
      medium: '0 4px 8px rgba(52, 197, 170, 0.25)',
      large: '0 10px 20px rgba(52, 197, 170, 0.3)',
      color: 'rgba(52, 197, 170, 0.25)'
    },
    {
      name: 'Neumorphic',
      icon: '💠',
      intensity: 0.1,
      small: '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
      medium: '10px 10px 20px #d1d5db, -10px -10px 20px #ffffff',
      large: '15px 15px 30px #d1d5db, -15px -15px 30px #ffffff',
      color: 'rgba(0, 0, 0, 0.1)'
    },

];
  shadowHexColor: string = '#000000';

  ngOnInit() {
    this.parseShadowValues();
    this.shadowHexColor = this.convertToHex(this.theme.shadowColor);

  }
  updateShadowColorFromHex(hex: string): void {
    this.shadowHexColor = hex;
    this.updateProperty('shadowColor', this.convertToRgba(hex));
  }
  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  isPresetActive(preset: ShadowPreset): boolean {
    return Math.abs(this.theme.shadowIntensity - preset.intensity) < 0.01 &&
      this.theme.shadowMedium === preset.medium;
  }

  applyPreset(preset: ShadowPreset): void {
    this.themeChange.emit({
      shadowIntensity: preset.intensity,
      shadowSmall: preset.small,
      shadowMedium: preset.medium,
      shadowLarge: preset.large,
      shadowColor: preset.color
    });
  }

  generateShadow(size: 'small' | 'medium' | 'large'): string {
    const intensity = this.theme.shadowIntensity;
    const color = this.theme.shadowColor || 'rgba(0, 0, 0, 0.1)';

    switch (size) {
      case 'small':
        return `0 1px 3px ${color}`;
      case 'medium':
        return `0 4px 6px ${color}`;
      case 'large':
        return `0 10px 15px ${color}`;
    }
  }

  convertToHex(color: string): string {
    // Simple conversion for demonstration
    if (color.startsWith('rgba')) {
      return '#000000';
    }
    return color;
  }

  convertToRgba(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${this.theme.shadowIntensity})`;
  }

  resetShadowColor(): void {
    this.updateProperty('shadowColor', 'rgba(0, 0, 0, 0.1)');
  }

  parseShadowValues(): void {
    // Parse existing shadow values
    // This is a simplified version - in production, you'd have a proper parser
    try {
      const parseValues = (shadow: string) => {
        const matches = shadow.match(/(-?\d+)px/g);
        if (matches && matches.length >= 3) {
          return {
            x: parseInt(matches[0]),
            y: parseInt(matches[1]),
            blur: parseInt(matches[2]),
            spread: matches[3] ? parseInt(matches[3]) : 0
          };
        }
        return { x: 0, y: 0, blur: 0, spread: 0 };
      };

      if (this.theme.shadowSmall && this.theme.shadowSmall !== 'none') {
        this.smallShadow = parseValues(this.theme.shadowSmall);
      }
      if (this.theme.shadowMedium && this.theme.shadowMedium !== 'none') {
        this.mediumShadow = parseValues(this.theme.shadowMedium);
      }
      if (this.theme.shadowLarge && this.theme.shadowLarge !== 'none') {
        this.largeShadow = parseValues(this.theme.shadowLarge);
      }
    } catch (e) {
      console.error('Error parsing shadow values:', e);
    }
  }

  updateShadowSize(size: 'small' | 'medium' | 'large' | 'inset'): void {
    let shadow: any;
    let key: keyof ThemeConfig;

    switch (size) {
      case 'small':
        shadow = this.smallShadow;
        key = 'shadowSmall';
        break;
      case 'medium':
        shadow = this.mediumShadow;
        key = 'shadowMedium';
        break;
      case 'large':
        shadow = this.largeShadow;
        key = 'shadowLarge';
        break;
      case 'inset':
        shadow = this.insetShadow;
        key = 'shadowInset';
        break;
    }

    const shadowValue = size === 'inset'
      ? `inset ${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${this.theme.shadowColor}`
      : `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${this.theme.shadowColor}`;

    this.themeChange.emit({ [key]: shadowValue });
  }
}
