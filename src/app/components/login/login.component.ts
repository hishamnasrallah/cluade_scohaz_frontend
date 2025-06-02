// components/login/login.component.ts - ENHANCED Professional Design
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
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
    MatCheckboxModule
  ],
  template: `
    <div class="login-layout">
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
      </div>

      <!-- Login Container -->
      <div class="login-container">
        <!-- Left Side - Branding -->
        <div class="branding-section">
          <div class="branding-content">
            <div class="logo-section">
              <div class="logo-icon">
                <mat-icon>dashboard</mat-icon>
              </div>
              <h1 class="logo-text">LowCode Pro</h1>
            </div>

            <div class="welcome-content">
              <h2 class="welcome-title">Welcome Back</h2>
              <p class="welcome-subtitle">
                Sign in to access your enterprise low-code platform and continue building amazing applications.
              </p>

              <div class="features-list">
                <div class="feature-item">
                  <div class="feature-icon">
                    <mat-icon>speed</mat-icon>
                  </div>
                  <div class="feature-text">
                    <h4>Rapid Development</h4>
                    <p>Build applications 10x faster</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon">
                    <mat-icon>api</mat-icon>
                  </div>
                  <div class="feature-text">
                    <h4>API Management</h4>
                    <p>Comprehensive API toolkit</p>
                  </div>
                </div>

                <div class="feature-item">
                  <div class="feature-icon">
                    <mat-icon>security</mat-icon>
                  </div>
                  <div class="feature-text">
                    <h4>Enterprise Security</h4>
                    <p>Bank-grade security standards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="form-section">
          <div class="form-container">
            <!-- Header -->
            <div class="form-header">
              <h2 class="form-title">Sign In</h2>
              <p class="form-subtitle">Enter your credentials to access your account</p>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
              <!-- Username Field -->
              <div class="form-field">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Username</mat-label>
                  <input matInput
                         formControlName="username"
                         placeholder="Enter your username"
                         autocomplete="username">
                  <mat-icon matSuffix class="field-icon">person</mat-icon>
                  <mat-error *ngIf="loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched">
                    Username is required
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Password Field -->
              <div class="form-field">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput
                         [type]="hidePassword ? 'password' : 'text'"
                         formControlName="password"
                         placeholder="Enter your password"
                         autocomplete="current-password">
                  <button mat-icon-button
                          matSuffix
                          (click)="togglePasswordVisibility()"
                          type="button"
                          class="password-toggle">
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
                    Password is required
                  </mat-error>
                  <mat-error *ngIf="loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched">
                    Password must be at least 6 characters
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Remember Me -->
              <div class="form-options">
                <mat-checkbox class="remember-me" formControlName="rememberMe">
                  Remember me
                </mat-checkbox>
                <a href="#" class="forgot-password" (click)="$event.preventDefault()">
                  Forgot password?
                </a>
              </div>

              <!-- Submit Button -->
              <button type="submit"
                      mat-raised-button
                      class="login-button"
                      [disabled]="!loginForm.valid || isLoading">
                <span class="button-content" *ngIf="!isLoading">
                  <mat-icon>login</mat-icon>
                  Sign In
                </span>
                <span class="button-content loading" *ngIf="isLoading">
                  <mat-spinner diameter="20"></mat-spinner>
                  Signing In...
                </span>
              </button>

              <!-- Error Message -->
              <div class="error-message" *ngIf="errorMessage">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            </form>

            <!-- Footer -->
            <div class="form-footer">
              <p class="footer-text">
                Don't have an account?
                <a href="#" class="footer-link" (click)="$event.preventDefault()">
                  Contact administrator
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-content">
          <mat-spinner diameter="60"></mat-spinner>
          <p>Authenticating...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* Background Elements */
    .background-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .floating-shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;

      &.shape-1 {
        width: 100px;
        height: 100px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 150px;
        height: 150px;
        top: 20%;
        right: 15%;
        animation-delay: 2s;
      }

      &.shape-3 {
        width: 80px;
        height: 80px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }

      &.shape-4 {
        width: 120px;
        height: 120px;
        bottom: 15%;
        right: 10%;
        animation-delay: 1s;
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }

    /* Login Container */
    .login-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      min-height: 600px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Branding Section */
    .branding-section {
      background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
      color: white;
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="50" cy="30" r="1.5" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="30" cy="60" r="1.5" fill="white" opacity="0.1"/><circle cx="70" cy="70" r="2" fill="white" opacity="0.1"/></svg>');
        opacity: 0.3;
      }
    }

    .branding-content {
      position: relative;
      z-index: 1;
    }

    .logo-section {
      margin-bottom: 48px;
      text-align: center;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .welcome-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 16px 0;
      line-height: 1.2;
    }

    .welcome-subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
      line-height: 1.6;
      margin: 0 0 40px 0;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #667eea;
      }
    }

    .feature-text {
      h4 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px 0;
      }

      p {
        font-size: 0.9rem;
        opacity: 0.8;
        margin: 0;
      }
    }

    /* Form Section */
    .form-section {
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-container {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .form-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 1rem;
    }

    /* Form Styling */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-field {
      position: relative;

      .mat-mdc-form-field {
        width: 100%;

        ::ng-deep {
          .mat-mdc-text-field-wrapper {
            background: rgba(248, 250, 252, 0.8);
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .mdc-text-field--outlined .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #e2e8f0;
              border-width: 2px;
            }
          }

          &:hover .mdc-text-field--outlined .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #667eea;
            }
          }

          &.mat-focused .mdc-text-field--outlined .mdc-notched-outline {
            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: #667eea;
              border-width: 2px;
            }
          }

          .mat-mdc-form-field-label {
            color: #64748b;
            font-weight: 500;
          }

          .mat-mdc-input-element {
            color: #334155;
            font-size: 1rem;
          }
        }
      }
    }

    .field-icon,
    .password-toggle {
      color: #94a3b8;
      transition: color 0.3s ease;
    }

    .password-toggle:hover {
      color: #667eea;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .remember-me {
      ::ng-deep .mat-mdc-checkbox-label {
        color: #64748b;
        font-size: 0.9rem;
      }
    }

    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.3s ease;

      &:hover {
        color: #5a67d8;
        text-decoration: underline;
      }
    }

    .login-button {
      width: 100%;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        &.loading {
          gap: 12px;
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      border: 1px solid rgba(239, 68, 68, 0.2);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .footer-text {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }

    .footer-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;

      &:hover {
        color: #5a67d8;
        text-decoration: underline;
      }
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      text-align: center;
      color: white;

      p {
        margin-top: 24px;
        font-size: 1.1rem;
        font-weight: 500;
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .login-container {
        grid-template-columns: 1fr;
        max-width: 500px;
      }

      .branding-section {
        display: none;
      }

      .form-section {
        padding: 40px 32px;
      }
    }

    @media (max-width: 768px) {
      .login-layout {
        padding: 16px;
      }

      .login-container {
        border-radius: 16px;
        min-height: auto;
      }

      .form-section {
        padding: 32px 24px;
      }

      .form-title {
        font-size: 1.75rem;
      }

      .login-button {
        height: 52px;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        border-radius: 12px;
      }

      .form-section {
        padding: 24px 20px;
      }

      .form-title {
        font-size: 1.5rem;
      }

      .login-button {
        height: 48px;
        font-size: 0.9rem;
      }

      .form-options {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = {
        username: this.loginForm.value.username,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.snackBar.open('✅ Welcome back! Login successful.', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Login error:', err);

          // Set user-friendly error messages
          if (err.status === 401) {
            this.errorMessage = 'Invalid username or password. Please try again.';
          } else if (err.status === 403) {
            this.errorMessage = 'Access denied. Please contact your administrator.';
          } else if (err.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check your connection.';
          } else {
            this.errorMessage = 'Login failed. Please try again later.';
          }

          this.snackBar.open('❌ Login failed. Please check your credentials.', 'Close', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });

    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });

      this.errorMessage = 'Please fill in all required fields correctly.';
      this.snackBar.open('Please complete all required fields', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
}
