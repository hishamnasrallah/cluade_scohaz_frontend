// src/app/services/theme.service.ts
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  ThemeConfig,
  ThemeDefaults,
  ThemePreset,
  ThemeExport,
  validateTheme,
  mergeThemes
} from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'praxelo-theme-config';
  private readonly CSS_PREFIX = '--praxelo';

  private currentThemeSubject = new BehaviorSubject<ThemeConfig>(ThemeDefaults.DEFAULT_THEME);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private root: HTMLElement;
  private styleElement: HTMLStyleElement;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient
  ) {
    this.root = this.document.documentElement;
    this.styleElement = this.createStyleElement();
    this.loadSavedTheme();
  }

  private createStyleElement(): HTMLStyleElement {
    const style = this.document.createElement('style');
    style.id = 'praxelo-theme-styles';
    this.document.head.appendChild(style);
    return style;
  }

  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY);
      if (savedTheme) {
        const theme = JSON.parse(savedTheme) as ThemeConfig;
        const validation = validateTheme(theme);

        if (validation.isValid) {
          this.applyTheme(theme);
        } else {
          console.error('Invalid saved theme:', validation.errors);
          this.applyTheme(ThemeDefaults.DEFAULT_THEME);
        }
      } else {
        this.applyTheme(ThemeDefaults.DEFAULT_THEME);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
      this.applyTheme(ThemeDefaults.DEFAULT_THEME);
    }
  }

  applyTheme(theme: ThemeConfig): void {
    // Validate theme before applying
    const validation = validateTheme(theme);
    if (!validation.isValid) {
      console.error('Theme validation failed:', validation.errors);
      return;
    }

    // Apply CSS variables
    this.applyCSSVariables(theme);

    // Apply special styles based on theme properties
    this.applySpecialStyles(theme);

    // Apply performance settings
    this.applyPerformanceSettings(theme);

    // Apply accessibility settings
    this.applyAccessibilitySettings(theme);

    // Update current theme
    this.currentThemeSubject.next(theme);

    // Save to localStorage
    this.saveTheme(theme);
  }

  private applyCSSVariables(theme: ThemeConfig): void {
    // Core colors
    this.root.style.setProperty(`${this.CSS_PREFIX}-primary`, theme.primaryColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-secondary`, theme.secondaryColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-background`, theme.backgroundColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-text`, theme.textColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-accent`, theme.accentColor);

    // Semantic colors
    this.root.style.setProperty(`${this.CSS_PREFIX}-success`, theme.successColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-warning`, theme.warningColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-error`, theme.errorColor);
    this.root.style.setProperty(`${this.CSS_PREFIX}-info`, theme.infoColor);

    // Surface colors
    this.root.style.setProperty(`${this.CSS_PREFIX}-surface-card`, theme.surfaceCard);
    this.root.style.setProperty(`${this.CSS_PREFIX}-surface-modal`, theme.surfaceModal);
    this.root.style.setProperty(`${this.CSS_PREFIX}-surface-hover`, theme.surfaceHover);

    // Typography
    this.root.style.setProperty(`${this.CSS_PREFIX}-font-family`, theme.fontFamily);
    this.root.style.setProperty(`${this.CSS_PREFIX}-font-size`, `${theme.fontSizeBase}px`);
    this.root.style.setProperty(`${this.CSS_PREFIX}-font-weight`, theme.fontWeight.toString());
    this.root.style.setProperty(`${this.CSS_PREFIX}-line-height`, theme.lineHeight.toString());
    this.root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing`, `${theme.letterSpacing}em`);
    this.root.style.setProperty(`${this.CSS_PREFIX}-heading-font-family`, theme.headingFontFamily);
    this.root.style.setProperty(`${this.CSS_PREFIX}-heading-font-weight`, theme.headingFontWeight.toString());

    // Spacing & Layout
    this.root.style.setProperty(`${this.CSS_PREFIX}-spacing`, `${theme.spacingUnit}px`);
    this.root.style.setProperty(`${this.CSS_PREFIX}-border-radius`, `${theme.borderRadius}px`);
    this.root.style.setProperty(`${this.CSS_PREFIX}-border-width`, `${theme.borderWidth}px`);

    // Effects
    this.root.style.setProperty(`${this.CSS_PREFIX}-shadow-intensity`, theme.shadowIntensity.toString());
    this.root.style.setProperty(`${this.CSS_PREFIX}-blur`, `${theme.blurIntensity}px`);

    // Animation
    this.root.style.setProperty(`${this.CSS_PREFIX}-duration`, `${theme.animationSpeed}ms`);
    this.root.style.setProperty(`${this.CSS_PREFIX}-easing`, theme.animationEasing);

    // Mode specific adjustments
    if (theme.mode === 'dark') {
      this.applyDarkMode(theme);
    } else {
      this.removeDarkMode();
    }

    // Design style
    this.root.setAttribute('data-design-style', theme.designStyle);
  }

  private applySpecialStyles(theme: ThemeConfig): void {
    let specialStyles = '';

    // Glassmorphic styles
    if (theme.designStyle === 'glassmorphic') {
      specialStyles += `
        .mat-mdc-card {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(${theme.blurIntensity}px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      `;
    }

    // Neumorphic styles
    if (theme.designStyle === 'neumorphic') {
      const offset = theme.spacingUnit;
      specialStyles += `
        .mat-mdc-card {
          background: ${theme.backgroundColor} !important;
          box-shadow: ${offset}px ${offset}px ${offset * 2}px rgba(0, 0, 0, 0.1),
                      -${offset}px -${offset}px ${offset * 2}px rgba(255, 255, 255, 0.9) !important;
          border: none !important;
        }
      `;
    }

    // Material Design elevation
    if (theme.enableShadows) {
      for (let i = 0; i <= 24; i++) {
        const shadow = this.generateMaterialShadow(i, theme.shadowIntensity);
        specialStyles += `
          .mat-elevation-z${i} {
            box-shadow: ${shadow} !important;
          }
        `;
      }
    }

    // Card styles
    switch (theme.cardStyle) {
      case 'flat':
        specialStyles += `
          .mat-mdc-card {
            box-shadow: none !important;
          }
        `;
        break;
      case 'bordered':
        specialStyles += `
          .mat-mdc-card {
            box-shadow: none !important;
            border: ${theme.borderWidth}px solid var(${this.CSS_PREFIX}-border, #e2e8f0) !important;
          }
        `;
        break;
      case 'glass':
        specialStyles += `
          .mat-mdc-card {
            background: rgba(255, 255, 255, 0.7) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
          }
        `;
        break;
    }

    // Apply custom styles
    this.styleElement.textContent = specialStyles;
  }

  private applyPerformanceSettings(theme: ThemeConfig): void {
    if (!theme.enableAnimations) {
      this.root.classList.add('no-animations');
    } else {
      this.root.classList.remove('no-animations');
    }

    if (!theme.enableBlur) {
      this.root.style.setProperty(`${this.CSS_PREFIX}-blur`, '0px');
    }

    if (!theme.enableShadows) {
      this.root.classList.add('no-shadows');
    } else {
      this.root.classList.remove('no-shadows');
    }
  }

  private applyAccessibilitySettings(theme: ThemeConfig): void {
    if (theme.reducedMotion) {
      this.root.classList.add('motion-reduce');
    } else {
      this.root.classList.remove('motion-reduce');
    }

    if (theme.highContrast) {
      this.root.classList.add('high-contrast');
    } else {
      this.root.classList.remove('high-contrast');
    }

    // Update font size for accessibility
    this.root.style.fontSize = `${theme.fontSizeBase}px`;
  }

  private applyDarkMode(theme: ThemeConfig): void {
    this.root.classList.add('dark-mode');

    // Override colors for dark mode
    this.root.style.setProperty(`${this.CSS_PREFIX}-background`, '#0F172A');
    this.root.style.setProperty(`${this.CSS_PREFIX}-text`, '#F8FAFC');
    this.root.style.setProperty(`${this.CSS_PREFIX}-surface-card`, '#1E293B');
    this.root.style.setProperty(`${this.CSS_PREFIX}-surface-modal`, '#1E293B');
    this.root.style.setProperty(`${this.CSS_PREFIX}-border`, '#334155');
  }

  private removeDarkMode(): void {
    this.root.classList.remove('dark-mode');
  }

  private generateMaterialShadow(elevation: number, intensity: number): string {
    if (elevation === 0) return 'none';

    const umbra = {
      offset: elevation * 0.2,
      blur: elevation * 1,
      spread: -elevation * 0.1,
      opacity: 0.2 * intensity
    };

    const penumbra = {
      offset: elevation * 0.1,
      blur: elevation * 0.8,
      spread: elevation * 0.05,
      opacity: 0.14 * intensity
    };

    const ambient = {
      offset: 0,
      blur: elevation * 0.5,
      spread: elevation * 0.1,
      opacity: 0.12 * intensity
    };

    return `
      ${umbra.offset}px ${umbra.offset}px ${umbra.blur}px ${umbra.spread}px rgba(0,0,0,${umbra.opacity}),
      ${penumbra.offset}px ${penumbra.offset}px ${penumbra.blur}px ${penumbra.spread}px rgba(0,0,0,${penumbra.opacity}),
      ${ambient.offset}px ${ambient.offset}px ${ambient.blur}px ${ambient.spread}px rgba(0,0,0,${ambient.opacity})
    `.trim();
  }

  async saveTheme(theme: ThemeConfig): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme:', error);
      throw new Error('Failed to save theme to local storage');
    }
  }

  getTheme(): ThemeConfig {
    return this.currentThemeSubject.value;
  }

  resetTheme(): void {
    this.applyTheme(ThemeDefaults.DEFAULT_THEME);
  }

  applyPreset(preset: ThemePreset): void {
    const mergedTheme = mergeThemes(this.getTheme(), preset.config);
    this.applyTheme(mergedTheme);
  }

  exportTheme(): ThemeExport {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      theme: this.getTheme(),
      metadata: {
        author: 'PraXelo Theme Builder',
        description: 'Custom theme configuration'
      }
    };
  }

  importTheme(themeExport: ThemeExport): void {
    if (themeExport.theme) {
      this.applyTheme(themeExport.theme);
    }
  }

  // Load theme from server
  loadThemeFromServer(themeId: string): Observable<ThemeConfig> {
    return this.http.get<ThemeConfig>(`/api/themes/${themeId}`);
  }

  // Save theme to server
  saveThemeToServer(theme: ThemeConfig): Observable<any> {
    return this.http.post('/api/themes', theme);
  }

  // Get available presets from server
  getAvailablePresets(): Observable<ThemePreset[]> {
    return this.http.get<ThemePreset[]>('/api/themes/presets');
  }
}
