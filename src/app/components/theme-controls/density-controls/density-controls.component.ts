// src/app/components/theme-controls/density-controls/density-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { ThemeConfig } from '../../../models/theme.model';
import { DENSITY_OPTIONS, StyleOption } from '../../theme-creator/constants/style-options.constant';

interface DensityPreset {
  name: string;
  value: 'comfortable' | 'compact' | 'spacious';
  spacing: number;
  fontSize: number;
  buttonHeight: number;
  inputHeight: number;
  cardPadding: number;
  icon: string;
}

@Component({
  selector: 'app-density-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatSliderModule,
    MatIconModule
  ],
  template: `
    <div class="density-controls">
      <div class="control-group">
        <h4>Density & Spacing</h4>

        <!-- Density Presets -->
        <div class="density-presets">
          <div *ngFor="let preset of densityPresets"
               class="density-preset"
               [class.active]="theme.density === preset.value"
               (click)="applyDensityPreset(preset)">

            <mat-icon class="preset-icon">{{ preset.icon }}</mat-icon>
            <h5>{{ preset.name }}</h5>

            <div class="preset-preview">
              <div class="preview-button"
                   [style.height.px]="preset.buttonHeight"
                   [style.padding]="'0 ' + (preset.spacing * 1.5) + 'px'"
                   [style.font-size.px]="preset.fontSize">
                Button
              </div>

              <div class="preview-input"
                   [style.height.px]="preset.inputHeight"
                   [style.padding]="'0 ' + preset.spacing + 'px'"
                   [style.font-size.px]="preset.fontSize">
                Input Field
              </div>

              <div class="preview-card"
                   [style.padding.px]="preset.cardPadding">
                <div class="card-title"
                     [style.font-size.px]="preset.fontSize + 2">Card Title</div>
                <div class="card-content"
                     [style.font-size.px]="preset.fontSize">Card content with some text</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Density Controls -->
        <div class="custom-density">
          <h5>Custom Density Settings</h5>

          <div class="control-item">
            <label>Base Spacing Unit: {{ theme.spacingUnit }}px</label>
            <mat-slider
              [min]="4"
              [max]="32"
              [step]="4"
              [discrete]="true">
              <input matSliderThumb
                     [value]="theme.spacingUnit"
                     (valueChange)="updateSpacing($event)">
            </mat-slider>
          </div>

          <div class="spacing-scale">
            <h6>Spacing Scale</h6>
            <div class="scale-grid">
              <div class="scale-item">
                <span class="scale-label">XS</span>
                <div class="scale-box"
                     [style.width.px]="theme.spacingXSmall"
                     [style.height.px]="theme.spacingXSmall">
                </div>
                <span class="scale-value">{{ theme.spacingXSmall }}px</span>
              </div>

              <div class="scale-item">
                <span class="scale-label">S</span>
                <div class="scale-box"
                     [style.width.px]="theme.spacingSmall"
                     [style.height.px]="theme.spacingSmall">
                </div>
                <span class="scale-value">{{ theme.spacingSmall }}px</span>
              </div>

              <div class="scale-item">
                <span class="scale-label">M</span>
                <div class="scale-box"
                     [style.width.px]="theme.spacingMedium"
                     [style.height.px]="theme.spacingMedium">
                </div>
                <span class="scale-value">{{ theme.spacingMedium }}px</span>
              </div>

              <div class="scale-item">
                <span class="scale-label">L</span>
                <div class="scale-box"
                     [style.width.px]="theme.spacingLarge"
                     [style.height.px]="theme.spacingLarge">
                </div>
                <span class="scale-value">{{ theme.spacingLarge }}px</span>
              </div>

              <div class="scale-item">
                <span class="scale-label">XL</span>
                <div class="scale-box"
                     [style.width.px]="theme.spacingXLarge"
                     [style.height.px]="theme.spacingXLarge">
                </div>
                <span class="scale-value">{{ theme.spacingXLarge }}px</span>
              </div>
            </div>
          </div>

          <div class="component-density">
            <h6>Component Density</h6>

            <div class="control-item">
              <label>Button Height: {{ theme.buttonHeight }}px</label>
              <mat-slider
                [min]="32"
                [max]="56"
                [step]="4"
                [discrete]="true">
                <input matSliderThumb
                       [value]="theme.buttonHeight"
                       (valueChange)="updateProperty('buttonHeight', $event)">
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Input Height: {{ theme.inputHeight }}px</label>
              <mat-slider
                [min]="36"
                [max]="64"
                [step]="4"
                [discrete]="true">
                <input matSliderThumb
                       [value]="theme.inputHeight"
                       (valueChange)="updateProperty('inputHeight', $event)">
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Card Padding: {{ theme.cardPadding }}px</label>
              <mat-slider
                [min]="12"
                [max]="48"
                [step]="4"
                [discrete]="true">
                <input matSliderThumb
                       [value]="theme.cardPadding"
                       (valueChange)="updateProperty('cardPadding', $event)">
              </mat-slider>
            </div>

            <div class="control-item">
              <label>Modal Padding: {{ theme.modalPadding }}px</label>
              <mat-slider
                [min]="16"
                [max]="64"
                [step]="8"
                [discrete]="true">
                <input matSliderThumb
                       [value]="theme.modalPadding"
                       (valueChange)="updateProperty('modalPadding', $event)">
              </mat-slider>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="density-preview">
            <h6>Live Preview</h6>

            <div class="preview-container">
              <div class="preview-section">
                <h6>Components</h6>
                <button class="preview-button"
                        [style.height.px]="theme.buttonHeight"
                        [style.padding]="theme.buttonPaddingY + 'px ' + theme.buttonPaddingX + 'px'"
                        [style.font-size.px]="theme.buttonFontSize">
                  <mat-icon>add</mat-icon>
                  Add Item
                </button>

                <input type="text"
                       placeholder="Search..."
                       class="preview-input"
                       [style.height.px]="theme.inputHeight"
                       [style.padding]="theme.inputPaddingY + 'px ' + theme.inputPaddingX + 'px'"
                       [style.font-size.px]="theme.inputFontSize">

                <div class="preview-card"
                     [style.padding.px]="theme.cardPadding">
                  <h5 [style.margin-bottom.px]="theme.spacingSmall">Card Title</h5>
                  <p [style.margin-bottom.px]="theme.spacingSmall">This is a sample card with current density settings applied.</p>
                  <div class="card-actions" [style.margin-top.px]="theme.spacingMedium">
                    <button class="action-button">Action 1</button>
                    <button class="action-button">Action 2</button>
                  </div>
                </div>
              </div>

              <div class="preview-section">
                <h6>Spacing Examples</h6>

                <div class="spacing-example">
                  <div class="spacing-demo"
                       [style.gap.px]="theme.spacingXSmall">
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <span>XS Spacing ({{ theme.spacingXSmall }}px)</span>
                  </div>

                  <div class="spacing-demo"
                       [style.gap.px]="theme.spacingSmall">
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <span>S Spacing ({{ theme.spacingSmall }}px)</span>
                  </div>

                  <div class="spacing-demo"
                       [style.gap.px]="theme.spacingMedium">
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <span>M Spacing ({{ theme.spacingMedium }}px)</span>
                  </div>

                  <div class="spacing-demo"
                       [style.gap.px]="theme.spacingLarge">
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <div class="demo-box"></div>
                    <span>L Spacing ({{ theme.spacingLarge }}px)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .density-controls {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .control-group {
      h4 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }

      h5 {
        margin: 24px 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      h6 {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 600;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .density-presets {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .density-preset {
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.15);
        border-color: rgba(52, 197, 170, 0.5);
      }

      &.active {
        background: linear-gradient(135deg, rgba(52, 197, 170, 0.05) 0%, rgba(43, 169, 155, 0.05) 100%);
        border-color: #34C5AA;
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.2);
      }

      .preset-icon {
        font-size: 32px;
        color: #34C5AA;
        margin-bottom: 8px;
      }

      h5 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .preset-preview {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: stretch;

      .preview-button {
        background: #34C5AA;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-input {
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        background: #F9FAFB;
        color: #2F4858;
        outline: none;
      }

      .preview-card {
        background: #F9FAFB;
        border-radius: 8px;
        border: 1px solid #E5E7EB;

        .card-title {
          font-weight: 600;
          color: #2F4858;
        }

        .card-content {
          color: #6B7280;
          font-size: 12px;
          line-height: 1.4;
        }
      }
    }

    .custom-density {
      background: rgba(196, 247, 239, 0.1);
      border-radius: 16px;
      padding: 24px;
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

    .spacing-scale {
      margin: 24px 0;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .scale-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      text-align: center;

      @media (max-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .scale-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .scale-label {
        font-weight: 600;
        color: #6B7280;
        font-size: 12px;
      }

      .scale-box {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(52, 197, 170, 0.2);
      }

      .scale-value {
        font-size: 11px;
        color: #9CA3AF;
      }
    }

    .component-density {
      margin: 24px 0;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .density-preview {
      margin-top: 24px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .preview-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .preview-section {
      .preview-button {
        background: #34C5AA;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;

        mat-icon {
          font-size: 20px;
        }
      }

      .preview-input {
        width: 100%;
        border: 2px solid #E5E7EB;
        border-radius: 8px;
        background: white;
        color: #2F4858;
        outline: none;
        margin-bottom: 16px;
        transition: all 0.2s ease;

        &:focus {
          border-color: #34C5AA;
        }
      }

      .preview-card {
        background: #F9FAFB;
        border-radius: 12px;
        border: 1px solid #E5E7EB;

        h5 {
          font-size: 16px;
          font-weight: 600;
          color: #2F4858;
          margin: 0;
        }

        p {
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }

        .card-actions {
          display: flex;
          gap: 12px;

          .action-button {
            padding: 6px 12px;
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            color: #6B7280;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              border-color: #34C5AA;
              color: #34C5AA;
            }
          }
        }
      }
    }

    .spacing-example {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .spacing-demo {
      display: flex;
      align-items: center;

      .demo-box {
        width: 20px;
        height: 20px;
        background: #34C5AA;
        border-radius: 4px;
      }

      span {
        margin-left: 12px;
        font-size: 12px;
        color: #6B7280;
      }
    }
  `]
})
export class DensityControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  densityOptions: StyleOption[] = DENSITY_OPTIONS;

  densityPresets: DensityPreset[] = [
    {
      name: 'Comfortable',
      value: 'comfortable',
      spacing: 16,
      fontSize: 16,
      buttonHeight: 40,
      inputHeight: 44,
      cardPadding: 24,
      icon: 'spa'
    },
    {
      name: 'Compact',
      value: 'compact',
      spacing: 12,
      fontSize: 14,
      buttonHeight: 32,
      inputHeight: 36,
      cardPadding: 16,
      icon: 'view_comfy'
    },
    {
      name: 'Spacious',
      value: 'spacious',
      spacing: 24,
      fontSize: 18,
      buttonHeight: 48,
      inputHeight: 52,
      cardPadding: 32,
      icon: 'open_in_full'
    }
  ];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({[key]: value});
  }

  updateSpacing(value: number): void {
    // Update base spacing and calculate related spacing values
    const updates: Partial<ThemeConfig> = {
      spacingUnit: value,
      spacingXSmall: Math.round(value * 0.25),
      spacingSmall: Math.round(value * 0.5),
      spacingMedium: value,
      spacingLarge: Math.round(value * 1.5),
      spacingXLarge: Math.round(value * 2)
    };

    this.themeChange.emit(updates);
  }

  applyDensityPreset(preset: DensityPreset): void {
    const updates: Partial<ThemeConfig> = {
      density: preset.value,
      spacingUnit: preset.spacing,
      spacingXSmall: Math.round(preset.spacing * 0.25),
      spacingSmall: Math.round(preset.spacing * 0.5),
      spacingMedium: preset.spacing,
      spacingLarge: Math.round(preset.spacing * 1.5),
      spacingXLarge: Math.round(preset.spacing * 2),
      fontSizeBase: preset.fontSize,
      buttonHeight: preset.buttonHeight,
      buttonPaddingX: Math.round(preset.spacing * 1.5),
      buttonPaddingY: Math.round(preset.spacing * 0.75),
      inputHeight: preset.inputHeight,
      inputPaddingX: preset.spacing,
      inputPaddingY: Math.round(preset.spacing * 0.75),
      cardPadding: preset.cardPadding,
      modalPadding: Math.round(preset.cardPadding * 1.33)
    };

    this.themeChange.emit(updates);
  }
}
