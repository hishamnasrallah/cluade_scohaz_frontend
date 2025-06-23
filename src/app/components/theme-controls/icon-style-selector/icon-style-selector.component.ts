// src/app/components/theme-controls/icon-style-selector/icon-style-selector.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig } from '../../../models/theme.model';
import { ICON_STYLES, StyleOption } from '../../theme-creator/constants/style-options.constant';

interface IconStylePreview {
  style: string;
  icons: { name: string; class: string }[];
}

@Component({
  selector: 'app-icon-style-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="icon-style-selector">
      <div class="control-group">
        <h4>Icon Style</h4>

        <div class="icon-style-grid">
          <div *ngFor="let style of iconStyles"
               class="icon-style-option"
               [class.active]="theme.iconStyle === style.value"
               (click)="selectIconStyle(style.value)">

            <div class="icon-preview-container">
              <mat-icon class="icon-preview"
                        [class]="getIconClass(style.value)">
                home
              </mat-icon>
              <mat-icon class="icon-preview"
                        [class]="getIconClass(style.value)">
                favorite
              </mat-icon>
              <mat-icon class="icon-preview"
                        [class]="getIconClass(style.value)">
                settings
              </mat-icon>
            </div>

            <div class="style-info">
              <span class="style-name">{{ style.label }}</span>
              <span class="style-description">{{ getStyleDescription(style.value) }}</span>
            </div>
          </div>
        </div>

        <!-- Advanced Icon Settings -->
        <div class="advanced-settings">
          <h5>Icon Preview</h5>

          <div class="icon-showcase">
            <div class="showcase-section">
              <h6>Navigation Icons</h6>
              <div class="icon-row">
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'home'">home</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'dashboard'">dashboard</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'menu'">menu</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'search'">search</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'notifications'">notifications</mat-icon>
              </div>
            </div>

            <div class="showcase-section">
              <h6>Action Icons</h6>
              <div class="icon-row">
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'add'">add</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'edit'">edit</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'delete'">delete</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'save'">save</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'share'">share</mat-icon>
              </div>
            </div>

            <div class="showcase-section">
              <h6>Status Icons</h6>
              <div class="icon-row">
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'check_circle'"
                          [style.color]="theme.successColor">check_circle</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'warning'"
                          [style.color]="theme.warningColor">warning</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'error'"
                          [style.color]="theme.errorColor">error</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'info'"
                          [style.color]="theme.infoColor">info</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'help'">help</mat-icon>
              </div>
            </div>

            <div class="showcase-section">
              <h6>Content Icons</h6>
              <div class="icon-row">
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'folder'">folder</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'insert_drive_file'">insert_drive_file</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'image'">image</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'videocam'">videocam</mat-icon>
                <mat-icon [class]="currentIconClass"
                          [matTooltip]="'attachment'">attachment</mat-icon>
              </div>
            </div>
          </div>

          <!-- Icon Size Demo -->
          <div class="icon-sizes">
            <h6>Icon Sizes</h6>
            <div class="size-row">
              <div class="size-demo">
                <mat-icon [class]="currentIconClass"
                          class="icon-xs">star</mat-icon>
                <span>Extra Small (16px)</span>
              </div>
              <div class="size-demo">
                <mat-icon [class]="currentIconClass"
                          class="icon-sm">star</mat-icon>
                <span>Small (20px)</span>
              </div>
              <div class="size-demo">
                <mat-icon [class]="currentIconClass"
                          class="icon-md">star</mat-icon>
                <span>Medium (24px)</span>
              </div>
              <div class="size-demo">
                <mat-icon [class]="currentIconClass"
                          class="icon-lg">star</mat-icon>
                <span>Large (32px)</span>
              </div>
              <div class="size-demo">
                <mat-icon [class]="currentIconClass"
                          class="icon-xl">star</mat-icon>
                <span>Extra Large (40px)</span>
              </div>
            </div>
          </div>

          <!-- Icon Usage Examples -->
          <div class="usage-examples">
            <h6>Usage Examples</h6>

            <div class="example-item">
              <button mat-raised-button color="primary">
                <mat-icon [class]="currentIconClass">add</mat-icon>
                Add New Item
              </button>
            </div>

            <div class="example-item">
              <button mat-icon-button>
                <mat-icon [class]="currentIconClass">more_vert</mat-icon>
              </button>
            </div>

            <div class="example-item">
              <div class="list-item-demo">
                <mat-icon [class]="currentIconClass"
                          [style.color]="theme.primaryColor">folder</mat-icon>
                <span>Documents</span>
                <mat-icon [class]="currentIconClass" class="trailing">chevron_right</mat-icon>
              </div>
            </div>

            <div class="example-item">
              <div class="chip-demo" [style.background]="theme.surfaceHover">
                <mat-icon [class]="currentIconClass" class="chip-icon">person</mat-icon>
                <span>John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .icon-style-selector {
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
        margin: 24px 0 16px;
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

    .icon-style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .icon-style-option {
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;

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
    }

    .icon-preview-container {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 16px;
    }

    .icon-preview {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #2F4858;
    }

    .style-info {
      text-align: center;

      .style-name {
        display: block;
        font-weight: 600;
        color: #2F4858;
        margin-bottom: 4px;
      }

      .style-description {
        display: block;
        font-size: 12px;
        color: #6B7280;
      }
    }

    .advanced-settings {
      background: rgba(196, 247, 239, 0.1);
      border-radius: 16px;
      padding: 24px;
    }

    .icon-showcase {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .showcase-section {
      background: white;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .icon-row {
      display: flex;
      gap: 16px;
      align-items: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          transform: scale(1.2);
        }
      }
    }

    .icon-sizes {
      margin-top: 24px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .size-row {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-end;
    }

    .size-demo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      span {
        font-size: 12px;
        color: #6B7280;
      }

      .icon-xs {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }

      .icon-sm {
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }

      .icon-md {
        font-size: 24px !important;
        width: 24px !important;
        height: 24px !important;
      }

      .icon-lg {
        font-size: 32px !important;
        width: 32px !important;
        height: 32px !important;
      }

      .icon-xl {
        font-size: 40px !important;
        width: 40px !important;
        height: 40px !important;
      }
    }

    .usage-examples {
      margin-top: 24px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .example-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .list-item-demo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #F9FAFB;
      border-radius: 8px;
      font-weight: 500;

      .trailing {
        margin-left: auto;
        color: #9CA3AF;
      }
    }

    .chip-demo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;

      .chip-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
      }
    }

    // Icon style classes
    ::ng-deep {
      .icon-outlined {
        font-family: 'Material Icons Outlined' !important;
      }

      .icon-filled {
        font-family: 'Material Icons' !important;
      }

      .icon-rounded {
        font-family: 'Material Icons Round' !important;
      }

      .icon-sharp {
        font-family: 'Material Icons Sharp' !important;
      }

      .icon-two-tone {
        font-family: 'Material Icons Two Tone' !important;
      }
    }
  `]
})
export class IconStyleSelectorComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  iconStyles: StyleOption[] = ICON_STYLES;

  get currentIconClass(): string {
    return `icon-${this.theme.iconStyle}`;
  }

  selectIconStyle(style: string): void {
    this.themeChange.emit({ iconStyle: style as 'outlined' | 'filled' | 'rounded' | 'sharp' | 'two-tone' });
  }

  getIconClass(style: string): string {
    return `icon-${style}`;
  }

  getStyleDescription(style: string): string {
    const descriptions: { [key: string]: string } = {
      'outlined': 'Thin, outlined icons',
      'filled': 'Solid filled icons',
      'rounded': 'Rounded corners',
      'sharp': 'Sharp corners',
      'two-tone': 'Two-tone colored'
    };
    return descriptions[style] || '';
  }
}
