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
  template: `
    <div class="preview-container" *ngIf="theme$ | async as theme">
      <!-- Header -->
      <header class="preview-header">
        <div class="header-content">
          <div class="brand">
            <span class="logo">{{ theme.logoUrl || '🏢' }}</span>
            <div class="brand-info">
              <h1>{{ theme.brandName }}</h1>
              <p>Enterprise Dynamic Theme System</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="openModal()">
              🔧 Settings
            </button>
            <button class="btn btn-ghost">
              {{ theme.mode === 'light' ? '🌙' : '☀️' }}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="preview-main">
        <!-- Navigation -->
        <nav class="navigation-bar">
          <a
            *ngFor="let item of navigationItems"
            class="nav-item"
            [class.active]="activeNavItem === item"
            (click)="activeNavItem = item"
          >
            {{ item }}
          </a>
        </nav>

        <!-- Metrics Cards -->
        <section class="metrics-section">
          <h2>Dashboard Overview</h2>
          <div class="metrics-grid">
            <div
              *ngFor="let metric of metrics"
              class="metric-card"
              [attr.data-card-style]="theme.cardStyle"
            >
              <div class="metric-header">
                <span class="metric-icon">{{ metric.icon }}</span>
                <span class="metric-change" [ngClass]="getTrendClass(metric.trend)">
                  {{ metric.change }}
                </span>
              </div>
              <h3 class="metric-value">{{ metric.value }}</h3>
              <p class="metric-title">{{ metric.title }}</p>
            </div>
          </div>
        </section>

        <!-- Form Example -->
        <section class="form-section">
          <div class="form-card" [attr.data-card-style]="theme.cardStyle">
            <h3>Sample Form</h3>
            <form class="sample-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your name" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter your email" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Enter your message"
                  rows="3"
                  class="form-textarea"
                ></textarea>
              </div>
              <div class="button-group">
                <button type="button" class="btn btn-primary">Submit</button>
                <button type="button" class="btn btn-secondary">Save Draft</button>
                <button type="button" class="btn btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </section>

        <!-- Features Grid -->
        <section class="features-section">
          <h2>Enterprise Features</h2>
          <div class="features-grid">
            <div
              *ngFor="let feature of features"
              class="feature-card"
              [attr.data-card-style]="theme.cardStyle"
            >
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </section>

        <!-- Button Showcase -->
        <section class="buttons-section">
          <div class="buttons-card" [attr.data-card-style]="theme.cardStyle">
            <h3>Button Styles</h3>
            <div class="button-showcase">
              <button class="btn btn-primary">Primary</button>
              <button class="btn btn-secondary">Secondary</button>
              <button class="btn btn-outline">Outline</button>
              <button class="btn btn-ghost">Ghost</button>
              <button class="btn btn-success">Success</button>
              <button class="btn btn-warning">Warning</button>
              <button class="btn btn-error">Error</button>
            </div>
          </div>
        </section>
      </main>

      <!-- Modal Example -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div
          class="modal"
          [attr.data-card-style]="theme.cardStyle"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h2>Advanced Settings</h2>
            <button class="btn btn-ghost" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <p>This modal showcases the dynamic theming system in action:</p>
            <ul>
              <li>✓ Consistent styling with theme</li>
              <li>✓ Smooth animations (if enabled)</li>
              <li>✓ Responsive design</li>
              <li>✓ Accessibility features</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="closeModal()">Got it!</button>
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      height: 100%;
      overflow-y: auto;
      background-color: var(--surface-background);
      color: var(--text-primary);
      font-family: var(--font-sans);
    }

    /* Header Styles */
    .preview-header {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--border-default);
      padding: var(--spacing-4) var(--spacing-6);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .logo {
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background-color: var(--color-primary-500);
      color: white;
      border-radius: var(--rounded-lg);
    }

    .brand-info h1 {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      font-family: var(--font-display);
    }

    .brand-info p {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    /* Main Content */
    .preview-main {
      max-width: 1400px;
      margin: 0 auto;
      padding: var(--spacing-6);
    }

    /* Navigation Bar */
    .navigation-bar {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-8);
      border-bottom: 1px solid var(--border-default);
      overflow-x: auto;
    }

    .nav-item {
      padding: var(--spacing-3) var(--spacing-4);
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: var(--font-medium);
      border-bottom: 2px solid transparent;
      transition: all var(--duration-fast) var(--ease-out);
      white-space: nowrap;
      cursor: pointer;
    }

    .nav-item:hover {
      color: var(--text-primary);
      background-color: var(--surface-hover);
    }

    .nav-item.active {
      color: var(--color-primary-500);
      border-bottom-color: var(--color-primary-500);
    }

    /* Sections */
    section {
      margin-bottom: var(--spacing-12);
    }

    section h2 {
      font-size: var(--text-2xl);
      font-weight: var(--font-semibold);
      margin-bottom: var(--spacing-6);
      font-family: var(--font-display);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: var(--spacing-6);
      margin-bottom: var(--spacing-8);
    }

    .metric-card {
      padding: var(--spacing-6);
      background-color: var(--surface-card);
      border-radius: var(--rounded-lg);
      border: 1px solid var(--border-default);
      transition: all var(--duration-normal) var(--ease-out);
    }

    .metric-card[data-card-style="elevated"] {
      box-shadow: var(--shadow-md);
      border: none;
    }

    .metric-card[data-card-style="flat"] {
      box-shadow: none;
      border: 1px solid var(--border-default);
    }

    .metric-card[data-card-style="bordered"] {
      box-shadow: none;
      border: 2px solid var(--border-strong);
    }

    .metric-card[data-card-style="glass"] {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(var(--blur-intensity));
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-3);
    }

    .metric-icon {
      font-size: 1.5rem;
    }

    .metric-change {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--rounded-full);
    }

    .trend-up {
      color: var(--color-success-600);
      background-color: rgba(34, 197, 94, 0.1);
    }

    .trend-down {
      color: var(--color-error-600);
      background-color: rgba(239, 68, 68, 0.1);
    }

    .metric-value {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      margin: 0 0 var(--spacing-2) 0;
      font-family: var(--font-display);
    }

    .metric-title {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    /* Form Styles */
    .form-card {
      padding: var(--spacing-8);
      background-color: var(--surface-card);
      border-radius: var(--rounded-lg);
      border: 1px solid var(--border-default);
    }

    .form-card[data-card-style="elevated"] {
      box-shadow: var(--shadow-md);
      border: none;
    }

    .form-card h3 {
      margin: 0 0 var(--spacing-6) 0;
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .form-group label {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: var(--spacing-3);
      border: 1px solid var(--border-default);
      border-radius: var(--rounded-md);
      font-size: var(--text-base);
      font-family: var(--font-sans);
      background-color: var(--surface-background);
      color: var(--text-primary);
      transition: all var(--duration-fast) var(--ease-out);
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .button-group {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-6);
      flex-wrap: wrap;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-6);
    }

    .feature-card {
      padding: var(--spacing-6);
      background-color: var(--surface-card);
      border-radius: var(--rounded-lg);
      border: 1px solid var(--border-default);
      text-align: center;
      transition: all var(--duration-normal) var(--ease-out);
    }

    .feature-card[data-card-style="elevated"] {
      box-shadow: var(--shadow-md);
      border: none;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-4);
    }

    .feature-card h3 {
      margin: 0 0 var(--spacing-3) 0;
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
    }

    .feature-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      line-height: var(--leading-relaxed);
    }

    /* Buttons Section */
    .buttons-card {
      padding: var(--spacing-8);
      background-color: var(--surface-card);
      border-radius: var(--rounded-lg);
      border: 1px solid var(--border-default);
    }

    .buttons-card[data-card-style="elevated"] {
      box-shadow: var(--shadow-md);
      border: none;
    }

    .buttons-card h3 {
      margin: 0 0 var(--spacing-6) 0;
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
    }

    .button-showcase {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-3);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--surface-overlay);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-4);
      animation: fadeIn var(--duration-fast) var(--ease-out);
    }

    .modal {
      background-color: var(--surface-modal);
      border-radius: var(--rounded-xl);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-2xl);
      animation: slideUp var(--duration-normal) var(--ease-out);
      overflow: hidden;
    }

    .modal[data-card-style="glass"] {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-6);
      border-bottom: 1px solid var(--border-default);
    }

    .modal-header h2 {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
    }

    .modal-body {
      padding: var(--spacing-6);
    }

    .modal-body p {
      margin: 0 0 var(--spacing-4) 0;
    }

    .modal-body ul {
      margin: 0;
      padding-left: var(--spacing-6);
      list-style: none;
    }

    .modal-body li {
      margin-bottom: var(--spacing-2);
      color: var(--text-secondary);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-3);
      padding: var(--spacing-6);
      border-top: 1px solid var(--border-default);
      background-color: var(--surface-hover);
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .preview-main {
        padding: var(--spacing-4);
      }

      .header-content {
        flex-direction: column;
        gap: var(--spacing-3);
        text-align: center;
      }

      .brand-info h1 {
        font-size: var(--text-lg);
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .button-showcase {
        justify-content: center;
      }

      .modal {
        max-width: 90%;
      }
    }

    /* Dark Mode Adjustments */
    [data-theme-mode="dark"] {
      .metric-card,
      .form-card,
      .feature-card,
      .buttons-card {
        background-color: var(--surface-card);
        border-color: var(--border-default);
      }

      .modal {
        background-color: var(--surface-modal);
      }
    }

    /* No animations mode */
    .no-animations * {
      animation: none !important;
      transition: none !important;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
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
