// Create: src/app/components/theme-controls/accessibility-controls/accessibility-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-accessibility-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSliderModule
  ],
  template: `
    <div class="accessibility-controls">
      <div class="control-group">
        <h4>Theme Mode</h4>
        <mat-radio-group [(ngModel)]="theme.mode"
                         (ngModelChange)="updateProperty('mode', $event)">
          <mat-radio-button value="light">Light</mat-radio-button>
          <mat-radio-button value="dark">Dark</mat-radio-button>
          <mat-radio-button value="auto">Auto</mat-radio-button>
        </mat-radio-group>
      </div>

      <div class="control-group">
        <h4>Color Scheme</h4>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select Color Scheme</mat-label>
          <mat-select [(value)]="theme.colorScheme"
                      (selectionChange)="updateProperty('colorScheme', $event.value)">
            <mat-option value="ocean-mint">Ocean Mint</mat-option>
            <mat-option value="corporate">Corporate</mat-option>
            <mat-option value="creative">Creative</mat-option>
            <mat-option value="elegant">Elegant</mat-option>
            <mat-option value="tech">Tech</mat-option>
            <mat-option value="custom">Custom</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="control-group">
        <h4>Accessibility Options</h4>

        <mat-checkbox [(ngModel)]="theme.reducedMotion"
                      (ngModelChange)="updateProperty('reducedMotion', $event)">
          Reduced Motion
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.highContrast"
                      (ngModelChange)="updateProperty('highContrast', $event)">
          High Contrast
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.focusVisible"
                      (ngModelChange)="updateProperty('focusVisible', $event)">
          Always Show Focus Indicators
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.keyboardNavigation"
                      (ngModelChange)="updateProperty('keyboardNavigation', $event)">
          Enhanced Keyboard Navigation
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.screenReaderFriendly"
                      (ngModelChange)="updateProperty('screenReaderFriendly', $event)">
          Screen Reader Optimized
        </mat-checkbox>
      </div>

      <div class="control-group">
        <h4>Text Scaling</h4>
        <div class="control-item">
          <label>Text Scale: {{ (theme.textScaling * 100).toFixed(0) }}%</label>
          <mat-slider [min]="0.8" [max]="1.5" [step]="0.05"
                      [(ngModel)]="theme.textScaling"
                      (ngModelChange)="updateProperty('textScaling', $event)"
                      [discrete]="true">
            <input matSliderThumb>
          </mat-slider>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accessibility-controls {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .control-group {
      h4 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }

      mat-radio-group {
        display: flex;
        gap: 24px;
      }

      mat-checkbox {
        display: block;
        margin-bottom: 16px;
      }
    }

    .full-width {
      width: 100%;
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
  `]
})
export class AccessibilityControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
