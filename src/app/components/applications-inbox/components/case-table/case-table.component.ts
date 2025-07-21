// components/applications-inbox/components/case-table/case-table.component.ts - COMPLETE WITH TRANSLATIONS
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { CaseData } from '../../applications-inbox.component';
import { LookupService } from '../../../../services/lookup.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { CaseDetailComponent } from '../case-detail/case-detail.component';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-case-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    CaseDetailComponent,
    TranslatePipe
  ],
  template: `
    <div class="case-table-container">
      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && (!cases || cases.length === 0)">
        <div class="empty-content">
          <div class="empty-icon">
            <mat-icon>{{ showAssignButton ? 'inbox' : 'assignment' }}</mat-icon>
          </div>
          <h3 class="empty-title">
            {{ showAssignButton ? ('no_available_cases' | translate) : ('no_assigned_cases' | translate) }}
          </h3>
          <p class="empty-message">
            {{ showAssignButton ? ('no_available_cases_desc' | translate) : ('no_assigned_cases_desc' | translate) }}
          </p>
          <button mat-button (click)="onRefresh.emit()" class="refresh-btn">
            <mat-icon>refresh</mat-icon>
            {{ 'refresh' | translate }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>{{ 'loading_cases' | translate }}...</p>
      </div>

      <!-- Cases Table -->
      <div class="table-wrapper" *ngIf="!loading && cases && cases.length > 0">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="cases-table">

            <!-- Serial Number Column -->
            <ng-container matColumnDef="serial_number">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                <div class="header-content">
                  <mat-icon class="header-icon">tag</mat-icon>
                  <span>{{ 'serial_number' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <mat-chip class="serial-chip">{{ case.serial_number }}</mat-chip>
                </div>
              </td>
            </ng-container>

            <!-- Case Type Column -->
            <ng-container matColumnDef="case_type">
              <th mat-header-cell *matHeaderCellDef>
                <div class="header-content">
                  <mat-icon class="header-icon">category</mat-icon>
                  <span>{{ 'case_type' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <span class="lookup-value">{{ getCaseTypeName(case.case_type) }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>
                <div class="header-content">
                  <mat-icon class="header-icon">info</mat-icon>
                  <span>{{ 'status' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <mat-chip [class]="'status-' + getStatusClass(case.status)">
                    {{ getStatusName(case.status) }}
                  </mat-chip>
                  <!-- Parallel Approval Badge -->
                  <mat-chip *ngIf="case.approval_info?.type === 'parallel'"
                            class="parallel-badge"
                            [matTooltip]="getParallelTooltip(case)">
                    <mat-icon class="chip-icon">groups</mat-icon>
                    {{ case.approval_info.current_approvals || 0 }}/{{ case.approval_info.required_approvals || 0 }}
                  </mat-chip>
                  <!-- User Status for Parallel Approvals -->
                  <mat-chip *ngIf="case.ui_status"
                            [class]="'ui-status-' + (case.ui_status_color || 'default')">
                    {{ case.ui_status }}
                  </mat-chip>
                </div>
              </td>
            </ng-container>

            <!-- Applicant Data Column -->
            <ng-container matColumnDef="applicant_info">
              <th mat-header-cell *matHeaderCellDef>
                <div class="header-content">
                  <mat-icon class="header-icon">person</mat-icon>
                  <span>{{ 'applicant' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <div class="applicant-info">
                    <!-- Only show applicant name -->
                    <div class="applicant-name">
                      {{ formatApplicantName(case.case_data) }}
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>
                <div class="header-content">
                  <mat-icon class="header-icon">schedule</mat-icon>
                  <span>{{ 'created' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <div class="date-content">
                    <span class="date-value">{{ formatDate(case.created_at) }}</span>
                    <span class="date-relative">{{ getRelativeTime(case.created_at) }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>
                <div class="header-content">
                  <mat-icon class="header-icon">settings</mat-icon>
                  <span>{{ 'actions' | translate }}</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <!-- Assign Button for Available Cases -->
                  <button mat-raised-button
                          *ngIf="showAssignButton"
                          color="primary"
                          (click)="assignCase(case)"
                          class="assign-btn">
                    <mat-icon>assignment_ind</mat-icon>
                    {{ 'assign_to_me' | translate }}
                  </button>

                  <!-- Action Buttons for My Cases -->
                  <div *ngIf="showActions && case.available_actions" class="action-buttons">
                    <button mat-button
                            *ngFor="let action of case.available_actions"
                            [class]="'action-btn action-' + getActionClass(action.code)"
                            (click)="performAction(case, action)"
                            [matTooltip]="getCurrentLanguage() === 'ar' ? action.name_ara : action.name">
                      <mat-icon>{{ getActionIcon(action.code) }}</mat-icon>
                      {{ getCurrentLanguage() === 'ar' ? action.name_ara : action.name }}
                    </button>
                  </div>

                  <!-- More Actions Menu -->
                  <button mat-icon-button
                          [matMenuTriggerFor]="moreMenu"
                          class="more-btn">
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #moreMenu="matMenu">
                    <button mat-menu-item (click)="viewCase(case)">
                      <mat-icon>visibility</mat-icon>
                      <span>{{ 'view_details' | translate }}</span>
                    </button>
                    <button mat-menu-item (click)="viewHistory(case)">
                      <mat-icon>history</mat-icon>
                      <span>{{ 'view_history' | translate }}</span>
                    </button>
                  </mat-menu>
                </div>
              </td>
            </ng-container>

            <!-- Table Headers and Rows -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row
                *matRowDef="let row; columns: displayedColumns;"
                class="case-row"
                (click)="viewCase(row)"></tr>
          </table>
        </div>

        <!-- Paginator -->
        <mat-paginator #paginator
                       [pageSizeOptions]="[5, 10, 25, 50]"
                       [pageSize]="10"
                       showFirstLastButtons>
        </mat-paginator>
      </div>

      <!-- Case Detail Modal -->
      <app-case-detail
        *ngIf="selectedCase"
        [caseData]="selectedCase"
        (onClose)="closeDetail()"
        (onAction)="handleDetailAction($event)">
      </app-case-detail>
    </div>
  `,
  styleUrl: './case-table.component.scss'
})
export class CaseTableComponent implements OnInit {
  @Input() cases: CaseData[] = [];
  @Input() loading = false;
  @Input() showAssignButton = false;
  @Input() showActions = false;

