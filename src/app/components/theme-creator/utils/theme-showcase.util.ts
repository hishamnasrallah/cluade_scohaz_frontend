// src/app/components/theme-creator/utils/theme-showcase.util.ts
import { ThemeConfig } from '../../../models/theme.model';

export interface ShowcaseOptions {
  includeMetadata?: boolean;
  includeAllComponents?: boolean;
  includeFontLinks?: boolean;
  includeAnimations?: boolean;
  minify?: boolean;
}

export class ThemeShowcaseUtil {
  static generateShowcase(theme: ThemeConfig, options: ShowcaseOptions = {}): string {
    const {
      includeMetadata = true,
      includeAllComponents = true,
      includeFontLinks = true,
      includeAnimations = true,
      minify = false
    } = options;

    const indent = minify ? '' : '    ';
    const newline = minify ? '' : '\n';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${theme.brandName || 'Theme'} - Showcase</title>
    ${includeMetadata ? this.generateMetaTags(theme) : ''}
    ${includeFontLinks ? this.generateFontLinks(theme) : ''}
    ${this.generateMaterialIconsLinks()}

    <style>
        ${this.generateCSSVariables(theme, minify)}
        ${this.generateBaseStyles(theme, minify)}
        ${this.generateComponentStyles(theme, minify)}
        ${includeAnimations && theme.enableAnimations ? this.generateAnimationStyles(theme, minify) : ''}
    </style>
</head>
<body>
    <div class="theme-container">
        ${this.generateHeader(theme)}
        ${this.generateColorPalette(theme)}
        ${this.generateTypography(theme)}
        ${includeAllComponents ? this.generateComponents(theme) : this.generateBasicComponents(theme)}
        ${this.generateSpacing(theme)}
        ${this.generateShadows(theme)}
        ${this.generateBorders(theme)}
        ${includeAnimations && theme.enableAnimations ? this.generateAnimations(theme) : ''}
        ${this.generateFooter(theme)}
    </div>
</body>
</html>`;
  }

  private static generateMetaTags(theme: ThemeConfig): string {
    return `
    <!-- Theme Metadata -->
    <meta name="theme-name" content="${theme.brandName || 'Custom Theme'}">
    <meta name="theme-version" content="1.0.0">
    <meta name="theme-mode" content="${theme.mode || 'light'}">
    <meta name="generated-date" content="${new Date().toISOString()}">`;
  }

  private static generateFontLinks(theme: ThemeConfig): string {
    const fonts = new Set<string>();

    // Extract font families from theme
    if (theme.fontFamily) {
      const fontMatch = theme.fontFamily.match(/^'?([^',]+)/);
      if (fontMatch) fonts.add(fontMatch[1]);
    }
    if (theme.headingFontFamily) {
      const fontMatch = theme.headingFontFamily.match(/^'?([^',]+)/);
      if (fontMatch) fonts.add(fontMatch[1]);
    }

    // Generate Google Fonts links
    const fontLinks: string[] = [];
    fonts.forEach(font => {
      if (!['system-ui', 'sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica'].includes(font)) {
        const weights = '300;400;500;600;700';
        fontLinks.push(`<link href="https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@${weights}&display=swap" rel="stylesheet">`);
      }
    });

    return fontLinks.join('\n    ');
  }

  private static generateMaterialIconsLinks(): string {
    return `
    <!-- Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone" rel="stylesheet">`;
  }

