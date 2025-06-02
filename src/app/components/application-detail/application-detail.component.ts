// application-detail.component.ts - ENHANCED Professional Resource Management
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { ApiService } from '../../services/api.service';
import { DataFormatterService } from './services/data-formatter.service';
import { FormBuilderService } from './services/form-builder.service';
import { EditModeService } from './services/edit-mode.service';

import { ResourceTableComponent } from './components/resource-table/resource-table.component';
import { ResourceFormComponent } from './components/resource-form/resource-form.component';
import { ResourceDetailComponent } from './components/resource-detail/resource-detail.component';

import { Resource, ResourceField, RelationOption, TableData, convertApiKeysToResourceFields } from './models/resource.model';
import { ApiResponse, ApiEndpoint } from '../../models/api.models';
import { FieldTypeUtils } from './utils/field-type.utils';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    CommonModule,
    TitleCasePipe,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    ResourceTableComponent,
    ResourceFormComponent,
    ResourceDetailComponent
  ],
  template: `
    <div class="app-detail-layout">
      <!-- Enhanced Header Section -->
      <header class="app-header">
        <div class="header-container">
          <!-- Navigation Area -->
          <div class="nav-area">
            <button mat-icon-button
                    (click)="goBack()"
                    class="back-btn"
                    matTooltip="Back to Dashboard"
                    matTooltipPosition="below">
              <mat-icon>arrow_back</mat-icon>
            </button>

            <div class="breadcrumb">
              <span class="breadcrumb-item" (click)="goBack()">
                <mat-icon>home</mat-icon>
                Dashboard
              </span>
              <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
              <span class="breadcrumb-current">{{ appName | titlecase }}</span>
            </div>
          </div>

          <!-- App Info Area -->
          <div class="app-info">
            <div class="app-icon">
              <mat-icon>{{ getAppIcon() }}</mat-icon>
            </div>
            <div class="app-details">
              <h1 class="app-title">{{ appName | titlecase }}</h1>
              <p class="app-subtitle">Application Resource Management</p>
              <div class="app-stats" *ngIf="!loading && resources.length > 0">
                <div class="stat-item">
                  <span class="stat-value">{{ resources.length }}</span>
                  <span class="stat-label">Resources</span>
                </div>
                <div class="stat-separator"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ getTotalEndpoints() }}</span>
                  <span class="stat-label">Endpoints</span>
                </div>
                <div class="stat-separator"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ getActiveResources() }}</span>
                  <span class="stat-label">Active</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Area -->
          <div class="action-area">
            <button mat-icon-button
                    (click)="loadApplicationData()"
                    [disabled]="loading"
                    class="refresh-btn"
                    matTooltip="Refresh Data"
                    matTooltipPosition="below">
              <mat-icon [class.spinning]="loading">refresh</mat-icon>
            </button>

            <button mat-button
                    [matMenuTriggerFor]="actionsMenu"
                    class="actions-btn">
              <mat-icon>more_vert</mat-icon>
              <span>Actions</span>
            </button>

            <mat-menu #actionsMenu="matMenu" class="actions-menu">
              <button mat-menu-item (click)="exportData()">
                <mat-icon>download</mat-icon>
                <span>Export Data</span>
              </button>
              <button mat-menu-item (click)="refreshAll()">
                <mat-icon>refresh</mat-icon>
                <span>Refresh All</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="viewApiDocs()">
                <mat-icon>description</mat-icon>
                <span>API Documentation</span>
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-indicator" [class.active]="loading"></div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading">
          <div class="loading-container">
            <div class="loading-animation">
              <div class="loading-spinner">
                <mat-spinner diameter="60"></mat-spinner>
              </div>
              <div class="loading-dots">
                <div class="dot dot-1"></div>
                <div class="dot dot-2"></div>
                <div class="dot dot-3"></div>
              </div>
            </div>
            <h3 class="loading-title">Loading {{ appName | titlecase }}</h3>
            <p class="loading-subtitle">Fetching application resources and data...</p>
          </div>
        </div>

        <!-- Content Area -->
        <div class="content-area" *ngIf="!loading && resources.length > 0">
          <!-- Resource Tabs -->
          <div class="resource-tabs-container">
            <mat-tab-group class="resource-tabs"
                           animationDuration="400ms"
                           [selectedIndex]="selectedTabIndex"
                           (selectedTabChange)="onTabChange($event)"
                           [backgroundColor]="'primary'">

              <mat-tab *ngFor="let resource of resources; let i = index"
                       [label]="getTabLabel(resource)">

                <!-- Tab Content Template -->
                <ng-template matTabContent>
                  <div class="tab-content-wrapper">
                    <!-- Resource Header -->
                    <div class="resource-header">
                      <div class="resource-info">
                        <div class="resource-icon">
                          <mat-icon>{{ getResourceIcon(resource) }}</mat-icon>
                        </div>
                        <div class="resource-details">
                          <h2 class="resource-title">{{ resource.name | titlecase }}</h2>
                          <p class="resource-description">{{ getResourceDescription(resource) }}</p>
                        </div>
                      </div>

                      <div class="resource-capabilities">
                        <div class="capability"
                             [class.enabled]="resource.canCreate"
                             matTooltip="{{ resource.canCreate ? 'Can Create' : 'Cannot Create' }}">
                          <mat-icon>add</mat-icon>
                          <span>Create</span>
                        </div>
                        <div class="capability"
                             [class.enabled]="resource.canRead"
                             matTooltip="{{ resource.canRead ? 'Can Read' : 'Cannot Read' }}">
                          <mat-icon>visibility</mat-icon>
                          <span>Read</span>
                        </div>
                        <div class="capability"
                             [class.enabled]="resource.canUpdate"
                             matTooltip="{{ resource.canUpdate ? 'Can Update' : 'Cannot Update' }}">
                          <mat-icon>edit</mat-icon>
                          <span>Update</span>
                        </div>
                        <div class="capability"
                             [class.enabled]="resource.canDelete"
                             matTooltip="{{ resource.canDelete ? 'Can Delete' : 'Cannot Delete' }}">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </div>
                      </div>
                    </div>

                    <!-- Resource Content -->
                    <div class="resource-content">
                      <!-- Table View -->
                      <app-resource-table
                              *ngIf="resource.hasListView"
                              [resource]="resource"
                              [data]="resourceData[resource.name] || []"
                              [loading]="loadingData[resource.name] || false"
                              (onCreate)="openCreateDialog(resource)"
                              (onRefresh)="refreshResourceData(resource)"
                              (onView)="viewResourceDetails(resource, $event)"
                              (onEdit)="editResource(resource, $event)"
                              (onDelete)="deleteResource(resource, $event)">
                      </app-resource-table>

                      <!-- No List View -->
                      <div class="no-list-view" *ngIf="!resource.hasListView">
                        <div class="no-list-content">
                          <div class="no-list-icon">
                            <mat-icon>view_list</mat-icon>
                          </div>
                          <h3>List View Not Available</h3>
                          <p>This resource doesn't support list operations, but you can still create new records.</p>

                          <div class="no-list-actions">
                            <button mat-raised-button
                                    color="primary"
                                    *ngIf="resource.canCreate"
                                    (click)="openCreateDialog(resource)"
                                    class="create-new-btn">
                              <mat-icon>add</mat-icon>
                              Create New {{ resource.name | titlecase }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ng-template>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && resources.length === 0">
          <div class="empty-container">
            <div class="empty-animation">
              <div class="empty-circle circle-1"></div>
              <div class="empty-circle circle-2"></div>
              <div class="empty-circle circle-3"></div>
              <div class="empty-icon">
                <mat-icon>folder_open</mat-icon>
              </div>
            </div>

            <h2 class="empty-title">No Resources Found</h2>
            <p class="empty-subtitle">
              This application doesn't have any accessible resources.
              <br>Please check your API configuration or contact your administrator.
            </p>

            <div class="empty-actions">
              <button mat-raised-button
                      color="primary"
                      (click)="goBack()"
                      class="back-to-dashboard">
                <mat-icon>dashboard</mat-icon>
                Back to Dashboard
              </button>
              <button mat-button
                      (click)="loadApplicationData()"
                      class="retry-btn">
                <mat-icon>refresh</mat-icon>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Enhanced Form Modal -->
      <app-resource-form
              *ngIf="showForm"
              [resource]="selectedResource!"
              [editingRecord]="editingRecord"
              [submitting]="submitting"
              [relationOptions]="relationOptions"
              [validationErrors]="formValidationErrors"
              (onSubmit)="handleFormSubmit($event)"
              (onCancel)="closeForm()">
      </app-resource-form>

      <!-- Enhanced Detail Modal -->
      <app-resource-detail
              *ngIf="showDetail"
              [resource]="selectedResource!"
              [record]="detailRecord"
              (onEdit)="editFromDetail($event)"
              (onClose)="closeDetail()">
      </app-resource-detail>

      <!-- Success/Error Notifications -->
      <div class="notification-toast"
           [class.show]="showNotification"
           [class.success]="notificationType === 'success'"
           [class.error]="notificationType === 'error'">
        <div class="notification-content">
          <div class="notification-icon">
            <mat-icon>{{ notificationType === 'success' ? 'check_circle' : 'error' }}</mat-icon>
          </div>
          <div class="notification-text">
            <span class="notification-title">{{ getNotificationTitle() }}</span>
            <span class="notification-message">{{ notificationMessage }}</span>
          </div>
          <button mat-icon-button
                  (click)="hideNotification()"
                  class="notification-close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-detail-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      display: flex;
      flex-direction: column;
    }

    /* Enhanced Header */
    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 32px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 32px;
      align-items: center;
    }

    /* Navigation Area */
    .nav-area {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-btn {
      width: 48px;
      height: 48px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.2);
        transform: translateX(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
      font-weight: 500;

      &:hover {
        color: #667eea;
        background: rgba(102, 126, 234, 0.08);
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .breadcrumb-current {
      color: #334155;
      font-weight: 600;
      padding: 6px 12px;
      background: rgba(102, 126, 234, 0.12);
      border-radius: 8px;
    }

    .breadcrumb-separator {
      color: #cbd5e1;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* App Info Area */
    .app-info {
      display: flex;
      align-items: center;
      gap: 20px;
      min-width: 0;
    }

    .app-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      flex-shrink: 0;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .app-details {
      min-width: 0;
      flex: 1;
    }

    .app-title {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 4px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .app-subtitle {
      color: #64748b;
      margin: 0 0 12px 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .app-stats {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .stat-separator {
      width: 1px;
      height: 32px;
      background: #e2e8f0;
    }

    /* Action Area */
    .action-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .refresh-btn {
      width: 48px;
      height: 48px;
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      border-radius: 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(34, 197, 94, 0.2);
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .actions-btn {
      height: 48px;
      background: rgba(248, 250, 252, 0.8);
      border: 1px solid rgba(226, 232, 240, 0.8);
      color: #64748b;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 20px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.1);
        border-color: rgba(102, 126, 234, 0.3);
        color: #667eea;
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    /* Progress Indicator */
    .progress-indicator {
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: translateX(-100%);
      transition: transform 0.3s ease;

      &.active {
        animation: progressSlide 2s ease-in-out infinite;
      }
    }

    @keyframes progressSlide {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0); }
      100% { transform: translateX(100%); }
    }

    /* Main Content */
    .main-content {
      flex: 1;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 0 32px 32px;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 500px;
      padding: 60px 20px;
    }

    .loading-container {
      text-align: center;
      max-width: 400px;
    }

    .loading-animation {
      position: relative;
      margin-bottom: 32px;
    }

    .loading-spinner {
      position: relative;
      z-index: 2;
    }

    .loading-dots {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      gap: 8px;
      z-index: 1;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: loadingDots 1.5s infinite;

      &.dot-1 { animation-delay: 0s; }
      &.dot-2 { animation-delay: 0.5s; }
      &.dot-3 { animation-delay: 1s; }
    }

    @keyframes loadingDots {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .loading-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .loading-subtitle {
      color: #64748b;
      margin: 0;
      font-size: 1rem;
    }

    /* Content Area */
    .content-area {
      margin-top: 32px;
    }

    .resource-tabs-container {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
    }

    /* Enhanced Tab Styling */
    ::ng-deep .resource-tabs {
      .mat-mdc-tab-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-bottom: 1px solid #e2e8f0;
      }

      .mat-mdc-tab {
        min-width: 160px;
        font-weight: 600;
        text-transform: none;
        opacity: 0.7;
        transition: all 0.3s ease;

        &:hover {
          opacity: 1;
          background: rgba(102, 126, 234, 0.08);
        }
      }

      .mat-mdc-tab.mdc-tab--active {
        opacity: 1;
        color: #667eea;
      }

      .mdc-tab-indicator__content--underline {
        border-color: #667eea;
        border-width: 3px;
        border-radius: 2px;
      }

      .mat-mdc-tab-body-wrapper {
        background: white;
      }
    }

    .tab-content-wrapper {
      padding: 0;
    }

    /* Resource Header */
    .resource-header {
      padding: 32px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
    }

    .resource-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .resource-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .resource-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 4px 0;
    }

    .resource-description {
      color: #64748b;
      margin: 0;
      font-size: 0.9rem;
    }

    .resource-capabilities {
      display: flex;
      gap: 16px;
    }

    .capability {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px;
      border-radius: 10px;
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      transition: all 0.3s ease;
      min-width: 60px;

      &.enabled {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
    }

    /* Resource Content */
    .resource-content {
      min-height: 400px;
    }

    /* No List View */
    .no-list-view {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 60px 40px;
      background: #f8fafc;
    }

    .no-list-content {
      text-align: center;
      max-width: 400px;
    }

    .no-list-icon {
      width: 80px;
      height: 80px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: #94a3b8;

      mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }

    .no-list-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 12px 0;
    }

    .no-list-content p {
      color: #64748b;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .create-new-btn {
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    /* Empty State */
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 600px;
      padding: 60px 20px;
    }

    .empty-container {
      text-align: center;
      max-width: 500px;
    }

    .empty-animation {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 40px;
    }

    .empty-circle {
      position: absolute;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 50%;
      animation: emptyPulse 2s infinite;

      &.circle-1 {
        width: 40px;
        height: 40px;
        top: 40px;
        left: 40px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 70px;
        height: 70px;
        top: 25px;
        left: 25px;
        animation-delay: 0.7s;
      }

      &.circle-3 {
        width: 100px;
        height: 100px;
        top: 10px;
        left: 10px;
        animation-delay: 1.4s;
      }
    }

    .empty-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #94a3b8;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }

    @keyframes emptyPulse {
      0%, 100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
    }

    .empty-title {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 16px 0;
    }

    .empty-subtitle {
      color: #64748b;
      margin: 0 0 40px 0;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .empty-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .back-to-dashboard {
      height: 48px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 24px;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    .retry-btn {
      height: 48px;
      color: #64748b;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-weight: 600;
      padding: 0 24px;
      transition: all 0.3s ease;

      &:hover {
        color: #334155;
        border-color: #cbd5e1;
        background: rgba(248, 250, 252, 0.8);
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    /* Enhanced Notification Toast */
    .notification-toast {
      position: fixed;
      top: 100px;
      right: 24px;
      min-width: 350px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid #e2e8f0;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
      overflow: hidden;

      &.show {
        transform: translateX(0);
        opacity: 1;
      }

      &.success {
        border-left: 4px solid #22c55e;
      }

      &.error {
        border-left: 4px solid #ef4444;
      }
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 20px;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .notification-toast.success & {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .notification-toast.error & {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .notification-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .notification-title {
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;
    }

    .notification-message {
      color: #64748b;
      font-size: 0.85rem;
    }

    .notification-close {
      width: 32px;
      height: 32px;
      color: #94a3b8;
      flex-shrink: 0;

      &:hover {
        color: #64748b;
        background: rgba(148, 163, 184, 0.1);
      }
    }

    /* Actions Menu */
    ::ng-deep .actions-menu {
      .mat-mdc-menu-content {
        padding: 8px;
      }

      .mat-mdc-menu-item {
        border-radius: 8px;
        margin-bottom: 4px;
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
        }

        mat-icon {
          margin-right: 12px;
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .header-container {
        padding: 20px 24px;
        gap: 24px;
      }

      .main-content {
        padding: 0 24px 24px;
      }
    }

    @media (max-width: 1024px) {
      .header-container {
        grid-template-columns: 1fr;
        gap: 20px;
        text-align: center;
      }

      .nav-area {
        justify-content: center;
      }

      .app-info {
        flex-direction: column;
        text-align: center;
      }

      .resource-header {
        flex-direction: column;
        text-align: center;
        gap: 24px;
      }

      .resource-capabilities {
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 16px 20px;
      }

      .main-content {
        padding: 0 20px 20px;
      }

      .app-title {
        font-size: 1.5rem;
      }

      .resource-header {
        padding: 24px 20px;
      }

      .notification-toast {
        right: 16px;
        left: 16px;
        min-width: auto;
      }

      .empty-actions {
        flex-direction: column;
        align-items: center;
      }

      .back-to-dashboard,
      .retry-btn {
        width: 100%;
        max-width: 280px;
      }
    }

    @media (max-width: 480px) {
      .app-stats {
        flex-direction: column;
        gap: 12px;
      }

      .stat-separator {
        width: 80%;
        height: 1px;
      }

      .resource-capabilities {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .capability {
        min-width: auto;
      }
    }
  `]
})
export class ApplicationDetailComponent implements OnInit {
  appName: string = '';
  resources: Resource[] = [];
  loading = true;
  loadingData: { [key: string]: boolean } = {};
  resourceData: { [key: string]: TableData[] } = {};
  apiData: any = null;
  selectedTabIndex = 0;

