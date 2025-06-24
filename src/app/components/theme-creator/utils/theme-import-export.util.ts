// src/app/components/theme-creator/utils/theme-import-export.util.ts
import { ThemeConfig } from '../../../models/theme.model';

export type ExportFormat = 'json' | 'css' | 'scss' | 'both';

export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
  minify?: boolean;
  cssPrefix?: string;
}

export class ThemeImportExportUtil {
  private static readonly CSS_PREFIX = '--theme';

  /**
   * Export theme in the specified format(s)
   */
  static exportTheme(theme: ThemeConfig, options: ExportOptions = { format: 'json' }): void {
    const brandName = theme.brandName || 'theme';
    const sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
    const timestamp = Date.now();

    switch (options.format) {
      case 'json':
        this.exportAsJSON(theme, sanitizedBrandName, timestamp);
        break;
      case 'css':
        this.exportAsCSS(theme, sanitizedBrandName, timestamp, options);
        break;
      case 'scss':
        this.exportAsSCSS(theme, sanitizedBrandName, timestamp, options);
        break;
      case 'both':
        this.exportAsJSON(theme, sanitizedBrandName, timestamp);
        this.exportAsCSS(theme, sanitizedBrandName, timestamp, options);
        break;
    }
  }

  /**
   * Export theme as JSON file
   */
  private static exportAsJSON(theme: ThemeConfig, brandName: string, timestamp: number): void {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${brandName}-${timestamp}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export theme as CSS file with CSS custom properties
   */
  private static exportAsCSS(theme: ThemeConfig, brandName: string, timestamp: number, options: ExportOptions): void {
    const cssContent = this.generateCSSContent(theme, options);
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${brandName}-${timestamp}.css`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export theme as SCSS file with SCSS variables
   */
  private static exportAsSCSS(theme: ThemeConfig, brandName: string, timestamp: number, options: ExportOptions): void {
    const scssContent = this.generateSCSSContent(theme, options);
    const blob = new Blob([scssContent], { type: 'text/scss' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${brandName}-${timestamp}.scss`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate CSS content from theme
   */
  private static generateCSSContent(theme: ThemeConfig, options: ExportOptions): string {
    const prefix = options.cssPrefix || this.CSS_PREFIX;
    const includeComments = options.includeComments !== false;
    const minify = options.minify === true;

    const lines: string[] = [];
    const newline = minify ? '' : '\n';
    const space = minify ? '' : ' ';
    const indent = minify ? '' : '  ';

    // Header comment
    if (includeComments && !minify) {
      lines.push(`/**`);
      lines.push(` * Theme: ${theme.brandName || 'Custom Theme'}`);
      lines.push(` * Generated: ${new Date().toISOString()}`);
      lines.push(` * Mode: ${theme.mode || 'light'}`);
      lines.push(` */`);
      lines.push('');
    }

    // Root selector
    lines.push(`:root {${newline}`);

    // Colors Section
    if (includeComments && !minify) {
      lines.push(`${indent}/* Core Colors */`);
    }
    lines.push(`${indent}${prefix}-primary:${space}${theme.primaryColor};`);
    lines.push(`${indent}${prefix}-primary-light:${space}${theme.primaryLightColor || '#5FD3C4'};`);
    lines.push(`${indent}${prefix}-primary-dark:${space}${theme.primaryDarkColor || '#2BA99B'};`);
    lines.push(`${indent}${prefix}-secondary:${space}${theme.secondaryColor};`);
    lines.push(`${indent}${prefix}-secondary-light:${space}${theme.secondaryLightColor || '#34C5AA'};`);
    lines.push(`${indent}${prefix}-secondary-dark:${space}${theme.secondaryDarkColor || '#238A7F'};`);
    lines.push(`${indent}${prefix}-background:${space}${theme.backgroundColor};`);
    lines.push(`${indent}${prefix}-background-paper:${space}${theme.backgroundPaperColor || '#FFFFFF'};`);
    lines.push(`${indent}${prefix}-background-default:${space}${theme.backgroundDefaultColor || '#F8FAFB'};`);
    lines.push(`${indent}${prefix}-text:${space}${theme.textColor};`);
    lines.push(`${indent}${prefix}-text-secondary:${space}${theme.textSecondaryColor || '#6B7280'};`);
    lines.push(`${indent}${prefix}-text-disabled:${space}${theme.textDisabledColor || '#9CA3AF'};`);
    lines.push(`${indent}${prefix}-text-hint:${space}${theme.textHintColor || '#D1D5DB'};`);
    lines.push(`${indent}${prefix}-accent:${space}${theme.accentColor};`);
    lines.push(`${indent}${prefix}-accent-light:${space}${theme.accentLightColor || '#A8E8DD'};`);
    lines.push(`${indent}${prefix}-accent-dark:${space}${theme.accentDarkColor || '#34C5AA'};`);

    if (!minify) lines.push('');

    // Semantic Colors
    if (includeComments && !minify) {
      lines.push(`${indent}/* Semantic Colors */`);
    }
    lines.push(`${indent}${prefix}-success:${space}${theme.successColor};`);
    lines.push(`${indent}${prefix}-success-light:${space}${theme.successLightColor || '#86EFAC'};`);
    lines.push(`${indent}${prefix}-success-dark:${space}${theme.successDarkColor || '#16A34A'};`);
    lines.push(`${indent}${prefix}-warning:${space}${theme.warningColor};`);
    lines.push(`${indent}${prefix}-warning-light:${space}${theme.warningLightColor || '#FCD34D'};`);
    lines.push(`${indent}${prefix}-warning-dark:${space}${theme.warningDarkColor || '#D97706'};`);
    lines.push(`${indent}${prefix}-error:${space}${theme.errorColor};`);
    lines.push(`${indent}${prefix}-error-light:${space}${theme.errorLightColor || '#FCA5A5'};`);
    lines.push(`${indent}${prefix}-error-dark:${space}${theme.errorDarkColor || '#DC2626'};`);
    lines.push(`${indent}${prefix}-info:${space}${theme.infoColor};`);
    lines.push(`${indent}${prefix}-info-light:${space}${theme.infoLightColor || '#93BBFE'};`);
    lines.push(`${indent}${prefix}-info-dark:${space}${theme.infoDarkColor || '#2563EB'};`);

    if (!minify) lines.push('');

    // Surface Colors
    if (includeComments && !minify) {
      lines.push(`${indent}/* Surface Colors */`);
    }
    lines.push(`${indent}${prefix}-surface-card:${space}${theme.surfaceCard || '#FFFFFF'};`);
    lines.push(`${indent}${prefix}-surface-modal:${space}${theme.surfaceModal || '#FFFFFF'};`);
    lines.push(`${indent}${prefix}-surface-hover:${space}${theme.surfaceHover || 'rgba(196, 247, 239, 0.3)'};`);
    lines.push(`${indent}${prefix}-surface-focus:${space}${theme.surfaceFocus || 'rgba(52, 197, 170, 0.12)'};`);
    lines.push(`${indent}${prefix}-surface-selected:${space}${theme.surfaceSelected || 'rgba(52, 197, 170, 0.08)'};`);
    lines.push(`${indent}${prefix}-surface-disabled:${space}${theme.surfaceDisabled || 'rgba(0, 0, 0, 0.04)'};`);
    lines.push(`${indent}${prefix}-divider:${space}${theme.dividerColor || 'rgba(0, 0, 0, 0.08)'};`);
    lines.push(`${indent}${prefix}-overlay:${space}${theme.overlayColor || 'rgba(0, 0, 0, 0.5)'};`);

    if (!minify) lines.push('');

    // Typography
    if (includeComments && !minify) {
      lines.push(`${indent}/* Typography */`);
    }
    lines.push(`${indent}${prefix}-font-family:${space}${theme.fontFamily};`);
    lines.push(`${indent}${prefix}-font-size:${space}${theme.fontSizeBase}px;`);
    lines.push(`${indent}${prefix}-font-size-base:${space}${theme.fontSizeBase}px;`);
    lines.push(`${indent}${prefix}-font-size-small:${space}${theme.fontSizeSmall || 14}px;`);
    lines.push(`${indent}${prefix}-font-size-medium:${space}${theme.fontSizeMedium || 16}px;`);
    lines.push(`${indent}${prefix}-font-size-large:${space}${theme.fontSizeLarge || 18}px;`);
    lines.push(`${indent}${prefix}-font-size-xlarge:${space}${theme.fontSizeXLarge || 20}px;`);
    lines.push(`${indent}${prefix}-font-weight:${space}${theme.fontWeight || 400};`);
    lines.push(`${indent}${prefix}-font-weight-light:${space}${theme.fontWeightLight || 300};`);
    lines.push(`${indent}${prefix}-font-weight-medium:${space}${theme.fontWeightMedium || 500};`);
    lines.push(`${indent}${prefix}-font-weight-bold:${space}${theme.fontWeightBold || 700};`);
    lines.push(`${indent}${prefix}-line-height:${space}${theme.lineHeight || 1.5};`);
    lines.push(`${indent}${prefix}-line-height-tight:${space}${theme.lineHeightTight || 1.25};`);
    lines.push(`${indent}${prefix}-line-height-relaxed:${space}${theme.lineHeightRelaxed || 1.75};`);
    lines.push(`${indent}${prefix}-letter-spacing:${space}${theme.letterSpacing || 0}em;`);
    lines.push(`${indent}${prefix}-letter-spacing-tight:${space}${theme.letterSpacingTight || -0.025}em;`);
    lines.push(`${indent}${prefix}-letter-spacing-wide:${space}${theme.letterSpacingWide || 0.025}em;`);

    // Heading Typography
    lines.push(`${indent}${prefix}-heading-font:${space}${theme.headingFontFamily};`);
    lines.push(`${indent}${prefix}-heading-font-family:${space}${theme.headingFontFamily};`);
    lines.push(`${indent}${prefix}-heading-weight:${space}${theme.headingFontWeight || 700};`);
    lines.push(`${indent}${prefix}-heading-font-weight:${space}${theme.headingFontWeight || 700};`);
    lines.push(`${indent}${prefix}-h1-size:${space}${theme.h1Size || 40}px;`);
    lines.push(`${indent}${prefix}-h2-size:${space}${theme.h2Size || 32}px;`);
    lines.push(`${indent}${prefix}-h3-size:${space}${theme.h3Size || 28}px;`);
    lines.push(`${indent}${prefix}-h4-size:${space}${theme.h4Size || 24}px;`);
    lines.push(`${indent}${prefix}-h5-size:${space}${theme.h5Size || 20}px;`);
    lines.push(`${indent}${prefix}-h6-size:${space}${theme.h6Size || 18}px;`);
    lines.push(`${indent}${prefix}-text-scale:${space}${theme.textScaling || 1};`);
    lines.push(`${indent}${prefix}-text-scaling:${space}${theme.textScaling || 1};`);

    if (!minify) lines.push('');

    // Spacing
    if (includeComments && !minify) {
      lines.push(`${indent}/* Spacing & Layout */`);
    }
    lines.push(`${indent}${prefix}-spacing:${space}${theme.spacingUnit}px;`);
    lines.push(`${indent}${prefix}-spacing-unit:${space}${theme.spacingUnit}px;`);
    lines.push(`${indent}${prefix}-spacing-xsmall:${space}${theme.spacingXSmall || 4}px;`);
    lines.push(`${indent}${prefix}-spacing-small:${space}${theme.spacingSmall || 8}px;`);
    lines.push(`${indent}${prefix}-spacing-medium:${space}${theme.spacingMedium || 16}px;`);
    lines.push(`${indent}${prefix}-spacing-large:${space}${theme.spacingLarge || 24}px;`);
    lines.push(`${indent}${prefix}-spacing-xlarge:${space}${theme.spacingXLarge || 32}px;`);
    lines.push(`${indent}${prefix}-container-max:${space}${theme.containerMaxWidth || 1200}px;`);
    lines.push(`${indent}${prefix}-sidebar-width:${space}${theme.sidebarWidth || 240}px;`);
    lines.push(`${indent}${prefix}-sidebar-collapsed:${space}${theme.sidebarCollapsedWidth || 64}px;`);

    if (!minify) lines.push('');

    // Borders
    if (includeComments && !minify) {
      lines.push(`${indent}/* Borders */`);
    }
    lines.push(`${indent}${prefix}-radius:${space}${theme.borderRadius}px;`);
    lines.push(`${indent}${prefix}-border-radius:${space}${theme.borderRadius}px;`);
    lines.push(`${indent}${prefix}-radius-small:${space}${theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}${prefix}-border-radius-small:${space}${theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}${prefix}-radius-medium:${space}${theme.borderRadiusMedium || 12}px;`);
    lines.push(`${indent}${prefix}-border-radius-medium:${space}${theme.borderRadiusMedium || 12}px;`);
    lines.push(`${indent}${prefix}-radius-large:${space}${theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}${prefix}-border-radius-large:${space}${theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}${prefix}-radius-circle:${space}${theme.borderRadiusCircle || 9999}px;`);
    lines.push(`${indent}${prefix}-border-radius-circle:${space}${theme.borderRadiusCircle || 9999}px;`);
    lines.push(`${indent}${prefix}-border-width:${space}${theme.borderWidth}px;`);
    lines.push(`${indent}${prefix}-border-style:${space}${theme.borderStyle || 'solid'};`);
    lines.push(`${indent}${prefix}-border-color:${space}${theme.borderColor};`);
    lines.push(`${indent}${prefix}-border-focus:${space}${theme.borderFocusColor};`);
    lines.push(`${indent}${prefix}-border-hover:${space}${theme.borderHoverColor};`);

    // Add this after the Borders section in generateSCSSContent

    if (!minify) lines.push('');

// Design & Style Properties
    lines.push(`// Design & Style Properties`);
    lines.push(`$density:${space}'${theme.density || 'comfortable'}';`);
    lines.push(`$design-style:${space}'${theme.designStyle || 'modern'}';`);
    lines.push(`$navigation-style:${space}'${theme.navigationStyle || 'elevated'}';`);
    lines.push(`$card-style:${space}'${theme.cardStyle || 'elevated'}';`);
    lines.push(`$button-style:${space}'${theme.buttonStyle || 'primary'}';`);
    lines.push(`$icon-style:${space}'${theme.iconStyle || 'outlined'}';`);
    lines.push(`$layout-type:${space}'${theme.layoutType || 'fluid'}';`);
    lines.push(`$header-position:${space}'${theme.headerPosition || 'sticky'}';`);
    lines.push(`$sidebar-position:${space}'${theme.sidebarPosition || 'left'}';`);

    if (!minify) lines.push('');

// Brand Properties
    lines.push(`// Brand Properties`);
    const escapedBrandNameScss = (theme.brandName || 'Brand').replace(/'/g, "\\'");
    const escapedBrandSloganScss = (theme.brandSlogan || '').replace(/'/g, "\\'");
    lines.push(`$brand-name:${space}'${escapedBrandNameScss}';`);
    lines.push(`$brand-slogan:${space}'${escapedBrandSloganScss}';`);
    lines.push(`$brand-font:${space}${theme.brandFont || theme.headingFontFamily};`);
    if (theme.logoUrl) {
      lines.push(`$logo-url:${space}'${theme.logoUrl}';`);
    }
    if (theme.faviconUrl) {
      lines.push(`$favicon-url:${space}'${theme.faviconUrl}';`);
    }

    if (!minify) lines.push('');

// Feature Flags
    lines.push(`// Feature Flags`);
    lines.push(`$enable-animations:${space}${theme.enableAnimations !== false};`);
    lines.push(`$enable-transitions:${space}${theme.enableTransitions !== false};`);
    lines.push(`$enable-shadows:${space}${theme.enableShadows !== false};`);
    lines.push(`$enable-blur:${space}${theme.enableBlur !== false};`);
    lines.push(`$enable-hover-effects:${space}${theme.enableHoverEffects !== false};`);
    lines.push(`$enable-focus-effects:${space}${theme.enableFocusEffects !== false};`);
    lines.push(`$enable-ripple:${space}${theme.enableRipple !== false};`);
    lines.push(`$enable-gradients:${space}${theme.enableGradients || false};`);
    lines.push(`$reduced-motion:${space}${theme.reducedMotion || false};`);
    lines.push(`$high-contrast:${space}${theme.highContrast || false};`);
    lines.push(`$focus-visible:${space}${theme.focusVisible !== false};`);

// Maps for easier iteration
    if (!minify) {
      lines.push('');
      lines.push(`// Style Maps`);
      lines.push(`$styles: (`);
      lines.push(`  density: $density,`);
      lines.push(`  design: $design-style,`);
      lines.push(`  navigation: $navigation-style,`);
      lines.push(`  card: $card-style,`);
      lines.push(`  button: $button-style,`);
      lines.push(`  icon: $icon-style,`);
      lines.push(`  layout: $layout-type`);
      lines.push(`);`);
    }

    if (!minify) lines.push('');

    // Effects
    if (includeComments && !minify) {
      lines.push(`${indent}/* Effects */`);
    }
    lines.push(`${indent}${prefix}-shadow-intensity:${space}${theme.shadowIntensity || 0.12};`);
    lines.push(`${indent}${prefix}-shadow-color:${space}${theme.shadowColor || 'rgba(0, 0, 0, 0.1)'};`);
    lines.push(`${indent}${prefix}-shadow-small:${space}${theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)'};`);
    lines.push(`${indent}${prefix}-shadow-medium:${space}${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};`);
    lines.push(`${indent}${prefix}-shadow-large:${space}${theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)'};`);
    lines.push(`${indent}${prefix}-shadow-inset:${space}${theme.shadowInset || 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'};`);
    lines.push(`${indent}${prefix}-blur:${space}${theme.blurIntensity || 8}px;`);
    lines.push(`${indent}${prefix}-blur-intensity:${space}${theme.blurIntensity || 8}px;`);
    lines.push(`${indent}${prefix}-blur-small:${space}${theme.blurSmall || 4}px;`);
    lines.push(`${indent}${prefix}-blur-medium:${space}${theme.blurMedium || 10}px;`);
    lines.push(`${indent}${prefix}-blur-large:${space}${theme.blurLarge || 20}px;`);

    if (!minify) lines.push('');

    // Animation
    if (includeComments && !minify) {
      lines.push(`${indent}/* Animation */`);
    }
    lines.push(`${indent}${prefix}-duration:${space}${theme.animationSpeed || 300}ms;`);
    lines.push(`${indent}${prefix}-duration-slow:${space}${theme.animationSpeedSlow || 500}ms;`);
    lines.push(`${indent}${prefix}-duration-fast:${space}${theme.animationSpeedFast || 150}ms;`);
    lines.push(`${indent}${prefix}-duration-normal:${space}${theme.animationSpeed || 300}ms;`);
    lines.push(`${indent}${prefix}-easing:${space}${theme.animationEasing || 'ease-out'};`);
    lines.push(`${indent}${prefix}-timing:${space}${theme.animationEasing || 'ease-out'};`);
    lines.push(`${indent}${prefix}-easing-in:${space}${theme.animationEasingIn || 'ease-in'};`);
    lines.push(`${indent}${prefix}-timing-in:${space}${theme.animationEasingIn || 'ease-in'};`);
    lines.push(`${indent}${prefix}-easing-out:${space}${theme.animationEasingOut || 'ease-out'};`);
    lines.push(`${indent}${prefix}-timing-out:${space}${theme.animationEasingOut || 'ease-out'};`);
    lines.push(`${indent}${prefix}-easing-in-out:${space}${theme.animationEasingInOut || 'ease-in-out'};`);
    lines.push(`${indent}${prefix}-timing-in-out:${space}${theme.animationEasingInOut || 'ease-in-out'};`);

    if (!minify) lines.push('');

    // Components
    if (includeComments && !minify) {
      lines.push(`${indent}/* Component Specific */`);
    }
    // Buttons
    lines.push(`${indent}${prefix}-button-height:${space}${theme.buttonHeight || 40}px;`);
    lines.push(`${indent}${prefix}-button-padding-x:${space}${theme.buttonPaddingX || 24}px;`);
    lines.push(`${indent}${prefix}-button-padding-y:${space}${theme.buttonPaddingY || 12}px;`);
    lines.push(`${indent}${prefix}-button-font-size:${space}${theme.buttonFontSize || 14}px;`);
    lines.push(`${indent}${prefix}-button-font-weight:${space}${theme.buttonFontWeight || 600};`);
    lines.push(`${indent}${prefix}-button-radius:${space}${theme.buttonBorderRadius || theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}${prefix}-button-border-radius:${space}${theme.buttonBorderRadius || theme.borderRadiusSmall || 8}px;`);

    // Inputs
    lines.push(`${indent}${prefix}-input-height:${space}${theme.inputHeight || 44}px;`);
    lines.push(`${indent}${prefix}-input-padding-x:${space}${theme.inputPaddingX || 16}px;`);
    lines.push(`${indent}${prefix}-input-padding-y:${space}${theme.inputPaddingY || 12}px;`);
    lines.push(`${indent}${prefix}-input-font-size:${space}${theme.inputFontSize || 16}px;`);
    lines.push(`${indent}${prefix}-input-radius:${space}${theme.inputBorderRadius || theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}${prefix}-input-border-radius:${space}${theme.inputBorderRadius || theme.borderRadiusSmall || 8}px;`);

    // Cards
    lines.push(`${indent}${prefix}-card-padding:${space}${theme.cardPadding || 24}px;`);
    lines.push(`${indent}${prefix}-card-radius:${space}${theme.cardBorderRadius || theme.borderRadius || 12}px;`);
    lines.push(`${indent}${prefix}-card-border-radius:${space}${theme.cardBorderRadius || theme.borderRadius || 12}px;`);
    lines.push(`${indent}${prefix}-card-elevation:${space}${theme.cardElevation || 1};`);

    // Modals
    lines.push(`${indent}${prefix}-modal-radius:${space}${theme.modalBorderRadius || theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}${prefix}-modal-border-radius:${space}${theme.modalBorderRadius || theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}${prefix}-modal-padding:${space}${theme.modalPadding || 32}px;`);

    // Tooltips
    lines.push(`${indent}${prefix}-tooltip-font-size:${space}${theme.tooltipFontSize || 12}px;`);
    lines.push(`${indent}${prefix}-tooltip-padding:${space}${theme.tooltipPadding || 8}px;`);
    lines.push(`${indent}${prefix}-tooltip-radius:${space}${theme.tooltipBorderRadius || 4}px;`);
    lines.push(`${indent}${prefix}-tooltip-border-radius:${space}${theme.tooltipBorderRadius || 4}px;`);

    if (!minify) lines.push('');

    // Gradients
    if (theme.enableGradients) {
      if (includeComments && !minify) {
        lines.push(`${indent}/* Gradients */`);
      }
      lines.push(`${indent}${prefix}-gradient-primary:${space}${theme.primaryGradient || 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)'};`);
      lines.push(`${indent}${prefix}-primary-gradient:${space}${theme.primaryGradient || 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)'};`);
      lines.push(`${indent}${prefix}-gradient-secondary:${space}${theme.secondaryGradient || 'linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)'};`);
      lines.push(`${indent}${prefix}-secondary-gradient:${space}${theme.secondaryGradient || 'linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)'};`);
      lines.push(`${indent}${prefix}-gradient-accent:${space}${theme.accentGradient || 'linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)'};`);
      lines.push(`${indent}${prefix}-accent-gradient:${space}${theme.accentGradient || 'linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)'};`);
      lines.push(`${indent}${prefix}-gradient-background:${space}${theme.backgroundGradient || 'linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)'};`);
      lines.push(`${indent}${prefix}-background-gradient:${space}${theme.backgroundGradient || 'linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)'};`);
      lines.push(`${indent}${prefix}-gradient-angle:${space}${theme.gradientAngle || 135}deg;`);
      if (!minify) lines.push('');
    }

    // Z-Index
    if (includeComments && !minify) {
      lines.push(`${indent}/* Z-Index Layers */`);
    }
    lines.push(`${indent}${prefix}-z-dropdown:${space}${theme.zIndexDropdown || 1000};`);
    lines.push(`${indent}${prefix}-z-modal:${space}${theme.zIndexModal || 1050};`);
    lines.push(`${indent}${prefix}-z-popover:${space}${theme.zIndexPopover || 1060};`);
    lines.push(`${indent}${prefix}-z-tooltip:${space}${theme.zIndexTooltip || 1070};`);
    lines.push(`${indent}${prefix}-z-header:${space}${theme.zIndexHeader || 1030};`);
    lines.push(`${indent}${prefix}-z-drawer:${space}${theme.zIndexDrawer || 1040};`);
    lines.push(`${indent}${prefix}-z-overlay:${space}${theme.zIndexOverlay || 1020};`);

    if (!minify) lines.push('');

    // Grid System
    if (includeComments && !minify) {
      lines.push(`${indent}/* Grid System */`);
    }
    lines.push(`${indent}${prefix}-grid-columns:${space}${theme.gridColumns || 12};`);
    lines.push(`${indent}${prefix}-grid-gutter:${space}${theme.gridGutter || 24}px;`);

    // Close root
    lines.push(`}`);

    // Add this after the Grid System section, before closing the :root selector

    if (!minify) lines.push('');

// Design & Style Properties
    if (includeComments && !minify) {
      lines.push(`${indent}/* Design & Style Properties */`);
    }
    lines.push(`${indent}${prefix}-density:${space}'${theme.density || 'comfortable'}';`);
    lines.push(`${indent}${prefix}-design-style:${space}'${theme.designStyle || 'modern'}';`);
    lines.push(`${indent}${prefix}-navigation-style:${space}'${theme.navigationStyle || 'elevated'}';`);
    lines.push(`${indent}${prefix}-card-style:${space}'${theme.cardStyle || 'elevated'}';`);
    lines.push(`${indent}${prefix}-button-style:${space}'${theme.buttonStyle || 'primary'}';`);
    lines.push(`${indent}${prefix}-icon-style:${space}'${theme.iconStyle || 'outlined'}';`);
    lines.push(`${indent}${prefix}-layout-type:${space}'${theme.layoutType || 'fluid'}';`);
    lines.push(`${indent}${prefix}-header-position:${space}'${theme.headerPosition || 'sticky'}';`);
    lines.push(`${indent}${prefix}-sidebar-position:${space}'${theme.sidebarPosition || 'left'}';`);

    if (!minify) lines.push('');

// Brand Properties
    if (includeComments && !minify) {
      lines.push(`${indent}/* Brand Properties */`);
    }
// Escape quotes in brand name and slogan for CSS
    const escapedBrandName = (theme.brandName || 'Brand').replace(/'/g, "\\'");
    const escapedBrandSlogan = (theme.brandSlogan || '').replace(/'/g, "\\'");
    lines.push(`${indent}${prefix}-brand-name:${space}'${escapedBrandName}';`);
    lines.push(`${indent}${prefix}-brand-slogan:${space}'${escapedBrandSlogan}';`);
    lines.push(`${indent}${prefix}-brand-font:${space}${theme.brandFont || theme.headingFontFamily};`);
// Only add URLs if they exist
    if (theme.logoUrl) {
      lines.push(`${indent}${prefix}-logo-url:${space}url('${theme.logoUrl}');`);
    }
    if (theme.faviconUrl) {
      lines.push(`${indent}${prefix}-favicon-url:${space}url('${theme.faviconUrl}');`);
    }

    if (!minify) lines.push('');

// Performance & Accessibility Flags as CSS custom properties
    if (includeComments && !minify) {
      lines.push(`${indent}/* Feature Flags */`);
    }
    lines.push(`${indent}${prefix}-enable-animations:${space}${theme.enableAnimations ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-transitions:${space}${theme.enableTransitions ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-shadows:${space}${theme.enableShadows ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-blur:${space}${theme.enableBlur ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-hover-effects:${space}${theme.enableHoverEffects ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-focus-effects:${space}${theme.enableFocusEffects ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-ripple:${space}${theme.enableRipple ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-enable-gradients:${space}${theme.enableGradients ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-reduced-motion:${space}${theme.reducedMotion ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-high-contrast:${space}${theme.highContrast ? '1' : '0'};`);
    lines.push(`${indent}${prefix}-focus-visible:${space}${theme.focusVisible ? '1' : '0'};`);

    // Additional helper classes
    if (!minify) {
      lines.push('');
      lines.push(`/* Helper Classes */`);

      // Dark mode
      lines.push(`[data-theme-mode="dark"] {`);
      lines.push(`${indent}${prefix}-background: #0F172A;`);
      lines.push(`${indent}${prefix}-text: #F8FAFC;`);
      lines.push(`${indent}${prefix}-surface-card: #1E293B;`);
      lines.push(`${indent}${prefix}-surface-modal: #1E293B;`);
      lines.push(`}`);
      lines.push('');

      // Design styles
      lines.push(`/* Design Style Classes */`);
      lines.push(`.style-minimal { --radius-override: 0; }`);
      lines.push(`.style-glassmorphic { --blur-override: 20px; }`);
      lines.push(`.style-neumorphic { --shadow-override: inset; }`);
      lines.push('');

      // Performance classes
      lines.push(`/* Performance Classes */`);
      lines.push(`.no-animations * { transition: none !important; animation: none !important; }`);
      lines.push(`.no-shadows * { box-shadow: none !important; }`);
      lines.push(`.no-blur * { backdrop-filter: none !important; }`);
      lines.push(`.motion-reduce * { animation-duration: 0.01ms !important; }`);
      lines.push('');

      // Accessibility classes
      lines.push(`/* Accessibility Classes */`);
      lines.push(`.high-contrast { filter: contrast(1.2); }`);
      lines.push(`.focus-visible *:focus { outline: 2px solid var(${prefix}-primary); }`);

      // Update the Additional helper classes section to include:

// Density classes
      lines.push(`/* Density Classes */`);
      lines.push(`[data-density="compact"] { --spacing-multiplier: 0.8; }`);
      lines.push(`[data-density="comfortable"] { --spacing-multiplier: 1; }`);
      lines.push(`[data-density="spacious"] { --spacing-multiplier: 1.2; }`);
      lines.push('');

// Design style classes
      lines.push(`/* Design Style Classes */`);
      lines.push(`[data-theme-style="modern"] { /* Modern style */ }`);
      lines.push(`[data-theme-style="minimal"] { --radius-override: 0; --shadow-override: none; }`);
      lines.push(`[data-theme-style="glassmorphic"] { --blur-override: 20px; --glass-opacity: 0.7; }`);
      lines.push(`[data-theme-style="neumorphic"] { --shadow-style: inset; }`);
      lines.push(`[data-theme-style="material"] { /* Material design */ }`);
      lines.push(`[data-theme-style="flat"] { --shadow-override: none; }`);
      lines.push(`[data-theme-style="gradient"] { --use-gradients: 1; }`);
      lines.push('');

// Component style classes
      lines.push(`/* Component Style Classes */`);
      lines.push(`[data-navigation-style="elevated"] { --nav-shadow: 0 2px 8px rgba(0,0,0,0.1); }`);
      lines.push(`[data-navigation-style="flat"] { --nav-shadow: none; }`);
      lines.push(`[data-navigation-style="bordered"] { --nav-border: 1px solid var(${prefix}-border-color); }`);
      lines.push(`[data-card-style="elevated"] { --card-shadow: 0 4px 6px rgba(0,0,0,0.1); }`);
      lines.push(`[data-card-style="flat"] { --card-shadow: none; }`);
      lines.push(`[data-card-style="bordered"] { --card-border: 1px solid var(${prefix}-border-color); }`);
      lines.push(`[data-button-style="primary"] { /* Primary button style */ }`);
      lines.push(`[data-button-style="outline"] { --button-bg: transparent; }`);
      lines.push(`[data-icon-style="outlined"] { font-family: 'Material Icons Outlined'; }`);
      lines.push(`[data-icon-style="filled"] { font-family: 'Material Icons'; }`);
      lines.push(`[data-icon-style="rounded"] { font-family: 'Material Icons Round'; }`);

    }

    return minify ? lines.join('') : lines.join('\n');
  }

  /**
   * Generate SCSS content from theme
   */
  private static generateSCSSContent(theme: ThemeConfig, options: ExportOptions): string {
    const includeComments = options.includeComments !== false;
    const minify = options.minify === true;

    const lines: string[] = [];
    const newline = minify ? '' : '\n';
    const space = minify ? '' : ' ';

    // Header comment
    if (includeComments && !minify) {
      lines.push(`//`);
      lines.push(`// Theme: ${theme.brandName || 'Custom Theme'}`);
      lines.push(`// Generated: ${new Date().toISOString()}`);
      lines.push(`// Mode: ${theme.mode || 'light'}`);
      lines.push(`//`);
      lines.push('');
    }

    // SCSS Variables
    lines.push(`// Core Colors`);
    lines.push(`$primary:${space}${theme.primaryColor};`);
    lines.push(`$primary-light:${space}${theme.primaryLightColor || '#5FD3C4'};`);
    lines.push(`$primary-dark:${space}${theme.primaryDarkColor || '#2BA99B'};`);
    lines.push(`$secondary:${space}${theme.secondaryColor};`);
    lines.push(`$secondary-light:${space}${theme.secondaryLightColor || '#34C5AA'};`);
    lines.push(`$secondary-dark:${space}${theme.secondaryDarkColor || '#238A7F'};`);
    lines.push(`$background:${space}${theme.backgroundColor};`);
    lines.push(`$background-paper:${space}${theme.backgroundPaperColor || '#FFFFFF'};`);
    lines.push(`$background-default:${space}${theme.backgroundDefaultColor || '#F8FAFB'};`);
    lines.push(`$text:${space}${theme.textColor};`);
    lines.push(`$text-secondary:${space}${theme.textSecondaryColor || '#6B7280'};`);
    lines.push(`$text-disabled:${space}${theme.textDisabledColor || '#9CA3AF'};`);
    lines.push(`$text-hint:${space}${theme.textHintColor || '#D1D5DB'};`);
    lines.push(`$accent:${space}${theme.accentColor};`);
    lines.push(`$accent-light:${space}${theme.accentLightColor || '#A8E8DD'};`);
    lines.push(`$accent-dark:${space}${theme.accentDarkColor || '#34C5AA'};`);

    if (!minify) lines.push('');

    // Semantic Colors
    lines.push(`// Semantic Colors`);
    lines.push(`$success:${space}${theme.successColor};`);
    lines.push(`$success-light:${space}${theme.successLightColor || '#86EFAC'};`);
    lines.push(`$success-dark:${space}${theme.successDarkColor || '#16A34A'};`);
    lines.push(`$warning:${space}${theme.warningColor};`);
    lines.push(`$warning-light:${space}${theme.warningLightColor || '#FCD34D'};`);
    lines.push(`$warning-dark:${space}${theme.warningDarkColor || '#D97706'};`);
    lines.push(`$error:${space}${theme.errorColor};`);
    lines.push(`$error-light:${space}${theme.errorLightColor || '#FCA5A5'};`);
    lines.push(`$error-dark:${space}${theme.errorDarkColor || '#DC2626'};`);
    lines.push(`$info:${space}${theme.infoColor};`);
    lines.push(`$info-light:${space}${theme.infoLightColor || '#93BBFE'};`);
    lines.push(`$info-dark:${space}${theme.infoDarkColor || '#2563EB'};`);

    if (!minify) lines.push('');

    // Typography
    lines.push(`// Typography`);
    lines.push(`$font-family:${space}${theme.fontFamily};`);
    lines.push(`$font-size-base:${space}${theme.fontSizeBase}px;`);
    lines.push(`$font-size-small:${space}${theme.fontSizeSmall || 14}px;`);
    lines.push(`$font-size-medium:${space}${theme.fontSizeMedium || 16}px;`);
    lines.push(`$font-size-large:${space}${theme.fontSizeLarge || 18}px;`);
    lines.push(`$font-size-xlarge:${space}${theme.fontSizeXLarge || 20}px;`);
    lines.push(`$font-weight:${space}${theme.fontWeight || 400};`);
    lines.push(`$font-weight-light:${space}${theme.fontWeightLight || 300};`);
    lines.push(`$font-weight-medium:${space}${theme.fontWeightMedium || 500};`);
    lines.push(`$font-weight-bold:${space}${theme.fontWeightBold || 700};`);
    lines.push(`$line-height:${space}${theme.lineHeight || 1.5};`);
    lines.push(`$line-height-tight:${space}${theme.lineHeightTight || 1.25};`);
    lines.push(`$line-height-relaxed:${space}${theme.lineHeightRelaxed || 1.75};`);

    if (!minify) lines.push('');

    // Spacing
    lines.push(`// Spacing`);
    lines.push(`$spacing-unit:${space}${theme.spacingUnit}px;`);
    lines.push(`$spacing-xs:${space}${theme.spacingXSmall || 4}px;`);
    lines.push(`$spacing-sm:${space}${theme.spacingSmall || 8}px;`);
    lines.push(`$spacing-md:${space}${theme.spacingMedium || 16}px;`);
    lines.push(`$spacing-lg:${space}${theme.spacingLarge || 24}px;`);
    lines.push(`$spacing-xl:${space}${theme.spacingXLarge || 32}px;`);

    if (!minify) lines.push('');

    // Borders
    lines.push(`// Borders`);
    lines.push(`$border-radius:${space}${theme.borderRadius}px;`);
    lines.push(`$border-radius-sm:${space}${theme.borderRadiusSmall || 8}px;`);
    lines.push(`$border-radius-md:${space}${theme.borderRadiusMedium || 12}px;`);
    lines.push(`$border-radius-lg:${space}${theme.borderRadiusLarge || 16}px;`);
    lines.push(`$border-radius-circle:${space}${theme.borderRadiusCircle || 9999}px;`);
    lines.push(`$border-width:${space}${theme.borderWidth}px;`);
    lines.push(`$border-color:${space}${theme.borderColor};`);

    // Add this after the Borders section in generateSCSSContent

    if (!minify) lines.push('');

// Design & Style Properties
    lines.push(`// Design & Style Properties`);
    lines.push(`$density:${space}'${theme.density || 'comfortable'}';`);
    lines.push(`$design-style:${space}'${theme.designStyle || 'modern'}';`);
    lines.push(`$navigation-style:${space}'${theme.navigationStyle || 'elevated'}';`);
    lines.push(`$card-style:${space}'${theme.cardStyle || 'elevated'}';`);
    lines.push(`$button-style:${space}'${theme.buttonStyle || 'primary'}';`);
    lines.push(`$icon-style:${space}'${theme.iconStyle || 'outlined'}';`);
    lines.push(`$layout-type:${space}'${theme.layoutType || 'fluid'}';`);
    lines.push(`$header-position:${space}'${theme.headerPosition || 'sticky'}';`);
    lines.push(`$sidebar-position:${space}'${theme.sidebarPosition || 'left'}';`);

    if (!minify) lines.push('');

// Brand Properties
    lines.push(`// Brand Properties`);
    const escapedBrandNameScss = (theme.brandName || 'Brand').replace(/'/g, "\\'");
    const escapedBrandSloganScss = (theme.brandSlogan || '').replace(/'/g, "\\'");
    lines.push(`$brand-name:${space}'${escapedBrandNameScss}';`);
    lines.push(`$brand-slogan:${space}'${escapedBrandSloganScss}';`);
    lines.push(`$brand-font:${space}${theme.brandFont || theme.headingFontFamily};`);
    if (theme.logoUrl) {
      lines.push(`$logo-url:${space}'${theme.logoUrl}';`);
    }
    if (theme.faviconUrl) {
      lines.push(`$favicon-url:${space}'${theme.faviconUrl}';`);
    }

    if (!minify) lines.push('');

// Feature Flags
    lines.push(`// Feature Flags`);
    lines.push(`$enable-animations:${space}${theme.enableAnimations !== false};`);
    lines.push(`$enable-transitions:${space}${theme.enableTransitions !== false};`);
    lines.push(`$enable-shadows:${space}${theme.enableShadows !== false};`);
    lines.push(`$enable-blur:${space}${theme.enableBlur !== false};`);
    lines.push(`$enable-hover-effects:${space}${theme.enableHoverEffects !== false};`);
    lines.push(`$enable-focus-effects:${space}${theme.enableFocusEffects !== false};`);
    lines.push(`$enable-ripple:${space}${theme.enableRipple !== false};`);
    lines.push(`$enable-gradients:${space}${theme.enableGradients || false};`);
    lines.push(`$reduced-motion:${space}${theme.reducedMotion || false};`);
    lines.push(`$high-contrast:${space}${theme.highContrast || false};`);
    lines.push(`$focus-visible:${space}${theme.focusVisible !== false};`);

// Maps for easier iteration
    if (!minify) {
      lines.push('');
      lines.push(`// Style Maps`);
      lines.push(`$styles: (`);
      lines.push(`  density: $density,`);
      lines.push(`  design: $design-style,`);
      lines.push(`  navigation: $navigation-style,`);
      lines.push(`  card: $card-style,`);
      lines.push(`  button: $button-style,`);
      lines.push(`  icon: $icon-style,`);
      lines.push(`  layout: $layout-type`);
      lines.push(`);`);
    }
    if (!minify) lines.push('');

    // SCSS Mixins
    if (!minify) {
      lines.push('');
      lines.push(`// Useful Mixins`);
      lines.push(`@mixin theme-transition($properties: all) {`);
      lines.push(`  transition: $properties ${theme.animationSpeed || 300}ms ${theme.animationEasing || 'ease-out'};`);
      lines.push(`}`);
      lines.push('');
      lines.push(`@mixin theme-shadow($level: 'medium') {`);
      lines.push(`  @if $level == 'small' {`);
      lines.push(`    box-shadow: ${theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)'};`);
      lines.push(`  } @else if $level == 'large' {`);
      lines.push(`    box-shadow: ${theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)'};`);
      lines.push(`  } @else {`);
      lines.push(`    box-shadow: ${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};`);
      lines.push(`  }`);
      lines.push(`}`);
      lines.push('');
      lines.push(`@mixin theme-gradient($type: 'primary') {`);
      lines.push(`  @if $type == 'primary' {`);
      lines.push(`    background: ${theme.primaryGradient || 'linear-gradient(135deg, $primary 0%, $primary-dark 100%)'};`);
      lines.push(`  } @else if $type == 'secondary' {`);
      lines.push(`    background: ${theme.secondaryGradient || 'linear-gradient(135deg, $secondary-light 0%, $secondary 100%)'};`);
      lines.push(`  } @else if $type == 'accent' {`);
      lines.push(`    background: ${theme.accentGradient || 'linear-gradient(135deg, $accent 0%, $accent-dark 100%)'};`);
      lines.push(`  }`);
      lines.push(`}`);
    }

    return minify ? lines.join('') : lines.join('\n');
  }

  /**
   * Import theme from file
   */
  static importTheme(file: File): Promise<ThemeConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;

          if (file.name.endsWith('.json')) {
            const theme = JSON.parse(content) as ThemeConfig;
            resolve(theme);
          } else {
            reject(new Error('Unsupported file format. Please use JSON files.'));
          }
        } catch (error) {
          reject(new Error('Invalid theme file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Validate imported theme
   */
  static validateImportedTheme(theme: any): theme is ThemeConfig {
    // Basic validation - check for required properties
    const requiredProps = [
      'primaryColor',
      'secondaryColor',
      'backgroundColor',
      'textColor',
      'fontFamily',
      'fontSizeBase',
      'spacingUnit',
      'borderRadius'
    ];

    return requiredProps.every(prop => prop in theme);
  }

  /**
   * Export multiple formats in a zip file
   */
  static async exportAllFormats(theme: ThemeConfig): Promise<void> {
    // This would require a zip library like JSZip
    // For now, we'll export them separately
    const brandName = theme.brandName || 'theme';
    const sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
    const timestamp = Date.now();

    // Export JSON
    this.exportAsJSON(theme, sanitizedBrandName, timestamp);

    // Small delay to avoid download blocking
    setTimeout(() => {
      this.exportAsCSS(theme, sanitizedBrandName, timestamp, { format: 'css' });
    }, 500);

    setTimeout(() => {
      this.exportAsSCSS(theme, sanitizedBrandName, timestamp, { format: 'scss' });
    }, 1000);
  }
}
