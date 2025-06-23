// src/app/components/theme-controls/spacing-controls/spacing-controls.component.ts
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
        <div class="border-preview">
          <div
            class="border-box"
            [style.border-width.px]="theme.borderWidth"
          >Border Preview</div>
        </div>
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
            <span class="style-icon">{{ style.icon }}</span>
            <span>{{ style.label }}</span>
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

    .spacing-preview {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .spacing-box {
      flex: 1;
      padding: 8px;
      background-color: rgba(196, 247, 239, 0.2);
      border: 1px solid rgba(52, 197, 170, 0.3);
      border-radius: 6px;
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      color: #2F4858;
    }

    .radius-preview {
      margin-top: 12px;
      display: flex;
      justify-content: center;
    }

    .radius-box {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      transition: border-radius 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(52, 197, 170, 0.3);
    }

    .border-preview {
      margin-top: 12px;
      display: flex;
      justify-content: center;
    }

    .border-box {
      padding: 20px 40px;
      background: white;
      border: solid #34C5AA;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      color: #2F4858;
      transition: border-width 0.3s ease-out;
    }

    .style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .style-button {
      padding: 12px 16px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      background-color: white;
      color: #4B5563;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-transform: capitalize;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .style-icon {
        font-size: 18px;
      }

      &:hover {
        background-color: rgba(196, 247, 239, 0.3);
        border-color: #34C5AA;
        transform: translateY(-1px);
      }

      &.active {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(52, 197, 170, 0.3);
      }
    }
  `]
})
export class SpacingControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  designStyles = [
    { value: 'modern', label: 'Modern', icon: '✨' },
    { value: 'minimal', label: 'Minimal', icon: '⚡' },
    { value: 'glassmorphic', label: 'Glass', icon: '🔮' },
    { value: 'neumorphic', label: 'Neuro', icon: '🎭' },
    { value: 'material', label: 'Material', icon: '📐' }
  ];

  cardStyles = ['elevated', 'flat', 'bordered', 'glass'];

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
