// components/settings/translation-management/translation-management.component.ts - ENHANCED
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

interface TranslationFile {
  language: string;
  languageName: string;
  version: string;
  lastUpdated: string;
  translations: { [key: string]: string };
  keyCount: number;
  isActive: boolean;
}

interface TranslationKey {
  key: string;
  values: { [language: string]: string };
  isNew?: boolean;
  isModified?: boolean;
}

interface AvailableLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

interface UserPreferences {
  id: number;
  lang: string;
}

@Component({
  selector: 'app-translation-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
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
    MatChipsModule,
    MatTabsModule,
    FormsModule
  ],
  template: `
    <div class="translation-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Translation Management</h1>
            <p>Manage multilingual content and localization</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-button (click)="openAddLanguageDialog()">
              <mat-icon>language</mat-icon>
              Add Language
            </button>
            <button mat-raised-button color="primary" (click)="openAddKeyDialog()">
              <mat-icon>add</mat-icon>
              Add Translation Key
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon languages-icon">
            <mat-icon>language</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ translationFiles.length }}</h3>
            <p>Languages</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon keys-icon">
            <mat-icon>translate</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getTotalKeys() }}</h3>
            <p>Translation Keys</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon coverage-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getTranslationCoverage() }}%</h3>
            <p>Coverage</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon version-icon">
            <mat-icon>history</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getCurrentUserLanguageVersion() }}</h3>
            <p>Latest Version</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading translation data...</p>
      </div>

      <!-- Translation Management Tabs -->
      <div class="translation-content" *ngIf="!isLoading">
        <mat-tab-group class="translation-tabs" animationDuration="300ms">
          <!-- Languages Overview Tab -->
          <mat-tab label="Languages">
            <div class="tab-content">
              <div class="languages-grid">
                <mat-card *ngFor="let file of translationFiles" class="language-card" (click)="editLanguageTranslations(file)">
                  <mat-card-header>
                    <div class="language-header">
                      <div class="language-flag">{{ getLanguageFlag(file.language) }}</div>
                      <div class="language-info">
                        <h3>{{ getLanguageName(file.language) }}</h3>
                        <p>{{ file.language.toUpperCase() }} • {{ file.keyCount }} keys</p>
                      </div>
                      <div class="language-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button (click)="editLanguageTranslations(file)" matTooltip="Edit Translations">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="viewVersionHistory(file)" matTooltip="Version History">
                          <mat-icon>history</mat-icon>
                        </button>
                        <button mat-icon-button (click)="exportLanguage(file)" matTooltip="Export">
                          <mat-icon>download</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="language-stats">
                      <div class="stat-item">
                        <span class="stat-label">Version</span>
                        <span class="stat-value">{{ file.version || 'N/A' }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Last Updated</span>
                        <span class="stat-value">{{ formatDate(file.lastUpdated) }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Status</span>
                        <span class="stat-value" [class]="file.isActive ? 'status-active' : 'status-inactive'">
                          {{ file.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="translationFiles.length === 0">
                <mat-icon>language</mat-icon>
                <h3>No languages found</h3>
                <p>Start by adding your first language</p>
                <button mat-raised-button color="primary" (click)="openAddLanguageDialog()">
                  <mat-icon>add</mat-icon>
                  Add Language
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- Translation Keys Tab - ENHANCED MASTER-DETAIL LAYOUT -->
          <mat-tab label="Translation Keys">
            <div class="tab-content master-detail-layout">
              <!-- Header Controls -->
              <div class="header-controls">
                <div class="search-section">
                  <mat-form-field appearance="outline" class="search-field">
                    <mat-label>Search translations</mat-label>
                    <input matInput [(ngModel)]="searchQuery" (input)="filterTranslations()" placeholder="Search by key or value">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="language-selector">
                    <mat-label>Show Languages (max 3)</mat-label>
                    <mat-select multiple [(value)]="selectedTableLanguages" (selectionChange)="onTableLanguageChange()">
                      <mat-option *ngFor="let file of translationFiles" [value]="file.language">
                        <div class="language-option-compact">
                          <span class="flag">{{ getLanguageFlag(file.language) }}</span>
                          <span class="lang-name">{{ getLanguageName(file.language) }}</span>
                          <span class="lang-code">({{ file.language.toUpperCase() }})</span>
                        </div>
                      </mat-option>
                    </mat-select>
                    <mat-hint>Select up to 3 languages to display in the table</mat-hint>
                  </mat-form-field>
                </div>

                <div class="action-buttons-header">
                  <button mat-button (click)="openAddKeyDialog()" color="primary">
                    <mat-icon>add</mat-icon>
                    Add Key
                  </button>
                  <button mat-button (click)="openBulkEditDialog()">
                    <mat-icon>edit_note</mat-icon>
                    Bulk Edit
                  </button>
                </div>
              </div>

              <!-- Master-Detail Container -->
              <div class="master-detail-container">
                <!-- LEFT: Translation Keys List (Master) -->
                <div class="master-panel">
                  <div class="panel-header">
                    <h3>Translation Keys ({{ filteredTranslationKeys.length }})</h3>
                    <span class="panel-subtitle">Select a key to edit all languages</span>
                  </div>

                  <div class="keys-table-container">
                    <table class="keys-table">
                      <thead>
                        <tr>
                          <th class="key-column">Key</th>
                          <th *ngFor="let lang of displayTableLanguages" class="language-column">
                            {{ lang.toUpperCase() }}
                          </th>
                          <th class="status-column">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let translationKey of filteredTranslationKeys"
                            class="key-row"
                            [class.selected]="selectedTranslationKey?.key === translationKey.key"
                            (click)="selectTranslationKey(translationKey)">
                          <td class="key-cell">
                            <div class="key-content">
                              <span class="translation-key">{{ translationKey.key }}</span>
                              <mat-chip-set *ngIf="translationKey.isNew || translationKey.isModified" class="key-badges">
                                <mat-chip class="new-chip" *ngIf="translationKey.isNew">NEW</mat-chip>
                                <mat-chip class="modified-chip" *ngIf="translationKey.isModified">MOD</mat-chip>
                              </mat-chip-set>
                            </div>
                          </td>
                          <td *ngFor="let lang of displayTableLanguages" class="value-cell-compact">
                            <div class="translation-preview" [class.missing]="!translationKey.values[lang]">
                              <span class="preview-text">{{ getPreviewText(translationKey.values[lang]) }}</span>
                            </div>
                          </td>
                          <td class="status-cell">
                            <div class="completion-indicator">
                              <mat-icon class="status-icon" [class]="getKeyCompletionStatus(translationKey).class">
                                {{ getKeyCompletionStatus(translationKey).icon }}
                              </mat-icon>
                              <span class="completion-text">{{ getKeyCompletionStatus(translationKey).text }}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Empty State for Keys -->
                    <div class="empty-search" *ngIf="filteredTranslationKeys.length === 0">
                      <mat-icon>{{ searchQuery ? 'search_off' : 'translate' }}</mat-icon>
                      <h3>{{ searchQuery ? 'No translations found' : 'No translation keys' }}</h3>
                      <p>{{ searchQuery ? 'Try adjusting your search criteria' : 'Add your first translation key to get started' }}</p>
                      <button mat-raised-button color="primary" (click)="openAddKeyDialog()" *ngIf="!searchQuery">
                        <mat-icon>add</mat-icon>
                        Add Translation Key
                      </button>
                    </div>
                  </div>
                </div>

                <!-- RIGHT: Selected Key Details (Detail) -->
                <div class="detail-panel" [class.show]="selectedTranslationKey">
                  <div class="panel-header" *ngIf="selectedTranslationKey">
                    <div class="selected-key-info">
                      <h3>{{ selectedTranslationKey.key }}</h3>
                      <span class="panel-subtitle">Edit translations for all languages</span>
                    </div>
                    <div class="detail-actions">
                      <button mat-icon-button (click)="editTranslationKey(selectedTranslationKey)" matTooltip="Edit Key Name">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button (click)="deleteTranslationKey(selectedTranslationKey)" matTooltip="Delete Key" class="delete-btn">
                        <mat-icon>delete</mat-icon>
                      </button>
                      <button mat-icon-button (click)="clearSelection()" matTooltip="Close">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>

                  <div class="translations-detail" *ngIf="selectedTranslationKey">
                    <div class="quick-save-notice" *ngIf="hasUnsavedChanges">
                      <mat-icon>info</mat-icon>
                      <span>You have unsaved changes</span>
                      <button mat-button color="primary" (click)="saveSelectedKeyTranslations()">
                        <mat-icon>save</mat-icon>
                        Save Changes
                      </button>
                    </div>

                    <div class="languages-list">
                      <div *ngFor="let file of translationFiles; trackBy: trackByLanguage" class="language-translation-item">
                        <div class="language-header">
                          <div class="language-info">
                            <span class="language-flag">{{ getLanguageFlag(file.language) }}</span>
                            <div class="language-details">
                              <span class="language-name">{{ getLanguageName(file.language) }}</span>
                              <span class="language-code">{{ file.language.toUpperCase() }}</span>
                            </div>
                          </div>
                          <div class="translation-status">
                            <mat-icon *ngIf="selectedTranslationKey.values[file.language]?.trim()" class="status-complete">check_circle</mat-icon>
                            <mat-icon *ngIf="!selectedTranslationKey.values[file.language]?.trim()" class="status-missing">radio_button_unchecked</mat-icon>
                          </div>
                        </div>

                        <mat-form-field appearance="outline" class="translation-field-detail">
                          <mat-label>Translation for {{ getLanguageName(file.language) }}</mat-label>
                          <textarea matInput
                                   [(ngModel)]="selectedTranslationKey.values[file.language]"
                                   (ngModelChange)="markAsChanged()"
                                   rows="2"
                                   placeholder="Enter translation for {{ getLanguageName(file.language) }}"></textarea>
                        </mat-form-field>
                      </div>
                    </div>

                    <div class="detail-footer">
                      <button mat-raised-button color="primary" (click)="saveSelectedKeyTranslations()" [disabled]="isSaving">
                        <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                        <mat-icon *ngIf="!isSaving">save</mat-icon>
                        <span *ngIf="!isSaving">Save All Translations</span>
                      </button>
                      <button mat-button (click)="resetSelectedKey()">
                        <mat-icon>refresh</mat-icon>
                        Reset Changes
                      </button>
                    </div>
                  </div>

                  <!-- Empty Detail State -->
                  <div class="empty-detail" *ngIf="!selectedTranslationKey">
                    <mat-icon>translate</mat-icon>
                    <h3>Select a translation key</h3>
                    <p>Choose a key from the left panel to edit its translations in all languages</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Import/Export Tab -->
          <mat-tab label="Import/Export">
            <div class="tab-content">
              <div class="import-export-section">
                <mat-card class="action-card">
                  <mat-card-header>
                    <mat-card-title>Export Translations</mat-card-title>
                    <mat-card-subtitle>Download translation files</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Export all or selected languages as JSON files</p>
                    <div class="export-options">
                      <mat-form-field appearance="outline">
                        <mat-label>Select Languages</mat-label>
                        <mat-select multiple [(value)]="selectedLanguagesForExport">
                          <mat-option *ngFor="let file of translationFiles" [value]="file.language">
                            {{ getLanguageName(file.language) }} ({{ file.language.toUpperCase() }})
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="exportSelected()">
                      <mat-icon>download</mat-icon>
                      Export Selected
                    </button>
                    <button mat-button (click)="exportAll()">
                      <mat-icon>file_download</mat-icon>
                      Export All
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card">
                  <mat-card-header>
                    <mat-card-title>Import Translations</mat-card-title>
                    <mat-card-subtitle>Upload translation files</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p>Import JSON translation files to update or add new translations</p>
                    <div class="import-options">
                      <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" multiple style="display: none;">
                      <button mat-stroked-button (click)="fileInput.click()">
                        <mat-icon>upload_file</mat-icon>
                        Select Files
                      </button>
                      <span *ngIf="selectedFiles.length > 0" class="file-count">
                        {{ selectedFiles.length }} file(s) selected
                      </span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions>
                    <button mat-raised-button color="accent" (click)="importFiles()" [disabled]="selectedFiles.length === 0">
                      <mat-icon>upload</mat-icon>
                      Import Files
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Add Language Dialog - ENHANCED -->
    <ng-template #addLanguageDialog>
      <div mat-dialog-title>Add New Language</div>
      <mat-dialog-content>
        <form [formGroup]="languageForm" class="language-form">
          <mat-form-field appearance="outline">
            <mat-label>Select Language</mat-label>
            <mat-select formControlName="selectedLanguage" (selectionChange)="onLanguageSelection()">
              <mat-option *ngFor="let lang of availableLanguages" [value]="lang">
                <div class="language-option">
                  <span class="language-flag">{{ lang.flag || '🌐' }}</span>
                  <span class="language-details">
                    <span class="language-name">{{ lang.name }}</span>
                    <span class="language-code">({{ lang.code }})</span>
                  </span>
                </div>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="languageForm.get('selectedLanguage')?.hasError('required')">
              Please select a language
            </mat-error>
          </mat-form-field>

          <div *ngIf="languageForm.get('selectedLanguage')?.value" class="selected-language-info">
            <p class="info-text">
              <mat-icon>info</mat-icon>
              Selected: {{ languageForm.get('selectedLanguage')?.value?.name }} ({{ languageForm.get('selectedLanguage')?.value?.code }})
            </p>
          </div>

          <p class="info-text">
            <mat-icon>info</mat-icon>
            A new translation file will be created with an empty set of translations.
          </p>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="addLanguage()" [disabled]="!languageForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">Add Language</span>
        </button>
      </mat-dialog-actions>
    </ng-template>

    <!-- Add/Edit Translation Key Dialog - ENHANCED -->
    <ng-template #editKeyDialog>
      <div mat-dialog-title>{{ editingKey ? 'Edit' : 'Add' }} Translation Key</div>
      <mat-dialog-content>
        <form [formGroup]="keyForm" class="key-form">
          <mat-form-field appearance="outline">
            <mat-label>Translation Key</mat-label>
            <input matInput formControlName="key" placeholder="e.g., login_button, welcome_message"
                   (input)="validateKey()">
            <mat-hint>Use snake_case format (lowercase with underscores)</mat-hint>
            <mat-error *ngIf="keyForm.get('key')?.hasError('required')">
              Translation key is required
            </mat-error>
            <mat-error *ngIf="keyForm.get('key')?.hasError('pattern')">
              Key must be in snake_case format (lowercase letters, numbers, and underscores only)
            </mat-error>
          </mat-form-field>

          <div class="translations-section">
            <h4>Translations</h4>
            <div *ngFor="let file of translationFiles" class="translation-input">
              <mat-form-field appearance="outline">
                <mat-label>{{ getLanguageName(file.language) }} ({{ file.language.toUpperCase() }})</mat-label>
                <textarea matInput [formControlName]="'translation_' + file.language"
                         rows="2" placeholder="Enter translation"></textarea>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="saveTranslationKey()" [disabled]="!keyForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingKey ? 'Update' : 'Add' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>

    <!-- Edit Language Translations Dialog -->
    <ng-template #editLanguageDialog>
      <div mat-dialog-title>Edit {{ selectedLanguageForEdit?.languageName }} Translations</div>
      <mat-dialog-content>
        <div class="language-edit-content">
          <div class="search-box">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search keys</mat-label>
              <input matInput [(ngModel)]="languageEditSearchQuery" (input)="filterLanguageKeys()" placeholder="Search translation keys">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="language-translations-list">
            <div *ngFor="let key of filteredLanguageKeys" class="key-edit-item">
              <div class="key-info">
                <span class="key-name">{{ key }}</span>
              </div>
              <mat-form-field appearance="outline" class="translation-field">
                <mat-label>Translation</mat-label>
                <textarea matInput
                         [(ngModel)]="languageEditTranslations[key]"
                         rows="2"
                         placeholder="Enter translation"></textarea>
              </mat-form-field>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="saveLanguageTranslations()" [disabled]="isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">Save Translations</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .translation-management {
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

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.languages-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.keys-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.coverage-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
      &.version-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    }

    .stat-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .stat-content p {
      color: #64748b;
      margin: 4px 0 0 0;
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

    .translation-content {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .translation-tabs {
      min-height: 500px;
    }

    .tab-content {
      padding: 24px;
    }

    /* MASTER-DETAIL LAYOUT STYLES */
    .master-detail-layout {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 300px);
      min-height: 600px;
    }

    .header-controls {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .search-section {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .language-selector {
      min-width: 300px;
    }

    .language-option-compact {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .language-option-compact .flag {
      font-size: 1rem;
    }

    .language-option-compact .lang-name {
      font-weight: 500;
    }

    .language-option-compact .lang-code {
      color: #64748b;
      font-size: 0.8rem;
    }

    .action-buttons-header {
      display: flex;
      gap: 12px;
    }

    .master-detail-container {
      display: flex;
      gap: 24px;
      flex: 1;
      overflow: hidden;
    }

    /* MASTER PANEL (LEFT) */
    .master-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .panel-header h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
    }

    .panel-subtitle {
      color: #64748b;
      font-size: 0.9rem;
    }

    .keys-table-container {
      flex: 1;
      overflow-y: auto;
    }

    .keys-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .keys-table th {
      background: #f8fafc;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.85rem;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .keys-table td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    .key-row {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.04);
      }

      &.selected {
        background: rgba(102, 126, 234, 0.08);
        border-left: 4px solid #667eea;
      }
    }

    .key-column {
      width: 40%;
      min-width: 200px;
    }

    .language-column {
      width: auto;
      min-width: 120px;
    }

    .status-column {
      width: 100px;
    }

    .value-cell-compact {
      max-width: 120px;
    }

    .translation-preview {
      font-size: 0.85rem;
    }

    .preview-text {
      color: #334155;

      &.missing {
        color: #94a3b8;
        font-style: italic;
      }
    }

    .translation-preview.missing .preview-text {
      color: #94a3b8;
      font-style: italic;
    }

    .status-cell {
      text-align: center;
    }

    .completion-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;

      &.status-complete {
        color: #22c55e;
      }

      &.status-partial {
        color: #f59e0b;
      }

      &.status-empty {
        color: #94a3b8;
      }
    }

    .completion-text {
      font-size: 0.8rem;
      font-weight: 500;
      color: #64748b;
    }

    /* DETAIL PANEL (RIGHT) */
    .detail-panel {
      width: 400px;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      overflow: hidden;

      &:not(.show) {
        opacity: 0.6;
      }

      &.show {
        opacity: 1;
      }
    }

    .selected-key-info {
      flex: 1;
    }

    .selected-key-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
    }

    .detail-actions {
      display: flex;
      gap: 4px;
    }

    .detail-actions .delete-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .translations-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .quick-save-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(102, 126, 234, 0.08);
      border-bottom: 1px solid #e2e8f0;
      color: #667eea;
      font-size: 0.9rem;
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      button {
        margin-left: auto;
      }
    }

    .languages-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .language-translation-item {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }
    }

    .language-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .language-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .language-flag {
      font-size: 1.2rem;
    }

    .language-details {
      display: flex;
      flex-direction: column;
    }

    .language-name {
      font-weight: 500;
      color: #334155;
      font-size: 0.9rem;
    }

    .language-code {
      color: #64748b;
      font-size: 0.8rem;
    }

    .translation-status .status-complete {
      color: #22c55e;
    }

    .translation-status .status-missing {
      color: #94a3b8;
    }

    .translation-field-detail {
      width: 100%;
    }

    .detail-footer {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      gap: 12px;
    }

    .empty-detail {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #64748b;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      h3 {
        font-size: 1.2rem;
        margin: 0 0 8px 0;
        color: #334155;
      }

      p {
        margin: 0;
        max-width: 250px;
      }
    }

    .languages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .language-card {
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }

    .language-header {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .language-flag {
      font-size: 2rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;
    }

    .language-info {
      flex: 1;
    }

    .language-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
    }

    .language-info p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .language-actions {
      display: flex;
      gap: 4px;
    }

    .language-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 4px;
    }

    .stat-value {
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;

      &.status-active {
        color: #22c55e;
      }

      &.status-inactive {
        color: #64748b;
      }
    }

    .search-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .translations-table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    /* ENHANCED COMPACT TABLE STYLES */
    .compact-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .compact-table th {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 2px solid #e2e8f0;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .compact-table td {
      padding: 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
      max-width: 0;
    }

    .compact-table .key-column {
      width: 25%;
      min-width: 150px;
    }

    .compact-table .language-column {
      width: auto;
      min-width: 120px;
    }

    .compact-table .actions-column {
      width: 80px;
    }

    .translation-row {
      height: 48px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.04);
      }
    }

    .key-cell {
      font-weight: 500;
      color: #334155;
    }

    .key-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .translation-key {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #667eea;
      font-weight: 500;
    }

    .key-badges {
      display: flex;
      gap: 4px;
    }

    .key-badges mat-chip {
      height: 18px;
      font-size: 0.65rem;
      font-weight: 600;
    }

    .value-cell {
      font-size: 0.85rem;
      line-height: 1.3;
    }

    .translation-value {
      display: flex;
      align-items: center;
      min-height: 32px;
    }

    .value-text {
      word-break: break-word;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      &.missing {
        color: #94a3b8;
        font-style: italic;
      }
    }

    .translation-value.missing .value-text {
      color: #94a3b8;
      font-style: italic;
    }

    .actions-cell {
      width: 80px;
    }

    .action-buttons {
      display: flex;
      gap: 2px;
      justify-content: center;
    }

    .action-buttons button {
      width: 32px;
      height: 32px;
      min-width: 32px;
    }

    .action-buttons .mat-mdc-icon-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .edit-btn:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .delete-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .new-chip {
      background: rgba(34, 197, 94, 0.1) !important;
      color: #16a34a !important;
    }

    .modified-chip {
      background: rgba(59, 130, 246, 0.1) !important;
      color: #2563eb !important;
    }

    .import-export-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .action-card {
      border-radius: 12px;
    }

    .export-options,
    .import-options {
      margin: 16px 0;
    }

    .file-count {
      margin-left: 12px;
      color: #64748b;
      font-size: 0.9rem;
    }

    .empty-state,
    .empty-search {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0 0 8px 0;
        color: #334155;
      }

      p {
        margin: 0 0 24px 0;
      }
    }

    /* ENHANCED DIALOG STYLES */
    .language-form,
    .key-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 450px;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .language-flag {
      font-size: 1.2rem;
    }

    .language-details {
      display: flex;
      flex-direction: column;
    }

    .language-name {
      font-weight: 500;
    }

    .language-code {
      font-size: 0.8rem;
      color: #64748b;
    }

    .selected-language-info {
      margin: 8px 0;
    }

    .translations-section {
      margin-top: 16px;

      h4 {
        margin: 0 0 16px 0;
        color: #334155;
        font-size: 1.1rem;
      }
    }

    .translation-input {
      margin-bottom: 12px;
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
      padding: 12px;
      background: rgba(102, 126, 234, 0.08);
      border-radius: 8px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    /* Language Edit Dialog Styles */
    .language-edit-content {
      min-width: 500px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .search-box {
      margin-bottom: 16px;
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
      padding-bottom: 8px;
    }

    .language-translations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .key-edit-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }
    }

    .key-info {
      min-width: 150px;
      padding-top: 16px;
    }

    .key-name {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.85rem;
      color: #667eea;
      font-weight: 500;
    }

    .translation-field {
      flex: 1;
    }

    @media (max-width: 768px) {
      .translation-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .languages-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
      }

      .import-export-section {
        grid-template-columns: 1fr;
      }

      .language-stats {
        grid-template-columns: 1fr;
        text-align: left;
      }

      .translations-table-container {
        overflow-x: auto;
      }

      .compact-table {
        min-width: 700px;
      }

      .key-edit-item {
        flex-direction: column;
        align-items: stretch;
      }

      .key-info {
        min-width: auto;
        padding-top: 0;
      }

      /* Master-Detail Mobile Responsive */
      .master-detail-layout {
        height: auto;
        min-height: 500px;
      }

      .header-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-section {
        flex-direction: column;
      }

      .language-selector {
        min-width: auto;
      }

      .master-detail-container {
        flex-direction: column;
        height: auto;
      }

      .detail-panel {
        width: auto;
        max-height: 400px;
      }

      .languages-list {
        max-height: 300px;
      }

      .language-translation-item {
        padding: 12px;
      }

      .language-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .detail-footer {
        flex-direction: column;
      }
    }
  `]
})
export class TranslationManagementComponent implements OnInit {
  @ViewChild('addLanguageDialog') addLanguageDialog!: TemplateRef<any>;
  @ViewChild('editKeyDialog') editKeyDialog!: TemplateRef<any>;
  @ViewChild('editLanguageDialog') editLanguageDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  searchQuery = '';
  languageEditSearchQuery = '';

