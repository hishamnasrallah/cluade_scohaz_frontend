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
  mergeThemes,
  generateCSSFromTheme,
  checkAccessibility
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

    if (validation.warnings.length > 0) {
      console.warn('Theme validation warnings:', validation.warnings);
    }

    // Apply CSS variables
    this.applyCSSVariables(theme);

    // Apply special styles based on theme properties
    this.applySpecialStyles(theme);

    // Apply performance settings
    this.applyPerformanceSettings(theme);

    // Apply accessibility settings
    this.applyAccessibilitySettings(theme);

    // Check accessibility
    const accessibilityIssues = checkAccessibility(theme);
    if (accessibilityIssues.length > 0) {
      console.warn('Accessibility issues:', accessibilityIssues);
    }

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

    // Also set without prefix for easier usage
    this.root.style.setProperty(`--primary-color`, theme.primaryColor);
    this.root.style.setProperty(`--secondary-color`, theme.secondaryColor);
    this.root.style.setProperty(`--background-color`, theme.backgroundColor);
    this.root.style.setProperty(`--text-color`, theme.textColor);
    this.root.style.setProperty(`--accent-color`, theme.accentColor);
    this.root.style.setProperty(`--success-color`, theme.successColor);
    this.root.style.setProperty(`--warning-color`, theme.warningColor);
    this.root.style.setProperty(`--error-color`, theme.errorColor);
    this.root.style.setProperty(`--info-color`, theme.infoColor);
    this.root.style.setProperty(`--surface-card`, theme.surfaceCard);
    this.root.style.setProperty(`--surface-modal`, theme.surfaceModal);
    this.root.style.setProperty(`--surface-hover`, theme.surfaceHover);
    this.root.style.setProperty(`--font-family`, theme.fontFamily);
    this.root.style.setProperty(`--font-size`, `${theme.fontSizeBase}px`);
    this.root.style.setProperty(`--font-weight`, theme.fontWeight.toString());
    this.root.style.setProperty(`--line-height`, theme.lineHeight.toString());
    this.root.style.setProperty(`--letter-spacing`, `${theme.letterSpacing}em`);
    this.root.style.setProperty(`--heading-font-family`, theme.headingFontFamily);
    this.root.style.setProperty(`--heading-font-weight`, theme.headingFontWeight.toString());
    this.root.style.setProperty(`--spacing`, `${theme.spacingUnit}px`);
    this.root.style.setProperty(`--border-radius`, `${theme.borderRadius}px`);
    this.root.style.setProperty(`--border-width`, `${theme.borderWidth}px`);
    this.root.style.setProperty(`--shadow-intensity`, theme.shadowIntensity.toString());
    this.root.style.setProperty(`--blur`, `${theme.blurIntensity}px`);
    this.root.style.setProperty(`--animation-speed`, `${theme.animationSpeed}ms`);
    this.root.style.setProperty(`--animation-easing`, theme.animationEasing);

    // Mode specific adjustments
    if (theme.mode === 'dark') {
      this.applyDarkMode(theme);
    } else {
      this.removeDarkMode();
    }

    // Design style
    this.root.setAttribute('data-design-style', theme.designStyle);
    this.root.setAttribute('data-navigation-style', theme.navigationStyle);
    this.root.setAttribute('data-card-style', theme.cardStyle);
    this.root.setAttribute('data-button-style', theme.buttonStyle);
  }

  private applySpecialStyles(theme: ThemeConfig): void {
    let specialStyles = '';

    // Base styles using CSS variables
    specialStyles += `
      body {
        font-family: var(--font-family);
        font-size: var(--font-size);
        font-weight: var(--font-weight);
        line-height: var(--line-height);
        letter-spacing: var(--letter-spacing);
        color: var(--text-color);
        background-color: var(--background-color);
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--heading-font-family);
        font-weight: var(--heading-font-weight);
        color: var(--text-color);
      }

      a {
        color: var(--primary-color);
        transition: color var(--animation-speed) var(--animation-easing);
      }

      a:hover {
        color: var(--secondary-color);
      }

      .mat-mdc-card {
        background: var(--surface-card) !important;
        border-radius: var(--border-radius) !important;
        transition: all var(--animation-speed) var(--animation-easing) !important;
      }

      .mat-mdc-button.mat-mdc-button-base {
        border-radius: calc(var(--border-radius) * 0.66) !important;
        font-family: var(--font-family) !important;
        font-weight: 600 !important;
        transition: all var(--animation-speed) var(--animation-easing) !important;
      }

      .mat-mdc-form-field {
        font-family: var(--font-family) !important;
      }

      .mat-mdc-text-field-wrapper {
        border-radius: calc(var(--border-radius) * 0.66) !important;
      }
    `;

    // Navigation style specific
    if (theme.navigationStyle === 'elevated') {
      specialStyles += `
        .app-header {
          box-shadow: 0 2px 8px rgba(0, 0, 0, calc(var(--shadow-intensity) * 0.5)) !important;
        }
      `;
    } else if (theme.navigationStyle === 'flat') {
      specialStyles += `
        .app-header {
          box-shadow: none !important;
        }
      `;
    } else if (theme.navigationStyle === 'bordered') {
      specialStyles += `
        .app-header {
          box-shadow: none !important;
          border-bottom: var(--border-width) solid var(--surface-hover) !important;
        }
      `;
    }

    // Card style specific
    if (theme.cardStyle === 'elevated') {
      specialStyles += `
        .mat-mdc-card {
          box-shadow: 0 4px 6px rgba(0, 0, 0, var(--shadow-intensity)) !important;
        }
        .mat-mdc-card:hover {
          box-shadow: 0 8px 12px rgba(0, 0, 0, calc(var(--shadow-intensity) * 1.5)) !important;
        }
      `;
    } else if (theme.cardStyle === 'flat') {
      specialStyles += `
        .mat-mdc-card {
          box-shadow: none !important;
        }
      `;
    } else if (theme.cardStyle === 'bordered') {
      specialStyles += `
        .mat-mdc-card {
          box-shadow: none !important;
          border: var(--border-width) solid var(--surface-hover) !important;
        }
      `;
    } else if (theme.cardStyle === 'glass') {
      specialStyles += `
        .mat-mdc-card {
          background: rgba(255, 255, 255, 0.7) !important;
          backdrop-filter: blur(var(--blur)) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
      `;
    }

    // Button style specific
    if (theme.buttonStyle === 'primary') {
      specialStyles += `
        .mat-mdc-raised-button.mat-primary {
          background: var(--primary-color) !important;
        }
      `;
    } else if (theme.buttonStyle === 'secondary') {
      specialStyles += `
        .mat-mdc-raised-button.mat-primary {
          background: var(--secondary-color) !important;
        }
      `;
    } else if (theme.buttonStyle === 'outline') {
      specialStyles += `
        .mat-mdc-raised-button.mat-primary {
          background: transparent !important;
          color: var(--primary-color) !important;
          border: 2px solid var(--primary-color) !important;
        }
        .mat-mdc-raised-button.mat-primary:hover {
          background: var(--primary-color) !important;
          color: white !important;
        }
      `;
    } else if (theme.buttonStyle === 'ghost') {
      specialStyles += `
        .mat-mdc-raised-button.mat-primary {
          background: transparent !important;
          color: var(--primary-color) !important;
          box-shadow: none !important;
        }
        .mat-mdc-raised-button.mat-primary:hover {
          background: var(--surface-hover) !important;
        }
      `;
    }

    // Glassmorphic styles
    if (theme.designStyle === 'glassmorphic') {
      specialStyles += `
        .mat-mdc-card {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(${theme.blurIntensity}px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .mat-mdc-dialog-container {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(${theme.blurIntensity}px) !important;
        }
      `;
    }

    // Neumorphic styles
    if (theme.designStyle === 'neumorphic') {
      const offset = theme.spacingUnit * 0.5;
      specialStyles += `
        .mat-mdc-card {
          background: ${theme.backgroundColor} !important;
          box-shadow: ${offset}px ${offset}px ${offset * 2}px rgba(0, 0, 0, 0.1),
                      -${offset}px -${offset}px ${offset * 2}px rgba(255, 255, 255, 0.9) !important;
          border: none !important;
        }

        .mat-mdc-raised-button {
          background: ${theme.backgroundColor} !important;
          color: ${theme.textColor} !important;
          box-shadow: ${offset * 0.5}px ${offset * 0.5}px ${offset}px rgba(0, 0, 0, 0.1),
                      -${offset * 0.5}px -${offset * 0.5}px ${offset}px rgba(255, 255, 255, 0.9) !important;
        }

        .mat-mdc-raised-button:active {
          box-shadow: inset ${offset * 0.5}px ${offset * 0.5}px ${offset}px rgba(0, 0, 0, 0.1),
                      inset -${offset * 0.5}px -${offset * 0.5}px ${offset}px rgba(255, 255, 255, 0.9) !important;
        }
      `;
    }

    // Minimal style
    if (theme.designStyle === 'minimal') {
      specialStyles += `
        * {
          border-radius: 0 !important;
        }

        .mat-mdc-card {
          border-radius: 0 !important;
          box-shadow: none !important;
          border: ${theme.borderWidth}px solid var(--surface-hover) !important;
        }

        .mat-mdc-button {
          border-radius: 0 !important;
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

    // Apply custom styles
    this.styleElement.textContent = specialStyles;
  }

  private applyPerformanceSettings(theme: ThemeConfig): void {
    if (!theme.enableAnimations) {
      this.root.classList.add('no-animations');
      this.root.style.setProperty(`${this.CSS_PREFIX}-duration`, '0ms');
    } else {
      this.root.classList.remove('no-animations');
    }

    if (!theme.enableBlur) {
      this.root.classList.add('no-blur');
      this.root.style.setProperty(`${this.CSS_PREFIX}-blur`, '0px');
    } else {
      this.root.classList.remove('no-blur');
    }

    if (!theme.enableShadows) {
      this.root.classList.add('no-shadows');
      this.root.style.setProperty(`${this.CSS_PREFIX}-shadow-intensity`, '0');
    } else {
      this.root.classList.remove('no-shadows');
    }
  }

  private applyAccessibilitySettings(theme: ThemeConfig): void {
    if (theme.reducedMotion) {
      this.root.classList.add('motion-reduce');
      // Override animation settings for reduced motion
      this.root.style.setProperty(`${this.CSS_PREFIX}-duration`, '0.01ms');
    } else {
      this.root.classList.remove('motion-reduce');
    }

    if (theme.highContrast) {
      this.root.classList.add('high-contrast');
      // Increase contrast for better visibility
      this.root.style.filter = 'contrast(1.2)';
    } else {
      this.root.classList.remove('high-contrast');
      this.root.style.filter = '';
    }

    // Update font size for accessibility
    this.root.style.fontSize = `${theme.fontSizeBase}px`;
  }

  private applyDarkMode(theme: ThemeConfig): void {
    this.root.classList.add('dark-mode');

    // Override colors for dark mode if they haven't been customized
    if (theme.backgroundColor === '#F4FDFD') {
      this.root.style.setProperty(`${this.CSS_PREFIX}-background`, '#0F172A');
    }
    if (theme.textColor === '#2F4858') {
      this.root.style.setProperty(`${this.CSS_PREFIX}-text`, '#F8FAFC');
    }
    if (theme.surfaceCard === '#FFFFFF') {
      this.root.style.setProperty(`${this.CSS_PREFIX}-surface-card`, '#1E293B');
    }
    if (theme.surfaceModal === '#FFFFFF') {
      this.root.style.setProperty(`${this.CSS_PREFIX}-surface-modal`, '#1E293B');
    }

    // Adjust other colors for dark mode
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
      const validation = validateTheme(themeExport.theme);
      if (validation.isValid) {
        this.applyTheme(themeExport.theme);
      } else {
        throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
      }
    }
  }

  generateCSS(): string {
    return generateCSSFromTheme(this.getTheme());
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

  // Check if a theme exists in storage
  hasStoredTheme(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  // Clear stored theme
  clearStoredTheme(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.applyTheme(ThemeDefaults.DEFAULT_THEME);
  }
}