  private static generateCSSVariables(theme: ThemeConfig, minify: boolean): string {
    const indent = minify ? '' : '        ';
    const newline = minify ? '' : '\n';
    const space = minify ? '' : ' ';

    const lines: string[] = [':root {'];

    // Core Colors
    lines.push(`${indent}/* Core Colors */`);
    lines.push(`${indent}--theme-primary:${space}${theme.primaryColor};`);
    lines.push(`${indent}--theme-primary-light:${space}${theme.primaryLightColor || '#5FD3C4'};`);
    lines.push(`${indent}--theme-primary-dark:${space}${theme.primaryDarkColor || '#2BA99B'};`);
    lines.push(`${indent}--theme-secondary:${space}${theme.secondaryColor};`);
    lines.push(`${indent}--theme-secondary-light:${space}${theme.secondaryLightColor || '#34C5AA'};`);
    lines.push(`${indent}--theme-secondary-dark:${space}${theme.secondaryDarkColor || '#238A7F'};`);
    lines.push(`${indent}--theme-background:${space}${theme.backgroundColor};`);
    lines.push(`${indent}--theme-background-paper:${space}${theme.backgroundPaperColor || '#FFFFFF'};`);
    lines.push(`${indent}--theme-background-default:${space}${theme.backgroundDefaultColor || '#F8FAFB'};`);
    lines.push(`${indent}--theme-text:${space}${theme.textColor};`);
    lines.push(`${indent}--theme-text-secondary:${space}${theme.textSecondaryColor || '#6B7280'};`);
    lines.push(`${indent}--theme-text-disabled:${space}${theme.textDisabledColor || '#9CA3AF'};`);
    lines.push(`${indent}--theme-text-hint:${space}${theme.textHintColor || '#D1D5DB'};`);
    lines.push(`${indent}--theme-accent:${space}${theme.accentColor};`);
    lines.push(`${indent}--theme-accent-light:${space}${theme.accentLightColor || '#A8E8DD'};`);
    lines.push(`${indent}--theme-accent-dark:${space}${theme.accentDarkColor || '#34C5AA'};`);

    if (!minify) lines.push('');

    // Semantic colors
    lines.push(`${indent}/* Semantic Colors */`);
    lines.push(`${indent}--theme-success:${space}${theme.successColor};`);
    lines.push(`${indent}--theme-success-light:${space}${theme.successLightColor || '#86EFAC'};`);
    lines.push(`${indent}--theme-success-dark:${space}${theme.successDarkColor || '#16A34A'};`);
    lines.push(`${indent}--theme-warning:${space}${theme.warningColor};`);
    lines.push(`${indent}--theme-warning-light:${space}${theme.warningLightColor || '#FCD34D'};`);
    lines.push(`${indent}--theme-warning-dark:${space}${theme.warningDarkColor || '#D97706'};`);
    lines.push(`${indent}--theme-error:${space}${theme.errorColor};`);
    lines.push(`${indent}--theme-error-light:${space}${theme.errorLightColor || '#FCA5A5'};`);
    lines.push(`${indent}--theme-error-dark:${space}${theme.errorDarkColor || '#DC2626'};`);
    lines.push(`${indent}--theme-info:${space}${theme.infoColor};`);
    lines.push(`${indent}--theme-info-light:${space}${theme.infoLightColor || '#93BBFE'};`);
    lines.push(`${indent}--theme-info-dark:${space}${theme.infoDarkColor || '#2563EB'};`);

    if (!minify) lines.push('');

    // Surface colors
    lines.push(`${indent}/* Surface Colors */`);
    lines.push(`${indent}--theme-surface-card:${space}${theme.surfaceCard || '#FFFFFF'};`);
    lines.push(`${indent}--theme-surface-modal:${space}${theme.surfaceModal || '#FFFFFF'};`);
    lines.push(`${indent}--theme-surface-hover:${space}${theme.surfaceHover || 'rgba(196, 247, 239, 0.3)'};`);
    lines.push(`${indent}--theme-surface-focus:${space}${theme.surfaceFocus || 'rgba(52, 197, 170, 0.12)'};`);
    lines.push(`${indent}--theme-surface-selected:${space}${theme.surfaceSelected || 'rgba(52, 197, 170, 0.08)'};`);
    lines.push(`${indent}--theme-surface-disabled:${space}${theme.surfaceDisabled || 'rgba(0, 0, 0, 0.04)'};`);
    lines.push(`${indent}--theme-divider:${space}${theme.dividerColor || 'rgba(0, 0, 0, 0.08)'};`);
    lines.push(`${indent}--theme-overlay:${space}${theme.overlayColor || 'rgba(0, 0, 0, 0.5)'};`);

    if (!minify) lines.push('');

    // Typography
    lines.push(`${indent}/* Typography */`);
    lines.push(`${indent}--theme-font-family:${space}${theme.fontFamily};`);
    lines.push(`${indent}--theme-font-size:${space}${theme.fontSizeBase}px;`);
    lines.push(`${indent}--theme-font-size-base:${space}${theme.fontSizeBase}px;`);
    lines.push(`${indent}--theme-font-size-small:${space}${theme.fontSizeSmall || 14}px;`);
    lines.push(`${indent}--theme-font-size-medium:${space}${theme.fontSizeMedium || 16}px;`);
    lines.push(`${indent}--theme-font-size-large:${space}${theme.fontSizeLarge || 18}px;`);
    lines.push(`${indent}--theme-font-size-xlarge:${space}${theme.fontSizeXLarge || 20}px;`);
    lines.push(`${indent}--theme-font-weight:${space}${theme.fontWeight || 400};`);
    lines.push(`${indent}--theme-font-weight-light:${space}${theme.fontWeightLight || 300};`);
    lines.push(`${indent}--theme-font-weight-medium:${space}${theme.fontWeightMedium || 500};`);
    lines.push(`${indent}--theme-font-weight-bold:${space}${theme.fontWeightBold || 700};`);
    lines.push(`${indent}--theme-line-height:${space}${theme.lineHeight || 1.5};`);
    lines.push(`${indent}--theme-line-height-tight:${space}${theme.lineHeightTight || 1.25};`);
    lines.push(`${indent}--theme-line-height-relaxed:${space}${theme.lineHeightRelaxed || 1.75};`);
    lines.push(`${indent}--theme-letter-spacing:${space}${theme.letterSpacing || 0}em;`);
    lines.push(`${indent}--theme-letter-spacing-tight:${space}${theme.letterSpacingTight || -0.025}em;`);
    lines.push(`${indent}--theme-letter-spacing-wide:${space}${theme.letterSpacingWide || 0.025}em;`);
    lines.push(`${indent}--theme-heading-font:${space}${theme.headingFontFamily};`);
    lines.push(`${indent}--theme-heading-font-family:${space}${theme.headingFontFamily};`);
    lines.push(`${indent}--theme-heading-weight:${space}${theme.headingFontWeight || 600};`);
    lines.push(`${indent}--theme-heading-font-weight:${space}${theme.headingFontWeight || 600};`);
    lines.push(`${indent}--theme-h1-size:${space}${theme.h1Size || 40}px;`);
    lines.push(`${indent}--theme-h2-size:${space}${theme.h2Size || 32}px;`);
    lines.push(`${indent}--theme-h3-size:${space}${theme.h3Size || 28}px;`);
    lines.push(`${indent}--theme-h4-size:${space}${theme.h4Size || 24}px;`);
    lines.push(`${indent}--theme-h5-size:${space}${theme.h5Size || 20}px;`);
    lines.push(`${indent}--theme-h6-size:${space}${theme.h6Size || 18}px;`);
    lines.push(`${indent}--theme-text-scale:${space}${theme.textScaling || 1};`);
    lines.push(`${indent}--theme-text-scaling:${space}${theme.textScaling || 1};`);

    if (!minify) lines.push('');

    // Spacing
    lines.push(`${indent}/* Spacing & Layout */`);
    lines.push(`${indent}--theme-spacing:${space}${theme.spacingUnit}px;`);
    lines.push(`${indent}--theme-spacing-unit:${space}${theme.spacingUnit}px;`);
    lines.push(`${indent}--theme-spacing-xsmall:${space}${theme.spacingXSmall || 4}px;`);
    lines.push(`${indent}--theme-spacing-small:${space}${theme.spacingSmall || 8}px;`);
    lines.push(`${indent}--theme-spacing-medium:${space}${theme.spacingMedium || 16}px;`);
    lines.push(`${indent}--theme-spacing-large:${space}${theme.spacingLarge || 24}px;`);
    lines.push(`${indent}--theme-spacing-xlarge:${space}${theme.spacingXLarge || 32}px;`);
    lines.push(`${indent}--theme-container-max:${space}${theme.containerMaxWidth || 1200}px;`);
    lines.push(`${indent}--theme-sidebar-width:${space}${theme.sidebarWidth || 240}px;`);
    lines.push(`${indent}--theme-sidebar-collapsed:${space}${theme.sidebarCollapsedWidth || 64}px;`);

    if (!minify) lines.push('');

    // Borders
    lines.push(`${indent}/* Borders */`);
    lines.push(`${indent}--theme-radius:${space}${theme.borderRadius}px;`);
    lines.push(`${indent}--theme-radius-small:${space}${theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}--theme-radius-medium:${space}${theme.borderRadiusMedium || 12}px;`);
    lines.push(`${indent}--theme-radius-large:${space}${theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}--theme-radius-circle:${space}${theme.borderRadiusCircle || 9999}px;`);
    lines.push(`${indent}--theme-border-radius:${space}${theme.borderRadius}px;`);
    lines.push(`${indent}--theme-border-radius-small:${space}${theme.borderRadiusSmall || 8}px;`);
    lines.push(`${indent}--theme-border-radius-medium:${space}${theme.borderRadiusMedium || 12}px;`);
    lines.push(`${indent}--theme-border-radius-large:${space}${theme.borderRadiusLarge || 16}px;`);
    lines.push(`${indent}--theme-border-radius-circle:${space}${theme.borderRadiusCircle || 9999}px;`);
    lines.push(`${indent}--theme-border-width:${space}${theme.borderWidth}px;`);
    lines.push(`${indent}--theme-border-style:${space}${theme.borderStyle || 'solid'};`);
    lines.push(`${indent}--theme-border-color:${space}${theme.borderColor};`);
    lines.push(`${indent}--theme-border-focus:${space}${theme.borderFocusColor};`);
    lines.push(`${indent}--theme-border-hover:${space}${theme.borderHoverColor};`);

    if (!minify) lines.push('');

    // Effects
    lines.push(`${indent}/* Effects */`);
    lines.push(`${indent}--theme-shadow-intensity:${space}${theme.shadowIntensity || 0.12};`);
    lines.push(`${indent}--theme-shadow-color:${space}${theme.shadowColor || 'rgba(0, 0, 0, 0.1)'};`);
    lines.push(`${indent}--theme-shadow-small:${space}${theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)'};`);
    lines.push(`${indent}--theme-shadow-medium:${space}${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};`);
    lines.push(`${indent}--theme-shadow-large:${space}${theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)'};`);
    lines.push(`${indent}--theme-shadow-inset:${space}${theme.shadowInset || 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'};`);
    lines.push(`${indent}--theme-blur:${space}${theme.blurIntensity || 10}px;`);
    lines.push(`${indent}--theme-blur-intensity:${space}${theme.blurIntensity || 10}px;`);
    lines.push(`${indent}--theme-blur-small:${space}${theme.blurSmall || 4}px;`);
    lines.push(`${indent}--theme-blur-medium:${space}${theme.blurMedium || 10}px;`);
    lines.push(`${indent}--theme-blur-large:${space}${theme.blurLarge || 20}px;`);

    if (!minify) lines.push('');

    // Animation
    lines.push(`${indent}/* Animation */`);
    lines.push(`${indent}--theme-duration:${space}${theme.animationSpeed || 300}ms;`);
    lines.push(`${indent}--theme-duration-slow:${space}${theme.animationSpeedSlow || 500}ms;`);
    lines.push(`${indent}--theme-duration-fast:${space}${theme.animationSpeedFast || 150}ms;`);
    lines.push(`${indent}--theme-duration-normal:${space}${theme.animationSpeed || 300}ms;`);
    lines.push(`${indent}--theme-easing:${space}${theme.animationEasing || 'ease'};`);
    lines.push(`${indent}--theme-timing:${space}${theme.animationEasing || 'ease'};`);
    lines.push(`${indent}--theme-easing-in:${space}${theme.animationEasingIn || 'ease-in'};`);
    lines.push(`${indent}--theme-timing-in:${space}${theme.animationEasingIn || 'ease-in'};`);
    lines.push(`${indent}--theme-easing-out:${space}${theme.animationEasingOut || 'ease-out'};`);
    lines.push(`${indent}--theme-timing-out:${space}${theme.animationEasingOut || 'ease-out'};`);
    lines.push(`${indent}--theme-easing-in-out:${space}${theme.animationEasingInOut || 'ease-in-out'};`);
    lines.push(`${indent}--theme-timing-in-out:${space}${theme.animationEasingInOut || 'ease-in-out'};`);

    if (!minify) lines.push('');

    // Component Specific
    lines.push(`${indent}/* Component Specific */`);
    lines.push(`${indent}--theme-button-height:${space}${theme.buttonHeight || 40}px;`);
    lines.push(`${indent}--theme-button-padding-x:${space}${theme.buttonPaddingX || 24}px;`);
    lines.push(`${indent}--theme-button-padding-y:${space}${theme.buttonPaddingY || 12}px;`);
    lines.push(`${indent}--theme-button-font-size:${space}${theme.buttonFontSize || 14}px;`);
    lines.push(`${indent}--theme-button-font-weight:${space}${theme.buttonFontWeight || 600};`);
    lines.push(`${indent}--theme-button-radius:${space}${theme.buttonBorderRadius || 8}px;`);
    lines.push(`${indent}--theme-button-border-radius:${space}${theme.buttonBorderRadius || 8}px;`);
    lines.push(`${indent}--theme-input-height:${space}${theme.inputHeight || 44}px;`);
    lines.push(`${indent}--theme-input-padding-x:${space}${theme.inputPaddingX || 16}px;`);
    lines.push(`${indent}--theme-input-padding-y:${space}${theme.inputPaddingY || 12}px;`);
    lines.push(`${indent}--theme-input-font-size:${space}${theme.inputFontSize || 16}px;`);
    lines.push(`${indent}--theme-input-radius:${space}${theme.inputBorderRadius || 8}px;`);
    lines.push(`${indent}--theme-input-border-radius:${space}${theme.inputBorderRadius || 8}px;`);
    lines.push(`${indent}--theme-card-padding:${space}${theme.cardPadding || 24}px;`);
    lines.push(`${indent}--theme-card-radius:${space}${theme.cardBorderRadius || 12}px;`);
    lines.push(`${indent}--theme-card-border-radius:${space}${theme.cardBorderRadius || 12}px;`);
    lines.push(`${indent}--theme-card-elevation:${space}${theme.cardElevation || 1};`);
    lines.push(`${indent}--theme-modal-radius:${space}${theme.modalBorderRadius || 16}px;`);
    lines.push(`${indent}--theme-modal-border-radius:${space}${theme.modalBorderRadius || 16}px;`);
    lines.push(`${indent}--theme-modal-padding:${space}${theme.modalPadding || 32}px;`);
    lines.push(`${indent}--theme-tooltip-font-size:${space}${theme.tooltipFontSize || 12}px;`);
    lines.push(`${indent}--theme-tooltip-padding:${space}${theme.tooltipPadding || 8}px;`);
    lines.push(`${indent}--theme-tooltip-radius:${space}${theme.tooltipBorderRadius || 4}px;`);
    lines.push(`${indent}--theme-tooltip-border-radius:${space}${theme.tooltipBorderRadius || 4}px;`);

    if (!minify) lines.push('');

    // Z-Index Layers
    lines.push(`${indent}/* Z-Index Layers */`);
    lines.push(`${indent}--theme-z-dropdown:${space}${theme.zIndexDropdown || 1000};`);
    lines.push(`${indent}--theme-z-modal:${space}${theme.zIndexModal || 1300};`);
    lines.push(`${indent}--theme-z-popover:${space}${theme.zIndexPopover || 1200};`);
    lines.push(`${indent}--theme-z-tooltip:${space}${theme.zIndexTooltip || 1400};`);
    lines.push(`${indent}--theme-z-header:${space}${theme.zIndexHeader || 1100};`);
    lines.push(`${indent}--theme-z-drawer:${space}${theme.zIndexDrawer || 1200};`);
    lines.push(`${indent}--theme-z-overlay:${space}${theme.zIndexOverlay || 1250};`);

    if (!minify) lines.push('');

    // Grid System
    lines.push(`${indent}/* Grid System */`);
    lines.push(`${indent}--theme-grid-columns:${space}${theme.gridColumns || 12};`);
    lines.push(`${indent}--theme-grid-gutter:${space}${theme.gridGutter || 24}px;`);

    if (!minify) lines.push('');

    // Design & Style Properties
    lines.push(`${indent}/* Design & Style Properties */`);
    lines.push(`${indent}--theme-density:${space}'${theme.density || 'comfortable'}';`);
    lines.push(`${indent}--theme-design-style:${space}'${theme.designStyle || 'modern'}';`);
    lines.push(`${indent}--theme-navigation-style:${space}'${theme.navigationStyle || 'elevated'}';`);
    lines.push(`${indent}--theme-card-style:${space}'${theme.cardStyle || 'elevated'}';`);
    lines.push(`${indent}--theme-button-style:${space}'${theme.buttonStyle || 'primary'}';`);
    lines.push(`${indent}--theme-icon-style:${space}'${theme.iconStyle || 'outlined'}';`);
    lines.push(`${indent}--theme-layout-type:${space}'${theme.layoutType || 'fluid'}';`);
    lines.push(`${indent}--theme-header-position:${space}'${theme.headerPosition || 'sticky'}';`);
    lines.push(`${indent}--theme-sidebar-position:${space}'${theme.sidebarPosition || 'left'}';`);

    if (!minify) lines.push('');

    // Brand Properties
    lines.push(`${indent}/* Brand Properties */`);
    lines.push(`${indent}--theme-brand-name:${space}'${theme.brandName || 'PraXelo Enterprise'}';`);
    lines.push(`${indent}--theme-brand-slogan:${space}'${theme.brandSlogan || ''}';`);
    lines.push(`${indent}--theme-brand-font:${space}${theme.brandFont || 'Poppins, sans-serif'};`);
    lines.push(`${indent}--theme-logo-url:${space}url('${theme.logoUrl || 'assets/logo.svg'}');`);

    if (!minify) lines.push('');

    // Feature Flags
    lines.push(`${indent}/* Feature Flags */`);
    lines.push(`${indent}--theme-enable-animations:${space}${theme.enableAnimations ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-transitions:${space}${theme.enableTransitions ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-shadows:${space}${theme.enableShadows ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-blur:${space}${theme.enableBlur ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-hover-effects:${space}${theme.enableHoverEffects ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-focus-effects:${space}${theme.enableFocusEffects ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-ripple:${space}${theme.enableRipple ? 1 : 0};`);
    lines.push(`${indent}--theme-enable-gradients:${space}${theme.enableGradients ? 1 : 0};`);
    lines.push(`${indent}--theme-reduced-motion:${space}${theme.reducedMotion ? 1 : 0};`);
    lines.push(`${indent}--theme-high-contrast:${space}${theme.highContrast ? 1 : 0};`);
    lines.push(`${indent}--theme-focus-visible:${space}${theme.focusVisible ? 1 : 0};`);

    if (theme.enableGradients) {
      if (!minify) lines.push('');
      lines.push(`${indent}/* Gradients */`);
      lines.push(`${indent}--theme-gradient-primary:${space}${theme.primaryGradient || 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)'};`);
      lines.push(`${indent}--theme-primary-gradient:${space}${theme.primaryGradient || 'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)'};`);
      lines.push(`${indent}--theme-gradient-secondary:${space}${theme.secondaryGradient || 'linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)'};`);
      lines.push(`${indent}--theme-secondary-gradient:${space}${theme.secondaryGradient || 'linear-gradient(135deg, #5FD3C4 0%, #34C5AA 100%)'};`);
      lines.push(`${indent}--theme-gradient-accent:${space}${theme.accentGradient || 'linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)'};`);
      lines.push(`${indent}--theme-accent-gradient:${space}${theme.accentGradient || 'linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%)'};`);
      lines.push(`${indent}--theme-gradient-background:${space}${theme.backgroundGradient || 'linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)'};`);
      lines.push(`${indent}--theme-background-gradient:${space}${theme.backgroundGradient || 'linear-gradient(135deg, #F4FDFD 0%, #E8F9F7 100%)'};`);
      lines.push(`${indent}--theme-gradient-angle:${space}${theme.gradientAngle || 135}deg;`);
    }

    lines.push('        }');

    return lines.join(newline);
  }

