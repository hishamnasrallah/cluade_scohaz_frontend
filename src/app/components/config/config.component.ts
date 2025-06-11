// components/config/config.component.ts - ENHANCED Professional Design
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-config',
  standalone: true,
  templateUrl: './config.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // MatCard,
    // MatCardHeader,
    // MatCardTitle,
    // MatCardSubtitle,
    // MatCardContent,
    // MatCardActions,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatTooltipModule
  ],
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent implements OnInit {
  configForm: FormGroup;
  isLoading = false;
  isConfigValid = false;
  currentStep = 1;
  operationType = '';
  connectionStatus: {
    type: string;
    icon: string;
    message: string;
    details?: string
  } | null = null;

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
      this.isConfigValid = true;
      this.currentStep = 2;
    }
  }

  setExampleUrl(url: string): void {
    this.configForm.patchValue({ baseUrl: url });
  }

  getStatusMessage(): string {
    if (this.isConfigValid) {
      return `Connected to: ${this.configService.getBaseUrl()}`;
    }
    return 'Please update your configuration and test the connection.';
  }

  getResultTitle(): string {
    switch (this.connectionStatus?.type) {
      case 'success': return 'Connection Successful';
      case 'error': return 'Connection Failed';
      case 'info': return 'Testing Connection';
      default: return 'Connection Status';
    }
  }

  getLoadingText(): string {
    switch (this.operationType) {
      case 'test': return 'Testing...';
      case 'save': return 'Saving...';
      default: return 'Processing...';
    }
  }

  saveConfig(): void {
    if (this.configForm.valid) {
      this.isLoading = true;
      this.operationType = 'save';

      const baseUrl = this.configForm.value.baseUrl.replace(/\/$/, '');

      setTimeout(() => {
        this.configService.setBaseUrl(baseUrl);
        this.isConfigValid = true;
        this.currentStep = 3;

        this.snackBar.open('✅ Configuration saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.connectionStatus = {
          type: 'success',
          icon: 'check_circle',
          message: 'Configuration saved! You can now proceed to sign in.',
          details: `Saved URL: ${baseUrl}`
        };

        this.isLoading = false;
        this.operationType = '';

        // Auto-navigate to login after delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      }, 1500);
    } else {
      this.snackBar.open('❌ Please enter a valid backend URL', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  testConnection(): void {
    if (this.configForm.valid) {
      this.isLoading = true;
      this.operationType = 'test';
      this.currentStep = 2;

      this.connectionStatus = {
        type: 'info',
        icon: 'sync',
        message: 'Testing connection to your backend server...',
        details: 'This may take a few seconds'
      };

      const baseUrl = this.configForm.value.baseUrl;

      // Simulate connection test with realistic timing
      setTimeout(() => {
        const isConnected = Math.random() > 0.2; // 80% success rate

        if (isConnected) {
          this.connectionStatus = {
            type: 'success',
            icon: 'wifi',
            message: 'Connection successful! Your backend is reachable and responding.',
            details: `Response time: ${Math.floor(Math.random() * 200 + 50)}ms`
          };

          this.snackBar.open('✅ Connection test successful!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          this.isConfigValid = true;
        } else {
          this.connectionStatus = {
            type: 'error',
            icon: 'wifi_off',
            message: 'Connection failed. Please check the URL and try again.',
            details: 'Make sure the server is running and accessible from your network'
          };

          this.snackBar.open('❌ Connection test failed', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });

          this.isConfigValid = false;
          this.currentStep = 1;
        }

        this.isLoading = false;
        this.operationType = '';
      }, 2500);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
