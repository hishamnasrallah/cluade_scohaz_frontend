// src/app/reports/components/report-viewer/report-viewer.component.ts

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { Report, ExecutionResult, ReportExecution } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';

Chart.register(...registerables);

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSlideToggle,
    MatFormField,
    MatLabel,
    FormsModule,
    MatInput
  ],
  templateUrl: 'report-viewer.component.html',
  styleUrl: 'report-viewer.component.scss'
})
export class ReportViewerComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  report: Report | null = null;
  executionResult: ExecutionResult | null = null;

  executions: ReportExecution[] = [];

  isLoading = false;
  isExecuting = false;
  error: string | null = null;

  viewMode: 'table' | 'chart' = 'table';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';
  chart: Chart | null = null;

  // Sharing
  shareUrl = '';
  isPublic = false;
  displayedColumns: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(parseInt(id));
    }
  }

  loadReport(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.reportService.getReport(id).subscribe({
      next: (report) => {
        this.report = report;
        this.isPublic = report.is_public;
        this.generateShareUrl();
        this.loadExecutions();

        // Auto-execute if no parameters required
        const hasRequiredParams = report.parameters?.some(p => p.is_required);
        if (!hasRequiredParams) {
          this.executeReport();
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.error = 'Failed to load report';
        this.isLoading = false;

        this.snackBar.open('Error loading report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadExecutions(): void {
    if (!this.report?.id) return;

    this.reportService.getExecutions(this.report.id).subscribe({
      next: (response: any) => {
        // Handle both array and paginated response
        const executions = Array.isArray(response) ? response : response.results || [];
        this.executions = executions.sort((a: ReportExecution, b: ReportExecution) =>
          new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime()
        );
      }
    });
  }

  executeReport(parameters?: Record<string, any>): void {
    if (!this.report?.id) return;

    this.isExecuting = true;
    this.error = null;

    this.reportService.executeReport(this.report.id, {
      parameters: parameters || {},
      limit: 1000
    }).subscribe({
      next: (result) => {
        this.executionResult = result;
        this.displayedColumns = result.columns.map(c => c.display_name);
        this.isExecuting = false;

        if (this.viewMode === 'chart' && result.data.length > 0) {
          setTimeout(() => this.updateChart(), 100);
        }

        this.loadExecutions(); // Refresh execution history
      },
      error: (err) => {
        console.error('Error executing report:', err);
        this.error = err.error?.detail || 'Failed to execute report';
        this.isExecuting = false;

        this.snackBar.open('Error executing report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editReport(): void {
    if (this.report?.id) {
      this.router.navigate(['/reports', this.report.id, 'edit']);
    }
  }

  duplicateReport(): void {
    if (!this.report?.id) return;

    this.reportService.duplicateReport(this.report.id).subscribe({
      next: (newReport) => {
        this.snackBar.open('Report duplicated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/reports', newReport.id, 'edit']);
      }
    });
  }

  scheduleReport(): void {
    if (this.report?.id) {
      this.router.navigate(['/reports/schedules'], {
        queryParams: { reportId: this.report.id }
      });
    }
  }

  exportReport(format: 'csv' | 'excel' | 'pdf'): void {
    if (!this.report?.id) return;

    this.reportService.exportReport(this.report.id, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.report?.name}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.snackBar.open(`Report exported as ${format.toUpperCase()}`, 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error exporting report:', err);
        this.snackBar.open('Error exporting report', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'chart' : 'table';

    if (this.viewMode === 'chart' && this.executionResult?.data.length) {
      setTimeout(() => this.updateChart(), 100);
    }
  }

  changeChartType(type: 'bar' | 'line' | 'pie' | 'doughnut'): void {
    this.chartType = type;
    this.updateChart();
  }

  updateChart(): void {
    if (!this.executionResult || !this.chartCanvas) return;

    const data = this.executionResult.data;
    const columns = this.executionResult.columns;

    // Debug logging
    console.log('Chart update - columns:', columns);
    console.log('Chart update - sample data:', data[0]);

    // Find suitable columns for chart
    const labelColumn = columns.find(c => c.type === 'CharField' || c.aggregation === 'group_by');
    const valueColumns = columns.filter(c =>
      ['IntegerField', 'FloatField', 'DecimalField'].includes(c.type) ||
      ['sum', 'count', 'avg'].includes(c.aggregation || '')
    );

    console.log('Label column:', labelColumn);
    console.log('Value columns:', valueColumns);

    if (!labelColumn || valueColumns.length === 0) {
      console.warn('No suitable columns found for chart');
      return;
    }

    // Prepare chart data
    const labels = data.map(row => row[labelColumn.display_name]);
    const datasets = valueColumns.map((col, index) => ({
      label: col.display_name,
      data: data.map(row => row[col.display_name]),
      backgroundColor: this.getChartColor(index, 0.2),
      borderColor: this.getChartColor(index, 1),
      borderWidth: 2
    }));

    // Chart configuration
    const config: ChartConfiguration = {
      type: this.chartType as any,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: this.report?.name || 'Report'
          }
        },
        scales: this.chartType === 'bar' || this.chartType === 'line' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      }
    };

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Create new chart
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, config);
    }
  }

  getChartColor(index: number, alpha: number): string {
    const colors = [
      `rgba(52, 197, 170, ${alpha})`,
      `rgba(59, 130, 246, ${alpha})`,
      `rgba(236, 72, 153, ${alpha})`,
      `rgba(245, 158, 11, ${alpha})`,
      `rgba(147, 51, 234, ${alpha})`,
      `rgba(34, 197, 94, ${alpha})`
    ];
    return colors[index % colors.length];
  }

  togglePublicAccess(): void {
    if (!this.report?.id) return;

    const newPublicState = !this.isPublic;

    this.reportService.updateReport(this.report.id, {
      is_public: newPublicState
    }).subscribe({
      next: (updated) => {
        this.isPublic = newPublicState;
        this.report = updated;

        this.snackBar.open(
          newPublicState ? 'Report is now public' : 'Report is now private',
          'Close',
          {
            duration: 2000,
            panelClass: ['success-snackbar']
          }
        );
      }
    });
  }

  generateShareUrl(): void {
    if (this.report?.id) {
      const baseUrl = window.location.origin;
      this.shareUrl = `${baseUrl}/reports/public/${this.report.id}`;
    }
  }

  copyShareLink(): void {
    navigator.clipboard.writeText(this.shareUrl).then(() => {
      this.snackBar.open('Share link copied to clipboard', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    });
  }

  formatValue(value: any, formatting?: any): string {
    if (value === null || value === undefined) return '-';

    if (formatting?.type) {
      switch (formatting.type) {
        case 'currency':
          const prefix = formatting.prefix || '$';
          const decimals = formatting.decimals ?? 2;
          return `${prefix}${parseFloat(value).toFixed(decimals)}`;

        case 'percentage':
          const pctValue = formatting.multiply_by_100 ? value * 100 : value;
          return `${pctValue.toFixed(formatting.decimals || 1)}%`;

        case 'date':
          return new Date(value).toLocaleDateString();

        case 'datetime':
          return new Date(value).toLocaleString();

        case 'number':
          const num = parseFloat(value);
          if (formatting.thousands_separator) {
            return num.toLocaleString();
          }
          return num.toFixed(formatting.decimals || 0);

        default:
          return value.toString();
      }
    }

    return value.toString();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }
}
