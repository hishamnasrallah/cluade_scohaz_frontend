// src/app/components/theme-creator/theme-creator.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Theme Control Components - ALL COMPONENTS IMPORTED
import { ColorPickerComponent } from '../theme-controls/color-picker/color-picker.component';
import { TypographyControlsComponent } from '../theme-controls/typography-controls/typography-controls.component';
import { SpacingControlsComponent } from '../theme-controls/spacing-controls/spacing-controls.component';
import { EffectsControlsComponent } from '../theme-controls/effects-controls/effects-controls.component';
import { AdvancedColorControlsComponent } from '../theme-controls/advanced-color-controls/advanced-color-controls.component';
import { AdvancedTypographyControlsComponent } from '../theme-controls/advanced-typography-controls/advanced-typography-controls.component';
import { BorderControlsComponent } from '../theme-controls/border-controls/border-controls.component';
import { LayoutControlsComponent } from '../theme-controls/layout-controls/layout-controls.component';
import { ShadowControlsComponent } from '../theme-controls/shadow-controls/shadow-controls.component';
import { ComponentControlsComponent } from '../theme-controls/component-controls/component-controls.component';
import { AnimationControlsComponent } from '../theme-controls/animation-controls/animation-controls.component';
import { BrandControlsComponent } from '../theme-controls/brand-controls/brand-controls.component';
import { AccessibilityControlsComponent } from '../theme-controls/accessibility-controls/accessibility-controls.component';

// Services and Models
import { ThemeService } from '../../services/theme.service';
import {ThemeConfig, ThemeDefaults, ThemePreset} from '../../models/theme.model';

