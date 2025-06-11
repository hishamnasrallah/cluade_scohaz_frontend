// dashboard.component.ts - ENHANCED Professional Home Page without Applications Section
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import {ConfigService} from '../../services/config.service';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatRippleModule
  ],
  templateUrl:'dashboard.component.html',
  styleUrl:'dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  apiData: ApiResponse | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  public loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`)
      .subscribe({
        next: (data) => {
          this.apiData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);

          if (err.status === 401) {
            this.error = 'Authentication failed. Please login again.';
            this.handleAuthError();
          } else if (err.status === 403) {
            this.error = 'Access denied. You do not have permission to access this resource.';
          } else if (err.status === 0) {
            this.error = 'Network error. Please check your connection and try again.';
          } else {
            this.error = `Failed to load dashboard data. Server responded with status ${err.status}.`;
          }

          this.isLoading = false;
        }
      });
  }

  getTotalMethods(): number {
    if (!this.apiData?.applications?.applications) return 0;
    const allMethods = new Set<string>();
    Object.values(this.apiData.applications.applications).forEach(endpoints => {
      endpoints.forEach(endpoint => {
        endpoint.methods?.forEach(method => allMethods.add(method));
      });
    });
    return allMethods.size;
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Not available';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  // Navigation methods for quick actions
  goToApplications(): void {
    this.router.navigate(['/applications']);
  }

  goToConfig(): void {
    this.router.navigate(['/config']);
  }

  goToInbox(): void {
    this.router.navigate(['/inbox']);
  }

  private handleAuthError(): void {
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }
}
