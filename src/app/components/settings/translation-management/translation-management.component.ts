// components/settings/translation-management/translation-management.component.ts - ENHANCED THEME
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
      <!-- Enhanced Header with Ocean Mint Theme -->
      <div class="page-header">
        <div class="header-gradient-bg"></div>
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Translation Management</h1>
            <p class="page-subtitle">Manage multilingual content and localization</p>
          </div>
          <div class="header-actions">
            <button mat-button class="action-button secondary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              <span>Refresh</span>
            </button>
            <button mat-button class="action-button secondary" (click)="openAddLanguageDialog()">
              <mat-icon>language</mat-icon>
              <span>Add Language</span>
            </button>
            <button mat-raised-button class="action-button primary" (click)="openAddKeyDialog()">
              <mat-icon>add</mat-icon>
              <span>Add Translation Key</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Stats Cards with Ocean Mint Theme -->
      <div class="stats-section">
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon languages-icon">
              <mat-icon>language</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ translationFiles.length }}</h3>
            <p class="stat-label">Languages</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon keys-icon">
              <mat-icon>translate</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ getTotalKeys() }}</h3>
            <p class="stat-label">Translation Keys</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon coverage-icon">
              <mat-icon>check_circle</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ getTranslationCoverage() }}%</h3>
            <p class="stat-label">Coverage</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon version-icon">
              <mat-icon>history</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ getCurrentUserLanguageVersion() }}</h3>
            <p class="stat-label">Latest Version</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="loading-text">Loading translation data...</p>
        </div>
      </div>

      <!-- Enhanced Translation Management Tabs -->
      <div class="translation-content professional-card" *ngIf="!isLoading">
        <mat-tab-group class="translation-tabs" animationDuration="300ms">
          <!-- Languages Overview Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">language</mat-icon>
              <span class="tab-label">Languages</span>
            </ng-template>

            <div class="tab-content">
              <div class="languages-grid">
                <mat-card *ngFor="let file of translationFiles"
                          class="language-card glass-card"
                          (click)="editLanguageTranslations(file)">
                  <mat-card-header>
                    <div class="language-header">
                      <div class="language-flag-wrapper">
                        <span class="language-flag">{{ getLanguageFlag(file.language) }}</span>
                      </div>
                      <div class="language-info">
                        <h3 class="language-name">{{ getLanguageName(file.language) }}</h3>
                        <p class="language-code">{{ file.language.toUpperCase() }} • {{ file.keyCount }} keys</p>
                      </div>
                      <div class="language-actions" (click)="$event.stopPropagation()">
                        <button mat-icon-button class="icon-button" (click)="editLanguageTranslations(file)" matTooltip="Edit Translations">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button class="icon-button" (click)="viewVersionHistory(file)" matTooltip="Version History">
                          <mat-icon>history</mat-icon>
                        </button>
                        <button mat-icon-button class="icon-button" (click)="exportLanguage(file)" matTooltip="Export">
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
                        <span class="stat-value status-badge" [class]="file.isActive ? 'status-active' : 'status-inactive'">
                          {{ file.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                  <div class="card-hover-effect"></div>
                </mat-card>
              </div>

              <!-- Empty State -->
              <div class="empty-state" *ngIf="translationFiles.length === 0">
                <div class="empty-icon">
                  <mat-icon>language</mat-icon>
                </div>
                <h3 class="empty-title">No languages found</h3>
                <p class="empty-subtitle">Start by adding your first language</p>
                <button mat-raised-button class="action-button primary" (click)="openAddLanguageDialog()">
                  <mat-icon>add</mat-icon>
                  <span>Add Language</span>
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- Enhanced Translation Keys Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">translate</mat-icon>
              <span class="tab-label">Translation Keys</span>
            </ng-template>

            <div class="tab-content master-detail-layout">
              <!-- Header Controls -->
              <div class="controls-section professional-card">
                <div class="search-section">
                  <mat-form-field appearance="outline" class="search-field ocean-mint-field">
                    <mat-label>Search translations</mat-label>
                    <input matInput [(ngModel)]="searchQuery" (input)="filterTranslations()" placeholder="Search by key or value">
                    <mat-icon matSuffix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="language-selector ocean-mint-field">
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
                  <button mat-button class="action-button secondary" (click)="openAddKeyDialog()">
                    <mat-icon>add</mat-icon>
                    <span>Add Key</span>
                  </button>
                  <button mat-button class="action-button secondary" (click)="openBulkEditDialog()">
                    <mat-icon>edit_note</mat-icon>
                    <span>Bulk Edit</span>
                  </button>
                </div>
              </div>

              <!-- Master-Detail Container -->
              <div class="master-detail-container">
                <!-- LEFT: Translation Keys List (Master) -->
                <div class="master-panel professional-card">
                  <div class="panel-header">
                    <h3 class="panel-title">Translation Keys</h3>
                    <span class="panel-count">{{ filteredTranslationKeys.length }} items</span>
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
                            <div class="key-badges" *ngIf="translationKey.isNew || translationKey.isModified">
                              <span class="badge new" *ngIf="translationKey.isNew">NEW</span>
                              <span class="badge modified" *ngIf="translationKey.isModified">MODIFIED</span>
                            </div>
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
                    <div class="table-empty-state" *ngIf="filteredTranslationKeys.length === 0">
                      <mat-icon>{{ searchQuery ? 'search_off' : 'translate' }}</mat-icon>
                      <h3>{{ searchQuery ? 'No translations found' : 'No translation keys' }}</h3>
                      <p>{{ searchQuery ? 'Try adjusting your search criteria' : 'Add your first translation key to get started' }}</p>
                      <button mat-raised-button class="action-button primary" (click)="openAddKeyDialog()" *ngIf="!searchQuery">
                        <mat-icon>add</mat-icon>
                        <span>Add Translation Key</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- RIGHT: Selected Key Details (Detail) -->
                <div class="detail-panel professional-card" [class.show]="selectedTranslationKey">
                  <div class="panel-header" *ngIf="selectedTranslationKey">
                    <div class="selected-key-info">
                      <h3 class="panel-title">{{ selectedTranslationKey.key }}</h3>
                      <span class="panel-subtitle">Edit translations for all languages</span>
                    </div>
                    <div class="detail-actions">
                      <button mat-icon-button class="icon-button" (click)="editTranslationKey(selectedTranslationKey)" matTooltip="Edit Key Name">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button class="icon-button delete" (click)="deleteTranslationKey(selectedTranslationKey)" matTooltip="Delete Key">
                        <mat-icon>delete</mat-icon>
                      </button>
                      <button mat-icon-button class="icon-button" (click)="clearSelection()" matTooltip="Close">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>

                  <div class="translations-detail" *ngIf="selectedTranslationKey">
                    <div class="quick-save-notice" *ngIf="hasUnsavedChanges">
                      <mat-icon>info</mat-icon>
                      <span>You have unsaved changes</span>
                      <button mat-button class="save-button" (click)="saveSelectedKeyTranslations()">
                        <mat-icon>save</mat-icon>
                        Save Changes
                      </button>
                    </div>

                    <div class="languages-list">
                      <div *ngFor="let file of translationFiles; trackBy: trackByLanguage"
                           class="language-translation-item">
                        <div class="language-header">
                          <div class="language-info">
                            <span class="language-flag">{{ getLanguageFlag(file.language) }}</span>
                            <div class="language-details">
                              <span class="language-name">{{ getLanguageName(file.language) }}</span>
                              <span class="language-code">{{ file.language.toUpperCase() }}</span>
                            </div>
                          </div>
                          <div class="translation-status">
                            <mat-icon *ngIf="selectedTranslationKey.values[file.language]?.trim()"
                                      class="status-icon complete">check_circle</mat-icon>
                            <mat-icon *ngIf="!selectedTranslationKey.values[file.language]?.trim()"
                                      class="status-icon missing">radio_button_unchecked</mat-icon>
                          </div>
                        </div>

                        <mat-form-field appearance="outline" class="translation-field ocean-mint-field">
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
                      <button mat-raised-button class="action-button primary"
                              (click)="saveSelectedKeyTranslations()"
                              [disabled]="isSaving">
                        <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                        <mat-icon *ngIf="!isSaving">save</mat-icon>
                        <span>Save All Translations</span>
                      </button>
                      <button mat-button class="action-button secondary" (click)="resetSelectedKey()">
                        <mat-icon>refresh</mat-icon>
                        <span>Reset Changes</span>
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
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">import_export</mat-icon>
              <span class="tab-label">Import/Export</span>
            </ng-template>

            <div class="tab-content">
              <div class="import-export-section">
                <mat-card class="action-card professional-card">
                  <mat-card-header>
                    <mat-card-title class="card-title">Export Translations</mat-card-title>
                    <mat-card-subtitle class="card-subtitle">Download translation files</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="card-description">Export all or selected languages as JSON files</p>
                    <div class="export-options">
                      <mat-form-field appearance="outline" class="ocean-mint-field">
                        <mat-label>Select Languages</mat-label>
                        <mat-select multiple [(value)]="selectedLanguagesForExport">
                          <mat-option *ngFor="let file of translationFiles" [value]="file.language">
                            {{ getLanguageName(file.language) }} ({{ file.language.toUpperCase() }})
                          </mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                  <mat-card-actions class="card-actions">
                    <button mat-raised-button class="action-button primary" (click)="exportSelected()">
                      <mat-icon>download</mat-icon>
                      <span>Export Selected</span>
                    </button>
                    <button mat-button class="action-button secondary" (click)="exportAll()">
                      <mat-icon>file_download</mat-icon>
                      <span>Export All</span>
                    </button>
                  </mat-card-actions>
                </mat-card>

                <mat-card class="action-card professional-card">
                  <mat-card-header>
                    <mat-card-title class="card-title">Import Translations</mat-card-title>
                    <mat-card-subtitle class="card-subtitle">Upload translation files</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="card-description">Import JSON translation files to update or add new translations</p>
                    <div class="import-options">
                      <input type="file" #fileInput (change)="onFileSelected($event)" accept=".json" multiple style="display: none;">
                      <button mat-stroked-button class="upload-button" (click)="fileInput.click()">
                        <mat-icon>upload_file</mat-icon>
                        <span>Select Files</span>
                      </button>
                      <span *ngIf="selectedFiles.length > 0" class="file-count">
                        {{ selectedFiles.length }} file(s) selected
                      </span>
                    </div>
                  </mat-card-content>
                  <mat-card-actions class="card-actions">
                    <button mat-raised-button class="action-button accent"
                            (click)="importFiles()"
                            [disabled]="selectedFiles.length === 0">
                      <mat-icon>upload</mat-icon>
                      <span>Import Files</span>
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Enhanced Add Language Dialog -->
    <ng-template #addLanguageDialog>
      <div class="dialog-header" mat-dialog-title>
        <mat-icon class="dialog-icon">language</mat-icon>
        <span>Add New Language</span>
      </div>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="languageForm" class="language-form">
          <mat-form-field appearance="outline" class="ocean-mint-field">
            <mat-label>Select Language</mat-label>
            <mat-select formControlName="selectedLanguage" (selectionChange)="onLanguageSelection()">
              <mat-option *ngFor="let lang of availableLanguages" [value]="lang">
                <div class="language-option">
                  <span class="language-flag">{{ lang.flag || '🌐' }}</span>
                  <div class="language-details">
                    <span class="language-name">{{ lang.name }}</span>
                    <span class="language-code">({{ lang.code }})</span>
                  </div>
                </div>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="languageForm.get('selectedLanguage')?.hasError('required')">
              Please select a language
            </mat-error>
          </mat-form-field>

          <div *ngIf="languageForm.get('selectedLanguage')?.value" class="selected-language-info info-card">
            <mat-icon>info</mat-icon>
            <span>Selected: {{ languageForm.get('selectedLanguage')?.value?.name }} ({{ languageForm.get('selectedLanguage')?.value?.code }})</span>
          </div>

          <div class="info-text">
            <mat-icon>info</mat-icon>
            <span>A new translation file will be created with an empty set of translations.</span>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions" align="end">
        <button mat-button class="dialog-button cancel" mat-dialog-close>Cancel</button>
        <button mat-raised-button class="dialog-button primary"
                (click)="addLanguage()"
                [disabled]="!languageForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">Add Language</span>
        </button>
      </mat-dialog-actions>
    </ng-template>

    <!-- Enhanced Add/Edit Translation Key Dialog -->
    <ng-template #editKeyDialog>
      <div class="dialog-header" mat-dialog-title>
        <mat-icon class="dialog-icon">{{ editingKey ? 'edit' : 'add' }}</mat-icon>
        <span>{{ editingKey ? 'Edit' : 'Add' }} Translation Key</span>
      </div>
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="keyForm" class="key-form">
          <mat-form-field appearance="outline" class="ocean-mint-field">
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
            <h4 class="section-title">Translations</h4>
            <div *ngFor="let file of translationFiles" class="translation-input">
              <mat-form-field appearance="outline" class="ocean-mint-field">
                <mat-label>{{ getLanguageName(file.language) }} ({{ file.language.toUpperCase() }})</mat-label>
                <textarea matInput [formControlName]="'translation_' + file.language"
                          rows="2" placeholder="Enter translation"></textarea>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions" align="end">
        <button mat-button class="dialog-button cancel" mat-dialog-close>Cancel</button>
        <button mat-raised-button class="dialog-button primary"
                (click)="saveTranslationKey()"
                [disabled]="!keyForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingKey ? 'Update' : 'Add' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>

    <!-- Enhanced Edit Language Translations Dialog -->
    <ng-template #editLanguageDialog>
      <div class="dialog-header" mat-dialog-title>
        <mat-icon class="dialog-icon">edit</mat-icon>
        <span>Edit {{ selectedLanguageForEdit?.languageName }} Translations</span>
      </div>
      <mat-dialog-content class="dialog-content">
        <div class="language-edit-content">
          <div class="search-box">
            <mat-form-field appearance="outline" class="search-field ocean-mint-field">
              <mat-label>Search keys</mat-label>
              <input matInput [(ngModel)]="languageEditSearchQuery" (input)="filterLanguageKeys()"
                     placeholder="Search translation keys">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="language-translations-list">
            <div *ngFor="let key of filteredLanguageKeys" class="key-edit-item">
              <div class="key-info">
                <span class="key-name">{{ key }}</span>
              </div>
              <mat-form-field appearance="outline" class="translation-field ocean-mint-field">
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
      <mat-dialog-actions class="dialog-actions" align="end">
        <button mat-button class="dialog-button cancel" mat-dialog-close>Cancel</button>
        <button mat-raised-button class="dialog-button primary"
                (click)="saveLanguageTranslations()"
                [disabled]="isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">Save Translations</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    /* Enhanced Translation Management Styles with Ocean Mint Theme */
    .translation-management {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
    }

    /* Enhanced Page Header */
    .page-header {
      position: relative;
      margin-bottom: 32px;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(47, 72, 88, 0.08);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .header-gradient-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(135deg, #C4F7EF 0%, #B3F0E5 100%);
      opacity: 0.4;
    }

    .header-content {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 32px;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0 0 8px 0;
      font-family: 'Poppins', sans-serif;
    }

    .page-subtitle {
      color: #64748B;
      margin: 0;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Enhanced Action Buttons */
    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.primary {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.25);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 197, 170, 0.35);
        }
      }

      &.secondary {
        background: white;
        color: #34C5AA;
        border: 2px solid #C4F7EF;

        &:hover {
          background: rgba(196, 247, 239, 0.3);
          border-color: #34C5AA;
          transform: translateY(-1px);
        }
      }

      &.accent {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
        }
      }
    }

    /* Enhanced Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 28px;
      background: white;
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(47, 72, 88, 0.12);

        .stat-icon {
          transform: scale(1.1);
        }
      }
    }

    .stat-icon-wrapper {
      flex-shrink: 0;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: transform 0.3s ease;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &.languages-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
      }
      &.keys-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        box-shadow: 0 4px 12px rgba(79, 172, 254, 0.25);
      }
      &.coverage-icon {
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        box-shadow: 0 4px 12px rgba(74, 222, 128, 0.25);
      }
      &.version-icon {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        box-shadow: 0 4px 12px rgba(250, 112, 154, 0.25);
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      font-family: 'Poppins', sans-serif;
    }

    .stat-label {
      color: #64748B;
      margin: 4px 0 0 0;
      font-size: 0.95rem;
      font-weight: 500;
    }

    /* Professional Cards */
    .professional-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(47, 72, 88, 0.08);
      border: 1px solid rgba(196, 247, 239, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(196, 247, 239, 0.6);
      box-shadow: 0 4px 12px rgba(47, 72, 88, 0.06);
    }

    /* Loading State */
    .loading-section {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-content {
      text-align: center;

      .loading-text {
        margin-top: 24px;
        color: #64748B;
        font-size: 1.1rem;
      }
    }

    /* Enhanced Translation Tabs */
    .translation-content {
      min-height: 600px;
    }

    .translation-tabs {
      background: transparent;

      ::ng-deep {
        .mat-mdc-tab-list {
          background: rgba(196, 247, 239, 0.2);
          border-radius: 16px 16px 0 0;
          padding: 8px;
        }

        .mat-mdc-tab {
          min-width: 140px;
          border-radius: 12px;
          margin-right: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(196, 247, 239, 0.3);
          }

          &.mat-mdc-tab-active {
            background: white;
            box-shadow: 0 2px 8px rgba(47, 72, 88, 0.08);
          }
        }

        .mat-mdc-tab-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2F4858;
        }
      }
    }

    .tab-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .tab-label {
      font-size: 14px;
    }

    .tab-content {
      padding: 32px;
      animation: fadeInUp 0.3s ease;
    }

    /* Languages Grid */
    .languages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    .language-card {
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(47, 72, 88, 0.12);
        border-color: #34C5AA;

        .card-hover-effect {
          opacity: 1;
        }

        .language-flag-wrapper {
          transform: scale(1.1);
        }
      }

      .card-hover-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(196, 247, 239, 0.1) 0%, rgba(196, 247, 239, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
    }

    .language-header {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: 8px;
    }

    .language-flag-wrapper {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(196, 247, 239, 0.3) 0%, rgba(196, 247, 239, 0.1) 100%);
      border-radius: 16px;
      transition: transform 0.3s ease;
    }

    .language-flag {
      font-size: 2rem;
    }

    .language-info {
      flex: 1;
    }

    .language-name {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2F4858;
    }

    .language-code {
      margin: 0;
      color: #64748B;
      font-size: 0.9rem;
    }

    .language-actions {
      display: flex;
      gap: 4px;
    }

    .icon-button {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      transition: all 0.2s ease;
      color: #64748B;

      &:hover {
        background: rgba(196, 247, 239, 0.5);
        color: #34C5AA;
        transform: translateY(-1px);
      }

      &.delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .language-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(196, 247, 239, 0.5);
    }

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 0.8rem;
        color: #64748B;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-value {
        font-weight: 600;
        color: #2F4858;
        font-size: 0.95rem;
      }
    }

    /* Status Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.status-active {
        background: rgba(34, 197, 94, 0.12);
        color: #16A34A;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }

      &.status-inactive {
        background: rgba(107, 114, 128, 0.08);
        color: #6B7280;
        border: 1px solid rgba(107, 114, 128, 0.15);
      }
    }

    /* Master-Detail Layout */
    .master-detail-layout {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .controls-section {
      padding: 24px;
      background: white;
      border-radius: 16px;
      border: 1px solid rgba(196, 247, 239, 0.3);
    }

    .search-section {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .search-field {
      flex: 1;
      max-width: 500px;
    }

    .language-selector {
      min-width: 320px;
    }

    /* Ocean Mint Form Fields */
    .ocean-mint-field {
      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: rgba(196, 247, 239, 0.1);
          border-radius: 12px;
        }

        .mat-mdc-form-field-focus-overlay {
          background: transparent;
        }

        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            background: white;
            box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
          }
        }
      }
    }

    .language-option-compact {
      display: flex;
      align-items: center;
      gap: 8px;

      .flag {
        font-size: 1.2rem;
      }

      .lang-name {
        font-weight: 500;
        color: #2F4858;
      }

      .lang-code {
        color: #64748B;
        font-size: 0.85rem;
      }
    }

    .action-buttons-header {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .master-detail-container {
      display: flex;
      gap: 24px;
      min-height: 600px;
    }

    /* Master Panel */
    .master-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(196, 247, 239, 0.5);
      background: linear-gradient(135deg, rgba(196, 247, 239, 0.2) 0%, rgba(196, 247, 239, 0.05) 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2F4858;
    }

    .panel-subtitle {
      color: #64748B;
      font-size: 0.9rem;
    }

    .panel-count {
      color: #64748B;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .keys-table-container {
      flex: 1;
      overflow-y: auto;
      background: white;
    }

    .keys-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.95rem;

      th {
        background: rgba(196, 247, 239, 0.15);
        padding: 16px 12px;
        text-align: left;
        font-weight: 600;
        color: #2F4858;
        border-bottom: 2px solid rgba(196, 247, 239, 0.5);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      td {
        padding: 12px;
        border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        vertical-align: middle;
      }
    }

    .key-row {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(196, 247, 239, 0.1);
      }

      &.selected {
        background: rgba(52, 197, 170, 0.08);
        border-left: 4px solid #34C5AA;
      }
    }

    .key-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .translation-key {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.9rem;
      color: #667eea;
      font-weight: 500;
    }

    .key-badges {
      display: flex;
      gap: 4px;
    }

    .badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.new {
        background: rgba(34, 197, 94, 0.15);
        color: #16A34A;
      }

      &.modified {
        background: rgba(59, 130, 246, 0.15);
        color: #2563eb;
      }
    }

    .translation-preview {
      font-size: 0.9rem;

      &.missing .preview-text {
        color: #94A3B8;
        font-style: italic;
      }
    }

    .preview-text {
      color: #2F4858;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .completion-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
    }

    .status-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;

      &.status-complete { color: #22C55E; }
      &.status-partial { color: #F59E0B; }
      &.status-empty { color: #94A3B8; }
    }

    .completion-text {
      font-size: 0.8rem;
      font-weight: 500;
      color: #64748B;
    }

    /* Detail Panel */
    .detail-panel {
      width: 420px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      opacity: 0.7;

      &.show {
        opacity: 1;
      }
    }

    .selected-key-info {
      flex: 1;
    }

    .detail-actions {
      display: flex;
      gap: 8px;
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
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
      border-bottom: 1px solid rgba(102, 126, 234, 0.2);
      color: #667eea;
      font-size: 0.9rem;
      font-weight: 500;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .save-button {
        margin-left: auto;
        background: #667eea;
        color: white;
        border-radius: 8px;
        padding: 6px 16px;
        font-size: 0.85rem;

        &:hover {
          background: #5a67d8;
        }
      }
    }

    .languages-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .language-translation-item {
      margin-bottom: 24px;
      padding: 20px;
      border: 1px solid rgba(196, 247, 239, 0.5);
      border-radius: 16px;
      background: rgba(196, 247, 239, 0.05);
      transition: all 0.2s ease;

      &:hover {
        border-color: #C4F7EF;
        background: rgba(196, 247, 239, 0.1);
      }
    }

    .language-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .language-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .language-flag {
        font-size: 1.5rem;
      }
    }

    .language-details {
      display: flex;
      flex-direction: column;
    }

    .language-name {
      font-weight: 600;
      color: #2F4858;
      font-size: 0.95rem;
    }

    .language-code {
      color: #64748B;
      font-size: 0.85rem;
    }

    .translation-status {
      .status-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;

        &.complete { color: #22C55E; }
        &.missing { color: #CBD5E1; }
      }
    }

    .translation-field {
      width: 100%;
    }

    .detail-footer {
      padding: 20px;
      border-top: 1px solid rgba(196, 247, 239, 0.5);
      background: rgba(196, 247, 239, 0.1);
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Empty States */
    .empty-state,
    .table-empty-state,
    .empty-detail {
      text-align: center;
      padding: 60px 20px;
      color: #64748B;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 20px;
        color: #CBD5E1;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0 0 8px 0;
        color: #2F4858;
        font-weight: 600;
      }

      p {
        margin: 0 0 24px 0;
        font-size: 1rem;
      }
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, rgba(196, 247, 239, 0.3) 0%, rgba(196, 247, 239, 0.1) 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        margin: 0;
      }
    }

    .empty-title {
      font-size: 1.5rem;
      margin: 0 0 8px 0;
      color: #2F4858;
      font-weight: 600;
    }

    .empty-subtitle {
      margin: 0 0 24px 0;
      color: #64748B;
      font-size: 1rem;
    }

    /* Import/Export Section */
    .import-export-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 24px;
    }

    .action-card {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(47, 72, 88, 0.1);
      }
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2F4858;
      margin-bottom: 4px;
    }

    .card-subtitle {
      color: #64748B;
      font-size: 0.95rem;
    }

    .card-description {
      color: #64748B;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .card-actions {
      padding: 16px 24px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .export-options,
    .import-options {
      margin: 20px 0;
    }

    .upload-button {
      border: 2px dashed #C4F7EF;
      background: rgba(196, 247, 239, 0.1);
      color: #34C5AA;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(196, 247, 239, 0.2);
        border-color: #34C5AA;
        transform: translateY(-1px);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    .file-count {
      margin-left: 16px;
      color: #64748B;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Enhanced Dialogs */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2F4858;
      margin-bottom: 8px;
    }

    .dialog-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #C4F7EF 0%, #B3F0E5 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34C5AA;
    }

    .dialog-content {
      padding: 20px 0;
      min-width: 500px;
    }

    .dialog-actions {
      padding: 16px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      background: rgba(196, 247, 239, 0.1);
      margin: 0 -24px -24px;
    }

    .dialog-button {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.3s ease;

      &.cancel {
        color: #64748B;

        &:hover {
          background: rgba(196, 247, 239, 0.2);
          color: #2F4858;
        }
      }

      &.primary {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 197, 170, 0.25);
        }

        &:disabled {
          opacity: 0.6;
          transform: none;
        }
      }
    }

    .language-form,
    .key-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .language-option {
      display: flex;
      align-items: center;
      gap: 12px;

      .language-flag {
        font-size: 1.5rem;
      }

      .language-details {
        display: flex;
        flex-direction: column;

        .language-name {
          font-weight: 500;
          color: #2F4858;
        }

        .language-code {
          font-size: 0.85rem;
          color: #64748B;
        }
      }
    }

    .selected-language-info,
    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: rgba(102, 126, 234, 0.08);
      border-radius: 12px;
      color: #667eea;
      font-weight: 500;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748B;
      font-size: 0.9rem;
      padding: 12px;
      background: rgba(196, 247, 239, 0.2);
      border-radius: 10px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #34C5AA;
      }
    }

    .translations-section {
      margin-top: 24px;

      .section-title {
        margin: 0 0 16px 0;
        color: #2F4858;
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .translation-input {
      margin-bottom: 16px;
    }

    /* Language Edit Dialog */
    .language-edit-content {
      max-height: 60vh;
      overflow-y: auto;
    }

    .search-box {
      margin-bottom: 20px;
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
      padding-bottom: 12px;
    }

    .language-translations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .key-edit-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border: 1px solid rgba(196, 247, 239, 0.5);
      border-radius: 12px;
      background: rgba(196, 247, 239, 0.05);
      transition: all 0.2s ease;

      &:hover {
        border-color: #C4F7EF;
        background: rgba(196, 247, 239, 0.1);
      }
    }

    .key-info {
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(196, 247, 239, 0.3);
    }

    .key-name {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.95rem;
      color: #667eea;
      font-weight: 500;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .master-detail-container {
        flex-direction: column;
      }

      .detail-panel {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .translation-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        padding: 24px 20px;
      }

      .page-title {
        font-size: 2rem;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .stat-card {
        padding: 20px;
      }

      .languages-grid {
        grid-template-columns: 1fr;
      }

      .search-section {
        flex-direction: column;
      }

      .language-selector {
        min-width: auto;
      }

      .import-export-section {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        min-width: auto;
      }
    }

    @media (max-width: 480px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .action-button {
        width: 100%;
        justify-content: center;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
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
