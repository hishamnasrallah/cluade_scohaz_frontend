// components/settings/lookups-management/lookups-management.component.ts - RESTRUCTURED
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

interface LookupItem {
  id?: number;
  parent_lookup?: number | null;
  type: number;
  name: string;
  name_ara?: string;
  code?: string;
  icon?: string | null;
  active_ind: boolean;
  children?: LookupItem[];
}

interface LookupTree extends LookupItem {
  children: LookupItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-lookups-management',
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
    MatRippleModule,
    MatChipsModule
  ],
  template: `
    <div class="lookups-management">
      <!-- Compact Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-icon">
              <mat-icon>list_alt</mat-icon>
            </div>
            <div>
              <h1>Lookups Management</h1>
              <p>Manage dropdown values and reference data</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-icon-button
                    (click)="refreshData()"
                    class="refresh-btn"
                    matTooltip="Refresh"
                    [disabled]="isLoading">
              <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
            </button>
            <button mat-raised-button
                    color="primary"
                    (click)="openCreateDialog()"
                    class="create-btn">
              <mat-icon>add</mat-icon>
              Add Lookup
            </button>
          </div>
        </div>
      </div>

      <!-- Compact Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon categories-icon">
            <mat-icon>folder</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ parentLookups.length }}</h3>
            <p>Categories</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon values-icon">
            <mat-icon>list</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getTotalValues() }}</h3>
            <p>Values</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveCount() }}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40" color="primary"></mat-spinner>
        <p>Loading lookups...</p>
      </div>

      <!-- Compact Lookup List -->
      <div class="lookups-container" *ngIf="!isLoading">
        <div class="lookups-list">
          <div *ngFor="let lookup of lookupTrees; let i = index"
               class="lookup-item"
               [class.expanded]="lookup.expanded">

            <!-- Parent Header -->
            <div class="lookup-header" (click)="toggleExpansion(lookup)">
              <div class="header-left">
                <div class="lookup-icon" [style.background]="getGradient(i)">
                  <mat-icon>{{ lookup.icon || 'folder' }}</mat-icon>
                </div>
                <div class="lookup-info">
                  <h3>{{ lookup.name }}</h3>
                  <span class="lookup-meta">
                    {{ lookup.name_ara || 'No Arabic' }} • {{ lookup.children.length }} items
                  </span>
                </div>
              </div>
              <div class="header-actions">
                <mat-icon class="expand-icon">
                  {{ lookup.expanded ? 'expand_less' : 'expand_more' }}
                </mat-icon>
                <button mat-icon-button
                        (click)="editLookup(lookup, $event)"
                        class="action-btn"
                        matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        (click)="addChildLookup(lookup, $event)"
                        class="action-btn"
                        matTooltip="Add Item">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>

            <!-- Children List -->
            <div class="children-container" *ngIf="lookup.expanded">
              <div class="children-list">
                <div *ngFor="let child of lookup.children"
                     class="child-item">
                  <div class="child-left">
                    <mat-icon class="child-icon">{{ child.icon || 'label' }}</mat-icon>
                    <span class="child-name">{{ child.name }}</span>
                    <span class="child-code" *ngIf="child.code">[{{ child.code }}]</span>
                  </div>
                  <div class="child-right">
                    <mat-chip class="status-chip"
                              [class.active]="child.active_ind">
                      {{ child.active_ind ? 'Active' : 'Inactive' }}
                    </mat-chip>
                    <div class="child-actions">
                      <button mat-icon-button
                              (click)="editLookup(child)"
                              matTooltip="Edit"
                              class="mini-btn">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button
                              (click)="toggleStatus(child)"
                              [matTooltip]="child.active_ind ? 'Deactivate' : 'Activate'"
                              class="mini-btn">
                        <mat-icon>{{ child.active_ind ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                      </button>
                      <button mat-icon-button
                              (click)="deleteLookup(child)"
                              matTooltip="Delete"
                              class="mini-btn delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="empty-children" *ngIf="lookup.children.length === 0">
                  <button mat-button (click)="addChildLookup(lookup)">
                    <mat-icon>add</mat-icon>
                    Add First Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="lookupTrees.length === 0">
          <mat-icon>folder_open</mat-icon>
          <h3>No lookups found</h3>
          <p>Create your first category</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create Lookup
          </button>
        </div>
      </div>
    </div>

    <!-- Compact Dialog -->
    <ng-template #editDialog>
      <h2 mat-dialog-title>
        <mat-icon>{{ editingLookup?.id ? 'edit' : 'add' }}</mat-icon>
        {{ editingLookup?.id ? 'Edit' : 'Create' }} Lookup
      </h2>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="lookupForm" class="compact-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Name (English)</mat-label>
              <input matInput formControlName="name" required>
              <mat-icon matPrefix>label</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Name (Arabic)</mat-label>
              <input matInput formControlName="name_ara" dir="rtl">
              <mat-icon matPrefix>translate</mat-icon>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Code</mat-label>
              <input matInput formControlName="code">
              <mat-icon matPrefix>code</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Icon</mat-label>
              <input matInput formControlName="icon" placeholder="Icon name">
              <mat-icon matPrefix>palette</mat-icon>
              <mat-icon matSuffix *ngIf="lookupForm.get('icon')?.value">
                {{ lookupForm.get('icon')?.value }}
              </mat-icon>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option [value]="1">Category (Parent)</mat-option>
                <mat-option [value]="2">Value (Child)</mat-option>
              </mat-select>
              <mat-icon matPrefix>category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline"
                            *ngIf="lookupForm.get('type')?.value === 2">
              <mat-label>Parent Category</mat-label>
              <mat-select formControlName="parent_lookup">
                <mat-option *ngFor="let parent of parentLookups" [value]="parent.id">
                  {{ parent.name }}
                </mat-option>
              </mat-select>
              <mat-icon matPrefix>folder</mat-icon>
            </mat-form-field>
          </div>

          <mat-checkbox formControlName="active_ind" class="status-checkbox">
            <mat-icon>{{ lookupForm.get('active_ind')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
            Active Status
          </mat-checkbox>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveLookup()"
                [disabled]="!lookupForm.valid || isSaving">
          <mat-spinner diameter="16" *ngIf="isSaving"></mat-spinner>
          {{ editingLookup?.id ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .lookups-management {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
    }

    /* Compact Header */
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-text {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .header-text h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      line-height: 1.2;
    }

    .header-text p {
      color: #6B7280;
      margin: 0;
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .refresh-btn {
      color: #34C5AA;

      &:hover {
        background: rgba(196, 247, 239, 0.3);
      }
    }

    .create-btn {
      background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
      color: white;
      border: none;
      box-shadow: 0 2px 4px rgba(52, 197, 170, 0.2);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    /* Compact Stats */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      &.categories-icon { background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%); }
      &.values-icon { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
      &.active-icon { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .stat-content h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      line-height: 1;
    }

    .stat-content p {
      color: #6B7280;
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Loading */
    .loading-section {
      text-align: center;
      padding: 40px;

      p {
        margin-top: 12px;
        color: #6B7280;
      }
    }

    /* Compact Lookups Container */
    .lookups-container {
      background: white;
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 2px 4px rgba(47, 72, 88, 0.05);
      border: 1px solid rgba(196, 247, 239, 0.5);
      max-height: calc(100vh - 300px);
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #F3F4F6;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(52, 197, 170, 0.3);
        border-radius: 3px;

        &:hover {
          background: rgba(52, 197, 170, 0.5);
        }
      }
    }

    .lookups-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Compact Lookup Item */
    .lookup-item {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s ease;

      &.expanded {
        border-color: rgba(52, 197, 170, 0.3);
        box-shadow: 0 2px 4px rgba(52, 197, 170, 0.1);
      }
    }

    .lookup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      cursor: pointer;
      background: #FAFBFC;
      transition: background 0.2s ease;

      &:hover {
        background: #F3F4F6;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .lookup-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .lookup-info h3 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #2F4858;
    }

    .lookup-meta {
      font-size: 0.75rem;
      color: #6B7280;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .expand-icon {
      color: #6B7280;
      margin-right: 8px;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      color: #6B7280;

      &:hover {
        color: #34C5AA;
      }
    }

    /* Compact Children */
    .children-container {
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
    }

    .children-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .child-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: white;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      transition: all 0.2s ease;

      &:hover {
        border-color: rgba(52, 197, 170, 0.3);
        background: rgba(196, 247, 239, 0.1);
      }
    }

    .child-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .child-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #34C5AA;
    }

    .child-name {
      font-weight: 500;
      color: #2F4858;
      font-size: 0.875rem;
    }

    .child-code {
      font-size: 0.75rem;
      color: #6B7280;
      font-family: monospace;
    }

    .child-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-chip {
      height: 20px;
      font-size: 0.7rem;
      padding: 0 8px;
      background: rgba(107, 114, 128, 0.1);
      color: #6B7280;

      &.active {
        background: rgba(34, 197, 94, 0.1);
        color: #16A34A;
      }
    }

    .child-actions {
      display: flex;
      gap: 2px;
    }

    .mini-btn {
      width: 28px;
      height: 28px;
      color: #6B7280;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &:hover {
        color: #34C5AA;
      }

      &.delete:hover {
        color: #EF4444;
      }
    }

    .empty-children {
      text-align: center;
      padding: 12px;

      button {
        color: #34C5AA;
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #9CA3AF;
      }

      h3 {
        font-size: 1.25rem;
        margin: 12px 0 8px;
        color: #2F4858;
      }

      p {
        margin: 0 0 20px;
        color: #6B7280;
      }
    }

    /* Compact Dialog */
    .dialog-content {
      padding: 20px 24px !important;
      overflow-y: auto !important;
      max-height: 60vh !important;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #F3F4F6;
      }

      &::-webkit-scrollbar-thumb {
        background: #D1D5DB;
        border-radius: 3px;
      }
    }

    .compact-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .form-row mat-form-field {
      width: 100%;

      ::ng-deep .mat-mdc-text-field-wrapper {
        background: white !important;
      }

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        margin-top: 4px;
      }
    }

    .status-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #34C5AA;
      }
    }

    /* Dialog Title */
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      color: #2F4858;
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid #E5E7EB;

      mat-icon {
        color: #34C5AA;
      }
    }

    mat-dialog-actions {
      padding: 12px 24px !important;
      border-top: 1px solid #E5E7EB;
      gap: 8px;

      button {
        min-width: 80px;
      }

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .lookups-management {
        padding: 12px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .header-text {
        justify-content: center;
      }

      .header-actions {
        justify-content: center;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .child-item {
        flex-wrap: wrap;
      }

      .child-right {
        width: 100%;
        justify-content: space-between;
        margin-top: 8px;
      }
    }
  `]
})
export class LookupsManagementComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  allLookups: LookupItem[] = [];
  parentLookups: LookupItem[] = [];
  lookupTrees: LookupTree[] = [];

  lookupForm: FormGroup;
  editingLookup: LookupItem | null = null;

  // Ocean Mint inspired gradients
  private gradients = [
    'linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%)',
    'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)'
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.lookupForm = this.fb.group({
      name: ['', Validators.required],
      name_ara: [''],
      code: [''],
      type: [1, Validators.required],
      parent_lookup: [null],
      icon: [''],
      active_ind: [true]
    });
  }

  ngOnInit(): void {
    this.loadLookups();
  }

  loadLookups(): void {
    this.isLoading = true;
    const baseUrl = this.configService.getBaseUrl();

    this.http.get<{count: number, results: LookupItem[]}>(`${baseUrl}/lookups/management/`)
      .subscribe({
        next: (response) => {
          this.allLookups = response.results;
          this.processLookups();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading lookups:', err);
          this.snackBar.open('Error loading lookups', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
  }

  private processLookups(): void {
    this.parentLookups = this.allLookups.filter(lookup => lookup.type === 1);

    this.lookupTrees = this.parentLookups.map(parent => ({
      ...parent,
      children: this.allLookups.filter(child => child.parent_lookup === parent.id),
      expanded: false
    }));
  }

  openCreateDialog(): void {
    this.editingLookup = null;
    this.lookupForm.reset({
      type: 1,
      active_ind: true
    });
    this.openDialog();
  }

  editLookup(lookup: LookupItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.editingLookup = lookup;
    this.lookupForm.patchValue(lookup);
    this.openDialog();
  }

  addChildLookup(parent: LookupTree, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.editingLookup = null;
    this.lookupForm.reset({
      type: 2,
      parent_lookup: parent.id,
      active_ind: true
    });
    this.openDialog();
  }

  private openDialog(): void {
    this.dialog.open(this.editDialog, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'compact-dialog'
    });
  }

  saveLookup(): void {
    if (!this.lookupForm.valid) return;

    this.isSaving = true;
    const lookupData = this.lookupForm.value;
    const baseUrl = this.configService.getBaseUrl();

    const request = this.editingLookup?.id
      ? this.http.put(`${baseUrl}/lookups/management/${this.editingLookup.id}/`, lookupData)
      : this.http.post(`${baseUrl}/lookups/management/`, lookupData);

    request.subscribe({
      next: (response) => {
        this.snackBar.open(
          `Lookup ${this.editingLookup?.id ? 'updated' : 'created'} successfully`,
          'Close',
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.loadLookups();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving lookup:', err);
        this.snackBar.open('Error saving lookup', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSaving = false;
      }
    });
  }

  toggleExpansion(lookup: LookupTree): void {
    lookup.expanded = !lookup.expanded;
  }

  toggleStatus(lookup: LookupItem): void {
    const baseUrl = this.configService.getBaseUrl();
    const updatedLookup = { ...lookup, active_ind: !lookup.active_ind };

    this.http.put(`${baseUrl}/lookups/management/${lookup.id}/`, updatedLookup)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Lookup ${updatedLookup.active_ind ? 'activated' : 'deactivated'}`,
            'Close',
            {
              duration: 2000,
              panelClass: ['info-snackbar']
            }
          );
          this.loadLookups();
        },
        error: (err) => {
          console.error('Error updating lookup status:', err);
          this.snackBar.open('Error updating status', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  deleteLookup(lookup: LookupItem): void {
    if (confirm(`Are you sure you want to delete "${lookup.name}"?`)) {
      const baseUrl = this.configService.getBaseUrl();

      this.http.delete(`${baseUrl}/lookups/management/${lookup.id}/`)
        .subscribe({
          next: () => {
            this.snackBar.open('Lookup deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadLookups();
          },
          error: (err) => {
            console.error('Error deleting lookup:', err);
            this.snackBar.open('Error deleting lookup', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  refreshData(): void {
    this.loadLookups();
  }

  getTotalValues(): number {
    return this.lookupTrees.reduce((total, tree) => total + tree.children.length, 0);
  }

  getActiveCount(): number {
    return this.allLookups.filter(lookup => lookup.active_ind).length;
  }

  getActivePercentage(): string {
    if (this.allLookups.length === 0) return '0';
    const percentage = (this.getActiveCount() / this.allLookups.length) * 100;
    return percentage.toFixed(0);
  }

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }


  getRandomGradient(): string {
    return this.gradients[Math.floor(Math.random() * this.gradients.length)];
  }
}
