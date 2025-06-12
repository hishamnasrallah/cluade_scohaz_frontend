// services/user-preferences.service.ts - FIXED VERSION
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

// ... (keep all the existing interfaces - LanguagePreference, ThemePreference, etc.)
export interface PreferenceSection {
  enabled: boolean;
}

export interface LanguagePreference extends PreferenceSection {
  preferredLanguage?: string;
  autoDetectLanguage?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  timezone?: string;
}

export interface ThemePreference extends PreferenceSection {
  darkMode?: boolean;
  colorScheme?: string;
  fontSize?: 'small' | 'medium' | 'large';
  compactLayout?: boolean;
  animations?: boolean;
}

export interface NotificationPreference extends PreferenceSection {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  soundEnabled?: boolean;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  categories?: {
    system?: boolean;
    security?: boolean;
    updates?: boolean;
    marketing?: boolean;
  };
}

export interface SecurityPreference extends PreferenceSection {
  sessionTimeout?: number;
  twoFactorAuth?: boolean;
  activityLogging?: boolean;
  dataExportEnabled?: boolean;
  autoLogout?: boolean;
  passwordExpiry?: number;
}

export interface AccessibilityPreference extends PreferenceSection {
  highContrast?: boolean;
  screenReader?: boolean;
  keyboardNavigation?: boolean;
  reducedMotion?: boolean;
  textSize?: 'small' | 'medium' | 'large' | 'extra-large';
}

export interface UserPreferences {
  language?: LanguagePreference;
  theme?: ThemePreference;
  notifications?: NotificationPreference;
  security?: SecurityPreference;
  accessibility?: AccessibilityPreference;
  lastUpdated?: string;
  version?: string;
}

