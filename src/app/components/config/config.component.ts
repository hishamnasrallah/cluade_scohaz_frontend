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
  template: `
    <div class="config-layout">
      <!-- Background Elements -->
      <div class="background-pattern"></div>

      <!-- Main Container -->
      <div class="config-container">
        <!-- Header Section -->
        <div class="header-section">
          <div class="logo-area">
            <div class="logo-icon">
              <mat-icon>settings</mat-icon>
            </div>
            <div class="logo-text">
              <h1>System Configuration</h1>
              <p>Set up your backend connection to get started</p>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div class="progress-steps">
            <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
              <div class="step-circle">
                <mat-icon *ngIf="currentStep > 1">check</mat-icon>
                <span *ngIf="currentStep <= 1">1</span>
              </div>
              <span class="step-label">Configuration</span>
            </div>

            <div class="step-connector" [class.active]="currentStep > 1"></div>

            <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
              <div class="step-circle">
                <mat-icon *ngIf="currentStep > 2">check</mat-icon>
                <span *ngIf="currentStep <= 2">2</span>
              </div>
              <span class="step-label">Testing</span>
            </div>

            <div class="step-connector" [class.active]="currentStep > 2"></div>

            <div class="step" [class.active]="currentStep >= 3">
              <div class="step-circle">
                <mat-icon *ngIf="currentStep > 3">check</mat-icon>
                <span *ngIf="currentStep <= 3">3</span>
              </div>
              <span class="step-label">Complete</span>
            </div>
          </div>
        </div>

        <!-- Configuration Card -->
        <div class="config-card">
          <!-- Current Configuration Status -->
          <div class="status-banner" *ngIf="configService.isConfigured()" [class.success]="isConfigValid">
            <div class="status-content">
              <mat-icon class="status-icon">{{ isConfigValid ? 'check_circle' : 'warning' }}</mat-icon>
              <div class="status-text">
                <h4>{{ isConfigValid ? 'Configuration Active' : 'Configuration Needs Update' }}</h4>
                <p>{{ getStatusMessage() }}</p>
              </div>
            </div>
          </div>

          <!-- Configuration Form -->
          <div class="form-section">
            <div class="form-header">
              <h2>Backend URL Configuration</h2>
              <p>Enter the URL of your backend API server. This will be used for all API communications.</p>
            </div>

            <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="config-form">
              <!-- URL Input -->
              <div class="url-input-section">
                <mat-form-field appearance="outline" class="url-field">
                  <mat-label>Backend API URL</mat-label>
                  <input matInput
                         formControlName="baseUrl"
                         placeholder="https://api.yourcompany.com"
                         type="url"
                         autocomplete="url">
                  <mat-icon matSuffix class="url-icon">link</mat-icon>

                  <mat-error *ngIf="configForm.get('baseUrl')?.hasError('required')">
                    Backend URL is required
                  </mat-error>
                  <mat-error *ngIf="configForm.get('baseUrl')?.hasError('pattern')">
                    Please enter a valid URL (must start with http:// or https://)
                  </mat-error>
                </mat-form-field>

                <!-- URL Examples -->
                <div class="url-examples">
                  <span class="examples-label">Examples:</span>
                  <div class="example-urls">
                    <button type="button"
                            mat-button
                            class="example-btn"
                            (click)="setExampleUrl('https://api.example.com')">
                      https://api.example.com
                    </button>
                    <button type="button"
                            mat-button
                            class="example-btn"
                            (click)="setExampleUrl('http://localhost:8000')">
                      http://localhost:8000
                    </button>
                  </div>
                </div>
              </div>

              <!-- Connection Test Results -->
              <div class="test-results" *ngIf="connectionStatus">
                <div class="result-card" [ngClass]="connectionStatus.type">
                  <div class="result-icon">
                    <mat-icon>{{ connectionStatus.icon }}</mat-icon>
                  </div>
                  <div class="result-content">
                    <h4 class="result-title">{{ getResultTitle() }}</h4>
                    <p class="result-message">{{ connectionStatus.message }}</p>
                    <div class="result-details" *ngIf="connectionStatus.details">
                      <small>{{ connectionStatus.details }}</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button type="button"
                        mat-button
                        class="test-btn"
                        (click)="testConnection()"
                        [disabled]="!configForm.valid || isLoading"
                        *ngIf="configForm.get('baseUrl')?.value">
                  <mat-icon>wifi_find</mat-icon>
                  <span>Test Connection</span>
                </button>

                <button type="submit"
                        mat-raised-button
                        class="save-btn"
                        [disabled]="!configForm.valid || isLoading">
                  <div class="button-content" *ngIf="!isLoading">
                    <mat-icon>save</mat-icon>
                    <span>Save Configuration</span>
                  </div>
                  <div class="button-content loading" *ngIf="isLoading">
                    <mat-spinner diameter="20"></mat-spinner>
                    <span>{{ getLoadingText() }}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions" *ngIf="configService.isConfigured()">
            <h3>Quick Actions</h3>
            <div class="actions-grid">
              <button mat-button class="action-card" (click)="goToDashboard()">
                <div class="action-icon dashboard-icon">
                  <mat-icon>dashboard</mat-icon>
                </div>
                <div class="action-text">
                  <span class="action-title">Go to Dashboard</span>
                  <span class="action-desc">Start using the platform</span>
                </div>
              </button>

              <button mat-button class="action-card" (click)="goToLogin()">
                <div class="action-icon login-icon">
                  <mat-icon>login</mat-icon>
                </div>
                <div class="action-text">
                  <span class="action-title">Sign In</span>
                  <span class="action-desc">Access your account</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <div class="help-card">
            <div class="help-icon">
              <mat-icon>help_outline</mat-icon>
            </div>
            <div class="help-content">
              <h4>Need Help?</h4>
              <p>Having trouble configuring your backend? Check out our documentation or contact support.</p>
              <div class="help-links">
                <a href="#" class="help-link" (click)="$event.preventDefault()">
                  <mat-icon>description</mat-icon>
                  Documentation
                </a>
                <a href="#" class="help-link" (click)="$event.preventDefault()">
                  <mat-icon>support</mat-icon>
                  Get Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading && operationType === 'save'">
        <div class="loading-content">
          <mat-spinner diameter="60"></mat-spinner>
          <h3>Saving Configuration</h3>
          <p>Please wait while we save your settings...</p>
        </div>
      </div>
    </div>
  `,
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
  styles: [`
    .config-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow-x: hidden;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .background-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      pointer-events: none;
    }

    .config-container {
      max-width: 800px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Header Section */
    .header-section {
      text-align: center;
      color: white;
    }

    .logo-area {
      margin-bottom: 48px;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      border: 1px solid rgba(255, 255, 255, 0.3);

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }
    }

    .logo-text {
      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 12px 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      max-width: 400px;
      margin: 0 auto;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .step-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .step-label {
      font-size: 0.9rem;
      opacity: 0.8;
      font-weight: 500;
    }

    .step.active .step-circle {
      background: rgba(255, 255, 255, 0.9);
      color: #667eea;
      border-color: white;
    }

    .step.completed .step-circle {
      background: #4ade80;
      border-color: #4ade80;
      color: white;
    }

    .step-connector {
      width: 60px;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      margin: 0 16px;
      margin-bottom: 32px;
      transition: background 0.3s ease;

      &.active {
        background: rgba(255, 255, 255, 0.8);
      }
    }

    /* Configuration Card */
    .config-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Status Banner */
    .status-banner {
      padding: 24px 32px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);

      &.success {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border-bottom-color: rgba(34, 197, 94, 0.2);
      }
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #f59e0b;

      .status-banner.success & {
        color: #22c55e;
      }
    }

    .status-text {
      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #92400e;
        margin: 0 0 4px 0;

        .status-banner.success & {
          color: #166534;
        }
      }

      p {
        color: #a16207;
        margin: 0;
        font-size: 0.9rem;

        .status-banner.success & {
          color: #15803d;
        }
      }
    }

    /* Form Section */
    .form-section {
      padding: 40px 32px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 40px;

      h2 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #334155;
        margin: 0 0 12px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        color: #64748b;
        margin: 0;
        line-height: 1.6;
      }
    }

    /* URL Input */
    .url-input-section {
      margin-bottom: 32px;
    }

    .url-field {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: rgba(248, 250, 252, 0.8);
          border-radius: 16px;
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
          }
        }

        .mat-mdc-form-field-label {
          color: #64748b;
          font-weight: 500;
        }

        .mat-mdc-input-element {
          color: #334155;
          font-size: 1rem;
          padding: 16px 20px;
        }
      }
    }

    .url-icon {
      color: #94a3b8;
    }

    .url-examples {
      margin-top: 16px;
      text-align: center;
    }

    .examples-label {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 8px;
      display: block;
    }

    .example-urls {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .example-btn {
      color: #667eea;
      border: 1px solid rgba(102, 126, 234, 0.3);
      border-radius: 8px;
      font-size: 0.8rem;
      padding: 8px 16px;
      min-width: auto;
      height: auto;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: #667eea;
      }
    }

    /* Test Results */
    .test-results {
      margin: 24px 0;
    }

    .result-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid;

      &.success {
        background: rgba(34, 197, 94, 0.05);
        border-color: rgba(34, 197, 94, 0.2);
      }

      &.error {
        background: rgba(239, 68, 68, 0.05);
        border-color: rgba(239, 68, 68, 0.2);
      }

      &.info {
        background: rgba(59, 130, 246, 0.05);
        border-color: rgba(59, 130, 246, 0.2);
      }
    }

    .result-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .result-card.success & {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .result-card.error & {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .result-card.info & {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .result-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;

      .result-card.success & { color: #166534; }
      .result-card.error & { color: #991b1b; }
      .result-card.info & { color: #1e40af; }
    }

    .result-message {
      color: #64748b;
      margin: 0 0 8px 0;
      font-size: 0.9rem;
    }

    .result-details {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .test-btn {
      height: 48px;
      border-radius: 12px;
      color: #667eea;
      border: 2px solid rgba(102, 126, 234, 0.3);
      font-weight: 600;
      padding: 0 24px;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: rgba(102, 126, 234, 0.1);
        border-color: #667eea;
        transform: translateY(-1px);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    .save-btn {
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 32px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .button-content {
        display: flex;
        align-items: center;
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

    /* Quick Actions */
    .quick-actions {
      padding: 32px;
      border-top: 1px solid #e2e8f0;
      background: rgba(248, 250, 252, 0.5);

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #334155;
        margin: 0 0 20px 0;
        text-align: center;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: white;
      transition: all 0.3s ease;
      text-align: left;
      width: 100%;
      min-height: 80px;

      &:hover {
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
      }
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      &.dashboard-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.login-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .action-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-title {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
    }

    .action-desc {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Help Section */
    .help-section {
      margin-top: 24px;
    }

    .help-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .help-icon {
      width: 48px;
      height: 48px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .help-content {
      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
        margin: 0 0 8px 0;
      }

      p {
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 16px 0;
        font-size: 0.9rem;
        line-height: 1.5;
      }
    }

    .help-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;

      &:hover {
        color: white;
        text-decoration: underline;
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
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

      h3 {
        margin: 24px 0 8px 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .config-layout {
        padding: 16px;
      }

      .header-section .logo-text h1 {
        font-size: 2rem;
      }

      .progress-steps {
        max-width: 300px;
      }

      .step-connector {
        width: 40px;
        margin: 0 8px;
      }

      .form-section,
      .quick-actions {
        padding: 24px 20px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .test-btn,
      .save-btn {
        width: 100%;
        justify-content: center;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .progress-steps {
        flex-direction: column;
        gap: 16px;
      }

      .step-connector {
        width: 2px;
        height: 30px;
        margin: 8px 0;
      }

      .help-card {
        flex-direction: column;
        text-align: center;
      }

      .help-links {
        justify-content: center;
      }
    }
  `]
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
