// src/app/reports/components/report-list/report-list.component.ts

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
import { ReportService } from '../../../services/report.service';
import { Report } from '../../../models/report.models';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: 'report-list.component.html',
  styleUrl: 'report-list.component.scss'
})
export class ReportListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  reports: Report[] = [];
  filteredReports: Report[] = [];
  dataSource = new MatTableDataSource<Report>([]);
  displayedColumns = ['name', 'type', 'category', 'status', 'visibility', 'created', 'lastRun', 'actions'];

  isLoading = false;
  viewMode: 'grid' | 'table' = 'grid';

  // Form controls
  searchControl = new FormControl('');
  typeControl = new FormControl('');
  categoryControl = new FormControl('');
  statusControl = new FormControl('');

  // Stats
  totalReports = 0;
  activeReports = 0;
  publicReports = 0;
  recentExecutions = 0;

  // Categories for filter
  categories: string[] = [];

  constructor(
    private reportService: ReportService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadReports();
  }

  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilters());

    // Other filters
    this.typeControl.valueChanges.subscribe(() => this.applyFilters());
    this.categoryControl.valueChanges.subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
  }

  loadReports(): void {
    this.isLoading = true;
    this.reportService.getReports().subscribe({
      next: (response) => {
        this.reports = response.results;
        this.updateStats();
        this.extractCategories();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.snackBar.open('Error loading reports', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  updateStats(): void {
    this.totalReports = this.reports.length;
    this.activeReports = this.reports.filter(r => r.is_active).length;
    this.publicReports = this.reports.filter(r => r.is_public).length;
    this.recentExecutions = this.reports.filter(r => r.last_execution).length;
  }

  extractCategories(): void {
    const categorySet = new Set<string>();
    this.reports.forEach(report => {
      if (report.category) {
        categorySet.add(report.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  applyFilters(): void {
    let filtered = [...this.reports];

    // Search filter
    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm) ||
        report.description?.toLowerCase().includes(searchTerm) ||
        report.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Type filter
    const type = this.typeControl.value;
    if (type) {
      filtered = filtered.filter(report => report.report_type === type);
    }

    // Category filter
    const category = this.categoryControl.value;
    if (category) {
      filtered = filtered.filter(report => report.category === category);
    }

    // Status filter
    const status = this.statusControl.value;
    if (status === 'active') {
      filtered = filtered.filter(report => report.is_active);
    } else if (status === 'inactive') {
      filtered = filtered.filter(report => !report.is_active);
    }

    this.filteredReports = filtered;
    this.dataSource.data = filtered;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onViewModeChange(event: any): void {
    this.viewMode = event.value;
  }

  refreshData(): void {
    this.loadReports();
  }

  createReport(): void {
    this.router.navigate(['/reports/create']);
  }

  viewReport(report: Report): void {
    this.router.navigate(['/reports', report.id, 'view']);
  }

  editReport(report: Report): void {
    this.router.navigate(['/reports', report.id, 'edit']);
  }

  executeReport(report: Report): void {
    this.router.navigate(['/reports', report.id, 'execute']);
  }

  duplicateReport(report: Report): void {
    if (!report.id) return;

    this.reportService.duplicateReport(report.id).subscribe({
      next: (newReport) => {
        this.snackBar.open('Report duplicated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/reports', newReport.id, 'edit']);
      },
      error: (err) => {
        console.error('Error duplicating report:', err);
        this.snackBar.open('Error duplicating report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  scheduleReport(report: Report): void {
    this.router.navigate(['/reports/schedules'], { queryParams: { reportId: report.id } });
  }

  shareReport(report: Report): void {
    // TODO: Implement share dialog
    this.snackBar.open('Share functionality coming soon', 'Close', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
  }

  deleteReport(report: Report): void {
    if (!report.id) return;

    if (confirm(`Are you sure you want to delete "${report.name}"? This action cannot be undone.`)) {
      this.reportService.deleteReport(report.id).subscribe({
        next: () => {
          this.snackBar.open('Report deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadReports();
        },
        error: (err) => {
          console.error('Error deleting report:', err);
          this.snackBar.open('Error deleting report', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  getReportTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'ad_hoc': 'dashboard',
      'template': 'content_copy',
      'dashboard': 'view_quilt',
      'scheduled': 'schedule'
    };
    return icons[type] || 'assessment';
  }

  getReportTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'ad_hoc': 'Ad Hoc',
      'template': 'Template',
      'dashboard': 'Dashboard',
      'scheduled': 'Scheduled'
    };
    return labels[type] || type;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
