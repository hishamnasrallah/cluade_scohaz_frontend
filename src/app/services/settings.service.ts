// services/settings.service.ts - NEW SERVICE
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

export interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Setting[];
}

export interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  category: string;
  description: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  readonly?: boolean;
  sensitive?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<Setting[]>([]);
  public settings$ = this.settingsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<SettingsCategory[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  /**
   * Load all system settings
   */
  loadSettings(): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<Setting[]>(`${baseUrl}/api/settings/`);
  }

  /**
   * Load settings by category
   */
  loadSettingsByCategory(category: string): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<Setting[]>(`${baseUrl}/api/settings/?category=${category}`);
  }

  /**
   * Update a single setting
   */
  updateSetting(key: string, value: any): Observable<Setting> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.put<Setting>(`${baseUrl}/api/settings/${key}/`, { value });
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(settings: { [key: string]: any }): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.put<Setting[]>(`${baseUrl}/api/settings/bulk/`, { settings });
  }

  /**
   * Reset settings to default values
   */
  resetSettings(keys: string[]): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post<Setting[]>(`${baseUrl}/api/settings/reset/`, { keys });
  }

  /**
   * Export settings as JSON
   */
  exportSettings(categories?: string[]): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const params = categories ? `?categories=${categories.join(',')}` : '';
    return this.http.get<any>(`${baseUrl}/api/settings/export/${params}`);
  }

  /**
   * Import settings from JSON
   */
  importSettings(settingsData: any): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post<Setting[]>(`${baseUrl}/api/settings/import/`, settingsData);
  }

  /**
   * Validate setting value
   */
  validateSetting(setting: Setting, value: any): ValidationResult {
    const errors: string[] = [];

    // Required validation
    if (setting.validation?.required && (value === null || value === undefined || value === '')) {
      errors.push(`${setting.key} is required`);
    }

    // Type validation
    if (value !== null && value !== undefined) {
      switch (setting.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${setting.key} must be a number`);
          } else {
            const numValue = Number(value);
            if (setting.validation?.min !== undefined && numValue < setting.validation.min) {
              errors.push(`${setting.key} must be at least ${setting.validation.min}`);
            }
            if (setting.validation?.max !== undefined && numValue > setting.validation.max) {
              errors.push(`${setting.key} must be at most ${setting.validation.max}`);
            }
          }
          break;

        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${setting.key} must be a string`);
          } else {
            if (setting.validation?.min !== undefined && value.length < setting.validation.min) {
              errors.push(`${setting.key} must be at least ${setting.validation.min} characters`);
            }
            if (setting.validation?.max !== undefined && value.length > setting.validation.max) {
              errors.push(`${setting.key} must be at most ${setting.validation.max} characters`);
            }
            if (setting.validation?.pattern) {
              const regex = new RegExp(setting.validation.pattern);
              if (!regex.test(value)) {
                errors.push(`${setting.key} format is invalid`);
              }
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${setting.key} must be a boolean`);
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${setting.key} must be an array`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate multiple settings
   */
  validateSettings(settings: Setting[], values: { [key: string]: any }): ValidationResult {
    const allErrors: string[] = [];

    settings.forEach(setting => {
      const value = values[setting.key];
      const result = this.validateSetting(setting, value);
      allErrors.push(...result.errors);
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Get setting by key
   */
  getSetting(key: string): Observable<Setting> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<Setting>(`${baseUrl}/api/settings/${key}/`);
  }

  /**
   * Check if user has permission to modify setting
   */
  canModifySetting(setting: Setting): boolean {
    // Add your permission logic here
    if (setting.readonly) {
      return false;
    }

    // Check if user has admin privileges for sensitive settings
    if (setting.sensitive) {
      // Return based on user role/permissions
      return true; // Placeholder
    }

    return true;
  }

  /**
   * Get default value for a setting
   */
  getDefaultValue(setting: Setting): any {
    switch (setting.type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * Format setting value for display
   */
  formatValueForDisplay(setting: Setting, value: any): string {
    if (value === null || value === undefined) {
      return 'Not set';
    }

    if (setting.sensitive) {
      return '••••••••';
    }

    switch (setting.type) {
      case 'boolean':
        return value ? 'Enabled' : 'Disabled';
      case 'array':
        return Array.isArray(value) ? `${value.length} items` : 'Invalid array';
      case 'object':
        return typeof value === 'object' ? JSON.stringify(value) : 'Invalid object';
      default:
        return String(value);
    }
  }

  /**
   * Check if setting has been modified from default
   */
  isModified(setting: Setting, currentValue: any): boolean {
    const defaultValue = this.getDefaultValue(setting);
    return JSON.stringify(currentValue) !== JSON.stringify(defaultValue);
  }

  /**
   * Get settings grouped by category
   */
  getSettingsByCategory(settings: Setting[]): { [category: string]: Setting[] } {
    return settings.reduce((groups, setting) => {
      const category = setting.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(setting);
      return groups;
    }, {} as { [category: string]: Setting[] });
  }

  /**
   * Search settings by key or description
   */
  searchSettings(settings: Setting[], query: string): Setting[] {
    const searchTerm = query.toLowerCase();
    return settings.filter(setting =>
      setting.key.toLowerCase().includes(searchTerm) ||
      setting.description.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get setting history/audit trail
   */
  getSettingHistory(key: string): Observable<any[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<any[]>(`${baseUrl}/api/settings/${key}/history/`);
  }

  /**
   * Backup current settings
   */
  backupSettings(): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post<any>(`${baseUrl}/api/settings/backup/`, {});
  }

  /**
   * Restore settings from backup
   */
  restoreSettings(backupId: string): Observable<Setting[]> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post<Setting[]>(`${baseUrl}/api/settings/restore/`, { backupId });
  }
}