  private static generateBaseStyles(theme: ThemeConfig, minify: boolean): string {
    return `
        /* Base Styles */
        /* CSS Custom Properties are defined dynamically in :root */
        /* stylelint-disable custom-property-pattern */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--theme-font-family);
            font-size: var(--theme-font-size);
            line-height: var(--theme-line-height);
            color: var(--theme-text);
            background-color: var(--theme-background);
        }

        .theme-container {
            max-width: var(--theme-container-max);
            margin: 0 auto;
            padding: var(--theme-spacing-large);
        }

        /* Typography Classes */
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--theme-heading-font-family);
            font-weight: var(--theme-heading-font-weight);
            line-height: var(--theme-line-height-tight);
            margin-bottom: var(--theme-spacing-medium);
            color: var(--theme-text);
        }

        h1 { font-size: var(--theme-h1-size); }
        h2 { font-size: var(--theme-h2-size); }
        h3 { font-size: var(--theme-h3-size); }
        h4 { font-size: var(--theme-h4-size); }
        h5 { font-size: var(--theme-h5-size); }
        h6 { font-size: var(--theme-h6-size); }

        .text-small { font-size: var(--theme-font-size-small); }
        .text-medium { font-size: var(--theme-font-size-medium); }
        .text-large { font-size: var(--theme-font-size-large); }
        .text-xlarge { font-size: var(--theme-font-size-xlarge); }

        .text-secondary { color: var(--theme-text-secondary); }
        .text-disabled { color: var(--theme-text-disabled); }
        .text-hint { color: var(--theme-text-hint); }`;
  }

