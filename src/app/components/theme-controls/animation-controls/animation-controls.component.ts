// src/app/components/theme-controls/animation-controls/animation-controls.component.ts (FULL FILE)
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { ThemeConfig } from '../../../models/theme.model';

interface TimingPreset {
  name: string;
  value: string;
  description: string;
  icon: string;
}

interface CubicBezierPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-animation-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule
  ],
  template: `
    <div class="animation-controls">
      <div class="control-group">
        <h4>Animation Speeds</h4>

        <div class="control-item">
          <label>Normal Speed: {{ theme.animationSpeed }}ms</label>
          <mat-slider [min]="0" [max]="1000" [step]="50"
                      [discrete]="true">
            <input matSliderThumb
                   [value]="theme.animationSpeed"
                   (valueChange)="updateProperty('animationSpeed', $event)">
          </mat-slider>
        </div>

        <div class="control-item">
          <label>Slow Speed: {{ theme.animationSpeedSlow }}ms</label>
          <mat-slider [min]="0" [max]="2000" [step]="100"
                      [discrete]="true">
            <input matSliderThumb
                   [value]="theme.animationSpeedSlow"
                   (valueChange)="updateProperty('animationSpeedSlow', $event)">
          </mat-slider>
        </div>

        <div class="control-item">
          <label>Fast Speed: {{ theme.animationSpeedFast }}ms</label>
          <mat-slider [min]="0" [max]="500" [step]="25"
                      [discrete]="true">
            <input matSliderThumb
                   [value]="theme.animationSpeedFast"
                   (valueChange)="updateProperty('animationSpeedFast', $event)">
          </mat-slider>
        </div>
      </div>

      <div class="control-group">
        <h4>Animation Timing Functions</h4>

        <!-- Timing Function Presets -->
        <div class="timing-presets">
          <div *ngFor="let preset of timingPresets"
               class="timing-preset"
               [class.active]="theme.animationEasing === preset.value"
               (click)="selectTimingPreset(preset)">
            <mat-icon>{{ preset.icon }}</mat-icon>
            <span class="preset-name">{{ preset.name }}</span>
            <span class="preset-description">{{ preset.description }}</span>
            <div class="timing-preview">
              <div class="preview-ball"
                   [style.animation]="getPreviewAnimation(preset)">
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Cubic Bezier Editor -->
        <div class="cubic-bezier-editor" *ngIf="showCubicBezierEditor">
          <h5>Custom Cubic Bezier Editor</h5>

          <div class="bezier-container">
            <svg class="bezier-canvas" viewBox="0 0 300 300"
                 (mousedown)="startDragging($event)"
                 (mousemove)="onDrag($event)"
                 (mouseup)="stopDragging()"
                 (mouseleave)="stopDragging()">
              <!-- Grid -->
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E5E7EB" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="300" height="300" fill="url(#grid)" />

              <!-- Reference line -->
              <line x1="0" y1="300" x2="300" y2="0" stroke="#D1D5DB" stroke-width="2" stroke-dasharray="5,5"/>

              <!-- Bezier curve -->
              <path [attr.d]="getBezierPath()"
                    fill="none"
                    stroke="#34C5AA"
                    stroke-width="3"/>

              <!-- Control lines -->
              <line [attr.x1]="0"
                    [attr.y1]="300"
                    [attr.x2]="controlPoint1.x * 300"
                    [attr.y2]="300 - controlPoint1.y * 300"
                    stroke="#9CA3AF"
                    stroke-width="1"/>
              <line [attr.x1]="300"
                    [attr.y1]="0"
                    [attr.x2]="controlPoint2.x * 300"
                    [attr.y2]="300 - controlPoint2.y * 300"
                    stroke="#9CA3AF"
                    stroke-width="1"/>

              <!-- Control points -->
              <circle [attr.cx]="controlPoint1.x * 300"
                      [attr.cy]="300 - controlPoint1.y * 300"
                      r="8"
                      fill="#34C5AA"
                      stroke="white"
                      stroke-width="2"
                      class="control-point"
                      style="cursor: grab;"
                      (mousedown)="startDraggingPoint(1, $event)"/>
              <circle [attr.cx]="controlPoint2.x * 300"
                      [attr.cy]="300 - controlPoint2.y * 300"
                      r="8"
                      fill="#2BA99B"
                      stroke="white"
                      stroke-width="2"
                      class="control-point"
                      style="cursor: grab;"
                      (mousedown)="startDraggingPoint(2, $event)"/>
            </svg>

            <div class="bezier-values">
              <div class="value-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>P1 X</mat-label>
                  <input matInput type="number"
                         [(ngModel)]="controlPoint1.x"
                         (ngModelChange)="updateCubicBezier()"
                         min="0" max="1" step="0.01">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>P1 Y</mat-label>
                  <input matInput type="number"
                         [(ngModel)]="controlPoint1.y"
                         (ngModelChange)="updateCubicBezier()"
                         step="0.01">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>P2 X</mat-label>
                  <input matInput type="number"
                         [(ngModel)]="controlPoint2.x"
                         (ngModelChange)="updateCubicBezier()"
                         min="0" max="1" step="0.01">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>P2 Y</mat-label>
                  <input matInput type="number"
                         [(ngModel)]="controlPoint2.y"
                         (ngModelChange)="updateCubicBezier()"
                         step="0.01">
                </mat-form-field>
              </div>

              <div class="bezier-string">
                <code>{{ currentBezierString }}</code>
                <button mat-icon-button
                        (click)="copyBezierString()"
                        matTooltip="Copy to clipboard">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Common Bezier Presets -->
          <div class="bezier-presets">
            <h6>Common Presets</h6>
            <div class="preset-grid">
              <button mat-stroked-button
                      *ngFor="let preset of bezierPresets"
                      (click)="applyBezierPreset(preset)"
                      class="bezier-preset-btn">
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Toggle Custom Editor -->
        <button mat-stroked-button
                (click)="showCubicBezierEditor = !showCubicBezierEditor"
                class="toggle-editor-btn">
          <mat-icon>{{ showCubicBezierEditor ? 'expand_less' : 'expand_more' }}</mat-icon>
          {{ showCubicBezierEditor ? 'Hide' : 'Show' }} Custom Timing Function Editor
        </button>

        <!-- Animation Preview -->
        <div class="animation-preview-section">
          <h5>Animation Preview</h5>

          <div class="preview-controls">
            <button mat-raised-button color="primary" (click)="playAnimation()">
              <mat-icon>play_arrow</mat-icon>
              Play Animation
            </button>

            <mat-form-field appearance="outline" class="animation-select">
              <mat-label>Animation Type</mat-label>
              <mat-select [(value)]="selectedAnimation">
                <mat-option value="fade">Fade In</mat-option>
                <mat-option value="slide">Slide In</mat-option>
                <mat-option value="scale">Scale</mat-option>
                <mat-option value="rotate">Rotate</mat-option>
                <mat-option value="bounce">Bounce</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="preview-stage">
            <div class="preview-element"
                 [class.animate]="isAnimating"
                 [class]="'animation-' + selectedAnimation"
                 [style.animation-duration.ms]="theme.animationSpeed"
                 [style.animation-timing-function]="theme.animationEasing"
                 (animationend)="onAnimationEnd()">
              <mat-icon>widgets</mat-icon>
              <span>Animated Element</span>
            </div>
          </div>
        </div>
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

      h5 {
        margin: 20px 0 16px;
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

    .timing-presets {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .timing-preset {
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 8px;

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

      mat-icon {
        color: #34C5AA;
      }

      .preset-name {
        font-weight: 600;
        color: #2F4858;
      }

      .preset-description {
        font-size: 12px;
        color: #6B7280;
      }

      .timing-preview {
        height: 40px;
        position: relative;
        background: rgba(196, 247, 239, 0.2);
        border-radius: 8px;
        margin-top: 8px;
        overflow: hidden;

        .preview-ball {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: #34C5AA;
          border-radius: 50%;
        }
      }
    }

    @keyframes move-ease {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-ease-in {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-ease-out {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-ease-in-out {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-linear {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-material-design {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-elastic {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    @keyframes move-back {
      0%, 100% { left: 0; }
      50% { left: calc(100% - 12px); }
    }

    .cubic-bezier-editor {
      background: white;
      border: 1px solid rgba(196, 247, 239, 0.5);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .bezier-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .bezier-canvas {
      width: 300px;
      height: 300px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: white;
      cursor: crosshair;
    }

    .control-point {
      transition: r 0.2s ease;

      &:hover {
        r: 10;
      }
    }

    .bezier-values {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .value-inputs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      mat-form-field {
        width: 100%;
      }
    }

    .bezier-string {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;

      code {
        flex: 1;
        font-size: 14px;
        color: #2F4858;
      }
    }

    .bezier-presets {
      margin-top: 24px;
    }

    .preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
    }

    .bezier-preset-btn {
      font-size: 12px;
      padding: 8px 12px;
      border-color: rgba(52, 197, 170, 0.5);
      color: #34C5AA;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
      }
    }

    .toggle-editor-btn {
      width: 100%;
      margin-bottom: 24px;
      border-color: rgba(52, 197, 170, 0.5);
      color: #34C5AA;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
      }
    }

    .animation-preview-section {
      background: rgba(196, 247, 239, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin-top: 24px;
    }

    .preview-controls {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;

      .animation-select {
        width: 200px;
      }
    }

    .preview-stage {
      height: 200px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .preview-element {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border-radius: 10px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(52, 197, 170, 0.3);
      opacity: 0;

      mat-icon {
        font-size: 24px;
      }

      &.animate {
        &.animation-fade {
          animation: fadeIn var(--duration) var(--timing);
        }

        &.animation-slide {
          animation: slideIn var(--duration) var(--timing);
        }

        &.animation-scale {
          animation: scaleIn var(--duration) var(--timing);
        }

        &.animation-rotate {
          animation: rotateIn var(--duration) var(--timing);
        }

        &.animation-bounce {
          animation: bounceIn var(--duration) var(--timing);
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes rotateIn {
      from {
        opacity: 0;
        transform: rotate(-90deg) scale(0.8);
      }
      to {
        opacity: 1;
        transform: rotate(0) scale(1);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); }
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

  showCubicBezierEditor = false;
  selectedAnimation = 'fade';
  isAnimating = false;

  controlPoint1: CubicBezierPoint = { x: 0.4, y: 0 };
  controlPoint2: CubicBezierPoint = { x: 0.2, y: 1 };

  isDragging = false;
  draggingPoint = 0;

  timingPresets: TimingPreset[] = [
    {
      name: 'Ease',
      value: 'ease',
      description: 'Slow start and end',
      icon: 'trending_flat'
    },
    {
      name: 'Ease In',
      value: 'ease-in',
      description: 'Slow start',
      icon: 'trending_up'
    },
    {
      name: 'Ease Out',
      value: 'ease-out',
      description: 'Slow end',
      icon: 'trending_down'
    },
    {
      name: 'Ease In Out',
      value: 'ease-in-out',
      description: 'Slow start and end',
      icon: 'waves'
    },
    {
      name: 'Linear',
      value: 'linear',
      description: 'Constant speed',
      icon: 'show_chart'
    },
    {
      name: 'Material Design',
      value: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Google Material',
      icon: 'auto_awesome'
    },
    {
      name: 'Elastic',
      value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      description: 'Bouncy overshoot',
      icon: 'sports_handball'
    },
    {
      name: 'Back',
      value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      description: 'Slight overshoot',
      icon: 'undo'
    }
  ];

  bezierPresets = [
    { name: 'Swift Out', value: 'cubic-bezier(0.55, 0, 0.1, 1)' },
    { name: 'Heavy Move', value: 'cubic-bezier(0.7, 0, 0.2, 1)' },
    { name: 'Snap', value: 'cubic-bezier(0.86, 0, 0.07, 1)' },
    { name: 'Smooth', value: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
    { name: 'iOS', value: 'cubic-bezier(0.42, 0, 0.58, 1)' },
    { name: 'Bounce', value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
  ];

  get currentBezierString(): string {
    return `cubic-bezier(${this.controlPoint1.x.toFixed(2)}, ${this.controlPoint1.y.toFixed(2)}, ${this.controlPoint2.x.toFixed(2)}, ${this.controlPoint2.y.toFixed(2)})`;
  }

  ngOnInit(): void {
    this.parseCubicBezier();
  }

  getPreviewAnimation(preset: TimingPreset): string {
    const animationName = 'move-' + preset.name.toLowerCase().replace(/\s+/g, '-');
    return `${animationName} 2s ${preset.value} infinite`;
  }

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  selectTimingPreset(preset: TimingPreset): void {
    this.updateProperty('animationEasing', preset.value);
    this.parseCubicBezier();
  }

  parseCubicBezier(): void {
    const match = this.theme.animationEasing.match(/cubic-bezier\(([\d.-]+),\s*([\d.-]+),\s*([\d.-]+),\s*([\d.-]+)\)/);
    if (match) {
      this.controlPoint1 = { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      this.controlPoint2 = { x: parseFloat(match[3]), y: parseFloat(match[4]) };
    }
  }

  getBezierPath(): string {
    const x1 = this.controlPoint1.x * 300;
    const y1 = 300 - this.controlPoint1.y * 300;
    const x2 = this.controlPoint2.x * 300;
    const y2 = 300 - this.controlPoint2.y * 300;

    return `M 0,300 C ${x1},${y1} ${x2},${y2} 300,0`;
  }

  startDraggingPoint(point: number, event: MouseEvent): void {
    event.stopPropagation();
    this.isDragging = true;
    this.draggingPoint = point;
  }

  startDragging(event: MouseEvent): void {
    const rect = (event.target as SVGElement).getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;

    // Determine which point to drag based on proximity
    const dist1 = Math.sqrt(Math.pow(x - this.controlPoint1.x, 2) + Math.pow(y - this.controlPoint1.y, 2));
    const dist2 = Math.sqrt(Math.pow(x - this.controlPoint2.x, 2) + Math.pow(y - this.controlPoint2.y, 2));

    if (dist1 < dist2) {
      this.draggingPoint = 1;
    } else {
      this.draggingPoint = 2;
    }

    this.isDragging = true;
    this.onDrag(event);
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;

    const rect = (event.target as SVGElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = 1 - (event.clientY - rect.top) / rect.height;

    if (this.draggingPoint === 1) {
      this.controlPoint1 = { x, y };
    } else {
      this.controlPoint2 = { x, y };
    }

    this.updateCubicBezier();
  }

  stopDragging(): void {
    this.isDragging = false;
  }

  updateCubicBezier(): void {
    const bezierString = this.currentBezierString;
    this.updateProperty('animationEasing', bezierString);
  }

  applyBezierPreset(preset: { name: string; value: string }): void {
    this.updateProperty('animationEasing', preset.value);
    this.parseCubicBezier();
  }

  copyBezierString(): void {
    navigator.clipboard.writeText(this.currentBezierString);
  }

  playAnimation(): void {
    this.isAnimating = false;
    setTimeout(() => {
      this.isAnimating = true;
    }, 10);
  }

  onAnimationEnd(): void {
    this.isAnimating = false;
  }
}
