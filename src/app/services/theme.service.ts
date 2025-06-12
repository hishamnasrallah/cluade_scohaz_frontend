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
    this.applyTheme(this.themeSubject.value);
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

    // Apply colors
    root.style.setProperty('--color-primary-500', theme.primaryColor);
    root.style.setProperty('--color-secondary-500', theme.secondaryColor);
    root.style.setProperty('--surface-background', theme.backgroundColor);
    root.style.setProperty('--text-primary', theme.textColor);
    root.style.setProperty('--color-accent-500', theme.accentColor);

    root.style.setProperty('--color-success-500', theme.successColor);
    root.style.setProperty('--color-warning-500', theme.warningColor);
    root.style.setProperty('--color-error-500', theme.errorColor);
    root.style.setProperty('--color-info-500', theme.infoColor);

    root.style.setProperty('--surface-card', theme.surfaceCard);
    root.style.setProperty('--surface-modal', theme.surfaceModal);
    root.style.setProperty('--surface-hover', theme.surfaceHover);

    // Apply typography
    root.style.setProperty('--font-sans', theme.fontFamily);
    root.style.setProperty('--text-base', `${theme.fontSizeBase}px`);
    root.style.setProperty('--font-normal', theme.fontWeight.toString());
    root.style.setProperty('--leading-normal', theme.lineHeight.toString());
    root.style.setProperty('--tracking-normal', `${theme.letterSpacing}em`);
    root.style.setProperty('--font-display', theme.headingFontFamily);
    root.style.setProperty('--font-bold', theme.headingFontWeight.toString());

    // Apply spacing and layout
    root.style.setProperty('--spacing-4', `${theme.spacingUnit}px`);
    root.style.setProperty('--rounded-md', `${theme.borderRadius}px`);
    root.style.setProperty('--border-1', `${theme.borderWidth}px`);

    // Apply effects
    root.style.setProperty('--shadow-intensity', theme.shadowIntensity.toString());
    root.style.setProperty('--blur-intensity', `${theme.blurIntensity}px`);

    // Apply animation
    root.style.setProperty('--duration-normal', `${theme.animationSpeed}ms`);
    root.style.setProperty('--ease-out', theme.animationEasing);

    // Apply dark mode adjustments
    if (theme.mode === 'dark') {
      root.style.setProperty('--surface-background', '#0f172a');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--surface-card', '#1e293b');
      root.style.setProperty('--border-default', '#334155');
    }

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

    // Apply design style class
    root.setAttribute('data-design-style', theme.designStyle);
    root.setAttribute('data-theme-mode', theme.mode);
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
          borderRadius: 0,
          shadowIntensity: 0,
          fontFamily: 'system-ui, sans-serif',
          animationSpeed: 150,
          enableShadows: false
        }
      },
      {
        id: 'glassmorphic',
        name: 'Glassmorphic',
        description: 'Translucent design with blur effects',
        config: {
          designStyle: 'glassmorphic',
          primaryColor: '#3b82f6',
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
        name: 'Neumorphic',
        description: 'Soft UI with depth and shadows',
        config: {
          designStyle: 'neumorphic',
          primaryColor: '#6366f1',
          backgroundColor: '#e5e7eb',
          borderRadius: 20,
          shadowIntensity: 0.15,
          fontFamily: 'system-ui, sans-serif',
          animationSpeed: 250
        }
      },
      {
        id: 'material',
        name: 'Material Design',
        description: 'Google Material Design principles',
        config: {
          designStyle: 'material',
          primaryColor: '#1976d2',
          secondaryColor: '#424242',
          borderRadius: 4,
          shadowIntensity: 0.12,
          fontFamily: 'Roboto, system-ui, sans-serif',
          animationSpeed: 225,
          animationEasing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
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
          spacingUnit: 20
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
          spacingUnit: 24
        }
      },
      {
        id: 'dark-mode',
        name: 'Dark Mode',
        description: 'Dark theme for low-light environments',
        config: {
          mode: 'dark',
          primaryColor: '#60a5fa',
          backgroundColor: '#0f172a',
          textColor: '#f8fafc',
          surfaceCard: '#1e293b'
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
    return `
/* Generated Theme CSS */
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

  /* Typography */
  --font-sans: ${theme.fontFamily};
  --text-base: ${theme.fontSizeBase}px;
  --font-normal: ${theme.fontWeight};
  --leading-normal: ${theme.lineHeight};
  --tracking-normal: ${theme.letterSpacing}em;

  /* Spacing & Layout */
  --spacing-4: ${theme.spacingUnit}px;
  --rounded-md: ${theme.borderRadius}px;
  --border-1: ${theme.borderWidth}px;

  /* Effects */
  --shadow-intensity: ${theme.shadowIntensity};
  --blur-intensity: ${theme.blurIntensity}px;

  /* Animation */
  --duration-normal: ${theme.animationSpeed}ms;
  --ease-out: ${theme.animationEasing};
}

/* Design Style: ${theme.designStyle} */
[data-design-style="${theme.designStyle}"] {
  /* Custom styles for ${theme.designStyle} design */
}

/* Theme Mode: ${theme.mode} */
[data-theme-mode="${theme.mode}"] {
  /* Custom styles for ${theme.mode} mode */
}
    `.trim();
  }
}
