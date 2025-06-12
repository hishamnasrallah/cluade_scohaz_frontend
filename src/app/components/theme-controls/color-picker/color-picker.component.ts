import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

interface ColorGroup {
  title: string;
  colors: Array<{
    key: keyof ThemeConfig;
    label: string;
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
              placeholder="#000000"
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
      gap: var(--spacing-6);
    }

    .color-group {
      h4 {
        margin: 0 0 var(--spacing-3) 0;
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
      }
    }

    .color-control {
      margin-bottom: var(--spacing-3);

      label {
        display: block;
        margin-bottom: var(--spacing-1);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }

    .color-input-wrapper {
      display: flex;
      gap: var(--spacing-2);
      align-items: center;
    }

    .color-picker {
      width: 48px;
      height: 32px;
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-sm);
      cursor: pointer;
      background-color: transparent;
      padding: 2px;
    }

    .color-text {
      flex: 1;
      padding: var(--spacing-2);
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-sm);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      background-color: var(--surface-background);
      color: var(--text-primary);
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
        { key: 'surfaceHover', label: 'Hover State' }
      ]
    }
  ];

  updateColor(key: keyof ThemeConfig, value: string): void {
    this.themeChange.emit({ [key]: value });
  }
}