  private static generateComponentStyles(theme: ThemeConfig, minify: boolean): string {
    return `
        /* Components */
        .section {
            margin-bottom: var(--theme-spacing-xlarge);
            padding: var(--theme-spacing-large);
            background: var(--theme-surface-card);
            border-radius: var(--theme-card-radius);
            box-shadow: ${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};
        }

        .section-title {
            margin-bottom: var(--theme-spacing-large);
            padding-bottom: var(--theme-spacing-medium);
            border-bottom: var(--theme-border-width) var(--theme-border-style) var(--theme-divider);
        }

        /* Buttons */
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: var(--theme-button-height);
            padding: var(--theme-button-padding-y) var(--theme-button-padding-x);
            font-size: var(--theme-button-font-size);
            font-weight: var(--theme-button-font-weight);
            font-family: var(--theme-font-family);
            border-radius: var(--theme-button-radius);
            border: none;
            cursor: pointer;
            transition: all var(--theme-duration) var(--theme-easing);
            text-decoration: none;
        }

        .button-primary {
            background-color: var(--theme-primary);
            color: white;
        }

        .button-primary:hover {
            background-color: var(--theme-primary-dark);
            box-shadow: ${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};
        }

        .button-secondary {
            background-color: var(--theme-secondary);
            color: white;
        }

        .button-secondary:hover {
            background-color: var(--theme-secondary-dark);
        }

        .button-outline {
            background-color: transparent;
            color: var(--theme-primary);
            border: 2px solid var(--theme-primary);
        }

        .button-outline:hover {
            background-color: var(--theme-primary);
            color: white;
        }

        /* Inputs */
        .input {
            width: 100%;
            height: var(--theme-input-height);
            padding: var(--theme-input-padding-y) var(--theme-input-padding-x);
            font-size: var(--theme-input-font-size);
            font-family: var(--theme-font-family);
            border: var(--theme-border-width) var(--theme-border-style) var(--theme-border-color);
            border-radius: var(--theme-input-radius);
            background-color: var(--theme-surface-card);
            color: var(--theme-text);
            transition: all var(--theme-duration) var(--theme-easing);
        }

        .input:focus {
            outline: none;
            border-color: var(--theme-border-focus);
            box-shadow: 0 0 0 3px var(--theme-surface-focus);
        }

        .input::placeholder {
            color: var(--theme-text-hint);
        }

        /* Cards */
        .card {
            background-color: var(--theme-surface-card);
            border-radius: var(--theme-card-radius);
            padding: var(--theme-card-padding);
            box-shadow: ${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};
            margin-bottom: var(--theme-spacing-medium);
        }

        .card-elevated {
            box-shadow: ${theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)'};
        }

        /* Grid */
        .grid {
            display: grid;
            grid-template-columns: repeat(var(--theme-grid-columns), 1fr);
            gap: var(--theme-grid-gutter);
        }

        .grid-3 {
            grid-template-columns: repeat(3, 1fr);
        }

        .grid-4 {
            grid-template-columns: repeat(4, 1fr);
        }

        /* Color Palette */
        .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--theme-spacing-medium);
        }

        .color-card {
            border-radius: var(--theme-radius-small);
            overflow: hidden;
            box-shadow: ${theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)'};
        }

        .color-preview {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: var(--theme-font-weight-bold);
        }

        .color-info {
            padding: var(--theme-spacing-small);
            background: white;
            font-size: var(--theme-font-size-small);
        }

        /* Spacing Demo */
        .spacing-demo {
            display: flex;
            flex-wrap: wrap;
            gap: var(--theme-spacing-medium);
        }

        .spacing-box {
            background-color: var(--theme-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--theme-font-size-small);
            font-weight: var(--theme-font-weight-medium);
        }

        /* Shadow Demo */
        .shadow-demo {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--theme-spacing-large);
        }

        .shadow-box {
            background: var(--theme-surface-card);
            padding: var(--theme-spacing-medium);
            border-radius: var(--theme-radius);
            text-align: center;
        }

        /* Icons */
        .icon {
            font-size: 24px;
            vertical-align: middle;
            margin-right: var(--theme-spacing-small);
        }

        .icon-outlined {
            font-family: 'Material Icons Outlined' !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .grid-3 { grid-template-columns: 1fr; }
            .grid-4 { grid-template-columns: repeat(2, 1fr); }
        }`;
  }

