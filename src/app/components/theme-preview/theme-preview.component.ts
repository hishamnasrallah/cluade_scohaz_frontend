import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ThemeConfig } from '../../models/theme.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-preview.component.html',
  styleUrls: ['./theme-preview.component.scss']
})
export class ThemePreviewComponent implements OnInit {
  theme$: Observable<ThemeConfig>;
  showModal = false;
  activeNavItem = 'Dashboard';

  navigationItems = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Profile'];

  metrics = [
    { title: 'Revenue', value: '$124,590', change: '+12.5%', icon: '💰', trend: 'up' },
    { title: 'Users', value: '8,429', change: '+5.2%', icon: '👥', trend: 'up' },
    { title: 'Orders', value: '1,245', change: '-2.1%', icon: '📦', trend: 'down' },
    { title: 'Conversion', value: '3.2%', change: '+0.8%', icon: '📈', trend: 'up' }
  ];

  features = [
    {
      title: 'Advanced Theming',
      description: 'Comprehensive design system with 500+ theme properties',
      icon: '🎨'
    },
    {
      title: 'Real-time Updates',
      description: 'Live theme changes without page refreshes',
      icon: '⚡'
    },
    {
      title: 'Accessibility First',
      description: 'WCAG 2.1 compliant with reduced motion support',
      icon: '♿'
    },
    {
      title: 'Performance Optimized',
      description: 'GPU-accelerated animations and minimal reflows',
      icon: '🚀'
    },
    {
      title: 'Modern Design Trends',
      description: 'Glassmorphism, neumorphism, and more',
      icon: '✨'
    },
    {
      title: 'Enterprise Ready',
      description: 'Multi-brand support and theme hierarchies',
      icon: '🏢'
    }
  ];

  constructor(private themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
  }

  ngOnInit(): void {
    // Initialize preview
  }

  getTrendClass(trend: string): string {
    return trend === 'up' ? 'trend-up' : 'trend-down';
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}
