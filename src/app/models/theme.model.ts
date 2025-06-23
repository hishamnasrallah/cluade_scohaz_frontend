// src/app/models/theme.model.ts

export interface ThemeConfig {
  // Core Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;

  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;

  // Surface Colors
  surfaceCard: string;
  surfaceModal: string;
  surfaceHover: string;

  // Typography
  fontFamily: string;
  fontSizeBase: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  headingFontFamily: string;
  headingFontWeight: number;

  // Spacing & Layout
  spacingUnit: number;
  borderRadius: number;
  borderWidth: number;

  // Shadows & Effects
  shadowIntensity: number;
  blurIntensity: number;

  // Animation
  animationSpeed: number;
  animationEasing: string;

  // Advanced Features
  designStyle: 'modern' | 'minimal' | 'glassmorphic' | 'neumorphic' | 'material';
  navigationStyle: 'elevated' | 'flat' | 'bordered';
  cardStyle: 'elevated' | 'flat' | 'bordered' | 'glass';
  buttonStyle: 'primary' | 'secondary' | 'outline' | 'ghost';

  // Brand
  logoUrl?: string;
  brandName?: string;

  // Mode
  mode: 'light' | 'dark' | 'auto';

  // Performance
  enableAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;

  // Additional properties for extensibility
  [key: string]: any;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  config: Partial<ThemeConfig>;
}

