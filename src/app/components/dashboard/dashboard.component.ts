// // dashboard.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import {
//   MatCard,
//   MatCardActions,
//   MatCardContent,
//   MatCardHeader,
//   MatCardSubtitle,
//   MatCardTitle
// } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatGridListModule } from '@angular/material/grid-list';
//
// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatCard,
//     MatCardHeader,
//     MatCardTitle,
//     MatCardSubtitle,
//     MatCardContent,
//     MatCardActions,
//     MatButtonModule,
//     MatGridListModule
//   ],
//   template: `
//     <div class="dashboard-container">
//       <h1>Dashboard</h1>
//
//       <div class="dashboard-stats">
//         <div class="stat-card">
//           <h3>Total Applications</h3>
//           <p class="stat-number">{{ apiData?.applications?.total_applications || 0 }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>Total URLs</h3>
//           <p class="stat-number">{{ apiData?.applications?.total_urls || 0 }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>API Version</h3>
//           <p class="stat-text">{{ apiData?.applications?.api_version || 'N/A' }}</p>
//         </div>
//       </div>
//
//       <mat-card class="applications-card">
//         <mat-card-header>
//           <mat-card-title>Applications</mat-card-title>
//           <mat-card-subtitle>Click on an application to view its endpoints</mat-card-subtitle>
//         </mat-card-header>
//
//         <mat-card-content>
//           <div class="applications-grid" *ngIf="applications && applications.length > 0">
//             <mat-card *ngFor="let app of applications" class="app-card" (click)="viewApplication(app.id)">
//               <mat-card-header>
//                 <mat-card-title>{{ app.name }}</mat-card-title>
//                 <mat-card-subtitle>{{ app.description }}</mat-card-subtitle>
//               </mat-card-header>
//               <mat-card-content>
//                 <p><strong>Status:</strong> {{ app.status }}</p>
//                 <p><strong>Endpoints:</strong> {{ app.endpointCount || 0 }}</p>
//               </mat-card-content>
//               <mat-card-actions>
//                 <button mat-button color="primary">View Details</button>
//               </mat-card-actions>
//             </mat-card>
//           </div>
//
//           <div *ngIf="!applications || applications.length === 0" class="no-applications">
//             <p>No applications found.</p>
//           </div>
//         </mat-card-content>
//       </mat-card>
//     </div>
//   `,
//   styles: [`
//     .dashboard-container {
//       padding: 20px;
//     }
//
//     .dashboard-stats {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//       gap: 16px;
//       margin-bottom: 24px;
//     }
//
//     .stat-card {
//       background: #f5f5f5;
//       padding: 20px;
//       border-radius: 8px;
//       text-align: center;
//     }
//
//     .stat-number {
//       font-size: 2em;
//       font-weight: bold;
//       color: #1976d2;
//       margin: 8px 0;
//     }
//
//     .stat-text {
//       font-size: 1.2em;
//       font-weight: 500;
//       margin: 8px 0;
//     }
//
//     .applications-card {
//       margin-top: 20px;
//     }
//
//     .applications-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//       gap: 16px;
//       margin-top: 16px;
//     }
//
//     .app-card {
//       cursor: pointer;
//       transition: box-shadow 0.3s ease;
//     }
//
//     .app-card:hover {
//       box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//     }
//
//     .no-applications {
//       text-align: center;
//       padding: 40px;
//       color: #666;
//     }
//   `]
// })
// export class DashboardComponent implements OnInit {
//   apiData: any = null;
//   applications: any[] = [];
//
//   constructor(private router: Router) {}
//
//   ngOnInit(): void {
//     this.loadDashboardData();
//   }
//
//   private loadDashboardData(): void {
//     // Mock data - replace with your actual service calls
//     this.apiData = {
//       applications: {
//         total_applications: 5,
//         total_urls: 23,
//         api_version: 'v1.0.0'
//       }
//     };
//
//     this.applications = [
//       {
//         id: 1,
//         name: 'User Management',
//         description: 'Manage user accounts and permissions',
//         status: 'Active',
//         endpointCount: 8
//       },
//       {
//         id: 2,
//         name: 'Product Catalog',
//         description: 'Product information and inventory',
//         status: 'Active',
//         endpointCount: 12
//       },
//       {
//         id: 3,
//         name: 'Order Processing',
//         description: 'Handle customer orders and payments',
//         status: 'Maintenance',
//         endpointCount: 15
//       }
//     ];
//   }
//
//   viewApplication(appId: number): void {
//     this.router.navigate(['/app', appId]);
//   }
// }

