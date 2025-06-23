// src/app/components/theme-controls/border-controls/border-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';

interface BorderPreset {
  name: string;
  radius: number;
  radiusSmall: number;
  radiusMedium: number;
  radiusLarge: number;
  width: number;
  style: string;
}

@Component({
  selector: 'app-border-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="border-controls">
      <!-- Border Radius Section -->
      <div class="control-section">
        <h4>Border Radius</h4>

        <!-- Quick Presets -->
        <div class="presets-row">
          <button *ngFor="let preset of radiusPresets"
                  mat-stroked-button
                  class="preset-btn"
                  [class.active]="isRadiusPresetActive(preset)"
                  (click)="applyRadiusPreset(preset)">
            <span class="preset-icon">{{ preset.icon }}</span>
            {{ preset.name }}
          </button>
        </div>

        <!-- Individual Controls -->
        <div class="radius-controls">
          <div class="control-item">
            <label>Default Radius: {{ theme.borderRadius }}px</label>
            <mat-slider
              [min]="0"
              [max]="50"
              [step]="1"
              [discrete]="true">
              <input matSliderThumb
                     [value]="theme.borderRadius"
                     (valueChange)="updateProperty('borderRadius', $event)">
            </mat-slider>
            <div class="preview-box" [style.border-radius.px]="theme.borderRadius"></div>
          </div>

          <div class="control-item">
            <label>Small Radius: {{ theme.borderRadiusSmall }}px</label>
            <mat-slider
              [min]="0"
              [max]="30"
              [step]="1"
              [discrete]="true">
              <input matSliderThumb
                     [value]="theme.borderRadiusSmall"
                     (valueChange)="updateProperty('borderRadiusSmall', $event)">
            </mat-slider>
            <div class="preview-box small" [style.border-radius.px]="theme.borderRadiusSmall"></div>
          </div>

          <div class="control-item">
            <label>Medium Radius: {{ theme.borderRadiusMedium }}px</label>
            <mat-slider
              [min]="0"
              [max]="60"
              [step]="1"
              [(ngModel)]="theme.borderRadiusLarge"
              (ngModelChange)="updateProperty('borderRadiusLarge', $event.value)"
              [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
            <div class="preview-box medium" [style.border-radius.px]="theme.borderRadiusMedium"></div>
          </div>

          <div class="control-item">
            <label>Large Radius: {{ theme.borderRadiusLarge }}px</label>
            <mat-slider
              [min]="0"
              [max]="60"
              [step]="1"
              [discrete]="true">
              <input matSliderThumb
                     [value]="theme.borderRadiusLarge"
                     (valueChange)="updateProperty('borderRadiusLarge', $event)">
            </mat-slider>
            <div class="preview-box large" [style.border-radius.px]="theme.borderRadiusLarge"></div>
          </div>

          <div class="control-item">
            <label>Circle Radius: {{ theme.borderRadiusCircle }}px</label>
            <mat-slider [min]="0" [max]="50" [step]="1"
                        [discrete]="true">
              <input matSliderThumb
                     [value]="theme.borderRadiusCircle"
                     (valueChange)="updateProperty('borderRadiusCircle', $event)">
            </mat-slider>

            <div class="preview-box circle" [style.border-radius.px]="theme.borderRadiusCircle"></div>
          </div>
        </div>
      </div>

      <!-- Border Width Section -->
      <div class="control-section">
        <h4>Border Width</h4>

        <div class="control-item">
          <label>Width: {{ theme.borderWidth }}px</label>
          <mat-slider
            [min]="0"
            [max]="10"
            [step]="1"
            [discrete]="true">
            <input matSliderThumb
                   [value]="theme.borderWidth"
                   (valueChange)="updateProperty('borderWidth', $event)">
          </mat-slider>

          <div class="width-preview">
            <div class="width-box" [style.border-width.px]="theme.borderWidth"></div>
            <span class="width-label">{{ theme.borderWidth }}px</span>
          </div>
        </div>
      </div>

      <!-- Border Style Section -->
      <div class="control-section">
        <h4>Border Style</h4>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Style</mat-label>
          <mat-select [value]="theme.borderStyle" (selectionChange)="updateProperty('borderStyle', $event.value)">
            <mat-option *ngFor="let style of borderStyles" [value]="style.value">
              <div class="style-option">
                <div class="style-preview" [style.border-style]="style.value"></div>
                <span>{{ style.label }}</span>
              </div>
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="style-examples">
          <div *ngFor="let style of borderStyles"
               class="style-example"
               [class.active]="theme.borderStyle === style.value"
               (click)="updateProperty('borderStyle', style.value)">
            <div class="example-box"
                 [style.border-style]="style.value"
                 [style.border-width.px]="theme.borderWidth"
                 [style.border-color]="theme.borderColor"></div>
            <span>{{ style.label }}</span>
          </div>
        </div>
      </div>

      <!-- Border Colors Section -->
      <div class="control-section">
        <h4>Border Colors</h4>

        <div class="color-controls">
          <div class="color-control">
            <label>Default Border</label>
            <div class="color-input-group">
              <input
                type="color"
                [value]="convertToHex(theme.borderColor)"
                (input)="updateProperty('borderColor', $any($event.target).value)"
                class="color-picker"
              />
              <input
                type="text"
                [value]="theme.borderColor"
                (input)="updateProperty('borderColor', $any($event.target).value)"
                class="color-text"
                placeholder="rgba(0, 0, 0, 0.08)"
              />
            </div>
          </div>

          <div class="color-control">
            <label>Focus Border</label>
            <div class="color-input-group">
              <input
                type="color"
                [value]="theme.borderFocusColor"
                (input)="updateProperty('borderFocusColor', $any($event.target).value)"
                class="color-picker"
              />
              <input
                type="text"
                [value]="theme.borderFocusColor"
                (input)="updateProperty('borderFocusColor', $any($event.target).value)"
                class="color-text"
              />
            </div>
          </div>

          <div class="color-control">
            <label>Hover Border</label>
            <div class="color-input-group">
              <input
                type="color"
                [value]="convertToHex(theme.borderHoverColor)"
                (input)="updateProperty('borderHoverColor', $any($event.target).value)"
                class="color-picker"
              />
              <input
                type="text"
                [value]="theme.borderHoverColor"
                (input)="updateProperty('borderHoverColor', $any($event.target).value)"
                class="color-text"
                placeholder="rgba(52, 197, 170, 0.3)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Preview -->
      <div class="control-section">
        <h4>Interactive Preview</h4>

        <div class="interactive-preview">
          <div class="preview-card"
               [style.border-radius.px]="theme.borderRadius"
               [style.border-width.px]="theme.borderWidth"
               [style.border-style]="theme.borderStyle"
               [style.border-color]="theme.borderColor"
               (mouseenter)="previewHover = true"
               (mouseleave)="previewHover = false"
               (focus)="previewFocus = true"
               (blur)="previewFocus = false"
               [style.border-color]="previewFocus ? theme.borderFocusColor : (previewHover ? theme.borderHoverColor : theme.borderColor)"
               tabindex="0">
            <h5>Card Component</h5>
            <p>Hover or focus to see border state changes</p>

            <div class="preview-elements">
              <button class="preview-btn"
                      [style.border-radius.px]="theme.buttonBorderRadius || theme.borderRadiusSmall">
                Button
              </button>

              <input type="text"
                     placeholder="Input field"
                     class="preview-input"
                     [style.border-radius.px]="theme.inputBorderRadius || theme.borderRadiusSmall" />
            </div>
          </div>
        </div>
      </div>

      <!-- Complete Presets -->
      <div class="control-section">
        <h4>Complete Border Presets</h4>

        <div class="complete-presets">
          <div *ngFor="let preset of completePresets"
               class="preset-card"
               [class.active]="isCompletePresetActive(preset)"
               (click)="applyCompletePreset(preset)">
            <div class="preset-preview"
                 [style.border-radius.px]="preset.radius"
                 [style.border-width.px]="preset.width"
                 [style.border-style]="preset.style"></div>
            <span class="preset-name">{{ preset.name }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .border-controls {
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

    .presets-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }

    .preset-btn {
      display: flex;
      align-items: center;
      gap: 8px;

      &.active {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        border-color: transparent;
      }

      .preset-icon {
        font-size: 18px;
      }
    }

    .radius-controls {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .control-item {
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

    .preview-box {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      margin-top: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(52, 197, 170, 0.2);

      &.small {
        width: 60px;
        height: 60px;
      }

      &.medium {
        width: 70px;
        height: 70px;
      }

      &.large {
        width: 90px;
        height: 90px;
      }

      &.circle {
        width: 80px;
        height: 80px;
      }
    }

    .width-preview {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 16px;

      .width-box {
        width: 120px;
        height: 60px;
        border: solid #34C5AA;
        background: rgba(196, 247, 239, 0.2);
        transition: all 0.3s ease;
      }

      .width-label {
        font-weight: 600;
        color: #2F4858;
      }
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field-wrapper {
      background: white !important;
    }

    .style-option {
      display: flex;
      align-items: center;
      gap: 12px;

      .style-preview {
        width: 40px;
        height: 20px;
        border: 2px solid #34C5AA;
      }
    }

    .style-examples {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .style-example {
      text-align: center;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
      transition: all 0.3s ease;
      background: white;
      border: 2px solid transparent;

      &:hover {
        background: rgba(196, 247, 239, 0.2);
      }

      &.active {
        border-color: #34C5AA;
        background: rgba(196, 247, 239, 0.3);
      }

      .example-box {
        width: 60px;
        height: 40px;
        margin: 0 auto 8px;
        border: 3px solid #34C5AA;
        background: white;
      }

      span {
        font-size: 13px;
        font-weight: 500;
        color: #4B5563;
      }
    }

    .color-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .color-control {
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }
    }

    .color-input-group {
      display: flex;
      gap: 12px;
      align-items: center;

      .color-picker {
        width: 48px;
        height: 36px;
        border: 2px solid rgba(196, 247, 239, 0.5);
        border-radius: 8px;
        cursor: pointer;
        padding: 2px;
        transition: all 0.2s ease;

        &:hover {
          border-color: #34C5AA;
        }
      }

      .color-text {
        flex: 1;
        padding: 8px 12px;
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

    .interactive-preview {
      background: rgba(196, 247, 239, 0.1);
      padding: 32px;
      border-radius: 16px;
    }

    .preview-card {
      background: white;
      padding: 24px;
      transition: all 0.3s ease;
      outline: none;

      &:focus {
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }

      h5 {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
      }

      p {
        margin: 0 0 20px;
        color: #6B7280;
        font-size: 14px;
      }
    }

    .preview-elements {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .preview-btn {
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.3);
      }
    }

    .preview-input {
      padding: 10px 16px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      background: white;
      font-size: 14px;
      transition: all 0.3s ease;
      outline: none;

      &:focus {
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }
    }

    .complete-presets {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }

    .preset-card {
      text-align: center;
      cursor: pointer;
      padding: 16px;
      border-radius: 12px;
      background: white;
      border: 2px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #34C5AA;
        background: rgba(196, 247, 239, 0.2);
      }

      .preset-preview {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        margin: 0 auto 12px;
        border: 3px solid #34C5AA;
      }

      .preset-name {
        font-size: 13px;
        font-weight: 600;
        color: #4B5563;
      }
    }
  `]
})
export class BorderControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  previewHover = false;
  previewFocus = false;

  radiusPresets = [
    { name: 'None', value: 0, icon: '⬜' },
    { name: 'Subtle', value: 4, icon: '🔲' },
    { name: 'Rounded', value: 12, icon: '🟦' },
    { name: 'Extra Rounded', value: 24, icon: '⭕' }
  ];

  borderStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' },
    { value: 'none', label: 'None' }
  ];

  completePresets: BorderPreset[] = [
    {
      name: 'Modern',
      radius: 12,
      radiusSmall: 8,
      radiusMedium: 12,
      radiusLarge: 16,
      width: 1,
      style: 'solid'
    },
    {
      name: 'Classic',
      radius: 4,
      radiusSmall: 2,
      radiusMedium: 4,
      radiusLarge: 6,
      width: 1,
      style: 'solid'
    },
    {
      name: 'Rounded',
      radius: 16,
      radiusSmall: 12,
      radiusMedium: 16,
      radiusLarge: 20,
      width: 2,
      style: 'solid'
    },
    {
      name: 'Sharp',
      radius: 0,
      radiusSmall: 0,
      radiusMedium: 0,
      radiusLarge: 0,
      width: 1,
      style: 'solid'
    },
    {
      name: 'Playful',
      radius: 24,
      radiusSmall: 16,
      radiusMedium: 24,
      radiusLarge: 32,
      width: 3,
      style: 'solid'
    },
    {
      name: 'Minimal',
      radius: 0,
      radiusSmall: 0,
      radiusMedium: 0,
      radiusLarge: 0,
      width: 0,
      style: 'none'
    }
  ];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  isRadiusPresetActive(preset: any): boolean {
    return this.theme.borderRadius === preset.value;
  }

  applyRadiusPreset(preset: any): void {
    const updates: Partial<ThemeConfig> = {
      borderRadius: preset.value,
      borderRadiusSmall: Math.max(0, preset.value - 4),
      borderRadiusMedium: preset.value,
      borderRadiusLarge: preset.value + 4
    };

    if (preset.value === 0) {
      updates.borderRadiusCircle = 0;
    } else {
      updates.borderRadiusCircle = 9999;
    }

    this.themeChange.emit(updates);
  }

  isCompletePresetActive(preset: BorderPreset): boolean {
    return this.theme.borderRadius === preset.radius &&
      this.theme.borderWidth === preset.width &&
      this.theme.borderStyle === preset.style;
  }

  applyCompletePreset(preset: BorderPreset): void {
    this.themeChange.emit({
      borderRadius: preset.radius,
      borderRadiusSmall: preset.radiusSmall,
      borderRadiusMedium: preset.radiusMedium,
      borderRadiusLarge: preset.radiusLarge,
      borderWidth: preset.width,
      borderStyle: preset.style as any
    });
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
}
