// components/settings/user-preferences/user-preferences.component.ts
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { UserPreferencesService, UserPreferences, LanguagePreference, PreferenceSection } from '../../../services/user-preferences.service';
import { TranslationService } from '../../../services/translation.service';

interface PreferenceSectionConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: string;
  isActive: boolean;
  order: number;
}

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="user-preferences">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>User Preferences</h1>
            <p>Customize your application experience and settings</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="resetToDefaults()">
              <mat-icon>restore</mat-icon>
              Reset to Defaults
            </button>
            <button mat-raised-button color="primary" (click)="saveAllPreferences()" [disabled]="isSaving">
              <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
              <mat-icon *ngIf="!isSaving">save</mat-icon>
              <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Preferences Status -->
      <div class="status-section" *ngIf="lastSaved">
        <div class="status-card">
          <div class="status-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="status-content">
            <h4>Preferences Saved</h4>
            <p>Last updated: {{ formatDate(lastSaved) }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your preferences...</p>
      </div>

      <!-- Preferences Content -->
      <div class="preferences-content" *ngIf="!isLoading">
        <div class="preferences-grid">
          <!-- Language & Localization Section -->
          <mat-card class="preference-section">
            <mat-card-header>
              <div class="section-header">
                <div class="section-icon language-icon">
                  <mat-icon>language</mat-icon>
                </div>
                <div class="section-info">
                  <h3>Language & Localization</h3>
                  <p>Configure your language and regional settings</p>
                </div>
                <div class="section-toggle">
                  <mat-slide-toggle
                    [(ngModel)]="sectionsEnabled.language"
                    (change)="toggleSection('language', $event.checked)">
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content *ngIf="sectionsEnabled.language">
              <form [formGroup]="languageForm" class="preference-form">
                <!-- Preferred Language -->
                <div class="form-group">
                  <h4>Preferred Language</h4>
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Language</mat-label>
                    <mat-select formControlName="preferredLanguage" (selectionChange)="onLanguageChange($event.value)">
                      <mat-option *ngFor="let lang of availableLanguages" [value]="lang.code">
                        <div class="language-option">
                          <span class="flag">{{ lang.flag }}</span>
                          <span class="name">{{ lang.name }}</span>
                          <span class="native" *ngIf="lang.nativeName !== lang.name">({{ lang.nativeName }})</span>
                        </div>
                      </mat-option>
                    </mat-select>
                    <mat-hint>Changes will be applied immediately</mat-hint>
                  </mat-form-field>
                </div>

                <!-- Auto-detect Language -->
                <div class="form-group">
                  <div class="checkbox-group">
                    <mat-checkbox formControlName="autoDetectLanguage">
                      Auto-detect language from browser
                    </mat-checkbox>
                    <p class="help-text">
                      <mat-icon>info</mat-icon>
                      Automatically set language based on your browser settings
                    </p>
                  </div>
                </div>

                <!-- Date & Time Format -->
                <div class="form-group">
                  <h4>Date & Time Format</h4>
                  <div class="format-options">
                    <mat-form-field appearance="outline">
                      <mat-label>Date Format</mat-label>
                      <mat-select formControlName="dateFormat">
                        <mat-option value="MM/dd/yyyy">MM/DD/YYYY (US)</mat-option>
                        <mat-option value="dd/MM/yyyy">DD/MM/YYYY (EU)</mat-option>
                        <mat-option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</mat-option>
                        <mat-option value="dd MMM yyyy">DD MMM YYYY</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Time Format</mat-label>
                      <mat-select formControlName="timeFormat">
                        <mat-option value="12">12-hour (AM/PM)</mat-option>
                        <mat-option value="24">24-hour</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Timezone -->
                <div class="form-group">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Timezone</mat-label>
                    <mat-select formControlName="timezone">
                      <mat-option *ngFor="let tz of commonTimezones" [value]="tz.value">
                        {{ tz.label }}
                      </mat-option>
                    </mat-select>
                    <mat-hint>Current timezone: {{ getCurrentTimezone() }}</mat-hint>
                  </mat-form-field>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Theme & Appearance Section (Placeholder for future) -->
          <mat-card class="preference-section">
            <mat-card-header>
              <div class="section-header">
                <div class="section-icon theme-icon">
                  <mat-icon>palette</mat-icon>
                </div>
                <div class="section-info">
                  <h3>Theme & Appearance</h3>
                  <p>Customize the look and feel of your interface</p>
                </div>
                <div class="section-toggle">
                  <mat-slide-toggle
                    [(ngModel)]="sectionsEnabled.theme"
                    (change)="toggleSection('theme', $event.checked)">
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content *ngIf="sectionsEnabled.theme">
              <div class="coming-soon">
                <mat-icon>construction</mat-icon>
                <h4>Coming Soon</h4>
                <p>Theme customization options will be available in a future update</p>
                <div class="preview-features">
                  <mat-chip-set>
                    <mat-chip>Dark Mode</mat-chip>
                    <mat-chip>Color Themes</mat-chip>
                    <mat-chip>Font Size</mat-chip>
                    <mat-chip>Compact Layout</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Notifications Section (Placeholder for future) -->
          <mat-card class="preference-section">
            <mat-card-header>
              <div class="section-header">
                <div class="section-icon notifications-icon">
                  <mat-icon>notifications</mat-icon>
                </div>
                <div class="section-info">
                  <h3>Notifications</h3>
                  <p>Control how and when you receive notifications</p>
                </div>
                <div class="section-toggle">
                  <mat-slide-toggle
                    [(ngModel)]="sectionsEnabled.notifications"
                    (change)="toggleSection('notifications', $event.checked)">
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content *ngIf="sectionsEnabled.notifications">
              <div class="coming-soon">
                <mat-icon>construction</mat-icon>
                <h4>Coming Soon</h4>
                <p>Notification preferences will be available in a future update</p>
                <div class="preview-features">
                  <mat-chip-set>
                    <mat-chip>Email Alerts</mat-chip>
                    <mat-chip>Push Notifications</mat-chip>
                    <mat-chip>Sound Settings</mat-chip>
                    <mat-chip>Frequency Control</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Privacy & Security Section (Placeholder for future) -->
          <mat-card class="preference-section">
            <mat-card-header>
              <div class="section-header">
                <div class="section-icon security-icon">
                  <mat-icon>security</mat-icon>
                </div>
                <div class="section-info">
                  <h3>Privacy & Security</h3>
                  <p>Manage your privacy settings and security preferences</p>
                </div>
                <div class="section-toggle">
                  <mat-slide-toggle
                    [(ngModel)]="sectionsEnabled.security"
                    (change)="toggleSection('security', $event.checked)">
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content *ngIf="sectionsEnabled.security">
              <div class="coming-soon">
                <mat-icon>construction</mat-icon>
                <h4>Coming Soon</h4>
                <p>Privacy and security options will be available in a future update</p>
                <div class="preview-features">
                  <mat-chip-set>
                    <mat-chip>Session Timeout</mat-chip>
                    <mat-chip>Two-Factor Auth</mat-chip>
                    <mat-chip>Data Export</mat-chip>
                    <mat-chip>Activity Log</mat-chip>
                  </mat-chip-set>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <ng-template #confirmDialog>
      <div mat-dialog-title>Reset Preferences</div>
      <mat-dialog-content>
        <p>Are you sure you want to reset all preferences to their default values?</p>
        <p class="warning-text">
          <mat-icon>warning</mat-icon>
          This action cannot be undone.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="warn" (click)="confirmReset()">
          Reset All
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .user-preferences {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-text h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .header-text p {
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .status-section {
      margin-bottom: 24px;
    }

    .status-card {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      width: 40px;
      height: 40px;
      background: rgba(34, 197, 94, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #22c55e;
    }

    .status-content h4 {
      margin: 0 0 4px 0;
      color: #166534;
      font-weight: 600;
    }

    .status-content p {
      margin: 0;
      color: #15803d;
      font-size: 0.9rem;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-section p {
      margin-top: 16px;
      color: #64748b;
    }

    .preferences-content {
      background: transparent;
    }

    .preferences-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .preference-section {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .section-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.language-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.theme-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.notifications-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
      &.security-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    }

    .section-info {
      flex: 1;
    }

    .section-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
    }

    .section-info p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .section-toggle {
      flex-shrink: 0;
    }

    .preference-form {
      padding: 8px 0;
    }

    .form-group {
      margin-bottom: 24px;

      h4 {
        margin: 0 0 12px 0;
        color: #334155;
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .full-width {
      width: 100%;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .flag {
        font-size: 1.2rem;
      }

      .name {
        font-weight: 500;
      }

      .native {
        color: #64748b;
        font-size: 0.9rem;
      }
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .help-text {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 0.8rem;
      margin: 0;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .format-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .coming-soon {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      h4 {
        font-size: 1.2rem;
        margin: 0 0 8px 0;
        color: #334155;
      }

      p {
        margin: 0 0 20px 0;
        line-height: 1.5;
      }
    }

    .preview-features {
      display: flex;
      justify-content: center;

      mat-chip-set {
        justify-content: center;
      }

      mat-chip {
        background: rgba(102, 126, 234, 0.1) !important;
        color: #667eea !important;
        font-size: 0.8rem;
        margin: 2px;
      }
    }

    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f59e0b;
      font-weight: 500;
      margin: 16px 0 0 0;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    @media (max-width: 1024px) {
      .preferences-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .user-preferences {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .format-options {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-wrap: wrap;
      }

      .section-info {
        min-width: 200px;
      }
    }

    @media (max-width: 480px) {
      .section-header {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .section-toggle {
        align-self: center;
      }
    }
  `]
})
export class UserPreferencesComponent implements OnInit {
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  lastSaved: string | null = null;

  languageForm: FormGroup;

  // Section toggles
  sectionsEnabled = {
    language: true,
    theme: false,
    notifications: false,
    security: false
  };

  // Available languages
  availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
  ];

  // Common timezones
  commonTimezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userPreferencesService: UserPreferencesService,
    private translationService: TranslationService
  ) {
    this.languageForm = this.fb.group({
      preferredLanguage: ['en', Validators.required],
      autoDetectLanguage: [false],
      dateFormat: ['MM/dd/yyyy'],
      timeFormat: ['12'],
      timezone: [this.getCurrentTimezone()]
    });
  }

  ngOnInit(): void {
    this.loadUserPreferences();
    this.setupFormChanges();
  }

  private loadUserPreferences(): void {
    this.isLoading = true;

    // Always load from API for this component to ensure fresh data
    this.userPreferencesService.getUserPreferencesFromAPI()
      .subscribe({
        next: (preferences) => {
          console.log('UserPreferencesComponent: Loaded preferences from API:', preferences);
          this.populateForm(preferences);
          this.lastSaved = preferences.lastUpdated || null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading user preferences:', err);
          this.snackBar.open('Error loading preferences. Using defaults.', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.setDefaultValues();
        }
      });
  }

  private populateForm(preferences: UserPreferences): void {
    console.log('UserPreferencesComponent: Populating form with preferences:', preferences);

    if (preferences.language) {
      console.log('UserPreferencesComponent: Found language preferences:', preferences.language);
      console.log('UserPreferencesComponent: Preferred language from API:', preferences.language.preferredLanguage);

      // Use setTimeout to ensure mat-select is ready
      setTimeout(() => {
        this.languageForm.patchValue({
          preferredLanguage: preferences.language?.preferredLanguage || 'en',
          autoDetectLanguage: preferences.language?.autoDetectLanguage || false,
          dateFormat: preferences.language?.dateFormat || 'MM/dd/yyyy',
          timeFormat: preferences.language?.timeFormat || '12',
          timezone: preferences.language?.timezone || this.getCurrentTimezone()
        });

        console.log('UserPreferencesComponent: Form populated. Current language value:',
          this.languageForm.get('preferredLanguage')?.value);
      }, 100);

      // Set section toggles based on preferences
      this.sectionsEnabled.language = preferences.language.enabled !== false;
    } else {
      console.log('UserPreferencesComponent: No language preferences found, using defaults');
      this.setDefaultValues();
    }
  }

  private setDefaultValues(): void {
    this.languageForm.patchValue({
      preferredLanguage: 'en',
      autoDetectLanguage: false,
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12',
      timezone: this.getCurrentTimezone()
    });
  }

  private setupFormChanges(): void {
    // Watch for language changes to apply immediately
    this.languageForm.get('preferredLanguage')?.valueChanges.subscribe(language => {
      if (language && language !== this.translationService.getCurrentLanguage()) {
        this.onLanguageChange(language);
      }
    });
  }

  onLanguageChange(language: string): void {
    // Update translation service immediately
    this.translationService.setLanguage(language).subscribe();

    // Update user preferences
    this.userPreferencesService.updateLanguagePreference(language)
      .subscribe({
        next: (updatedPreferences: UserPreferences) => {
          this.snackBar.open(`Language changed to ${this.getLanguageName(language)}`, 'Close', { duration: 2000 });
        },
        error: (err: any) => {
          console.error('Error updating language preference:', err);
          this.snackBar.open('Error updating language preference', 'Close', { duration: 3000 });
        }
      });
  }

  toggleSection(section: string, enabled: boolean): void {
    (this.sectionsEnabled as any)[section] = enabled;

    // Show notification
    const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
    this.snackBar.open(
      `${sectionName} section ${enabled ? 'enabled' : 'disabled'}`,
      'Close',
      { duration: 2000 }
    );
  }

  saveAllPreferences(): void {
    if (!this.languageForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formValue = this.languageForm.value;

    const preferences: UserPreferences = {
      language: {
        preferredLanguage: formValue.preferredLanguage,
        autoDetectLanguage: formValue.autoDetectLanguage,
        dateFormat: formValue.dateFormat,
        timeFormat: formValue.timeFormat,
        timezone: formValue.timezone,
        enabled: this.sectionsEnabled.language
      },
      // Future sections will be added here
      theme: {
        enabled: this.sectionsEnabled.theme
      },
      notifications: {
        enabled: this.sectionsEnabled.notifications
      },
      security: {
        enabled: this.sectionsEnabled.security
      },
      lastUpdated: new Date().toISOString()
    };

    this.userPreferencesService.updateUserPreferences(preferences)
      .subscribe({
        next: (response) => {
          this.lastSaved = new Date().toISOString();
          this.snackBar.open('Preferences saved successfully!', 'Close', { duration: 3000 });
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error saving preferences:', err);
          this.snackBar.open('Error saving preferences. Please try again.', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
  }

  resetToDefaults(): void {
    this.dialog.open(this.confirmDialog, {
      width: '400px',
      disableClose: true
    });
  }

  confirmReset(): void {
    this.userPreferencesService.resetToDefaults()
      .subscribe({
        next: () => {
          this.setDefaultValues();
          this.sectionsEnabled = {
            language: true,
            theme: false,
            notifications: false,
            security: false
          };
          this.snackBar.open('Preferences reset to defaults', 'Close', { duration: 3000 });
          this.dialog.closeAll();
        },
        error: (err) => {
          console.error('Error resetting preferences:', err);
          this.snackBar.open('Error resetting preferences', 'Close', { duration: 3000 });
        }
      });
  }

  // Utility methods
  getLanguageName(code: string): string {
    const lang = this.availableLanguages.find(l => l.code === code);
    return lang ? lang.name : code.toUpperCase();
  }

  getCurrentTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown';
    }
  }
}