  private static generateAnimationStyles(theme: ThemeConfig, minify: boolean): string {
    return `
        /* Animations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .animated {
            animation-duration: var(--theme-duration);
            animation-timing-function: var(--theme-easing);
        }

        .fade-in { animation-name: fadeIn; }
        .slide-in { animation-name: slideIn; }`;
  }

  private static generateHeader(theme: ThemeConfig): string {
    return `
        <!-- Header -->
        <header class="section">
            <h1>${theme.brandName || 'Theme'} Showcase</h1>
            <p class="text-large text-secondary">Complete theme demonstration with all properties</p>
        </header>`;
  }

  private static generateColorPalette(theme: ThemeConfig): string {
    return `
        <!-- Color Palette Section -->
        <section class="section">
            <h2 class="section-title">Color Palette</h2>

            <h3>Core Colors</h3>
            <div class="color-grid">
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.primaryColor};">Primary</div>
                    <div class="color-info">
                        <strong>Primary:</strong> ${theme.primaryColor}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.primaryLightColor || '#5FD3C4'};">Primary Light</div>
                    <div class="color-info">
                        <strong>Primary Light:</strong> ${theme.primaryLightColor || '#5FD3C4'}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.primaryDarkColor || '#2BA99B'};">Primary Dark</div>
                    <div class="color-info">
                        <strong>Primary Dark:</strong> ${theme.primaryDarkColor || '#2BA99B'}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.secondaryColor};">Secondary</div>
                    <div class="color-info">
                        <strong>Secondary:</strong> ${theme.secondaryColor}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.accentColor};">Accent</div>
                    <div class="color-info">
                        <strong>Accent:</strong> ${theme.accentColor}
                    </div>
                </div>
            </div>

            <h3>Semantic Colors</h3>
            <div class="color-grid">
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.successColor};">Success</div>
                    <div class="color-info">
                        <strong>Success:</strong> ${theme.successColor}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.warningColor};">Warning</div>
                    <div class="color-info">
                        <strong>Warning:</strong> ${theme.warningColor}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.errorColor};">Error</div>
                    <div class="color-info">
                        <strong>Error:</strong> ${theme.errorColor}
                    </div>
                </div>
                <div class="color-card">
                    <div class="color-preview" style="background-color: ${theme.infoColor};">Info</div>
                    <div class="color-info">
                        <strong>Info:</strong> ${theme.infoColor}
                    </div>
                </div>
            </div>
        </section>`;
  }
  private static generateTypography(theme: ThemeConfig): string {
    // Build font weight styles
    const lightWeight = `font-weight: ${theme.fontWeightLight || 300};`;
    const regularWeight = `font-weight: ${theme.fontWeight || 400};`;
    const mediumWeight = `font-weight: ${theme.fontWeightMedium || 500};`;
    const boldWeight = `font-weight: ${theme.fontWeightBold || 700};`;

    return `
        <!-- Typography Section -->
        <section class="section">
            <h2 class="section-title">Typography</h2>

            <div>
                <h1>Heading 1 - ${theme.headingFontFamily} ${theme.h1Size || 40}px</h1>
                <h2>Heading 2 - ${theme.headingFontFamily} ${theme.h2Size || 32}px</h2>
                <h3>Heading 3 - ${theme.headingFontFamily} ${theme.h3Size || 28}px</h3>
                <h4>Heading 4 - ${theme.headingFontFamily} ${theme.h4Size || 24}px</h4>
                <h5>Heading 5 - ${theme.headingFontFamily} ${theme.h5Size || 20}px</h5>
                <h6>Heading 6 - ${theme.headingFontFamily} ${theme.h6Size || 18}px</h6>
            </div>

            <div style="margin-top: 32px;">
                <p class="text-xlarge">Extra Large Text (${theme.fontSizeXLarge || 20}px) - Lorem ipsum dolor sit amet</p>
                <p class="text-large">Large Text (${theme.fontSizeLarge || 18}px) - Lorem ipsum dolor sit amet</p>
                <p>Base Text (${theme.fontSizeBase}px) - Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
                <p class="text-small">Small Text (${theme.fontSizeSmall || 14}px) - Lorem ipsum dolor sit amet consectetur adipisicing elit</p>
            </div>

            <div style="margin-top: 32px;">
                <p style="${lightWeight}">Light Weight (${theme.fontWeightLight || 300}) - The quick brown fox jumps over the lazy dog</p>
                <p style="${regularWeight}">Regular Weight (${theme.fontWeight || 400}) - The quick brown fox jumps over the lazy dog</p>
                <p style="${mediumWeight}">Medium Weight (${theme.fontWeightMedium || 500}) - The quick brown fox jumps over the lazy dog</p>
                <p style="${boldWeight}">Bold Weight (${theme.fontWeightBold || 700}) - The quick brown fox jumps over the lazy dog</p>
            </div>
        </section>`;
  }

