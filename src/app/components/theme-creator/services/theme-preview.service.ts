// src/app/components/theme-creator/services/theme-preview.service.ts (FULL FILE)
import { Injectable } from '@angular/core';
import { ThemeConfig } from '../../../models/theme.model';

@Injectable()
export class ThemePreviewService {
  private readonly CSS_PREFIX = '--theme';

  applyThemeToPreview(root: HTMLElement, theme: ThemeConfig): void {
    if (!root) return;

    // Apply ALL theme properties as CSS variables
    this.applyCoreColors(root, theme);
    this.applySemanticColors(root, theme);
    this.applySurfaceColors(root, theme);
    this.applyTypography(root, theme);
    this.applySpacingAndLayout(root, theme);
    this.applyBorders(root, theme);
    this.applyEffects(root, theme);
    this.applyAnimation(root, theme);
    this.applyComponentSpecific(root, theme);
    this.applyGradients(root, theme);
    this.applyZIndexLayers(root, theme);
    this.applyGridSystem(root, theme);
    this.applyDesignAttributes(root, theme);
    this.applyPerformanceSettings(root, theme);
    this.applyAccessibilitySettings(root, theme);
    this.applyDesignStyleClasses(root, theme);
  }

  private applyCoreColors(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-primary`, theme.primaryColor);
    root.style.setProperty(`${this.CSS_PREFIX}-primary-light`, theme.primaryLightColor || '#5FD3C4');
    root.style.setProperty(`${this.CSS_PREFIX}-primary-dark`, theme.primaryDarkColor || '#2BA99B');
    root.style.setProperty(`${this.CSS_PREFIX}-secondary`, theme.secondaryColor);
    root.style.setProperty(`${this.CSS_PREFIX}-secondary-light`, theme.secondaryLightColor || '#34C5AA');
    root.style.setProperty(`${this.CSS_PREFIX}-secondary-dark`, theme.secondaryDarkColor || '#238A7F');
    root.style.setProperty(`${this.CSS_PREFIX}-background`, theme.backgroundColor);
    root.style.setProperty(`${this.CSS_PREFIX}-background-paper`, theme.backgroundPaperColor || '#FFFFFF');
    root.style.setProperty(`${this.CSS_PREFIX}-background-default`, theme.backgroundDefaultColor || '#F8FAFB');
    root.style.setProperty(`${this.CSS_PREFIX}-text`, theme.textColor);
    root.style.setProperty(`${this.CSS_PREFIX}-text-secondary`, theme.textSecondaryColor || '#6B7280');
    root.style.setProperty(`${this.CSS_PREFIX}-text-disabled`, theme.textDisabledColor || '#9CA3AF');
    root.style.setProperty(`${this.CSS_PREFIX}-text-hint`, theme.textHintColor || '#D1D5DB');
    root.style.setProperty(`${this.CSS_PREFIX}-accent`, theme.accentColor);
    root.style.setProperty(`${this.CSS_PREFIX}-accent-light`, theme.accentLightColor || '#A8E8DD');
    root.style.setProperty(`${this.CSS_PREFIX}-accent-dark`, theme.accentDarkColor || '#34C5AA');
  }

  private applySemanticColors(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-success`, theme.successColor);
    root.style.setProperty(`${this.CSS_PREFIX}-success-light`, theme.successLightColor || '#86EFAC');
    root.style.setProperty(`${this.CSS_PREFIX}-success-dark`, theme.successDarkColor || '#16A34A');
    root.style.setProperty(`${this.CSS_PREFIX}-warning`, theme.warningColor);
    root.style.setProperty(`${this.CSS_PREFIX}-warning-light`, theme.warningLightColor || '#FCD34D');
    root.style.setProperty(`${this.CSS_PREFIX}-warning-dark`, theme.warningDarkColor || '#D97706');
    root.style.setProperty(`${this.CSS_PREFIX}-error`, theme.errorColor);
    root.style.setProperty(`${this.CSS_PREFIX}-error-light`, theme.errorLightColor || '#FCA5A5');
    root.style.setProperty(`${this.CSS_PREFIX}-error-dark`, theme.errorDarkColor || '#DC2626');
    root.style.setProperty(`${this.CSS_PREFIX}-info`, theme.infoColor);
    root.style.setProperty(`${this.CSS_PREFIX}-info-light`, theme.infoLightColor || '#93BBFE');
    root.style.setProperty(`${this.CSS_PREFIX}-info-dark`, theme.infoDarkColor || '#2563EB');
  }

  private applySurfaceColors(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-surface-card`, theme.surfaceCard || '#FFFFFF');
    root.style.setProperty(`${this.CSS_PREFIX}-surface-modal`, theme.surfaceModal || '#FFFFFF');
    root.style.setProperty(`${this.CSS_PREFIX}-surface-hover`, theme.surfaceHover || 'rgba(196, 247, 239, 0.3)');
    root.style.setProperty(`${this.CSS_PREFIX}-surface-focus`, theme.surfaceFocus || 'rgba(52, 197, 170, 0.12)');
    root.style.setProperty(`${this.CSS_PREFIX}-surface-selected`, theme.surfaceSelected || 'rgba(52, 197, 170, 0.08)');
    root.style.setProperty(`${this.CSS_PREFIX}-surface-disabled`, theme.surfaceDisabled || 'rgba(0, 0, 0, 0.04)');
    root.style.setProperty(`${this.CSS_PREFIX}-divider`, theme.dividerColor || 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty(`${this.CSS_PREFIX}-overlay`, theme.overlayColor || 'rgba(0, 0, 0, 0.5)');
  }

  private applyTypography(root: HTMLElement, theme: ThemeConfig): void {
    // Font family
    root.style.setProperty(`${this.CSS_PREFIX}-font-family`, theme.fontFamily);

    // Base font size
    root.style.setProperty(`${this.CSS_PREFIX}-font-size`, `${theme.fontSizeBase}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-base`, `${theme.fontSizeBase}px`);

    // Font size variants with defaults
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-small`, `${theme.fontSizeSmall || 14}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-medium`, `${theme.fontSizeMedium || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-large`, `${theme.fontSizeLarge || 18}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-xlarge`, `${theme.fontSizeXLarge || 20}px`);

    // Font weights
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight`, (theme.fontWeight || 400).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-light`, (theme.fontWeightLight || 300).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-medium`, (theme.fontWeightMedium || 500).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-bold`, (theme.fontWeightBold || 700).toString());

    // Line heights
    root.style.setProperty(`${this.CSS_PREFIX}-line-height`, (theme.lineHeight || 1.5).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-line-height-tight`, (theme.lineHeightTight || 1.25).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-line-height-relaxed`, (theme.lineHeightRelaxed || 1.75).toString());

    // Text scaling
    root.style.setProperty(`${this.CSS_PREFIX}-text-scale`, (theme.textScaling || 1).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-text-scaling`, (theme.textScaling || 1).toString());

    // Letter spacing - fix the undefined issue
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing`, `${theme.letterSpacing || 0}em`);
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing-tight`, `${theme.letterSpacingTight || -0.025}em`);
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing-wide`, `${theme.letterSpacingWide || 0.025}em`);

    // Heading typography - add null checks
    root.style.setProperty(`${this.CSS_PREFIX}-heading-weight`, (theme.headingFontWeight || 700).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font-weight`, (theme.headingFontWeight || 700).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font`, theme.headingFontFamily);
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font-family`, theme.headingFontFamily);

    // Heading sizes with defaults
    root.style.setProperty(`${this.CSS_PREFIX}-h1-size`, `${theme.h1Size || 40}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h2-size`, `${theme.h2Size || 32}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h3-size`, `${theme.h3Size || 28}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h4-size`, `${theme.h4Size || 24}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h5-size`, `${theme.h5Size || 20}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h6-size`, `${theme.h6Size || 18}px`);
  }

  private applySpacingAndLayout(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-spacing`, `${theme.spacingUnit}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-unit`, `${theme.spacingUnit}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-xsmall`, `${theme.spacingXSmall || 4}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-small`, `${theme.spacingSmall || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-medium`, `${theme.spacingMedium || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-large`, `${theme.spacingLarge || 24}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-xlarge`, `${theme.spacingXLarge || 32}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-container-max`, `${theme.containerMaxWidth || 1200}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-sidebar-width`, `${theme.sidebarWidth || 240}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-sidebar-collapsed`, `${theme.sidebarCollapsedWidth || 64}px`);
  }

  private applyBorders(root: HTMLElement, theme: ThemeConfig): void {
    // Border radius - all sizes
    root.style.setProperty(`${this.CSS_PREFIX}-radius`, `${theme.borderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-small`, `${theme.borderRadiusSmall || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-medium`, `${theme.borderRadiusMedium || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-large`, `${theme.borderRadiusLarge || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-circle`, `${theme.borderRadiusCircle || 9999}px`);

    // Also set specific border radius properties
    root.style.setProperty(`${this.CSS_PREFIX}-border-radius`, `${theme.borderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-radius-small`, `${theme.borderRadiusSmall || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-radius-medium`, `${theme.borderRadiusMedium || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-radius-large`, `${theme.borderRadiusLarge || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-radius-circle`, `${theme.borderRadiusCircle || 9999}px`);

    // Border width and style
    root.style.setProperty(`${this.CSS_PREFIX}-border-width`, `${theme.borderWidth}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-style`, theme.borderStyle || 'solid');

    // Border colors
    root.style.setProperty(`${this.CSS_PREFIX}-border-color`, theme.borderColor);
    root.style.setProperty(`${this.CSS_PREFIX}-border-focus`, theme.borderFocusColor);
    root.style.setProperty(`${this.CSS_PREFIX}-border-hover`, theme.borderHoverColor);
  }

  private applyEffects(root: HTMLElement, theme: ThemeConfig): void {
    // Shadow properties
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-intensity`, (theme.shadowIntensity || 0.12).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-color`, theme.shadowColor || 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-small`, theme.shadowSmall || '0 1px 3px rgba(0, 0, 0, 0.06)');
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-medium`, theme.shadowMedium || '0 4px 6px rgba(0, 0, 0, 0.08)');
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-large`, theme.shadowLarge || '0 10px 15px rgba(0, 0, 0, 0.1)');
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-inset`, theme.shadowInset || 'inset 0 2px 4px rgba(0, 0, 0, 0.05)');

    // Blur properties
    root.style.setProperty(`${this.CSS_PREFIX}-blur`, `${theme.blurIntensity || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-intensity`, `${theme.blurIntensity || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-small`, `${theme.blurSmall || 4}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-medium`, `${theme.blurMedium || 10}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-large`, `${theme.blurLarge || 20}px`);
  }

  private applyAnimation(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-duration`, `${theme.animationSpeed}ms`);
    root.style.setProperty(`${this.CSS_PREFIX}-duration-slow`, `${theme.animationSpeedSlow}ms`);
    root.style.setProperty(`${this.CSS_PREFIX}-duration-fast`, `${theme.animationSpeedFast}ms`);
    root.style.setProperty(`${this.CSS_PREFIX}-easing`, theme.animationEasing);
    root.style.setProperty(`${this.CSS_PREFIX}-easing-in`, theme.animationEasingIn);
    root.style.setProperty(`${this.CSS_PREFIX}-easing-out`, theme.animationEasingOut);
    root.style.setProperty(`${this.CSS_PREFIX}-easing-in-out`, theme.animationEasingInOut);
  }

  private applyComponentSpecific(root: HTMLElement, theme: ThemeConfig): void {
    // Button properties - ALL OF THEM
    root.style.setProperty(`${this.CSS_PREFIX}-button-height`, `${theme.buttonHeight || 40}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-padding-x`, `${theme.buttonPaddingX || 24}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-padding-y`, `${theme.buttonPaddingY || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-font-size`, `${theme.buttonFontSize || 14}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-font-weight`, (theme.buttonFontWeight || 600).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-button-radius`, `${theme.buttonBorderRadius || theme.borderRadiusSmall || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-border-radius`, `${theme.buttonBorderRadius || theme.borderRadiusSmall || 8}px`);

    // Input properties - ALL OF THEM
    root.style.setProperty(`${this.CSS_PREFIX}-input-height`, `${theme.inputHeight || 44}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-padding-x`, `${theme.inputPaddingX || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-padding-y`, `${theme.inputPaddingY || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-font-size`, `${theme.inputFontSize || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-radius`, `${theme.inputBorderRadius || theme.borderRadiusSmall || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-border-radius`, `${theme.inputBorderRadius || theme.borderRadiusSmall || 8}px`);

    // Card properties - ALL OF THEM
    root.style.setProperty(`${this.CSS_PREFIX}-card-padding`, `${theme.cardPadding || 24}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-radius`, `${theme.cardBorderRadius || theme.borderRadius || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-border-radius`, `${theme.cardBorderRadius || theme.borderRadius || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-elevation`, (theme.cardElevation || 1).toString());

    // Modal properties - ALL OF THEM
    root.style.setProperty(`${this.CSS_PREFIX}-modal-radius`, `${theme.modalBorderRadius || theme.borderRadiusLarge || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-modal-border-radius`, `${theme.modalBorderRadius || theme.borderRadiusLarge || 16}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-modal-padding`, `${theme.modalPadding || 32}px`);

    // Tooltip properties - ALL OF THEM
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-font-size`, `${theme.tooltipFontSize || 12}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-padding`, `${theme.tooltipPadding || 8}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-radius`, `${theme.tooltipBorderRadius || 4}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-border-radius`, `${theme.tooltipBorderRadius || 4}px`);
  }

  private applyGradients(root: HTMLElement, theme: ThemeConfig): void {
    if (theme.enableGradients) {
      root.style.setProperty(`${this.CSS_PREFIX}-gradient-primary`, theme.primaryGradient);
      root.style.setProperty(`${this.CSS_PREFIX}-gradient-secondary`, theme.secondaryGradient);
      root.style.setProperty(`${this.CSS_PREFIX}-gradient-accent`, theme.accentGradient);
      root.style.setProperty(`${this.CSS_PREFIX}-gradient-background`, theme.backgroundGradient);
      root.style.setProperty(`${this.CSS_PREFIX}-gradient-angle`, `${theme.gradientAngle}deg`);
    }
  }

  private applyZIndexLayers(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-z-dropdown`, (theme.zIndexDropdown || 1000).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-modal`, (theme.zIndexModal || 1050).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-popover`, (theme.zIndexPopover || 1060).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-tooltip`, (theme.zIndexTooltip || 1070).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-header`, (theme.zIndexHeader || 1030).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-drawer`, (theme.zIndexDrawer || 1040).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-overlay`, (theme.zIndexOverlay || 1020).toString());
  }

  private applyGridSystem(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-grid-columns`, (theme.gridColumns || 12).toString());
    root.style.setProperty(`${this.CSS_PREFIX}-grid-gutter`, `${theme.gridGutter || 24}px`);
  }

  private applyDesignAttributes(root: HTMLElement, theme: ThemeConfig): void {
    root.setAttribute('data-theme-style', theme.designStyle);
    root.setAttribute('data-theme-mode', theme.mode);
    root.setAttribute('data-navigation-style', theme.navigationStyle);
    root.setAttribute('data-card-style', theme.cardStyle);
    root.setAttribute('data-button-style', theme.buttonStyle);
    root.setAttribute('data-icon-style', theme.iconStyle);
    root.setAttribute('data-density', theme.density);
    root.setAttribute('data-layout-type', theme.layoutType);
  }

  private applyPerformanceSettings(root: HTMLElement, theme: ThemeConfig): void {
    if (!theme.enableAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

    if (!theme.enableShadows) {
      root.classList.add('no-shadows');
    } else {
      root.classList.remove('no-shadows');
    }

    if (!theme.enableBlur) {
      root.classList.add('no-blur');
    } else {
      root.classList.remove('no-blur');
    }
  }

  private applyAccessibilitySettings(root: HTMLElement, theme: ThemeConfig): void {
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
  }

  private applyDesignStyleClasses(root: HTMLElement, theme: ThemeConfig): void {
    // Remove all design style classes
    root.classList.remove('style-modern', 'style-minimal', 'style-glassmorphic', 'style-neumorphic', 'style-material', 'style-flat', 'style-gradient');

    // Add current design style class
    root.classList.add(`style-${theme.designStyle}`);

    // Apply navigation style
    root.classList.remove('nav-elevated', 'nav-flat', 'nav-bordered', 'nav-transparent', 'nav-gradient');
    root.classList.add(`nav-${theme.navigationStyle}`);

    // Apply card style
    root.classList.remove('card-elevated', 'card-flat', 'card-bordered', 'card-glass', 'card-gradient', 'card-neumorphic');
    root.classList.add(`card-${theme.cardStyle}`);

    // Apply button style
    root.classList.remove('btn-primary', 'btn-secondary', 'btn-outline', 'btn-ghost', 'btn-gradient', 'btn-glow', 'btn-neumorphic');
    root.classList.add(`btn-${theme.buttonStyle}`);

    // Apply density
    root.classList.remove('density-comfortable', 'density-compact', 'density-spacious');
    root.classList.add(`density-${theme.density}`);
  }
}
