// src/app/components/theme-controls/typography-controls/typography-controls.component.ts
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
          <option value="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">System UI</option>
          <option value="'Roboto', sans-serif">Roboto</option>
          <option value="'Open Sans', sans-serif">Open Sans</option>
          <option value="'Lato', sans-serif">Lato</option>
          <option value="'Montserrat', sans-serif">Montserrat</option>
          <option value="'Raleway', sans-serif">Raleway</option>
          <option value="Georgia, serif">Georgia (Serif)</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="'Merriweather', serif">Merriweather</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="Helvetica, Arial, sans-serif">Helvetica</option>
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
          <div class="font-size-preview">
            <span [style.font-size.px]="12">Small (12px)</span>
            <span [style.font-size.px]="theme.fontSizeBase">Base ({{ theme.fontSizeBase }}px)</span>
            <span [style.font-size.px]="24">Large (24px)</span>
          </div>
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
          <div class="font-weight-preview">
            <span style="font-weight: 300">Light (300)</span>
            <span [style.font-weight]="theme.fontWeight">Current ({{ theme.fontWeight }})</span>
            <span style="font-weight: 700">Bold (700)</span>
          </div>
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
          <div class="line-height-preview">
            <p [style.line-height]="theme.lineHeight">
              This is a sample paragraph demonstrating line height.
              The spacing between lines affects readability and the overall appearance of text blocks.
              Adjust the slider to see how different line heights impact the text flow.
            </p>
          </div>
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
          <div class="letter-spacing-preview">
            <span [style.letter-spacing.em]="theme.letterSpacing">
              Letter spacing affects character separation
            </span>
          </div>
        </div>
      </div>

      <div class="control-group">
        <label>Heading Font Family</label>
        <select
          [value]="theme.headingFontFamily"
          (change)="updateProperty('headingFontFamily', $any($event.target).value)"
          class="form-select"
        >
          <option value="'Poppins', sans-serif">Poppins</option>
          <option value="'Inter Display', Inter, system-ui, sans-serif">Inter Display</option>
          <option value="'Montserrat', sans-serif">Montserrat</option>
          <option value="'Raleway', sans-serif">Raleway</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
          <option value="'Merriweather', serif">Merriweather</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="system-ui, sans-serif">System UI</option>
          <option value="inherit">Same as Body</option>
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

      <div class="typography-preview-section">
        <h4>Typography Preview</h4>
        <div class="preview-content"
             [style.font-family]="theme.fontFamily"
             [style.font-size.px]="theme.fontSizeBase"
             [style.font-weight]="theme.fontWeight"
             [style.line-height]="theme.lineHeight"
             [style.letter-spacing.em]="theme.letterSpacing">
          <h1 [style.font-family]="theme.headingFontFamily"
              [style.font-weight]="theme.headingFontWeight">
            Heading Level 1
          </h1>
          <h2 [style.font-family]="theme.headingFontFamily"
              [style.font-weight]="theme.headingFontWeight">
            Heading Level 2
          </h2>
          <h3 [style.font-family]="theme.headingFontFamily"
              [style.font-weight]="theme.headingFontWeight">
            Heading Level 3
          </h3>
          <p>
            This is a paragraph of body text using your selected typography settings.
            It demonstrates how your chosen font family, size, weight, line height,
            and letter spacing work together to create readable content.
          </p>
          <p>
            <strong>Bold text</strong> and <em>italic text</em> are also affected by your font choices.
            <a href="#" (click)="$event.preventDefault()">Links inherit these settings too.</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .typography-controls {
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

    .slider-group {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .font-size-preview,
    .font-weight-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding: 12px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 8px;
      font-family: inherit;

      span {
        color: #2F4858;
      }
    }

    .line-height-preview {
      margin-top: 12px;
      padding: 16px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 8px;

      p {
        margin: 0;
        color: #2F4858;
        font-size: 14px;
      }
    }

    .letter-spacing-preview {
      margin-top: 12px;
      padding: 16px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 8px;
      text-align: center;

      span {
        color: #2F4858;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .typography-preview-section {
      margin-top: 32px;
      padding: 24px;
      background: white;
      border: 2px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;

      h4 {
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: #2F4858;
        font-family: 'Poppins', sans-serif;
      }
    }

    .preview-content {
      h1, h2, h3 {
        margin: 0 0 16px 0;
        color: #2F4858;
      }

      h1 { font-size: 2.5em; }
      h2 { font-size: 2em; }
      h3 { font-size: 1.5em; }

      p {
        margin: 0 0 12px 0;
        color: #4B5563;

        &:last-child {
          margin-bottom: 0;
        }
      }

      a {
        color: #34C5AA;
        text-decoration: none;
        transition: all 0.2s ease;

        &:hover {
          color: #2BA99B;
          text-decoration: underline;
        }
      }

      strong {
        font-weight: 700;
        color: #2F4858;
      }

      em {
        font-style: italic;
      }
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