  @Output() onAssign = new EventEmitter<CaseData>();
  @Output() onAction = new EventEmitter<{ case: CaseData; action: any }>();
  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<CaseData>();
  displayedColumns = ['serial_number', 'case_type', 'status', 'applicant_info', 'created_at', 'actions'];

  // Case detail modal
  selectedCase: CaseData | null = null;

  // Lookup cache for dynamic display values
  lookupCache: { [key: string]: { [id: number]: string } } = {};
  private languageSubscription: any;

  constructor(
    private lookupService: LookupService,
    private translationService: TranslationService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.cases;
    this.loadLookupData();
  }
  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }
  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnChanges(): void {
    this.dataSource.data = this.cases;
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  assignCase(caseData: CaseData): void {
    this.onAssign.emit(caseData);
  }

  performAction(caseData: CaseData, action: any): void {
    this.onAction.emit({ case: caseData, action });
  }

  viewCase(caseData: CaseData): void {
    this.selectedCase = caseData;
  }

  closeDetail(): void {
    this.selectedCase = null;
  }

  handleDetailAction(event: { case: CaseData; action: any }): void {
    // Close detail first
    this.selectedCase = null;
    // Then emit the action to parent
    this.onAction.emit(event);
  }

  viewHistory(caseData: CaseData): void {
    console.log('View history:', caseData);
    // Implementation for viewing case history
  }

  formatApplicantName(caseData: any): string {
    if (!caseData) return this.translationService.instant('unknown_applicant');

    const firstName = caseData.first_name || '';
    const lastName = caseData.last_name || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }

    return this.translationService.instant('unknown_applicant');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const currentLang = this.getCurrentLanguage();

      // Use locale-specific date formatting
      return date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US') +
        ' ' +
        date.toLocaleTimeString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute:'2-digit'
        });
    } catch {
      return dateString;
    }
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Translate relative time
      if (diffDays === 1) return this.translationService.instant('yesterday');
      if (diffDays < 7) return this.translationService.instant('days_ago', { days: diffDays });
      if (diffDays < 30) return this.translationService.instant('weeks_ago', { weeks: Math.ceil(diffDays / 7) });
      return this.translationService.instant('months_ago', { months: Math.ceil(diffDays / 30) });
    } catch {
      return '';
    }
  }

  getActionIcon(actionCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01': 'check_circle',
      '02': 'pending',
      '03': 'cancel',
      '04': 'undo',
      '05': 'send'
    };
    return iconMap[actionCode] || 'play_arrow';
  }

  getActionClass(actionCode: string): string {
    const classMap: { [key: string]: string } = {
      '01': 'approve',
      '02': 'pending',
      '03': 'reject',
      '04': 'return',
      '05': 'submit'
    };
    return classMap[actionCode] || 'default';
  }

  getStatusClass(status: number): string {
    // Map status numbers to CSS classes
    const statusMap: { [key: number]: string } = {
      11: 'active',
      12: 'pending',
      13: 'completed',
      14: 'rejected'
    };
    return statusMap[status] || 'default';
  }

  // Dynamic lookup methods with language support
  loadLookupData(): void {
    // Initialize cache
    this.lookupCache = {};

    // Get unique case types to fetch their service flows
    const caseTypes = [...new Set(this.cases.map(c => c.case_type).filter(id => id))];

    // For each case type, load its service flow and extract lookup fields
    caseTypes.forEach(caseTypeId => {
      this.loadServiceFlowLookups(caseTypeId);
    });

    // Load system lookups
    this.loadSystemLookups();
  }

  private loadServiceFlowLookups(caseTypeId: number): void {
    // First get the service code
    this.apiService.executeApiCall(`lookups/?id=${caseTypeId}`, 'GET').subscribe({
      next: (response: any) => {
        if (response.results && response.results.length > 0) {
          const serviceCode = response.results[0].code;

          // Fetch service flow
          this.apiService.executeApiCall(`dynamic/service_flow/?service=["${serviceCode}"]`, 'GET').subscribe({
            next: (flowResponse: any) => {
              this.processServiceFlowForCases(flowResponse.service_flow, caseTypeId);
            },
            error: (error) => {
              console.error('Failed to load service flow for case type:', caseTypeId, error);
            }
          });
        }
      }
    });
  }

  private processServiceFlowForCases(serviceFlow: any[], caseTypeId: number): void {
    // Extract all lookup fields from service flow
    const lookupFields = new Map<string, number>(); // fieldName -> lookupId

    serviceFlow.forEach(step => {
      step.categories?.forEach((category: any) => {
        category.fields?.forEach((field: any) => {
          if (field.lookup) {
            lookupFields.set(field.name, field.lookup);
          }
        });
      });
    });

    // Process cases of this type
    this.cases
      .filter(c => c.case_type === caseTypeId)
      .forEach(caseData => {
        if (caseData.case_data) {
          Object.entries(caseData.case_data).forEach(([fieldName, value]) => {
            if (lookupFields.has(fieldName) && typeof value === 'number') {
              // Initialize cache for this field if not exists
              if (!this.lookupCache[fieldName]) {
                this.lookupCache[fieldName] = {};
              }

              // Load lookup value if not already cached
              if (!this.lookupCache[fieldName][value]) {
                this.loadLookupValue(fieldName, value);
              }
            }
          });
        }
      });
  }

  private loadSystemLookups(): void {
    // Get unique IDs for system lookups
    const statusIds = [...new Set(this.cases.map(c => c.status).filter(id => id))];
    const assignedGroupIds = [...new Set(this.cases.map(c => c.assigned_group).filter(id => id))];
    const caseTypeIds = [...new Set(this.cases.map(c => c.case_type).filter(id => id))];

    // Initialize caches
    if (!this.lookupCache['status']) this.lookupCache['status'] = {};
    if (!this.lookupCache['assigned_group']) this.lookupCache['assigned_group'] = {};
    if (!this.lookupCache['case_type']) this.lookupCache['case_type'] = {};

    // Load values
    statusIds.forEach(id => this.loadLookupValue('status', id));
    caseTypeIds.forEach(id => this.loadLookupValue('case_type', id));

    // Load assigned groups using proper endpoint
    assignedGroupIds.forEach(id => this.loadGroupInfo(id));
  }

