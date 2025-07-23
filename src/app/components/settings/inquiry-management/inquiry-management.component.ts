// components/settings/inquiry-management/inquiry-management.component.ts

import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { InquiryConfigService } from '../../../services/inquiry-config.service';
import { InquiryConfiguration, PaginatedResponse } from '../../../models/inquiry-config.models';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import {MatProgressBar} from '@angular/material/progress-bar';

interface InquiryStatistics {
  total: number;
  active: number;
  public: number;
  recentlyUpdated: number;
}

@Component({
  selector: 'app-inquiry-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatChipsModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDividerModule,
    TranslatePipe,
    MatProgressBar
  ],
  templateUrl: './inquiry-management.component.html',
  styleUrls: ['./inquiry-management.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class InquiryManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // State
  isLoading = false;
  isLoadingSkeleton = true;
  searchQuery = '';
  selectedInquiries: InquiryConfiguration[] = [];

  // Data
  inquiries: InquiryConfiguration[] = [];
  dataSource = new MatTableDataSource<InquiryConfiguration>();

  // Statistics
  statistics: InquiryStatistics = {
    total: 0,
    active: 0,
    public: 0,
    recentlyUpdated: 0
  };

  // Table columns
  displayedColumns: string[] = [
    'select',
    'name',
    'model',
    'status',
    'visibility',
    'fields',
    'lastUpdated',
    'actions'
  ];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;
  pageSizeOptions = [5, 10, 25, 50];

  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private inquiryService: InquiryConfigService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadInquiries();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadInquiries();
    });
  }

  loadInquiries(): void {
    this.isLoading = true;

    const params = {
      search: this.searchQuery,
      page: this.currentPage + 1,
      page_size: this.pageSize,
      ordering: this.sort?.active ? `${this.sort.direction === 'desc' ? '-' : ''}${this.sort.active}` : '-updated_at'
    };

    this.inquiryService.listConfigurations(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<InquiryConfiguration>) => {
          this.inquiries = response.results;
          this.totalItems = response.count;
          this.dataSource.data = this.inquiries;
          this.isLoading = false;
          this.isLoadingSkeleton = false;
        },
        error: (error) => {
          this.snackBar.open('Error loading inquiries', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoading = false;
          this.isLoadingSkeleton = false;
        }
      });
  }

  private loadStatistics(): void {
    // In a real app, this would come from a dedicated endpoint
    // For now, calculate from loaded data
    this.statistics = {
      total: this.totalItems,
      active: this.inquiries.filter(i => i.active).length,
      public: this.inquiries.filter(i => i.is_public).length,
      recentlyUpdated: this.inquiries.filter(i => {
        if (!i.updated_at) return false;
        const date = new Date(i.updated_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length
    };
  }

  // Search
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  // Navigation
  createInquiry(): void {
    this.router.navigate(['/settings/inquiry-management/create']);
  }

  editInquiry(inquiry: InquiryConfiguration): void {
    this.router.navigate(['/settings/inquiry-management/edit', inquiry.code]);
  }

  viewInquiry(inquiry: InquiryConfiguration): void {
    this.router.navigate(['/settings/inquiry-management/preview', inquiry.code]);
  }

  // Actions
  duplicateInquiry(inquiry: InquiryConfiguration): void {
    const duplicate = {
      ...inquiry,
      name: `${inquiry.name} (Copy)`,
      code: `${inquiry.code}_copy`,
      id: undefined
    };

    this.inquiryService.createConfiguration(duplicate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newInquiry) => {
          this.snackBar.open('Inquiry duplicated successfully', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          this.loadInquiries();
        },
        error: (error) => {
          this.snackBar.open('Error duplicating inquiry', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  toggleInquiryStatus(inquiry: InquiryConfiguration): void {
    const updated = { ...inquiry, active: !inquiry.active };

    this.inquiryService.updateConfiguration(inquiry.code, updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Inquiry ${updated.active ? 'activated' : 'deactivated'} successfully`,
            'Close',
            { duration: 2000, panelClass: 'success-snackbar' }
          );
          this.loadInquiries();
        },
        error: (error) => {
          this.snackBar.open('Error updating inquiry status', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  deleteInquiry(inquiry: InquiryConfiguration): void {
    if (confirm(`Are you sure you want to delete "${inquiry.name}"?`)) {
      this.inquiryService.deleteConfiguration(inquiry.code)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Inquiry deleted successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            this.loadInquiries();
          },
          error: (error) => {
            this.snackBar.open('Error deleting inquiry', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
    }
  }

  exportInquiry(inquiry: InquiryConfiguration): void {
    this.inquiryService.exportConfiguration(inquiry.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${inquiry.code}_config.json`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.snackBar.open('Error exporting inquiry', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  importInquiry(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.inquiryService.importConfiguration(file)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Inquiry imported successfully', 'Close', {
                duration: 3000,
                panelClass: 'success-snackbar'
              });
              this.loadInquiries();
            },
            error: (error) => {
              this.snackBar.open('Error importing inquiry', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
              });
            }
          });
      }
    };

    input.click();
  }

  // Bulk actions
  bulkDelete(): void {
    if (this.selectedInquiries.length === 0) return;

    const count = this.selectedInquiries.length;
    if (confirm(`Are you sure you want to delete ${count} inquiries?`)) {
      // In a real app, this would be a bulk delete endpoint
      Promise.all(
        this.selectedInquiries.map(inquiry =>
          this.inquiryService.deleteConfiguration(inquiry.code).toPromise()
        )
      ).then(() => {
        this.snackBar.open(`${count} inquiries deleted successfully`, 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.selectedInquiries = [];
        this.loadInquiries();
      }).catch(() => {
        this.snackBar.open('Error deleting inquiries', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      });
    }
  }

  bulkExport(): void {
    if (this.selectedInquiries.length === 0) return;

    // Export each selected inquiry
    this.selectedInquiries.forEach(inquiry => {
      this.exportInquiry(inquiry);
    });
  }

  // Selection
  isAllSelected(): boolean {
    return this.selectedInquiries.length === this.inquiries.length && this.inquiries.length > 0;
  }

  isSomeSelected(): boolean {
    return this.selectedInquiries.length > 0 && this.selectedInquiries.length < this.inquiries.length;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selectedInquiries = [];
    } else {
      this.selectedInquiries = [...this.inquiries];
    }
  }

  toggleSelection(inquiry: InquiryConfiguration): void {
    const index = this.selectedInquiries.findIndex(i => i.id === inquiry.id);
    if (index >= 0) {
      this.selectedInquiries.splice(index, 1);
    } else {
      this.selectedInquiries.push(inquiry);
    }
  }

  isSelected(inquiry: InquiryConfiguration): boolean {
    return this.selectedInquiries.some(i => i.id === inquiry.id);
  }

  // Pagination
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInquiries();
  }

  // Refresh
  refreshData(): void {
    this.loadInquiries();
    this.loadStatistics();
  }

  // Utility methods
  getSkeletonArray(count: number): number[] {
    return Array(count).fill(0).map((_, i) => i);
  }

  getModelDisplay(inquiry: InquiryConfiguration): string {
    // This would ideally come from the content type data
    return inquiry.content_type ? `Model ${inquiry.content_type}` : 'Unknown Model';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
