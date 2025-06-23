// src/app/components/theme-creator/theme-creator.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

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

// Theme Control Components
import { ColorPickerComponent } from '../theme-controls/color-picker/color-picker.component';
import { TypographyControlsComponent } from '../theme-controls/typography-controls/typography-controls.component';
import { SpacingControlsComponent } from '../theme-controls/spacing-controls/spacing-controls.component';
import { EffectsControlsComponent } from '../theme-controls/effects-controls/effects-controls.component';

// Services and Models
import { ThemeService } from '../../services/theme.service';
import { ThemeConfig, ThemePreset } from '../../models/theme.model';

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
    // Theme Control Components
    ColorPickerComponent,
    TypographyControlsComponent,
    SpacingControlsComponent,
    EffectsControlsComponent
  ],
  templateUrl: './theme-creator.component.html',
  styleUrls: ['./theme-creator.component.scss']
})
export class ThemeCreatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Current theme configuration
  currentTheme: ThemeConfig = this.getDefaultTheme();

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
        fontFamily: 'Inter, system-ui, sans-serif',
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
        designStyle: 'glassmorphic',
        borderRadius: 16,
        shadowIntensity: 0.2,
        blurIntensity: 20
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
        fontFamily: 'system-ui, sans-serif',
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
        fontFamily: 'Inter, system-ui, sans-serif',
        designStyle: 'modern',
        borderRadius: 16,
        spacingUnit: 24
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

  enterpriseFeatures = [
    {
      title: 'Advanced Theming',
      description: 'Comprehensive design system with 50+ theme properties',
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
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load current theme from service
    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if (theme) {
          this.currentTheme = { ...theme };
          // Apply theme immediately to see changes
          this.applyTheme(this.currentTheme);
        }
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.themeForm = this.fb.group({
      // Core colors
      primaryColor: ['#34C5AA'],
      secondaryColor: ['#2BA99B'],
      backgroundColor: ['#F4FDFD'],
      textColor: ['#2F4858'],
      accentColor: ['#5FD3C4'],

      // Semantic colors
      successColor: ['#22C55E'],
      warningColor: ['#F59E0B'],
      errorColor: ['#EF4444'],
      infoColor: ['#3B82F6'],

      // Typography
      fontFamily: ['Inter, system-ui, sans-serif'],
      fontSizeBase: [16],
      fontWeight: [400],
      lineHeight: [1.5],
      letterSpacing: [0],
      headingFontFamily: ['Poppins, sans-serif'],
      headingFontWeight: [600],

      // Spacing & Layout
      spacingUnit: [16],
      borderRadius: [12],
      borderWidth: [1],

      // Effects
      shadowIntensity: [0.1],
      blurIntensity: [10],
      animationSpeed: [300],
      animationEasing: ['ease-out'],

      // Features
      designStyle: ['modern'],
      navigationStyle: ['elevated'],
      cardStyle: ['elevated'],
      buttonStyle: ['primary'],

      // Mode
      mode: ['light'],

      // Performance
      enableAnimations: [true],
      enableBlur: [true],
      enableShadows: [true],

      // Accessibility
      reducedMotion: [false],
      highContrast: [false],

      // Brand
      brandName: ['PraXelo Enterprise'],
      logoUrl: ['assets/logo.svg']
    });
  }

  private updateFormValues(theme: Partial<ThemeConfig>): void {
    this.themeForm.patchValue(theme, { emitEvent: false });
  }

  private getDefaultTheme(): ThemeConfig {
    return {
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
      animationSpeed: 300,
      animationEasing: 'ease-out',

      // Features
      designStyle: 'modern',
      navigationStyle: 'elevated',
      cardStyle: 'elevated',
      buttonStyle: 'primary',

      // Mode
      mode: 'light',

      // Performance
      enableAnimations: true,
      enableBlur: true,
      enableShadows: true,

      // Accessibility
      reducedMotion: false,
      highContrast: false,

      // Brand
      brandName: 'PraXelo Enterprise',
      logoUrl: 'assets/logo.svg'
    };
  }

  applyPreset(preset: ThemePreset): void {
    this.currentTheme = { ...this.currentTheme, ...preset.config };
    this.updateFormValues(this.currentTheme);
    this.applyTheme(this.currentTheme);

    this.snackBar.open(`Applied ${preset.name} preset`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private applyTheme(theme: ThemeConfig): void {
    this.themeService.applyTheme(theme);
  }

  updateThemeProperty(property: keyof ThemeConfig, value: any): void {
    this.currentTheme = { ...this.currentTheme, [property]: value };
    this.applyTheme(this.currentTheme);
  }

  onThemeChange(changes: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...changes };
    this.updateFormValues(this.currentTheme);
    this.applyTheme(this.currentTheme);
  }

  async saveTheme(): Promise<void> {
    this.isSaving = true;

    try {
      await this.themeService.saveTheme(this.currentTheme);

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
    this.applyTheme(defaultTheme);

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
    link.download = `theme-${Date.now()}.json`;
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
          this.applyTheme(theme);

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

  getCardElevation(): string {
    if (!this.currentTheme.enableShadows) return '0';

    switch (this.currentTheme.cardStyle) {
      case 'elevated':
        return '2';
      case 'flat':
        return '0';
      case 'bordered':
        return '0';
      case 'glass':
        return '1';
      default:
        return '1';
    }
  }

  getButtonAppearance(style: string): 'flat' | 'raised' | 'stroked' | 'basic' {
    switch (style) {
      case 'primary':
      case 'secondary':
        return 'raised';
      case 'outline':
        return 'stroked';
      case 'ghost':
        return 'basic';
      default:
        return 'flat';
    }
  }
}
