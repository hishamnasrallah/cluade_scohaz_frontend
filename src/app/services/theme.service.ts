// services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  constructor() {
    this.loadSavedTheme();
    // Apply theme after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.applyTheme(this.themeSubject.value);
    }, 0);
  }

  getCurrentTheme(): ThemeConfig {
    return this.themeSubject.value;
  }

  updateTheme(updates: Partial<ThemeConfig>): void {
    const newTheme = { ...this.themeSubject.value, ...updates };
    this.themeSubject.next(newTheme);
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.updateTheme({ [property]: value });
  }

  applyPreset(presetId: string): void {
    const preset = this.presetsSubject.value.find(p => p.id === presetId);
    if (preset) {
      this.updateTheme(preset.config);
    }
  }

  resetTheme(): void {
    this.themeSubject.next(this.defaultTheme);
    this.applyTheme(this.defaultTheme);
    this.saveTheme(this.defaultTheme);
  }

  private applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement;

    // Generate color variations
    const colors = {
      primary: this.hexToRgb(theme.primaryColor),
      secondary: this.hexToRgb(theme.secondaryColor),
      success: this.hexToRgb(theme.successColor),
      warning: this.hexToRgb(theme.warningColor),
      error: this.hexToRgb(theme.errorColor),
      info: this.hexToRgb(theme.infoColor),
      accent: this.hexToRgb(theme.accentColor)
    };

    // Apply color variations
    Object.entries(colors).forEach(([name, rgb]) => {
      if (rgb) {
        // Generate color scale
        for (let i = 50; i <= 950; i += (i < 100 ? 50 : 100)) {
          const factor = i < 500 ? (500 - i) / 450 : (i - 500) / 450;
          const shade = i < 500
            ? this.lighten(rgb, factor)
            : this.darken(rgb, factor);
          root.style.setProperty(`--color-${name}-${i}`, shade);
        }
        // Set the main color
        root.style.setProperty(`--color-${name}-500`, theme[`${name}Color` as keyof ThemeConfig] as string);
      }
    });

    // Apply surface colors based on mode
    if (theme.mode === 'dark') {
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
    } else {
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
    }

    // Apply typography with proper units
    root.style.setProperty('--font-sans', theme.fontFamily);
    root.style.setProperty('--font-display', theme.headingFontFamily);
    root.style.setProperty('--text-base', `${theme.fontSizeBase}px`);
    root.style.setProperty('--text-xs', `${theme.fontSizeBase * 0.75}px`);
    root.style.setProperty('--text-sm', `${theme.fontSizeBase * 0.875}px`);
    root.style.setProperty('--text-lg', `${theme.fontSizeBase * 1.125}px`);
    root.style.setProperty('--text-xl', `${theme.fontSizeBase * 1.25}px`);
    root.style.setProperty('--text-2xl', `${theme.fontSizeBase * 1.5}px`);
    root.style.setProperty('--text-3xl', `${theme.fontSizeBase * 1.875}px`);
    root.style.setProperty('--text-4xl', `${theme.fontSizeBase * 2.25}px`);

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
    for (let i = 0; i <= 96; i++) {
      const value = i <= 12 ? i : i <= 64 ? Math.floor(i / 4) * 4 : Math.floor(i / 8) * 8;
      if (value === i) {
        root.style.setProperty(`--spacing-${i}`, `${baseSpacing * (i / 4)}px`);
      }
    }
    root.style.setProperty('--spacing-px', '1px');
    root.style.setProperty('--spacing-0_5', `${baseSpacing * 0.125}px`);
    root.style.setProperty('--spacing-1_5', `${baseSpacing * 0.375}px`);
    root.style.setProperty('--spacing-2_5', `${baseSpacing * 0.625}px`);
    root.style.setProperty('--spacing-3_5', `${baseSpacing * 0.875}px`);

    // Apply border radius
    root.style.setProperty('--rounded-none', '0');
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

    // Apply shadows
    const shadowBase = theme.shadowIntensity;
    root.style.setProperty('--shadow-none', 'none');
    root.style.setProperty('--shadow-xs', `0 1px 2px 0 rgba(0, 0, 0, ${shadowBase * 0.5})`);
    root.style.setProperty('--shadow-sm', `0 1px 3px 0 rgba(0, 0, 0, ${shadowBase}), 0 1px 2px -1px rgba(0, 0, 0, ${shadowBase})`);
    root.style.setProperty('--shadow-md', `0 4px 6px -1px rgba(0, 0, 0, ${shadowBase}), 0 2px 4px -2px rgba(0, 0, 0, ${shadowBase})`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px rgba(0, 0, 0, ${shadowBase}), 0 4px 6px -4px rgba(0, 0, 0, ${shadowBase})`);
    root.style.setProperty('--shadow-xl', `0 20px 25px -5px rgba(0, 0, 0, ${shadowBase}), 0 8px 10px -6px rgba(0, 0, 0, ${shadowBase})`);
    root.style.setProperty('--shadow-2xl', `0 25px 50px -12px rgba(0, 0, 0, ${shadowBase * 2.5})`);

    // Apply animation
    root.style.setProperty('--duration-instant', '0ms');
    root.style.setProperty('--duration-fast', `${theme.animationSpeed * 0.5}ms`);
    root.style.setProperty('--duration-normal', `${theme.animationSpeed}ms`);
    root.style.setProperty('--duration-slow', `${theme.animationSpeed * 1.5}ms`);
    root.style.setProperty('--ease-in', theme.animationEasing === 'ease' ? 'ease-in' : theme.animationEasing);
    root.style.setProperty('--ease-out', theme.animationEasing);
    root.style.setProperty('--ease-in-out', theme.animationEasing === 'ease' ? 'ease-in-out' : theme.animationEasing);

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
    root.setAttribute('data-theme-mode', theme.mode);
  }

  private applyDesignStyleEffects(theme: ThemeConfig): void {
    const root = document.documentElement;

    switch (theme.designStyle) {
      case 'glassmorphic':
        root.style.setProperty('--glass-blur', `${theme.blurIntensity}px`);
        root.style.setProperty('--glass-opacity', '0.1');
        root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
        break;

      case 'neumorphic':
        const neuBg = theme.mode === 'dark' ? '#1a1a1a' : '#e0e0e0';
        root.style.setProperty('--neu-background', neuBg);
        root.style.setProperty('--neu-shadow-light', theme.mode === 'dark' ? '#262626' : '#ffffff');
        root.style.setProperty('--neu-shadow-dark', theme.mode === 'dark' ? '#0e0e0e' : '#bebebe');
        break;

      case 'material':
        root.style.setProperty('--mat-elevation-1', '0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)');
        root.style.setProperty('--mat-elevation-2', '0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)');
        root.style.setProperty('--mat-elevation-3', '0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12)');
        break;
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }

  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        this.themeSubject.next(theme);
      } catch (e) {
        console.error('Failed to load saved theme', e);
      }
    }
  }

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
          animationSpeed: 300
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
          borderWidth: 1
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
          enableBlur: true
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
          borderWidth: 0
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
          fontSizeBase: 15
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
          shadowIntensity: 0.15
        }
      }
    ];
  }

  exportTheme(): string {
    const theme = this.getCurrentTheme();
    return JSON.stringify(theme, null, 2);
  }

  importTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson);
      this.updateTheme(theme);
    } catch (e) {
      console.error('Failed to import theme', e);
      throw new Error('Invalid theme JSON');
    }
  }

  generateCSS(): string {
    const theme = this.getCurrentTheme();
    return `/* Generated Theme CSS - ${new Date().toISOString()} */
/* Theme: ${theme.brandName} */
/* Design Style: ${theme.designStyle} */
/* Mode: ${theme.mode} */

:root {
  /* Core Colors */
  --color-primary-500: ${theme.primaryColor};
  --color-secondary-500: ${theme.secondaryColor};
  --surface-background: ${theme.backgroundColor};
  --text-primary: ${theme.textColor};
  --color-accent-500: ${theme.accentColor};

  /* Semantic Colors */
  --color-success-500: ${theme.successColor};
  --color-warning-500: ${theme.warningColor};
  --color-error-500: ${theme.errorColor};
  --color-info-500: ${theme.infoColor};

  /* Surface Colors */
  --surface-card: ${theme.surfaceCard};
  --surface-modal: ${theme.surfaceModal};
  --surface-hover: ${theme.surfaceHover};

  /* Typography */
  --font-sans: ${theme.fontFamily};
  --font-display: ${theme.headingFontFamily};
  --text-base: ${theme.fontSizeBase}px;
  --font-normal: ${theme.fontWeight};
  --font-bold: ${theme.headingFontWeight};
  --leading-normal: ${theme.lineHeight};
  --tracking-normal: ${theme.letterSpacing}em;

  /* Spacing */
  --spacing-unit: ${theme.spacingUnit}px;
  --spacing-4: ${theme.spacingUnit}px;

  /* Layout */
  --rounded-md: ${theme.borderRadius}px;
  --border-1: ${theme.borderWidth}px;

  /* Effects */
  --shadow-intensity: ${theme.shadowIntensity};
  --blur-intensity: ${theme.blurIntensity}px;

  /* Animation */
  --duration-normal: ${theme.animationSpeed}ms;
  --ease-out: ${theme.animationEasing};

  /* Accessibility */
  --focus-outline-width: ${theme.focusOutlineWidth}px;
}

/* Design Style: ${theme.designStyle} */
[data-design-style="${theme.designStyle}"] {
  /* Custom styles for ${theme.designStyle} design */
}

/* Performance Settings */
${!theme.enableAnimations ? '.no-animations * { animation: none !important; transition: none !important; }' : ''}
${theme.reducedMotion ? '.motion-reduce * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }' : ''}
${theme.highContrast ? '.high-contrast { filter: contrast(150%); }' : ''}
    `.trim();
  }
}
