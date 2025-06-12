// components/theme-controls/spacing-controls/spacing-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-spacing-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="spacing-controls">
      <div class="control-group">
        <label>Spacing Unit: {{ theme.spacingUnit }}px</label>
        <input
          type="range"
          min="4"
          max="32"
          [value]="theme.spacingUnit"
          (input)="updateProperty('spacingUnit', +$any($event.target).value)"
          class="slider"
        />
        <div class="spacing-preview">
          <div class="spacing-box" *ngFor="let multiplier of [1, 2, 3, 4]">
            <span>{{ multiplier }}x = {{ theme.spacingUnit * multiplier }}px</span>
          </div>
        </div>
      </div>

      <div class="control-group">
        <label>Border Radius: {{ theme.borderRadius }}px</label>
        <input
          type="range"
          min="0"
          max="24"
          [value]="theme.borderRadius"
          (input)="updateProperty('borderRadius', +$any($event.target).value)"
          class="slider"
        />
        <div class="radius-preview">
          <div
            class="radius-box"
            [style.border-radius.px]="theme.borderRadius"
          ></div>
        </div>
      </div>

      <div class="control-group">
        <label>Border Width: {{ theme.borderWidth }}px</label>
        <input
          type="range"
          min="0"
          max="4"
          [value]="theme.borderWidth"
          (input)="updateProperty('borderWidth', +$any($event.target).value)"
          class="slider"
        />
      </div>

      <div class="control-group">
        <label>Design Style</label>
        <div class="style-grid">
          <button
            *ngFor="let style of designStyles"
            class="style-button"
            [class.active]="theme.designStyle === style.value"
            (click)="updateProperty('designStyle', style.value)"
          >
            {{ style.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>Card Style</label>
        <div class="style-grid">
          <button
            *ngFor="let style of cardStyles"
            class="style-button"
            [class.active]="theme.cardStyle === style"
            (click)="updateProperty('cardStyle', style)"
          >
            {{ style }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spacing-controls {
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

    .spacing-preview {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
    }

    .spacing-box {
      flex: 1;
      padding: var(--spacing-2);
      background-color: var(--surface-hover);
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-sm);
      text-align: center;
      font-size: var(--text-xs);
    }

    .radius-preview {
      margin-top: var(--spacing-2);
      display: flex;
      justify-content: center;
    }

    .radius-box {
      width: 100px;
      height: 100px;
      background-color: var(--color-primary-500);
      transition: border-radius var(--duration-fast) var(--ease-out);
    }

    .style-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-2);
    }

    .style-button {
      padding: var(--spacing-2) var(--spacing-3);
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-sm);
      background-color: var(--surface-background);
      color: var(--text-primary);
      font-size: var(--text-sm);
      cursor: pointer;
      text-transform: capitalize;
      transition: all var(--duration-fast) var(--ease-out);

      &:hover {
        background-color: var(--surface-hover);
      }

      &.active {
        background-color: var(--color-primary-500);
        color: white;
        border-color: var(--color-primary-500);
      }
    }
  `]
})
export class SpacingControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  designStyles = [
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'glassmorphic', label: 'Glass' },
    { value: 'neumorphic', label: 'Neuro' },
    { value: 'material', label: 'Material' }
  ];

  cardStyles = ['elevated', 'flat', 'bordered', 'glass'];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
