// src/app/components/theme-creator/services/theme-form.service.ts
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemeConfig } from '../../../models/theme.model';

@Injectable()
export class ThemeFormService {
  constructor(private fb: FormBuilder) {}

  createThemeForm(): FormGroup {
    return this.fb.group({
      // Core colors
      primaryColor: ['#34C5AA'],
      primaryLightColor: ['#5FD3C4'],
      primaryDarkColor: ['#2BA99B'],
      secondaryColor: ['#2BA99B'],
      secondaryLightColor: ['#34C5AA'],
      secondaryDarkColor: ['#238A7F'],
      backgroundColor: ['#F4FDFD'],
      backgroundPaperColor: ['#FFFFFF'],
      backgroundDefaultColor: ['#F8FAFB'],
      textColor: ['#2F4858'],
      textSecondaryColor: ['#6B7280'],
      textDisabledColor: ['#9CA3AF'],
      textHintColor: ['#D1D5DB'],
      accentColor: ['#5FD3C4'],
      accentLightColor: ['#A8E8DD'],
      accentDarkColor: ['#34C5AA'],

      // Semantic colors
      successColor: ['#22C55E'],
      successLightColor: ['#86EFAC'],
      successDarkColor: ['#16A34A'],
      warningColor: ['#F59E0B'],
      warningLightColor: ['#FCD34D'],
      warningDarkColor: ['#D97706'],
      errorColor: ['#EF4444'],
      errorLightColor: ['#FCA5A5'],
      errorDarkColor: ['#DC2626'],
      infoColor: ['#3B82F6'],
      infoLightColor: ['#93BBFE'],
      infoDarkColor: ['#2563EB'],

      // Surface colors
      surfaceCard: ['#FFFFFF'],
      surfaceModal: ['#FFFFFF'],
      surfaceHover: ['rgba(196, 247, 239, 0.3)'],
      surfaceFocus: ['rgba(52, 197, 170, 0.12)'],
      surfaceSelected: ['rgba(52, 197, 170, 0.08)'],
      surfaceDisabled: ['rgba(0, 0, 0, 0.04)'],
      dividerColor: ['rgba(0, 0, 0, 0.08)'],
      overlayColor: ['rgba(0, 0, 0, 0.5)'],

      // Typography - Body
      fontFamily: ['Inter, system-ui, sans-serif'],
      fontSizeBase: [16],
      fontSizeSmall: [14],
      fontSizeMedium: [16],
      fontSizeLarge: [18],
      fontSizeXLarge: [20],
      fontWeight: [400],
      fontWeightLight: [300],
      fontWeightMedium: [500],
      fontWeightBold: [700],
      lineHeight: [1.5],
      lineHeightTight: [1.25],
      lineHeightRelaxed: [1.75],
      letterSpacing: [0],
      letterSpacingTight: [-0.025],
      letterSpacingWide: [0.025],

      // Typography - Headings
      headingFontFamily: ['Poppins, sans-serif'],
      headingFontWeight: [600],
      h1Size: [40],
      h2Size: [32],
      h3Size: [28],
      h4Size: [24],
      h5Size: [20],
      h6Size: [18],

      // Spacing & Layout
      spacingUnit: [16],
      spacingXSmall: [4],
      spacingSmall: [8],
      spacingMedium: [16],
      spacingLarge: [24],
      spacingXLarge: [32],
      containerMaxWidth: [1400],
      sidebarWidth: [280],
      sidebarCollapsedWidth: [64],

      // Borders
      borderRadius: [12],
      borderRadiusSmall: [8],
      borderRadiusMedium: [12],
      borderRadiusLarge: [16],
      borderRadiusCircle: [9999],
      borderWidth: [1],
      borderStyle: ['solid'],
      borderColor: ['rgba(0, 0, 0, 0.08)'],
      borderFocusColor: ['#34C5AA'],
      borderHoverColor: ['rgba(52, 197, 170, 0.3)'],

      // Shadows & Effects
      shadowIntensity: [0.1],
      shadowColor: ['rgba(0, 0, 0, 0.1)'],
      shadowSmall: ['0 1px 3px rgba(0, 0, 0, 0.06)'],
      shadowMedium: ['0 4px 6px rgba(0, 0, 0, 0.08)'],
      shadowLarge: ['0 10px 15px rgba(0, 0, 0, 0.1)'],
      shadowInset: ['inset 0 2px 4px rgba(0, 0, 0, 0.05)'],
      blurIntensity: [10],
      blurSmall: [4],
      blurMedium: [10],
      blurLarge: [20],

      // Animation
      animationSpeed: [300],
      animationSpeedSlow: [500],
      animationSpeedFast: [150],
      animationEasing: ['cubic-bezier(0.4, 0, 0.2, 1)'],
      animationEasingIn: ['cubic-bezier(0.4, 0, 1, 1)'],
      animationEasingOut: ['cubic-bezier(0, 0, 0.2, 1)'],
      animationEasingInOut: ['cubic-bezier(0.4, 0, 0.2, 1)'],

      // Component Specific
      buttonHeight: [40],
      buttonPaddingX: [24],
      buttonPaddingY: [12],
      buttonFontSize: [14],
      buttonFontWeight: [600],
      buttonBorderRadius: [10],
      inputHeight: [44],
      inputPaddingX: [16],
      inputPaddingY: [12],
      inputFontSize: [16],
      inputBorderRadius: [10],
      cardPadding: [24],
      cardBorderRadius: [16],
      cardElevation: [1],
      modalBorderRadius: [20],
      modalPadding: [32],
      tooltipFontSize: [12],
      tooltipPadding: [8],
      tooltipBorderRadius: [6],

      // Advanced Features
      designStyle: ['modern'],
      navigationStyle: ['elevated'],
      cardStyle: ['elevated'],
      buttonStyle: ['primary'],
      iconStyle: ['outlined'],
      density: ['comfortable'],

      // Gradients
      enableGradients: [true],
      primaryGradient: ['linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)'],
      secondaryGradient: ['linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)'],
      accentGradient: ['linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)'],
      backgroundGradient: ['linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)'],
      gradientAngle: [135],

      // Brand
      brandName: ['PraXelo Enterprise'],
      brandSlogan: ['Enterprise Low-Code Platform'],
      brandFont: ['Poppins, sans-serif'],
      logoUrl: ['assets/logo.svg'],
      faviconUrl: ['assets/favicon.ico'],

      // Mode
      mode: ['light'],
      colorScheme: ['ocean-mint'],

      // Performance
      enableAnimations: [true],
      enableTransitions: [true],
      enableBlur: [true],
      enableShadows: [true],
      enableHoverEffects: [true],
      enableFocusEffects: [true],
      enableRipple: [true],

      // Accessibility
      reducedMotion: [false],
      highContrast: [false],
      focusVisible: [true],
      keyboardNavigation: [true],
      screenReaderFriendly: [true],
      textScaling: [1],

      // Layout Settings
      layoutType: ['fluid'],
      headerPosition: ['sticky'],
      sidebarPosition: ['left'],
      footerPosition: ['static'],

      // Z-Index Layers
      zIndexDropdown: [1000],
      zIndexModal: [1300],
      zIndexPopover: [1200],
      zIndexTooltip: [1400],
      zIndexHeader: [1100],
      zIndexDrawer: [1200],
      zIndexOverlay: [1250],

      // Grid System
      gridColumns: [12],
      gridGutter: [24],
      gridBreakpointXs: [0],
      gridBreakpointSm: [576],
      gridBreakpointMd: [768],
      gridBreakpointLg: [1024],
      gridBreakpointXl: [1280]
    });
  }

  updateFormValues(form: FormGroup, theme: Partial<ThemeConfig>): void {
    form.patchValue(theme, { emitEvent: false });
  }
}