//===================================================

// // dashboard.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { HttpClient } from '@angular/common/http';
// import {
//   MatCard,
//   MatCardActions,
//   MatCardContent,
//   MatCardHeader,
//   MatCardSubtitle,
//   MatCardTitle
// } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatGridListModule } from '@angular/material/grid-list';
// import {ConfigService} from '../../services/config.service';
//
// interface ApiResponse {
//   applications: {
//     api_version: string;
//     schema_generated_on: string;
//     total_applications: number;
//     total_urls: number;
//     applications: {
//       [key: string]: Array<{
//         path: string;
//         name: string;
//         methods: string[];
//         parameters: string[];
//         keys: Array<{
//           name: string;
//           type: string;
//           required: boolean;
//           read_only: boolean;
//           default: any;
//           help_text: string;
//           choices?: Array<{
//             value: string;
//             label: string;
//           }>;
//         }>;
//         other_info: string;
//         query_params: any[];
//         permissions: string[];
//         methods_info: {
//           [method: string]: {
//             description: string;
//             status_codes: Array<{
//               code: number;
//               description: string;
//             }>;
//             request_example: any;
//             response_example: any;
//           };
//         };
//         available_actions: string[];
//       }>;
//     };
//   };
// }
//
// interface ApplicationSummary {
//   name: string;
//   description: string;
//   status: string;
//   endpointCount: number;
//   endpoints: any[];
// }
//
// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatCard,
//     MatCardHeader,
//     MatCardTitle,
//     MatCardSubtitle,
//     MatCardContent,
//     MatCardActions,
//     MatButtonModule,
//     MatGridListModule
//   ],
//   template: `
//     <div class="dashboard-container">
//       <h1>Dashboard</h1>
//
//       <div class="dashboard-stats">
//         <div class="stat-card">
//           <h3>Total Applications</h3>
//           <p class="stat-number">{{ apiData?.applications?.total_applications || 0 }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>Total URLs</h3>
//           <p class="stat-number">{{ apiData?.applications?.total_urls || 0 }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>API Version</h3>
//           <p class="stat-text">{{ apiData?.applications?.api_version || 'N/A' }}</p>
//         </div>
//         <div class="stat-card">
//           <h3>Schema Generated</h3>
//           <p class="stat-text">{{ getFormattedDate(apiData?.applications?.schema_generated_on) }}</p>
//         </div>
//       </div>
//
//       <mat-card class="applications-card">
//         <mat-card-header>
//           <mat-card-title>Applications</mat-card-title>
//           <mat-card-subtitle>Click on an application to view its endpoints</mat-card-subtitle>
//         </mat-card-header>
//
//         <mat-card-content>
//           <div class="loading" *ngIf="isLoading">
//             <p>Loading applications...</p>
//           </div>
//
//           <div class="error" *ngIf="error">
//             <p>Error loading applications: {{ error }}</p>
//             <button mat-button color="primary" (click)="loadDashboardData()">Retry</button>
//           </div>
//
//           <div class="applications-grid" *ngIf="!isLoading && !error && applications && applications.length > 0">
//             <mat-card *ngFor="let app of applications" class="app-card" (click)="viewApplication(app.name)">
//               <mat-card-header>
//                 <mat-card-title>{{ app.name }}</mat-card-title>
//                 <mat-card-subtitle>{{ app.description }}</mat-card-subtitle>
//               </mat-card-header>
//               <mat-card-content>
//                 <p><strong>Status:</strong> {{ app.status }}</p>
//                 <p><strong>Endpoints:</strong> {{ app.endpointCount }}</p>
//                 <p><strong>Available Methods:</strong> {{ getUniqueMethods(app.endpoints).join(', ') }}</p>
//               </mat-card-content>
//               <mat-card-actions>
//                 <button mat-button color="primary">View Details</button>
//               </mat-card-actions>
//             </mat-card>
//           </div>
//
//           <div *ngIf="!isLoading && !error && (!applications || applications.length === 0)" class="no-applications">
//             <p>No applications found.</p>
//           </div>
//         </mat-card-content>
//       </mat-card>
//     </div>
//   `,
//   styles: [`
//     .dashboard-container {
//       padding: 20px;
//     }
//
//     .dashboard-stats {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//       gap: 16px;
//       margin-bottom: 24px;
//     }
//
//     .stat-card {
//       background: #f5f5f5;
//       padding: 20px;
//       border-radius: 8px;
//       text-align: center;
//     }
//
//     .stat-number {
//       font-size: 2em;
//       font-weight: bold;
//       color: #1976d2;
//       margin: 8px 0;
//     }
//
//     .stat-text {
//       font-size: 1.2em;
//       font-weight: 500;
//       margin: 8px 0;
//     }
//
//     .applications-card {
//       margin-top: 20px;
//     }
//
//     .applications-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
//       gap: 16px;
//       margin-top: 16px;
//     }
//
//     .app-card {
//       cursor: pointer;
//       transition: box-shadow 0.3s ease;
//     }
//
//     .app-card:hover {
//       box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//     }
//
//     .no-applications {
//       text-align: center;
//       padding: 40px;
//       color: #666;
//     }
//
//     .loading, .error {
//       text-align: center;
//       padding: 40px;
//       color: #666;
//     }
//
//     .error {
//       color: #d32f2f;
//     }
//   `]
// })
// export class DashboardComponent implements OnInit {
//   apiData: ApiResponse | null = null;
//   applications: ApplicationSummary[] = [];
//   isLoading: boolean = false;
//   error: string | null = null;
//
//   constructor(
//     private router: Router,
//     private http: HttpClient,
//     private configService: ConfigService
//
// ) {}
//
//   ngOnInit(): void {
//     this.loadDashboardData();
//   }
//
//   public loadDashboardData(): void {
//     this.isLoading = true;
//     this.error = null;
//     const baseUrl = this.configService.getBaseUrl();
//
//     this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`)
//       .subscribe({
//         next: (data) => {
//           this.apiData = data;
//           this.processApplicationsData(data);
//           this.isLoading = false;
//         },
//         error: (err) => {
//           console.error('Error loading dashboard data:', err);
//           this.error = 'Failed to load dashboard data';
//           this.isLoading = false;
//         }
//       });
//   }
//
//   private processApplicationsData(data: ApiResponse): void {
//     if (!data.applications?.applications) {
//       this.applications = [];
//       return;
//     }
//
//     this.applications = Object.keys(data.applications.applications).map(appName => {
//       const endpoints = data.applications.applications[appName];
//
//       return {
//         name: appName,
//         description: this.generateAppDescription(appName, endpoints),
//         status: 'Active', // You might want to determine this based on some logic
//         endpointCount: endpoints.length,
//         endpoints: endpoints
//       };
//     });
//   }
//
//   private generateAppDescription(appName: string, endpoints: any[]): string {
//     if (endpoints.length === 0) return 'No endpoints available';
//
//     const uniqueActions = new Set<string>();
//     endpoints.forEach(endpoint => {
//       endpoint.available_actions?.forEach((action: string) => uniqueActions.add(action));
//     });
//
//     const actionsText = Array.from(uniqueActions).join(', ');
//     return `${endpoints.length} endpoint${endpoints.length > 1 ? 's' : ''} with ${actionsText} operations`;
//   }
//
//   public getUniqueMethods(endpoints: any[]): string[] {
//     const methods = new Set<string>();
//     endpoints.forEach(endpoint => {
//       endpoint.methods?.forEach((method: string) => methods.add(method));
//     });
//     return Array.from(methods);
//   }
//
//   getFormattedDate(dateString: string | undefined): string {
//     if (!dateString) return 'N/A';
//
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//     } catch {
//       return 'Invalid Date';
//     }
//   }
//
//   viewApplication(appName: string): void {
//     this.router.navigate(['/app', appName]);
//   }
// }
// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service'; // Adjust path as needed
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
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