  translationFiles: TranslationFile[] = [];
  translationKeys: TranslationKey[] = [];
  filteredTranslationKeys: TranslationKey[] = [];
  selectedLanguagesForExport: string[] = [];
  selectedFiles: File[] = [];
  availableLanguages: AvailableLanguage[] = [];
  userPreferences: UserPreferences | null = null;

  // Master-Detail Layout Properties
  selectedTranslationKey: TranslationKey | null = null;
  selectedTableLanguages: string[] = [];
  displayTableLanguages: string[] = [];
  hasUnsavedChanges = false;
  originalSelectedKeyValues: { [language: string]: string } = {};

  // Language edit dialog properties
  selectedLanguageForEdit: TranslationFile | null = null;
  languageEditTranslations: { [key: string]: string } = {};
  filteredLanguageKeys: string[] = [];

  languageForm: FormGroup;
  keyForm: FormGroup;
  editingKey: TranslationKey | null = null;

  // Predefined language information
  private languageInfo: { [code: string]: { name: string; nativeName: string; flag: string; isRTL: boolean } } = {
    'en': { name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
    'ar': { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    'de': { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
    'fr': { name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
    'es': { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
    'it': { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
    'pt': { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
    'ru': { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
    'zh': { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRTL: false },
    'ja': { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false }
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.languageForm = this.fb.group({
      selectedLanguage: [null, Validators.required]
    });

    // Enhanced key form with snake_case validation
    this.keyForm = this.fb.group({
      key: ['', [
        Validators.required,
        Validators.pattern(/^[a-z0-9_]+$/) // snake_case pattern
      ]]
    });
  }

  ngOnInit(): void {
    this.loadUserPreferences();
    this.loadAvailableLanguages();
    this.loadTranslations();
  }

  // Initialize default languages to show in table (max 3)
  initializeDefaultTableLanguages(): void {
    // Default to first 3 languages or user's preferred language + 2 others
    if (this.translationFiles.length > 0) {
      const userLang = this.userPreferences?.lang || 'en';
      const defaultLangs = [userLang];

      // Add other languages up to 3 total
      this.translationFiles.forEach(file => {
        if (defaultLangs.length < 3 && !defaultLangs.includes(file.language)) {
          defaultLangs.push(file.language);
        }
      });

      this.selectedTableLanguages = defaultLangs;
      this.displayTableLanguages = [...defaultLangs];
    }
  }

  // Load user preferences to get current language
  loadUserPreferences(): void {
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<UserPreferences>(`${baseUrl}/auth/preferences/`)
      .subscribe({
        next: (preferences) => {
          this.userPreferences = preferences;
        },
        error: (err) => {
          console.error('Error loading user preferences:', err);
          // Fallback to 'en' if preferences can't be loaded
          this.userPreferences = { id: 0, lang: 'en' };
        }
      });
  }

  // Load available languages from API
  loadAvailableLanguages(): void {
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<AvailableLanguage[]>(`${baseUrl}/version/languages/available/`)
      .subscribe({
        next: (languages) => {
          this.availableLanguages = languages.map(lang => ({
            ...lang,
            flag: this.languageInfo[lang.code]?.flag || '🌐'
          }));
        },
        error: (err) => {
          console.error('Error loading available languages:', err);
          // Fallback to predefined languages
          this.availableLanguages = Object.keys(this.languageInfo).map(code => ({
            code,
            name: this.languageInfo[code].name,
            nativeName: this.languageInfo[code].nativeName,
            flag: this.languageInfo[code].flag
          }));
        }
      });
  }

  loadTranslations(): void {
    this.isLoading = true;
    this.loadLanguages();
  }

  private loadLanguages(): void {
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<string[]>(`${baseUrl}/version/translation/languages/`)
      .subscribe({
        next: (languages) => {
          this.translationFiles = [];
          const loadPromises = languages.map(lang => this.loadLanguageData(lang));

          Promise.all(loadPromises).then(() => {
            this.buildTranslationKeys();
            this.isLoading = false;
          });
        },
        error: (err) => {
          console.error('Error loading languages:', err);
          this.snackBar.open('Error loading languages', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private async loadLanguageData(language: string): Promise<void> {
    const baseUrl = this.configService.getBaseUrl();

    try {
      // Load translations
      const translations = await this.http.get<{ [key: string]: string }>(`${baseUrl}/auth/translation/${language}/`).toPromise();

      // Load version info
      const versionInfo = await this.http.get<{ lang: string; version: string }>(`${baseUrl}/version/latest-version/${language}/`).toPromise();

      this.translationFiles.push({
        language,
        languageName: this.getLanguageName(language),
        version: versionInfo?.version || 'N/A',
        lastUpdated: new Date().toISOString(),
        translations: translations || {},
        keyCount: Object.keys(translations || {}).length,
        isActive: true
      });
    } catch (err) {
      console.error(`Error loading data for language ${language}:`, err);
    }
  }

  private buildTranslationKeys(): void {
    const allKeys = new Set<string>();

    // Collect all unique keys
    this.translationFiles.forEach(file => {
      Object.keys(file.translations).forEach(key => allKeys.add(key));
    });

    // Build translation keys with values for each language
    this.translationKeys = Array.from(allKeys).map(key => {
      const values: { [language: string]: string } = {};

      this.translationFiles.forEach(file => {
        values[file.language] = file.translations[key] || '';
      });

      return { key, values };
    });

    this.filteredTranslationKeys = [...this.translationKeys];
    this.setupKeyFormControls();
    this.initializeDefaultTableLanguages(); // Initialize after translation files are loaded
  }

  private setupKeyFormControls(): void {
    // Add form controls for each language
    this.translationFiles.forEach(file => {
      this.keyForm.addControl(`translation_${file.language}`, this.fb.control(''));
    });
  }

  filterTranslations(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTranslationKeys = [...this.translationKeys];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredTranslationKeys = this.translationKeys.filter(tk => {
      // Search in key
      if (tk.key.toLowerCase().includes(query)) return true;

      // Search in values
      return Object.values(tk.values).some(value =>
        value.toLowerCase().includes(query)
      );
    });
  }

  // Filter keys for language edit dialog
  filterLanguageKeys(): void {
    if (!this.selectedLanguageForEdit) return;

    const allKeys = Object.keys(this.selectedLanguageForEdit.translations);

    if (!this.languageEditSearchQuery.trim()) {
      this.filteredLanguageKeys = allKeys;
      return;
    }

    const query = this.languageEditSearchQuery.toLowerCase();
    this.filteredLanguageKeys = allKeys.filter(key =>
      key.toLowerCase().includes(query) ||
      this.selectedLanguageForEdit!.translations[key].toLowerCase().includes(query)
    );
  }

  // Enhanced language selection
  onLanguageSelection(): void {
    const selectedLang = this.languageForm.get('selectedLanguage')?.value;
    if (selectedLang) {
      console.log('Selected language:', selectedLang);
    }
  }

  openAddLanguageDialog(): void {
    this.languageForm.reset();
    this.dialog.open(this.addLanguageDialog, {
      width: '500px',
      maxHeight: '90vh'
    });
  }

  openAddKeyDialog(): void {
    this.editingKey = null;
    this.keyForm.reset();

    // Reset all translation controls
    this.translationFiles.forEach(file => {
      this.keyForm.get(`translation_${file.language}`)?.setValue('');
    });

    this.dialog.open(this.editKeyDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  editTranslationKey(translationKey: TranslationKey): void {
    this.editingKey = translationKey;
    this.keyForm.patchValue({ key: translationKey.key });

    // Set translation values
    this.translationFiles.forEach(file => {
      this.keyForm.get(`translation_${file.language}`)?.setValue(
        translationKey.values[file.language] || ''
      );
    });

    this.dialog.open(this.editKeyDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  // Enhanced edit language translations
  editLanguageTranslations(file: TranslationFile): void {
    this.selectedLanguageForEdit = file;
    this.languageEditTranslations = { ...file.translations };
    this.languageEditSearchQuery = '';
    this.filterLanguageKeys();

    this.dialog.open(this.editLanguageDialog, {
      width: '700px',
      maxHeight: '80vh'
    });
  }

  // Save language translations
  saveLanguageTranslations(): void {
    if (!this.selectedLanguageForEdit) return;

    this.isSaving = true;
    const baseUrl = this.configService.getBaseUrl();
    const language = this.selectedLanguageForEdit.language;

    // Prepare updates - only send changed translations
    const originalTranslations = this.selectedLanguageForEdit.translations;
    const updates: { [key: string]: string } = {};

    Object.keys(this.languageEditTranslations).forEach(key => {
      if (this.languageEditTranslations[key] !== originalTranslations[key]) {
        updates[key] = this.languageEditTranslations[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      this.snackBar.open('No changes to save', 'Close', { duration: 2000 });
      this.dialog.closeAll();
      this.isSaving = false;
      return;
    }

    const updateData = {
      add_or_update: updates,
      delete: []
    };

    this.http.patch(`${baseUrl}/version/translations/${language}/`, updateData)
      .subscribe({
        next: () => {
          this.snackBar.open('Translations updated successfully', 'Close', { duration: 3000 });
          this.loadTranslations();
          this.dialog.closeAll();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error updating translations:', err);
          this.snackBar.open('Error updating translations', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
  }

  // Enhanced key validation
  validateKey(): void {
    const keyControl = this.keyForm.get('key');
    if (keyControl?.value) {
      // Convert to snake_case automatically
      const snakeCaseValue = keyControl.value
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      if (snakeCaseValue !== keyControl.value) {
        keyControl.setValue(snakeCaseValue);
      }
    }
  }

  addLanguage(): void {
    if (!this.languageForm.valid) return;

    this.isSaving = true;
    const baseUrl = this.configService.getBaseUrl();
    const selectedLanguage = this.languageForm.value.selectedLanguage;

    const languageData = {
      code: selectedLanguage.code,
      name: selectedLanguage.name
    };

    this.http.post(`${baseUrl}/version/translation/languages/`, languageData)
      .subscribe({
        next: () => {
          this.snackBar.open(`${selectedLanguage.name} language added successfully`, 'Close', { duration: 3000 });
          this.loadTranslations();
          this.dialog.closeAll();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error adding language:', err);
          this.snackBar.open('Error adding language', 'Close', { duration: 3000 });
          this.isSaving = false;
        }
      });
  }

  saveTranslationKey(): void {
    if (!this.keyForm.valid) return;

    this.isSaving = true;
    const formValue = this.keyForm.value;
    const newKey = formValue.key;
    const oldKey = this.editingKey?.key;

    // Prepare updates for each language
    const updatePromises = this.translationFiles.map(file => {
      const translationValue = formValue[`translation_${file.language}`];
      const baseUrl = this.configService.getBaseUrl();

      let updateData: any;

      if (this.editingKey && oldKey !== newKey) {
        // Key changed: delete old key and add new key
        updateData = {
          add_or_update: translationValue ? { [newKey]: translationValue } : {},
          delete: [oldKey]
        };
      } else {
        // New key or key unchanged: just add/update
        updateData = {
          add_or_update: translationValue ? { [newKey]: translationValue } : {},
          delete: []
        };
      }

      // Only make API call if there's something to update
      if (Object.keys(updateData.add_or_update).length > 0 || updateData.delete.length > 0) {
        return this.http.patch(`${baseUrl}/version/translations/${file.language}/`, updateData).toPromise();
      }

      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        this.snackBar.open(
          `Translation key ${this.editingKey ? 'updated' : 'added'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.loadTranslations();
        this.dialog.closeAll();
        this.isSaving = false;
      })
      .catch(err => {
        console.error('Error saving translation key:', err);
        this.snackBar.open('Error saving translation key', 'Close', { duration: 3000 });
        this.isSaving = false;
      });
  }

  deleteTranslationKey(translationKey: TranslationKey): void {
    if (confirm(`Are you sure you want to delete the translation key "${translationKey.key}"?`)) {
      const deletePromises = this.translationFiles.map(file => {
        const baseUrl = this.configService.getBaseUrl();
        const updateData = {
          add_or_update: {},
          delete: [translationKey.key]
        };

        return this.http.patch(`${baseUrl}/version/translations/${file.language}/`, updateData).toPromise();
      });

      Promise.all(deletePromises)
        .then(() => {
          this.snackBar.open('Translation key deleted successfully', 'Close', { duration: 3000 });
          this.loadTranslations();
        })
        .catch(err => {
          console.error('Error deleting translation key:', err);
          this.snackBar.open('Error deleting translation key', 'Close', { duration: 3000 });
        });
    }
  }

  refreshData(): void {
    this.loadTranslations();
  }

  // Master-Detail Layout Methods
  onTableLanguageChange(): void {
    // Limit to 3 languages max
    if (this.selectedTableLanguages.length > 3) {
      this.selectedTableLanguages = this.selectedTableLanguages.slice(0, 3);
      this.snackBar.open('Maximum 3 languages can be displayed in the table', 'Close', { duration: 3000 });
    }
    this.displayTableLanguages = [...this.selectedTableLanguages];
  }

  selectTranslationKey(translationKey: TranslationKey): void {
    // Check for unsaved changes
    if (this.hasUnsavedChanges) {
      const confirmSwitch = confirm('You have unsaved changes. Do you want to continue without saving?');
      if (!confirmSwitch) return;
    }

    this.selectedTranslationKey = { ...translationKey };
    this.originalSelectedKeyValues = { ...translationKey.values };
    this.hasUnsavedChanges = false;
  }

  clearSelection(): void {
    if (this.hasUnsavedChanges) {
      const confirmClose = confirm('You have unsaved changes. Do you want to continue without saving?');
      if (!confirmClose) return;
    }

    this.selectedTranslationKey = null;
    this.hasUnsavedChanges = false;
    this.originalSelectedKeyValues = {};
  }

  markAsChanged(): void {
    this.hasUnsavedChanges = true;
  }

  saveSelectedKeyTranslations(): void {
    if (!this.selectedTranslationKey) return;

    this.isSaving = true;
    const key = this.selectedTranslationKey.key;

    // Prepare updates for each language
    const updatePromises = this.translationFiles.map(file => {
      const newValue = this.selectedTranslationKey!.values[file.language] || '';
      const originalValue = this.originalSelectedKeyValues[file.language] || '';

      // Only update if value changed
      if (newValue !== originalValue) {
        const baseUrl = this.configService.getBaseUrl();
        const updateData = {
          add_or_update: newValue ? { [key]: newValue } : {},
          delete: !newValue && originalValue ? [key] : []
        };

        // Only make API call if there's something to update
        if (Object.keys(updateData.add_or_update).length > 0 || updateData.delete.length > 0) {
          return this.http.patch(`${baseUrl}/version/translations/${file.language}/`, updateData).toPromise();
        }
      }

      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        this.snackBar.open('Translations saved successfully', 'Close', { duration: 3000 });
        this.hasUnsavedChanges = false;
        this.originalSelectedKeyValues = { ...this.selectedTranslationKey!.values };

        // Update the main translations list
        const mainKeyIndex = this.translationKeys.findIndex(tk => tk.key === key);
        if (mainKeyIndex >= 0) {
          this.translationKeys[mainKeyIndex].values = { ...this.selectedTranslationKey!.values };
        }

        this.filterTranslations(); // Refresh filtered list
        this.isSaving = false;
      })
      .catch(err => {
        console.error('Error saving translations:', err);
        this.snackBar.open('Error saving translations', 'Close', { duration: 3000 });
        this.isSaving = false;
      });
  }

  resetSelectedKey(): void {
    if (this.selectedTranslationKey) {
      this.selectedTranslationKey.values = { ...this.originalSelectedKeyValues };
      this.hasUnsavedChanges = false;
    }
  }

  getPreviewText(value: string): string {
    if (!value || !value.trim()) return '—';
    return value.length > 30 ? value.substring(0, 27) + '...' : value;
  }

  getKeyCompletionStatus(translationKey: TranslationKey): { icon: string; class: string; text: string } {
    const totalLanguages = this.translationFiles.length;
    const completedLanguages = Object.values(translationKey.values).filter(v => v && v.trim()).length;

    if (completedLanguages === 0) {
      return { icon: 'radio_button_unchecked', class: 'status-empty', text: 'Empty' };
    } else if (completedLanguages === totalLanguages) {
      return { icon: 'check_circle', class: 'status-complete', text: 'Complete' };
    } else {
      return { icon: 'schedule', class: 'status-partial', text: `${completedLanguages}/${totalLanguages}` };
    }
  }

  trackByLanguage(index: number, file: TranslationFile): string {
    return file.language;
  }

  // Utility methods
  getLanguageName(code: string): string {
    const fromAvailable = this.availableLanguages.find(lang => lang.code === code);
    if (fromAvailable) return fromAvailable.name;

    return this.languageInfo[code]?.name || code.toUpperCase();
  }

  getLanguageFlag(code: string): string {
    const fromAvailable = this.availableLanguages.find(lang => lang.code === code);
    if (fromAvailable?.flag) return fromAvailable.flag;

    return this.languageInfo[code]?.flag || '🌐';
  }

  getTotalKeys(): number {
    return this.translationKeys.length;
  }

  getTranslationCoverage(): number {
    if (this.translationKeys.length === 0 || this.translationFiles.length === 0) return 0;

    const totalPossibleTranslations = this.translationKeys.length * this.translationFiles.length;
    const actualTranslations = this.translationKeys.reduce((count, tk) => {
      return count + Object.values(tk.values).filter(value => value.trim().length > 0).length;
    }, 0);

    return Math.round((actualTranslations / totalPossibleTranslations) * 100);
  }

  // Enhanced to show current user's language version
  getCurrentUserLanguageVersion(): string {
    if (!this.userPreferences) return 'N/A';

    const userLangFile = this.translationFiles.find(f => f.language === this.userPreferences!.lang);
    return userLangFile?.version || 'N/A';
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  // Placeholder methods for features
  viewVersionHistory(file: TranslationFile): void {
    this.snackBar.open(`Version history for ${file.languageName}`, 'Close', { duration: 2000 });
  }

  exportLanguage(file: TranslationFile): void {
    const dataStr = JSON.stringify(file.translations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.language}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportSelected(): void {
    this.snackBar.open('Export selected languages', 'Close', { duration: 2000 });
  }

  exportAll(): void {
    this.snackBar.open('Export all languages', 'Close', { duration: 2000 });
  }

  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  importFiles(): void {
    this.snackBar.open('Import translation files', 'Close', { duration: 2000 });
  }

  openBulkEditDialog(): void {
    this.snackBar.open('Bulk edit translations', 'Close', { duration: 2000 });
  }
}
