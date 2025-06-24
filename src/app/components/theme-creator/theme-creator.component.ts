// src/app/components/theme-creator/theme-creator.component.ts (Updated export functionality)
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Theme Control Components
import { AdvancedColorControlsComponent } from '../theme-controls/advanced-color-controls/advanced-color-controls.component';
import { AdvancedTypographyControlsComponent } from '../theme-controls/advanced-typography-controls/advanced-typography-controls.component';
import { BorderControlsComponent } from '../theme-controls/border-controls/border-controls.component';
import { LayoutControlsComponent } from '../theme-controls/layout-controls/layout-controls.component';
import { ShadowControlsComponent } from '../theme-controls/shadow-controls/shadow-controls.component';
import { ComponentControlsComponent } from '../theme-controls/component-controls/component-controls.component';
import { AnimationControlsComponent } from '../theme-controls/animation-controls/animation-controls.component';
import { BrandControlsComponent } from '../theme-controls/brand-controls/brand-controls.component';
import { AccessibilityControlsComponent } from '../theme-controls/accessibility-controls/accessibility-controls.component';

// NEW ADVANCED COMPONENTS
import { GradientEditorComponent } from '../theme-controls/gradient-editor/gradient-editor.component';
import { IconStyleSelectorComponent } from '../theme-controls/icon-style-selector/icon-style-selector.component';
import { DensityControlsComponent } from '../theme-controls/density-controls/density-controls.component';
import { ColorPaletteDisplayComponent } from '../theme-controls/color-palette-display/color-palette-display.component';

// Dialog Component
import { ExportThemeDialogComponent } from '../theme-controls/dialogs/export-theme-dialog.component';
import { ShowcaseDialogComponent } from '../theme-controls/dialogs/showcase-dialog.component';

// Services and View Model
import { ThemeService } from '../../services/theme.service';
import { ThemeFormService } from './services/theme-form.service';
import { ThemePreviewService } from './services/theme-preview.service';
import { ThemeCreatorViewModel } from './view-models/theme-creator.view-model';

// Utils
import { ThemeImportExportUtil } from './utils/theme-import-export.util';

// Constants
import { THEME_PRESETS } from './constants/theme-presets.constant';
import {
  SAMPLE_METRICS,
  NAVIGATION_ITEMS,
  ENTERPRISE_FEATURES,
  SampleMetric,
  EnterpriseFeature
} from './constants/preview-data.constant';
import {
  NAVIGATION_STYLES,
  BUTTON_STYLES,
  StyleOption
} from './constants/style-options.constant';

// Models
import { ThemePreset, getContrastRatio } from '../../models/theme.model';

