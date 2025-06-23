// src/app/components/theme-creator/constants/theme-presets.constant.ts
import { ThemePreset } from '../../../models/theme.model';

export const THEME_PRESETS: ThemePreset[] = [
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
