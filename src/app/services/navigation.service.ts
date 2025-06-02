// services/navigation.service.ts - ENHANCED navigation management
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { ROUTE_CONFIG } from '../app.routes';

export interface BreadcrumbItem {
  label: string;
  url: string;
  icon?: string;
  isActive: boolean;
}

export interface NavigationState {
  currentRoute: string;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  pageDescription: string;
  pageIcon: string;
  isHomePage: boolean;
  canGoBack: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationStateSubject = new BehaviorSubject<NavigationState>({
    currentRoute: '',
    breadcrumbs: [],
    pageTitle: '',
    pageDescription: '',
    pageIcon: '',
    isHomePage: false,
    canGoBack: false
  });

  public navigationState$ = this.navigationStateSubject.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initializeNavigation();
  }

  private initializeNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute)
    ).subscribe(() => {
      this.updateNavigationState();
    });
  }

  private updateNavigationState(): void {
    const currentUrl = this.router.url;
    const routeData = this.getRouteData();
    const breadcrumbs = this.generateBreadcrumbs(currentUrl);

    const navigationState: NavigationState = {
      currentRoute: currentUrl,
      breadcrumbs: breadcrumbs,
      pageTitle: routeData.title || this.extractPageTitle(currentUrl),
      pageDescription: routeData.description || '',
      pageIcon: routeData.icon || 'pages',
      isHomePage: routeData.isHomePage || false,
      canGoBack: breadcrumbs.length > 1
    };

    this.navigationStateSubject.next(navigationState);
  }

  private getRouteData(): any {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data || {};
  }

  private generateBreadcrumbs(url: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const urlSegments = url.split('/').filter(segment => segment);

    // Always add dashboard as first breadcrumb (unless we're on login/config)
    if (!url.includes('/login') && !url.includes('/config')) {
      breadcrumbs.push({
        label: 'Dashboard',
        url: '/dashboard',
        icon: 'home',
        isActive: url === '/dashboard'
      });
    }

    // Build breadcrumbs based on URL structure
    if (url.includes('/app/')) {
      const appName = urlSegments[1]; // app/:appName
      breadcrumbs.push({
        label: this.formatAppName(appName),
        url: url,
        icon: 'api',
        isActive: true
      });
    }

    return breadcrumbs;
  }

  private extractPageTitle(url: string): string {
    if (url === '/dashboard' || url === '/') return 'Dashboard';
    if (url.includes('/app/')) {
      const appName = url.split('/')[2];
      return `${this.formatAppName(appName)} Application`;
    }
    if (url === '/config') return 'Configuration';
    if (url === '/login') return 'Sign In';
    return 'Unknown Page';
  }

  private formatAppName(appName: string): string {
    return appName
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Navigation actions
  goBack(): void {
    const state = this.navigationStateSubject.value;
    if (state.canGoBack && state.breadcrumbs.length > 1) {
      const previousBreadcrumb = state.breadcrumbs[state.breadcrumbs.length - 2];
      this.router.navigate([previousBreadcrumb.url]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToApp(appName: string): void {
    this.router.navigate(['/app', appName]);
  }

  navigateToConfig(): void {
    this.router.navigate(['/config']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Quick navigation for common actions
  getQuickNavigationItems(): Array<{title: string, icon: string, action: () => void}> {
    return [
      {
        title: 'Dashboard',
        icon: 'dashboard',
        action: () => this.navigateToHome()
      },
      {
        title: 'Configuration',
        icon: 'settings',
        action: () => this.navigateToConfig()
      }
    ];
  }

  // Get current page context
  getCurrentPageContext(): Observable<{
    isHomePage: boolean;
    canGoBack: boolean;
    pageTitle: string;
    breadcrumbs: BreadcrumbItem[];
  }> {
    return this.navigationState$.pipe(
      map(state => ({
        isHomePage: state.isHomePage,
        canGoBack: state.canGoBack,
        pageTitle: state.pageTitle,
        breadcrumbs: state.breadcrumbs
      }))
    );
  }
}
