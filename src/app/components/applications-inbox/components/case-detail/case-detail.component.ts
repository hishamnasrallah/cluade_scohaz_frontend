// components/applications-inbox/components/case-detail/case-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

import { CaseData } from '../../applications-inbox.component';
import { LookupService } from '../../../../services/lookup.service';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatMenuModule
  ],
  template: `
    <div class="case-detail-overlay" (click)="onOverlayClick($event)">
      <div class="case-detail-container" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="detail-header">
          <div class="header-content">
            <div class="header-info">
              <div class="case-icon">
                <mat-icon>assignment</mat-icon>
              </div>
              <div class="header-text">
                <h2 class="case-title">Case {{ caseData.serial_number }}</h2>
                <p class="case-subtitle">{{ getLookupValue('case_type', caseData.case_type) }}</p>
              </div>
            </div>

            <div class="header-actions">
              <mat-chip [class]="'status-' + getStatusClass(caseData.status)">
                <mat-icon class="chip-icon">{{ getStatusIcon(caseData.status) }}</mat-icon>
                {{ getLookupValue('status', caseData.status) }}
              </mat-chip>

              <button mat-icon-button (click)="onClose.emit()" class="close-btn">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="detail-content">
          <div class="content-grid">

            <!-- Case Information Card -->
            <mat-card class="info-card">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">info</mat-icon>
                  <h3>Case Information</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Serial Number</span>
                    <span class="value">{{ caseData.serial_number }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Case Type</span>
                    <span class="value">{{ getLookupValue('case_type', caseData.case_type) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Status</span>
                    <span class="value">{{ getLookupValue('status', caseData.status) }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.sub_status">
                    <span class="label">Sub Status</span>
                    <span class="value">{{ getLookupValue('sub_status', caseData.sub_status) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Approval Step</span>
                    <span class="value">Step {{ caseData.current_approval_step }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Assigned Group</span>
                    <span class="value">{{ getLookupValue('assigned_group', caseData.assigned_group) }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.assigned_emp">
                    <span class="label">Assigned Employee</span>
                    <span class="value">{{ getLookupValue('assigned_emp', caseData.assigned_emp) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Created Date</span>
                    <span class="value">{{ formatDateTime(caseData.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Last Updated</span>
                    <span class="value">{{ formatDateTime(caseData.updated_at) }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            <!-- Parallel Approval Information Card -->
            <mat-card class="info-card" *ngIf="caseData.approval_info && caseData.approval_info.type === 'parallel'">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">groups</mat-icon>
                  <h3>Parallel Approval Progress</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Approval Type</span>
                    <span class="value">Parallel Approval Required</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Progress</span>
                    <span class="value">
          {{ caseData.approval_info?.current_approvals || 0 }} of
                      {{ caseData.approval_info?.required_approvals || 0 }} approvals
        </span>
                  </div>
                  <div class="info-item" *ngIf="caseData.approval_info?.user_has_approved">
                    <span class="label">Your Status</span>
                    <span class="value">
          <mat-icon class="boolean-true">check_circle</mat-icon>
          You have approved
        </span>
                  </div>
                  <div class="info-item" *ngIf="hasRemainingApprovals()">
                    <span class="label">Remaining</span>
                    <span class="value">{{ caseData.approval_info?.remaining_approvals }} more approval(s) needed</span>
                  </div>
                </div>

                <!-- Approvers List -->
                <div class="approvers-section" *ngIf="hasApprovers()">
                  <h4>Approval History</h4>
                  <div class="approvers-list">
                    <div *ngFor="let approver of getApprovers()" class="approver-item">
                      <mat-icon class="approver-icon">person_check</mat-icon>
                      <div class="approver-details">
                        <span class="approver-name">{{ approver.user }}</span>
                        <span class="approver-info">
          {{ approver.department || 'Unknown Department' }} •
                          {{ formatDateTime(approver.approved_at) }}
        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pending Groups -->
                <div class="pending-groups" *ngIf="hasPendingGroups()">
                  <h4>Pending Approvals From</h4>
                  <div class="groups-list">
                    <mat-chip *ngFor="let group of getPendingGroups()" class="group-chip">
                      <mat-icon class="chip-icon">group</mat-icon>
                      {{ group.name }}
                    </mat-chip>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            <!-- Approval History Card -->
            <mat-card class="info-card" *ngIf="caseData.approval_history && caseData.approval_history.length > 0">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">history</mat-icon>
                  <h3>Approval History</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="approval-history-timeline">
                  <div *ngFor="let step of caseData.approval_history; let i = index" class="history-step">
                    <div class="step-header">
                      <div class="step-info">
                        <span class="step-status">{{ step.approval_step.status }}</span>
                        <span class="step-group">{{ step.approval_step.group }}</span>
                        <mat-chip *ngIf="step.approval_step.type === 'parallel'" class="parallel-indicator">
                          <mat-icon class="chip-icon">groups</mat-icon>
                          Parallel ({{ step.approvals.length }}/{{ step.approval_step.required_approvals || '?' }})
                        </mat-chip>
                      </div>
                    </div>

                    <div class="step-approvals">
                      <div *ngFor="let approval of step.approvals" class="approval-entry">
                        <mat-icon class="approval-icon" [class.approved]="approval.action_taken === 'Approve'">
                          {{ getActionIcon(approval.action_taken) }}
                        </mat-icon>
                        <div class="approval-details">
                          <div class="approval-main">
                            <span class="approver-name">{{ approval.approved_by }}</span>
                            <span class="action-taken" [class]="'action-' + getActionClass(approval.action_taken)">
                              {{ approval.action_taken }}
                            </span>
                          </div>
                          <div class="approval-meta">
                            <span *ngIf="approval.department" class="department">
                              <mat-icon class="meta-icon">business</mat-icon>
                              {{ approval.department }}
                            </span>
                            <span class="approval-time">
                              <mat-icon class="meta-icon">schedule</mat-icon>
                              {{ formatDateTime(approval.approved_at) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="timeline-connector" *ngIf="i < caseData.approval_history.length - 1"></div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            <!-- Applicant Information Card -->
            <mat-card class="info-card" *ngIf="caseData.case_data">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">person</mat-icon>
                  <h3>Applicant Information</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item" *ngIf="caseData.case_data.first_name || caseData.case_data.last_name">
                    <span class="label">Full Name</span>
                    <span class="value">{{ formatApplicantName(caseData.case_data) }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.age">
                    <span class="label">Age</span>
                    <span class="value">{{ caseData.case_data.age }} years</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.gender">
                    <span class="label">Gender</span>
                    <span class="value">{{ getLookupValue('gender', caseData.case_data.gender) }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.salary">
                    <span class="label">Salary</span>
                    <span class="value">{{ formatCurrency(caseData.case_data.salary) }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.tax_percentage">
                    <span class="label">Tax Percentage</span>
                    <span class="value">{{ caseData.case_data.tax_percentage }}%</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.spouse_name">
                    <span class="label">Spouse Name</span>
                    <span class="value">{{ caseData.case_data.spouse_name }}</span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.has_children !== undefined">
                    <span class="label">Has Children</span>
                    <span class="value">
                      <mat-icon [class]="caseData.case_data.has_children ? 'boolean-true' : 'boolean-false'">
                        {{ caseData.case_data.has_children ? 'check_circle' : 'cancel' }}
                      </mat-icon>
                      {{ caseData.case_data.has_children ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="info-item" *ngIf="caseData.case_data.number_of_children">
                    <span class="label">Number of Children</span>
                    <span class="value">{{ caseData.case_data.number_of_children }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Uploaded Files Card -->
            <mat-card class="info-card" *ngIf="caseData.case_data && caseData.case_data.uploaded_files && caseData.case_data.uploaded_files.length > 0">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">attach_file</mat-icon>
                  <h3>Uploaded Files</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="files-grid">
                  <div *ngFor="let file of (caseData.case_data?.uploaded_files || [])" class="file-item">
                    <div class="file-info">
                      <mat-icon class="file-icon">{{ getFileIcon(file.type) }}</mat-icon>
                      <div class="file-details">
                        <span class="file-type">{{ file.type }}</span>
                        <span class="file-name">{{ getFileName(file.file_url) }}</span>
                      </div>
                    </div>
                    <div class="file-actions">
                      <button mat-icon-button
                              (click)="viewFile(file.file_url)"
                              matTooltip="View File"
                              class="file-action-btn">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button
                              (click)="downloadFile(file.file_url)"
                              matTooltip="Download File"
                              class="file-action-btn">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Available Actions Card -->
            <mat-card class="info-card" *ngIf="caseData.available_actions && caseData.available_actions.length > 0">
              <mat-card-header>
                <div class="card-header">
                  <mat-icon class="card-icon">play_arrow</mat-icon>
                  <h3>Available Actions</h3>
                </div>
              </mat-card-header>
              <mat-card-content>
                <div class="actions-grid">
                  <button *ngFor="let action of (caseData.available_actions || [])"
                          mat-raised-button
                          [class]="'action-btn action-' + getActionClass(action.code)"
                          (click)="performAction(action)"
                          [matTooltip]="action.name_ara">
                    <mat-icon>{{ getActionIcon(action.code) }}</mat-icon>
                    {{ action.name }}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

          </div>
        </div>

        <!-- Footer Actions -->
        <div class="detail-footer">
          <div class="footer-info">
            <span class="created-info">
              <mat-icon>schedule</mat-icon>
              Created {{ getRelativeTime(caseData.created_at) }}
            </span>
          </div>

          <div class="footer-actions">
            <button mat-button (click)="onClose.emit()" class="close-footer-btn">
              Close
            </button>

            <button mat-button
                    [matMenuTriggerFor]="moreMenu"
                    class="more-footer-btn">
              <mat-icon>more_horiz</mat-icon>
              More Actions
            </button>

            <mat-menu #moreMenu="matMenu">
              <button mat-menu-item (click)="printCase()">
                <mat-icon>print</mat-icon>
                <span>Print Case</span>
              </button>
              <button mat-menu-item (click)="exportCase()">
                <mat-icon>download</mat-icon>
                <span>Export Case</span>
              </button>
              <button mat-menu-item (click)="viewHistory()">
                <mat-icon>history</mat-icon>
                <span>View History</span>
              </button>
            </mat-menu>
          </div>
        </div>

      </div>
    </div>
  `,
  styleUrl: './case-detail.component.scss'
})
export class CaseDetailComponent implements OnInit {
  @Input() caseData!: CaseData;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<{ case: CaseData; action: any }>();

