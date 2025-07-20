// services/translation.service.ts - UPDATED
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations$ = new BehaviorSubject<{ [key: string]: string }>({});
  private currentLanguage$ = new BehaviorSubject<string>('en');

  // Language change notifier
  public languageChange$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    console.log('TranslationService: Initialized');
  }

  /**
   * Initialize translations with default language or user preference
   */
  initializeWithDefaults(): Observable<any> {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    return this.loadTranslations(savedLang);
  }

  /**
   * Load translations for a specific language
   */
  loadTranslations(language: string): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const url = `${baseUrl}/auth/translation/${language}/`;

    console.log(`TranslationService: Loading translations for ${language}`);

    return this.http.get<{ [key: string]: string }>(url).pipe(
      tap(translations => {
        console.log(`TranslationService: Loaded ${Object.keys(translations).length} translations for ${language}`);
        this.translations$.next(translations);
        this.currentLanguage$.next(language);
        localStorage.setItem('preferredLanguage', language);

        // Notify about language change
        this.languageChange$.next(language);
      }),
      catchError(error => {
        console.error('TranslationService: Error loading translations:', error);
        // Fallback to default translations
        const defaultTranslations = this.getDefaultTranslations();
        this.translations$.next(defaultTranslations);
        return of(defaultTranslations);
      })
    );
  }

  /**
   * Get a single translation by key
   */
  getTranslation(key: string): string {
    const translations = this.translations$.value;
    return translations[key] || key; // Return key if translation not found
  }

  /**
   * Get multiple translations by keys
   */
  getTranslations(keys: string[]): { [key: string]: string } {
    const translations = this.translations$.value;
    const result: { [key: string]: string } = {};

    keys.forEach(key => {
      result[key] = translations[key] || key;
    });

    return result;
  }

  /**
   * Get all current translations
   */
  getAllTranslations(): { [key: string]: string } {
    return this.translations$.value;
  }

  /**
   * Get translations as observable
   */
  getTranslations$(): Observable<{ [key: string]: string }> {
    return this.translations$.asObservable();
  }

  /**
   * Set current language and load translations
   */
  setLanguage(language: string): Observable<any> {
    console.log(`TranslationService: Setting language to ${language}`);
    return this.loadTranslations(language);
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  /**
   * Get current language as observable
   */
  getCurrentLanguage$(): Observable<string> {
    return this.currentLanguage$.asObservable();
  }

  /**
   * Translate with interpolation
   */
  translate(key: string, params?: { [key: string]: any }): string {
    let translation = this.getTranslation(key);

    if (params) {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
        translation = translation.replace(regex, params[param]);
      });
    }

    return translation;
  }

  /**
   * Get instant translation (alias for getTranslation)
   */
  instant(key: string, params?: { [key: string]: any }): string {
    return this.translate(key, params);
  }

  /**
   * Default translations fallback
   */
  private getDefaultTranslations(): { [key: string]: string } {
    return {
      // Authentication
      'login_title': 'Welcome Back',
      'login_subtitle': 'Sign in to continue to your account',
      'username': 'Username',
      'password': 'Password',
      'remember_me': 'Remember me',
      'forgot_password': 'Forgot password?',
      'sign_in': 'Sign In',
      'login_failed': 'Login failed. Please check your credentials.',
      'invalid_credentials': 'Invalid username or password',

      // Common
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'add': 'Add',
      'search': 'Search',
      'refresh': 'Refresh',
      'loading': 'Loading...',
      'no_results_found': 'No results found',

      // Applications Inbox
      'applications': 'Applications',
      'my_applications': 'My Applications',
      'new_cases': 'New Cases',
      'available_cases': 'Available Cases',
      'assign_to_me': 'Assign to Me',
      'case_assigned_success': 'Case assigned successfully',
      'action_completed_success': 'Action completed successfully',

      // Table headers
      'serial_number': 'Serial Number',
      'case_type': 'Case Type',
      'status': 'Status',
      'applicant': 'Applicant',
      'created': 'Created',
      'actions': 'Actions',

      // Errors
      'error_loading_data': 'Error loading data',
      'error_performing_action': 'Error performing action',
      'validation_error': 'There was a validation error',
      'invalid_request': 'Invalid request'
    };
  }
}
