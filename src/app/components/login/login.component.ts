// components/login/login.component.ts - COMPLETE WITH TRANSLATIONS
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRippleModule,
    MatMenuModule,
    TranslatePipe,
    MatTooltip
  ],
  template: `
    <div class="login-layout">
      <!-- Ocean Mint Background -->
      <div class="ocean-mint-bg">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
      </div>

      <!-- Login Container -->
      <div class="login-container">
        <!-- Left Side - Branding -->
        <div class="branding-section">
          <div class="branding-content">
            <div class="logo-wrapper">
              <div class="logo-icon">
                <mat-icon>dashboard</mat-icon>
              </div>
              <h1 class="brand-name">PraXelo</h1>
              <p class="brand-cheer">{{ 'brand_tagline' | translate }}</p>
            </div>

            <div class="features-showcase">
              <h2 class="showcase-title">{{ 'build_faster_deploy_smarter' | translate }}</h2>
              <p class="showcase-subtitle">
                {{ 'platform_description' | translate }}
              </p>

              <div class="feature-cards">
                <div class="feature-card" matRipple>
                  <div class="feature-icon">
                    <mat-icon>speed</mat-icon>
                  </div>
                  <div class="feature-content">
                    <h4>{{ 'feature_faster' | translate }}</h4>
                    <p>{{ 'feature_faster_desc' | translate }}</p>
                  </div>
                </div>

                <div class="feature-card" matRipple>
                  <div class="feature-icon">
                    <mat-icon>api</mat-icon>
                  </div>
                  <div class="feature-content">
                    <h4>{{ 'feature_api' | translate }}</h4>
                    <p>{{ 'feature_api_desc' | translate }}</p>
                  </div>
                </div>

                <div class="feature-card" matRipple>
                  <div class="feature-icon">
                    <mat-icon>security</mat-icon>
                  </div>
                  <div class="feature-content">
                    <h4>{{ 'feature_secure' | translate }}</h4>
                    <p>{{ 'feature_secure_desc' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="branding-footer">
              <p>&copy; 2025 PraXelo. {{ 'all_rights_reserved' | translate }}</p>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="form-section">
          <div class="form-wrapper">
            <!-- Language Selector -->
            <div class="language-selector">
              <button mat-icon-button [matMenuTriggerFor]="languageMenu" matTooltip="{{ 'change_language' | translate }}">
                <mat-icon>language</mat-icon>
              </button>
              <mat-menu #languageMenu="matMenu">
                <button mat-menu-item *ngFor="let lang of availableLanguages" (click)="changeLanguage(lang.code)">
                  <span class="language-option">
                    <span class="flag">{{ lang.flag }}</span>
                    <span>{{ lang.name }}</span>
                  </span>
                </button>
              </mat-menu>
            </div>

            <!-- Compact Header -->
            <div class="form-header">
              <div class="header-icon">
                <mat-icon>login</mat-icon>
              </div>
              <div class="header-text">
                <h2>{{ 'login_title' | translate }}</h2>
                <p>{{ 'login_subtitle' | translate }}</p>
              </div>
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
              <!-- Username Field -->
              <mat-form-field appearance="outline" class="form-field-ocean">
                <mat-label>{{ 'username' | translate }}</mat-label>
                <input matInput
                       formControlName="username"
                       [placeholder]="'enter_username' | translate"
                       autocomplete="username">
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  {{ 'username_required' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="form-field-ocean">
                <mat-label>{{ 'password' | translate }}</mat-label>
                <input matInput
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       [placeholder]="'enter_password' | translate"
                       autocomplete="current-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button
                        matSuffix
                        (click)="togglePasswordVisibility()"
                        type="button"
                        class="toggle-btn">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  {{ 'password_required' | translate }}
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  {{ 'password_min_length' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Options Row -->
              <div class="form-options">
                <mat-checkbox formControlName="rememberMe" class="remember-checkbox">
                  {{ 'remember_me' | translate }}
                </mat-checkbox>
                <a href="#" class="forgot-link" (click)="$event.preventDefault()">
                  {{ 'forgot_password' | translate }}
                </a>
              </div>

              <!-- Submit Button -->
              <button type="submit"
                      mat-raised-button
                      class="login-button"
                      [disabled]="!loginForm.valid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">
                  <mat-icon>login</mat-icon>
                  {{ 'sign_in' | translate }}
                </span>
              </button>

              <!-- Error Message -->
              <div class="error-card" *ngIf="errorMessage">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
            </form>

            <!-- Footer -->
            <div class="form-footer">
              <p>{{ 'no_account' | translate }}</p>
              <a href="#" class="contact-link" (click)="$event.preventDefault()">
                {{ 'contact_admin' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: #F4FDFD;
    }

    /* Ocean Mint Background */
    .ocean-mint-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 0;
    }

    .wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      opacity: 0.1;
      border-radius: 1000px 1000px 0 0;
      animation: wave 10s ease-in-out infinite;
    }

    .wave-1 {
      animation-delay: 0s;
      height: 280px;
    }

    .wave-2 {
      animation-delay: 3s;
      height: 320px;
      opacity: 0.08;
    }

    .wave-3 {
      animation-delay: 6s;
      height: 300px;
      opacity: 0.05;
    }

    @keyframes wave {
      0%, 100% {
        transform: translateX(0) translateY(0);
      }
      50% {
        transform: translateX(-50px) translateY(-20px);
      }
    }

    .floating-shape {
      position: absolute;
      background: linear-gradient(135deg, #48f1d4 0%, #B3F0E5 100%);
      border-radius: 50%;
      animation: float 2.5s ease-in-out infinite;
    }

    .shape-1 {
      width: 150px;
      height: 150px;
      top: 15%;
      left: 10%;
    }

    .shape-2 {
      width: 190px;
      height: 190px;
      top: 20%;
      right: 15%;
      animation-delay: 1.5s;
    }

    .shape-3 {
      width: 250px;
      height: 250px;
      bottom: 25%;
      left: 17%;
      animation-delay: 2s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(10deg);
      }
    }

    /* Login Container */
    .login-container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      min-height: 600px;
      margin: 20px;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(47, 72, 88, 0.15);
      border: 1px solid rgba(196, 247, 239, 0.5);
      overflow: hidden;
      animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Branding Section */
    .branding-section {
      background: linear-gradient(135deg, #2F4858 0%, #3A5A6C 100%);
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .branding-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(196, 247, 239, 0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .branding-content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .logo-wrapper {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      box-shadow: 0 8px 24px rgba(52, 197, 170, 0.3);

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }
    }

    .brand-name {
      font-size: 2rem;
      font-weight: 800;
      color: white;
      margin: 0;
      font-family: 'Poppins', sans-serif;
    }

    .brand-tagline {
      color: #C4F7EF;
      margin: 4px 0 0 0;
      font-size: 0.95rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .brand-cheer {
      color: #C4F7EF;
      margin: 4px 0 0 0;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.03rem;
    }

    .features-showcase {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .showcase-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: white;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }

    .showcase-subtitle {
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .feature-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateX(4px);
      }
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      background: rgba(52, 197, 170, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        color: #34C5AA;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .feature-content h4 {
      font-size: 1rem;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .feature-content p {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }

    .branding-footer {
      text-align: center;
      padding-top: 24px;
      margin-top: auto;

      p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
        margin: 0;
      }
    }

    /* Form Section */
    .form-section {
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FAFBFC;
    }

    .form-wrapper {
      width: 100%;
      max-width: 380px;
      position: relative;
    }

    /* Language Selector */
    .language-selector {
      position: absolute;
      top: -32px;
      right: -16px;
      z-index: 10;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .flag {
        font-size: 1.2rem;
      }
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(52, 197, 170, 0.25);

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .header-text h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      font-family: 'Poppins', sans-serif;
    }

    .header-text p {
      color: #6B7280;
      margin: 4px 0 0 0;
      font-size: 0.9rem;
    }

    /* Login Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field-ocean {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: white;
          border-radius: 12px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #E5E7EB;
            border-width: 2px;
          }
        }

        &:hover .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #C4F7EF;
          }
        }

        &.mat-focused .mdc-text-field--outlined .mdc-notched-outline {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #34C5AA;
            border-width: 2px;
          }
        }

        .mat-mdc-form-field-label {
          color: #6B7280;
        }

        &.mat-focused .mat-mdc-form-field-label {
          color: #34C5AA;
        }

        .mat-mdc-form-field-icon-prefix {
          color: #9CA3AF;
          margin-right: 12px;
        }

        &.mat-focused .mat-mdc-form-field-icon-prefix {
          color: #34C5AA;
        }

        .mat-mdc-input-element {
          color: #2F4858;
          font-size: 1rem;
        }
      }
    }

    .toggle-btn {
      color: #9CA3AF;

      &:hover {
        color: #34C5AA;
      }
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
    }

    .remember-checkbox {
      ::ng-deep {
        .mdc-checkbox__background {
          border-color: #D1D5DB !important;
        }

        &.mat-mdc-checkbox-checked .mdc-checkbox__background {
          background-color: #34C5AA !important;
          border-color: #34C5AA !important;
        }

        .mat-mdc-checkbox-label {
          color: #6B7280;
          font-size: 0.9rem;
        }
      }
    }

    .forgot-link {
      color: #34C5AA;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover {
        color: #2BA99B;
        text-decoration: underline;
      }
    }

    .login-button {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(52, 197, 170, 0.25);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 197, 170, 0.35);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      mat-spinner {
        margin-right: 8px;
      }
    }

    .error-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      color: #DC2626;
      font-size: 0.9rem;
      animation: shake 0.5s ease-in-out;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-5px);
      }
      75% {
        transform: translateX(5px);
      }
    }

    .form-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;

      p {
        color: #6B7280;
        margin: 0 0 8px 0;
        font-size: 0.9rem;
      }

      .contact-link {
        color: #34C5AA;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;

        &:hover {
          color: #2BA99B;
          text-decoration: underline;
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 968px) {
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

    @media (max-width: 480px) {
      .login-container {
        margin: 16px;
        border-radius: 20px;
      }

      .form-section {
        padding: 32px 24px;
      }

      .form-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .form-options {
        flex-direction: column;
        gap: 12px;
        align-items: center;
      }
    }
    :host-context(body.rtl) {
      // Your RTL-specific styles
      .header {
        flex-direction: row-reverse;
      }

      .content {
        text-align: right;
      }

      // Flip margins and paddings
      .element {
        margin-left: 0;
        margin-right: 16px;
        padding-left: 0;
        padding-right: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private translationService: TranslationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes to update error messages
    this.translationService.languageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Re-translate error message if it exists
        if (this.errorMessage) {
          this.updateErrorMessage();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  changeLanguage(languageCode: string): void {
    this.translationService.setLanguage(languageCode).subscribe();
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
          const successMessage = this.translationService.instant('login_success');
          this.snackBar.open(`✅ ${successMessage}`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Login error:', err);
          this.setErrorMessage(err.status);

          const errorTitle = this.translationService.instant('login_failed');
          this.snackBar.open(`❌ ${errorTitle}`, 'Close', {
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

      this.errorMessage = this.translationService.instant('fill_required_fields');
      const warningMessage = this.translationService.instant('complete_all_fields');
      this.snackBar.open(warningMessage, 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private setErrorMessage(status: number): void {
    if (status === 401) {
      this.errorMessage = this.translationService.instant('invalid_credentials');
    } else if (status === 403) {
      this.errorMessage = this.translationService.instant('access_denied');
    } else if (status === 0) {
      this.errorMessage = this.translationService.instant('connection_error');
    } else {
      this.errorMessage = this.translationService.instant('login_failed');
    }
  }

  private updateErrorMessage(): void {
    // Re-translate the current error message
    if (this.errorMessage) {
      // This will re-apply the translation for the current error
      this.setErrorMessage(401); // Default to generic error
    }
  }
}
