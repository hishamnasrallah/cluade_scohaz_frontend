// src/app/models/theme.model.ts

export interface ThemeConfig {
  // Core Colors
  primaryColor: string;
  primaryLightColor: string;
  primaryDarkColor: string;
  secondaryColor: string;
  secondaryLightColor: string;
  secondaryDarkColor: string;
  backgroundColor: string;
  backgroundPaperColor: string;
  backgroundDefaultColor: string;
  textColor: string;
  textSecondaryColor: string;
  textDisabledColor: string;
  textHintColor: string;
  accentColor: string;
  accentLightColor: string;
  accentDarkColor: string;

  // Semantic Colors
  successColor: string;
  successLightColor: string;
  successDarkColor: string;
  warningColor: string;
  warningLightColor: string;
  warningDarkColor: string;
  errorColor: string;
  errorLightColor: string;
  errorDarkColor: string;
  infoColor: string;
  infoLightColor: string;
  infoDarkColor: string;

  // Surface Colors
  surfaceCard: string;
  surfaceModal: string;
  surfaceHover: string;
  surfaceFocus: string;
  surfaceSelected: string;
  surfaceDisabled: string;
  dividerColor: string;
  overlayColor: string;

  // Typography - Body
  fontFamily: string;
  fontSizeBase: number;
  fontSizeSmall: number;
  fontSizeMedium: number;
  fontSizeLarge: number;
  fontSizeXLarge: number;
  fontWeight: number;
  fontWeightLight: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  lineHeight: number;
  lineHeightTight: number;
  lineHeightRelaxed: number;
  letterSpacing: number;
  letterSpacingTight: number;
  letterSpacingWide: number;

  // Typography - Headings
  headingFontFamily: string;
  headingFontWeight: number;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  h5Size: number;
  h6Size: number;

  // Spacing & Layout
  spacingUnit: number;
  spacingXSmall: number;
  spacingSmall: number;
  spacingMedium: number;
  spacingLarge: number;
  spacingXLarge: number;
  containerMaxWidth: number;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;

  // Borders
  borderRadius: number;
  borderRadiusSmall: number;
  borderRadiusMedium: number;
  borderRadiusLarge: number;
  borderRadiusCircle: number;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderColor: string;
  borderFocusColor: string;
  borderHoverColor: string;

  // Shadows & Effects
  shadowIntensity: number;
  shadowColor: string;
  shadowSmall: string;
  shadowMedium: string;
  shadowLarge: string;
  shadowInset: string;
  blurIntensity: number;
  blurSmall: number;
  blurMedium: number;
  blurLarge: number;

  // Animation
  animationSpeed: number;
  animationSpeedSlow: number;
  animationSpeedFast: number;
  animationEasing: string;
  animationEasingIn: string;
  animationEasingOut: string;
  animationEasingInOut: string;

  // Component Specific
  buttonHeight: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  buttonFontSize: number;
  buttonFontWeight: number;
  buttonBorderRadius: number;
  inputHeight: number;
  inputPaddingX: number;
  inputPaddingY: number;
  inputFontSize: number;
  inputBorderRadius: number;
  cardPadding: number;
  cardBorderRadius: number;
  cardElevation: number;
  modalBorderRadius: number;
  modalPadding: number;
  tooltipFontSize: number;
  tooltipPadding: number;
  tooltipBorderRadius: number;

  // Advanced Features
  designStyle: 'modern' | 'minimal' | 'glassmorphic' | 'neumorphic' | 'material' | 'flat' | 'gradient';
  navigationStyle: 'elevated' | 'flat' | 'bordered' | 'transparent' | 'gradient';
  cardStyle: 'elevated' | 'flat' | 'bordered' | 'glass' | 'gradient' | 'neumorphic';
  buttonStyle: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glow' | 'neumorphic';
  iconStyle: 'outlined' | 'filled' | 'rounded' | 'sharp' | 'two-tone';
  density: 'comfortable' | 'compact' | 'spacious';