  private static generateComponents(theme: ThemeConfig): string {
    const hoverBackground = `background: ${theme.surfaceHover || 'rgba(196, 247, 239, 0.3)'};`;

    return `
        <!-- Components Section -->
        <section class="section">
            <h2 class="section-title">Components</h2>

            <h3>Buttons</h3>
            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
                <button class="button button-primary">
                    <i class="material-icons-outlined icon">add</i>
                    Primary Button
                </button>
                <button class="button button-secondary">Secondary Button</button>
                <button class="button button-outline">Outline Button</button>
            </div>

            <h3>Inputs</h3>
            <div class="grid-3" style="margin-bottom: 32px;">
                <input type="text" class="input" placeholder="Text input">
                <input type="email" class="input" placeholder="Email input">
                <select class="input">
                    <option>Select option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                </select>
            </div>

            <h3>Cards</h3>
            <div class="grid-3">
                <div class="card">
                    <h4>Default Card</h4>
                    <p class="text-secondary">This is a card with default elevation and padding.</p>
                </div>
                <div class="card card-elevated">
                    <h4>Elevated Card</h4>
                    <p class="text-secondary">This card has higher elevation for more prominence.</p>
                </div>
                <div class="card" style="${hoverBackground}">
                    <h4>Hover State Card</h4>
                    <p class="text-secondary">This shows the hover surface color.</p>
                </div>
            </div>
        </section>`;
  }

