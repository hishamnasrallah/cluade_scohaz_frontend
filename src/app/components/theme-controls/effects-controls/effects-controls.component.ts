// src/app/components/theme-controls/effects-controls/effects-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-effects-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="effects-controls">
      <div class="control-group">
        <label>Shadow Intensity: {{ (theme.shadowIntensity * 100).toFixed(0) }}%</label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          [value]="theme.shadowIntensity"
          (input)="updateProperty('shadowIntensity', +$any($event.target).value)"
          class="slider"
        />
        <div class="shadow-preview">
          <div
            class="shadow-box"
            [style.box-shadow]="getShadowStyle()"
          >
            Shadow Preview
          </div>
        </div>
      </div>

      <div class="control-group">
        <label>Blur Intensity: {{ theme.blurIntensity }}px</label>
        <input
          type="range"
          min="0"
          max="30"
          [value]="theme.blurIntensity"
          (input)="updateProperty('blurIntensity', +$any($event.target).value)"
          class="slider"
        />
        <div class="blur-preview" *ngIf="theme.enableBlur">
          <div class="blur-background"></div>
          <div
            class="blur-box"
            [style.backdrop-filter]="'blur(' + theme.blurIntensity + 'px)'"
          >
            Blur Effect Preview
          </div>
        </div>
      </div>

      <div class="control-group">
        <label>Animation Speed: {{ theme.animationSpeed }}ms</label>
        <input
          type="range"
          min="100"
          max="800"
          step="50"
          [value]="theme.animationSpeed"
          (input)="updateProperty('animationSpeed', +$any($event.target).value)"
          class="slider"
        />
        <div class="animation-preview">
          <div
            class="animation-box"
            [style.animation-duration.ms]="theme.animationSpeed"
            [style.transition-duration.ms]="theme.animationSpeed"
          >
            Hover me!
          </div>
        </div>
      </div>

      <div class="control-group">
        <label>Animation Easing</label>
        <select
          [value]="theme.animationEasing"
          (change)="updateProperty('animationEasing', $any($event.target).value)"
          class="form-select"
        >
          <option value="ease">Ease</option>
          <option value="ease-in">Ease In</option>
          <option value="ease-out">Ease Out</option>
          <option value="ease-in-out">Ease In Out</option>
          <option value="linear">Linear</option>
          <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bounce</option>
          <option value="cubic-bezier(0.4, 0, 0.2, 1)">Material</option>
        </select>
        <div class="easing-preview">
          <div
            class="easing-box"
            [style.transition]="'transform ' + theme.animationSpeed + 'ms ' + theme.animationEasing"
          >
            Test Easing
          </div>
        </div>
      </div>

      <div class="control-group">
        <h4>Performance & Effects</h4>
        <div class="toggle-list">
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="theme.enableAnimations"
              (change)="updateProperty('enableAnimations', $any($event.target).checked)"
            />
            <span class="toggle-switch"></span>
            <span>Enable Animations</span>
          </label>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="theme.enableBlur"
              (change)="updateProperty('enableBlur', $any($event.target).checked)"
            />
            <span class="toggle-switch"></span>
            <span>Enable Blur Effects</span>
          </label>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="theme.enableShadows"
              (change)="updateProperty('enableShadows', $any($event.target).checked)"
            />
            <span class="toggle-switch"></span>
            <span>Enable Shadows</span>
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .effects-controls {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .control-group {
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      background: rgba(196, 247, 239, 0.3);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(196, 247, 239, 0.5);
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.3);
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(52, 197, 170, 0.4);
        }
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.3);
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 12px rgba(52, 197, 170, 0.4);
        }
      }
    }

    .form-select {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      background-color: white;
      color: #2F4858;
      font-size: 14px;
      transition: all 0.2s ease;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }
    }

    .shadow-preview {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }

    .shadow-box {
      padding: 24px 48px;
      background-color: white;
      border-radius: 12px;
      text-align: center;
      font-weight: 500;
      color: #2F4858;
      transition: box-shadow 0.3s ease-out;
    }

    .blur-preview {
      margin-top: 16px;
      position: relative;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
    }

    .blur-background {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      &::before {
        content: 'Background Content';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .blur-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 16px 32px;
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      color: #2F4858;
    }

    .animation-preview {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }

    .animation-box {
      padding: 16px 32px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 500;
      transition: transform var(--duration-normal) var(--ease-out);
      animation: pulse 2s infinite;

      &:hover {
        transform: translateY(-2px) scale(1.05);
        animation: none;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .easing-preview {
      margin-top: 16px;
      height: 60px;
      background: rgba(196, 247, 239, 0.2);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .easing-box {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        transform: translateY(-50%) translateX(calc(100% + 20px));
      }
    }

    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      position: relative;
      padding-left: 52px;

      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .toggle-switch {
        position: absolute;
        left: 0;
        width: 44px;
        height: 24px;
        background: rgba(196, 247, 239, 0.5);
        border-radius: 12px;
        transition: all 0.3s ease;
        border: 2px solid rgba(52, 197, 170, 0.3);

        &::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }

      input:checked + .toggle-switch {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        border-color: transparent;

        &::after {
          transform: translateX(20px);
        }
      }

      span:last-child {
        font-size: 14px;
        font-weight: 500;
        color: #4B5563;
      }
    }
  `]
})
export class EffectsControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }

  getShadowStyle(): string {
    if (!this.theme.enableShadows) return 'none';

    const intensity = this.theme.shadowIntensity;
    return `
      0 4px 6px rgba(0, 0, 0, ${intensity}),
      0 1px 3px rgba(0, 0, 0, ${intensity * 0.8})
    `.trim();
  }
}