  // Gradients
  enableGradients: boolean;
  primaryGradient: string;
  secondaryGradient: string;
  accentGradient: string;
  backgroundGradient: string;
  gradientAngle: number;

  // Brand
  logoUrl: string;
  faviconUrl: string;
  brandName: string;
  brandSlogan: string;
  brandFont: string;

  // Mode & Theme
  mode: 'light' | 'dark' | 'auto';
  colorScheme: 'ocean-mint' | 'corporate' | 'creative' | 'elegant' | 'tech' | 'custom';

  // Performance
  enableAnimations: boolean;
  enableTransitions: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableHoverEffects: boolean;
  enableFocusEffects: boolean;
  enableRipple: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
  screenReaderFriendly: boolean;
  textScaling: number;

  // Layout Settings
  layoutType: 'fixed' | 'fluid' | 'boxed';
  headerPosition: 'fixed' | 'static' | 'sticky';
  sidebarPosition: 'left' | 'right';
  footerPosition: 'fixed' | 'static';

  // Z-Index Layers
  zIndexDropdown: number;
  zIndexModal: number;
  zIndexPopover: number;
  zIndexTooltip: number;
  zIndexHeader: number;
  zIndexDrawer: number;
  zIndexOverlay: number;

  // Grid System
  gridColumns: number;
  gridGutter: number;
  gridBreakpointXs: number;
  gridBreakpointSm: number;
  gridBreakpointMd: number;
  gridBreakpointLg: number;
  gridBreakpointXl: number;

  // Additional properties for extensibility
  [key: string]: any;
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  tags?: string[];
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
    dependencies?: string[];
  };
}

