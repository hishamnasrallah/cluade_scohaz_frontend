// src/app/components/theme-controls/color-picker/color-picker.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

interface ColorGroup {
  title: string;
  colors: Array<{
    key: keyof ThemeConfig;
    label: string;
    allowAlpha?: boolean;
  }>;
}

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-picker-container">
      <div *ngFor="let group of colorGroups" class="color-group">
        <h4>{{ group.title }}</h4>
        <div *ngFor="let color of group.colors" class="color-control">
          <label>{{ color.label }}</label>
          <div class="color-input-wrapper">
            <input
              *ngIf="!color.allowAlpha"
              type="color"
              [value]="theme[color.key]"
              (input)="updateColor(color.key, $any($event.target).value)"
              class="color-picker"
            />
            <input
              type="text"
              [value]="theme[color.key]"
              (input)="updateColor(color.key, $any($event.target).value)"
              class="color-text"
              [class.full-width]="color.allowAlpha"
              [placeholder]="color.allowAlpha ? 'rgba(0, 0, 0, 0.5)' : '#000000'"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .color-group {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .color-control {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }
    }

    .color-input-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .color-picker {
      width: 48px;
      height: 36px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      cursor: pointer;
      background-color: transparent;
      padding: 2px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #34C5AA;
      }

      &::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      &::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
      }
    }

    .color-text {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      background-color: white;
      color: #2F4858;
      transition: all 0.2s ease;

      &.full-width {
        width: 100%;
      }

      &:focus {
        outline: none;
        border-color: #34C5AA;
        box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
      }

      &::placeholder {
        color: #9CA3AF;
      }
    }

    :host ::ng-deep {
      input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 6px;
      }

      input[type="color"]::-moz-color-swatch {
        border: none;
        border-radius: 6px;
      }
    }
  `]
})
export class ColorPickerComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  colorGroups: ColorGroup[] = [
    {
      title: 'Core Colors',
      colors: [
        { key: 'primaryColor', label: 'Primary' },
        { key: 'secondaryColor', label: 'Secondary' },
        { key: 'backgroundColor', label: 'Background' },
        { key: 'textColor', label: 'Text' },
        { key: 'accentColor', label: 'Accent' }
      ]
    },
    {
      title: 'Semantic Colors',
      colors: [
        { key: 'successColor', label: 'Success' },
        { key: 'warningColor', label: 'Warning' },
        { key: 'errorColor', label: 'Error' },
        { key: 'infoColor', label: 'Info' }
      ]
    },
    {
      title: 'Surface Colors',
      colors: [
        { key: 'surfaceCard', label: 'Card Background' },
        { key: 'surfaceModal', label: 'Modal Background' },
        { key: 'surfaceHover', label: 'Hover State', allowAlpha: true }
      ]
    }
  ];

  updateColor(key: keyof ThemeConfig, value: string): void {
    // Validate color format
    const isValidColor = this.isValidColor(value);
    if (isValidColor) {
      this.themeChange.emit({ [key]: value });
    }
  }

  private isValidColor(color: string): boolean {
    // Check hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }

    // Check rgb/rgba
    if (/^rgba?\(.+\)$/.test(color)) {
      return true;
    }

    // Check hsl/hsla
    if (/^hsla?\(.+\)$/.test(color)) {
      return true;
    }

    // Check named colors
    const namedColors = ['transparent', 'white', 'black', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta'];
    if (namedColors.includes(color.toLowerCase())) {
      return true;
    }

    return false;
  }
}