  // Form state
  showForm = false;
  selectedResource: Resource | null = null;
  editingRecord: any = null;
  submitting = false;
  relationOptions: { [key: string]: RelationOption[] } = {};
  formValidationErrors: any = {};

  // Detail view state
  showDetail = false;
  detailRecord: any = null;

  // Notification state
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dataFormatter: DataFormatterService,
    private formBuilder: FormBuilderService,
    private editModeService: EditModeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appName = params['appName'];
      this.loadApplicationData();
    });
  }

  // Enhanced UI Methods
  getAppIcon(): string {
    const icons = ['apps', 'api', 'cloud', 'storage', 'analytics', 'security'];
    return icons[Math.abs(this.appName.length) % icons.length];
  }

  getTabLabel(resource: Resource): string {
    const count = this.resourceData[resource.name]?.length || 0;
    return count > 0 ? `${resource.name} (${count})` : resource.name;
  }

  getResourceIcon(resource: Resource): string {
    const typeIcons: { [key: string]: string } = {
      'user': 'person',
      'users': 'group',
      'product': 'inventory',
      'products': 'inventory',
      'order': 'receipt',
      'orders': 'receipt',
      'payment': 'payment',
      'payments': 'payment',
      'category': 'category',
      'categories': 'category',
      'file': 'folder',
      'files': 'folder',
      'setting': 'settings',
      'settings': 'settings',
      'log': 'description',
      'logs': 'description'
    };

    return typeIcons[resource.name.toLowerCase()] || 'storage';
  }

  getResourceDescription(resource: Resource): string {
    const count = this.resourceData[resource.name]?.length || 0;
    const actions = [];
    if (resource.canCreate) actions.push('Create');
    if (resource.canRead) actions.push('Read');
    if (resource.canUpdate) actions.push('Update');
    if (resource.canDelete) actions.push('Delete');

    return `${count} record${count !== 1 ? 's' : ''} • ${actions.join(', ')} operations`;
  }

  getTotalEndpoints(): number {
    return this.resources.reduce((total, resource) => total + resource.endpoints.length, 0);
  }

  getActiveResources(): number {
    return this.resources.filter(resource =>
      resource.hasListView || resource.hasDetailView
    ).length;
  }

  getNotificationTitle(): string {
    return this.notificationType === 'success' ? 'Success' : 'Error';
  }

  // Navigation and Actions
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportData(): void {
    this.snackBar.open('Export functionality coming soon!', 'Close', { duration: 3000 });
  }

  refreshAll(): void {
    this.loadApplicationData();
  }

  viewApiDocs(): void {
    this.snackBar.open('API documentation coming soon!', 'Close', { duration: 3000 });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  // Existing methods with enhanced notifications
  public loadApplicationData(): void {
    this.loading = true;

    this.apiService.getApplications().subscribe({
      next: (data) => {
        console.log('🔍 DEBUG: Full API Data received:', data);
        this.apiData = data;
        const endpoints = data.applications?.applications?.[this.appName] || [];
        console.log(`🔍 DEBUG: Endpoints for app "${this.appName}":`, endpoints);
        this.resources = this.processEndpoints(endpoints);
        this.loading = false;

        // Load data for each resource
        this.resources.forEach(resource => {
          if (resource.hasListView) {
            this.loadResourceData(resource);
          }
        });

        this.showSuccessNotification('Application data loaded successfully');
      },
      error: (error) => {
        console.error('❌ Error loading application:', error);
        this.loading = false;
        this.showErrorNotification('Failed to load application data');
      }
    });
  }

  private processEndpoints(endpoints: ApiEndpoint[]): Resource[] {
    const resourceMap = new Map<string, Resource>();

    endpoints.forEach(endpoint => {
      const resourceName = endpoint.name.split('-')[0];

      if (!resourceMap.has(resourceName)) {
        resourceMap.set(resourceName, {
          name: resourceName,
          endpoints: [],
          hasListView: false,
          hasDetailView: false,
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
          fields: [],
          listEndpoint: null,
          detailEndpoint: null
        });
      }

      const resource = resourceMap.get(resourceName)!;
      resource.endpoints.push(endpoint);

      if (endpoint.name.includes('-list')) {
        resource.hasListView = endpoint.methods.includes('GET');
        resource.canCreate = endpoint.methods.includes('POST');
        resource.listEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0) {
          resource.fields = convertApiKeysToResourceFields(endpoint.keys);
        }
      }

      if (endpoint.name.includes('-detail')) {
        resource.hasDetailView = true;
        resource.canRead = endpoint.methods.includes('GET');
        resource.canUpdate = endpoint.methods.includes('PUT') || endpoint.methods.includes('PATCH');
        resource.canDelete = endpoint.methods.includes('DELETE');
        resource.detailEndpoint = endpoint;
        if (endpoint.keys && endpoint.keys.length > 0 && resource.fields.length === 0) {
          resource.fields = convertApiKeysToResourceFields(endpoint.keys);
        }
      }
    });

    const processedResources = Array.from(resourceMap.values());
    console.log('🔍 DEBUG: Processed resources:', processedResources);
    return processedResources;
  }

  private loadResourceData(resource: Resource): void {
    if (!resource.listEndpoint) return;

    this.loadingData[resource.name] = true;
    const path = this.cleanPath(resource.listEndpoint.path);

    this.apiService.executeApiCall(path, 'GET').subscribe({
      next: (response) => {
        this.resourceData[resource.name] = response.results || response || [];
        this.loadingData[resource.name] = false;
      },
      error: (error) => {
        console.error(`❌ Error loading ${resource.name} data:`, error);
        this.resourceData[resource.name] = [];
        this.loadingData[resource.name] = false;
        this.showErrorNotification(`Failed to load ${resource.name} data`);
      }
    });
  }

  refreshResourceData(resource: Resource): void {
    this.loadResourceData(resource);
    this.showSuccessNotification(`${resource.name} data refreshed`);
  }

  openCreateDialog(resource: Resource): void {
    console.log('🔍 DEBUG: Opening create dialog for resource:', resource);
    this.selectedResource = resource;
    this.editingRecord = null;
    this.formValidationErrors = {};
    this.showForm = true;

    this.loadRelationOptionsWithCallback(resource, () => {
      console.log('✅ Relation options loaded for create dialog');
    });

    this.editModeService.exitEditMode();
  }

  editResource(resource: Resource, record: TableData): void {
    console.log('🔍 DEBUG: Opening edit dialog for resource:', resource, 'record:', record);
    this.selectedResource = resource;
    this.editingRecord = record;
    this.formValidationErrors = {};
    this.showForm = true;

    this.loadRelationOptionsWithCallback(resource, () => {
      console.log('✅ Relation options loaded for edit dialog');
    });

    const recordId = record['id'] || record['pk'];
    if (recordId) {
      this.editModeService.initializeEditMode(resource, recordId, {
        loadFreshData: false
      }).subscribe({
        next: (data) => {
          console.log('✅ Edit mode initialized with fresh data:', data);
        },
        error: (error) => {
          console.warn('⚠️ Failed to load fresh data, using existing:', error);
          this.editModeService.setEditData(record);
        }
      });
    } else {
      this.editModeService.setEditData(record);
    }
  }

  private loadRelationOptionsWithCallback(resource: Resource, callback?: () => void): void {
    console.log('🔍 DEBUG: Loading relation options for resource:', resource.name);

    this.relationOptions = {};

    if (!resource.fields || resource.fields.length === 0) {
      console.log('❌ No fields found for resource');
      if (callback) callback();
      return;
    }

    const relationFields = resource.fields.filter(field => this.isRelationField(field));
    if (relationFields.length === 0) {
      console.log('ℹ️ No relation fields found for resource');
      if (callback) callback();
      return;
    }

    let loadedCount = 0;
    const totalCount = relationFields.length;

    console.log(`🔍 DEBUG: Found ${totalCount} relation fields to load`);

    relationFields.forEach(field => {
      console.log(`✅ Loading options for relation field: ${field.name}`);
      this.loadOptionsForField(field, () => {
        loadedCount++;
        console.log(`✅ Loaded ${loadedCount}/${totalCount} relation fields`);

        if (loadedCount === totalCount) {
          console.log('✅ All relation options loaded');
          if (callback) callback();
        }
      });
    });
  }

  private isRelationField(field: ResourceField): boolean {
    if (!field || !field.name) return false;

    if (field.choices && field.choices.length > 0) {
      return false;
    }

    return (
      (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) ||
      (field.relation_type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.relation_type)) ||
      (field.related_model && field.related_model.trim().length > 0) ||
      (field.limit_choices_to && field.limit_choices_to.trim().length > 0) ||
      field.name.endsWith('_id')
    );
  }

  private loadOptionsForField(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading options for field: ${field.name}`);
    console.log(`🔍 DEBUG: Field details:`, {
      name: field.name,
      type: field.type,
      relation_type: field.relation_type,
      related_model: field.related_model,
      limit_choices_to: field.limit_choices_to
    });

    this.relationOptions[field.name] = [];

    if (this.isLookupField(field)) {
      this.loadLookupOptions(field, callback);
    } else if (field.related_model) {
      this.loadRelatedModelOptions(field, callback);
    } else {
      this.loadFallbackOptions(field, callback);
    }
  }

  private isLookupField(field: ResourceField): boolean {
    return field.related_model === 'lookup.lookup' &&
      field.relation_type === 'OneToOneField' &&
      !!field.limit_choices_to &&
      field.limit_choices_to.includes('parent_lookup__name');
  }

  private extractLookupName(field: ResourceField): string {
    if (!field.limit_choices_to) return '';

    try {
      const regex = /['"]parent_lookup__name['"]:\s*['"]([^'"]+)['"]/;
      const match = field.limit_choices_to.match(regex);
      return match ? match[1] : '';
    } catch (error) {
      console.error('❌ Error extracting lookup name:', error);
      return '';
    }
  }

  private loadLookupOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading lookup options for ${field.name}`);

    const lookupName = this.extractLookupName(field);
    if (!lookupName) {
      console.error(`❌ Could not extract lookup name for field: ${field.name}`);
      this.relationOptions[field.name] = [];
      if (callback) callback();
      return;
    }

    const lookupUrl = `/lookups/?name=${encodeURIComponent(lookupName)}`;
    console.log(`🔍 DEBUG: Loading lookup from URL: ${lookupUrl}`);

    this.apiService.executeApiCall(lookupUrl, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Lookup response for ${field.name}:`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'lookup');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} lookup options for ${field.name}`);
        } else {
          console.warn(`⚠️ Lookup response is not an array for ${field.name}`);
          this.relationOptions[field.name] = [];
        }

        if (callback) callback();
      },
      error: (error) => {
        console.error(`❌ Error loading lookup options for ${field.name}:`, error);
        this.relationOptions[field.name] = [];
        if (callback) callback();
      }
    });
  }

  private loadRelatedModelOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading related model options for ${field.name}`);
    console.log(`🔍 DEBUG: Related model: ${field.related_model}`);

    if (!field.related_model) {
      if (callback) callback();
      return;
    }

    const parts = field.related_model.split('.');
    if (parts.length !== 2) {
      console.warn(`❌ Invalid related_model format: ${field.related_model}`);
      if (callback) callback();
      return;
    }

    const [appName, modelName] = parts;

    const possibleUrls = [
      `${appName}/${modelName}/`,
      `/${appName}/${modelName}/`,
      `api/${appName}/${modelName}/`,
      `/api/${appName}/${modelName}/`,
    ];

    console.log(`🔍 DEBUG: Trying URLs for ${field.name}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0, callback);
  }

  private tryLoadFromUrls(field: ResourceField, urls: string[], index: number, callback?: () => void): void {
    if (index >= urls.length) {
      console.error(`❌ All URL patterns failed for ${field.name}`);
      this.relationOptions[field.name] = [];
      if (callback) callback();
      return;
    }

    const url = urls[index];
    console.log(`🔍 DEBUG: Trying URL ${index + 1}/${urls.length}: ${url}`);

    this.apiService.executeApiCall(url, 'GET').subscribe({
      next: (response) => {
        console.log(`✅ Success loading from URL: ${url}`, response);
        const data = response.results || response || [];

        if (Array.isArray(data)) {
          this.relationOptions[field.name] = this.formatOptions(data, 'model');
          console.log(`✅ Loaded ${this.relationOptions[field.name].length} related model options for ${field.name}`);
        } else {
          console.warn(`⚠️ Response is not an array for ${field.name}:`, data);
          this.relationOptions[field.name] = [];
        }

        if (callback) callback();
      },
      error: (error) => {
        console.warn(`⚠️ Failed to load from URL: ${url}`, error);
        this.tryLoadFromUrls(field, urls, index + 1, callback);
      }
    });
  }

  private loadFallbackOptions(field: ResourceField, callback?: () => void): void {
    console.log(`🔍 DEBUG: Loading fallback options for ${field.name}`);

    const baseName = field.name.replace(/_id$/, '').replace(/s$/, '');
    const possibleUrls = [
      `${this.appName}/${baseName}/`,
      `/${this.appName}/${baseName}/`,
      `${this.appName}/${field.name.replace(/_id$/, '')}/`,
      `/${this.appName}/${field.name.replace(/_id$/, '')}/`,
    ];

    console.log(`🔍 DEBUG: Fallback URLs for ${field.name}:`, possibleUrls);
    this.tryLoadFromUrls(field, possibleUrls, 0, callback);
  }

  private formatOptions(data: any[], type: string): RelationOption[] {
    console.log(`🔍 DEBUG: Formatting ${data.length} ${type} options`);

    return data.map(item => {
      const id = item.id || item.pk;
      let display = '';

      if (item.name) display = item.name;
      else if (item.title) display = item.title;
      else if (item.label) display = item.label;
      else if (item.display_name) display = item.display_name;
      else if (item.full_name) display = item.full_name;
      else if (item.first_name && item.last_name) display = `${item.first_name} ${item.last_name}`;
      else if (item.first_name) display = item.first_name;
      else if (item.email) display = item.email;
      else if (item.username) display = item.username;
      else if (item.value) display = item.value;
      else display = `Item #${id}`;

      return {
        id: id,
        display: display || `Item #${id}`
      };
    });
  }

  viewResourceDetails(resource: Resource, record: TableData): void {
    this.selectedResource = resource;
    this.detailRecord = record;
    this.showDetail = true;
  }

  deleteResource(resource: Resource, record: TableData): void {
    const resourceName = FieldTypeUtils.formatColumnName(resource.name);

    if (!confirm(`Are you sure you want to delete this ${resourceName}?\n\nThis action cannot be undone.`)) {
      return;
    }

    const recordId = record['id'] || record['pk'];
    const path = this.cleanPath(resource.detailEndpoint?.path || '', recordId);

    this.apiService.executeApiCall(path, 'DELETE').subscribe({
      next: () => {
        this.showSuccessNotification(`${resourceName} deleted successfully`);
        this.loadResourceData(resource);
      },
      error: (error) => {
        console.error('❌ Error deleting record:', error);
        this.showErrorNotification('Failed to delete record');
      }
    });
  }

  handleFormSubmit(formData: any): void {
    this.submitting = true;
    const resource = this.selectedResource!;

    const isAutoSave = formData._autoSave;
    delete formData._autoSave;

    const preparedData = this.dataFormatter.prepareFormData(formData, resource.fields);

    let path: string;
    let method: string;

    if (this.editingRecord) {
      const recordId = this.editingRecord['id'] || this.editingRecord['pk'];
      path = this.cleanPath(resource.detailEndpoint?.path || '', recordId);
      method = 'PUT';
    } else {
      path = this.cleanPath(resource.listEndpoint?.path || '');
      method = 'POST';
    }

    console.log('🔍 DEBUG: Submitting data:', preparedData);

    this.apiService.executeApiCall(path, method, preparedData).subscribe({
      next: (response) => {
        this.submitting = false;

        if (!isAutoSave) {
          this.showForm = false;
          this.editModeService.exitEditMode();
        }

        this.formValidationErrors = {};

        const action = this.editingRecord ? 'updated' : 'created';
        const message = isAutoSave ?
          `${resource.name} auto-saved` :
          `${resource.name} ${action} successfully`;

        this.showSuccessNotification(message);
        this.loadResourceData(resource);
      },
      error: (error) => {
        this.submitting = false;
        console.error('❌ Error submitting form:', error);

        if (error.status === 400 && error.error) {
          this.handleValidationErrors(error.error);
        } else {
          const action = this.editingRecord ? 'update' : 'create';
          this.showErrorNotification(`Failed to ${action} ${resource.name}`);
        }
      }
    });
  }

  private handleValidationErrors(errors: any): void {
    const errorMessage = this.parseValidationErrors(errors);
    this.showErrorNotification(`Validation failed: ${errorMessage}`);
    this.formValidationErrors = errors;
  }

  private parseValidationErrors(errors: any): string {
    const errorMessages: string[] = [];

    for (const field in errors) {
      if (errors[field]) {
        const fieldLabel = FieldTypeUtils.formatColumnName(field);
        if (Array.isArray(errors[field])) {
          errorMessages.push(`${fieldLabel}: ${errors[field].join(', ')}`);
        } else {
          errorMessages.push(`${fieldLabel}: ${errors[field]}`);
        }
      }
    }

    return errorMessages.join('; ') || 'Please check your input and try again.';
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedResource = null;
    this.editingRecord = null;
    this.formValidationErrors = {};
    this.editModeService.exitEditMode();
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedResource = null;
    this.detailRecord = null;
  }

  editFromDetail(record: TableData): void {
    this.showDetail = false;
    this.editResource(this.selectedResource!, record);
  }

  // Enhanced notification methods
  showSuccessNotification(message: string): void {
    this.notificationType = 'success';
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  showErrorNotification(message: string): void {
    this.notificationType = 'error';
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 7000);
  }

  hideNotification(): void {
    this.showNotification = false;

    setTimeout(() => {
      this.notificationMessage = '';
    }, 300);
  }

  private cleanPath(path: string, id?: any): string {
    let cleanedPath = path;

    if (id) {
      cleanedPath = cleanedPath.replace(/<pk>/, String(id));
    }

    cleanedPath = cleanedPath.replace(/<[^>]+>/g, '');
    cleanedPath = cleanedPath.replace(/\.<format>/, '');
    cleanedPath = cleanedPath.replace(/\.format/, '');
    cleanedPath = cleanedPath.replace('.', '');
    cleanedPath = cleanedPath.replace(/\?\??$/, '');

    return cleanedPath;
  }
}
