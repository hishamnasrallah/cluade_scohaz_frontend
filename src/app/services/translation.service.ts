// services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface TranslationResponse {
  [key: string]: string;
}

export interface VersionResponse {
  lang: string;
  version: string;
}

export interface LanguageListResponse {
  languages: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations = new BehaviorSubject<TranslationResponse>({});
  private cachedTranslations: { [lang: string]: TranslationResponse } = {};
  private cachedVersions: { [lang: string]: string } = {};

  public currentLanguage$ = this.currentLanguage.asObservable();
  public translations$ = this.translations.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.initializeTranslations();
  }

  /**
   * Initialize the translation service
   */
  private initializeTranslations(): void {
    // Get saved language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('app_language') || 'en';
    this.setLanguage(savedLanguage);
  }

  /**
   * Set the current language and load its translations
   */
  setLanguage(language: string): void {
    this.currentLanguage.next(language);
    localStorage.setItem('app_language', language);
    this.loadTranslations(language);
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
    return this.http.get<string[]>(`${baseUrl}/version/translation/languages/`);
  }

  /**
   * Create a new language
   */
  createLanguage(languageCode: string): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post(`${baseUrl}/version/translation/languages/`, { code: languageCode });
  }

  /**
   * Update translations for a language
   */
  updateTranslations(language: string, translations: { [key: string]: string }, keysToDelete: string[] = []): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const updateData = {
      add_or_update: translations,
      delete: keysToDelete
    };

    return this.http.patch(`${baseUrl}/version/translations/${language}/`, updateData)
      .pipe(
        map(response => {
          // Update cached translations
          if (this.cachedTranslations[language]) {
            // Add/update keys
            Object.keys(translations).forEach(key => {
              this.cachedTranslations[language][key] = translations[key];
            });

            // Delete keys
            keysToDelete.forEach(key => {
              delete this.cachedTranslations[language][key];
            });

            // Update current translations if this is the active language
            if (language === this.getCurrentLanguage()) {
              this.translations.next(this.cachedTranslations[language]);
            }
          }

          return response;
        })
      );
  }

  /**
   * Replace all translations for a language
   */
  replaceTranslations(language: string, translations: { [key: string]: string }): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();

    return this.http.put(`${baseUrl}/version/translations/${language}/`, translations)
      .pipe(
        map(response => {
          // Update cached translations
          this.cachedTranslations[language] = translations;

          // Update current translations if this is the active language
          if (language === this.getCurrentLanguage()) {
            this.translations.next(translations);
          }

          return response;
        })
      );
  }

  /**
   * Get version information for a language
   */
  getLanguageVersion(language: string): Observable<VersionResponse> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<VersionResponse>(`${baseUrl}/version/latest-version/${language}/`);
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string): boolean {
    return this.translations.value.hasOwnProperty(key);
  }

  /**
   * Get all translation keys for the current language
   */
  getAllKeys(): string[] {
    return Object.keys(this.translations.value);
  }

  /**
   * Get all translations for the current language
   */
  getAllTranslations(): TranslationResponse {
    return { ...this.translations.value };
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
}
