// components/applications-inbox/applications-inbox.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { CaseService } from '../../services/case.service';
import { CaseTableComponent } from './components/case-table/case-table.component';
import { CaseDetailComponent } from './components/case-detail/case-detail.component';

export interface CaseData {
  id: number;
  applicant: number;
  applicant_type: number;
  case_type: number;
  status: number;
  sub_status?: number;
  assigned_group: number;
  assigned_emp?: number;
  current_approval_step: number;
  last_action: number;
  created_by: number;
  updated_by: number;
  case_data: any;
  serial_number: string;
  created_at: string;
  updated_at: string;
  available_actions?: Array<{
    id: number;
    name: string;
    name_ara: string;
    code: string;
    active_ind: boolean;
  }>;
  // New fields for parallel approval
  assignment_type?: 'directly_assigned' | 'parallel_approval' | 'available';
  assignment_display?: string;
  approval_info?: {
    type: 'parallel' | 'sequential';
    required_approvals?: number;
    current_approvals?: number;
    remaining_approvals?: number;
    user_has_approved?: boolean;
    can_approve?: boolean;
    approvers?: Array<{
      user: string;
      approved_at: string;
      department: string | null;
    }>;
    pending_groups?: Array<{
      id: number;
      name: string;
    }>;
  };
  ui_status?: string;
  ui_status_color?: string;
}

export interface CasesResponse {
  my_cases: {
    count: number;
    next: string | null;
    previous: string | null;
    results: CaseData[];
  };
  available_cases: {
    count: number;
    next: string | null;
    previous: string | null;
    results: CaseData[];
  };
}

@Component({
  selector: 'app-applications-inbox',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    CaseTableComponent,
    // CaseDetailComponent
  ],
  template: `
    <div class="applications-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <mat-icon>inbox</mat-icon>
            </div>
            <div class="header-text">
              <h1 class="page-title">Applications</h1>
              <p class="page-subtitle">Manage your cases and available assignments</p>
            </div>
          </div>

          <div class="header-actions">
            <button mat-button
                    (click)="refreshData()"
                    class="refresh-btn"
                    [disabled]="loading">
              <mat-icon [class.spinning]="loading">refresh</mat-icon>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading && !casesData">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="loading-text">Loading applications...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper" *ngIf="!loading || casesData">
        <mat-card class="tabs-card">
          <mat-tab-group class="applications-tabs"
                         [selectedIndex]="selectedTabIndex"
                         (selectedTabChange)="onTabChange($event)">

            <!-- My Applications Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon>assignment</mat-icon>
                  <span>My Applications</span>
                  <mat-chip *ngIf="myCasesCount > 0"
                            class="count-chip"
                            [matBadge]="myCasesCount">
                    {{ myCasesCount }}
                  </mat-chip>
                  <mat-chip *ngIf="parallelApprovalCount > 0"
                            class="count-chip parallel"
                            matTooltip="Cases awaiting your parallel approval">
                    <mat-icon class="chip-icon">groups</mat-icon>
                    {{ parallelApprovalCount }}
                  </mat-chip>
                </div>
              </ng-template>

              <div class="tab-content">
                <app-case-table
                  [cases]="myCases"
                  [loading]="loading"
                  [showAssignButton]="false"
                  [showActions]="true"
                  (onAction)="handleCaseAction($event)"
                  (onRefresh)="refreshData()">
                </app-case-table>
              </div>
            </mat-tab>

            <!-- New Cases Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon>add_task</mat-icon>
                  <span>New Cases</span>
                  <mat-chip *ngIf="availableCasesCount > 0"
                            class="count-chip"
                            [matBadge]="availableCasesCount">
                    {{ availableCasesCount }}
                  </mat-chip>
                </div>
              </ng-template>

              <div class="tab-content">
                <app-case-table
                  [cases]="availableCases"
                  [loading]="loading"
                  [showAssignButton]="true"
                  [showActions]="false"
                  (onAssign)="handleCaseAssignment($event)"
                  (onRefresh)="refreshData()">
                </app-case-table>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './applications-inbox.component.scss'
})
export class ApplicationsInboxComponent implements OnInit, OnDestroy {
  casesData: CasesResponse | null = null;
  loading = false;
  selectedTabIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private caseService: CaseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get myCases(): CaseData[] {
    return this.casesData?.my_cases?.results || [];
  }

  get availableCases(): CaseData[] {
    return this.casesData?.available_cases?.results || [];
  }

  get myCasesCount(): number {
    return this.casesData?.my_cases?.count || 0;
  }

  get availableCasesCount(): number {
    return this.casesData?.available_cases?.count || 0;
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  loadCases(): void {
    this.loading = true;

    this.caseService.getEmployeeCases()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: CasesResponse) => {
          this.casesData = data;
          this.loading = false;
          console.log('Cases loaded successfully:', data);
        },
        error: (error) => {
          console.error('Error loading cases:', error);
          this.loading = false;
          this.snackBar.open('Failed to load applications', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  refreshData(): void {
    this.loadCases();
  }

  handleCaseAssignment(caseData: CaseData): void {
    this.loading = true;

    this.caseService.assignCase(caseData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Case ${caseData.serial_number} assigned successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.refreshData();
        },
        error: (error) => {
          console.error('Error assigning case:', error);
          this.loading = false;
          this.snackBar.open('Failed to assign case', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  handleCaseAction(event: { case: CaseData; action: any }): void {
    const { case: caseData, action } = event;
    this.loading = true;

    this.caseService.performCaseAction(caseData.id, action.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Action "${action.name}" completed successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.refreshData();
        },
        error: (error) => {
          console.error('Error performing case action:', error);
          this.loading = false;
          this.snackBar.open(`Failed to perform action: ${action.name}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
  get parallelApprovalCount(): number {
    if (!this.myCases) return 0;
    return this.myCases.filter(c =>
      c.assignment_type === 'parallel_approval' &&
      c.approval_info?.can_approve
    ).length;
  }
}
