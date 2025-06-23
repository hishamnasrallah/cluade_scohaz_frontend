// src/app/components/theme-creator/services/theme-preview.service.ts
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

    // Font size variants
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-small`, `${theme.fontSizeSmall}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-medium`, `${theme.fontSizeMedium}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-large`, `${theme.fontSizeLarge}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-font-size-xlarge`, `${theme.fontSizeXLarge}px`);

    // Font weights
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight`, theme.fontWeight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-light`, theme.fontWeightLight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-medium`, theme.fontWeightMedium.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-font-weight-bold`, theme.fontWeightBold.toString());

    // Line heights
    root.style.setProperty(`${this.CSS_PREFIX}-line-height`, theme.lineHeight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-line-height-tight`, theme.lineHeightTight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-line-height-relaxed`, theme.lineHeightRelaxed.toString());

    // Letter spacing
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing`, `${theme.letterSpacing}em`);
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing-tight`, `${theme.letterSpacingTight}em`);
    root.style.setProperty(`${this.CSS_PREFIX}-letter-spacing-wide`, `${theme.letterSpacingWide}em`);

    // Heading typography
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font`, theme.headingFontFamily);
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font-family`, theme.headingFontFamily);
    root.style.setProperty(`${this.CSS_PREFIX}-heading-weight`, theme.headingFontWeight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-heading-font-weight`, theme.headingFontWeight.toString());

    // Heading sizes
    root.style.setProperty(`${this.CSS_PREFIX}-h1-size`, `${theme.h1Size}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h2-size`, `${theme.h2Size}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h3-size`, `${theme.h3Size}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h4-size`, `${theme.h4Size}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h5-size`, `${theme.h5Size}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-h6-size`, `${theme.h6Size}px`);

    // Text scaling
    root.style.setProperty(`${this.CSS_PREFIX}-text-scale`, theme.textScaling.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-text-scaling`, theme.textScaling.toString());
  }

  private applySpacingAndLayout(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-spacing`, `${theme.spacingUnit}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-unit`, `${theme.spacingUnit}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-xsmall`, `${theme.spacingXSmall}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-small`, `${theme.spacingSmall}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-medium`, `${theme.spacingMedium}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-large`, `${theme.spacingLarge}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-spacing-xlarge`, `${theme.spacingXLarge}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-container-max`, `${theme.containerMaxWidth}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-sidebar-width`, `${theme.sidebarWidth}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-sidebar-collapsed`, `${theme.sidebarCollapsedWidth}px`);
  }

  private applyBorders(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-radius`, `${theme.borderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-small`, `${theme.borderRadiusSmall}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-medium`, `${theme.borderRadiusMedium}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-large`, `${theme.borderRadiusLarge}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-radius-circle`, `${theme.borderRadiusCircle}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-width`, `${theme.borderWidth}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-border-style`, theme.borderStyle);
    root.style.setProperty(`${this.CSS_PREFIX}-border-color`, theme.borderColor);
    root.style.setProperty(`${this.CSS_PREFIX}-border-focus`, theme.borderFocusColor);
    root.style.setProperty(`${this.CSS_PREFIX}-border-hover`, theme.borderHoverColor);
  }

  private applyEffects(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-intensity`, theme.shadowIntensity.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-color`, theme.shadowColor);
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-small`, theme.shadowSmall);
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-medium`, theme.shadowMedium);
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-large`, theme.shadowLarge);
    root.style.setProperty(`${this.CSS_PREFIX}-shadow-inset`, theme.shadowInset);
    root.style.setProperty(`${this.CSS_PREFIX}-blur`, `${theme.blurIntensity}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-small`, `${theme.blurSmall}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-medium`, `${theme.blurMedium}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-blur-large`, `${theme.blurLarge}px`);
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
    root.style.setProperty(`${this.CSS_PREFIX}-button-height`, `${theme.buttonHeight}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-padding-x`, `${theme.buttonPaddingX}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-padding-y`, `${theme.buttonPaddingY}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-font-size`, `${theme.buttonFontSize}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-button-font-weight`, theme.buttonFontWeight.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-button-radius`, `${theme.buttonBorderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-height`, `${theme.inputHeight}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-padding-x`, `${theme.inputPaddingX}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-padding-y`, `${theme.inputPaddingY}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-font-size`, `${theme.inputFontSize}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-input-radius`, `${theme.inputBorderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-padding`, `${theme.cardPadding}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-radius`, `${theme.cardBorderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-card-elevation`, theme.cardElevation.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-modal-radius`, `${theme.modalBorderRadius}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-modal-padding`, `${theme.modalPadding}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-font-size`, `${theme.tooltipFontSize}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-padding`, `${theme.tooltipPadding}px`);
    root.style.setProperty(`${this.CSS_PREFIX}-tooltip-radius`, `${theme.tooltipBorderRadius}px`);
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
    root.style.setProperty(`${this.CSS_PREFIX}-z-dropdown`, theme.zIndexDropdown.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-modal`, theme.zIndexModal.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-popover`, theme.zIndexPopover.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-tooltip`, theme.zIndexTooltip.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-header`, theme.zIndexHeader.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-drawer`, theme.zIndexDrawer.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-z-overlay`, theme.zIndexOverlay.toString());
  }

  private applyGridSystem(root: HTMLElement, theme: ThemeConfig): void {
    root.style.setProperty(`${this.CSS_PREFIX}-grid-columns`, theme.gridColumns.toString());
    root.style.setProperty(`${this.CSS_PREFIX}-grid-gutter`, `${theme.gridGutter}px`);
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
