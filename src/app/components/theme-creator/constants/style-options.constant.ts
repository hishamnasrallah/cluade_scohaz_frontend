// src/app/components/theme-creator/constants/style-options.constant.ts

export interface StyleOption {
  value: string;
  label: string;
}

export const NAVIGATION_STYLES: StyleOption[] = [
  { value: 'elevated', label: 'Elevated' },
  { value: 'flat', label: 'Flat' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'gradient', label: 'Gradient' }
];

export const BUTTON_STYLES: StyleOption[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
  { value: 'ghost', label: 'Ghost' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'glow', label: 'Glow' },
  { value: 'neumorphic', label: 'Neumorphic' }
];

export const CARD_STYLES: StyleOption[] = [
  { value: 'elevated', label: 'Elevated' },
  { value: 'flat', label: 'Flat' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'glass', label: 'Glass' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'neumorphic', label: 'Neumorphic' }
];

export const ICON_STYLES: StyleOption[] = [
  { value: 'outlined', label: 'Outlined' },
  { value: 'filled', label: 'Filled' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'two-tone', label: 'Two Tone' }
];

export const DENSITY_OPTIONS: StyleOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
  { value: 'spacious', label: 'Spacious' }
];

export const LAYOUT_TYPES: StyleOption[] = [
  { value: 'fluid', label: 'Fluid' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'responsive', label: 'Responsive' },
  { value: 'adaptive', label: 'Adaptive' }
];

export const HEADER_POSITIONS: StyleOption[] = [
  { value: 'sticky', label: 'Sticky' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'static', label: 'Static' },
  { value: 'absolute', label: 'Absolute' }
];

export const SIDEBAR_POSITIONS: StyleOption[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

export const DESIGN_STYLES: StyleOption[] = [
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'glassmorphic', label: 'Glassmorphic' },
  { value: 'neumorphic', label: 'Neumorphic' },
  { value: 'material', label: 'Material' },
  { value: 'flat', label: 'Flat' },
  { value: 'gradient', label: 'Gradient' }
];
