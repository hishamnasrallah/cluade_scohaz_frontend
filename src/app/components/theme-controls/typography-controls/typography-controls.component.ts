import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-typography-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="typography-controls">
      <div class="control-group">
        <label>Font Family</label>
        <select
          [value]="theme.fontFamily"
          (change)="updateProperty('fontFamily', $any($event.target).value)"
          class="form-select"
        >
          <option value="Inter, system-ui, sans-serif">Inter (Modern)</option>
          <option value="system-ui, sans-serif">System UI</option>
          <option value="Georgia, serif">Georgia (Serif)</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
        </select>
      </div>

      <div class="slider-group">
        <div class="control-group">
          <label>Font Size: {{ theme.fontSizeBase }}px</label>
          <input
            type="range"
            min="12"
            max="24"
            [value]="theme.fontSizeBase"
            (input)="updateProperty('fontSizeBase', +$any($event.target).value)"
            class="slider"
          />
        </div>

        <div class="control-group">
          <label>Font Weight: {{ theme.fontWeight }}</label>
          <input
            type="range"
            min="100"
            max="900"
            step="100"
            [value]="theme.fontWeight"
            (input)="updateProperty('fontWeight', +$any($event.target).value)"
            class="slider"
          />
        </div>

        <div class="control-group">
          <label>Line Height: {{ theme.lineHeight }}</label>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            [value]="theme.lineHeight"
            (input)="updateProperty('lineHeight', +$any($event.target).value)"
            class="slider"
          />
        </div>

        <div class="control-group">
          <label>Letter Spacing: {{ theme.letterSpacing }}em</label>
          <input
            type="range"
            min="-0.05"
            max="0.1"
            step="0.01"
            [value]="theme.letterSpacing"
            (input)="updateProperty('letterSpacing', +$any($event.target).value)"
            class="slider"
          />
        </div>
      </div>

      <div class="control-group">
        <label>Heading Font Family</label>
        <select
          [value]="theme.headingFontFamily"
          (change)="updateProperty('headingFontFamily', $any($event.target).value)"
          class="form-select"
        >
          <option value="'Inter Display', Inter, system-ui, sans-serif">Inter Display</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="system-ui, sans-serif">System UI</option>
        </select>
      </div>

      <div class="control-group">
        <label>Heading Font Weight: {{ theme.headingFontWeight }}</label>
        <input
          type="range"
          min="300"
          max="900"
          step="100"
          [value]="theme.headingFontWeight"
          (input)="updateProperty('headingFontWeight', +$any($event.target).value)"
          class="slider"
        />
      </div>
    </div>
  `,
  styles: [`
    .typography-controls {
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

      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary-500);
        cursor: pointer;
        border: none;
      }
    }

    .slider-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }
  `]
})
export class TypographyControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
