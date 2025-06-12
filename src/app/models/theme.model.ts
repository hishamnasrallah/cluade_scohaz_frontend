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
  buttonStyle: 'primary' | 'rounded' | 'square' | 'outlined';

  // Brand
  logoUrl?: string;
  brandName: string;

  // Mode
  mode: 'light' | 'dark' | 'auto';

  // Performance
  enableAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  focusOutlineWidth: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  config: Partial<ThemeConfig>;
}
