// src/app/components/theme-controls/component-controls/component-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { ThemeConfig } from '../../../models/theme.model';

interface ComponentPreset {
  name: string;
  description: string;
  button: {
    height: number;
    paddingX: number;
    paddingY: number;
    fontSize: number;
    fontWeight: number;
    borderRadius: number;
  };
  input: {
    height: number;
    paddingX: number;
    paddingY: number;
    fontSize: number;
    borderRadius: number;
  };
  card: {
    padding: number;
    borderRadius: number;
    elevation: number;
  };
}

@Component({
  selector: 'app-component-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule
  ],
  template: `
    <div class="component-controls">
      <!-- Component Presets -->
      <div class="control-section">
        <h4>Component Style Presets</h4>
        <div class="component-presets">
          <div *ngFor="let preset of componentPresets"
               class="preset-card"
               [class.active]="isPresetActive(preset)"
               (click)="applyPreset(preset)">
            <h5>{{ preset.name }}</h5>
            <p>{{ preset.description }}</p>
            <div class="preset-preview">
              <button class="preview-btn"
                      [style.height.px]="preset.button.height"
                      [style.padding]="preset.button.paddingY + 'px ' + preset.button.paddingX + 'px'"
                      [style.font-size.px]="preset.button.fontSize"
                      [style.border-radius.px]="preset.button.borderRadius">
                Button
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Component Tabs -->
      <mat-tab-group animationDuration="300ms">
        <!-- Buttons Tab -->
        <mat-tab label="Buttons">
          <div class="tab-content">
            <div class="control-group">
              <h5>Button Dimensions</h5>

              <div class="control-item">
                <label>Height: {{ theme.buttonHeight }}px</label>
                <mat-slider [min]="28" [max]="56" [step]="2"
                           [value]="theme.buttonHeight"
                           (input)="updateProperty('buttonHeight', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="padding-controls">
                <div class="control-item">
                  <label>Padding X: {{ theme.buttonPaddingX }}px</label>
                  <mat-slider [min]="8" [max]="48" [step]="4"
                             [value]="theme.buttonPaddingX"
                             (input)="updateProperty('buttonPaddingX', $event.value)"
                             [discrete]="true">
                    <input matSliderThumb>
                  </mat-slider>
                </div>

                <div class="control-item">
                  <label>Padding Y: {{ theme.buttonPaddingY }}px</label>
                  <mat-slider [min]="4" [max]="24" [step]="2"
                             [value]="theme.buttonPaddingY"
                             (input)="updateProperty('buttonPaddingY', $event.value)"
                             [discrete]="true">
                    <input matSliderThumb>
                  </mat-slider>
                </div>
              </div>
            </div>

            <div class="control-group">
              <h5>Button Typography</h5>

              <div class="control-item">
                <label>Font Size: {{ theme.buttonFontSize }}px</label>
                <mat-slider [min]="12" [max]="20" [step]="1"
                           [value]="theme.buttonFontSize"
                           (input)="updateProperty('buttonFontSize', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Font Weight: {{ theme.buttonFontWeight }}</label>
                <mat-slider [min]="400" [max]="800" [step]="100"
                           [value]="theme.buttonFontWeight"
                           (input)="updateProperty('buttonFontWeight', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>
            </div>

            <div class="control-group">
              <h5>Button Style</h5>

              <div class="control-item">
                <label>Border Radius: {{ theme.buttonBorderRadius }}px</label>
                <mat-slider [min]="0" [max]="28" [step]="2"
                           [value]="theme.buttonBorderRadius"
                           (input)="updateProperty('buttonBorderRadius', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Button Style</label>
                <mat-select [(value)]="theme.buttonStyle"
                           (selectionChange)="updateProperty('buttonStyle', $event.value)">
                  <mat-option value="primary">Primary</mat-option>
                  <mat-option value="secondary">Secondary</mat-option>
                  <mat-option value="outline">Outline</mat-option>
                  <mat-option value="ghost">Ghost</mat-option>
                  <mat-option value="gradient">Gradient</mat-option>
                  <mat-option value="glow">Glow</mat-option>
                  <mat-option value="neumorphic">Neumorphic</mat-option>
                </mat-select>
              </div>
            </div>

            <!-- Button Preview -->
            <div class="component-preview">
              <h5>Button Preview</h5>
              <div class="button-showcase">
                <button class="preview-button primary"
                        [style.height.px]="theme.buttonHeight"
                        [style.padding]="theme.buttonPaddingY + 'px ' + theme.buttonPaddingX + 'px'"
                        [style.font-size.px]="theme.buttonFontSize"
                        [style.font-weight]="theme.buttonFontWeight"
                        [style.border-radius.px]="theme.buttonBorderRadius"
                        [style.background]="theme.enableGradients ? theme.primaryGradient : theme.primaryColor">
                  Primary Button
                </button>

                <button class="preview-button secondary"
                        [style.height.px]="theme.buttonHeight"
                        [style.padding]="theme.buttonPaddingY + 'px ' + theme.buttonPaddingX + 'px'"
                        [style.font-size.px]="theme.buttonFontSize"
                        [style.font-weight]="theme.buttonFontWeight"
                        [style.border-radius.px]="theme.buttonBorderRadius"
                        [style.background]="theme.secondaryColor">
                  Secondary
                </button>

                <button class="preview-button outline"
                        [style.height.px]="theme.buttonHeight"
                        [style.padding]="theme.buttonPaddingY + 'px ' + theme.buttonPaddingX + 'px'"
                        [style.font-size.px]="theme.buttonFontSize"
                        [style.font-weight]="theme.buttonFontWeight"
                        [style.border-radius.px]="theme.buttonBorderRadius"
                        [style.border]="'2px solid ' + theme.primaryColor"
                        [style.color]="theme.primaryColor">
                  Outline
                </button>

                <button class="preview-button ghost"
                        [style.height.px]="theme.buttonHeight"
                        [style.padding]="theme.buttonPaddingY + 'px ' + theme.buttonPaddingX + 'px'"
                        [style.font-size.px]="theme.buttonFontSize"
                        [style.font-weight]="theme.buttonFontWeight"
                        [style.border-radius.px]="theme.buttonBorderRadius"
                        [style.color]="theme.primaryColor">
                  Ghost
                </button>

                <button class="preview-button icon"
                        [style.width.px]="theme.buttonHeight"
                        [style.height.px]="theme.buttonHeight"
                        [style.border-radius.px]="theme.buttonBorderRadius"
                        [style.background]="theme.primaryColor">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Inputs Tab -->
        <mat-tab label="Inputs">
          <div class="tab-content">
            <div class="control-group">
              <h5>Input Dimensions</h5>

              <div class="control-item">
                <label>Height: {{ theme.inputHeight }}px</label>
                <mat-slider [min]="32" [max]="64" [step]="2"
                           [value]="theme.inputHeight"
                           (input)="updateProperty('inputHeight', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="padding-controls">
                <div class="control-item">
                  <label>Padding X: {{ theme.inputPaddingX }}px</label>
                  <mat-slider [min]="8" [max]="32" [step]="4"
                             [value]="theme.inputPaddingX"
                             (input)="updateProperty('inputPaddingX', $event.value)"
                             [discrete]="true">
                    <input matSliderThumb>
                  </mat-slider>
                </div>

                <div class="control-item">
                  <label>Padding Y: {{ theme.inputPaddingY }}px</label>
                  <mat-slider [min]="4" [max]="20" [step]="2"
                             [value]="theme.inputPaddingY"
                             (input)="updateProperty('inputPaddingY', $event.value)"
                             [discrete]="true">
                    <input matSliderThumb>
                  </mat-slider>
                </div>
              </div>
            </div>

            <div class="control-group">
              <h5>Input Style</h5>

              <div class="control-item">
                <label>Font Size: {{ theme.inputFontSize }}px</label>
                <mat-slider [min]="12" [max]="20" [step]="1"
                           [value]="theme.inputFontSize"
                           (input)="updateProperty('inputFontSize', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Border Radius: {{ theme.inputBorderRadius }}px</label>
                <mat-slider [min]="0" [max]="20" [step]="2"
                           [value]="theme.inputBorderRadius"
                           (input)="updateProperty('inputBorderRadius', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>
            </div>

            <!-- Input Preview -->
            <div class="component-preview">
              <h5>Input Preview</h5>
              <div class="input-showcase">
                <input type="text"
                       placeholder="Text input"
                       class="preview-input"
                       [style.height.px]="theme.inputHeight"
                       [style.padding]="theme.inputPaddingY + 'px ' + theme.inputPaddingX + 'px'"
                       [style.font-size.px]="theme.inputFontSize"
                       [style.border-radius.px]="theme.inputBorderRadius"
                       [style.border]="'2px solid ' + theme.borderColor" />

                <div class="input-with-icon">
                  <mat-icon class="input-icon">search</mat-icon>
                  <input type="text"
                         placeholder="Search..."
                         class="preview-input with-icon"
                         [style.height.px]="theme.inputHeight"
                         [style.padding]="theme.inputPaddingY + 'px ' + theme.inputPaddingX + 'px'"
                         [style.padding-left.px]="theme.inputPaddingX + 32"
                         [style.font-size.px]="theme.inputFontSize"
                         [style.border-radius.px]="theme.inputBorderRadius"
                         [style.border]="'2px solid ' + theme.borderColor" />
                </div>

                <textarea placeholder="Textarea"
                          rows="3"
                          class="preview-textarea"
                          [style.padding]="theme.inputPaddingY + 'px ' + theme.inputPaddingX + 'px'"
                          [style.font-size.px]="theme.inputFontSize"
                          [style.border-radius.px]="theme.inputBorderRadius"
                          [style.border]="'2px solid ' + theme.borderColor"></textarea>

                <select class="preview-select"
                        [style.height.px]="theme.inputHeight"
                        [style.padding]="theme.inputPaddingY + 'px ' + theme.inputPaddingX + 'px'"
                        [style.font-size.px]="theme.inputFontSize"
                        [style.border-radius.px]="theme.inputBorderRadius"
                        [style.border]="'2px solid ' + theme.borderColor">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Cards Tab -->
        <mat-tab label="Cards">
          <div class="tab-content">
            <div class="control-group">
              <h5>Card Properties</h5>

              <div class="control-item">
                <label>Padding: {{ theme.cardPadding }}px</label>
                <mat-slider [min]="8" [max]="48" [step]="4"
                           [value]="theme.cardPadding"
                           (input)="updateProperty('cardPadding', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Border Radius: {{ theme.cardBorderRadius }}px</label>
                <mat-slider [min]="0" [max]="32" [step]="4"
                           [value]="theme.cardBorderRadius"
                           (input)="updateProperty('cardBorderRadius', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Elevation: {{ theme.cardElevation }}</label>
                <mat-slider [min]="0" [max]="24" [step]="1"
                           [value]="theme.cardElevation"
                           (input)="updateProperty('cardElevation', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Card Style</label>
                <mat-select [(value)]="theme.cardStyle"
                           (selectionChange)="updateProperty('cardStyle', $event.value)">
                  <mat-option value="elevated">Elevated</mat-option>
                  <mat-option value="flat">Flat</mat-option>
                  <mat-option value="bordered">Bordered</mat-option>
                  <mat-option value="glass">Glass</mat-option>
                  <mat-option value="gradient">Gradient</mat-option>
                  <mat-option value="neumorphic">Neumorphic</mat-option>
                </mat-select>
              </div>
            </div>

            <!-- Card Preview -->
            <div class="component-preview">
              <h5>Card Preview</h5>
              <div class="card-showcase">
                <div class="preview-card"
                     [style.padding.px]="theme.cardPadding"
                     [style.border-radius.px]="theme.cardBorderRadius"
                     [style.box-shadow]="getCardShadow()"
                     [style.background]="theme.surfaceCard"
                     [style.border]="theme.cardStyle === 'bordered' ? '2px solid ' + theme.borderColor : 'none'"
                     [class.glass-effect]="theme.cardStyle === 'glass'"
                     [class.gradient-bg]="theme.cardStyle === 'gradient'">
                  <h3>Card Title</h3>
                  <p>This is a sample card demonstrating the current card styling settings.</p>
                  <div class="card-actions">
                    <button class="card-button">Action</button>
                    <button class="card-button secondary">Cancel</button>
                  </div>
                </div>

                <div class="preview-card compact"
                     [style.padding.px]="theme.cardPadding * 0.75"
                     [style.border-radius.px]="theme.cardBorderRadius"
                     [style.box-shadow]="getCardShadow()"
                     [style.background]="theme.surfaceCard">
                  <div class="card-header">
                    <mat-icon>dashboard</mat-icon>
                    <span>Compact Card</span>
                  </div>
                  <p>Smaller card variant</p>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Modals Tab -->
        <mat-tab label="Modals">
          <div class="tab-content">
            <div class="control-group">
              <h5>Modal Properties</h5>

              <div class="control-item">
                <label>Border Radius: {{ theme.modalBorderRadius }}px</label>
                <mat-slider [min]="0" [max]="32" [step]="4"
                           [value]="theme.modalBorderRadius"
                           (input)="updateProperty('modalBorderRadius', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Padding: {{ theme.modalPadding }}px</label>
                <mat-slider [min]="16" [max]="64" [step]="4"
                           [value]="theme.modalPadding"
                           (input)="updateProperty('modalPadding', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>
            </div>

            <!-- Modal Preview -->
            <div class="component-preview">
              <h5>Modal Preview</h5>
              <div class="modal-showcase">
                <div class="preview-modal"
                     [style.border-radius.px]="theme.modalBorderRadius"
                     [style.padding.px]="theme.modalPadding"
                     [style.background]="theme.surfaceModal">
                  <div class="modal-header">
                    <h3>Modal Title</h3>
                    <button class="modal-close">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="modal-content">
                    <p>This is a modal dialog preview showing the current modal styling.</p>
                  </div>
                  <div class="modal-footer">
                    <button class="modal-button">Cancel</button>
                    <button class="modal-button primary">Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Other Components Tab -->
        <mat-tab label="Other">
          <div class="tab-content">
            <div class="control-group">
              <h5>Tooltip Settings</h5>

              <div class="control-item">
                <label>Font Size: {{ theme.tooltipFontSize }}px</label>
                <mat-slider [min]="10" [max]="16" [step]="1"
                           [value]="theme.tooltipFontSize"
                           (input)="updateProperty('tooltipFontSize', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Padding: {{ theme.tooltipPadding }}px</label>
                <mat-slider [min]="4" [max]="16" [step]="2"
                           [value]="theme.tooltipPadding"
                           (input)="updateProperty('tooltipPadding', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>

              <div class="control-item">
                <label>Border Radius: {{ theme.tooltipBorderRadius }}px</label>
                <mat-slider [min]="0" [max]="12" [step]="2"
                           [value]="theme.tooltipBorderRadius"
                           (input)="updateProperty('tooltipBorderRadius', $event.value)"
                           [discrete]="true">
                  <input matSliderThumb>
                </mat-slider>
              </div>
            </div>

            <div class="control-group">
              <h5>Icon Style</h5>

              <mat-select [(value)]="theme.iconStyle"
                         (selectionChange)="updateProperty('iconStyle', $event.value)">
                <mat-option value="outlined">Outlined</mat-option>
                <mat-option value="filled">Filled</mat-option>
                <mat-option value="rounded">Rounded</mat-option>
                <mat-option value="sharp">Sharp</mat-option>
                <mat-option value="two-tone">Two Tone</mat-option>
              </mat-select>
            </div>

            <!-- Other Components Preview -->
            <div class="component-preview">
              <h5>Component Preview</h5>

              <div class="tooltip-preview">
                <div class="tooltip-trigger">
                  Hover for tooltip
                  <div class="preview-tooltip"
                       [style.font-size.px]="theme.tooltipFontSize"
                       [style.padding.px]="theme.tooltipPadding"
                       [style.border-radius.px]="theme.tooltipBorderRadius">
                    This is a tooltip
                  </div>
                </div>
              </div>

              <div class="icon-showcase">
                <mat-icon [class]="'icon-' + theme.iconStyle">home</mat-icon>
                <mat-icon [class]="'icon-' + theme.iconStyle">favorite</mat-icon>
                <mat-icon [class]="'icon-' + theme.iconStyle">settings</mat-icon>
                <mat-icon [class]="'icon-' + theme.iconStyle">search</mat-icon>
                <mat-icon [class]="'icon-' + theme.iconStyle">shopping_cart</mat-icon>
              </div>

              <div class="badge-showcase">
                <span class="badge primary">Primary</span>
                <span class="badge success">Success</span>
                <span class="badge warning">Warning</span>
                <span class="badge error">Error</span>
                <span class="badge info">Info</span>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .component-controls {
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

    .component-presets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .preset-card {
      padding: 20px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.15);
      }

      &.active {
        border-color: #34C5AA;
        background: rgba(196, 247, 239, 0.2);
      }

      h5 {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      p {
        margin: 0 0 16px;
        font-size: 13px;
        color: #6B7280;
      }

      .preset-preview {
        display: flex;
        justify-content: center;

        .preview-btn {
          background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .control-group {
      margin-bottom: 32px;

      h5 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .control-item {
      margin-bottom: 20px;

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

    .padding-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .component-preview {
      margin-top: 32px;
      padding: 24px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 16px;

      h5 {
        margin: 0 0 20px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    // Button Showcase
    .button-showcase {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;

      .preview-button {
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &.primary {
          color: white;
          box-shadow: 0 2px 8px rgba(52, 197, 170, 0.25);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(52, 197, 170, 0.35);
          }
        }

        &.secondary {
          color: white;
        }

        &.outline {
          background: transparent;
        }

        &.ghost {
          background: transparent;
          border: none;

          &:hover {
            background: rgba(52, 197, 170, 0.1);
          }
        }

        &.icon {
          padding: 0;
          color: white;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    // Input Showcase
    .input-showcase {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;

      .preview-input,
      .preview-textarea,
      .preview-select {
        width: 100%;
        background: white;
        font-family: inherit;
        transition: all 0.3s ease;
        outline: none;

        &:focus {
          border-color: var(--color-primary, #34C5AA) !important;
          box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
        }

        &::placeholder {
          color: #9CA3AF;
        }
      }

      .preview-textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
      }

      .preview-select {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 12px center;
        background-repeat: no-repeat;
        background-size: 20px;
        padding-right: 40px !important;
      }

      .input-with-icon {
        position: relative;

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6B7280;
          pointer-events: none;
        }
      }
    }

    // Card Showcase
    .card-showcase {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .preview-card {
        transition: all 0.3s ease;

        &.glass-effect {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        &.gradient-bg {
          background: linear-gradient(135deg, rgba(52, 197, 170, 0.1) 0%, rgba(43, 169, 155, 0.1) 100%) !important;
        }

        h3 {
          margin: 0 0 12px;
          font-size: 18px;
          font-weight: 600;
          color: #2F4858;
        }

        p {
          margin: 0 0 16px;
          color: #6B7280;
          line-height: 1.5;
        }

        .card-actions {
          display: flex;
          gap: 12px;

          .card-button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #34C5AA;
            color: white;

            &.secondary {
              background: transparent;
              color: #6B7280;
              border: 1px solid #E5E7EB;
            }
          }
        }

        &.compact {
          .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;

            mat-icon {
              color: #34C5AA;
            }

            span {
              font-weight: 600;
              color: #2F4858;
            }
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }
      }
    }

    // Modal Showcase
    .modal-showcase {
      max-width: 500px;
      margin: 0 auto;

      .preview-modal {
        background: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #2F4858;
          }

          .modal-close {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #6B7280;
            transition: all 0.3s ease;

            &:hover {
              color: #2F4858;
            }
          }
        }

        .modal-content {
          margin-bottom: 24px;

          p {
            margin: 0;
            color: #6B7280;
            line-height: 1.5;
          }
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;

          .modal-button {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #E5E7EB;
            color: #4B5563;

            &.primary {
              background: #34C5AA;
              color: white;
            }
          }
        }
      }
    }

    // Tooltip Preview
    .tooltip-preview {
      margin-bottom: 32px;

      .tooltip-trigger {
        display: inline-block;
        position: relative;
        padding: 10px 20px;
        background: white;
        border: 2px solid #34C5AA;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        color: #2F4858;

        &:hover .preview-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .preview-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(5px);
          background: #2F4858;
          color: white;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          margin-bottom: 8px;

          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: #2F4858;
          }
        }
      }
    }

    // Icon Showcase
    .icon-showcase {
      display: flex;
      gap: 20px;
      margin-bottom: 32px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #34C5AA;
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
          color: #2BA99B;
        }

        &.icon-filled {
          font-variation-settings: 'FILL' 1;
        }

        &.icon-rounded {
          font-family: 'Material Icons Round';
        }

        &.icon-sharp {
          font-family: 'Material Icons Sharp';
        }

        &.icon-two-tone {
          font-family: 'Material Icons Two Tone';
        }
      }
    }

    // Badge Showcase
    .badge-showcase {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &.primary {
          background: rgba(52, 197, 170, 0.2);
          color: #2BA99B;
        }

        &.success {
          background: rgba(34, 197, 94, 0.2);
          color: #16A34A;
        }

        &.warning {
          background: rgba(245, 158, 11, 0.2);
          color: #D97706;
        }

        &.error {
          background: rgba(239, 68, 68, 0.2);
          color: #DC2626;
        }

        &.info {
          background: rgba(59, 130, 246, 0.2);
          color: #2563EB;
        }
      }
    }

    ::ng-deep {
      .mat-mdc-tab-labels {
        background: rgba(196, 247, 239, 0.2);
        border-radius: 12px;
        padding: 4px;
      }

      .mat-mdc-tab-label-active {
        background: white;
        border-radius: 8px;
      }
    }
  `]
})
export class ComponentControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  componentPresets: ComponentPreset[] = [
    {
      name: 'Compact',
      description: 'Space-efficient design',
      button: {
        height: 32,
        paddingX: 16,
        paddingY: 8,
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 6
      },
      input: {
        height: 36,
        paddingX: 12,
        paddingY: 8,
        fontSize: 14,
        borderRadius: 6
      },
      card: {
        padding: 16,
        borderRadius: 8,
        elevation: 1
      }
    },
    {
      name: 'Comfortable',
      description: 'Balanced spacing',
      button: {
        height: 40,
        paddingX: 24,
        paddingY: 12,
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 10
      },
      input: {
        height: 44,
        paddingX: 16,
        paddingY: 12,
        fontSize: 16,
        borderRadius: 10
      },
      card: {
        padding: 24,
        borderRadius: 16,
        elevation: 1
      }
    },
    {
      name: 'Spacious',
      description: 'Generous whitespace',
      button: {
        height: 48,
        paddingX: 32,
        paddingY: 16,
        fontSize: 16,
        fontWeight: 600,
        borderRadius: 12
      },
      input: {
        height: 52,
        paddingX: 20,
        paddingY: 16,
        fontSize: 16,
        borderRadius: 12
      },
      card: {
        padding: 32,
        borderRadius: 20,
        elevation: 2
      }
    },
    {
      name: 'Modern',
      description: 'Contemporary style',
      button: {
        height: 44,
        paddingX: 28,
        paddingY: 12,
        fontSize: 15,
        fontWeight: 700,
        borderRadius: 8
      },
      input: {
        height: 48,
        paddingX: 18,
        paddingY: 14,
        fontSize: 16,
        borderRadius: 8
      },
      card: {
        padding: 28,
        borderRadius: 12,
        elevation: 0
      }
    }
  ];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  isPresetActive(preset: ComponentPreset): boolean {
    return this.theme.buttonHeight === preset.button.height &&
      this.theme.buttonPaddingX === preset.button.paddingX &&
      this.theme.inputHeight === preset.input.height &&
      this.theme.cardPadding === preset.card.padding;
  }

  applyPreset(preset: ComponentPreset): void {
    this.themeChange.emit({
      buttonHeight: preset.button.height,
      buttonPaddingX: preset.button.paddingX,
      buttonPaddingY: preset.button.paddingY,
      buttonFontSize: preset.button.fontSize,
      buttonFontWeight: preset.button.fontWeight,
      buttonBorderRadius: preset.button.borderRadius,
      inputHeight: preset.input.height,
      inputPaddingX: preset.input.paddingX,
      inputPaddingY: preset.input.paddingY,
      inputFontSize: preset.input.fontSize,
      inputBorderRadius: preset.input.borderRadius,
      cardPadding: preset.card.padding,
      cardBorderRadius: preset.card.borderRadius,
      cardElevation: preset.card.elevation
    });
  }

  getCardShadow(): string {
    if (!this.theme.enableShadows || this.theme.cardElevation === 0) {
      return 'none';
    }

    const elevation = this.theme.cardElevation;
    const intensity = this.theme.shadowIntensity;

    const umbra = `0 ${elevation * 0.5}px ${elevation * 1}px rgba(0, 0, 0, ${intensity * 0.2})`;
    const penumbra = `0 ${elevation * 0.3}px ${elevation * 0.8}px rgba(0, 0, 0, ${intensity * 0.14})`;
    const ambient = `0 ${elevation * 0.2}px ${elevation * 0.5}px rgba(0, 0, 0, ${intensity * 0.12})`;

    return `${umbra}, ${penumbra}, ${ambient}`;
  }
}
