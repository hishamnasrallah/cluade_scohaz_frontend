// src/app/components/inquiry/inquiry-dashboard/inquiry-dashboard.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';
import { InquiryExecutorService } from '../../../services/inquiry-executor.service';
import { InquiryMetadata } from '../../../models/inquiry-execution.models';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-inquiry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatBadgeModule,
    TranslatePipe
  ],
  templateUrl: './inquiry-dashboard.component.html',
  styleUrls: ['./inquiry-dashboard.component.scss']
})
export class InquiryDashboardComponent implements OnInit, OnDestroy {
  inquiries: InquiryMetadata[] = [];
  filteredInquiries: InquiryMetadata[] = [];
  categories: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  selectedCategory = 'all';
  isLoading = false;

  statistics = {
    totalInquiries: 0,
    totalExecutions: 0,
    averageExecutionTime: 0,
    mostUsedInquiry: null as InquiryMetadata | null
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private inquiryExecutorService: InquiryExecutorService
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInquiries(): void {
    this.isLoading = true;

    this.inquiryExecutorService.getAvailableInquiries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inquiries) => {
          this.inquiries = inquiries;
          this.extractCategories();
          this.filterInquiries();
          this.calculateStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading inquiries:', error);
          this.isLoading = false;
        }
      });
  }

  private extractCategories(): void {
    const categorySet = new Set<string>();
    this.inquiries.forEach(inquiry => {
      if (inquiry.category) {
        categorySet.add(inquiry.category);
      }
    });
    this.categories = Array.from(categorySet).sort();
  }

  filterInquiries(): void {
    let filtered = [...this.inquiries];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.display_name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query) ||
        i.code.toLowerCase().includes(query)
      );
    }

    this.filteredInquiries = filtered;
  }

  private calculateStatistics(): void {
    this.statistics.totalInquiries = this.inquiries.length;

    // Calculate total executions and find most used
    let maxExecutions = 0;
    let totalExecutions = 0;
    let mostUsed: InquiryMetadata | null = null;

    this.inquiries.forEach(inquiry => {
      const execCount = inquiry.execution_count || 0;
      totalExecutions += execCount;

      if (execCount > maxExecutions) {
        maxExecutions = execCount;
        mostUsed = inquiry;
      }
    });

    this.statistics.totalExecutions = totalExecutions;
    this.statistics.mostUsedInquiry = mostUsed;

    // Calculate average execution time
    const totalTime = this.inquiries.reduce((sum, i) =>
      sum + (i.average_execution_time || 0), 0
    );
    this.statistics.averageExecutionTime =
      this.inquiries.length > 0 ? totalTime / this.inquiries.length : 0;
  }

  executeInquiry(inquiry: InquiryMetadata): void {
    this.inquiryExecutorService.addToRecent(inquiry);
    this.router.navigate(['/inquiry', inquiry.code]);
  }

  toggleFavorite(inquiry: InquiryMetadata, event: Event): void {
    event.stopPropagation();

    this.inquiryExecutorService.toggleFavorite(inquiry.code)
      .subscribe(() => {
        inquiry.is_favorite = !inquiry.is_favorite;
      });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onSearchChange(): void {
    this.filterInquiries();
  }

  onCategoryChange(): void {
    this.filterInquiries();
  }

  getInquiryIcon(inquiry: InquiryMetadata): string {
    return inquiry.icon || 'table_chart';
  }

  formatExecutionTime(time: number): string {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(1)}s`;
  }
}
