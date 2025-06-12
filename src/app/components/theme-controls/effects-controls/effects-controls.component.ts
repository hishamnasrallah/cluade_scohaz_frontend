// components/theme-controls/effects-controls/effects-controls.component.ts
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
        </select>
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
            <span>Enable Animations</span>
          </label>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="theme.enableBlur"
              (change)="updateProperty('enableBlur', $any($event.target).checked)"
            />
            <span>Enable Blur Effects</span>
          </label>
          <label class="toggle-label">
            <input
              type="checkbox"
              [checked]="theme.enableShadows"
              (change)="updateProperty('enableShadows', $any($event.target).checked)"
            />
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
      gap: var(--spacing-4);
    }

    .control-group {
      label {
        display: block;
        margin-bottom: var(--spacing-2);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      h4 {
        margin: 0 0 var(--spacing-3) 0;
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
      }
    }

    .slider {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      background: var(--border-default);

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary-500);
        cursor: pointer;
      }
    }

    .form-select {
      width: 100%;
      padding: var(--spacing-2);
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-sm);
      background-color: var(--surface-background);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .shadow-preview {
      margin-top: var(--spacing-3);
      display: flex;
      justify-content: center;
    }

    .shadow-box {
      padding: var(--spacing-4);
      background-color: var(--surface-card);
      border-radius: var(--rounded-md);
      text-align: center;
      transition: box-shadow var(--duration-fast) var(--ease-out);
    }

    .animation-preview {
      margin-top: var(--spacing-3);
      display: flex;
      justify-content: center;
    }

    .animation-box {
      padding: var(--spacing-3) var(--spacing-6);
      background-color: var(--color-primary-500);
      color: white;
      border-radius: var(--rounded-md);
      cursor: pointer;
      transition: transform var(--duration-normal) var(--ease-out);

      &:hover {
        transform: translateY(-2px) scale(1.05);
      }
    }

    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      cursor: pointer;

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      span {
        font-size: var(--text-sm);
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
    const intensity = this.theme.shadowIntensity;
    return `0 4px 6px rgba(0, 0, 0, ${intensity}), 0 1px 3px rgba(0, 0, 0, ${intensity * 0.8})`;
  }
}