export interface PreferencesResponse {
  preferences: UserPreferences;
  metadata?: {
    version: string;
    lastModified: string;
    source: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>({});
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public preferences$ = this.preferencesSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  private readonly CACHE_KEY = 'user_preferences_cache';
  private readonly CACHE_EXPIRY_KEY = 'user_preferences_cache_expiry';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  /**
   * Get user preferences from API
   */
  getUserPreferences(): Observable<UserPreferences> {
    console.log('UserPreferencesService: Loading user preferences');

    // Check cache first
    const cached = this.getCachedPreferences();
    if (cached) {
      console.log('UserPreferencesService: Using cached preferences');
      this.preferencesSubject.next(cached);
      return of(cached);
    }

    return this.loadPreferencesFromAPI();
  }

  /**
   * Force load user preferences from API (ignore cache)
   */
  getUserPreferencesFromAPI(): Observable<UserPreferences> {
    console.log('UserPreferencesService: Force loading preferences from API');
    return this.loadPreferencesFromAPI();
  }

  /**
   * Load preferences from API
   */
  private loadPreferencesFromAPI(): Observable<UserPreferences> {
    this.isLoadingSubject.next(true);
    const baseUrl = this.configService.getBaseUrl();

    console.log('UserPreferencesService: Making API call to:', `${baseUrl}/auth/preferences/`);

    return this.http.get<any>(`${baseUrl}/auth/preferences/`)
      .pipe(
        map(apiResponse => {
          console.log('UserPreferencesService: Raw API response:', apiResponse);

          // Transform API response to match expected format
          const transformedPreferences: UserPreferences = this.transformApiResponse(apiResponse);

          console.log('UserPreferencesService: Transformed preferences:', transformedPreferences);
          return transformedPreferences;
        }),
        tap(preferences => {
          this.cachePreferences(preferences);
          this.preferencesSubject.next(preferences);
          this.isLoadingSubject.next(false);
        }),
        catchError(err => {
          console.error('UserPreferencesService: Error loading preferences:', err);
          this.isLoadingSubject.next(false);

          // Return default preferences on error
          const defaultPreferences = this.getDefaultPreferences();
          console.log('UserPreferencesService: Using default preferences');
          this.preferencesSubject.next(defaultPreferences);
          return of(defaultPreferences);
        })
      );
  }

  /**
   * Transform API response to match expected UserPreferences format
   */
  private transformApiResponse(apiResponse: any): UserPreferences {
    // Handle different API response formats
    if (apiResponse.lang) {
      // Format: {"id": 4, "lang": "ar"}
      return {
        language: {
          enabled: true,
          preferredLanguage: apiResponse.lang,
          autoDetectLanguage: false,
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        theme: { enabled: false },
        notifications: { enabled: false },
        security: { enabled: false },
        accessibility: { enabled: false },
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    } else if (apiResponse.language) {
      // Format: {"language": {"preferredLanguage": "ar", ...}}
      return apiResponse as UserPreferences;
    } else if (apiResponse.preferredLanguage || apiResponse.preferred_language) {
      // Format: {"preferredLanguage": "ar"} or {"preferred_language": "ar"}
      const lang = apiResponse.preferredLanguage || apiResponse.preferred_language;
      return {
        language: {
          enabled: true,
          preferredLanguage: lang,
          autoDetectLanguage: false,
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        theme: { enabled: false },
        notifications: { enabled: false },
        security: { enabled: false },
        accessibility: { enabled: false },
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    } else {
      // Unknown format, return defaults
      console.warn('UserPreferencesService: Unknown API response format, using defaults');
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user preferences via API
   */
  updateUserPreferences(preferences: UserPreferences): Observable<UserPreferences> {
    console.log('UserPreferencesService: Updating preferences:', preferences);

    this.isLoadingSubject.next(true);
    const baseUrl = this.configService.getBaseUrl();

    // Validate preferences before sending
    const validation = this.validatePreferences(preferences);
    if (!validation.isValid) {
      console.error('UserPreferencesService: Invalid preferences:', validation.errors);
      return of(preferences);
    }

    // Transform preferences to API format
    const apiPayload = this.transformPreferencesToApiFormat(preferences);
    console.log('UserPreferencesService: Sending API payload:', apiPayload);

    return this.http.put<any>(`${baseUrl}/auth/preferences/`, apiPayload)
      .pipe(
        map(apiResponse => {
          console.log('UserPreferencesService: API update response:', apiResponse);
          // Transform response back to our format
          return this.transformApiResponse(apiResponse);
        }),
        tap(updatedPreferences => {
          console.log('UserPreferencesService: Preferences updated successfully');
          this.cachePreferences(updatedPreferences);
          this.preferencesSubject.next(updatedPreferences);
          this.isLoadingSubject.next(false);
        }),
        catchError(err => {
          console.error('UserPreferencesService: Error updating preferences:', err);
          this.isLoadingSubject.next(false);
          throw err;
        })
      );
  }

  /**
   * Transform UserPreferences to API format
   */
  private transformPreferencesToApiFormat(preferences: UserPreferences): any {
    // Based on the API response format {"id": 4, "lang": "ar"}
    // We need to send the language in the format the API expects

    if (preferences.language?.preferredLanguage) {
      return {
        lang: preferences.language.preferredLanguage
      };
    }

    // If no language preference, send default
    return {
      lang: 'en'
    };
  }

  /**
   * Update language preference and sync with translation service
   */
  updateLanguagePreference(language: string): Observable<UserPreferences> {
    console.log('UserPreferencesService: Updating language preference to:', language);

    // Create preferences object with the new language
    const updatedPreferences: UserPreferences = {
      language: {
        enabled: true,
        preferredLanguage: language,
        autoDetectLanguage: false,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      theme: { enabled: false },
      notifications: { enabled: false },
      security: { enabled: false },
      accessibility: { enabled: false },
      lastUpdated: new Date().toISOString(),
      version: this.generateVersion()
    };

    // Update preferences in API
    return this.updateUserPreferences(updatedPreferences);
  }

  /**
   * Get the preferred language from preferences
   */
  getPreferredLanguage(): Observable<string> {
    return this.preferences$.pipe(
      map(preferences => {
        const preferredLang = preferences.language?.preferredLanguage;
        console.log('UserPreferencesService: Preferred language:', preferredLang);
        return preferredLang || this.getDefaultLanguage();
      })
    );
  }

  /**
   * Get default language (browser language or 'en')
   */
  private getDefaultLanguage(): string {
    const browserLang = navigator.language.split('-')[0] || 'en';
    console.log('UserPreferencesService: Default language:', browserLang);
    return browserLang;
  }

  /**
   * Reset preferences to defaults
   */
  resetToDefaults(): Observable<UserPreferences> {
    const defaultPreferences = this.getDefaultPreferences();
    return this.updateUserPreferences(defaultPreferences);
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserLanguage = this.getDefaultLanguage();

    return {
      language: {
        enabled: true,
        preferredLanguage: browserLanguage,
        autoDetectLanguage: false,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12',
        timezone: timezone
      },
      theme: {
        enabled: false,
        darkMode: false,
        colorScheme: 'default',
        fontSize: 'medium',
        compactLayout: false,
        animations: true
      },
      notifications: {
        enabled: false,
        emailNotifications: true,
        pushNotifications: false,
        soundEnabled: true,
        frequency: 'immediate',
        categories: {
          system: true,
          security: true,
          updates: true,
          marketing: false
        }
      },
      security: {
        enabled: false,
        sessionTimeout: 30,
        twoFactorAuth: false,
        activityLogging: true,
        dataExportEnabled: false,
        autoLogout: true,
        passwordExpiry: 90
      },
      accessibility: {
        enabled: false,
        highContrast: false,
        screenReader: false,
        keyboardNavigation: true,
        reducedMotion: false,
        textSize: 'medium'
      },
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Get a specific preference section
   */
  getPreferenceSection<T extends keyof UserPreferences>(section: T): Observable<UserPreferences[T]> {
    return this.preferences$.pipe(
      map(preferences => preferences[section])
    );
  }

  /**
   * Update a specific preference section
   */
  updatePreferenceSection<T extends keyof UserPreferences>(
    section: T,
    sectionData: UserPreferences[T]
  ): Observable<UserPreferences> {
    const currentPreferences = this.preferencesSubject.value;
    const updatedPreferences = {
      ...currentPreferences,
      [section]: sectionData,
      lastUpdated: new Date().toISOString()
    };

    return this.updateUserPreferences(updatedPreferences);
  }

  /**
   * Validate preferences data
   */
  validatePreferences(preferences: UserPreferences): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate language preferences
    if (preferences.language) {
      if (preferences.language.preferredLanguage &&
        !this.isValidLanguageCode(preferences.language.preferredLanguage)) {
        errors.push('Invalid language code');
      }

      if (preferences.language.timeFormat &&
        !['12', '24'].includes(preferences.language.timeFormat)) {
        errors.push('Invalid time format');
      }

      if (preferences.language.timezone &&
        !this.isValidTimezone(preferences.language.timezone)) {
        warnings.push('Timezone may not be supported');
      }
    }

    // Validate security preferences
    if (preferences.security) {
      if (preferences.security.sessionTimeout &&
        (preferences.security.sessionTimeout < 5 || preferences.security.sessionTimeout > 480)) {
        errors.push('Session timeout must be between 5 and 480 minutes');
      }

      if (preferences.security.passwordExpiry &&
        (preferences.security.passwordExpiry < 1 || preferences.security.passwordExpiry > 365)) {
        errors.push('Password expiry must be between 1 and 365 days');
      }
    }

    // Validate theme preferences
    if (preferences.theme) {
      if (preferences.theme.fontSize &&
        !['small', 'medium', 'large'].includes(preferences.theme.fontSize)) {
        errors.push('Invalid font size');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if preferences have unsaved changes
   */
  hasUnsavedChanges(currentPreferences: UserPreferences): boolean {
    const savedPreferences = this.preferencesSubject.value;
    return JSON.stringify(currentPreferences) !== JSON.stringify(savedPreferences);
  }

  /**
   * Export preferences as JSON
   */
  exportPreferences(): void {
    const preferences = this.preferencesSubject.value;
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_preferences_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import preferences from JSON
   */
  importPreferences(file: File): Observable<UserPreferences> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPreferences = JSON.parse(e.target?.result as string);
          const validation = this.validatePreferences(importedPreferences);

          if (validation.isValid) {
            this.updateUserPreferences(importedPreferences).subscribe(
              result => observer.next(result),
              error => observer.error(error)
            );
          } else {
            observer.error(new Error(`Invalid preferences file: ${validation.errors.join(', ')}`));
          }
        } catch (error) {
          observer.error(new Error('Invalid JSON file'));
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Clear preferences cache
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_EXPIRY_KEY);
  }

  /**
   * Private helper methods
   */
  private getCachedPreferences(): UserPreferences | null {
    try {
      const expiry = localStorage.getItem(this.CACHE_EXPIRY_KEY);
      if (expiry && new Date().getTime() > parseInt(expiry)) {
        this.clearCache();
        return null;
      }

      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      this.clearCache();
      return null;
    }
  }

  private cachePreferences(preferences: UserPreferences): void {
    try {
      const expiry = new Date().getTime() + this.CACHE_DURATION;
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(preferences));
      localStorage.setItem(this.CACHE_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.warn('Unable to cache preferences:', error);
    }
  }

  private generateVersion(): string {
    return `${new Date().getTime()}`;
  }

  private isValidLanguageCode(code: string): boolean {
    const validCodes = ['en', 'ar', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja'];
    return validCodes.includes(code);
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  // Future extension methods (keeping them as placeholders)
  syncWithExternalServices(): Observable<boolean> {
    return of(true);
  }

  getUsageAnalytics(): Observable<any> {
    return of({});
  }

  backupToCloud(): Observable<boolean> {
    return of(true);
  }

  restoreFromCloud(): Observable<UserPreferences> {
    return of(this.getDefaultPreferences());
  }
}