@Component({
  selector: 'app-theme-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    // Theme Control Components
    AdvancedColorControlsComponent,
    AdvancedTypographyControlsComponent,
    BorderControlsComponent,
    LayoutControlsComponent,
    ShadowControlsComponent,
    ComponentControlsComponent,
    AnimationControlsComponent,
    BrandControlsComponent,
    AccessibilityControlsComponent,
    GradientEditorComponent,
    IconStyleSelectorComponent,
    DensityControlsComponent,
    ColorPaletteDisplayComponent,
    // Dialog
    // ExportThemeDialogComponent
  ],
  providers: [
    ThemeFormService,
    ThemePreviewService,
    ThemeCreatorViewModel
  ],
  templateUrl: './theme-creator.component.html',
  styleUrls: ['./theme-creator.component.scss']
})
export class ThemeCreatorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('previewContainer', { read: ElementRef }) previewContainer!: ElementRef;

  private previewRoot!: HTMLElement;

  // Constants exposed to template
  readonly themePresets: ThemePreset[] = THEME_PRESETS;
  readonly sampleMetrics: SampleMetric[] = SAMPLE_METRICS;
  readonly navigationItems = NAVIGATION_ITEMS;
  readonly navigationStyles: StyleOption[] = NAVIGATION_STYLES;
  readonly buttonStyles: StyleOption[] = BUTTON_STYLES;
  readonly enterpriseFeatures: EnterpriseFeature[] = ENTERPRISE_FEATURES;

  // Delegate to view model
  get currentTheme() { return this.vm.currentTheme; }
  get themeForm() { return this.vm.themeForm; }
  get selectedTabIndex() { return this.vm.selectedTabIndex; }
  set selectedTabIndex(value: number) { this.vm.selectedTabIndex = value; }
  get isPreviewExpanded() { return this.vm.isPreviewExpanded; }
  set isPreviewExpanded(value: boolean) { this.vm.isPreviewExpanded = value; }
  get isSaving() { return this.vm.isSaving; }
  get showAdvancedSettings() { return this.vm.showAdvancedSettings; }
  set showAdvancedSettings(value: boolean) { this.vm.showAdvancedSettings = value; }

  constructor(
    public vm: ThemeCreatorViewModel,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes to update preview immediately
    this.vm.themeForm.valueChanges.subscribe(() => {
      this.updatePreviewImmediate();
    });
  }

  ngAfterViewInit(): void {
    if (this.previewContainer) {
      this.previewRoot = this.previewContainer.nativeElement;
      // Apply initial theme to preview
      setTimeout(() => {
        this.updatePreviewImmediate();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.vm.destroy();
  }

  // Add the contrast ratio methods
  getContrastRatio(color1Key: keyof typeof this.currentTheme, color2Key: keyof typeof this.currentTheme): number {
    const color1 = this.currentTheme[color1Key] as string;
    const color2 = this.currentTheme[color2Key] as string;
    return getContrastRatio(color1, color2);
  }

  getContrastRatioWithWhite(colorKey: keyof typeof this.currentTheme): number {
    const color = this.currentTheme[colorKey] as string;
    return getContrastRatio(color, '#FFFFFF');
  }

  applyPreset(preset: ThemePreset): void {
    this.vm.applyPreset(preset);
    this.updatePreviewImmediate();

    this.snackBar.open(`Applied ${preset.name} preset`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  updateThemeProperty(property: keyof typeof this.currentTheme, value: any): void {
    this.vm.updateThemeProperty(property, value);
    this.updatePreviewImmediate();
  }

  onThemeChange(changes: Partial<typeof this.currentTheme>): void {
    this.vm.onThemeChange(changes);
    this.updatePreviewImmediate();
  }

  private updatePreviewImmediate(): void {
    if (this.previewRoot) {
      this.vm.applyThemeToPreview(this.previewRoot);
      // Force change detection to ensure Angular updates the view
      this.cdr.detectChanges();
    }
  }

  async saveTheme(): Promise<void> {
    try {
      await this.vm.saveTheme();
      this.snackBar.open('Theme saved successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to save theme', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  resetTheme(): void {
    this.vm.resetTheme();
    this.updatePreviewImmediate();

    this.snackBar.open('Theme reset to defaults', 'Close', {
      duration: 3000
    });
  }

  // Updated export method to use dialog
  exportTheme(): void {
    const dialogRef = this.dialog.open(ExportThemeDialogComponent, {
      width: '600px',
      data: { theme: this.currentTheme }
    });

    dialogRef.afterClosed().subscribe(exportOptions => {
      if (exportOptions) {
        try {
          ThemeImportExportUtil.exportTheme(this.currentTheme, exportOptions);

          this.snackBar.open(
            `Theme exported as ${exportOptions.format.toUpperCase()}!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
        } catch (error) {
          this.snackBar.open('Failed to export theme', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  async importTheme(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      try {
        // Check file extension
        if (!file.name.endsWith('.json')) {
          this.snackBar.open('Please select a JSON theme file', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          return;
        }

        await this.vm.importTheme(file);
        this.updatePreviewImmediate();

        this.snackBar.open('Theme imported successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } catch (error: any) {
        this.snackBar.open(error.message || 'Invalid theme file', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  toggleMode(): void {
    this.vm.toggleMode();
    this.updatePreviewImmediate();
  }

  openAdvancedSettings(): void {
    this.showAdvancedSettings = true;
  }

  refreshPreview(): void {
    this.updatePreviewImmediate();
  }

  // Helper methods
  onLogoError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Track by functions for performance
  trackByMetric(index: number, metric: SampleMetric): string {
    return metric.title;
  }

  trackByFeature(index: number, feature: EnterpriseFeature): string {
    return feature.title;
  }

  trackByNavItem(index: number, item: string): string {
    return item;
  }
}
