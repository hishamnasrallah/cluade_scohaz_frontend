// components/config/config.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../services/config.service';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-config',
  standalone: true,
  template: `
    <div class="config-container">
      <mat-card class="config-card">
        <mat-card-header>
          <mat-card-title>Backend Configuration</mat-card-title>
          <mat-card-subtitle>Configure your backend URL to get started</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="configForm" (ngSubmit)="saveConfig()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Backend URL</mat-label>
              <input matInput
                     formControlName="baseUrl"
                     placeholder="https://your-backend.com"
                     type="url">
              <mat-icon matSuffix>link</mat-icon>
              <mat-error *ngIf="configForm.get('baseUrl')?.hasError('required')">
                Backend URL is required
              </mat-error>
              <mat-error *ngIf="configForm.get('baseUrl')?.hasError('pattern')">
                Please enter a valid URL (must start with http:// or https://)
              </mat-error>
            </mat-form-field>

            <div class="config-info" *ngIf="configService.isConfigured()">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <span>Configuration is already set. You can update it or proceed to dashboard.</span>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions class="action-buttons">
          <button mat-raised-button
                  color="primary"
                  (click)="saveConfig()"
                  [disabled]="!configForm.valid || isLoading">
            <mat-icon>save</mat-icon>
            {{ isLoading ? 'Saving...' : 'Save Configuration' }}
          </button>

          <button mat-button
                  color="accent"
                  (click)="testConnection()"
                  [disabled]="!configForm.valid || isLoading"
                  *ngIf="configForm.get('baseUrl')?.value">
            <mat-icon>wifi</mat-icon>
            Test Connection
          </button>

          <button mat-button
                  (click)="goToDashboard()"
                  *ngIf="configService.isConfigured()">
            <mat-icon>dashboard</mat-icon>
            Go to Dashboard
          </button>
        </mat-card-actions>
      </mat-card>

      <!-- Connection Status Card -->
      <mat-card class="status-card" *ngIf="connectionStatus">
        <mat-card-content>
          <div class="status-content" [ngClass]="connectionStatus.type">
            <mat-icon>{{ connectionStatus.icon }}</mat-icon>
            <span>{{ connectionStatus.message }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  styles: [`
    .config-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .config-card {
      width: 100%;
      max-width: 500px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      border-radius: 12px;
    }

    .status-card {
      width: 100%;
      max-width: 500px;
      margin-top: 16px;
      border-radius: 8px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      padding: 16px 24px;
    }

    .action-buttons button {
      min-width: 140px;
    }

    .config-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e8f5e8;
      border-radius: 4px;
      margin-top: 8px;
      color: #2e7d32;
    }

    .success-icon {
      color: #4caf50;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 4px;
    }

    .status-content.success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-content.error {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-content.info {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    mat-card-header {
      text-align: center;
      padding-bottom: 8px;
    }

    mat-card-title {
      font-size: 24px;
      font-weight: 500;
    }

    mat-card-subtitle {
      font-size: 14px;
      opacity: 0.7;
      margin-top: 8px;
    }

    button[mat-raised-button] {
      height: 44px;
    }

    button[mat-button] {
      height: 44px;
    }

    @media (max-width: 600px) {
      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class ConfigComponent implements OnInit {
  configForm: FormGroup;
  isLoading = false;
  connectionStatus: { type: string; icon: string; message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    public configService: ConfigService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.configForm = this.fb.group({
      baseUrl: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]]
    });
  }

  ngOnInit(): void {
    const currentUrl = this.configService.getBaseUrl();
    if (currentUrl) {
      this.configForm.patchValue({ baseUrl: currentUrl });
    }
  }

  saveConfig(): void {
    if (this.configForm.valid) {
      this.isLoading = true;

      const baseUrl = this.configForm.value.baseUrl.replace(/\/$/, ''); // Remove trailing slash

      // Simulate saving process
      setTimeout(() => {
        this.configService.setBaseUrl(baseUrl);
        this.snackBar.open('Configuration saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.connectionStatus = {
          type: 'success',
          icon: 'check_circle',
          message: 'Configuration saved! You can now proceed to login.'
        };

        this.isLoading = false;

        // Auto-navigate to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }, 1000);
    } else {
      this.snackBar.open('Please enter a valid backend URL', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  testConnection(): void {
    if (this.configForm.valid) {
      this.isLoading = true;
      this.connectionStatus = {
        type: 'info',
        icon: 'sync',
        message: 'Testing connection...'
      };

      const baseUrl = this.configForm.value.baseUrl;

      // Simulate connection test
      setTimeout(() => {
        // In a real application, you would make an HTTP request to test the connection
        // For now, we'll simulate a successful connection
        const isConnected = Math.random() > 0.3; // 70% success rate for demo

        if (isConnected) {
          this.connectionStatus = {
            type: 'success',
            icon: 'wifi',
            message: 'Connection successful! Backend is reachable.'
          };
          this.snackBar.open('Connection test successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.connectionStatus = {
            type: 'error',
            icon: 'wifi_off',
            message: 'Connection failed. Please check the URL and try again.'
          };
          this.snackBar.open('Connection test failed', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }

        this.isLoading = false;
      }, 2000);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
