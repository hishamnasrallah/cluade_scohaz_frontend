// components/app.component.ts - ENHANCED with Dynamic Navigation Menu
import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet, NavigationEnd} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import {MatToolbar} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgIf, NgClass, TitleCasePipe, NgFor} from "@angular/common";
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import {MatDivider} from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';

// Import the same interfaces used in dashboard
interface ApiResponse {
  applications: {
    api_version: string;
    schema_generated_on: string;
    total_applications: number;
    total_urls: number;
    applications: {
      [key: string]: Array<{
        path: string;
        name: string;
        methods: string[];
        parameters: string[];
        keys: Array<{
          name: string;
          type: string;
          required: boolean;
          read_only: boolean;
          default: any;
          help_text: string;
          choices?: Array<{
            value: string;
            label: string;
          }>;
        }>;
        other_info: string;
        query_params: any[];
        permissions: string[];
        methods_info: {
          [method: string]: {
            description: string;
            status_codes: Array<{
              code: number;
              description: string;
            }>;
            request_example: any;
            response_example: any;
          };
        };
        available_actions: string[];
      }>;
    };
  };
}

interface ApplicationSummary {
  name: string;
  description: string;
  status: string;
  endpointCount: number;
  endpoints: any[];
  icon: string;
  color: string;
  category: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    MatIconModule,
    RouterOutlet,
    MatButton,
    MatIconButton,
    NgIf,
    NgClass,
    NgFor,
    TitleCasePipe,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDivider
  ],
  styleUrl:'app.component.scss'
})

export class AppComponent implements OnInit {
  isAuthenticated = false;
  showConfigButton = false;
  isLoading = false;
  isHomePage = false;
  currentPageTitle = '';
  title = 'LowCode Pro';

  // Applications data for dynamic menu
  applications: ApplicationSummary[] = [];
  isLoadingApplications = false;
  private appIcons = ['apps', 'api', 'cloud', 'storage', 'analytics', 'security'];
  private appColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ];
  private appCategories = ['API', 'Web', 'Service', 'Data'];

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.showConfigButton = isAuth || this.configService.isConfigured();

        // Load applications when authenticated
        if (isAuth) {
          this.loadApplicationsForMenu();
        }
      }
    );

    // Track route changes for breadcrumbs and page detection
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentPage(event.url);
    });

    // Initial routing logic
    if (!this.configService.isConfigured()) {
      this.router.navigate(['/config']);
    } else if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  private updateCurrentPage(url: string): void {
    this.isHomePage = url === '/' || url === '/dashboard';

    if (url.startsWith('/app/')) {
      const appName = url.split('/')[2];
      this.currentPageTitle = `${appName} Application`;
    } else if (url === '/config') {
      this.currentPageTitle = 'Configuration';
    } else if (url === '/login') {
      this.currentPageTitle = 'Sign In';
    } else if (url === '/dashboard' || url === '/') {
      this.currentPageTitle = 'Dashboard';
    } else {
      this.currentPageTitle = 'Platform';
    }
  }

  // Load applications for the dynamic menu
  private loadApplicationsForMenu(): void {
    this.isLoadingApplications = true;
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`)
      .subscribe({
        next: (data) => {
          this.processApplicationsData(data);
          this.isLoadingApplications = false;
        },
        error: (err) => {
          console.error('Error loading applications for menu:', err);
          this.applications = [];
          this.isLoadingApplications = false;
        }
      });
  }

  private processApplicationsData(data: ApiResponse): void {
    if (!data.applications?.applications) {
      this.applications = [];
      return;
    }

    this.applications = Object.keys(data.applications.applications).map((appName, index) => {
      const endpoints = data.applications.applications[appName];

      return {
        name: appName,
        description: this.generateAppDescription(appName, endpoints),
        status: 'Active',
        endpointCount: endpoints.length,
        endpoints: endpoints,
        icon: this.appIcons[index % this.appIcons.length],
        color: this.appColors[index % this.appColors.length],
        category: this.appCategories[index % this.appCategories.length]
      };
    });
  }

  private generateAppDescription(appName: string, endpoints: any[]): string {
    if (endpoints.length === 0) return 'No endpoints available';

    const uniqueActions = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.available_actions?.forEach((action: string) => uniqueActions.add(action));
    });

    const actionsArray = Array.from(uniqueActions);
    const actionText = actionsArray.length > 0 ? actionsArray.slice(0, 3).join(', ') : 'CRUD operations';

    return `${endpoints.length} endpoint${endpoints.length > 1 ? 's' : ''} supporting ${actionText}${actionsArray.length > 3 ? ' and more' : ''}`;
  }

  // Navigation methods
  logout(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoading = false;
      this.applications = []; // Clear applications on logout
    }, 500);
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  // New navigation methods for menu items
  goToApplications(): void {
    this.router.navigate(['/applications']);
  }

  goToUserManagement(): void {
    this.router.navigate(['/user-management']);
  }

  goToInbox(): void {
    this.router.navigate(['/inbox']); // This redirects to /applications as defined in routes
  }

  // Application-specific navigation
  viewApplication(appName: string): void {
    this.router.navigate(['/app', appName]);
  }

  // Utility methods
  trackByApp(index: number, app: ApplicationSummary): string {
    return app.name;
  }
}
