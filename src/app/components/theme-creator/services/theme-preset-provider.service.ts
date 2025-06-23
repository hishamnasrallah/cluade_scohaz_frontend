// src/app/components/theme-creator/services/theme-preset-provider.service.ts
// Example of how to extend the theme creator with dynamic preset loading

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ThemePreset } from '../../../models/theme.model';
import { THEME_PRESETS } from '../constants/theme-presets.constant';

export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  presets: ThemePreset[];
}

@Injectable({
  providedIn: 'root'
})
export class ThemePresetProviderService {
  private presetsSubject = new BehaviorSubject<ThemePreset[]>(THEME_PRESETS);
  public presets$ = this.presetsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<PresetCategory[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private customPresetsKey = 'custom-theme-presets';

  constructor(private http: HttpClient) {
    this.loadLocalPresets();
    this.initializeCategories();
  }

  // Load presets from various sources
  loadAllPresets(): void {
    // Load default presets
    const defaultPresets = THEME_PRESETS;

    // Load custom presets from localStorage
    const customPresets = this.getCustomPresets();

    // Combine all presets
    const allPresets = [...defaultPresets, ...customPresets];
    this.presetsSubject.next(allPresets);
  }

  // Load presets from a remote server
  loadRemotePresets(url: string): Observable<ThemePreset[]> {
    return this.http.get<ThemePreset[]>(url).pipe(
      map(presets => {
        // Validate and merge with existing presets
        const validPresets = presets.filter(this.validatePreset);
        const currentPresets = this.presetsSubject.value;
        const mergedPresets = [...currentPresets, ...validPresets];
        this.presetsSubject.next(mergedPresets);
        return validPresets;
      }),
      catchError(error => {
        console.error('Failed to load remote presets:', error);
        return of([]);
      })
    );
  }

  // Save a custom preset
  saveCustomPreset(preset: ThemePreset): void {
    const customPresets = this.getCustomPresets();

    // Check if preset with same ID exists
    const existingIndex = customPresets.findIndex(p => p.id === preset.id);

    if (existingIndex >= 0) {
      customPresets[existingIndex] = preset;
    } else {
      customPresets.push(preset);
    }

    // Save to localStorage
    localStorage.setItem(this.customPresetsKey, JSON.stringify(customPresets));

    // Update the presets subject
    this.loadAllPresets();
  }

  // Delete a custom preset
  deleteCustomPreset(presetId: string): boolean {
    const customPresets = this.getCustomPresets();
    const filteredPresets = customPresets.filter(p => p.id !== presetId);

    if (filteredPresets.length < customPresets.length) {
      localStorage.setItem(this.customPresetsKey, JSON.stringify(filteredPresets));
      this.loadAllPresets();
      return true;
    }

    return false;
  }

  // Get presets by category
  getPresetsByCategory(categoryId: string): ThemePreset[] {
    const category = this.categoriesSubject.value.find(c => c.id === categoryId);
    return category ? category.presets : [];
  }

  // Create a preset from current theme
  createPresetFromTheme(name: string, theme: any, icon?: string): ThemePreset {
    return {
      id: `custom-${Date.now()}`,
      name,
      icon: icon || '🎨',
      config: { ...theme }
    };
  }

  // Export presets to file
  exportPresets(presets: ThemePreset[]): void {
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-presets-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Import presets from file
  async importPresets(file: File): Promise<ThemePreset[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const presets = JSON.parse(e.target?.result as string) as ThemePreset[];
          const validPresets = presets.filter(this.validatePreset);

          // Save imported presets as custom presets
          validPresets.forEach(preset => {
            preset.id = `imported-${Date.now()}-${Math.random()}`;
            this.saveCustomPreset(preset);
          });

          resolve(validPresets);
        } catch (error) {
          reject(new Error('Invalid preset file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Private methods
  private loadLocalPresets(): void {
    this.loadAllPresets();
  }

  private getCustomPresets(): ThemePreset[] {
    try {
      const stored = localStorage.getItem(this.customPresetsKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private validatePreset(preset: any): preset is ThemePreset {
    return preset &&
      preset.id &&
      preset.name &&
      preset.config &&
      preset.config.primaryColor &&
      preset.config.secondaryColor;
  }

  private initializeCategories(): void {
    const categories: PresetCategory[] = [
      {
        id: 'default',
        name: 'Default Presets',
        description: 'Built-in theme presets',
        presets: THEME_PRESETS.filter(p => !p.id.startsWith('custom'))
      },
      {
        id: 'custom',
        name: 'Custom Presets',
        description: 'Your saved custom themes',
        presets: this.getCustomPresets()
      },
      {
        id: 'seasonal',
        name: 'Seasonal Themes',
        description: 'Themes for different seasons and holidays',
        presets: [] // Could be loaded from server
      },
      {
        id: 'industry',
        name: 'Industry Specific',
        description: 'Themes tailored for specific industries',
        presets: [] // Could be loaded from server
      }
    ];

    this.categoriesSubject.next(categories);
  }
}

// Usage example in the theme creator component:
/*
export class ThemeCreatorComponent {
  presets$ = this.presetProvider.presets$;
  categories$ = this.presetProvider.categories$;

  constructor(
    private presetProvider: ThemePresetProviderService,
    // ... other dependencies
  ) {}

  saveCurrentAsPreset(): void {
    const presetName = prompt('Enter preset name:');
    if (presetName) {
      const preset = this.presetProvider.createPresetFromTheme(
        presetName,
        this.currentTheme,
        '⭐'
      );
      this.presetProvider.saveCustomPreset(preset);
    }
  }

  loadPresetsFromUrl(): void {
    this.presetProvider.loadRemotePresets('/api/theme-presets')
      .subscribe(presets => {
        console.log(`Loaded ${presets.length} remote presets`);
      });
  }
}
*/
