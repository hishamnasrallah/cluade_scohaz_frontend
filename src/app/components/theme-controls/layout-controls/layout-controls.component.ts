// src/app/components/theme-controls/layout-controls/layout-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { ThemeConfig } from '../../../models/theme.model';

interface SpacingPreset {
  name: string;
  icon: string;
  unit: number;
  scale: {
    xsmall: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

interface GridPreset {
  name: string;
  columns: number;
  gutter: number;
  description: string;
}

@Component({
  selector: 'app-layout-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatExpansionModule
  ],
  template: `
    <div class="layout-controls">
      <!-- Layout Type -->
      <div class="control-section">
        <h4>Layout Type</h4>
        <mat-radio-group [(value)]="theme.layoutType" 
                        (change)="updateProperty('layoutType', $event.value)"
                        class="layout-type-group">
          <div class="layout-options">
            <mat-radio-button value="fixed" class="layout-option">
              <div class="option-content">
                <mat-icon>view_agenda</mat-icon>
                <span class="option-label">Fixed</span>
                <span class="option-desc">Fixed width container</span>
              </div>
            </mat-radio-button>

            <mat-radio-button value="fluid" class="layout-option">
              <div class="option-content">
                <mat-icon>view_stream</mat-icon>
                <span class="option-label">Fluid</span>
                <span class="option-desc">Full width responsive</span>
              </div>
            </mat-radio-button>

            <mat-radio-button value="boxed" class="layout-option">
              <div class="option-content">
                <mat-icon>crop_square</mat-icon>
                <span class="option-label">Boxed</span>
                <span class="option-desc">Centered with max width</span>
              </div>
            </mat-radio-button>
          </div>
        </mat-radio-group>
      </div>

      <!-- Spacing System -->
      <div class="control-section">
        <h4>Spacing System</h4>

        <!-- Spacing Presets -->
        <div class="spacing-presets">
          <div *ngFor="let preset of spacingPresets"
               class="preset-card"
               [class.active]="isSpacingPresetActive(preset)"
               (click)="applySpacingPreset(preset)">
            <div class="preset-icon">{{ preset.icon }}</div>
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-value">Base: {{ preset.unit }}px</span>
          </div>
        </div>

        <!-- Spacing Controls -->
        <div class="spacing-controls">
          <div class="control-item">
            <label>Spacing Unit: {{ theme.spacingUnit }}px</label>
            <mat-slider [min]="4" [max]="32" [step]="4"
                       [value]="theme.spacingUnit"
                       (input)="updateSpacingUnit($event.value)"
                       [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="spacing-sizes">
            <div class="size-control">
              <label>X-Small: {{ theme.spacingXSmall }}px</label>
              <mat-slider [min]="2" [max]="16" [step]="1"
                         [value]="theme.spacingXSmall"
                         (input)="updateProperty('spacingXSmall', $event.value)"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
              <div class="spacing-preview" [style.height.px]="theme.spacingXSmall"></div>
            </div>

            <div class="size-control">
              <label>Small: {{ theme.spacingSmall }}px</label>
              <mat-slider [min]="4" [max]="24" [step]="2"
                         [value]="theme.spacingSmall"
                         (input)="updateProperty('spacingSmall', $event.value)"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
              <div class="spacing-preview" [style.height.px]="theme.spacingSmall"></div>
            </div>

            <div class="size-control">
              <label>Medium: {{ theme.spacingMedium }}px</label>
              <mat-slider [min]="8" [max]="40" [step]="4"
                         [value]="theme.spacingMedium"
                         (input)="updateProperty('spacingMedium', $event.value)"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
              <div class="spacing-preview" [style.height.px]="theme.spacingMedium"></div>
            </div>

            <div class="size-control">
              <label>Large: {{ theme.spacingLarge }}px</label>
              <mat-slider [min]="16" [max]="64" [step]="4"
                         [value]="theme.spacingLarge"
                         (input)="updateProperty('spacingLarge', $event.value)"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
              <div class="spacing-preview" [style.height.px]="theme.spacingLarge"></div>
            </div>

            <div class="size-control">
              <label>X-Large: {{ theme.spacingXLarge }}px</label>
              <mat-slider [min]="24" [max]="96" [step]="8"
                         [value]="theme.spacingXLarge"
                         (input)="updateProperty('spacingXLarge', $event.value)"
                         [discrete]="true">
                <input matSliderThumb>
              </mat-slider>
              <div class="spacing-preview" [style.height.px]="theme.spacingXLarge"></div>
            </div>
          </div>
        </div>

        <!-- Spacing Preview -->
        <div class="spacing-demo">
          <h5>Spacing Demo</h5>
          <div class="demo-container">
            <div class="demo-item" [style.padding.px]="theme.spacingXSmall">
              <div class="demo-content">XS Padding</div>
            </div>
            <div class="demo-item" [style.padding.px]="theme.spacingSmall">
              <div class="demo-content">S Padding</div>
            </div>
            <div class="demo-item" [style.padding.px]="theme.spacingMedium">
              <div class="demo-content">M Padding</div>
            </div>
            <div class="demo-item" [style.padding.px]="theme.spacingLarge">
              <div class="demo-content">L Padding</div>
            </div>
            <div class="demo-item" [style.padding.px]="theme.spacingXLarge">
              <div class="demo-content">XL Padding</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Container Settings -->
      <div class="control-section">
        <h4>Container Settings</h4>

        <div class="control-item">
          <label>Max Container Width: {{ theme.containerMaxWidth }}px</label>
          <mat-slider [min]="960" [max]="1920" [step]="20"
                     [value]="theme.containerMaxWidth"
                     (input)="updateProperty('containerMaxWidth', $event.value)"
                     [discrete]="true">
            <input matSliderThumb>
          </mat-slider>
        </div>

        <div class="container-preview">
          <div class="preview-wrapper">
            <div class="container-box" [style.max-width.px]="theme.containerMaxWidth">
              <span>Container: {{ theme.containerMaxWidth }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Layout Positions -->
      <mat-expansion-panel class="control-section">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>layers</mat-icon>
            Layout Positions
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="position-controls">
          <div class="control-group">
            <label>Header Position</label>
            <mat-select [(value)]="theme.headerPosition"
                       (selectionChange)="updateProperty('headerPosition', $event.value)">
              <mat-option value="fixed">Fixed</mat-option>
              <mat-option value="static">Static</mat-option>
              <mat-option value="sticky">Sticky</mat-option>
            </mat-select>
          </div>

          <div class="control-group">
            <label>Sidebar Position</label>
            <mat-select [(value)]="theme.sidebarPosition"
                       (selectionChange)="updateProperty('sidebarPosition', $event.value)">
              <mat-option value="left">Left</mat-option>
              <mat-option value="right">Right</mat-option>
            </mat-select>
          </div>

          <div class="control-group">
            <label>Footer Position</label>
            <mat-select [(value)]="theme.footerPosition"
                       (selectionChange)="updateProperty('footerPosition', $event.value)">
              <mat-option value="fixed">Fixed</mat-option>
              <mat-option value="static">Static</mat-option>
            </mat-select>
          </div>
        </div>

        <!-- Layout Preview -->
        <div class="layout-preview">
          <div class="preview-layout">
            <div class="preview-header" [class]="'position-' + theme.headerPosition">
              Header ({{ theme.headerPosition }})
            </div>
            <div class="preview-body">
              <div class="preview-sidebar" [class]="'position-' + theme.sidebarPosition">
                Sidebar
              </div>
              <div class="preview-content">
                Main Content
              </div>
            </div>
            <div class="preview-footer" [class]="'position-' + theme.footerPosition">
              Footer ({{ theme.footerPosition }})
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Sidebar Settings -->
      <mat-expansion-panel class="control-section">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>menu</mat-icon>
            Sidebar Settings
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="sidebar-controls">
          <div class="control-item">
            <label>Sidebar Width: {{ theme.sidebarWidth }}px</label>
            <mat-slider [min]="200" [max]="400" [step]="10"
                       [value]="theme.sidebarWidth"
                       (input)="updateProperty('sidebarWidth', $event.value)"
                       [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="control-item">
            <label>Collapsed Width: {{ theme.sidebarCollapsedWidth }}px</label>
            <mat-slider [min]="40" [max]="100" [step]="4"
                       [value]="theme.sidebarCollapsedWidth"
                       (input)="updateProperty('sidebarCollapsedWidth', $event.value)"
                       [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="sidebar-preview">
            <div class="sidebar-expanded" [style.width.px]="theme.sidebarWidth">
              Expanded: {{ theme.sidebarWidth }}px
            </div>
            <div class="sidebar-collapsed" [style.width.px]="theme.sidebarCollapsedWidth">
              <mat-icon>menu</mat-icon>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Grid System -->
      <mat-expansion-panel class="control-section">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>grid_on</mat-icon>
            Grid System
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="grid-controls">
          <!-- Grid Presets -->
          <div class="grid-presets">
            <div *ngFor="let preset of gridPresets"
                 class="grid-preset"
                 [class.active]="isGridPresetActive(preset)"
                 (click)="applyGridPreset(preset)">
              <h5>{{ preset.name }}</h5>
              <div class="grid-info">
                <span>{{ preset.columns }} cols</span>
                <span>{{ preset.gutter }}px gap</span>
              </div>
              <p>{{ preset.description }}</p>
            </div>
          </div>

          <div class="control-item">
            <label>Grid Columns: {{ theme.gridColumns }}</label>
            <mat-slider [min]="4" [max]="24" [step]="2"
                       [value]="theme.gridColumns"
                       (input)="updateProperty('gridColumns', $event.value)"
                       [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="control-item">
            <label>Grid Gutter: {{ theme.gridGutter }}px</label>
            <mat-slider [min]="8" [max]="48" [step]="4"
                       [value]="theme.gridGutter"
                       (input)="updateProperty('gridGutter', $event.value)"
                       [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <!-- Grid Preview -->
          <div class="grid-preview">
            <div class="grid-container"
                 [style.gap.px]="theme.gridGutter"
                 [style.grid-template-columns]="'repeat(' + theme.gridColumns + ', 1fr)'">
              <div *ngFor="let col of getGridColumns()" class="grid-column">
                {{ col }}
              </div>
            </div>
          </div>

          <!-- Breakpoints -->
          <div class="breakpoints-section">
            <h5>Responsive Breakpoints</h5>
            <div class="breakpoint-controls">
              <div class="breakpoint-item">
                <label>XS: {{ theme.gridBreakpointXs }}px</label>
                <input type="number"
                       [value]="theme.gridBreakpointXs"
                       (input)="updateProperty('gridBreakpointXs', +$any($event.target).value)"
                       class="breakpoint-input" />
              </div>
              <div class="breakpoint-item">
                <label>SM: {{ theme.gridBreakpointSm }}px</label>
                <input type="number"
                       [value]="theme.gridBreakpointSm"
                       (input)="updateProperty('gridBreakpointSm', +$any($event.target).value)"
                       class="breakpoint-input" />
              </div>
              <div class="breakpoint-item">
                <label>MD: {{ theme.gridBreakpointMd }}px</label>
                <input type="number"
                       [value]="theme.gridBreakpointMd"
                       (input)="updateProperty('gridBreakpointMd', +$any($event.target).value)"
                       class="breakpoint-input" />
              </div>
              <div class="breakpoint-item">
                <label>LG: {{ theme.gridBreakpointLg }}px</label>
                <input type="number"
                       [value]="theme.gridBreakpointLg"
                       (input)="updateProperty('gridBreakpointLg', +$any($event.target).value)"
                       class="breakpoint-input" />
              </div>
              <div class="breakpoint-item">
                <label>XL: {{ theme.gridBreakpointXl }}px</label>
                <input type="number"
                       [value]="theme.gridBreakpointXl"
                       (input)="updateProperty('gridBreakpointXl', +$any($event.target).value)"
                       class="breakpoint-input" />
              </div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Z-Index Layers -->
      <mat-expansion-panel class="control-section">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>layers</mat-icon>
            Z-Index Layers
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="zindex-controls">
          <div class="zindex-item" *ngFor="let layer of zIndexLayers">
            <label>{{ layer.label }}: {{ theme[layer.key] }}</label>
            <input type="number"
                   [value]="theme[layer.key]"
                   (input)="updateProperty(layer.key, +$any($event.target).value)"
                   class="zindex-input" />
            <span class="zindex-desc">{{ layer.description }}</span>
          </div>

          <div class="zindex-preview">
            <div class="layer-stack">
              <div *ngFor="let layer of zIndexLayers.slice().reverse()"
                   class="layer-item"
                   [style.z-index]="theme[layer.key]"
                   [style.bottom.px]="getLayerPosition(layer.key)"
                   [style.right.px]="getLayerPosition(layer.key)">
                {{ layer.label }}
              </div>
            </div>
          </div>
        </div>
      </mat-expansion-panel>

      <!-- Density Settings -->
      <div class="control-section">
        <h4>UI Density</h4>
        <mat-radio-group [(value)]="theme.density"
                        (change)="updateProperty('density', $event.value)"
                        class="density-group">
          <mat-radio-button value="comfortable">
            <div class="density-option">
              <mat-icon>spa</mat-icon>
              <span>Comfortable</span>
              <small>More spacing, larger touch targets</small>
            </div>
          </mat-radio-button>
          <mat-radio-button value="compact">
            <div class="density-option">
              <mat-icon>view_compact</mat-icon>
              <span>Compact</span>
              <small>Less spacing, more content</small>
            </div>
          </mat-radio-button>
          <mat-radio-button value="spacious">
            <div class="density-option">
              <mat-icon>aspect_ratio</mat-icon>
              <span>Spacious</span>
              <small>Maximum spacing, premium feel</small>
            </div>
          </mat-radio-button>
        </mat-radio-group>
      </div>
    </div>
  `,
  styles: [`
    .layout-controls {
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

      &.mat-expansion-panel {
        background: white;
        border: 2px solid rgba(196, 247, 239, 0.5);
        border-radius: 12px !important;
        margin-bottom: 16px;

        ::ng-deep .mat-expansion-panel-header {
          height: 64px;
          background: rgba(196, 247, 239, 0.2);
          border-radius: 12px 12px 0 0;

          .mat-expansion-panel-header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            color: #2F4858;

            mat-icon {
              color: #34C5AA;
            }
          }
        }

        ::ng-deep .mat-expansion-panel-body {
          padding: 24px;
        }
      }
    }

    .layout-type-group {
      .layout-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .layout-option {
        ::ng-deep .mdc-radio {
          display: none;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: white;
          border: 2px solid rgba(196, 247, 239, 0.5);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
            color: #34C5AA;
          }

          .option-label {
            font-weight: 600;
            color: #2F4858;
          }

          .option-desc {
            font-size: 12px;
            color: #6B7280;
            text-align: center;
          }
        }

        &.mat-mdc-radio-checked .option-content {
          background: linear-gradient(135deg, rgba(52, 197, 170, 0.1) 0%, rgba(43, 169, 155, 0.1) 100%);
          border-color: #34C5AA;
        }
      }
    }

    .spacing-presets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .preset-card {
      text-align: center;
      padding: 16px;
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

      .preset-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .preset-name {
        display: block;
        font-weight: 600;
        color: #2F4858;
        margin-bottom: 4px;
      }

      .preset-value {
        display: block;
        font-size: 12px;
        color: #6B7280;
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
    }

    .spacing-sizes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }

    .size-control {
      label {
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

      .spacing-preview {
        width: 100%;
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        border-radius: 4px;
        transition: all 0.3s ease;
      }
    }

    .spacing-demo {
      margin-top: 24px;

      h5 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .demo-container {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .demo-item {
        background: rgba(196, 247, 239, 0.2);
        border: 2px dashed #34C5AA;

        .demo-content {
          background: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #2F4858;
          white-space: nowrap;
        }
      }
    }

    .container-preview {
      margin-top: 16px;

      .preview-wrapper {
        background: rgba(196, 247, 239, 0.1);
        padding: 20px;
        border-radius: 12px;
        overflow-x: auto;
      }

      .container-box {
        margin: 0 auto;
        background: white;
        border: 2px solid #34C5AA;
        padding: 20px;
        text-align: center;
        font-weight: 600;
        color: #2F4858;
        transition: all 0.3s ease;
      }
    }

    .position-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      .control-group {
        label {
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

    .layout-preview {
      .preview-layout {
        border: 2px solid rgba(196, 247, 239, 0.5);
        border-radius: 12px;
        overflow: hidden;
        height: 300px;
        display: flex;
        flex-direction: column;

        .preview-header {
          background: #34C5AA;
          color: white;
          padding: 16px;
          text-align: center;
          font-weight: 600;

          &.position-sticky {
            position: sticky;
            top: 0;
            z-index: 10;
          }

          &.position-fixed {
            position: relative;
            z-index: 10;
          }
        }

        .preview-body {
          flex: 1;
          display: flex;
          overflow: hidden;

          .preview-sidebar {
            width: 200px;
            background: rgba(196, 247, 239, 0.3);
            padding: 16px;
            font-weight: 500;
            color: #2F4858;

            &.position-right {
              order: 2;
            }
          }

          .preview-content {
            flex: 1;
            padding: 20px;
            background: white;
            color: #6B7280;
          }
        }

        .preview-footer {
          background: #2F4858;
          color: white;
          padding: 16px;
          text-align: center;
          font-weight: 500;
        }
      }
    }

    .sidebar-preview {
      display: flex;
      gap: 16px;
      margin-top: 20px;

      .sidebar-expanded,
      .sidebar-collapsed {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .sidebar-collapsed {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .grid-presets {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .grid-preset {
      padding: 16px;
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

      .grid-info {
        display: flex;
        gap: 12px;
        margin-bottom: 8px;

        span {
          font-size: 13px;
          font-weight: 500;
          color: #34C5AA;
        }
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #6B7280;
      }
    }

    .grid-preview {
      margin-top: 20px;
      padding: 16px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 12px;

      .grid-container {
        display: grid;
      }

      .grid-column {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        padding: 12px;
        text-align: center;
        font-weight: 600;
        font-size: 12px;
        border-radius: 4px;
      }
    }

    .breakpoints-section {
      margin-top: 24px;

      h5 {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }

      .breakpoint-controls {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;
      }

      .breakpoint-item {
        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        .breakpoint-input {
          width: 100%;
          padding: 8px 12px;
          border: 2px solid rgba(196, 247, 239, 0.5);
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          background: white;
          transition: all 0.2s ease;

          &:focus {
            outline: none;
            border-color: #34C5AA;
            box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
          }
        }
      }
    }

    .zindex-controls {
      .zindex-item {
        display: grid;
        grid-template-columns: 200px 100px 1fr;
        gap: 16px;
        align-items: center;
        margin-bottom: 16px;

        label {
          font-weight: 500;
          color: #2F4858;
        }

        .zindex-input {
          padding: 8px 12px;
          border: 2px solid rgba(196, 247, 239, 0.5);
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          background: white;
          transition: all 0.2s ease;

          &:focus {
            outline: none;
            border-color: #34C5AA;
            box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
          }
        }

        .zindex-desc {
          font-size: 13px;
          color: #6B7280;
        }
      }

      .zindex-preview {
        margin-top: 24px;
        padding: 20px;
        background: rgba(196, 247, 239, 0.1);
        border-radius: 12px;
        height: 250px;
        position: relative;

        .layer-stack {
          position: relative;
          height: 100%;
        }

        .layer-item {
          position: absolute;
          padding: 12px 20px;
          background: white;
          border: 2px solid #34C5AA;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          color: #2F4858;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .density-group {
      display: flex;
      flex-direction: column;
      gap: 16px;

      mat-radio-button {
        ::ng-deep .mdc-radio {
          margin-right: 12px;
        }

        .density-option {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: #34C5AA;
          }

          span {
            font-weight: 600;
            color: #2F4858;
          }

          small {
            color: #6B7280;
            font-size: 12px;
            margin-left: 8px;
          }
        }
      }
    }
  `]
})
export class LayoutControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  spacingPresets: SpacingPreset[] = [
    {
      name: 'Compact',
      icon: '📦',
      unit: 8,
      scale: { xsmall: 2, small: 4, medium: 8, large: 12, xlarge: 16 }
    },
    {
      name: 'Default',
      icon: '📐',
      unit: 16,
      scale: { xsmall: 4, small: 8, medium: 16, large: 24, xlarge: 32 }
    },
    {
      name: 'Comfortable',
      icon: '🛋️',
      unit: 20,
      scale: { xsmall: 5, small: 10, medium: 20, large: 30, xlarge: 40 }
    },
    {
      name: 'Spacious',
      icon: '🌌',
      unit: 24,
      scale: { xsmall: 6, small: 12, medium: 24, large: 36, xlarge: 48 }
    }
  ];