  private static generateBasicComponents(theme: ThemeConfig): string {
    return `
        <!-- Basic Components Section -->
        <section class="section">
            <h2 class="section-title">Basic Components</h2>

            <h3>Buttons</h3>
            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
                <button class="button button-primary">Primary</button>
                <button class="button button-secondary">Secondary</button>
                <button class="button button-outline">Outline</button>
            </div>

            <h3>Form Elements</h3>
            <div style="max-width: 400px;">
                <input type="text" class="input" placeholder="Sample input" style="margin-bottom: 16px;">
                <button class="button button-primary" style="width: 100%;">Submit</button>
            </div>
        </section>`;
  }

  private static generateSpacing(theme: ThemeConfig): string {
    // Pre-calculate spacing styles
    const xsmallStyle = `width: ${theme.spacingXSmall || 4}px; height: ${theme.spacingXSmall || 4}px;`;
    const smallStyle = `width: ${theme.spacingSmall || 8}px; height: ${theme.spacingSmall || 8}px;`;
    const mediumStyle = `width: ${theme.spacingMedium || 16}px; height: ${theme.spacingMedium || 16}px;`;
    const largeStyle = `width: ${theme.spacingLarge || 24}px; height: ${theme.spacingLarge || 24}px;`;
    const xlargeStyle = `width: ${theme.spacingXLarge || 32}px; height: ${theme.spacingXLarge || 32}px;`;

    return `
        <!-- Spacing Section -->
        <section class="section">
            <h2 class="section-title">Spacing System</h2>

            <div class="spacing-demo">
                <div class="spacing-box" style="${xsmallStyle}">${theme.spacingXSmall || 4}px</div>
                <div class="spacing-box" style="${smallStyle}">${theme.spacingSmall || 8}px</div>
                <div class="spacing-box" style="${mediumStyle}">${theme.spacingMedium || 16}px</div>
                <div class="spacing-box" style="${largeStyle}">${theme.spacingLarge || 24}px</div>
                <div class="spacing-box" style="${xlargeStyle}">${theme.spacingXLarge || 32}px</div>
            </div>
        </section>`;
  }
  private static generateShadows(theme: ThemeConfig): string {
    if (!theme.enableShadows) return '';

    return `
        <!-- Shadows Section -->
        <section class="section">
            <h2 class="section-title">Shadow Effects</h2>

            <div class="shadow-demo">
                <div class="shadow-box" style="box-shadow: ${theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)'};">
                    <h5>Small Shadow</h5>
                    <p class="text-small text-secondary">0 1px 3px</p>
                </div>
                <div class="shadow-box" style="box-shadow: ${theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)'};">
                    <h5>Medium Shadow</h5>
                    <p class="text-small text-secondary">0 4px 6px</p>
                </div>
                <div class="shadow-box" style="box-shadow: ${theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)'};">
                    <h5>Large Shadow</h5>
                    <p class="text-small text-secondary">0 10px 15px</p>
                </div>
                ${theme.shadowInset ? `
                <div class="shadow-box" style="box-shadow: ${theme.shadowInset};">
                    <h5>Inset Shadow</h5>
                    <p class="text-small text-secondary">inset 0 2px 4px</p>
                </div>` : ''}
            </div>
        </section>`;
  }

