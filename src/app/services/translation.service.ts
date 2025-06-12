// services/translation.service.ts - FIXED VERSION
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface TranslationResponse {
  [key: string]: string;
}

export interface VersionResponse {
  lang: string;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations = new BehaviorSubject<TranslationResponse>({});
  private cachedTranslations: { [lang: string]: TranslationResponse } = {};
  private cachedVersions: { [lang: string]: string } = {};
  private isInitialized = false;

  public currentLanguage$ = this.currentLanguage.asObservable();
  public translations$ = this.translations.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // Don't auto-initialize here - let the app component handle it
  }

  /**
   * Initialize the translation service with a specific language
   * This should be called by the app initialization process
   */
  initializeWithLanguage(language: string): Observable<TranslationResponse> {
    console.log('TranslationService: Initializing with language:', language);
    this.isInitialized = true;
    return this.setLanguage(language);
  }

  /**
   * Initialize with default language (fallback)
   */
  initializeWithDefaults(): Observable<TranslationResponse> {
    console.log('TranslationService: Initializing with defaults');
    const browserLanguage = navigator.language.split('-')[0] || 'en';
    const savedLanguage = localStorage.getItem('app_language') || browserLanguage;
    return this.initializeWithLanguage(savedLanguage);
  }

  /**
   * Set the current language and load its translations
   */
  setLanguage(language: string): Observable<TranslationResponse> {
    console.log('TranslationService: Setting language to:', language);

    this.currentLanguage.next(language);
    localStorage.setItem('app_language', language);

    return this.loadTranslations(language);
  }

  /**
   * Get the current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguage.value;
  }

  /**
   * Load translations for a specific language
   */
  loadTranslations(language: string): Observable<TranslationResponse> {
    // Check if translations are already cached
    if (this.cachedTranslations[language]) {
      this.translations.next(this.cachedTranslations[language]);
      return of(this.cachedTranslations[language]);
    }

    // Check if we need to refresh based on version
    return this.checkAndLoadTranslations(language);
  }

  /**
   * Check version and load translations if needed
   */
  private checkAndLoadTranslations(language: string): Observable<TranslationResponse> {
    const baseUrl = this.configService.getBaseUrl();

    return this.http.get<VersionResponse>(`${baseUrl}/version/latest-version/${language}/`)
      .pipe(
        map(versionResponse => {
          const currentVersion = this.cachedVersions[language];

          if (currentVersion !== versionResponse.version) {
            // Version changed, load new translations
            this.fetchTranslations(language);
            this.cachedVersions[language] = versionResponse.version;
          } else if (this.cachedTranslations[language]) {
            // Use cached translations
            this.translations.next(this.cachedTranslations[language]);
          }

          return this.cachedTranslations[language] || {};
        }),
        catchError(err => {
          console.error('Error checking translation version:', err);
          // Fallback to loading translations directly
          this.fetchTranslations(language);
          return of({});
        })
      );
  }

  /**
   * Fetch translations from the server
   */
  private fetchTranslations(language: string): void {
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<TranslationResponse>(`${baseUrl}/auth/translation/${language}/`)
      .pipe(
        catchError(err => {
          console.error(`Error loading translations for ${language}:`, err);
          return of({});
        })
      )
      .subscribe(translations => {
        console.log(`TranslationService: Loaded ${Object.keys(translations).length} translations for ${language}`);
        this.cachedTranslations[language] = translations;
        this.translations.next(translations);
      });
  }

  /**
   * Get a translation by key
   */
  translate(key: string, params?: { [key: string]: any }): string {
    const currentTranslations = this.translations.value;
    let translation = currentTranslations[key];

    if (!translation) {
      console.warn(`Translation key '${key}' not found for language '${this.getCurrentLanguage()}'`);
      return key; // Return the key if translation is not found
    }

    // Replace parameters in the translation
    if (params) {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
        translation = translation.replace(regex, params[param]);
      });
    }

    return translation;
  }

  /**
   * Get a translation as an Observable
   */
  translateAsync(key: string, params?: { [key: string]: any }): Observable<string> {
    return this.translations$.pipe(
      map(translations => {
        let translation = translations[key];

        if (!translation) {
          console.warn(`Translation key '${key}' not found for language '${this.getCurrentLanguage()}'`);
          return key;
        }

        // Replace parameters
        if (params) {
          Object.keys(params).forEach(param => {
            const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
            translation = translation.replace(regex, params[param]);
          });
        }

        return translation;
      })
    );
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages(): Observable<string[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<string[]>(`${baseUrl}/languages/`);
  }

  /**
   * Update the language preference (used by preferences service)
   */
  updateLanguagePreference(language: string): void {
    console.log('TranslationService: Updating language preference to:', language);
    if (language !== this.getCurrentLanguage()) {
      this.setLanguage(language).subscribe();
    }
  }

  /**
   * Check if service is initialized
   */
  isInitializedService(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear cached translations (useful for development)
   */
  clearCache(): void {
    this.cachedTranslations = {};
    this.cachedVersions = {};
    this.loadTranslations(this.getCurrentLanguage());
  }

  /**
   * Check if the current language is RTL (Right-to-Left)
   */
  isRTL(): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(this.getCurrentLanguage());
  }

  /**
   * Get language direction for CSS
   */
  getLanguageDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }

  /**
   * Export translations for a language
   */
  exportTranslations(language: string): void {
    if (this.cachedTranslations[language]) {
      const dataStr = JSON.stringify(this.cachedTranslations[language], null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${language}_translations.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }
}