// Add this method
  private loadGroupInfo(groupId: number): void {
    // Try groups endpoint first
    this.apiService.executeApiCall(`auth/groups/${groupId}/`, 'GET').subscribe({
      next: (response: any) => {
        this.lookupCache['assigned_group'][groupId] = response.name || `Group ${groupId}`;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to lookups
        this.loadLookupValue('assigned_group', groupId);
      }
    });
  }

  private loadLookupValue(type: string, id: number): void {
    this.apiService.executeApiCall(`lookups/?id=${id}`, 'GET').subscribe({
      next: (response: any) => {
        if (response.results && response.results.length > 0) {
          const item = response.results[0];
          this.lookupCache[type][id] = this.getCurrentLanguage() === 'ar' && item.name_ara
            ? item.name_ara : item.name;

          // Trigger change detection
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.lookupCache[type][id] = `${type} ${id}`;
      }
    });
  }

  private mapLookupData(data: any[]): { [id: number]: string } {
    const map: { [id: number]: string } = {};
    const currentLang = this.getCurrentLanguage();

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.id) {
          // Use Arabic name if current language is Arabic and it exists
          if (currentLang === 'ar' && item.name_ara) {
            map[item.id] = item.name_ara;
          } else {
            map[item.id] = item.name || `ID: ${item.id}`;
          }
        }
      });
    }
    return map;
  }

  getCaseTypeName(id: number): string {
    if (!this.lookupCache['case_type'] || !id) {
      return this.translationService.instant('unknown_type');
    }
    return this.lookupCache['case_type'][id] || this.translationService.instant('unknown_type');
  }

  getStatusName(id: number): string {
    if (!this.lookupCache['status'] || !id) {
      return this.translationService.instant('unknown_status');
    }
    return this.lookupCache['status'][id] || this.translationService.instant('unknown_status');
  }

  getGenderName(id: number): string {
    if (!this.lookupCache['gender'] || !id) {
      return this.translationService.instant('unknown_gender');
    }
    return this.lookupCache['gender'][id] || this.translationService.instant('unknown_gender');
  }

  getParallelTooltip(caseData: CaseData): string {
    if (!caseData.approval_info || caseData.approval_info.type !== 'parallel') {
      return '';
    }

    const info = caseData.approval_info;
    const approved = info.current_approvals || 0;
    const required = info.required_approvals || 0;
    const remaining = info.remaining_approvals || 0;

    let tooltip = this.translationService.instant('parallel_approval_progress', {
      approved,
      required
    });

    if (info.user_has_approved) {
      tooltip += '\n✓ ' + this.translationService.instant('you_have_approved');
    } else if (info.can_approve) {
      tooltip += '\n⚡ ' + this.translationService.instant('you_can_approve');
    }

    if (remaining > 0) {
      tooltip += '\n⏳ ' + this.translationService.instant('waiting_for_approvals', { remaining });
    }

    return tooltip;
  }
}