export interface ThemeVariable {
  key: string;
  value: string | number;
  unit?: string;
  category: 'color' | 'typography' | 'spacing' | 'effect' | 'layout' | 'component' | 'other';
  description?: string;
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ColorPalette {
  name: string;
  baseColor: string;
  shades: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  contrast: {
    light: string;
    dark: string;
  };
}

export class ThemeDefaults {
  static readonly DEFAULT_THEME: ThemeConfig = {
    // Core Colors
    primaryColor: '#34C5AA',
    primaryLightColor: '#5FD3C4',
    primaryDarkColor: '#2BA99B',
    secondaryColor: '#2BA99B',
    secondaryLightColor: '#34C5AA',
    secondaryDarkColor: '#238A7F',
    backgroundColor: '#F4FDFD',
    backgroundPaperColor: '#FFFFFF',
    backgroundDefaultColor: '#F8FAFB',
    textColor: '#2F4858',
    textSecondaryColor: '#6B7280',
    textDisabledColor: '#9CA3AF',
    textHintColor: '#D1D5DB',
    accentColor: '#5FD3C4',
    accentLightColor: '#A8E8DD',
    accentDarkColor: '#34C5AA',

    // Semantic Colors
    successColor: '#22C55E',
    successLightColor: '#86EFAC',
    successDarkColor: '#16A34A',
    warningColor: '#F59E0B',
    warningLightColor: '#FCD34D',
    warningDarkColor: '#D97706',
    errorColor: '#EF4444',
    errorLightColor: '#FCA5A5',
    errorDarkColor: '#DC2626',
    infoColor: '#3B82F6',
    infoLightColor: '#93BBFE',
    infoDarkColor: '#2563EB',

    // Surface Colors
    surfaceCard: '#FFFFFF',
    surfaceModal: '#FFFFFF',
    surfaceHover: 'rgba(196, 247, 239, 0.3)',
    surfaceFocus: 'rgba(52, 197, 170, 0.12)',
    surfaceSelected: 'rgba(52, 197, 170, 0.08)',
    surfaceDisabled: 'rgba(0, 0, 0, 0.04)',
    dividerColor: 'rgba(0, 0, 0, 0.08)',
    overlayColor: 'rgba(0, 0, 0, 0.5)',

    // Typography - Body
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: 16,
    fontSizeSmall: 14,
    fontSizeMedium: 16,
    fontSizeLarge: 18,
    fontSizeXLarge: 20,
    fontWeight: 400,
    fontWeightLight: 300,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    lineHeight: 1.5,
    lineHeightTight: 1.25,
    lineHeightRelaxed: 1.75,
    letterSpacing: 0,
    letterSpacingTight: -0.025,
    letterSpacingWide: 0.025,

    // Typography - Headings
    headingFontFamily: 'Poppins, sans-serif',
    headingFontWeight: 600,
    h1Size: 40,
    h2Size: 32,
    h3Size: 28,
    h4Size: 24,
    h5Size: 20,
    h6Size: 18,

    // Spacing & Layout
    spacingUnit: 16,
    spacingXSmall: 4,
    spacingSmall: 8,
    spacingMedium: 16,
    spacingLarge: 24,
    spacingXLarge: 32,
    containerMaxWidth: 1400,
    sidebarWidth: 280,
    sidebarCollapsedWidth: 64,

    // Borders
    borderRadius: 12,
    borderRadiusSmall: 8,
    borderRadiusMedium: 12,
    borderRadiusLarge: 16,
    borderRadiusCircle: 9999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderFocusColor: '#34C5AA',
    borderHoverColor: 'rgba(52, 197, 170, 0.3)',

    // Shadows & Effects
    shadowIntensity: 0.1,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowSmall: '0 1px 3px rgba(0, 0, 0, 0.06)',
    shadowMedium: '0 4px 6px rgba(0, 0, 0, 0.08)',
    shadowLarge: '0 10px 15px rgba(0, 0, 0, 0.1)',
    shadowInset: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
    blurIntensity: 10,
    blurSmall: 4,
    blurMedium: 10,
    blurLarge: 20,

    // Animation
    animationSpeed: 300,
    animationSpeedSlow: 500,
    animationSpeedFast: 150,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationEasingIn: 'cubic-bezier(0.4, 0, 1, 1)',
    animationEasingOut: 'cubic-bezier(0, 0, 0.2, 1)',
    animationEasingInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Component Specific
    buttonHeight: 40,
    buttonPaddingX: 24,
    buttonPaddingY: 12,
    buttonFontSize: 14,
    buttonFontWeight: 600,
    buttonBorderRadius: 10,
    inputHeight: 44,
    inputPaddingX: 16,
    inputPaddingY: 12,
    inputFontSize: 16,
    inputBorderRadius: 10,
    cardPadding: 24,
    cardBorderRadius: 16,
    cardElevation: 1,
    modalBorderRadius: 20,
    modalPadding: 32,
    tooltipFontSize: 12,
    tooltipPadding: 8,
    tooltipBorderRadius: 6,

    // Advanced Features
    designStyle: 'modern',
    navigationStyle: 'elevated',
    cardStyle: 'elevated',
    buttonStyle: 'primary',
    iconStyle: 'outlined',
    density: 'comfortable',

    // Gradients
    enableGradients: true,
    primaryGradient: 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
    secondaryGradient: 'linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)',
    accentGradient: 'linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)',
    backgroundGradient: 'linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)',
    gradientAngle: 135,

    // Brand
    brandName: 'PraXelo Enterprise',
    brandSlogan: 'Enterprise Low-Code Platform',
    brandFont: 'Poppins, sans-serif',
    logoUrl: 'assets/logo.svg',
    faviconUrl: 'assets/favicon.ico',

    // Mode
    mode: 'light',
    colorScheme: 'ocean-mint',

    // Performance
    enableAnimations: true,
    enableTransitions: true,
    enableBlur: true,
    enableShadows: true,
    enableHoverEffects: true,
    enableFocusEffects: true,
    enableRipple: true,

    // Accessibility
    reducedMotion: false,
    highContrast: false,
    focusVisible: true,
    keyboardNavigation: true,
    screenReaderFriendly: true,
    textScaling: 1,

    // Layout Settings
    layoutType: 'fluid',
    headerPosition: 'sticky',
    sidebarPosition: 'left',
    footerPosition: 'static',

    // Z-Index Layers
    zIndexDropdown: 1000,
    zIndexModal: 1300,
    zIndexPopover: 1200,
    zIndexTooltip: 1400,
    zIndexHeader: 1100,
    zIndexDrawer: 1200,
    zIndexOverlay: 1250,

    // Grid System
    gridColumns: 12,
    gridGutter: 24,
    gridBreakpointXs: 0,
    gridBreakpointSm: 576,
    gridBreakpointMd: 768,
    gridBreakpointLg: 1024,
    gridBreakpointXl: 1280
  };

