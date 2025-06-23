// src/app/components/theme-creator/view-models/theme-creator.view-model.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ThemeConfig, ThemeDefaults, ThemePreset } from '../../../models/theme.model';
import { ThemeService } from '../../../services/theme.service';
import { ThemeFormService } from '../services/theme-form.service';
import { ThemePreviewService } from '../services/theme-preview.service';
import { ThemeImportExportUtil } from '../utils/theme-import-export.util';

@Injectable()
export class ThemeCreatorViewModel {
  // Theme state
  currentTheme: ThemeConfig;
  themeForm: FormGroup;

  // UI state
  selectedTabIndex = 0;
  isPreviewExpanded = false;
  isSaving = false;
  showAdvancedSettings = false;

  // Subject for component destruction
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private themeFormService: ThemeFormService,
    private themePreviewService: ThemePreviewService
  ) {
    this.currentTheme = this.getDefaultTheme();
    this.themeForm = this.themeFormService.createThemeForm();
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    // Load current theme from service
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if (theme) {
          this.currentTheme = { ...theme };
          this.themeFormService.updateFormValues(this.themeForm, theme);
        }
      });

    // Subscribe to form changes for immediate updates
    this.themeForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.currentTheme = { ...this.currentTheme, ...values };
      });
  }

  private getDefaultTheme(): ThemeConfig {
    const savedTheme = this.themeService.getTheme();
    return savedTheme || { ...ThemeDefaults.DEFAULT_THEME };
  }

  applyPreset(preset: ThemePreset): void {
    this.currentTheme = { ...this.currentTheme, ...preset.config };
    this.themeFormService.updateFormValues(this.themeForm, this.currentTheme);
  }

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.currentTheme = { ...this.currentTheme, [property]: value };
    this.themeForm.patchValue({ [property]: value }, { emitEvent: false });
  }

  onThemeChange(changes: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...changes };
    this.themeFormService.updateFormValues(this.themeForm, this.currentTheme);
  }

  applyThemeToPreview(previewRoot: HTMLElement): void {
    this.themePreviewService.applyThemeToPreview(previewRoot, this.currentTheme);
  }

  async saveTheme(): Promise<void> {
    this.isSaving = true;
    try {
      await this.themeService.saveTheme(this.currentTheme);
      this.themeService.applyTheme(this.currentTheme);
    } finally {
      this.isSaving = false;
    }
  }

  resetTheme(): void {
    const defaultTheme = this.getDefaultTheme();
    this.currentTheme = defaultTheme;
    this.themeFormService.updateFormValues(this.themeForm, defaultTheme);
  }

  exportTheme(): void {
    ThemeImportExportUtil.exportTheme(this.currentTheme);
  }

  async importTheme(file: File): Promise<void> {
    const theme = await ThemeImportExportUtil.importTheme(file);
    if (ThemeImportExportUtil.validateImportedTheme(theme)) {
      this.currentTheme = theme;
      this.themeFormService.updateFormValues(this.themeForm, theme);
    } else {
      throw new Error('Invalid theme file');
    }
  }

  toggleMode(): void {
    const newMode = this.currentTheme.mode === 'light' ? 'dark' : 'light';
    this.updateThemeProperty('mode', newMode);
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