interface ApplicationSummary {
  name: string;
  description: string;
  status: string;
  endpointCount: number;
  endpoints: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>Total Applications</h3>
          <p class="stat-number">{{ apiData?.applications?.total_applications || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Total URLs</h3>
          <p class="stat-number">{{ apiData?.applications?.total_urls || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>API Version</h3>
          <p class="stat-text">{{ apiData?.applications?.api_version || 'N/A' }}</p>
        </div>
        <div class="stat-card">
          <h3>Schema Generated</h3>
          <p class="stat-text">{{ getFormattedDate(apiData?.applications?.schema_generated_on) }}</p>
        </div>
      </div>

      <mat-card class="applications-card">
        <mat-card-header>
          <mat-card-title>Applications</mat-card-title>
          <mat-card-subtitle>Click on an application to view its endpoints</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="loading" *ngIf="isLoading">
            <p>Loading applications...</p>
          </div>

          <div class="error" *ngIf="error">
            <p>Error loading applications: {{ error }}</p>
            <button mat-button color="primary" (click)="loadDashboardData()">Retry</button>
          </div>

          <div class="applications-grid" *ngIf="!isLoading && !error && applications && applications.length > 0">
            <mat-card *ngFor="let app of applications" class="app-card" (click)="viewApplication(app.name)">
              <mat-card-header>
                <mat-card-title>{{ app.name }}</mat-card-title>
                <mat-card-subtitle>{{ app.description }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p><strong>Status:</strong> {{ app.status }}</p>
                <p><strong>Endpoints:</strong> {{ app.endpointCount }}</p>
                <p><strong>Available Methods:</strong> {{ getUniqueMethods(app.endpoints).join(', ') }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">View Details</button>
              </mat-card-actions>
            </mat-card>
          </div>

          <div *ngIf="!isLoading && !error && (!applications || applications.length === 0)" class="no-applications">
            <p>No applications found.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
      margin: 8px 0;
    }

    .stat-text {
      font-size: 1.2em;
      font-weight: 500;
      margin: 8px 0;
    }

    .applications-card {
      margin-top: 20px;
    }

    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .app-card {
      cursor: pointer;
      transition: box-shadow 0.3s ease;
    }

    .app-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .no-applications {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading, .error {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error {
      color: #d32f2f;
    }
  `]
})
export class DashboardComponent implements OnInit {
  apiData: ApiResponse | null = null;
  applications: ApplicationSummary[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    // if (!this.authService.isLoggedIn()) {
    //   this.authService.logout();
    //   return;
    // }

    this.loadDashboardData();
  }

  public loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    const baseUrl = this.configService.getBaseUrl();

    // No need to manually add headers - the interceptor handles JWT automatically
    this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`)
      .subscribe({
        next: (data) => {
          this.apiData = data;
          this.processApplicationsData(data);
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
            this.error = 'Network error. Please check your connection.';
          } else {
            this.error = `Failed to load dashboard data (${err.status})`;
          }

          this.isLoading = false;
        }
      });
  }

  private processApplicationsData(data: ApiResponse): void {
    if (!data.applications?.applications) {
      this.applications = [];
      return;
    }

    this.applications = Object.keys(data.applications.applications).map(appName => {
      const endpoints = data.applications.applications[appName];

      return {
        name: appName,
        description: this.generateAppDescription(appName, endpoints),
        status: 'Active', // You might want to determine this based on some logic
        endpointCount: endpoints.length,
        endpoints: endpoints
      };
    });
  }

  private generateAppDescription(appName: string, endpoints: any[]): string {
    if (endpoints.length === 0) return 'No endpoints available';

    const uniqueActions = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.available_actions?.forEach((action: string) => uniqueActions.add(action));
    });

    const actionsText = Array.from(uniqueActions).join(', ');
    return `${endpoints.length} endpoint${endpoints.length > 1 ? 's' : ''} with ${actionsText} operations`;
  }

  public getUniqueMethods(endpoints: any[]): string[] {
    const methods = new Set<string>();
    endpoints.forEach(endpoint => {
      endpoint.methods?.forEach((method: string) => methods.add(method));
    });
    return Array.from(methods);
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid Date';
    }
  }

  viewApplication(appName: string): void {
    this.router.navigate(['/app', appName]);
  }

  private handleAuthError(): void {
    // Use your existing AuthService logout method
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }
}
