// src/app/components/theme-creator/constants/preview-data.constant.ts

export interface SampleMetric {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: 'up' | 'down';
}

export interface EnterpriseFeature {
  title: string;
  description: string;
  icon: string;
}

export const SAMPLE_METRICS: SampleMetric[] = [
  { title: 'Revenue', value: '$124,590', change: '+12.5%', icon: 'attach_money', trend: 'up' },
  { title: 'Users', value: '8,429', change: '+5.2%', icon: 'people', trend: 'up' },
  { title: 'Orders', value: '1,245', change: '-2.1%', icon: 'shopping_cart', trend: 'down' },
  { title: 'Conversion', value: '3.2%', change: '+0.8%', icon: 'trending_up', trend: 'up' }
];

export const NAVIGATION_ITEMS = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Profile'];

export const ENTERPRISE_FEATURES: EnterpriseFeature[] = [
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
