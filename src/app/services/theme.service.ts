// services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ThemeConfig, ThemePreset } from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private defaultTheme: ThemeConfig = {
    // Core Colors
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#f59e0b',

    // Semantic Colors
    successColor: '#22c55e',
    warningColor: '#f59e0b',
    errorColor: '#ef4444',
    infoColor: '#3b82f6',

    // Surface Colors
    surfaceCard: '#f8fafc',
    surfaceModal: '#ffffff',
    surfaceHover: '#f1f5f9',

    // Typography
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    headingFontFamily: 'Inter Display, Inter, system-ui, sans-serif',
    headingFontWeight: 700,

    // Spacing & Layout
    spacingUnit: 16,
    borderRadius: 8,
    borderWidth: 1,

    // Shadows & Effects
    shadowIntensity: 0.1,
    blurIntensity: 10,

    // Animation
    animationSpeed: 300,
    animationEasing: 'ease-out',

    // Advanced Features
    designStyle: 'modern',
    navigationStyle: 'elevated',
    cardStyle: 'elevated',
    buttonStyle: 'primary',

    // Brand
    brandName: 'Enterprise App',
    logoUrl: '🏢',

    // Mode
    mode: 'light',

    // Performance
    enableAnimations: true,
    enableBlur: true,
    enableShadows: true,

    // Accessibility
    reducedMotion: false,
    highContrast: false,
    focusOutlineWidth: 2
  };

  private themeSubject = new BehaviorSubject<ThemeConfig>(this.defaultTheme);
  public theme$: Observable<ThemeConfig> = this.themeSubject.asObservable();

  private presetsSubject = new BehaviorSubject<ThemePreset[]>(this.getDefaultPresets());
  public presets$: Observable<ThemePreset[]> = this.presetsSubject.asObservable();

  private customPresetsKey = 'app-custom-presets';
  private themeHistoryKey = 'app-theme-history';
  private maxHistoryItems = 10;

  // Debounce timer for theme updates
  private updateTimer: any;

  constructor() {
    this.initializeTheme();
    this.setupSystemPreferences();
    this.loadCustomPresets();
  }

  private initializeTheme(): void {
    this.loadSavedTheme();
    // Apply theme after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.applyTheme(this.themeSubject.value);
      });
    } else {
      setTimeout(() => {
        this.applyTheme(this.themeSubject.value);
      }, 0);
    }
  }

  private setupSystemPreferences(): void {
    // Listen for system color scheme changes
    if (window.matchMedia) {
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

      // Initial check
      this.handleSystemPreferences();

      // Listen for changes
      colorSchemeQuery.addEventListener('change', () => this.handleSystemPreferences());
      reducedMotionQuery.addEventListener('change', () => this.handleSystemPreferences());
      highContrastQuery.addEventListener('change', () => this.handleSystemPreferences());
    }
  }

  private handleSystemPreferences(): void {
    const theme = this.themeSubject.value;

    if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyThemeMode(prefersDark ? 'dark' : 'light');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion !== theme.reducedMotion) {
      this.updateThemeProperty('reducedMotion', prefersReducedMotion);
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast !== theme.highContrast) {
      this.updateThemeProperty('highContrast', prefersHighContrast);
    }
  }

  getCurrentTheme(): ThemeConfig {
    return this.themeSubject.value;
  }

  updateTheme(updates: Partial<ThemeConfig>): void {
    // Clear any existing timer
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    // Update theme immediately for UI responsiveness
    const newTheme = { ...this.themeSubject.value, ...updates };
    this.themeSubject.next(newTheme);

    // Debounce the expensive operations
    this.updateTimer = setTimeout(() => {
      this.applyTheme(newTheme);
      this.saveTheme(newTheme);
      this.addToHistory(newTheme);
    }, 100);
  }

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.updateTheme({ [property]: value });
  }

  applyPreset(presetId: string): void {
    const allPresets = [...this.getDefaultPresets(), ...this.getCustomPresets()];
    const preset = allPresets.find(p => p.id === presetId);
    if (preset) {
      this.updateTheme(preset.config);
    }
  }

  resetTheme(): void {
    this.themeSubject.next(this.defaultTheme);
    this.applyTheme(this.defaultTheme);
    this.saveTheme(this.defaultTheme);
  }

  private applyThemeMode(mode: 'light' | 'dark'): void {
    const root = document.documentElement;

    if (mode === 'dark') {
      root.style.setProperty('--surface-background', '#0f172a');
      root.style.setProperty('--surface-foreground', '#f8fafc');
      root.style.setProperty('--surface-card', '#1e293b');
      root.style.setProperty('--surface-modal', '#1e293b');
      root.style.setProperty('--surface-hover', '#334155');
      root.style.setProperty('--surface-active', '#475569');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--text-placeholder', '#64748b');
      root.style.setProperty('--border-default', '#334155');
      root.style.setProperty('--border-strong', '#475569');
      root.style.setProperty('--shadow-sm', '0 1px 3px 0 rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.3)');
    } else {
      const theme = this.themeSubject.value;
      root.style.setProperty('--surface-background', theme.backgroundColor);
      root.style.setProperty('--surface-foreground', theme.textColor);
      root.style.setProperty('--surface-card', theme.surfaceCard);
      root.style.setProperty('--surface-modal', theme.surfaceModal);
      root.style.setProperty('--surface-hover', theme.surfaceHover);
      root.style.setProperty('--surface-active', '#e2e8f0');
      root.style.setProperty('--text-primary', theme.textColor);
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-tertiary', '#64748b');
      root.style.setProperty('--text-placeholder', '#9ca3af');
      root.style.setProperty('--border-default', '#e2e8f0');
      root.style.setProperty('--border-strong', '#cbd5e1');
      root.style.setProperty('--shadow-sm', `0 1px 3px 0 rgba(0, 0, 0, ${theme.shadowIntensity})`);
      root.style.setProperty('--shadow-md', `0 4px 6px -1px rgba(0, 0, 0, ${theme.shadowIntensity})`);
      root.style.setProperty('--shadow-lg', `0 10px 15px -3px rgba(0, 0, 0, ${theme.shadowIntensity})`);
    }
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;

    // Handle auto mode
    const effectiveMode = theme.mode === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme.mode;

    // Generate color variations with proper RGB values
    const colors = {
      primary: this.hexToRgb(theme.primaryColor),
      secondary: this.hexToRgb(theme.secondaryColor),
      success: this.hexToRgb(theme.successColor),
      warning: this.hexToRgb(theme.warningColor),
      error: this.hexToRgb(theme.errorColor),
      info: this.hexToRgb(theme.infoColor),
      accent: this.hexToRgb(theme.accentColor),
      tertiary: this.hexToRgb(theme.accentColor), // Using accent as tertiary
      neutral: this.hexToRgb(theme.secondaryColor), // Using secondary as neutral
      help: this.hexToRgb('#a855f7'), // Default help color
      note: this.hexToRgb('#06b6d4') // Default note color
    };

    // Apply color variations
    Object.entries(colors).forEach(([name, rgb]) => {
      if (rgb) {
        // Store RGB values for opacity utilities
        root.style.setProperty(`--color-${name}-500-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);

        // Generate complete color scale
        const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
        scales.forEach(scale => {
          let color: string;
          if (scale === 500) {
            // Use the exact color for 500
            const colorKey = `${name}Color` as keyof ThemeConfig;
            color = theme[colorKey] as string || this.rgbToHex(rgb);
          } else if (scale < 500) {
            // Lighter shades
            const factor = (500 - scale) / 450;
            color = this.lighten(rgb, factor * 0.9); // Adjusted for better contrast
          } else {
            // Darker shades
            const factor = (scale - 500) / 450;
            color = this.darken(rgb, factor * 0.9); // Adjusted for better contrast
          }
          root.style.setProperty(`--color-${name}-${scale}`, color);
        });
      }
    });

    // Apply mode-specific colors
    this.applyThemeMode(effectiveMode);

    // Apply typography
    root.style.setProperty('--font-sans', theme.fontFamily);
    root.style.setProperty('--font-display', theme.headingFontFamily);
    root.style.setProperty('--font-mono', "'JetBrains Mono', 'SF Mono', Monaco, Consolas, monospace");
    root.style.setProperty('--text-base', `${theme.fontSizeBase}px`);
    root.style.setProperty('--text-xs', `${theme.fontSizeBase * 0.75}px`);
    root.style.setProperty('--text-sm', `${theme.fontSizeBase * 0.875}px`);
    root.style.setProperty('--text-lg', `${theme.fontSizeBase * 1.125}px`);
    root.style.setProperty('--text-xl', `${theme.fontSizeBase * 1.25}px`);
    root.style.setProperty('--text-2xl', `${theme.fontSizeBase * 1.5}px`);
    root.style.setProperty('--text-3xl', `${theme.fontSizeBase * 1.875}px`);
    root.style.setProperty('--text-4xl', `${theme.fontSizeBase * 2.25}px`);
    root.style.setProperty('--text-5xl', `${theme.fontSizeBase * 3}px`);
    root.style.setProperty('--text-6xl', `${theme.fontSizeBase * 3.75}px`);

    root.style.setProperty('--font-normal', theme.fontWeight.toString());
    root.style.setProperty('--font-medium', '500');
    root.style.setProperty('--font-semibold', '600');
    root.style.setProperty('--font-bold', theme.headingFontWeight.toString());

    root.style.setProperty('--leading-normal', theme.lineHeight.toString());
    root.style.setProperty('--leading-tight', '1.25');
    root.style.setProperty('--leading-snug', '1.375');
    root.style.setProperty('--leading-relaxed', '1.625');

    root.style.setProperty('--tracking-normal', `${theme.letterSpacing}em`);
    root.style.setProperty('--tracking-tight', '-0.025em');
    root.style.setProperty('--tracking-wide', '0.025em');

    // Apply spacing system
    const baseSpacing = theme.spacingUnit;

    // Define all spacing values
    const spacingValues: { [key: string]: number } = {
      '0': 0,
      'px': 1 / baseSpacing,
      '0_5': 0.125,
      '1': 0.25,
      '1_5': 0.375,
      '2': 0.5,
      '2_5': 0.625,
      '3': 0.75,
      '3_5': 0.875,
      '4': 1,
      '5': 1.25,
      '6': 1.5,
      '7': 1.75,
      '8': 2,
      '9': 2.25,
      '10': 2.5,
      '11': 2.75,
      '12': 3,
      '14': 3.5,
      '16': 4,
      '20': 5,
      '24': 6,
      '28': 7,
      '32': 8,
      '36': 9,
      '40': 10,
      '44': 11,
      '48': 12,
      '52': 13,
      '56': 14,
      '60': 15,
      '64': 16,
      '72': 18,
      '80': 20,
      '96': 24
    };

    Object.entries(spacingValues).forEach(([key, multiplier]) => {
      const value = key === 'px' ? '1px' : `${baseSpacing * multiplier}px`;
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply border radius
    root.style.setProperty('--rounded-none', '0');
    root.style.setProperty('--rounded-xs', `${theme.borderRadius * 0.25}px`);
    root.style.setProperty('--rounded-sm', `${theme.borderRadius * 0.5}px`);
    root.style.setProperty('--rounded-md', `${theme.borderRadius}px`);
    root.style.setProperty('--rounded-lg', `${theme.borderRadius * 1.5}px`);
    root.style.setProperty('--rounded-xl', `${theme.borderRadius * 2}px`);
    root.style.setProperty('--rounded-2xl', `${theme.borderRadius * 2.5}px`);
    root.style.setProperty('--rounded-3xl', `${theme.borderRadius * 3}px`);
    root.style.setProperty('--rounded-full', '9999px');

    // Apply border width
    root.style.setProperty('--border-0', '0');
    root.style.setProperty('--border-1', `${theme.borderWidth}px`);
    root.style.setProperty('--border-2', `${theme.borderWidth * 2}px`);
    root.style.setProperty('--border-4', `${theme.borderWidth * 4}px`);
    root.style.setProperty('--border-8', `${theme.borderWidth * 8}px`);

    // Apply shadows with proper dark mode support
    const shadowBase = theme.shadowIntensity;
    const shadowColor = effectiveMode === 'dark' ? '0, 0, 0' : '0, 0, 0';

    root.style.setProperty('--shadow-none', 'none');
    root.style.setProperty('--shadow-xs', `0 1px 2px 0 rgba(${shadowColor}, ${shadowBase * 0.5})`);
    root.style.setProperty('--shadow-sm', `0 1px 3px 0 rgba(${shadowColor}, ${shadowBase}), 0 1px 2px -1px rgba(${shadowColor}, ${shadowBase})`);
    root.style.setProperty('--shadow-md', `0 4px 6px -1px rgba(${shadowColor}, ${shadowBase}), 0 2px 4px -2px rgba(${shadowColor}, ${shadowBase})`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px rgba(${shadowColor}, ${shadowBase}), 0 4px 6px -4px rgba(${shadowColor}, ${shadowBase})`);
    root.style.setProperty('--shadow-xl', `0 20px 25px -5px rgba(${shadowColor}, ${shadowBase}), 0 8px 10px -6px rgba(${shadowColor}, ${shadowBase})`);
    root.style.setProperty('--shadow-2xl', `0 25px 50px -12px rgba(${shadowColor}, ${shadowBase * 2.5})`);
    root.style.setProperty('--shadow-inner', `inset 0 2px 4px 0 rgba(${shadowColor}, ${shadowBase * 0.5})`);

    // Apply animation
    root.style.setProperty('--duration-instant', '0ms');
    root.style.setProperty('--duration-fastest', '50ms');
    root.style.setProperty('--duration-faster', '100ms');
    root.style.setProperty('--duration-fast', `${theme.animationSpeed * 0.5}ms`);
    root.style.setProperty('--duration-normal', `${theme.animationSpeed}ms`);
    root.style.setProperty('--duration-slow', `${theme.animationSpeed * 1.5}ms`);
    root.style.setProperty('--duration-slower', `${theme.animationSpeed * 2.5}ms`);
    root.style.setProperty('--duration-slowest', `${theme.animationSpeed * 3.3}ms`);

    // Enhanced easing functions
    root.style.setProperty('--ease-linear', 'linear');
    root.style.setProperty('--ease-in', 'cubic-bezier(0.4, 0, 1, 1)');
    root.style.setProperty('--ease-out', 'cubic-bezier(0, 0, 0.2, 1)');
    root.style.setProperty('--ease-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)');

    // Apply blur
    root.style.setProperty('--blur-intensity', `${theme.blurIntensity}px`);

    // Apply focus outline
    root.style.setProperty('--border-focus', theme.primaryColor);
    root.style.setProperty('--focus-outline-width', `${theme.focusOutlineWidth}px`);

    // Apply design style specific adjustments
    this.applyDesignStyleEffects(theme);

    // Apply performance settings
    if (!theme.enableAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    // Apply accessibility settings
    if (theme.reducedMotion) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }

    if (theme.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Set data attributes
    root.setAttribute('data-design-style', theme.designStyle);
    root.setAttribute('data-theme-mode', effectiveMode);
    root.setAttribute('data-card-style', theme.cardStyle);
    root.setAttribute('data-button-style', theme.buttonStyle);
    root.setAttribute('data-navigation-style', theme.navigationStyle);

    // Update CSS custom properties for special effects
    if (!theme.enableShadows) {
      root.style.setProperty('--shadow-xs', 'none');
      root.style.setProperty('--shadow-sm', 'none');
      root.style.setProperty('--shadow-md', 'none');
      root.style.setProperty('--shadow-lg', 'none');
      root.style.setProperty('--shadow-xl', 'none');
      root.style.setProperty('--shadow-2xl', 'none');
    }

    if (!theme.enableBlur) {
      root.style.setProperty('--blur-intensity', '0px');
    }

    // Apply surface overlay with proper opacity
    const overlayOpacity = effectiveMode === 'dark' ? 0.8 : 0.5;
    root.style.setProperty('--surface-overlay', `rgba(0, 0, 0, ${overlayOpacity})`);
  }

  private applyDesignStyleEffects(theme: ThemeConfig): void {
    const root = document.documentElement;

    switch (theme.designStyle) {
      case 'glassmorphic':
        root.style.setProperty('--glass-blur', `${theme.blurIntensity}px`);
        root.style.setProperty('--glass-opacity', '0.1');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
        root.style.setProperty('--glass-gradient', 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))');
        break;

      case 'neumorphic':
        const neuBg = theme.mode === 'dark' ? '#1a1a1a' : '#e0e0e0';
        root.style.setProperty('--neu-background', neuBg);
        root.style.setProperty('--neu-shadow-light', theme.mode === 'dark' ? '#262626' : '#ffffff');
        root.style.setProperty('--neu-shadow-dark', theme.mode === 'dark' ? '#0e0e0e' : '#bebebe');
        root.style.setProperty('--neu-distance', `${theme.spacingUnit * 0.5}px`);
        root.style.setProperty('--neu-blur', `${theme.spacingUnit}px`);
        break;

      case 'material':
        root.style.setProperty('--mat-elevation-1', '0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)');
        root.style.setProperty('--mat-elevation-2', '0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)');
        root.style.setProperty('--mat-elevation-3', '0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12)');
        root.style.setProperty('--mat-ripple-color', theme.primaryColor);
        break;

      case 'minimal':
        root.style.setProperty('--minimal-accent', theme.primaryColor);
        root.style.setProperty('--minimal-border', `${theme.borderWidth}px solid ${theme.mode === 'dark' ? '#334155' : '#e2e8f0'}`);
        break;

      case 'modern':
      default:
        // Modern style uses default properties
        break;
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Handle 3-digit hex
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    return '#' + [rgb.r, rgb.g, rgb.b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private lighten(rgb: { r: number; g: number; b: number }, factor: number): string {
    const r = Math.round(rgb.r + (255 - rgb.r) * factor);
    const g = Math.round(rgb.g + (255 - rgb.g) * factor);
    const b = Math.round(rgb.b + (255 - rgb.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private darken(rgb: { r: number; g: number; b: number }, factor: number): string {
    const r = Math.round(rgb.r * (1 - factor));
    const g = Math.round(rgb.g * (1 - factor));
    const b = Math.round(rgb.b * (1 - factor));
    return `rgb(${r}, ${g}, ${b})`;
  }

  private saveTheme(theme: ThemeConfig): void {
    try {
      localStorage.setItem('app-theme', JSON.stringify(theme));
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }

  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        if (this.validateTheme(theme)) {
          this.themeSubject.next(theme);
        }
      }
    } catch (e) {
      console.error('Failed to load saved theme', e);
    }
  }

  // Theme History Management
  private addToHistory(theme: ThemeConfig): void {
    try {
      const history = this.getThemeHistory();
      history.unshift({
        theme,
        timestamp: new Date().toISOString()
      });

      // Keep only the latest items
      if (history.length > this.maxHistoryItems) {
        history.pop();
      }

      localStorage.setItem(this.themeHistoryKey, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save theme history', e);
    }
  }

  getThemeHistory(): Array<{ theme: ThemeConfig; timestamp: string }> {
    try {
      const historyJson = localStorage.getItem(this.themeHistoryKey);
      if (historyJson) {
        return JSON.parse(historyJson);
      }
    } catch (e) {
      console.error('Failed to load theme history', e);
    }
    return [];
  }

  applyFromHistory(index: number): void {
    const history = this.getThemeHistory();
    if (history[index]) {
      this.updateTheme(history[index].theme);
    }
  }

  // Custom Preset Management
  saveCustomPreset(name: string, description: string): void {
    try {
      const customPresets = this.getCustomPresets();
      const preset: ThemePreset = {
        id: `custom-${Date.now()}`,
        name,
        description,
        config: { ...this.getCurrentTheme() }
      };

      customPresets.push(preset);
      localStorage.setItem(this.customPresetsKey, JSON.stringify(customPresets));
      this.loadCustomPresets();
    } catch (e) {
      console.error('Failed to save custom preset', e);
    }
  }

  deleteCustomPreset(id: string): void {
    try {
      const customPresets = this.getCustomPresets().filter(p => p.id !== id);
      localStorage.setItem(this.customPresetsKey, JSON.stringify(customPresets));
      this.loadCustomPresets();
    } catch (e) {
      console.error('Failed to delete custom preset', e);
    }
  }

  private getCustomPresets(): ThemePreset[] {
    try {
      const presetsJson = localStorage.getItem(this.customPresetsKey);
      if (presetsJson) {
        return JSON.parse(presetsJson);
      }
    } catch (e) {
      console.error('Failed to load custom presets', e);
    }
    return [];
  }

  private loadCustomPresets(): void {
    const allPresets = [...this.getDefaultPresets(), ...this.getCustomPresets()];
    this.presetsSubject.next(allPresets);
  }

  // Export/Import functionality
  exportTheme(): string {
    const theme = this.getCurrentTheme();
    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson);
      // Validate theme structure
      if (this.validateTheme(theme)) {
        this.updateTheme(theme);
      } else {
        throw new Error('Invalid theme structure');
      }
    } catch (e) {
      console.error('Failed to import theme', e);
      throw new Error('Invalid theme JSON');
    }
  }

  private validateTheme(theme: any): boolean {
    const requiredProperties = [
      'primaryColor', 'secondaryColor', 'backgroundColor', 'textColor',
      'fontFamily', 'fontSizeBase', 'spacingUnit', 'borderRadius',
      'mode', 'designStyle', 'cardStyle', 'buttonStyle'
    ];

    // Check if all required properties exist
    const hasRequiredProps = requiredProperties.every(prop => prop in theme);

    // Validate color format
    const colorProps = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor',
      'accentColor', 'successColor', 'warningColor', 'errorColor', 'infoColor'];
    const hasValidColors = colorProps.every(prop =>
      !theme[prop] || /^#[0-9A-F]{6}$/i.test(theme[prop])
    );

    // Validate numeric properties
    const numericProps = ['fontSizeBase', 'fontWeight', 'lineHeight', 'spacingUnit',
      'borderRadius', 'borderWidth', 'shadowIntensity', 'blurIntensity',
      'animationSpeed', 'focusOutlineWidth'];
    const hasValidNumbers = numericProps.every(prop =>
      !theme[prop] || typeof theme[prop] === 'number'
    );

    return hasRequiredProps && hasValidColors && hasValidNumbers;
  }

  // CSS Generation with better formatting
  generateCSS(): string {
    const theme = this.getCurrentTheme();
    const timestamp = new Date().toISOString();

    return `/* ================================================
 * Generated Theme CSS
 * Generated: ${timestamp}
 * Theme: ${theme.brandName}
 * Design Style: ${theme.designStyle}
 * Mode: ${theme.mode}
 * ================================================ */

/* Root Variables */
:root {
  /* ===== Core Colors ===== */
  --color-primary-500: ${theme.primaryColor};
  --color-secondary-500: ${theme.secondaryColor};
  --color-accent-500: ${theme.accentColor};

  /* ===== Semantic Colors ===== */
  --color-success-500: ${theme.successColor};
  --color-warning-500: ${theme.warningColor};
  --color-error-500: ${theme.errorColor};
  --color-info-500: ${theme.infoColor};

  /* ===== Surface Colors ===== */
  --surface-background: ${theme.backgroundColor};
  --surface-card: ${theme.surfaceCard};
  --surface-modal: ${theme.surfaceModal};
  --surface-hover: ${theme.surfaceHover};

  /* ===== Text Colors ===== */
  --text-primary: ${theme.textColor};

  /* ===== Typography ===== */
  --font-sans: ${theme.fontFamily};
  --font-display: ${theme.headingFontFamily};
  --text-base: ${theme.fontSizeBase}px;
  --font-normal: ${theme.fontWeight};
  --font-bold: ${theme.headingFontWeight};
  --leading-normal: ${theme.lineHeight};
  --tracking-normal: ${theme.letterSpacing}em;

  /* ===== Spacing ===== */
  --spacing-unit: ${theme.spacingUnit}px;
  --spacing-1: ${theme.spacingUnit * 0.25}px;
  --spacing-2: ${theme.spacingUnit * 0.5}px;
  --spacing-3: ${theme.spacingUnit * 0.75}px;
  --spacing-4: ${theme.spacingUnit}px;
  --spacing-6: ${theme.spacingUnit * 1.5}px;
  --spacing-8: ${theme.spacingUnit * 2}px;

  /* ===== Layout ===== */
  --rounded-sm: ${theme.borderRadius * 0.5}px;
  --rounded-md: ${theme.borderRadius}px;
  --rounded-lg: ${theme.borderRadius * 1.5}px;
  --rounded-xl: ${theme.borderRadius * 2}px;
  --border-width: ${theme.borderWidth}px;

  /* ===== Effects ===== */
  --shadow-intensity: ${theme.shadowIntensity};
  --blur-intensity: ${theme.blurIntensity}px;

  /* ===== Animation ===== */
  --duration-fast: ${theme.animationSpeed * 0.5}ms;
  --duration-normal: ${theme.animationSpeed}ms;
  --duration-slow: ${theme.animationSpeed * 1.5}ms;
  --ease-out: ${theme.animationEasing};

  /* ===== Accessibility ===== */
  --focus-outline-width: ${theme.focusOutlineWidth}px;
}

/* ===== Design Style Specific ===== */
[data-design-style="${theme.designStyle}"] {
  /* Custom styles for ${theme.designStyle} design */
${this.generateDesignStyleCSS(theme)}
}

/* ===== Component Styles ===== */
/* Card Style: ${theme.cardStyle} */
[data-card-style="${theme.cardStyle}"] {
${this.generateCardStyleCSS(theme)}
}

/* Button Style: ${theme.buttonStyle} */
[data-button-style="${theme.buttonStyle}"] {
${this.generateButtonStyleCSS(theme)}
}

/* Navigation Style: ${theme.navigationStyle} */
[data-navigation-style="${theme.navigationStyle}"] {
${this.generateNavigationStyleCSS(theme)}
}

/* ===== Performance Settings ===== */
${!theme.enableAnimations ? `/* Animations Disabled */
.no-animations * {
  animation: none !important;
  transition: none !important;
}` : ''}

${theme.reducedMotion ? `/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}` : ''}

${theme.highContrast ? `/* High Contrast Mode */
.high-contrast {
  filter: contrast(1.5);
}

.high-contrast * {
  border-width: 2px !important;
}` : ''}

${!theme.enableShadows ? `/* Shadows Disabled */
* {
  box-shadow: none !important;
}` : ''}

${!theme.enableBlur ? `/* Blur Effects Disabled */
* {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}` : ''}`;
  }

  private generateDesignStyleCSS(theme: ThemeConfig): string {
    switch (theme.designStyle) {
      case 'glassmorphic':
        return `  /* Glassmorphic properties */
  --glass-blur: ${theme.blurIntensity}px;
  --glass-opacity: 0.1;
  --glass-border: rgba(255, 255, 255, 0.2);`;

      case 'neumorphic':
        return `  /* Neumorphic properties */
  --neu-background: ${theme.mode === 'dark' ? '#1a1a1a' : '#e0e0e0'};
  --neu-shadow-light: ${theme.mode === 'dark' ? '#262626' : '#ffffff'};
  --neu-shadow-dark: ${theme.mode === 'dark' ? '#0e0e0e' : '#bebebe'};`;

      case 'material':
        return `  /* Material Design properties */
  --mat-elevation-1: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
  --mat-elevation-2: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
  --mat-elevation-3: 0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12);`;

      default:
        return `  /* Modern style - using default properties */`;
    }
  }

  private generateCardStyleCSS(theme: ThemeConfig): string {
    switch (theme.cardStyle) {
      case 'elevated':
        return `  box-shadow: var(--shadow-md);
  border: none;`;

      case 'flat':
        return `  box-shadow: none;
  border: 1px solid var(--border-default);`;

      case 'bordered':
        return `  box-shadow: none;
  border: 2px solid var(--border-strong);`;

      case 'glass':
        return `  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--blur-intensity));
  border: 1px solid rgba(255, 255, 255, 0.2);`;

      default:
        return '';
    }
  }

  private generateButtonStyleCSS(theme: ThemeConfig): string {
    switch (theme.buttonStyle) {
      case 'rounded':
        return `  border-radius: var(--rounded-full);`;

      case 'square':
        return `  border-radius: 0;`;

      case 'outlined':
        return `  background: transparent;
  border: var(--border-width) solid currentColor;`;

      default:
        return `  /* Primary button style - default */`;
    }
  }

  private generateNavigationStyleCSS(theme: ThemeConfig): string {
    switch (theme.navigationStyle) {
      case 'elevated':
        return `  box-shadow: var(--shadow-sm);
  background: var(--surface-card);`;

      case 'flat':
        return `  box-shadow: none;
  border-bottom: 1px solid var(--border-default);`;

      case 'bordered':
        return `  box-shadow: none;
  border: 1px solid var(--border-default);`;

      default:
        return '';
    }
  }

  // Preset management
  private getDefaultPresets(): ThemePreset[] {
    return [
      {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with subtle shadows',
        config: {
          designStyle: 'modern',
          primaryColor: '#3b82f6',
          borderRadius: 8,
          shadowIntensity: 0.1,
          fontFamily: 'Inter, system-ui, sans-serif',
          animationSpeed: 300,
          cardStyle: 'elevated',
          navigationStyle: 'elevated'
        }
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Minimalist design with clean lines',
        config: {
          designStyle: 'minimal',
          primaryColor: '#000000',
          secondaryColor: '#666666',
          backgroundColor: '#ffffff',
          borderRadius: 0,
          shadowIntensity: 0,
          fontFamily: 'system-ui, sans-serif',
          animationSpeed: 150,
          enableShadows: false,
          borderWidth: 1,
          cardStyle: 'flat',
          navigationStyle: 'flat'
        }
      },
      {
        id: 'glassmorphic',
        name: 'Glass',
        description: 'Translucent design with blur effects',
        config: {
          designStyle: 'glassmorphic',
          primaryColor: '#3b82f6',
          backgroundColor: '#f0f9ff',
          borderRadius: 16,
          shadowIntensity: 0.2,
          blurIntensity: 20,
          fontFamily: 'Inter, system-ui, sans-serif',
          animationSpeed: 400,
          enableBlur: true,
          cardStyle: 'glass',
          navigationStyle: 'elevated'
        }
      },
      {
        id: 'neumorphic',
        name: 'Neuro',
        description: 'Soft UI with depth and shadows',
        config: {
          designStyle: 'neumorphic',
          primaryColor: '#6366f1',
          backgroundColor: '#e0e0e0',
          borderRadius: 20,
          shadowIntensity: 0.15,
          fontFamily: 'system-ui, sans-serif',
          animationSpeed: 250,
          borderWidth: 0,
          cardStyle: 'elevated',
          navigationStyle: 'flat'
        }
      },
      {
        id: 'corporate',
        name: 'Corporate',
        description: 'Professional business theme',
        config: {
          designStyle: 'modern',
          primaryColor: '#1e40af',
          secondaryColor: '#475569',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: 4,
          spacingUnit: 20,
          fontSizeBase: 15,
          cardStyle: 'bordered',
          navigationStyle: 'flat'
        }
      },
      {
        id: 'creative',
        name: 'Creative',
        description: 'Bold and vibrant design',
        config: {
          designStyle: 'modern',
          primaryColor: '#f59e0b',
          accentColor: '#ef4444',
          backgroundColor: '#fef3c7',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: 16,
          spacingUnit: 24,
          shadowIntensity: 0.15,
          cardStyle: 'elevated',
          navigationStyle: 'elevated'
        }
      },
      {
        id: 'dark-mode',
        name: 'Dark Pro',
        description: 'Professional dark theme',
        config: {
          mode: 'dark',
          designStyle: 'modern',
          primaryColor: '#60a5fa',
          secondaryColor: '#94a3b8',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          borderRadius: 8,
          cardStyle: 'elevated',
          navigationStyle: 'elevated'
        }
      },
      {
        id: 'material',
        name: 'Material',
        description: 'Google Material Design inspired',
        config: {
          designStyle: 'material',
          primaryColor: '#1976d2',
          secondaryColor: '#424242',
          backgroundColor: '#fafafa',
          borderRadius: 4,
          shadowIntensity: 0.12,
          fontFamily: 'Roboto, system-ui, sans-serif',
          animationSpeed: 200,
          cardStyle: 'elevated',
          navigationStyle: 'elevated'
        }
      }
    ];
  }

  // Color contrast calculation for accessibility
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    const RGB = sRGB.map(val => {
      if (val <= 0.03928) {
        return val / 12.92;
      }
      return Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * RGB[0] + 0.7152 * RGB[1] + 0.0722 * RGB[2];
  }

  // Check if text color has sufficient contrast
  isAccessibleContrast(backgroundColor: string, textColor: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(backgroundColor, textColor);
    const threshold = isLargeText ? 3 : 4.5; // WCAG AA standards
    return ratio >= threshold;
  }
}