export interface ThemeExport {
  version: string;
  timestamp: string;
  theme: ThemeConfig;
  metadata?: {
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export interface ThemeVariable {
  key: string;
  value: string | number;
  unit?: string;
  category: 'color' | 'typography' | 'spacing' | 'effect' | 'other';
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ThemeDefaults {
  static readonly DEFAULT_THEME: ThemeConfig = {
    // Core Colors
    primaryColor: '#34C5AA',
    secondaryColor: '#2BA99B',
    backgroundColor: '#F4FDFD',
    textColor: '#2F4858',
    accentColor: '#5FD3C4',

    // Semantic Colors
    successColor: '#22C55E',
    warningColor: '#F59E0B',
    errorColor: '#EF4444',
    infoColor: '#3B82F6',

    // Surface Colors
    surfaceCard: '#FFFFFF',
    surfaceModal: '#FFFFFF',
    surfaceHover: 'rgba(196, 247, 239, 0.3)',

    // Typography
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    headingFontFamily: 'Poppins, sans-serif',
    headingFontWeight: 600,

    // Spacing & Layout
    spacingUnit: 16,
    borderRadius: 12,
    borderWidth: 1,

    // Effects
    shadowIntensity: 0.1,
    blurIntensity: 10,

    // Animation
    animationSpeed: 300,
    animationEasing: 'ease-out',

    // Features
    designStyle: 'modern',
    navigationStyle: 'elevated',
    cardStyle: 'elevated',
    buttonStyle: 'primary',

    // Brand
    brandName: 'PraXelo Enterprise',
    logoUrl: 'assets/logo.svg',

    // Mode
    mode: 'light',

    // Performance
    enableAnimations: true,
    enableBlur: true,
    enableShadows: true,

    // Accessibility
    reducedMotion: false,
    highContrast: false
  };

  static readonly CSS_VARIABLE_MAP: Record<keyof ThemeConfig, string> = {
    primaryColor: '--color-primary',
    secondaryColor: '--color-secondary',
    backgroundColor: '--color-background',
    textColor: '--color-text',
    accentColor: '--color-accent',
    successColor: '--color-success',
    warningColor: '--color-warning',
    errorColor: '--color-error',
    infoColor: '--color-info',
    surfaceCard: '--surface-card',
    surfaceModal: '--surface-modal',
    surfaceHover: '--surface-hover',
    fontFamily: '--font-family',
    fontSizeBase: '--font-size-base',
    fontWeight: '--font-weight',
    lineHeight: '--line-height',
    letterSpacing: '--letter-spacing',
    headingFontFamily: '--heading-font-family',
    headingFontWeight: '--heading-font-weight',
    spacingUnit: '--spacing-unit',
    borderRadius: '--border-radius',
    borderWidth: '--border-width',
    shadowIntensity: '--shadow-intensity',
    blurIntensity: '--blur-intensity',
    animationSpeed: '--animation-speed',
    animationEasing: '--animation-easing',
    designStyle: '--design-style',
    navigationStyle: '--navigation-style',
    cardStyle: '--card-style',
    buttonStyle: '--button-style',
    logoUrl: '--logo-url',
    brandName: '--brand-name',
    mode: '--theme-mode',
    enableAnimations: '--enable-animations',
    enableBlur: '--enable-blur',
    enableShadows: '--enable-shadows',
    reducedMotion: '--reduced-motion',
    highContrast: '--high-contrast'
  };
}

// Helper functions
export function validateTheme(theme: Partial<ThemeConfig>): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate colors
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colorFields: (keyof ThemeConfig)[] = [
    'primaryColor', 'secondaryColor', 'backgroundColor',
    'textColor', 'accentColor', 'successColor',
    'warningColor', 'errorColor', 'infoColor',
    'surfaceCard', 'surfaceModal'
  ];

  colorFields.forEach(field => {
    if (theme[field] && typeof theme[field] === 'string') {
      const value = theme[field] as string;
      if (!colorRegex.test(value) && !value.startsWith('rgb') && !value.startsWith('hsl') && value !== 'transparent') {
        errors.push(`Invalid color format for ${field}: ${value}`);
      }
    }
  });

  // Validate numeric values
  if (theme.fontSizeBase !== undefined) {
    if (theme.fontSizeBase < 10 || theme.fontSizeBase > 32) {
      warnings.push('Font size should be between 10px and 32px for optimal readability');
    }
  }

  if (theme.spacingUnit !== undefined) {
    if (theme.spacingUnit < 4 || theme.spacingUnit > 48) {
      warnings.push('Spacing unit should be between 4px and 48px');
    }
  }

  if (theme.borderRadius !== undefined && theme.borderRadius > 50) {
    warnings.push('Border radius greater than 50px may cause layout issues');
  }

  if (theme.fontWeight !== undefined) {
    if (theme.fontWeight < 100 || theme.fontWeight > 900 || theme.fontWeight % 100 !== 0) {
      errors.push('Font weight must be between 100 and 900 in increments of 100');
    }
  }

  if (theme.lineHeight !== undefined) {
    if (theme.lineHeight < 1 || theme.lineHeight > 2) {
      warnings.push('Line height should be between 1 and 2 for optimal readability');
    }
  }

  if (theme.letterSpacing !== undefined) {
    if (theme.letterSpacing < -0.05 || theme.letterSpacing > 0.1) {
      warnings.push('Letter spacing should be between -0.05em and 0.1em');
    }
  }

  if (theme.shadowIntensity !== undefined) {
    if (theme.shadowIntensity < 0 || theme.shadowIntensity > 0.5) {
      errors.push('Shadow intensity must be between 0 and 0.5');
    }
  }

  if (theme.blurIntensity !== undefined) {
    if (theme.blurIntensity < 0 || theme.blurIntensity > 30) {
      warnings.push('Blur intensity should be between 0 and 30px');
    }
  }

  if (theme.animationSpeed !== undefined) {
    if (theme.animationSpeed < 100 || theme.animationSpeed > 800) {
      warnings.push('Animation speed should be between 100ms and 800ms');
    }
  }

  // Validate contrast ratios
  if (theme.backgroundColor && theme.textColor) {
    const contrastRatio = getContrastRatio(theme.backgroundColor, theme.textColor);
    if (contrastRatio < 4.5) {
      warnings.push('Text and background color combination may not meet WCAG AA standards');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function exportTheme(theme: ThemeConfig, metadata?: any): ThemeExport {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    theme,
    metadata
  };
}

export function mergeThemes(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  return { ...base, ...override };
}

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// CSS Generation utilities
export function generateCSSFromTheme(theme: ThemeConfig): string {
  const cssVariables = Object.entries(ThemeDefaults.CSS_VARIABLE_MAP)
    .map(([key, cssVar]) => {
      const value = theme[key as keyof ThemeConfig];
      if (value !== undefined) {
        if (typeof value === 'number') {
          if (key === 'fontSizeBase' || key === 'spacingUnit' || key === 'borderRadius' || key === 'borderWidth' || key === 'blurIntensity') {
            return `${cssVar}: ${value}px;`;
          } else if (key === 'letterSpacing') {
            return `${cssVar}: ${value}em;`;
          } else if (key === 'animationSpeed') {
            return `${cssVar}: ${value}ms;`;
          } else {
            return `${cssVar}: ${value};`;
          }
        } else if (typeof value === 'boolean') {
          return `${cssVar}: ${value ? '1' : '0'};`;
        } else {
          return `${cssVar}: ${value};`;
        }
      }
      return '';
    })
    .filter(line => line !== '')
    .join('\n  ');

  return `:root {\n  ${cssVariables}\n}`;
}

// Accessibility utilities
export function checkAccessibility(theme: ThemeConfig): string[] {
  const issues: string[] = [];

  // Check color contrast
  const colorPairs = [
    { bg: theme.backgroundColor, fg: theme.textColor, name: 'Text on Background' },
    { bg: theme.primaryColor, fg: '#FFFFFF', name: 'White on Primary' },
    { bg: theme.surfaceCard, fg: theme.textColor, name: 'Text on Card' }
  ];

  colorPairs.forEach(pair => {
    const ratio = getContrastRatio(pair.bg, pair.fg);
    if (ratio < 4.5) {
      issues.push(`${pair.name}: Contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard (4.5)`);
    }
  });

  // Check font size
  if (theme.fontSizeBase < 14) {
    issues.push('Base font size is below 14px, which may impact readability');
  }

  // Check animation speed
  if (theme.enableAnimations && theme.animationSpeed < 200) {
    issues.push('Animation speed is very fast, consider reduced motion preferences');
  }

  return issues;
}