  gridPresets: GridPreset[] = [
    {
      name: 'Classic 12',
      columns: 12,
      gutter: 24,
      description: 'Traditional grid'
    },
    {
      name: 'Modern 16',
      columns: 16,
      gutter: 20,
      description: 'More flexibility'
    },
    {
      name: 'Simple 8',
      columns: 8,
      gutter: 32,
      description: 'Larger sections'
    },
    {
      name: 'Custom 24',
      columns: 24,
      gutter: 16,
      description: 'Maximum control'
    }
  ];

  zIndexLayers = [
    { key: 'zIndexDropdown', label: 'Dropdown', description: 'Select menus, autocomplete' },
    { key: 'zIndexPopover', label: 'Popover', description: 'Tooltips, popovers' },
    { key: 'zIndexModal', label: 'Modal', description: 'Dialogs, overlays' },
    { key: 'zIndexTooltip', label: 'Tooltip', description: 'Hover tooltips' },
    { key: 'zIndexHeader', label: 'Header', description: 'Fixed headers' },
    { key: 'zIndexDrawer', label: 'Drawer', description: 'Side panels' },
    { key: 'zIndexOverlay', label: 'Overlay', description: 'Full screen overlays' }
  ];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  updateSpacingUnit(value: number): void {
    // Auto-calculate other spacing values based on unit
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

  isSpacingPresetActive(preset: SpacingPreset): boolean {
    return this.theme.spacingUnit === preset.unit;
  }

  applySpacingPreset(preset: SpacingPreset): void {
    this.themeChange.emit({
      spacingUnit: preset.unit,
      spacingXSmall: preset.scale.xsmall,
      spacingSmall: preset.scale.small,
      spacingMedium: preset.scale.medium,
      spacingLarge: preset.scale.large,
      spacingXLarge: preset.scale.xlarge
    });
  }

  isGridPresetActive(preset: GridPreset): boolean {
    return this.theme.gridColumns === preset.columns &&
      this.theme.gridGutter === preset.gutter;
  }

  applyGridPreset(preset: GridPreset): void {
    this.themeChange.emit({
      gridColumns: preset.columns,
      gridGutter: preset.gutter
    });
  }

  getGridColumns(): number[] {
    return Array.from({ length: Math.min(this.theme.gridColumns, 12) }, (_, i) => i + 1);
  }

  getLayerPosition(key: string): number {
    const index = this.zIndexLayers.findIndex(l => l.key === key);
    return index * 20;
  }
}
