// components/settings/translation-management/translation-management.component.ts
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

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
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
            <h3>{{ getLatestVersion() }}</h3>
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
                <mat-card *ngFor="let file of translationFiles" class="language-card">
                  <mat-card-header>
                    <div class="language-header">
                      <div class="language-flag">{{ getLanguageFlag(file.language) }}</div>
                      <div class="language-info">
                        <h3>{{ getLanguageName(file.language) }}</h3>
                        <p>{{ file.language.toUpperCase() }} • {{ file.keyCount }} keys</p>
                      </div>
                      <div class="language-actions">
                        <button mat-icon-button (click)="editTranslations(file)" matTooltip="Edit Translations">
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

          <!-- Translation Keys Tab -->
          <mat-tab label="Translation Keys">
            <div class="tab-content">
              <!-- Search and Filter -->
              <div class="search-section">
                <mat-form-field appearance="outline" class="search-field">
                  <mat-label>Search translations</mat-label>
                  <input matInput [(ngModel)]="searchQuery" (input)="filterTranslations()" placeholder="Search by key or value">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="openBulkEditDialog()">
                  <mat-icon>edit_note</mat-icon>
                  Bulk Edit
                </button>
              </div>

              <!-- Translation Keys Table -->
              <div class="translations-table-container">
                <table class="translations-table">
                  <thead>
                    <tr>
                      <th>Translation Key</th>
                      <th *ngFor="let file of translationFiles">{{ file.language.toUpperCase() }}</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let translationKey of filteredTranslationKeys" class="translation-row">
                      <td class="key-cell">
                        <span class="translation-key">{{ translationKey.key }}</span>
                        <mat-chip-set *ngIf="translationKey.isNew || translationKey.isModified">
                          <mat-chip class="new-chip" *ngIf="translationKey.isNew">NEW</mat-chip>
                          <mat-chip class="modified-chip" *ngIf="translationKey.isModified">MODIFIED</mat-chip>
                        </mat-chip-set>
                      </td>
                      <td *ngFor="let file of translationFiles" class="value-cell">
                        <div class="translation-value" [class.missing]="!translationKey.values[file.language]">
                          {{ translationKey.values[file.language] || '—' }}
                        </div>
                      </td>
                      <td class="actions-cell">
                        <button mat-icon-button (click)="editTranslationKey(translationKey)" matTooltip="Edit">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button mat-icon-button (click)="deleteTranslationKey(translationKey)" matTooltip="Delete">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Empty Search Results -->
                <div class="empty-search" *ngIf="filteredTranslationKeys.length === 0 && searchQuery">
                  <mat-icon>search_off</mat-icon>
                  <h3>No translations found</h3>
                  <p>Try adjusting your search criteria</p>
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

    <!-- Add Language Dialog -->
    <ng-template #addLanguageDialog>
      <div mat-dialog-title>Add New Language</div>
      <mat-dialog-content>
        <form [formGroup]="languageForm" class="language-form">
          <mat-form-field appearance="outline">
            <mat-label>Language Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g., en, ar, de" maxlength="10">
            <mat-error *ngIf="languageForm.get('code')?.hasError('required')">
              Language code is required
            </mat-error>
            <mat-error *ngIf="languageForm.get('code')?.hasError('pattern')">
              Invalid language code format
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Language Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., English, العربية">
          </mat-form-field>

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

    <!-- Add/Edit Translation Key Dialog -->
    <ng-template #editKeyDialog>
      <div mat-dialog-title>{{ editingKey ? 'Edit' : 'Add' }} Translation Key</div>
      <mat-dialog-content>
        <form [formGroup]="keyForm" class="key-form">
          <mat-form-field appearance="outline">
            <mat-label>Translation Key</mat-label>
            <input matInput formControlName="key" placeholder="e.g., login_button, welcome_message" [readonly]="!!editingKey">
            <mat-error *ngIf="keyForm.get('key')?.hasError('required')">
              Translation key is required
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

    .languages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .language-card {
      border-radius: 12px;
      transition: all 0.3s ease;

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

    .translations-table {
      width: 100%;
      border-collapse: collapse;
    }

    .translations-table th {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 2px solid #e2e8f0;
      font-size: 0.9rem;
    }

    .translations-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }

    .translation-row:hover {
      background: rgba(102, 126, 234, 0.04);
    }

    .key-cell {
      font-weight: 500;
      color: #334155;
      max-width: 200px;
    }

    .translation-key {
      font-family: monospace;
      font-size: 0.9rem;
      display: block;
      margin-bottom: 4px;
    }

    .value-cell {
      max-width: 150px;
      font-size: 0.9rem;
    }

    .translation-value {
      word-break: break-word;
      line-height: 1.4;

      &.missing {
        color: #94a3b8;
        font-style: italic;
      }
    }

    .actions-cell {
      width: 100px;
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

    .language-form,
    .key-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
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

      .translations-table {
        min-width: 600px;
      }
    }
  `]
})
export class TranslationManagementComponent implements OnInit {
  @ViewChild('addLanguageDialog') addLanguageDialog!: TemplateRef<any>;
  @ViewChild('editKeyDialog') editKeyDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  searchQuery = '';

  translationFiles: TranslationFile[] = [];
  translationKeys: TranslationKey[] = [];
  filteredTranslationKeys: TranslationKey[] = [];
  selectedLanguagesForExport: string[] = [];
  selectedFiles: File[] = [];

  languageForm: FormGroup;
  keyForm: FormGroup;
  editingKey: TranslationKey | null = null;

  // Predefined language information
  private languageInfo: { [code: string]: LanguageInfo } = {
    'en': { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
    'ar': { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    'de': { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
    'fr': { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
    'es': { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
    'it': { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
    'pt': { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
    'ru': { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
    'zh': { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRTL: false },
    'ja': { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false }
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.languageForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[a-z]{2,5}$/)]],
      name: ['']
    });

    this.keyForm = this.fb.group({
      key: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTranslations();
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

  addLanguage(): void {
    if (!this.languageForm.valid) return;

    this.isSaving = true;
    const baseUrl = this.configService.getBaseUrl();
    const languageData = this.languageForm.value;

    this.http.post(`${baseUrl}/version/translation/languages/`, { code: languageData.code })
      .subscribe({
        next: () => {
          this.snackBar.open('Language added successfully', 'Close', { duration: 3000 });
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
    const key = formValue.key;

    // Prepare updates for each language
    const updatePromises = this.translationFiles.map(file => {
      const translationValue = formValue[`translation_${file.language}`];
      if (!translationValue) return Promise.resolve();

      const baseUrl = this.configService.getBaseUrl();
      const updateData = {
        add_or_update: { [key]: translationValue },
        delete: []
      };

      return this.http.patch(`${baseUrl}/version/translations/${file.language}/`, updateData).toPromise();
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

  // Utility methods
  getLanguageName(code: string): string {
    return this.languageInfo[code]?.name || code.toUpperCase();
  }

  getLanguageFlag(code: string): string {
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

  getLatestVersion(): string {
    const versions = this.translationFiles.map(f => f.version).filter(v => v !== 'N/A');
    return versions.length > 0 ? Math.max(...versions.map(v => parseInt(v) || 0)).toString() : 'N/A';
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  // Placeholder methods for features
  editTranslations(file: TranslationFile): void {
    this.snackBar.open(`Edit translations for ${file.languageName}`, 'Close', { duration: 2000 });
  }

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