  static readonly CSS_VARIABLE_MAP: Record<string, string> = {
    // Core Colors
    primaryColor: '--color-primary',
    primaryLightColor: '--color-primary-light',
    primaryDarkColor: '--color-primary-dark',
    secondaryColor: '--color-secondary',
    secondaryLightColor: '--color-secondary-light',
    secondaryDarkColor: '--color-secondary-dark',
    backgroundColor: '--color-background',
    backgroundPaperColor: '--color-background-paper',
    backgroundDefaultColor: '--color-background-default',
    textColor: '--color-text',
    textSecondaryColor: '--color-text-secondary',
    textDisabledColor: '--color-text-disabled',
    textHintColor: '--color-text-hint',
    accentColor: '--color-accent',
    accentLightColor: '--color-accent-light',
    accentDarkColor: '--color-accent-dark',

    // Semantic Colors
    successColor: '--color-success',
    successLightColor: '--color-success-light',
    successDarkColor: '--color-success-dark',
    warningColor: '--color-warning',
    warningLightColor: '--color-warning-light',
    warningDarkColor: '--color-warning-dark',
    errorColor: '--color-error',
    errorLightColor: '--color-error-light',
    errorDarkColor: '--color-error-dark',
    infoColor: '--color-info',
    infoLightColor: '--color-info-light',
    infoDarkColor: '--color-info-dark',

    // Surface Colors
    surfaceCard: '--surface-card',
    surfaceModal: '--surface-modal',
    surfaceHover: '--surface-hover',
    surfaceFocus: '--surface-focus',
    surfaceSelected: '--surface-selected',
    surfaceDisabled: '--surface-disabled',
    dividerColor: '--divider-color',
    overlayColor: '--overlay-color',

    // Typography
    fontFamily: '--font-family',
    fontSizeBase: '--font-size-base',
    fontSizeSmall: '--font-size-small',
    fontSizeMedium: '--font-size-medium',
    fontSizeLarge: '--font-size-large',
    fontSizeXLarge: '--font-size-xlarge',
    fontWeight: '--font-weight',
    fontWeightLight: '--font-weight-light',
    fontWeightMedium: '--font-weight-medium',
    fontWeightBold: '--font-weight-bold',
    lineHeight: '--line-height',
    lineHeightTight: '--line-height-tight',
    lineHeightRelaxed: '--line-height-relaxed',
    letterSpacing: '--letter-spacing',
    letterSpacingTight: '--letter-spacing-tight',
    letterSpacingWide: '--letter-spacing-wide',
    headingFontFamily: '--heading-font-family',
    headingFontWeight: '--heading-font-weight',
    h1Size: '--h1-size',
    h2Size: '--h2-size',
    h3Size: '--h3-size',
    h4Size: '--h4-size',
    h5Size: '--h5-size',
    h6Size: '--h6-size',

    // Spacing
    spacingUnit: '--spacing-unit',
    spacingXSmall: '--spacing-xsmall',
    spacingSmall: '--spacing-small',
    spacingMedium: '--spacing-medium',
    spacingLarge: '--spacing-large',
    spacingXLarge: '--spacing-xlarge',
    containerMaxWidth: '--container-max-width',
    sidebarWidth: '--sidebar-width',
    sidebarCollapsedWidth: '--sidebar-collapsed-width',

    // Borders
    borderRadius: '--border-radius',
    borderRadiusSmall: '--border-radius-small',
    borderRadiusMedium: '--border-radius-medium',
    borderRadiusLarge: '--border-radius-large',
    borderRadiusCircle: '--border-radius-circle',
    borderWidth: '--border-width',
    borderStyle: '--border-style',
    borderColor: '--border-color',
    borderFocusColor: '--border-focus-color',
    borderHoverColor: '--border-hover-color',

    // Shadows
    shadowIntensity: '--shadow-intensity',
    shadowColor: '--shadow-color',
    shadowSmall: '--shadow-small',
    shadowMedium: '--shadow-medium',
    shadowLarge: '--shadow-large',
    shadowInset: '--shadow-inset',
    blurIntensity: '--blur-intensity',
    blurSmall: '--blur-small',
    blurMedium: '--blur-medium',
    blurLarge: '--blur-large',

    // Animation
    animationSpeed: '--animation-speed',
    animationSpeedSlow: '--animation-speed-slow',
    animationSpeedFast: '--animation-speed-fast',
    animationEasing: '--animation-easing',
    animationEasingIn: '--animation-easing-in',
    animationEasingOut: '--animation-easing-out',
    animationEasingInOut: '--animation-easing-in-out',

    // Components
    buttonHeight: '--button-height',
    buttonPaddingX: '--button-padding-x',
    buttonPaddingY: '--button-padding-y',
    buttonFontSize: '--button-font-size',
    buttonFontWeight: '--button-font-weight',
    buttonBorderRadius: '--button-border-radius',
    inputHeight: '--input-height',
    inputPaddingX: '--input-padding-x',
    inputPaddingY: '--input-padding-y',
    inputFontSize: '--input-font-size',
    inputBorderRadius: '--input-border-radius',
    cardPadding: '--card-padding',
    cardBorderRadius: '--card-border-radius',
    cardElevation: '--card-elevation',
    modalBorderRadius: '--modal-border-radius',
    modalPadding: '--modal-padding',
    tooltipFontSize: '--tooltip-font-size',
    tooltipPadding: '--tooltip-padding',
    tooltipBorderRadius: '--tooltip-border-radius',

    // Gradients
    primaryGradient: '--gradient-primary',
    secondaryGradient: '--gradient-secondary',
    accentGradient: '--gradient-accent',
    backgroundGradient: '--gradient-background',
    gradientAngle: '--gradient-angle',

    // Z-Index
    zIndexDropdown: '--z-index-dropdown',
    zIndexModal: '--z-index-modal',
    zIndexPopover: '--z-index-popover',
    zIndexTooltip: '--z-index-tooltip',
    zIndexHeader: '--z-index-header',
    zIndexDrawer: '--z-index-drawer',
    zIndexOverlay: '--z-index-overlay',

    // Grid
    gridColumns: '--grid-columns',
    gridGutter: '--grid-gutter',
    gridBreakpointXs: '--grid-breakpoint-xs',
    gridBreakpointSm: '--grid-breakpoint-sm',
    gridBreakpointMd: '--grid-breakpoint-md',
    gridBreakpointLg: '--grid-breakpoint-lg',
    gridBreakpointXl: '--grid-breakpoint-xl',

    // Other
    textScaling: '--text-scaling',
    density: '--density',
    mode: '--theme-mode',
    colorScheme: '--color-scheme'
  };
}

// Helper functions
export function validateTheme(theme: Partial<ThemeConfig>): ThemeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate colors
  const colorRegex = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\(|rgba\(|hsl\(|hsla\(|transparent|inherit|currentColor)/;
  const colorFields = Object.keys(theme).filter(key => key.includes('Color') || key.includes('Gradient'));

  colorFields.forEach(field => {
    const value = theme[field as keyof ThemeConfig];
    if (value && typeof value === 'string' && !colorRegex.test(value)) {
      errors.push(`Invalid color format for ${field}: ${value}`);
    }
  });

  // Validate numeric ranges
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

  if (theme.shadowIntensity !== undefined) {
    if (theme.shadowIntensity < 0 || theme.shadowIntensity > 1) {
      errors.push('Shadow intensity must be between 0 and 1');
    }
  }

  if (theme.animationSpeed !== undefined) {
    if (theme.animationSpeed < 0 || theme.animationSpeed > 2000) {
      warnings.push('Animation speed should be between 0ms and 2000ms');
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

export function generateColorPalette(baseColor: string): ColorPalette {
  // Generate a complete color palette from a base color
  const shades: any = {};
  const hsl = hexToHsl(baseColor);

  if (hsl) {
    shades['50'] = hslToHex({ ...hsl, l: 95 });
    shades['100'] = hslToHex({ ...hsl, l: 90 });
    shades['200'] = hslToHex({ ...hsl, l: 80 });
    shades['300'] = hslToHex({ ...hsl, l: 70 });
    shades['400'] = hslToHex({ ...hsl, l: 60 });
    shades['500'] = baseColor;
    shades['600'] = hslToHex({ ...hsl, l: 40 });
    shades['700'] = hslToHex({ ...hsl, l: 30 });
    shades['800'] = hslToHex({ ...hsl, l: 20 });
    shades['900'] = hslToHex({ ...hsl, l: 10 });
  }

  return {
    name: 'Custom Palette',
    baseColor,
    shades,
    contrast: {
      light: '#FFFFFF',
      dark: '#000000'
    }
  };
}

export function exportTheme(theme: ThemeConfig, metadata?: any): ThemeExport {
  return {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    theme,
    metadata
  };
}

export function mergeThemes(base: ThemeConfig, override: Partial<ThemeConfig>): ThemeConfig {
  return { ...base, ...override };
}

export function generateCSSFromTheme(theme: ThemeConfig): string {
  const cssVariables = Object.entries(ThemeDefaults.CSS_VARIABLE_MAP)
    .map(([key, cssVar]) => {
      const value = theme[key as keyof ThemeConfig];
      if (value !== undefined) {
        if (typeof value === 'number') {
          const numberKeys = ['fontSizeBase', 'fontSizeSmall', 'fontSizeMedium', 'fontSizeLarge', 'fontSizeXLarge',
            'h1Size', 'h2Size', 'h3Size', 'h4Size', 'h5Size', 'h6Size',
            'spacingUnit', 'spacingXSmall', 'spacingSmall', 'spacingMedium', 'spacingLarge', 'spacingXLarge',
            'borderRadius', 'borderRadiusSmall', 'borderRadiusMedium', 'borderRadiusLarge', 'borderRadiusCircle',
            'borderWidth', 'blurIntensity', 'blurSmall', 'blurMedium', 'blurLarge',
            'buttonHeight', 'buttonPaddingX', 'buttonPaddingY', 'buttonFontSize', 'buttonBorderRadius',
            'inputHeight', 'inputPaddingX', 'inputPaddingY', 'inputFontSize', 'inputBorderRadius',
            'cardPadding', 'cardBorderRadius', 'modalBorderRadius', 'modalPadding',
            'tooltipFontSize', 'tooltipPadding', 'tooltipBorderRadius',
            'containerMaxWidth', 'sidebarWidth', 'sidebarCollapsedWidth',
            'gridGutter', 'gridBreakpointXs', 'gridBreakpointSm', 'gridBreakpointMd', 'gridBreakpointLg', 'gridBreakpointXl'];

          if (numberKeys.includes(key)) {
            return `${cssVar}: ${value}px;`;
          } else if (key === 'letterSpacing' || key === 'letterSpacingTight' || key === 'letterSpacingWide') {
            return `${cssVar}: ${value}em;`;
          } else if (key.includes('animationSpeed')) {
            return `${cssVar}: ${value}ms;`;
          } else if (key === 'gradientAngle') {
            return `${cssVar}: ${value}deg;`;
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

// Color utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function checkAccessibility(theme: ThemeConfig): string[] {
  const issues: string[] = [];

  // Check color contrast
  const colorPairs = [
    { bg: theme.backgroundColor, fg: theme.textColor, name: 'Text on Background' },
    { bg: theme.primaryColor, fg: '#FFFFFF', name: 'White on Primary' },
    { bg: theme.surfaceCard, fg: theme.textColor, name: 'Text on Card' },
    { bg: theme.backgroundColor, fg: theme.textSecondaryColor, name: 'Secondary Text on Background' },
    { bg: theme.errorColor, fg: '#FFFFFF', name: 'White on Error' },
    { bg: theme.successColor, fg: '#FFFFFF', name: 'White on Success' }
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

  // Check focus indicators
  if (!theme.focusVisible) {
    issues.push('Focus indicators are disabled, which impacts keyboard navigation');
  }

  // Check touch target sizes
  if (theme.buttonHeight < 44) {
    issues.push('Button height is below 44px, which is the minimum recommended touch target size');
  }

  return issues;
}

export function generateThemeCSS(theme: ThemeConfig): string {
  let css = generateCSSFromTheme(theme);

  // Add component-specific styles
  css += `\n\n/* Component Styles */\n`;

  // Typography
  css += `body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight);
  line-height: var(--line-height);
  letter-spacing: var(--letter-spacing);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font-family);
  font-weight: var(--heading-font-weight);
  color: var(--color-text);
}

h1 { font-size: var(--h1-size); }
h2 { font-size: var(--h2-size); }
h3 { font-size: var(--h3-size); }
h4 { font-size: var(--h4-size); }
h5 { font-size: var(--h5-size); }
h6 { font-size: var(--h6-size); }
`;

  // Buttons
  css += `\n/* Buttons */\n`;
  css += `.btn {
  height: var(--button-height);
  padding: var(--button-padding-y) var(--button-padding-x);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  border-radius: var(--button-border-radius);
  transition: all var(--animation-speed) var(--animation-easing);
}

.btn-primary {
  background: ${theme.enableGradients ? 'var(--gradient-primary)' : 'var(--color-primary)'};
  color: white;
  border: none;
}

.btn-secondary {
  background: ${theme.enableGradients ? 'var(--gradient-secondary)' : 'var(--color-secondary)'};
  color: white;
  border: none;
}
`;

  // Cards
  css += `\n/* Cards */\n`;
  css += `.card {
  padding: var(--card-padding);
  border-radius: var(--card-border-radius);
  background: var(--surface-card);
  border: var(--border-width) var(--border-style) var(--border-color);
}
`;

  // Add shadow utilities
  if (theme.enableShadows) {
    css += `\n/* Shadows */\n`;
    css += `.shadow-sm { box-shadow: var(--shadow-small); }
.shadow-md { box-shadow: var(--shadow-medium); }
.shadow-lg { box-shadow: var(--shadow-large); }
`;
  }

  // Add animation classes
  if (theme.enableAnimations) {
    css += `\n/* Animations */\n`;
    css += `.transition-all {
  transition: all var(--animation-speed) var(--animation-easing);
}

.transition-colors {
  transition: color var(--animation-speed) var(--animation-easing),
              background-color var(--animation-speed) var(--animation-easing),
              border-color var(--animation-speed) var(--animation-easing);
}
`;
  }

  return css;
}