  // Lookup cache for dynamic display values
  lookupCache: { [key: string]: { [id: number]: string } } = {};

  constructor(private lookupService: LookupService) {}

  ngOnInit(): void {
    this.loadLookupData();
  }

  onOverlayClick(event: Event): void {
    this.onClose.emit();
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

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
      return dateString;
    }
  }

  formatCurrency(amount: number): string {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      return `${Math.ceil(diffDays / 30)} months ago`;
    } catch {
      return '';
    }
  }

  getStatusIcon(status: number): string {
    const iconMap: { [key: number]: string } = {
      11: 'radio_button_checked',
      12: 'pending',
      13: 'check_circle',
      14: 'cancel'
    };
    return iconMap[status] || 'help';
  }

  getStatusClass(status: number): string {
    const classMap: { [key: number]: string } = {
      11: 'active',
      12: 'pending',
      13: 'completed',
      14: 'rejected'
    };
    return classMap[status] || 'default';
  }


  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      'ID Card': 'badge',
      'Passport': 'flight_takeoff',
      'Certificate': 'school',
      'Document': 'description',
      'Photo': 'photo'
    };
    return iconMap[fileType] || 'attach_file';
  }

  getFileName(fileUrl: string): string {
    if (!fileUrl) return '';
    try {
      const urlParts = fileUrl.split('/');
      return urlParts[urlParts.length - 1] || 'File';
    } catch {
      return 'File';
    }
  }

  performAction(action: any): void {
    this.onAction.emit({ case: this.caseData, action });
  }

  viewFile(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  downloadFile(fileUrl: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = this.getFileName(fileUrl);
    link.click();
  }

  printCase(): void {
    window.print();
  }

  exportCase(): void {
    console.log('Export case:', this.caseData);
    // Implementation for exporting case data
  }

  viewHistory(): void {
    console.log('View history:', this.caseData);
    // Implementation for viewing case history
  }

  // Dynamic lookup methods
  loadLookupData(): void {
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
  // Add these methods to the component class
  hasRemainingApprovals(): boolean {
    return (this.caseData?.approval_info?.remaining_approvals ?? 0) > 0;
  }

  hasApprovers(): boolean {
    return (this.caseData?.approval_info?.approvers?.length ?? 0) > 0;
  }

  hasPendingGroups(): boolean {
    return (this.caseData?.approval_info?.pending_groups?.length ?? 0) > 0;
  }

  getApprovers(): any[] {
    return this.caseData?.approval_info?.approvers ?? [];
  }

  getPendingGroups(): any[] {
    return this.caseData?.approval_info?.pending_groups ?? [];
  }
  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'Approve': 'check_circle',
      'Reject': 'cancel',
      'Return to Applicant': 'undo',
      'Submit': 'send',
      'Pending': 'pending'
    };
    return iconMap[action] || 'play_arrow';
  }

  getActionClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'Approve': 'approve',
      'Reject': 'reject',
      'Return to Applicant': 'return',
      'Submit': 'submit',
      'Pending': 'pending'
    };
    return classMap[action] || 'default';
  }
}
