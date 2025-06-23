// Create: src/app/components/theme-controls/animation-controls/animation-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-animation-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule
  ],
  template: `
    <div class="animation-controls">
      <div class="control-group">
        <h4>Animation Speeds</h4>

        <div class="control-item">
          <label>Normal Speed: {{ theme.animationSpeed }}ms</label>
          <mat-slider [min]="0" [max]="1000" [step]="50"
                      [(ngModel)]="theme.animationSpeed"
                      (ngModelChange)="updateProperty('animationSpeed', $event)"
                      [discrete]="true">
            <input matSliderThumb>
          </mat-slider>
        </div>

        <div class="control-item">
          <label>Slow Speed: {{ theme.animationSpeedSlow }}ms</label>
          <mat-slider [min]="0" [max]="2000" [step]="100"
                      [(ngModel)]="theme.animationSpeedSlow"
                      (ngModelChange)="updateProperty('animationSpeedSlow', $event)"
                      [discrete]="true">
            <input matSliderThumb>
          </mat-slider>
        </div>

        <div class="control-item">
          <label>Fast Speed: {{ theme.animationSpeedFast }}ms</label>
          <mat-slider [min]="0" [max]="500" [step]="25"
                      [(ngModel)]="theme.animationSpeedFast"
                      (ngModelChange)="updateProperty('animationSpeedFast', $event)"
                      [discrete]="true">
            <input matSliderThumb>
          </mat-slider>
        </div>
      </div>

      <div class="control-group">
        <h4>Animation Easing Functions</h4>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Default Easing</mat-label>
          <mat-select [(value)]="theme.animationEasing"
                      (selectionChange)="updateProperty('animationEasing', $event.value)">
            <mat-option value="ease">Ease</mat-option>
            <mat-option value="ease-in">Ease In</mat-option>
            <mat-option value="ease-out">Ease Out</mat-option>
            <mat-option value="ease-in-out">Ease In Out</mat-option>
            <mat-option value="linear">Linear</mat-option>
            <mat-option value="cubic-bezier(0.4, 0, 0.2, 1)">Material Design</mat-option>
            <mat-option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Elastic</mat-option>
            <mat-option value="cubic-bezier(0.175, 0.885, 0.32, 1.275)">Back</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="control-group">
        <h4>Performance Options</h4>

        <mat-checkbox [(ngModel)]="theme.enableAnimations"
                      (ngModelChange)="updateProperty('enableAnimations', $event)">
          Enable Animations
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.enableTransitions"
                      (ngModelChange)="updateProperty('enableTransitions', $event)">
          Enable Transitions
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.enableHoverEffects"
                      (ngModelChange)="updateProperty('enableHoverEffects', $event)">
          Enable Hover Effects
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.enableFocusEffects"
                      (ngModelChange)="updateProperty('enableFocusEffects', $event)">
          Enable Focus Effects
        </mat-checkbox>

        <mat-checkbox [(ngModel)]="theme.enableRipple"
                      (ngModelChange)="updateProperty('enableRipple', $event)">
          Enable Ripple Effects
        </mat-checkbox>
      </div>
    </div>
  `,
  styles: [`
    .animation-controls {
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

    .full-width {
      width: 100%;
    }

    mat-checkbox {
      display: block;
      margin-bottom: 16px;
    }
  `]
})
export class AnimationControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
