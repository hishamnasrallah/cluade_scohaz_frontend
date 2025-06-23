// Create: src/app/components/theme-controls/brand-controls/brand-controls.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ThemeConfig } from '../../../models/theme.model';

@Component({
  selector: 'app-brand-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <div class="brand-controls">
      <div class="control-group">
        <h4>Brand Identity</h4>

        <mat-form-field appearance="outline" class="theme-form-field">
          <mat-label>Brand Name</mat-label>
          <input matInput
                 [(ngModel)]="theme.brandName"
                 (ngModelChange)="updateProperty('brandName', $event)"
                 placeholder="Enter brand name">
          <mat-icon matPrefix>business</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="theme-form-field">
          <mat-label>Brand Slogan</mat-label>
          <input matInput
                 [(ngModel)]="theme.brandSlogan"
                 (ngModelChange)="updateProperty('brandSlogan', $event)"
                 placeholder="Enter brand slogan">
          <mat-icon matPrefix>format_quote</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="theme-form-field">
          <mat-label>Brand Font</mat-label>
          <input matInput
                 [(ngModel)]="theme.brandFont"
                 (ngModelChange)="updateProperty('brandFont', $event)"
                 placeholder="e.g., Poppins, sans-serif">
          <mat-icon matPrefix>font_download</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="theme-form-field">
          <mat-label>Logo URL</mat-label>
          <input matInput
                 [(ngModel)]="theme.logoUrl"
                 (ngModelChange)="updateProperty('logoUrl', $event)"
                 placeholder="Enter logo URL">
          <mat-icon matPrefix>image</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="theme-form-field">
          <mat-label>Favicon URL</mat-label>
          <input matInput
                 [(ngModel)]="theme.faviconUrl"
                 (ngModelChange)="updateProperty('faviconUrl', $event)"
                 placeholder="Enter favicon URL">
          <mat-icon matPrefix>bookmark</mat-icon>
        </mat-form-field>
      </div>

      <div class="control-group">
        <h4>Gradients</h4>

        <mat-checkbox [(ngModel)]="theme.enableGradients"
                      (ngModelChange)="updateProperty('enableGradients', $event)">
          Enable Gradients
        </mat-checkbox>

        <div *ngIf="theme.enableGradients" class="gradient-controls">
          <mat-form-field appearance="outline" class="theme-form-field">
            <mat-label>Primary Gradient</mat-label>
            <input matInput
                   [(ngModel)]="theme.primaryGradient"
                   (ngModelChange)="updateProperty('primaryGradient', $event)"
                   placeholder="e.g., linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)">
          </mat-form-field>

          <mat-form-field appearance="outline" class="theme-form-field">
            <mat-label>Secondary Gradient</mat-label>
            <input matInput
                   [(ngModel)]="theme.secondaryGradient"
                   (ngModelChange)="updateProperty('secondaryGradient', $event)">
          </mat-form-field>

          <mat-form-field appearance="outline" class="theme-form-field">
            <mat-label>Accent Gradient</mat-label>
            <input matInput
                   [(ngModel)]="theme.accentGradient"
                   (ngModelChange)="updateProperty('accentGradient', $event)">
          </mat-form-field>

          <mat-form-field appearance="outline" class="theme-form-field">
            <mat-label>Background Gradient</mat-label>
            <input matInput
                   [(ngModel)]="theme.backgroundGradient"
                   (ngModelChange)="updateProperty('backgroundGradient', $event)">
          </mat-form-field>

          <div class="control-item">
            <label>Gradient Angle: {{ theme.gradientAngle }}°</label>
            <mat-slider [min]="0" [max]="360" [step]="15"
                        [(ngModel)]="theme.gradientAngle"
                        (ngModelChange)="updateProperty('gradientAngle', $event)"
                        [discrete]="true">
              <input matSliderThumb>
            </mat-slider>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .brand-controls {
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
    }

    .theme-form-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .gradient-controls {
      margin-top: 16px;
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
  `]
})
export class BrandControlsComponent {
  @Input() theme!: ThemeConfig;
  @Output() themeChange = new EventEmitter<Partial<ThemeConfig>>();

  updateProperty(key: keyof ThemeConfig, value: any): void {
    this.themeChange.emit({ [key]: value });
  }
}
