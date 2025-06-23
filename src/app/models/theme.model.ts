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
    'warningColor', 'errorColor', 'infoColor'
  ];

  colorFields.forEach(field => {
    if (theme[field] && typeof theme[field] === 'string') {
      const value = theme[field] as string;
      if (!colorRegex.test(value) && !value.startsWith('rgb') && !value.startsWith('hsl')) {
        errors.push(`Invalid color format for ${field}: ${value}`);
      }
    }
  });

  // Validate numeric values
  if (theme.fontSizeBase && (theme.fontSizeBase < 10 || theme.fontSizeBase > 32)) {
    warnings.push('Font size should be between 10px and 32px for optimal readability');
  }

  if (theme.spacingUnit && (theme.spacingUnit < 4 || theme.spacingUnit > 48)) {
    warnings.push('Spacing unit should be between 4px and 48px');
  }

  if (theme.borderRadius && theme.borderRadius > 50) {
    warnings.push('Border radius greater than 50px may cause layout issues');
  }

  // Validate contrast ratios
  if (theme.backgroundColor && theme.textColor) {
    // Add contrast validation logic here if needed
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
