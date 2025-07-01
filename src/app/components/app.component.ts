// components/app.component.ts - UPDATED with user profile fetching
import { Component, OnInit } from '@angular/core';
import {Router, RouterOutlet, NavigationEnd} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '../services/config.service';
import { TranslationService } from '../services/translation.service';
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

// ... (keep all your existing interfaces - ApiResponse, ApplicationSummary, etc.)
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

// User profile interface
interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  second_name: string;
  third_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_developer: boolean;
  user_type: {
    id: number;
    name: string;
    code: string;
    name_ara: string;
  };
  preference: {
    id: number;
    lang: string;
  };
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
  title = 'PraXelo';

  // Add app initialization state
  isAppInitialized = true; // Simplified, always true now
  initializationError = false;

  // User profile data
  userProfile: UserProfile | null = null;
  userDisplayName = '';
  userEmail = '';

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
    private http: HttpClient,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    console.log('AppComponent: Starting initialization');

    // First, check if configuration is available
    if (!this.configService.isConfigured()) {
      console.log('AppComponent: App not configured, redirecting to config');
      this.router.navigate(['/config']);
      return;
    }

    // Initialize translations with default language
    this.translationService.initializeWithDefaults().subscribe();

    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        console.log('AppComponent: Authentication state changed:', isAuth);
        this.isAuthenticated = isAuth;
        this.showConfigButton = isAuth || this.configService.isConfigured();

        // Load user profile and applications when authenticated
        if (isAuth) {
          this.loadUserProfile();
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
    if (!this.authService.isAuthenticated()) {
      console.log('AppComponent: User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
    }
  }

  // Load user profile from API
  private loadUserProfile(): void {
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<UserProfile>(`${baseUrl}/auth/me/`)
      .subscribe({
        next: (profile) => {
          this.userProfile = profile;

          // Construct display name from available name parts
          const nameParts = [
            profile.first_name,
            profile.second_name,
            profile.third_name,
            profile.last_name
          ].filter(part => part && part.trim());

          this.userDisplayName = nameParts.length > 0
            ? nameParts.join(' ')
            : profile.username;

          this.userEmail = profile.email || `${profile.username}@praxelo.com`;

          console.log('AppComponent: User profile loaded:', profile);
        },
        error: (err) => {
          console.error('AppComponent: Error loading user profile:', err);
          // Fallback to username if profile fails to load
          this.userDisplayName = 'User';
          this.userEmail = 'user@praxelo.com';
        }
      });
  }

  private updateCurrentPage(url: string): void {
    this.isHomePage = url === '/' || url === '/dashboard';

    if (url.startsWith('/app/')) {
      const appName = url.split('/')[2];
      this.currentPageTitle = `${appName} Application`;
    } else if (url.startsWith('/settings')) {
      this.currentPageTitle = 'Settings';
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

  // Load applications for the dynamic menu (keep your existing logic)
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

  // Navigation methods (keep your existing methods)
  logout(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.isLoading = false;
      this.applications = []; // Clear applications on logout
      this.userProfile = null; // Clear user profile on logout
      this.userDisplayName = '';
      this.userEmail = '';
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

  goToApplications(): void {
    this.router.navigate(['/applications']);
  }

  goToUserManagement(): void {
    this.router.navigate(['/user-management']);
  }

  goToInbox(): void {
    this.router.navigate(['/inbox']);
  }

  goToReports(): void {
    this.router.navigate(['/reports']);
  }

  // Settings navigation
  goToSettings(section: string = ''): void {
    if (section) {
      this.router.navigate(['/settings', section]);
    } else {
      this.router.navigate(['/settings']);
    }
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
