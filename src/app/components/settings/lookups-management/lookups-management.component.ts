// components/settings/lookups-management/lookups-management.component.ts - FIXED
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
    MatExpansionModule
  ],
  template: `
    <div class="lookups-management">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Lookups Management</h1>
            <p>Manage dropdown values, categories, and reference data</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              <mat-icon>add</mat-icon>
              Add Lookup
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
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
            <p>Total Values</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveCount() }}</h3>
            <p>Active Items</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading lookups data...</p>
      </div>

      <!-- Lookup Trees -->
      <div class="lookups-content" *ngIf="!isLoading">
        <mat-card *ngFor="let lookup of lookupTrees" class="lookup-tree-card">
          <mat-card-header>
            <div class="tree-header">
              <div class="tree-icon" [style.background]="getRandomGradient()">
                <mat-icon>{{ lookup.icon || 'folder' }}</mat-icon>
              </div>
              <div class="tree-info">
                <h3>{{ lookup.name }}</h3>
                <p>{{ lookup.name_ara || 'No Arabic name' }} • {{ lookup.children.length }} items</p>
              </div>
              <div class="tree-actions">
                <button mat-icon-button (click)="toggleExpansion(lookup)"
                        [matTooltip]="lookup.expanded ? 'Collapse' : 'Expand'">
                  <mat-icon>{{ lookup.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="editLookup(lookup)" matTooltip="Edit Category">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="addChildLookup(lookup)" matTooltip="Add Item">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-header>

          <mat-card-content *ngIf="lookup.expanded">
            <div class="children-list">
              <div *ngFor="let child of lookup.children" class="child-item">
                <div class="child-content">
                  <div class="child-info">
                    <span class="child-name">{{ child.name }}</span>
                    <span class="child-code" *ngIf="child.code">{{ child.code }}</span>
                    <span class="child-status" [class]="child.active_ind ? 'status-active' : 'status-inactive'">
                      {{ child.active_ind ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                  <div class="child-actions">
                    <button mat-icon-button (click)="editLookup(child)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button
                            (click)="toggleStatus(child)"
                            [matTooltip]="child.active_ind ? 'Deactivate' : 'Activate'">
                      <mat-icon>{{ child.active_ind ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteLookup(child)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="add-child-button" *ngIf="lookup.children.length === 0">
                <button mat-button (click)="addChildLookup(lookup)" class="add-first-item">
                  <mat-icon>add</mat-icon>
                  Add First Item
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="lookupTrees.length === 0">
          <mat-icon>folder_open</mat-icon>
          <h3>No lookups found</h3>
          <p>Start by creating your first lookup category</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create First Lookup
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog - FIXED -->
    <ng-template #editDialog>
      <div mat-dialog-title>{{ editingLookup?.id ? 'Edit' : 'Create' }} Lookup</div>
      <mat-dialog-content>
        <form [formGroup]="lookupForm" class="lookup-form">
          <mat-form-field appearance="outline">
            <mat-label>Name (English)</mat-label>
            <input matInput formControlName="name" placeholder="Enter lookup name">
            <mat-error *ngIf="lookupForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Name (Arabic)</mat-label>
            <input matInput formControlName="name_ara" placeholder="Enter Arabic name">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="Enter code">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option [value]="1">Category (Parent)</mat-option>
              <mat-option [value]="2">Value (Child)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="lookupForm.get('type')?.value === 2">
            <mat-label>Parent Category</mat-label>
            <mat-select formControlName="parent_lookup">
              <mat-option *ngFor="let parent of parentLookups" [value]="parent.id">
                {{ parent.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Icon</mat-label>
            <input matInput formControlName="icon" placeholder="Material icon name">
          </mat-form-field>

          <mat-checkbox formControlName="active_ind" class="active-checkbox">
            Active
          </mat-checkbox>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveLookup()"
                [disabled]="!lookupForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingLookup?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .lookups-management {
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

      &.categories-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.values-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.active-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
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

    .lookups-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .lookup-tree-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .tree-header {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .tree-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .tree-info {
      flex: 1;
    }

    .tree-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
    }

    .tree-info p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .tree-actions {
      display: flex;
      gap: 4px;
    }

    .children-list {
      padding: 16px 0;
    }

    .child-item {
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }

    .child-item:hover {
      border-color: #e2e8f0;
      background: #f8fafc;
    }

    .child-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
    }

    .child-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .child-name {
      font-weight: 500;
      color: #334155;
    }

    .child-code {
      background: #f1f5f9;
      color: #64748b;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-family: monospace;
    }

    .child-status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;

      &.status-active {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.status-inactive {
        background: rgba(148, 163, 184, 0.1);
        color: #64748b;
      }
    }

    .child-actions {
      display: flex;
      gap: 4px;
    }

    .add-child-button {
      text-align: center;
      padding: 20px;
    }

    .add-first-item {
      color: #667eea;
      border: 2px dashed #e2e8f0;
      border-radius: 12px;
      padding: 12px 24px;
    }

    .empty-state {
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

    .lookup-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .active-checkbox {
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .lookups-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .tree-header {
        flex-wrap: wrap;
      }

      .child-content {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }
  `]
})
export class LookupsManagementComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>; // FIXED: Added ViewChild reference

  isLoading = false;
  isSaving = false;
  allLookups: LookupItem[] = [];
  parentLookups: LookupItem[] = [];
  lookupTrees: LookupTree[] = [];

  lookupForm: FormGroup;
  editingLookup: LookupItem | null = null;

  private gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
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
          this.snackBar.open('Error loading lookups', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  private processLookups(): void {
    // Separate parent and child lookups
    this.parentLookups = this.allLookups.filter(lookup => lookup.type === 1);

    // Build tree structure
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

  editLookup(lookup: LookupItem): void {
    this.editingLookup = lookup;
    this.lookupForm.patchValue(lookup);
    this.openDialog();
  }

  addChildLookup(parent: LookupTree): void {
    this.editingLookup = null;
    this.lookupForm.reset({
      type: 2,
      parent_lookup: parent.id,
      active_ind: true
    });
    this.openDialog();
  }

  private openDialog(): void {
    // FIXED: Proper dialog opening
    this.dialog.open(this.editDialog, {
      width: '500px',
      maxHeight: '90vh'
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
          { duration: 3000 }
        );
        this.loadLookups();
        this.dialog.closeAll();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving lookup:', err);
        this.snackBar.open('Error saving lookup', 'Close', { duration: 3000 });
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
            { duration: 2000 }
          );
          this.loadLookups();
        },
        error: (err) => {
          console.error('Error updating lookup status:', err);
          this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
        }
      });
  }

  deleteLookup(lookup: LookupItem): void {
    if (confirm(`Are you sure you want to delete "${lookup.name}"?`)) {
      const baseUrl = this.configService.getBaseUrl();

      this.http.delete(`${baseUrl}/lookups/management/${lookup.id}/`)
        .subscribe({
          next: () => {
            this.snackBar.open('Lookup deleted successfully', 'Close', { duration: 3000 });
            this.loadLookups();
          },
          error: (err) => {
            console.error('Error deleting lookup:', err);
            this.snackBar.open('Error deleting lookup', 'Close', { duration: 3000 });
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

  getRandomGradient(): string {
    return this.gradients[Math.floor(Math.random() * this.gradients.length)];
  }
}
