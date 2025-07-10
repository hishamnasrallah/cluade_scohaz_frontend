// components/applications-inbox/components/case-table/case-table.component.ts
import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
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
import { CaseDetailComponent } from '../case-detail/case-detail.component';

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
    CaseDetailComponent
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
            {{ showAssignButton ? 'No Available Cases' : 'No Assigned Cases' }}
          </h3>
          <p class="empty-message">
            {{ showAssignButton
            ? 'There are no cases available for assignment at the moment.'
            : "You don\'t have any assigned cases right now." }}
          </p>
          <button mat-button (click)="onRefresh.emit()" class="refresh-btn">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading cases...</p>
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
                  <span>Serial Number</span>
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
                  <span>Case Type</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <span class="lookup-value">{{ getLookupValue('case_type', case.case_type) }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>
                <div class="header-content">
                  <mat-icon class="header-icon">info</mat-icon>
                  <span>Status</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <mat-chip [class]="'status-' + getStatusClass(case.status)">
                    {{ getLookupValue('status', case.status) }}
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
                  <span>Applicant</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <div class="applicant-info">
                    <div class="applicant-name" *ngIf="case.case_data?.first_name || case.case_data?.last_name">
                      {{ formatApplicantName(case.case_data) }}
                    </div>
                    <div class="applicant-details">
                    <span *ngIf="case.case_data?.age" class="detail-item">
                      <mat-icon class="detail-icon">cake</mat-icon>
                      {{ case.case_data.age }} years
                    </span>
                      <span *ngIf="case.case_data?.gender" class="detail-item">
                      <mat-icon class="detail-icon">wc</mat-icon>
                        {{ getLookupValue('gender', case.case_data.gender) }}
                    </span>
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
                  <span>Created</span>
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
                  <span>Actions</span>
                </div>
              </th>
              <td mat-cell *matCellDef="let case">
                <div class="cell-content">
                  <!-- Assign Button for Available Cases -->
                  <button mat-raised-button
                          *ngIf="showAssignButton"
                          color="primary"
                          (click)="assignCase(case)"
                          class="header-actions">
                    <mat-icon>assignment_ind</mat-icon>
                    Assign to Me
                  </button>

                  <!-- Action Buttons for My Cases -->
                  <div *ngIf="showActions && case.available_actions" class="action-buttons">
                    <button mat-button
                            *ngFor="let action of case.available_actions"
                            [class]="'action-btn action-' + getActionClass(action.code)"
                            (click)="performAction(case, action)"
                            [matTooltip]="action.name_ara">
                      <mat-icon>{{ getActionIcon(action.code) }}</mat-icon>
                      {{ action.name }}
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
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="viewHistory(case)">
                      <mat-icon>history</mat-icon>
                      <span>View History</span>
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

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    this.dataSource.data = this.cases;
    this.loadLookupData();
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
    if (!caseData) return 'Unknown';

    const firstName = caseData.first_name || '';
    const lastName = caseData.last_name || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }

    return 'Unknown Applicant';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
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

  // Dynamic lookup methods
  loadLookupData(): void {
    // Load lookup data for dynamic display
    this.lookupService.getCaseTypes().subscribe(data => {
      this.lookupCache['case_type'] = this.mapLookupData(data);
    });

    this.lookupService.getStatuses().subscribe(data => {
      this.lookupCache['status'] = this.mapLookupData(data);
    });

    this.lookupService.getGenders().subscribe(data => {
      this.lookupCache['gender'] = this.mapLookupData(data);
    });
  }

  private mapLookupData(data: any[]): { [id: number]: string } {
    const map: { [id: number]: string } = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.id && item.name) {
          map[item.id] = item.name;
        }
      });
    }
    return map;
  }

  getLookupValue(type: string, id: number): string {
    if (!this.lookupCache[type] || !id) {
      return `ID: ${id}`;
    }
    return this.lookupCache[type][id] || `ID: ${id}`;
  }

  getParallelTooltip(caseData: CaseData): string {
    if (!caseData.approval_info || caseData.approval_info.type !== 'parallel') {
      return '';
    }

    const info = caseData.approval_info;
    const approved = info.current_approvals || 0;
    const required = info.required_approvals || 0;
    const remaining = info.remaining_approvals || 0;

    let tooltip = `Parallel Approval: ${approved} of ${required} approvals received`;

    if (info.user_has_approved) {
      tooltip += '\n✓ You have already approved';
    } else if (info.can_approve) {
      tooltip += '\n⚡ You can approve this case';
    }

    if (remaining > 0) {
      tooltip += `\n⏳ Waiting for ${remaining} more approval(s)`;
    }

    return tooltip;
  }
}
