// src/app/components/theme-creator/models/theme-creator.types.ts

// UI State interfaces
export interface ThemeCreatorUIState {
  selectedTabIndex: number;
  isPreviewExpanded: boolean;
  isSaving: boolean;
  showAdvancedSettings: boolean;
}

// Preview-related types
export interface PreviewElementConfig {
  root: HTMLElement;
  cssPrefix: string;
  performanceSettings: PerformanceSettings;
  accessibilitySettings: AccessibilitySettings;
}

export interface PerformanceSettings {
  enableAnimations: boolean;
  enableShadows: boolean;
  enableBlur: boolean;
  enableTransitions: boolean;
  enableHoverEffects: boolean;
  enableFocusEffects: boolean;
  enableRipple: boolean;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
  screenReaderFriendly: boolean;
  textScaling: number;
}

// Theme application result
export interface ThemeApplicationResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
}

// Import/Export types
export interface ThemeImportOptions {
  validate?: boolean;
  merge?: boolean;
  preserveBrand?: boolean;
}

export interface ThemeExportOptions {
  includeMetadata?: boolean;
  minify?: boolean;
  format?: 'json' | 'css' | 'scss';
}

// Event types for theme changes
export interface ThemeChangeEvent {
  property: string;
  oldValue: any;
  newValue: any;
  source: 'form' | 'preset' | 'import' | 'manual';
}

// Validation types
export interface ThemeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  property: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  property: string;
  message: string;
  suggestion?: string;
}

// Tab configuration
export interface ThemeTabConfig {
  label: string;
  icon: string;
  component: any;
  disabled?: boolean;
}

// Common component props
export interface ThemeControlProps {
  theme: any; // Using any to avoid circular dependency with ThemeConfig
  themeChange: (changes: Partial<any>) => void;
  disabled?: boolean;
  showAdvanced?: boolean;
}