@Component({
  selector: 'app-theme-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    // ALL Theme Control Components
    // ColorPickerComponent,
    // TypographyControlsComponent,
    // SpacingControlsComponent,
    // EffectsControlsComponent,
    AdvancedColorControlsComponent,
    AdvancedTypographyControlsComponent,
    BorderControlsComponent,
    LayoutControlsComponent,
    ShadowControlsComponent,
    ComponentControlsComponent,
    AnimationControlsComponent,
    BrandControlsComponent,
    AccessibilityControlsComponent
  ],
  templateUrl: './theme-creator.component.html',
  styleUrls: ['./theme-creator.component.scss']
})
export class ThemeCreatorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('previewContainer', { read: ElementRef }) previewContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private previewRoot!: HTMLElement;
  private themeChangeSubject = new Subject<Partial<ThemeConfig>>();

  // Current theme configuration
  currentTheme!: ThemeConfig;
  // Form group for theme controls
  themeForm!: FormGroup;

  // UI State
  selectedTabIndex = 0;
  isPreviewExpanded = false;
  isSaving = false;
  showAdvancedSettings = false;

  // Theme presets
  themePresets: ThemePreset[] = [
    {
      id: 'ocean-mint',
      name: 'Ocean Mint',
      icon: '🌊',
      config: {
        primaryColor: '#34C5AA',
        secondaryColor: '#2BA99B',
        backgroundColor: '#F4FDFD',
        textColor: '#2F4858',
        accentColor: '#5FD3C4',
        successColor: '#22C55E',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
        surfaceCard: '#FFFFFF',
        surfaceModal: '#FFFFFF',
        surfaceHover: 'rgba(196, 247, 239, 0.3)',
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFontFamily: 'Poppins, sans-serif',
        designStyle: 'modern',
        borderRadius: 12,
        shadowIntensity: 0.1
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      icon: '✨',
      config: {
        primaryColor: '#3B82F6',
        secondaryColor: '#64748B',
        backgroundColor: '#FFFFFF',
        textColor: '#0F172A',
        accentColor: '#F59E0B',
        surfaceCard: '#FFFFFF',
        surfaceModal: '#FFFFFF',
        surfaceHover: 'rgba(59, 130, 246, 0.05)',
        designStyle: 'modern',
        borderRadius: 8,
        shadowIntensity: 0.1
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      icon: '⚡',
      config: {
        primaryColor: '#000000',
        secondaryColor: '#6B7280',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        accentColor: '#374151',
        surfaceCard: '#FFFFFF',
        surfaceModal: '#FFFFFF',
        surfaceHover: 'rgba(0, 0, 0, 0.02)',
        designStyle: 'minimal',
        borderRadius: 0,
        shadowIntensity: 0,
        borderWidth: 1
      }
    },
    {
      id: 'glassmorphic',
      name: 'Glass',
      icon: '🔮',
      config: {
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        backgroundColor: '#F8FAFC',
        textColor: '#1E293B',
        accentColor: '#EC4899',
        surfaceCard: 'rgba(255, 255, 255, 0.7)',
        surfaceModal: 'rgba(255, 255, 255, 0.8)',
        surfaceHover: 'rgba(59, 130, 246, 0.1)',
        designStyle: 'glassmorphic',
        borderRadius: 16,
        shadowIntensity: 0.2,
        blurIntensity: 20,
        enableBlur: true
      }
    },
    {
      id: 'neumorphic',
      name: 'Neuro',
      icon: '🎭',
      config: {
        primaryColor: '#6366F1',
        secondaryColor: '#8B5CF6',
        backgroundColor: '#E5E7EB',
        textColor: '#1F2937',
        accentColor: '#A78BFA',
        surfaceCard: '#E5E7EB',
        surfaceModal: '#E5E7EB',
        surfaceHover: 'rgba(99, 102, 241, 0.05)',
        designStyle: 'neumorphic',
        borderRadius: 20,
        shadowIntensity: 0.15
      }
    },
    {
      id: 'corporate',
      name: 'Corporate',
      icon: '🏢',
      config: {
        primaryColor: '#1E40AF',
        secondaryColor: '#475569',
        backgroundColor: '#FFFFFF',
        textColor: '#0F172A',
        accentColor: '#3730A3',
        surfaceCard: '#FFFFFF',
        surfaceModal: '#FFFFFF',
        surfaceHover: 'rgba(30, 64, 175, 0.04)',
        fontFamily: 'system-ui, sans-serif',
        headingFontFamily: 'system-ui, sans-serif',
        designStyle: 'modern',
        borderRadius: 4,
        spacingUnit: 20
      }
    },
    {
      id: 'creative',
      name: 'Creative',
      icon: '🎨',
      config: {
        primaryColor: '#F59E0B',
        secondaryColor: '#EF4444',
        backgroundColor: '#FEF3C7',
        textColor: '#78350F',
        accentColor: '#DC2626',
        surfaceCard: '#FFFBEB',
        surfaceModal: '#FFFBEB',
        surfaceHover: 'rgba(245, 158, 11, 0.1)',
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFontFamily: 'Poppins, sans-serif',
        designStyle: 'modern',
        borderRadius: 16,
        spacingUnit: 24
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: '🌙',
      config: {
        primaryColor: '#60A5FA',
        secondaryColor: '#A78BFA',
        backgroundColor: '#0F172A',
        textColor: '#F8FAFC',
        accentColor: '#F472B6',
        surfaceCard: '#1E293B',
        surfaceModal: '#1E293B',
        surfaceHover: 'rgba(96, 165, 250, 0.1)',
        mode: 'dark',
        designStyle: 'modern',
        borderRadius: 12,
        shadowIntensity: 0.2
      }
    }
  ];

  // Preview data
  sampleMetrics = [
    { title: 'Revenue', value: '$124,590', change: '+12.5%', icon: 'attach_money', trend: 'up' },
    { title: 'Users', value: '8,429', change: '+5.2%', icon: 'people', trend: 'up' },
    { title: 'Orders', value: '1,245', change: '-2.1%', icon: 'shopping_cart', trend: 'down' },
    { title: 'Conversion', value: '3.2%', change: '+0.8%', icon: 'trending_up', trend: 'up' }
  ];

  navigationItems = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Profile'];

  navigationStyles = [
    { value: 'elevated', label: 'Elevated' },
    { value: 'flat', label: 'Flat' },
    { value: 'bordered', label: 'Bordered' },
    { value: 'transparent', label: 'Transparent' },
    { value: 'gradient', label: 'Gradient' }
  ];

  buttonStyles = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'outline', label: 'Outline' },
    { value: 'ghost', label: 'Ghost' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'glow', label: 'Glow' },
    { value: 'neumorphic', label: 'Neumorphic' }
  ];

  enterpriseFeatures = [
    {
      title: 'Advanced Theming',
      description: 'Comprehensive design system with 100+ theme properties',
      icon: 'palette'
    },
    {
      title: 'Real-time Updates',
      description: 'Live theme changes without page refreshes',
      icon: 'update'
    },
    {
      title: 'Accessibility First',
      description: 'WCAG 2.1 compliant with reduced motion support',
      icon: 'accessibility_new'
    },
    {
      title: 'Performance Optimized',
      description: 'GPU-accelerated animations and minimal reflows',
      icon: 'speed'
    },
    {
      title: 'Modern Design Trends',
      description: 'Glassmorphism, neumorphism, and more',
      icon: 'auto_awesome'
    },
    {
      title: 'Enterprise Ready',
      description: 'Multi-brand support and theme hierarchies',
      icon: 'business'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.currentTheme = this.getDefaultTheme(); // Add this line
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load current theme from service
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if (theme) {
          this.currentTheme = { ...theme };
          this.updateFormValues(theme);
        }
      });

    // Subscribe to theme changes with debounce
    this.themeChangeSubject
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(changes => {
        this.applyThemeToPreview(this.currentTheme);
      });
  }

  ngAfterViewInit(): void {
    // Initialize preview container
    if (this.previewContainer) {
      this.previewRoot = this.previewContainer.nativeElement;
      // Apply initial theme to preview
      setTimeout(() => {
        this.applyThemeToPreview(this.currentTheme);
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    // Create comprehensive form with ALL theme properties
    this.themeForm = this.fb.group({
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

    // Subscribe to form changes
    this.themeForm.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.currentTheme = { ...this.currentTheme, ...values };
        this.themeChangeSubject.next(values);
      });
  }

  private updateFormValues(theme: Partial<ThemeConfig>): void {
    this.themeForm.patchValue(theme, { emitEvent: false });
  }

  private getDefaultTheme(): ThemeConfig {
    // Load from existing project styles or use defaults
    const savedTheme = this.themeService.getTheme();
    return savedTheme || { ...ThemeDefaults.DEFAULT_THEME };
  }

  applyPreset(preset: ThemePreset): void {
    this.currentTheme = { ...this.currentTheme, ...preset.config };
    this.updateFormValues(this.currentTheme);
    this.applyThemeToPreview(this.currentTheme);

    this.snackBar.open(`Applied ${preset.name} preset`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private applyThemeToPreview(theme: ThemeConfig): void {
    if (!this.previewRoot) return;

    // Apply CSS variables only to preview container
    const root = this.previewRoot;

    // Apply ALL theme properties as CSS variables
    // Core colors - ALL variants with fallbacks
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-primary-light', theme.primaryLightColor || '#5FD3C4');
    root.style.setProperty('--theme-primary-dark', theme.primaryDarkColor || '#2BA99B');
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-secondary-light', theme.secondaryLightColor || '#34C5AA');
    root.style.setProperty('--theme-secondary-dark', theme.secondaryDarkColor || '#238A7F');
    root.style.setProperty('--theme-background', theme.backgroundColor);
    root.style.setProperty('--theme-background-paper', theme.backgroundPaperColor || '#FFFFFF');
    root.style.setProperty('--theme-background-default', theme.backgroundDefaultColor || '#F8FAFB');
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-text-secondary', theme.textSecondaryColor || '#6B7280');
    root.style.setProperty('--theme-text-disabled', theme.textDisabledColor || '#9CA3AF');
    root.style.setProperty('--theme-text-hint', theme.textHintColor || '#D1D5DB');
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-accent-light', theme.accentLightColor || '#A8E8DD');
    root.style.setProperty('--theme-accent-dark', theme.accentDarkColor || '#34C5AA');

    // Semantic colors - ALL variants
    root.style.setProperty('--theme-success', theme.successColor);
    root.style.setProperty('--theme-success-light', theme.successLightColor || '#86EFAC');
    root.style.setProperty('--theme-success-dark', theme.successDarkColor || '#16A34A');
    root.style.setProperty('--theme-warning', theme.warningColor);
    root.style.setProperty('--theme-warning-light', theme.warningLightColor || '#FCD34D');
    root.style.setProperty('--theme-warning-dark', theme.warningDarkColor || '#D97706');
    root.style.setProperty('--theme-error', theme.errorColor);
    root.style.setProperty('--theme-error-light', theme.errorLightColor || '#FCA5A5');
    root.style.setProperty('--theme-error-dark', theme.errorDarkColor || '#DC2626');
    root.style.setProperty('--theme-info', theme.infoColor);
    root.style.setProperty('--theme-info-light', theme.infoLightColor || '#93BBFE');
    root.style.setProperty('--theme-info-dark', theme.infoDarkColor || '#2563EB');

    // Surface colors - ALL variants with fallbacks
    root.style.setProperty('--theme-surface-card', theme.surfaceCard || '#FFFFFF');
    root.style.setProperty('--theme-surface-modal', theme.surfaceModal || '#FFFFFF');
    root.style.setProperty('--theme-surface-hover', theme.surfaceHover || 'rgba(196, 247, 239, 0.3)');
    root.style.setProperty('--theme-surface-focus', theme.surfaceFocus || 'rgba(52, 197, 170, 0.12)');
    root.style.setProperty('--theme-surface-selected', theme.surfaceSelected || 'rgba(52, 197, 170, 0.08)');
    root.style.setProperty('--theme-surface-disabled', theme.surfaceDisabled || 'rgba(0, 0, 0, 0.04)');
    root.style.setProperty('--theme-divider', theme.dividerColor || 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--theme-overlay', theme.overlayColor || 'rgba(0, 0, 0, 0.5)');

    // Typography
    root.style.setProperty('--theme-font-family', theme.fontFamily);
    root.style.setProperty('--theme-font-size', `${theme.fontSizeBase}px`);
    root.style.setProperty('--theme-font-size-small', `${theme.fontSizeSmall}px`);
    root.style.setProperty('--theme-font-size-medium', `${theme.fontSizeMedium}px`);
    root.style.setProperty('--theme-font-size-large', `${theme.fontSizeLarge}px`);
    root.style.setProperty('--theme-font-size-xlarge', `${theme.fontSizeXLarge}px`);
    root.style.setProperty('--theme-font-weight', theme.fontWeight.toString());
    root.style.setProperty('--theme-font-weight-light', theme.fontWeightLight.toString());
    root.style.setProperty('--theme-font-weight-medium', theme.fontWeightMedium.toString());
    root.style.setProperty('--theme-font-weight-bold', theme.fontWeightBold.toString());
    root.style.setProperty('--theme-line-height', theme.lineHeight.toString());
    root.style.setProperty('--theme-line-height-tight', theme.lineHeightTight.toString());
    root.style.setProperty('--theme-line-height-relaxed', theme.lineHeightRelaxed.toString());
    root.style.setProperty('--theme-letter-spacing', `${theme.letterSpacing}em`);
    root.style.setProperty('--theme-letter-spacing-tight', `${theme.letterSpacingTight}em`);
    root.style.setProperty('--theme-letter-spacing-wide', `${theme.letterSpacingWide}em`);
    root.style.setProperty('--theme-heading-font', theme.headingFontFamily);
    root.style.setProperty('--theme-heading-weight', theme.headingFontWeight.toString());
    root.style.setProperty('--theme-h1-size', `${theme.h1Size}px`);
    root.style.setProperty('--theme-h2-size', `${theme.h2Size}px`);
    root.style.setProperty('--theme-h3-size', `${theme.h3Size}px`);
    root.style.setProperty('--theme-h4-size', `${theme.h4Size}px`);
    root.style.setProperty('--theme-h5-size', `${theme.h5Size}px`);
    root.style.setProperty('--theme-h6-size', `${theme.h6Size}px`);

    // Spacing & Layout
    root.style.setProperty('--theme-spacing', `${theme.spacingUnit}px`);
    root.style.setProperty('--theme-spacing-xsmall', `${theme.spacingXSmall}px`);
    root.style.setProperty('--theme-spacing-small', `${theme.spacingSmall}px`);
    root.style.setProperty('--theme-spacing-medium', `${theme.spacingMedium}px`);
    root.style.setProperty('--theme-spacing-large', `${theme.spacingLarge}px`);
    root.style.setProperty('--theme-spacing-xlarge', `${theme.spacingXLarge}px`);
    root.style.setProperty('--theme-container-max', `${theme.containerMaxWidth}px`);
    root.style.setProperty('--theme-sidebar-width', `${theme.sidebarWidth}px`);
    root.style.setProperty('--theme-sidebar-collapsed', `${theme.sidebarCollapsedWidth}px`);

    // Borders
    root.style.setProperty('--theme-radius', `${theme.borderRadius}px`);
    root.style.setProperty('--theme-radius-small', `${theme.borderRadiusSmall}px`);
    root.style.setProperty('--theme-radius-medium', `${theme.borderRadiusMedium}px`);
    root.style.setProperty('--theme-radius-large', `${theme.borderRadiusLarge}px`);
    root.style.setProperty('--theme-radius-circle', `${theme.borderRadiusCircle}px`);
    root.style.setProperty('--theme-border-width', `${theme.borderWidth}px`);
    root.style.setProperty('--theme-border-style', theme.borderStyle);
    root.style.setProperty('--theme-border-color', theme.borderColor);
    root.style.setProperty('--theme-border-focus', theme.borderFocusColor);
    root.style.setProperty('--theme-border-hover', theme.borderHoverColor);

    // Effects
    root.style.setProperty('--theme-shadow-intensity', theme.shadowIntensity.toString());
    root.style.setProperty('--theme-shadow-color', theme.shadowColor);
    root.style.setProperty('--theme-shadow-small', theme.shadowSmall);
    root.style.setProperty('--theme-shadow-medium', theme.shadowMedium);
    root.style.setProperty('--theme-shadow-large', theme.shadowLarge);
    root.style.setProperty('--theme-shadow-inset', theme.shadowInset);
    root.style.setProperty('--theme-blur', `${theme.blurIntensity}px`);
    root.style.setProperty('--theme-blur-small', `${theme.blurSmall}px`);
    root.style.setProperty('--theme-blur-medium', `${theme.blurMedium}px`);
    root.style.setProperty('--theme-blur-large', `${theme.blurLarge}px`);

    // Animation
    root.style.setProperty('--theme-duration', `${theme.animationSpeed}ms`);
    root.style.setProperty('--theme-duration-slow', `${theme.animationSpeedSlow}ms`);
    root.style.setProperty('--theme-duration-fast', `${theme.animationSpeedFast}ms`);
    root.style.setProperty('--theme-easing', theme.animationEasing);
    root.style.setProperty('--theme-easing-in', theme.animationEasingIn);
    root.style.setProperty('--theme-easing-out', theme.animationEasingOut);
    root.style.setProperty('--theme-easing-in-out', theme.animationEasingInOut);

    // Component specific
    root.style.setProperty('--theme-button-height', `${theme.buttonHeight}px`);
    root.style.setProperty('--theme-button-padding-x', `${theme.buttonPaddingX}px`);
    root.style.setProperty('--theme-button-padding-y', `${theme.buttonPaddingY}px`);
    root.style.setProperty('--theme-button-font-size', `${theme.buttonFontSize}px`);
    root.style.setProperty('--theme-button-font-weight', theme.buttonFontWeight.toString());
    root.style.setProperty('--theme-button-radius', `${theme.buttonBorderRadius}px`);
    root.style.setProperty('--theme-input-height', `${theme.inputHeight}px`);
    root.style.setProperty('--theme-input-padding-x', `${theme.inputPaddingX}px`);
    root.style.setProperty('--theme-input-padding-y', `${theme.inputPaddingY}px`);
    root.style.setProperty('--theme-input-font-size', `${theme.inputFontSize}px`);
    root.style.setProperty('--theme-input-radius', `${theme.inputBorderRadius}px`);
    root.style.setProperty('--theme-card-padding', `${theme.cardPadding}px`);
    root.style.setProperty('--theme-card-radius', `${theme.cardBorderRadius}px`);
    root.style.setProperty('--theme-card-elevation', theme.cardElevation.toString());
    root.style.setProperty('--theme-modal-radius', `${theme.modalBorderRadius}px`);
    root.style.setProperty('--theme-modal-padding', `${theme.modalPadding}px`);
    root.style.setProperty('--theme-tooltip-font-size', `${theme.tooltipFontSize}px`);
    root.style.setProperty('--theme-tooltip-padding', `${theme.tooltipPadding}px`);
    root.style.setProperty('--theme-tooltip-radius', `${theme.tooltipBorderRadius}px`);

    // Gradients
    if (theme.enableGradients) {
      root.style.setProperty('--theme-gradient-primary', theme.primaryGradient);
      root.style.setProperty('--theme-gradient-secondary', theme.secondaryGradient);
      root.style.setProperty('--theme-gradient-accent', theme.accentGradient);
      root.style.setProperty('--theme-gradient-background', theme.backgroundGradient);
      root.style.setProperty('--theme-gradient-angle', `${theme.gradientAngle}deg`);
    }

    // Z-index layers
    root.style.setProperty('--theme-z-dropdown', theme.zIndexDropdown.toString());
    root.style.setProperty('--theme-z-modal', theme.zIndexModal.toString());
    root.style.setProperty('--theme-z-popover', theme.zIndexPopover.toString());
    root.style.setProperty('--theme-z-tooltip', theme.zIndexTooltip.toString());
    root.style.setProperty('--theme-z-header', theme.zIndexHeader.toString());
    root.style.setProperty('--theme-z-drawer', theme.zIndexDrawer.toString());
    root.style.setProperty('--theme-z-overlay', theme.zIndexOverlay.toString());

    // Grid system
    root.style.setProperty('--theme-grid-columns', theme.gridColumns.toString());
    root.style.setProperty('--theme-grid-gutter', `${theme.gridGutter}px`);

    // Text scaling
    root.style.setProperty('--theme-text-scale', theme.textScaling.toString());

    // Apply design style class
    root.setAttribute('data-theme-style', theme.designStyle);
    root.setAttribute('data-theme-mode', theme.mode);
    root.setAttribute('data-navigation-style', theme.navigationStyle);
    root.setAttribute('data-card-style', theme.cardStyle);
    root.setAttribute('data-button-style', theme.buttonStyle);
    root.setAttribute('data-icon-style', theme.iconStyle);
    root.setAttribute('data-density', theme.density);
    root.setAttribute('data-layout-type', theme.layoutType);

    // Apply performance settings
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

    // Apply accessibility settings
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

    // Apply special styles based on design style
    this.applyDesignStyleClasses(root, theme);

    // Force change detection
    this.cdr.detectChanges();
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

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.currentTheme = { ...this.currentTheme, [property]: value };
    this.themeForm.patchValue({ [property]: value }, { emitEvent: false });
    this.themeChangeSubject.next({ [property]: value });
  }

  onThemeChange(changes: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...changes };
    this.updateFormValues(this.currentTheme);

    // Apply changes immediately to preview without debounce
    this.applyThemeToPreview(this.currentTheme);

    // Also update the subject for other subscribers
    this.themeChangeSubject.next(changes);
  }

  async saveTheme(): Promise<void> {
    this.isSaving = true;

    try {
      // Save to local storage
      await this.themeService.saveTheme(this.currentTheme);

      // Apply to the main application
      this.themeService.applyTheme(this.currentTheme);

      this.snackBar.open('Theme saved successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      this.snackBar.open('Failed to save theme', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSaving = false;
    }
  }

  resetTheme(): void {
    const defaultTheme = this.getDefaultTheme();
    this.currentTheme = defaultTheme;
    this.updateFormValues(defaultTheme);
    this.applyThemeToPreview(defaultTheme);

    this.snackBar.open('Theme reset to defaults', 'Close', {
      duration: 3000
    });
  }

  exportTheme(): void {
    const themeData = JSON.stringify(this.currentTheme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const brandName = this.currentTheme.brandName || 'theme';
    const sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
    link.download = `theme-${sanitizedBrandName}-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Theme exported successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  importTheme(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string) as ThemeConfig;
          this.currentTheme = theme;
          this.updateFormValues(theme);
          this.applyThemeToPreview(theme);

          this.snackBar.open('Theme imported successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } catch (error) {
          this.snackBar.open('Invalid theme file', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      };
      reader.readAsText(file);
    }
  }

  toggleMode(): void {
    const newMode = this.currentTheme.mode === 'light' ? 'dark' : 'light';
    this.updateThemeProperty('mode', newMode);
  }

  openAdvancedSettings(): void {
    this.showAdvancedSettings = true;
    // You can implement a dialog here for advanced settings
  }

  // Helper method for logo error handling
  onLogoError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Helper method for preview updates
  refreshPreview(): void {
    this.applyThemeToPreview(this.currentTheme);
  }

  // Track by functions for performance
  trackByMetric(index: number, metric: any): string {
    return metric.title;
  }

  trackByFeature(index: number, feature: any): string {
    return feature.title;
  }

  trackByNavItem(index: number, item: string): string {
    return item;
  }
}
