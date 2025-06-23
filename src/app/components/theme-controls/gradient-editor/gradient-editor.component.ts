// src/app/components/theme-controls/gradient-editor/gradient-editor.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';

interface GradientStop {
  color: string;
  position: number;
}

@Component({
  selector: 'app-gradient-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <div class="gradient-editor">
      <div class="control-group">
        <h4>Gradient Settings</h4>

        <div class="control-item">
          <mat-checkbox
            [(ngModel)]="theme.enableGradients"
            (ngModelChange)="updateProperty('enableGradients', $event)">
            Enable Gradients
          </mat-checkbox>
        </div>

        <div *ngIf="theme.enableGradients" class="gradient-controls">
          <!-- Gradient Type Selector -->
          <div class="control-item">
            <label>Gradient Type</label>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Type</mat-label>
              <mat-select
                [(value)]="gradientType"
                (selectionChange)="onGradientTypeChange($event.value)">
                <mat-option value="linear">Linear</mat-option>
                <mat-option value="radial">Radial</mat-option>
                <mat-option value="conic">Conic</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Angle Control (for linear gradients) -->
          <div class="control-item" *ngIf="gradientType === 'linear'">
            <label>Gradient Angle: {{ theme.gradientAngle }}°</label>
            <mat-slider
              [min]="0"
              [max]="360"
              [step]="15"
              [discrete]="true"
              [displayWith]="formatAngle">
              <input matSliderThumb
                     [value]="theme.gradientAngle"
                     (valueChange)="updateProperty('gradientAngle', $event)">
            </mat-slider>
            <div class="angle-presets">
              <button mat-button
                      *ngFor="let angle of anglePresets"
                      (click)="updateProperty('gradientAngle', angle)"
                      [class.active]="theme.gradientAngle === angle"
                      class="angle-preset-btn">
                {{ angle }}°
              </button>
            </div>
          </div>

          <!-- Gradient Editor for Each Type -->
          <div class="gradient-section">
            <h5>Primary Gradient</h5>
            <div class="gradient-preview"
                 [style.background]="theme.primaryGradient">
            </div>
            <div class="gradient-stops">
              <div class="color-stop" *ngFor="let stop of primaryStops; let i = index">
                <input type="color"
                       [(ngModel)]="stop.color"
                       (ngModelChange)="updateGradient('primary')"
                       class="color-input">
                <mat-slider
                  [min]="0"
                  [max]="100"
                  [step]="5"
                  [discrete]="true"
                  class="position-slider">
                  <input matSliderThumb
                         [(ngModel)]="stop.position"
                         (ngModelChange)="updateGradient('primary')">
                </mat-slider>
                <span class="position-label">{{ stop.position }}%</span>
                <button mat-icon-button
                        (click)="removeStop('primary', i)"
                        [disabled]="primaryStops.length <= 2"
                        matTooltip="Remove stop">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <button mat-stroked-button
                      (click)="addStop('primary')"
                      [disabled]="primaryStops.length >= 5"
                      class="add-stop-btn">
                <mat-icon>add</mat-icon>
                Add Stop
              </button>
            </div>
          </div>

          <div class="gradient-section">
            <h5>Secondary Gradient</h5>
            <div class="gradient-preview"
                 [style.background]="theme.secondaryGradient">
            </div>
            <div class="gradient-stops">
              <div class="color-stop" *ngFor="let stop of secondaryStops; let i = index">
                <input type="color"
                       [(ngModel)]="stop.color"
                       (ngModelChange)="updateGradient('secondary')"
                       class="color-input">
                <mat-slider
                  [min]="0"
                  [max]="100"
                  [step]="5"
                  [discrete]="true"
                  class="position-slider">
                  <input matSliderThumb
                         [(ngModel)]="stop.position"
                         (ngModelChange)="updateGradient('secondary')">
                </mat-slider>
                <span class="position-label">{{ stop.position }}%</span>
                <button mat-icon-button
                        (click)="removeStop('secondary', i)"
                        [disabled]="secondaryStops.length <= 2"
                        matTooltip="Remove stop">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <button mat-stroked-button
                      (click)="addStop('secondary')"
                      [disabled]="secondaryStops.length >= 5"
                      class="add-stop-btn">
                <mat-icon>add</mat-icon>
                Add Stop
              </button>
            </div>
          </div>

          <div class="gradient-section">
            <h5>Accent Gradient</h5>
            <div class="gradient-preview"
                 [style.background]="theme.accentGradient">
            </div>
            <div class="gradient-stops">
              <div class="color-stop" *ngFor="let stop of accentStops; let i = index">
                <input type="color"
                       [(ngModel)]="stop.color"
                       (ngModelChange)="updateGradient('accent')"
                       class="color-input">
                <mat-slider
                  [min]="0"
                  [max]="100"
                  [step]="5"
                  [discrete]="true"
                  class="position-slider">
                  <input matSliderThumb
                         [(ngModel)]="stop.position"
                         (ngModelChange)="updateGradient('accent')">
                </mat-slider>
                <span class="position-label">{{ stop.position }}%</span>
                <button mat-icon-button
                        (click)="removeStop('accent', i)"
                        [disabled]="accentStops.length <= 2"
                        matTooltip="Remove stop">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <button mat-stroked-button
                      (click)="addStop('accent')"
                      [disabled]="accentStops.length >= 5"
                      class="add-stop-btn">
                <mat-icon>add</mat-icon>
                Add Stop
              </button>
            </div>
          </div>

          <div class="gradient-section">
            <h5>Background Gradient</h5>
            <div class="gradient-preview"
                 [style.background]="theme.backgroundGradient">
            </div>
            <div class="gradient-stops">
              <div class="color-stop" *ngFor="let stop of backgroundStops; let i = index">
                <input type="color"
                       [(ngModel)]="stop.color"
                       (ngModelChange)="updateGradient('background')"
                       class="color-input">
                <mat-slider
                  [min]="0"
                  [max]="100"
                  [step]="5"
                  [discrete]="true"
                  class="position-slider">
                  <input matSliderThumb
                         [(ngModel)]="stop.position"
                         (ngModelChange)="updateGradient('background')">
                </mat-slider>
                <span class="position-label">{{ stop.position }}%</span>
                <button mat-icon-button
                        (click)="removeStop('background', i)"
                        [disabled]="backgroundStops.length <= 2"
                        matTooltip="Remove stop">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <button mat-stroked-button
                      (click)="addStop('background')"
                      [disabled]="backgroundStops.length >= 5"
                      class="add-stop-btn">
                <mat-icon>add</mat-icon>
                Add Stop
              </button>
            </div>
          </div>

          <!-- Gradient Presets -->
          <div class="gradient-presets">
            <h5>Gradient Presets</h5>
            <div class="preset-grid">
              <button
                *ngFor="let preset of gradientPresets"
                (click)="applyPreset(preset)"
                class="gradient-preset"
                [style.background]="preset.gradient"
                [matTooltip]="preset.name">
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gradient-editor {
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
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
      }
    }

    .gradient-controls {
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    }

    .full-width {
      width: 100%;
    }

    .angle-presets {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .angle-preset-btn {
      min-width: 60px;
      padding: 4px 12px;
      font-size: 12px;
      background: rgba(196, 247, 239, 0.3);
      border-radius: 6px;

      &.active {
        background: #34C5AA;
        color: white;
      }
    }

    .gradient-section {
      background: rgba(196, 247, 239, 0.15);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .gradient-preview {
      width: 100%;
      height: 60px;
      border-radius: 10px;
      margin-bottom: 20px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      box-shadow: 0 2px 8px rgba(47, 72, 88, 0.08);
    }

    .gradient-stops {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .color-stop {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .color-input {
      width: 48px;
      height: 36px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      padding: 2px;

      &:hover {
        border-color: #34C5AA;
      }
    }

    .position-slider {
      flex: 1;
      margin: 0 8px;
    }

    .position-label {
      min-width: 40px;
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
    }

    .add-stop-btn {
      margin-top: 8px;
      border-color: #34C5AA;
      color: #34C5AA;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
      }
    }

    .gradient-presets {
      margin-top: 24px;

      h5 {
        margin-bottom: 16px;
      }
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
    }

    .gradient-preset {
      height: 60px;
      border-radius: 10px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        border-color: #34C5AA;
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.25);
      }
    }

    mat-checkbox {
      display: block;
      margin-bottom: 16px;
    }
  `]
})
export class GradientEditorComponent implements OnInit {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  gradientType = 'linear';
  anglePresets = [0, 45, 90, 135, 180, 225, 270, 315];

  primaryStops: GradientStop[] = [];
  secondaryStops: GradientStop[] = [];
  accentStops: GradientStop[] = [];
  backgroundStops: GradientStop[] = [];

  gradientPresets = [
    { name: 'Ocean Breeze', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
    { name: 'Sky', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { name: 'Purple Dream', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { name: 'Warm Flame', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { name: 'Night Fade', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }
  ];

  ngOnInit(): void {
    this.parseGradients();
    this.detectGradientType();
  }

  parseGradients(): void {
    this.primaryStops = this.parseGradient(this.theme.primaryGradient);
    this.secondaryStops = this.parseGradient(this.theme.secondaryGradient);
    this.accentStops = this.parseGradient(this.theme.accentGradient);
    this.backgroundStops = this.parseGradient(this.theme.backgroundGradient);
  }

  parseGradient(gradient: string): GradientStop[] {
    const regex = /(#[0-9A-Fa-f]{6}|rgba?\([^)]+\))\s+(\d+)%/g;
    const stops: GradientStop[] = [];
    let match;

    while ((match = regex.exec(gradient)) !== null) {
      stops.push({
        color: match[1],
        position: parseInt(match[2])
      });
    }

    // If no stops found, create default
    if (stops.length === 0) {
      return [
        { color: this.theme.primaryColor, position: 0 },
        { color: this.theme.secondaryColor, position: 100 }
      ];
    }

    return stops;
  }

  detectGradientType(): void {
    if (this.theme.primaryGradient.startsWith('linear-gradient')) {
      this.gradientType = 'linear';
    } else if (this.theme.primaryGradient.startsWith('radial-gradient')) {
      this.gradientType = 'radial';
    } else if (this.theme.primaryGradient.startsWith('conic-gradient')) {
      this.gradientType = 'conic';
    }
  }

  formatAngle(value: number): string {
    return `${value}°`;
  }

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });

    // Update all gradients when angle changes
    if (key === 'gradientAngle') {
      this.updateAllGradients();
    }
  }

  onGradientTypeChange(type: string): void {
    this.gradientType = type;
    this.updateAllGradients();
  }

  updateGradient(type: 'primary' | 'secondary' | 'accent' | 'background'): void {
    let stops: GradientStop[];
    let propertyKey: keyof ThemeConfig;

    switch (type) {
      case 'primary':
        stops = this.primaryStops;
        propertyKey = 'primaryGradient';
        break;
      case 'secondary':
        stops = this.secondaryStops;
        propertyKey = 'secondaryGradient';
        break;
      case 'accent':
        stops = this.accentStops;
        propertyKey = 'accentGradient';
        break;
      case 'background':
        stops = this.backgroundStops;
        propertyKey = 'backgroundGradient';
        break;
    }

    const gradient = this.buildGradient(stops);
    this.themeChange.emit({ [propertyKey]: gradient });
  }

  updateAllGradients(): void {
    this.themeChange.emit({
      primaryGradient: this.buildGradient(this.primaryStops),
      secondaryGradient: this.buildGradient(this.secondaryStops),
      accentGradient: this.buildGradient(this.accentStops),
      backgroundGradient: this.buildGradient(this.backgroundStops)
    });
  }

  buildGradient(stops: GradientStop[]): string {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

    switch (this.gradientType) {
      case 'radial':
        return `radial-gradient(circle, ${stopsString})`;
      case 'conic':
        return `conic-gradient(from ${this.theme.gradientAngle}deg, ${stopsString})`;
      default:
        return `linear-gradient(${this.theme.gradientAngle}deg, ${stopsString})`;
    }
  }

  addStop(type: 'primary' | 'secondary' | 'accent' | 'background'): void {
    const newStop: GradientStop = {
      color: type === 'primary' ? this.theme.primaryColor :
        type === 'secondary' ? this.theme.secondaryColor :
          type === 'accent' ? this.theme.accentColor :
            this.theme.backgroundColor,
      position: 50
    };

    switch (type) {
      case 'primary':
        this.primaryStops.push(newStop);
        break;
      case 'secondary':
        this.secondaryStops.push(newStop);
        break;
      case 'accent':
        this.accentStops.push(newStop);
        break;
      case 'background':
        this.backgroundStops.push(newStop);
        break;
    }

    this.updateGradient(type);
  }

  removeStop(type: 'primary' | 'secondary' | 'accent' | 'background', index: number): void {
    switch (type) {
      case 'primary':
        this.primaryStops.splice(index, 1);
        break;
      case 'secondary':
        this.secondaryStops.splice(index, 1);
        break;
      case 'accent':
        this.accentStops.splice(index, 1);
        break;
      case 'background':
        this.backgroundStops.splice(index, 1);
        break;
    }

    this.updateGradient(type);
  }

  applyPreset(preset: { name: string; gradient: string }): void {
    // Apply preset to all gradients
    const stops = this.parseGradient(preset.gradient);

    this.primaryStops = [...stops];
    this.secondaryStops = [...stops];
    this.accentStops = [...stops];
    this.backgroundStops = [...stops];

    // Detect gradient type from preset
    if (preset.gradient.startsWith('linear-gradient')) {
      this.gradientType = 'linear';
      // Extract angle
      const angleMatch = preset.gradient.match(/(\d+)deg/);
      if (angleMatch) {
        this.theme.gradientAngle = parseInt(angleMatch[1]);
      }
    }

    this.updateAllGradients();
    this.themeChange.emit({ gradientAngle: this.theme.gradientAngle });
  }
}
