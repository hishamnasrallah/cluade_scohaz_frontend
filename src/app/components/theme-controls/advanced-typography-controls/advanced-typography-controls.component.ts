// src/app/components/theme-controls/advanced-typography-controls/advanced-typography-controls.component.ts
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

interface FontPreset {
  name: string;
  body: string;
  heading: string;
  description: string;
}

interface TypeScale {
  name: string;
  base: number;
  ratio: number;
  sizes: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

@Component({
  selector: 'app-advanced-typography-controls',
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
    <div class="advanced-typography-controls">
      <!-- Font Presets -->
      <div class="control-section">
        <h4>Font Combinations</h4>
        <div class="font-presets">
          <div *ngFor="let preset of fontPresets"
               class="preset-card"
               [class.active]="isFontPresetActive(preset)"
               (click)="applyFontPreset(preset)">
            <div class="preset-preview">
              <h5 [style.font-family]="preset.heading">Heading</h5>
              <p [style.font-family]="preset.body">Body text example</p>
            </div>
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-desc">{{ preset.description }}</span>
          </div>
        </div>
      </div>

      <!-- Typography Tabs -->
      <mat-tab-group animationDuration="300ms">
        <!-- Body Text Tab -->
        <mat-tab label="Body Text">
          <div class="tab-content">
            <!-- Font Family -->
            <div class="control-group">
              <label>Font Family</label>
              <mat-form-field appearance="outline">
                <mat-label>Select font</mat-label>
                <mat-select [ngModel]="theme.fontFamily"
                            (ngModelChange)="updateProperty('fontFamily', $event)">
                  <mat-option *ngFor="let font of fontFamilies" [value]="font.value">
                    <span [style.font-family]="font.value">{{ font.label }}</span>
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <input type="text"
                     [ngModel]="theme.fontFamily"
                     (ngModelChange)="updateProperty('fontFamily', $event)"
                     placeholder="Custom font family"
                     class="custom-font-input" />
            </div>

            <!-- Font Sizes -->
            <div class="control-group">
              <label>Font Sizes</label>

              <div class="size-control">
                <span class="size-label">Base: {{ theme.fontSizeBase }}px</span>
                <mat-slider [min]="10" [max]="24" [step]="1" [discrete]="true">
                  <input matSliderThumb
                         [value]="theme.fontSizeBase"
                         (valueChange)="updateProperty('fontSizeBase', $event)">
                </mat-slider>
              </div>

              <div class="size-control">
                <span class="size-label">Small: {{ theme.fontSizeSmall }}px</span>
                <mat-slider [min]="10" [max]="20" [step]="1" [discrete]="true">
                  <input matSliderThumb
                         [value]="theme.fontSizeSmall"
                         (valueChange)="updateProperty('fontSizeSmall', $event)">
                </mat-slider>
              </div>

              <div class="size-control">
                <span class="size-label">Medium: {{ theme.fontSizeMedium }}px</span>
                <mat-slider [min]="12" [max]="24" [step]="1" [discrete]="true">
                  <input matSliderThumb
                         [value]="theme.fontSizeMedium"
                         (valueChange)="updateProperty('fontSizeMedium', $event)">
                </mat-slider>
              </div>

              <div class="size-control">
                <span class="size-label">Large: {{ theme.fontSizeLarge }}px</span>
                <mat-slider [min]="14" [max]="28" [step]="1" [discrete]="true">
                  <input matSliderThumb
                         [value]="theme.fontSizeLarge"
                         (valueChange)="updateProperty('fontSizeLarge', $event)">
                </mat-slider>
              </div>

              <div class="size-control">
                <span class="size-label">X-Large: {{ theme.fontSizeXLarge }}px</span>
                <mat-slider [min]="16" [max]="32" [step]="1" [discrete]="true">
                  <input matSliderThumb
                         [value]="theme.fontSizeXLarge"
                         (valueChange)="updateProperty('fontSizeXLarge', $event)">
                </mat-slider>
              </div>
            </div>

            <!-- Font Weights -->
            <div class="control-group">
              <label>Font Weights</label>

              <div class="weight-controls">
                <div class="weight-control">
                  <span>Regular</span>
                  <mat-select [ngModel]="theme.fontWeight"
                              (ngModelChange)="updateProperty('fontWeight', $event)">
                    <mat-option *ngFor="let weight of fontWeights" [value]="weight.value">
                      <span [style.font-weight]="weight.value">{{ weight.label }}</span>
                    </mat-option>
                  </mat-select>
                </div>

                <div class="weight-control">
                  <span>Light</span>
                  <mat-select [ngModel]="theme.fontWeightLight"
                              (ngModelChange)="updateProperty('fontWeightLight', $event)">
                    <mat-option *ngFor="let weight of fontWeights" [value]="weight.value">
                      <span [style.font-weight]="weight.value">{{ weight.label }}</span>
                    </mat-option>
                  </mat-select>
                </div>

                <div class="weight-control">
                  <span>Medium</span>
                  <mat-select [ngModel]="theme.fontWeightMedium"
                              (ngModelChange)="updateProperty('fontWeightMedium', $event)">
                    <mat-option *ngFor="let weight of fontWeights" [value]="weight.value">
                      <span [style.font-weight]="weight.value">{{ weight.label }}</span>
                    </mat-option>
                  </mat-select>
                </div>

                <div class="weight-control">
                  <span>Bold</span>
                  <mat-select [ngModel]="theme.fontWeightBold"
                              (ngModelChange)="updateProperty('fontWeightBold', $event)">
                    <mat-option *ngFor="let weight of fontWeights" [value]="weight.value">
                      <span [style.font-weight]="weight.value">{{ weight.label }}</span>
                    </mat-option>
                  </mat-select>
                </div>
              </div>
            </div>

            <!-- Line Height -->
            <div class="control-group">
              <label>Line Heights</label>

              <div class="line-height-controls">
                <div class="control-item">
                  <span>Normal: {{ theme.lineHeight }}</span>
                  <mat-slider [min]="1" [max]="2.5" [step]="0.05" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.lineHeight"
                           (valueChange)="updateProperty('lineHeight', $event)">
                  </mat-slider>
                </div>

                <div class="control-item">
                  <span>Tight: {{ theme.lineHeightTight }}</span>
                  <mat-slider [min]="1" [max]="2" [step]="0.05" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.lineHeightTight"
                           (valueChange)="updateProperty('lineHeightTight', $event)">
                  </mat-slider>
                </div>

                <div class="control-item">
                  <span>Relaxed: {{ theme.lineHeightRelaxed }}</span>
                  <mat-slider [min]="1.2" [max]="3" [step]="0.05" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.lineHeightRelaxed"
                           (valueChange)="updateProperty('lineHeightRelaxed', $event)">
                  </mat-slider>
                </div>
              </div>
            </div>

            <!-- Letter Spacing -->
            <div class="control-group">
              <label>Letter Spacing</label>

              <div class="letter-spacing-controls">
                <div class="control-item">
                  <span>Normal: {{ theme.letterSpacing }}em</span>
                  <mat-slider [min]="-0.1" [max]="0.2" [step]="0.005" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.letterSpacing"
                           (valueChange)="updateProperty('letterSpacing', $event)">
                  </mat-slider>
                </div>

                <div class="control-item">
                  <span>Tight: {{ theme.letterSpacingTight }}em</span>
                  <mat-slider [min]="-0.1" [max]="0.1" [step]="0.005" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.letterSpacingTight"
                           (valueChange)="updateProperty('letterSpacingTight', $event)">
                  </mat-slider>
                </div>

                <div class="control-item">
                  <span>Wide: {{ theme.letterSpacingWide }}em</span>
                  <mat-slider [min]="-0.05" [max]="0.3" [step]="0.005" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.letterSpacingWide"
                           (valueChange)="updateProperty('letterSpacingWide', $event)">
                  </mat-slider>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Headings Tab -->
        <mat-tab label="Headings">
          <div class="tab-content">
            <!-- Heading Font -->
            <div class="control-group">
              <label>Heading Font Family</label>
              <mat-form-field appearance="outline">
                <mat-label>Select font</mat-label>
                <mat-select [ngModel]="theme.headingFontFamily"
                            (ngModelChange)="updateProperty('headingFontFamily', $event)">
                  <mat-option *ngFor="let font of headingFonts" [value]="font.value">
                    <span [style.font-family]="font.value">{{ font.label }}</span>
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Heading Font Weight -->
            <div class="control-group">
              <label>Heading Weight: {{ theme.headingFontWeight }}</label>
              <mat-slider [min]="100" [max]="900" [step]="100" [discrete]="true">
                <input matSliderThumb
                       [value]="theme.headingFontWeight"
                       (valueChange)="updateProperty('headingFontWeight', $event)">
              </mat-slider>
            </div>

            <!-- Heading Sizes -->
            <div class="control-group">
              <label>Heading Sizes</label>

              <div class="heading-sizes">
                <div class="heading-control">
                  <span>H1: {{ theme.h1Size }}px</span>
                  <mat-slider [min]="24" [max]="72" [step]="2" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h1Size"
                           (valueChange)="updateProperty('h1Size', $event)">
                  </mat-slider>
                  <h1 class="preview-heading"
                      [style.font-size.px]="theme.h1Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 1
                  </h1>
                </div>

                <div class="heading-control">
                  <span>H2: {{ theme.h2Size }}px</span>
                  <mat-slider [min]="20" [max]="56" [step]="2" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h2Size"
                           (valueChange)="updateProperty('h2Size', $event)">
                  </mat-slider>
                  <h2 class="preview-heading"
                      [style.font-size.px]="theme.h2Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 2
                  </h2>
                </div>

                <div class="heading-control">
                  <span>H3: {{ theme.h3Size }}px</span>
                  <mat-slider [min]="18" [max]="48" [step]="2" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h3Size"
                           (valueChange)="updateProperty('h3Size', $event)">
                  </mat-slider>
                  <h3 class="preview-heading"
                      [style.font-size.px]="theme.h3Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 3
                  </h3>
                </div>

                <div class="heading-control">
                  <span>H4: {{ theme.h4Size }}px</span>
                  <mat-slider [min]="16" [max]="36" [step]="1" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h4Size"
                           (valueChange)="updateProperty('h4Size', $event)">
                  </mat-slider>
                  <h4 class="preview-heading"
                      [style.font-size.px]="theme.h4Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 4
                  </h4>
                </div>

                <div class="heading-control">
                  <span>H5: {{ theme.h5Size }}px</span>
                  <mat-slider [min]="14" [max]="28" [step]="1" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h5Size"
                           (valueChange)="updateProperty('h5Size', $event)">
                  </mat-slider>
                  <h5 class="preview-heading"
                      [style.font-size.px]="theme.h5Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 5
                  </h5>
                </div>

                <div class="heading-control">
                  <span>H6: {{ theme.h6Size }}px</span>
                  <mat-slider [min]="12" [max]="24" [step]="1" [discrete]="true">
                    <input matSliderThumb
                           [value]="theme.h6Size"
                           (valueChange)="updateProperty('h6Size', $event)">
                  </mat-slider>
                  <h6 class="preview-heading"
                      [style.font-size.px]="theme.h6Size * theme.textScaling"
                      [style.font-family]="theme.headingFontFamily"
                      [style.font-weight]="theme.headingFontWeight">
                    Heading Level 6
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Type Scale Tab -->
        <mat-tab label="Type Scale">
          <div class="tab-content">
            <div class="control-group">
              <label>Type Scale Presets</label>
              <div class="type-scale-presets">
                <div *ngFor="let scale of typeScales"
                     class="scale-preset"
                     [class.active]="isScaleActive(scale)"
                     (click)="applyTypeScale(scale)">
                  <h5>{{ scale.name }}</h5>
                  <div class="scale-preview">
                    <span [style.font-size.px]="scale.sizes.small">Aa</span>
                    <span [style.font-size.px]="scale.base">Aa</span>
                    <span [style.font-size.px]="scale.sizes.large">Aa</span>
                  </div>
                  <span class="scale-ratio">Ratio: {{ scale.ratio }}</span>
                </div>
              </div>
            </div>

            <!-- Text Scaling -->
            <div class="control-group">
              <label>Text Scaling: {{ (theme.textScaling * 100).toFixed(0) }}%</label>
              <mat-slider [min]="0.8" [max]="1.5" [step]="0.05" [discrete]="true">
                <input matSliderThumb
                       [value]="theme.textScaling"
                       (valueChange)="updateProperty('textScaling', $event)">
              </mat-slider>
              <p class="scaling-note">Adjusts all font sizes proportionally for accessibility</p>

              <!-- Text Scaling Preview -->
              <div class="scaling-preview">
                <div class="scaling-example">
                  <span>80%</span>
                  <p [style.font-size.px]="16 * 0.8">Sample text at 80% scale</p>
                </div>
                <div class="scaling-example">
                  <span>100%</span>
                  <p [style.font-size.px]="16">Sample text at 100% scale</p>
                </div>
                <div class="scaling-example">
                  <span>120%</span>
                  <p [style.font-size.px]="16 * 1.2">Sample text at 120% scale</p>
                </div>
                <div class="scaling-example active">
                  <span>Current ({{ (theme.textScaling * 100).toFixed(0) }}%)</span>
                  <p [style.font-size.px]="16 * theme.textScaling">Sample text at current scale</p>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Preview Tab -->
        <mat-tab label="Preview">
          <div class="tab-content">
            <div class="typography-preview"
                 [style.font-family]="theme.fontFamily"
                 [style.font-size.px]="theme.fontSizeBase * theme.textScaling">

              <div class="preview-section">
                <h1 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h1Size * theme.textScaling">
                  The quick brown fox jumps over the lazy dog
                </h1>

                <h2 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h2Size * theme.textScaling">
                  Pack my box with five dozen liquor jugs
                </h2>

                <h3 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h3Size * theme.textScaling">
                  How vexingly quick daft zebras jump
                </h3>

                <h4 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h4Size * theme.textScaling">
                  Sphinx of black quartz, judge my vow
                </h4>

                <h5 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h5Size * theme.textScaling">
                  Two driven jocks help fax my big quiz
                </h5>

                <h6 [style.font-family]="theme.headingFontFamily"
                    [style.font-weight]="theme.headingFontWeight"
                    [style.font-size.px]="theme.h6Size * theme.textScaling">
                  Five quacking zephyrs jolt my wax bed
                </h6>

                <p [style.line-height]="theme.lineHeight"
                   [style.letter-spacing.em]="theme.letterSpacing"
                   [style.font-weight]="theme.fontWeight">
                  This is a paragraph of body text demonstrating the selected typography settings.
                  The font family, size, weight, line height, and letter spacing all work together
                  to create readable and aesthetically pleasing content.
                </p>

                <p [style.font-size.px]="theme.fontSizeSmall * theme.textScaling"
                   [style.line-height]="theme.lineHeightTight"
                   [style.letter-spacing.em]="theme.letterSpacingTight"
                   [style.font-weight]="theme.fontWeightLight">
                  Small text with tight spacing for captions and labels. Light weight variant.
                </p>

                <p [style.font-size.px]="theme.fontSizeMedium * theme.textScaling"
                   [style.line-height]="theme.lineHeight"
                   [style.letter-spacing.em]="theme.letterSpacing"
                   [style.font-weight]="theme.fontWeightMedium">
                  Medium text with normal spacing for standard content. Medium weight variant.
                </p>

                <p [style.font-size.px]="theme.fontSizeLarge * theme.textScaling"
                   [style.line-height]="theme.lineHeightRelaxed"
                   [style.letter-spacing.em]="theme.letterSpacingWide"
                   [style.font-weight]="theme.fontWeightBold">
                  Large text with relaxed spacing for emphasis and readability. Bold weight variant.
                </p>

                <p [style.font-size.px]="theme.fontSizeXLarge * theme.textScaling"
                   [style.line-height]="theme.lineHeightRelaxed"
                   [style.letter-spacing.em]="theme.letterSpacingWide"
                   [style.font-weight]="theme.fontWeightBold">
                  Extra large text for maximum impact and visibility. Perfect for hero sections.
                </p>

                <div class="weight-samples">
                  <span [style.font-weight]="theme.fontWeightLight">Light Weight ({{ theme.fontWeightLight }})</span>
                  <span [style.font-weight]="theme.fontWeight">Regular Weight ({{ theme.fontWeight }})</span>
                  <span [style.font-weight]="theme.fontWeightMedium">Medium Weight ({{ theme.fontWeightMedium }})</span>
                  <span [style.font-weight]="theme.fontWeightBold">Bold Weight ({{ theme.fontWeightBold }})</span>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .advanced-typography-controls {
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

    .font-presets {
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

      .preset-preview {
        margin-bottom: 12px;

        h5 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #2F4858;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #6B7280;
          line-height: 1.5;
        }
      }

      .preset-name {
        display: block;
        font-weight: 600;
        color: #2F4858;
        margin-bottom: 4px;
      }

      .preset-desc {
        display: block;
        font-size: 12px;
        color: #6B7280;
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .control-group {
      margin-bottom: 32px;

      label {
        display: block;
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .custom-font-input {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      font-size: 14px;
      background-color: white;
      color: #2F4858;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }
    }

    .size-control,
    .control-item {
      margin-bottom: 20px;

      .size-label,
      span {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      mat-slider {
        width: 100%;
      }
    }

    .weight-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;

      .weight-control {
        span {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        mat-select {
          width: 100%;
        }
      }
    }

    .line-height-controls,
    .letter-spacing-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .heading-sizes {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .heading-control {
      span {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      mat-slider {
        width: 100%;
        margin-bottom: 12px;
      }

      .preview-heading {
        margin: 0;
        color: #2F4858;
        line-height: 1.2;
      }
    }

    .type-scale-presets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .scale-preset {
      padding: 16px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      text-align: center;
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
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .scale-preview {
        display: flex;
        justify-content: center;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;

        span {
          font-weight: 600;
          color: #34C5AA;
        }
      }

      .scale-ratio {
        font-size: 12px;
        color: #6B7280;
      }
    }

    .scaling-note {
      margin-top: 8px;
      font-size: 13px;
      color: #6B7280;
      font-style: italic;
    }

    .scaling-preview {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;

      .scaling-example {
        padding: 16px;
        background: rgba(196, 247, 239, 0.1);
        border-radius: 8px;
        text-align: center;
        border: 2px solid transparent;
        transition: all 0.3s ease;

        &.active {
          border-color: #34C5AA;
          background: rgba(196, 247, 239, 0.3);
        }

        span {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #34C5AA;
          margin-bottom: 8px;
        }

        p {
          margin: 0;
          color: #2F4858;
          line-height: 1.5;
        }
      }
    }

    .typography-preview {
      padding: 32px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 16px;
    }

    .preview-section {
      h1, h2, h3, h4, h5, h6 {
        margin: 0 0 16px;
        color: #2F4858;
      }

      p {
        margin: 0 0 20px;
        color: #4B5563;
      }

      .weight-samples {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        margin-top: 24px;

        span {
          color: #2F4858;
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
export class AdvancedTypographyControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  fontPresets: FontPreset[] = [
    {
      name: 'Modern & Clean',
      body: 'Inter, system-ui, sans-serif',
      heading: 'Poppins, sans-serif',
      description: 'Perfect for tech and SaaS'
    },
    {
      name: 'Professional',
      body: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
      description: 'Native system fonts'
    },
    {
      name: 'Elegant',
      body: 'Georgia, serif',
      heading: 'Playfair Display, serif',
      description: 'Sophisticated and refined'
    },
    {
      name: 'Friendly',
      body: 'Open Sans, sans-serif',
      heading: 'Montserrat, sans-serif',
      description: 'Approachable and warm'
    },
    {
      name: 'Technical',
      body: 'Roboto, sans-serif',
      heading: 'Roboto, sans-serif',
      description: 'Clean and structured'
    },
    {
      name: 'Creative',
      body: 'Lato, sans-serif',
      heading: 'Raleway, sans-serif',
      description: 'Modern and unique'
    }
  ];

  fontFamilies = [
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'system-ui, -apple-system, sans-serif', label: 'System UI' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Raleway, sans-serif', label: 'Raleway' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Merriweather, serif', label: 'Merriweather' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
    { value: 'Fira Code, monospace', label: 'Fira Code' }
  ];

  headingFonts = [
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Raleway, sans-serif', label: 'Raleway' },
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Merriweather, serif', label: 'Merriweather' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'inherit', label: 'Same as Body' }
  ];

  fontWeights = [
    { value: 100, label: '100 - Thin' },
    { value: 200, label: '200 - Extra Light' },
    { value: 300, label: '300 - Light' },
    { value: 400, label: '400 - Regular' },
    { value: 500, label: '500 - Medium' },
    { value: 600, label: '600 - Semi Bold' },
    { value: 700, label: '700 - Bold' },
    { value: 800, label: '800 - Extra Bold' },
    { value: 900, label: '900 - Black' }
  ];

  typeScales: TypeScale[] = [
    {
      name: 'Minor Third',
      base: 16,
      ratio: 1.2,
      sizes: { small: 13, medium: 16, large: 19, xlarge: 23 }
    },
    {
      name: 'Major Third',
      base: 16,
      ratio: 1.25,
      sizes: { small: 13, medium: 16, large: 20, xlarge: 25 }
    },
    {
      name: 'Perfect Fourth',
      base: 16,
      ratio: 1.333,
      sizes: { small: 12, medium: 16, large: 21, xlarge: 28 }
    },
    {
      name: 'Golden Ratio',
      base: 16,
      ratio: 1.618,
      sizes: { small: 10, medium: 16, large: 26, xlarge: 42 }
    }
  ];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    // Emit the change immediately
    this.themeChange.emit({ [key]: value });
  }

  isFontPresetActive(preset: FontPreset): boolean {
    return this.theme.fontFamily === preset.body &&
      this.theme.headingFontFamily === preset.heading;
  }

  applyFontPreset(preset: FontPreset): void {
    this.themeChange.emit({
      fontFamily: preset.body,
      headingFontFamily: preset.heading
    });
  }

  isScaleActive(scale: TypeScale): boolean {
    return Math.abs(this.theme.fontSizeBase - scale.base) < 1 &&
      Math.abs(this.theme.fontSizeSmall - scale.sizes.small) < 1;
  }

  applyTypeScale(scale: TypeScale): void {
    this.themeChange.emit({
      fontSizeBase: scale.base,
      fontSizeSmall: scale.sizes.small,
      fontSizeMedium: scale.sizes.medium,
      fontSizeLarge: scale.sizes.large,
      fontSizeXLarge: scale.sizes.xlarge,
      h1Size: Math.round(scale.base * Math.pow(scale.ratio, 4)),
      h2Size: Math.round(scale.base * Math.pow(scale.ratio, 3)),
      h3Size: Math.round(scale.base * Math.pow(scale.ratio, 2)),
      h4Size: Math.round(scale.base * Math.pow(scale.ratio, 1)),
      h5Size: Math.round(scale.base / scale.ratio),
      h6Size: Math.round(scale.base / Math.pow(scale.ratio, 2))
    });
  }
}