  private static generateBorders(theme: ThemeConfig): string {
    // Pre-calculate border radius values
    const smallRadius = `border-radius: ${theme.borderRadiusSmall || 8}px;`;
    const mediumRadius = `border-radius: ${theme.borderRadiusMedium || 12}px;`;
    const largeRadius = `border-radius: ${theme.borderRadiusLarge || 16}px;`;
    const circleRadius = `border-radius: ${theme.borderRadiusCircle || 9999}px; text-align: center;`;

    return `
        <!-- Border Radius Section -->
        <section class="section">
            <h2 class="section-title">Border Radius</h2>

            <div class="grid-4">
                <div class="card" style="${smallRadius}">
                    <h5>Small Radius</h5>
                    <p class="text-secondary">${theme.borderRadiusSmall || 8}px</p>
                </div>
                <div class="card" style="${mediumRadius}">
                    <h5>Medium Radius</h5>
                    <p class="text-secondary">${theme.borderRadiusMedium || 12}px</p>
                </div>
                <div class="card" style="${largeRadius}">
                    <h5>Large Radius</h5>
                    <p class="text-secondary">${theme.borderRadiusLarge || 16}px</p>
                </div>
                <div class="card" style="${circleRadius}">
                    <h5>Circle</h5>
                    <p class="text-secondary">${theme.borderRadiusCircle || 9999}px</p>
                </div>
            </div>
        </section>`;
  }

  private static generateAnimations(theme: ThemeConfig): string {
    return `
        <!-- Animations Section -->
        <section class="section">
            <h2 class="section-title">Animations</h2>

            <div style="display: flex; gap: 24px;">
                <div class="card animated fade-in">
                    <h5>Fade In</h5>
                    <p class="text-secondary">Duration: ${theme.animationSpeed || 300}ms</p>
                </div>
                <div class="card animated slide-in">
                    <h5>Slide In</h5>
                    <p class="text-secondary">Easing: ${theme.animationEasing || 'ease-out'}</p>
                </div>
            </div>
        </section>`;
  }

  private static generateFooter(theme: ThemeConfig): string {
    const date = new Date().toLocaleDateString();
    return `
        <!-- Footer -->
        <footer class="section" style="text-align: center;">
            <p class="text-secondary">
                ${theme.brandName || 'Theme'} Showcase • Generated on ${date}
            </p>
        </footer>`;
  }
}
