// components/applications-inbox/applications-inbox.component.ts - WITH TRANSLATIONS
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
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
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
  approval_history?: Array<{
    approval_step: {
      id: number;
      status: string;
      group: string;
      step_type: string;
      type: 'parallel' | 'sequential' | 'unknown';
      required_approvals?: number;
    };
    approvals: Array<{
      approved_by: string;
      approved_at: string;
      action_taken: string;
      department: string | null;
    }>;
  }>;
}

export interface CasesResponse {
  my_cases: {
    total_count: number;
    categories: {
      assigned_to_me: {
        count: number;
        results: CaseData[];
      };
      pending_my_approval: {
        count: number;
        results: CaseData[];
      };
      already_approved: {
        count: number;
        results: CaseData[];
      };
    };
  };
  available_cases: {
    count: number;
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
    TranslatePipe
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
              <h1 class="page-title">{{ 'applications' | translate }}</h1>
              <p class="page-subtitle">{{ 'manage_cases' | translate }}</p>
            </div>
          </div>

          <div class="header-actions">
            <button mat-button
                    (click)="refreshData()"
                    class="refresh-btn"
                    [disabled]="loading">
              <mat-icon [class.spinning]="loading">refresh</mat-icon>
              <span>{{ 'refresh' | translate }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading && !casesData">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="loading-text">{{ 'loading_applications' | translate }}...</p>
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
                  <span>{{ 'my_applications' | translate }}</span>
                  <mat-chip *ngIf="myCasesCount > 0"
                            class="count-chip">
                    {{ myCasesCount }}
                  </mat-chip>
                </div>
              </ng-template>

              <div class="tab-content">
                <!-- Category Tabs -->
                <mat-tab-group class="category-tabs"
                               [selectedIndex]="selectedCategoryIndex"
                               (selectedTabChange)="onCategoryTabChange($event)">

                  <!-- Assigned to Me -->
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="tab-label">
                        <span>{{ 'assigned_to_me' | translate }}</span>
                        <mat-chip *ngIf="assignedToMeCount > 0"
                                  class="count-chip">
                          {{ assignedToMeCount }}
                        </mat-chip>
                      </div>
                    </ng-template>
                    <app-case-table
                      [cases]="assignedToMeCases"
                      [loading]="loading"
                      [showAssignButton]="false"
                      [showActions]="true"
                      (onAction)="handleCaseAction($event)"
                      (onRefresh)="refreshData()">
                    </app-case-table>
                  </mat-tab>

                  <!-- Pending My Approval -->
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="tab-label">
                        <span>{{ 'pending_my_approval' | translate }}</span>
                        <mat-chip *ngIf="pendingMyApprovalCount > 0"
                                  class="count-chip">
                          {{ pendingMyApprovalCount }}
                        </mat-chip>
                      </div>
                    </ng-template>
                    <app-case-table
                      [cases]="pendingMyApprovalCases"
                      [loading]="loading"
                      [showAssignButton]="false"
                      [showActions]="true"
                      (onAction)="handleCaseAction($event)"
                      (onRefresh)="refreshData()">
                    </app-case-table>
                  </mat-tab>

                  <!-- Already Approved -->
                  <mat-tab>
                    <ng-template mat-tab-label>
                      <div class="tab-label">
                        <span>{{ 'already_approved' | translate }}</span>
                        <mat-chip *ngIf="alreadyApprovedCount > 0"
                                  class="count-chip">
                          {{ alreadyApprovedCount }}
                        </mat-chip>
                      </div>
                    </ng-template>
                    <app-case-table
                      [cases]="alreadyApprovedCases"
                      [loading]="loading"
                      [showAssignButton]="false"
                      [showActions]="false"
                      (onAction)="handleCaseAction($event)"
                      (onRefresh)="refreshData()">
                    </app-case-table>
                  </mat-tab>
                </mat-tab-group>
              </div>
            </mat-tab>

            <!-- Available Cases Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <div class="tab-label">
                  <mat-icon>add_task</mat-icon>
                  <span>{{ 'available_cases' | translate }}</span>
                  <mat-chip *ngIf="availableCasesCount > 0"
                            class="count-chip available">
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
  selectedCategoryIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private caseService: CaseService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get assignedToMeCases(): CaseData[] {
    return this.casesData?.my_cases?.categories?.assigned_to_me?.results || [];
  }

  get pendingMyApprovalCases(): CaseData[] {
    return this.casesData?.my_cases?.categories?.pending_my_approval?.results || [];
  }

  get alreadyApprovedCases(): CaseData[] {
    return this.casesData?.my_cases?.categories?.already_approved?.results || [];
  }

  get availableCases(): CaseData[] {
    return this.casesData?.available_cases?.results || [];
  }

  get assignedToMeCount(): number {
    return this.casesData?.my_cases?.categories?.assigned_to_me?.count || 0;
  }

  get pendingMyApprovalCount(): number {
    return this.casesData?.my_cases?.categories?.pending_my_approval?.count || 0;
  }

  get alreadyApprovedCount(): number {
    return this.casesData?.my_cases?.categories?.already_approved?.count || 0;
  }

  get myCasesCount(): number {
    return this.casesData?.my_cases?.total_count || 0;
  }

  get availableCasesCount(): number {
    return this.casesData?.available_cases?.count || 0;
  }

  onCategoryTabChange(event: any): void {
    this.selectedCategoryIndex = event.index;
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
          const errorMessage = this.translationService.instant('failed_to_load_applications');
          this.snackBar.open(errorMessage, this.translationService.instant('close'), {
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
          const successMessage = this.translationService.instant('case_assigned_success', {
            serial: caseData.serial_number
          });
          this.snackBar.open(successMessage, this.translationService.instant('close'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.refreshData();
        },
        error: (error) => {
          console.error('Error assigning case:', error);
          this.loading = false;
          const errorMessage = this.translationService.instant('failed_to_assign');
          this.snackBar.open(errorMessage, this.translationService.instant('close'), {
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
          // Use appropriate name based on current language
          const actionName = this.translationService.getCurrentLanguage() === 'ar' && action.name_ara
            ? action.name_ara
            : action.name;

          const successMessage = this.translationService.instant('action_completed_success', {
            action: actionName
          });
          this.snackBar.open(successMessage, this.translationService.instant('close'), {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.refreshData();
        },
        error: (error) => {
          console.error('Error performing case action:', error);
          this.loading = false;

          const actionName = this.translationService.getCurrentLanguage() === 'ar' && action.name_ara
            ? action.name_ara
            : action.name;

          const errorMessage = this.translationService.instant('failed_to_perform_action', {
            action: actionName
          });
          this.snackBar.open(errorMessage, this.translationService.instant('close'), {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }
}
