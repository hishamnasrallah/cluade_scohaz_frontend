// components/settings/user-management/user-management.component.ts - ENHANCED THEME
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../services/config.service';

interface User {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  last_login?: string;
  groups?: UserGroup[];
  user_permissions?: Permission[];
  profile?: UserProfile;
}

interface UserGroup {
  id: number;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: string;
}

interface UserProfile {
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  theme?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSortModule
  ],
  template: `
    <div class="user-management">
      <!-- Enhanced Header with Ocean Mint Theme -->
      <div class="page-header">
        <div class="header-gradient-bg"></div>
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">User Management</h1>
            <p class="page-subtitle">Manage user accounts, roles, permissions, and access control</p>
          </div>
          <div class="header-actions">
            <button mat-button class="action-button secondary" (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              <span>Refresh</span>
            </button>
            <button mat-button class="action-button secondary" (click)="openRolesDialog()">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Manage Roles</span>
            </button>
            <button mat-raised-button class="action-button primary" (click)="openCreateUserDialog()">
              <mat-icon>person_add</mat-icon>
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Stats Cards with Ocean Mint Theme -->
      <div class="stats-section">
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon total-icon">
              <mat-icon>people</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ users.length }}</h3>
            <p class="stat-label">Total Users</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon active-icon">
              <mat-icon>person</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ getActiveUsers().length }}</h3>
            <p class="stat-label">Active Users</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon admin-icon">
              <mat-icon>admin_panel_settings</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ getAdminUsers().length }}</h3>
            <p class="stat-label">Administrators</p>
          </div>
        </div>
        <div class="stat-card professional-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon groups-icon">
              <mat-icon>groups</mat-icon>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ userGroups.length }}</h3>
            <p class="stat-label">User Groups</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <div class="loading-content">
          <mat-spinner diameter="48"></mat-spinner>
          <p class="loading-text">Loading users...</p>
        </div>
      </div>

      <!-- Users Content -->
      <div class="users-content" *ngIf="!isLoading">
        <!-- Enhanced Filters -->
        <mat-card class="filters-card professional-card">
          <div class="filters-content">
            <mat-form-field appearance="outline" class="search-field ocean-mint-field">
              <mat-label>Search users</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Name, email, username...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field ocean-mint-field">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="all">All Users</mat-option>
                <mat-option value="active">Active Only</mat-option>
                <mat-option value="inactive">Inactive Only</mat-option>
                <mat-option value="admin">Administrators</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field ocean-mint-field">
              <mat-label>Group</mat-label>
              <mat-select (selectionChange)="filterByGroup($event.value)">
                <mat-option value="all">All Groups</mat-option>
                <mat-option *ngFor="let group of userGroups" [value]="group.id">
                  {{ group.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card>

        <!-- Enhanced Users Table -->
        <mat-card class="users-table-card professional-card">
          <div class="table-wrapper">
            <table mat-table [dataSource]="dataSource" matSort class="users-table">
              <!-- Avatar & Name Column -->
              <ng-container matColumnDef="user">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="username">User</th>
                <td mat-cell *matCellDef="let user" class="user-cell">
                  <div class="user-info">
                    <div class="user-avatar" [style.background]="getUserAvatarColor(user)">
                      <span>{{ getUserInitials(user) }}</span>
                    </div>
                    <div class="user-details">
                      <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                      <div class="user-username">{{ user.username }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="email">Email</th>
                <td mat-cell *matCellDef="let user" class="email-cell">{{ user.email }}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <div class="role-chips">
                    <mat-chip *ngIf="user.is_superuser" class="role-chip superuser">
                      Super Admin
                    </mat-chip>
                    <mat-chip *ngIf="user.is_staff && !user.is_superuser" class="role-chip staff">
                      Staff
                    </mat-chip>
                    <mat-chip *ngFor="let group of user.groups" class="role-chip group">
                      {{ group.name }}
                    </mat-chip>
                    <mat-chip *ngIf="!user.is_staff && !user.is_superuser && (!user.groups || user.groups.length === 0)"
                              class="role-chip user">
                      User
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="is_active">Status</th>
                <td mat-cell *matCellDef="let user">
                  <div class="status-indicator" [class]="user.is_active ? 'active' : 'inactive'">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ user.is_active ? 'Active' : 'Inactive' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Last Login Column -->
              <ng-container matColumnDef="lastLogin">
                <th mat-header-cell *matHeaderCellDef mat-sort-header="last_login">Last Login</th>
                <td mat-cell *matCellDef="let user" class="last-login-cell">
                  {{ formatDate(user.last_login) }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user" class="actions-cell">
                  <button mat-icon-button class="icon-button" (click)="viewUser(user)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button class="icon-button" (click)="editUser(user)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button
                          class="icon-button"
                          (click)="toggleUserStatus(user)"
                          [matTooltip]="user.is_active ? 'Deactivate' : 'Activate'">
                    <mat-icon>{{ user.is_active ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <button mat-icon-button class="icon-button" (click)="resetPassword(user)" matTooltip="Reset Password">
                    <mat-icon>lock_reset</mat-icon>
                  </button>
                  <button mat-icon-button
                          class="icon-button delete"
                          (click)="deleteUser(user)"
                          matTooltip="Delete"
                          [disabled]="user.is_superuser">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="user-row"
                  (click)="viewUser(row)"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]"
                           showFirstLastButtons
                           class="table-paginator"></mat-paginator>
          </div>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="users.length === 0">
          <div class="empty-icon">
            <mat-icon>people</mat-icon>
          </div>
          <h3 class="empty-title">No users found</h3>
          <p class="empty-subtitle">Start by creating your first user account</p>
          <button mat-raised-button class="action-button primary" (click)="openCreateUserDialog()">
            <mat-icon>person_add</mat-icon>
            <span>Create First User</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Create/Edit User Dialog -->
    <ng-template #editUserDialog>
      <div class="dialog-header" mat-dialog-title>
        <mat-icon class="dialog-icon">{{ editingUser?.id ? 'edit' : 'person_add' }}</mat-icon>
        <span>{{ editingUser?.id ? 'Edit' : 'Create' }} User</span>
      </div>
      <mat-dialog-content class="dialog-content">
        <mat-tab-group class="user-tabs" animationDuration="300ms">
          <!-- Basic Information Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">person</mat-icon>
              <span class="tab-label">Basic Info</span>
            </ng-template>

            <form [formGroup]="userForm" class="user-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="first_name">
                  <mat-error *ngIf="userForm.get('first_name')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="last_name">
                  <mat-error *ngIf="userForm.get('last_name')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username">
                  <mat-icon matPrefix>alternate_email</mat-icon>
                  <mat-error *ngIf="userForm.get('username')?.hasError('required')">
                    Username is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                  <mat-icon matPrefix>email</mat-icon>
                  <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="ocean-mint-field" *ngIf="!editingUser?.id">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-icon matPrefix>lock</mat-icon>
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
              </mat-form-field>

              <div class="checkbox-section">
                <mat-checkbox formControlName="is_active" class="styled-checkbox">
                  <span class="checkbox-label">Active User</span>
                  <span class="checkbox-description">User can log in and access the system</span>
                </mat-checkbox>
                <mat-checkbox formControlName="is_staff" class="styled-checkbox">
                  <span class="checkbox-label">Staff Status</span>
                  <span class="checkbox-description">User can access the admin interface</span>
                </mat-checkbox>
                <mat-checkbox formControlName="is_superuser" class="styled-checkbox">
                  <span class="checkbox-label">Superuser Status</span>
                  <span class="checkbox-description">User has all permissions without explicitly assigning them</span>
                </mat-checkbox>
              </div>
            </form>
          </mat-tab>

          <!-- Groups & Permissions Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">security</mat-icon>
              <span class="tab-label">Permissions</span>
            </ng-template>

            <div class="permissions-content">
              <div class="groups-section">
                <h4 class="section-title">User Groups</h4>
                <p class="section-description">Assign user to groups to manage permissions collectively</p>
                <div class="groups-list">
                  <div *ngFor="let group of userGroups" class="permission-item">
                    <mat-checkbox [checked]="isUserInGroup(group.id)"
                                  (change)="toggleUserGroup(group.id, $event.checked)"
                                  class="styled-checkbox">
                      <span class="checkbox-label">{{ group.name }}</span>
                      <span class="permission-count">({{ group.permissions.length }} permissions)</span>
                    </mat-checkbox>
                  </div>
                </div>
              </div>

              <div class="permissions-section" *ngIf="availablePermissions.length > 0">
                <h4 class="section-title">Individual Permissions</h4>
                <p class="section-description">Grant specific permissions to this user</p>
                <div class="permissions-list">
                  <div *ngFor="let permission of availablePermissions" class="permission-item">
                    <mat-checkbox [checked]="hasPermission(permission.id)"
                                  (change)="togglePermission(permission.id, $event.checked)"
                                  class="styled-checkbox">
                      <span class="checkbox-label">{{ permission.name }}</span>
                      <span class="permission-codename">{{ permission.codename }}</span>
                    </mat-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Profile Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">account_circle</mat-icon>
              <span class="tab-label">Profile</span>
            </ng-template>

            <form [formGroup]="profileForm" class="profile-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone">
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Department</mat-label>
                  <input matInput formControlName="department">
                  <mat-icon matPrefix>business</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Position</mat-label>
                  <input matInput formControlName="position">
                  <mat-icon matPrefix>work</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="ocean-mint-field">
                  <mat-label>Timezone</mat-label>
                  <mat-select formControlName="timezone">
                    <mat-option value="UTC">UTC</mat-option>
                    <mat-option value="America/New_York">Eastern Time</mat-option>
                    <mat-option value="America/Chicago">Central Time</mat-option>
                    <mat-option value="America/Denver">Mountain Time</mat-option>
                    <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                    <mat-option value="Europe/London">London</mat-option>
                    <mat-option value="Asia/Dubai">Dubai</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>access_time</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="ocean-mint-field">
                <mat-label>Bio</mat-label>
                <textarea matInput formControlName="bio" rows="4"></textarea>
                <mat-icon matPrefix>description</mat-icon>
                <mat-hint>Brief description about the user</mat-hint>
              </mat-form-field>
            </form>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions" align="end">
        <button mat-button class="dialog-button cancel" mat-dialog-close>Cancel</button>
        <button mat-raised-button
                class="dialog-button primary"
                (click)="saveUser()"
                [disabled]="!userForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingUser?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    /* Enhanced User Management Styles with Ocean Mint Theme */
    .user-management {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: #F4FDFD;
      min-height: 100vh;
    }

    /* Enhanced Page Header */
    .page-header {
      position: relative;
      margin-bottom: 32px;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(47, 72, 88, 0.08);
      border: 1px solid rgba(196, 247, 239, 0.5);
    }

    .header-gradient-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(135deg, #C4F7EF 0%, #B3F0E5 100%);
      opacity: 0.4;
    }

    .header-content {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 32px;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0 0 8px 0;
      font-family: 'Poppins', sans-serif;
    }

    .page-subtitle {
      color: #64748B;
      margin: 0;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* Enhanced Action Buttons */
    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.primary {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(52, 197, 170, 0.25);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 197, 170, 0.35);
        }
      }

      &.secondary {
        background: white;
        color: #34C5AA;
        border: 2px solid #C4F7EF;

        &:hover {
          background: rgba(196, 247, 239, 0.3);
          border-color: #34C5AA;
          transform: translateY(-1px);
        }
      }
    }

    /* Enhanced Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 28px;
      background: white;
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(47, 72, 88, 0.12);

        .stat-icon {
          transform: scale(1.1);
        }
      }
    }

    .stat-icon-wrapper {
      flex-shrink: 0;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: transform 0.3s ease;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &.total-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
      }
      &.active-icon {
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        box-shadow: 0 4px 12px rgba(74, 222, 128, 0.25);
      }
      &.admin-icon {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
      }
      &.groups-icon {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2F4858;
      margin: 0;
      font-family: 'Poppins', sans-serif;
    }

    .stat-label {
      color: #64748B;
      margin: 4px 0 0 0;
      font-size: 0.95rem;
      font-weight: 500;
    }

    /* Professional Cards */
    .professional-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(47, 72, 88, 0.08);
      border: 1px solid rgba(196, 247, 239, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    /* Loading State */
    .loading-section {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .loading-content {
      text-align: center;

      .loading-text {
        margin-top: 24px;
        color: #64748B;
        font-size: 1.1rem;
      }
    }

    /* Users Content */
    .users-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Filters Card */
    .filters-card {
      padding: 24px;
    }

    .filters-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      align-items: end;
    }

    .search-field {
      min-width: 300px;
    }

    .filter-field {
      min-width: 200px;
    }

    /* Ocean Mint Form Fields */
    .ocean-mint-field {
      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: rgba(196, 247, 239, 0.1);
          border-radius: 12px;
        }

        .mat-mdc-form-field-focus-overlay {
          background: transparent;
        }

        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            background: white;
            box-shadow: 0 0 0 3px rgba(52, 197, 170, 0.1);
          }
        }
      }
    }

    /* Users Table */
    .users-table-card {
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      background: transparent;

      ::ng-deep {
        .mat-mdc-header-row {
          background: linear-gradient(135deg, rgba(196, 247, 239, 0.3) 0%, rgba(196, 247, 239, 0.1) 100%);
          border-bottom: 2px solid rgba(52, 197, 170, 0.2);
        }

        .mat-mdc-header-cell {
          font-weight: 600;
          color: #2F4858;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mat-mdc-row {
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);

          &:hover {
            background: rgba(196, 247, 239, 0.15);
            cursor: pointer;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .user-cell {
      padding: 16px 8px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: #2F4858;
      font-size: 0.95rem;
    }

    .user-username {
      color: #64748B;
      font-size: 0.85rem;
    }

    .email-cell {
      color: #64748B;
      font-size: 0.9rem;
    }

    .role-chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .role-chip {
      font-size: 0.75rem;
      padding: 4px 10px;
      height: auto;
      min-height: 24px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.superuser {
        background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
        color: white;
      }
      &.staff {
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        color: white;
      }
      &.group {
        background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        color: white;
      }
      &.user {
        background: linear-gradient(135deg, #64748B 0%, #475569 100%);
        color: white;
      }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      font-weight: 500;

      &.active {
        .status-dot { background: #22C55E; }
        .status-text { color: #16A34A; }
      }

      &.inactive {
        .status-dot { background: #94A3B8; }
        .status-text { color: #64748B; }
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }

    .last-login-cell {
      color: #64748B;
      font-size: 0.9rem;
    }

    .actions-cell {
      padding: 8px;
    }

    .icon-button {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      transition: all 0.2s ease;
      color: #64748B;

      &:hover {
        background: rgba(196, 247, 239, 0.5);
        color: #34C5AA;
        transform: translateY(-1px);
      }

      &.delete:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .table-paginator {
      background: rgba(196, 247, 239, 0.1);
      border-top: 1px solid rgba(196, 247, 239, 0.5);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      width: 100px;
      height: 100px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, rgba(196, 247, 239, 0.3) 0%, rgba(196, 247, 239, 0.1) 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #34C5AA;
      }
    }

    .empty-title {
      font-size: 1.8rem;
      margin: 0 0 12px 0;
      color: #2F4858;
      font-weight: 600;
    }

    .empty-subtitle {
      margin: 0 0 32px 0;
      color: #64748B;
      font-size: 1.1rem;
    }

    /* Enhanced Dialog */
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2F4858;
      margin-bottom: 8px;
    }

    .dialog-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #C4F7EF 0%, #B3F0E5 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34C5AA;
    }

    .dialog-content {
      max-height: 70vh;
      overflow: auto;
      min-width: 700px;
      padding: 20px 0;
    }

    .user-tabs {
      ::ng-deep {
        .mat-mdc-tab-list {
          background: rgba(196, 247, 239, 0.2);
          border-radius: 16px;
          padding: 8px;
          margin-bottom: 24px;
        }

        .mat-mdc-tab {
          min-width: 140px;
          border-radius: 12px;
          margin-right: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(196, 247, 239, 0.3);
          }

          &.mat-mdc-tab-active {
            background: white;
            box-shadow: 0 2px 8px rgba(47, 72, 88, 0.08);
          }
        }

        .mat-mdc-tab-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #2F4858;
        }
      }
    }

    .tab-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .tab-label {
      font-size: 14px;
    }

    .user-form, .profile-form {
      padding: 24px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .checkbox-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 20px 0;
      padding: 20px;
      background: rgba(196, 247, 239, 0.1);
      border-radius: 16px;
      border: 1px solid rgba(196, 247, 239, 0.3);
    }

    .styled-checkbox {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .checkbox-label {
        font-weight: 600;
        color: #2F4858;
        font-size: 0.95rem;
      }

      .checkbox-description {
        color: #64748B;
        font-size: 0.85rem;
        margin-left: 28px;
      }
    }

    .permissions-content {
      padding: 24px 0;
    }

    .groups-section, .permissions-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2F4858;
      margin: 0 0 8px 0;
    }

    .section-description {
      color: #64748B;
      margin: 0 0 20px 0;
      font-size: 0.9rem;
    }

    .groups-list, .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: rgba(196, 247, 239, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(196, 247, 239, 0.3);
    }

    .permission-item {
      padding: 12px;
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(196, 247, 239, 0.15);
      }
    }

    .permission-count, .permission-codename {
      color: #64748B;
      font-size: 0.85rem;
      margin-left: 8px;
    }

    .dialog-actions {
      padding: 16px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      background: rgba(196, 247, 239, 0.1);
      margin: 0 -24px -24px;
    }

    .dialog-button {
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      transition: all 0.3s ease;

      &.cancel {
        color: #64748B;

        &:hover {
          background: rgba(196, 247, 239, 0.2);
          color: #2F4858;
        }
      }

      &.primary {
        background: linear-gradient(135deg, #34C5AA 0%, #2BA99B 100%);
        color: white;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 197, 170, 0.25);
        }

        &:disabled {
          opacity: 0.6;
          transform: none;
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .user-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        padding: 24px 20px;
      }

      .page-title {
        font-size: 2rem;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .filters-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        min-width: auto;
      }
    }

    @media (max-width: 480px) {
      .stats-section {
        grid-template-columns: 1fr;
      }

      .action-button {
        width: 100%;
        justify-content: center;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  @ViewChild('editUserDialog') editUserDialog!: TemplateRef<any>;

  isLoading = false;
  isSaving = false;
  users: User[] = [];
  userGroups: UserGroup[] = [];
  availablePermissions: Permission[] = [];

  dataSource = new MatTableDataSource<User>();
  displayedColumns: string[] = ['user', 'email', 'role', 'status', 'lastLogin', 'actions'];

  // FIX 1: Initialize FormGroup properties with definite assignment assertion
  userForm!: FormGroup;
  profileForm!: FormGroup;
  editingUser: User | null = null;

  selectedGroups: number[] = [];
  selectedPermissions: number[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForms(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      is_active: [true],
      is_staff: [false],
      is_superuser: [false]
    });

    this.profileForm = this.fb.group({
      phone: [''],
      department: [''],
      position: [''],
      timezone: ['UTC'],
      bio: ['']
    });
  }

  private loadData(): void {
    this.isLoading = true;

    // Mock data - replace with actual API calls
    this.loadUsers();
    this.loadUserGroups();
    this.loadPermissions();
  }

  private loadUsers(): void {
    // Mock users data
    this.users = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
        is_staff: true,
        is_superuser: true,
        date_joined: '2024-01-01T00:00:00Z',
        last_login: '2024-06-10T15:30:00Z',
        groups: [],
        profile: {
          department: 'IT',
          position: 'System Administrator'
        }
      },
      {
        id: 2,
        username: 'john.doe',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: '2024-02-15T00:00:00Z',
        last_login: '2024-06-09T14:20:00Z',
        groups: [{ id: 1, name: 'Managers', permissions: [] }],
        profile: {
          department: 'Sales',
          position: 'Sales Manager'
        }
      }
    ];

    this.dataSource.data = this.users;
    this.isLoading = false;
  }

  private loadUserGroups(): void {
    // Mock groups data
    this.userGroups = [
      {
        id: 1,
        name: 'Managers',
        permissions: [
          { id: 1, name: 'Can view users', codename: 'view_user', content_type: 'auth.user' },
          { id: 2, name: 'Can change users', codename: 'change_user', content_type: 'auth.user' }
        ]
      },
      {
        id: 2,
        name: 'Developers',
        permissions: [
          { id: 3, name: 'Can add applications', codename: 'add_application', content_type: 'app.application' },
          { id: 4, name: 'Can change applications', codename: 'change_application', content_type: 'app.application' }
        ]
      }
    ];
  }

  private loadPermissions(): void {
    // Mock permissions data
    this.availablePermissions = [
      { id: 1, name: 'Can view users', codename: 'view_user', content_type: 'auth.user' },
      { id: 2, name: 'Can change users', codename: 'change_user', content_type: 'auth.user' },
      { id: 3, name: 'Can add applications', codename: 'add_application', content_type: 'app.application' },
      { id: 4, name: 'Can change applications', codename: 'change_application', content_type: 'app.application' }
    ];
  }

  openCreateUserDialog(): void {
    this.editingUser = null;
    this.userForm.reset({ is_active: true, is_staff: false, is_superuser: false });
    this.profileForm.reset({ timezone: 'UTC' });
    this.selectedGroups = [];
    this.selectedPermissions = [];

    // For new users, password is required
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.profileForm.patchValue(user.profile || {});

    this.selectedGroups = user.groups?.map(g => g.id) || [];
    this.selectedPermissions = user.user_permissions?.map(p => p.id) || [];

    // For existing users, password is not required
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

  viewUser(user: User): void {
    // Implement user detail view
    this.snackBar.open(`Viewing details for ${user.first_name} ${user.last_name}`, 'Close', { duration: 2000 });
  }

  private openDialog(): void {
    this.dialog.open(this.editUserDialog, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  saveUser(): void {
    if (!this.userForm.valid) return;

    this.isSaving = true;
    const userData = {
      ...this.userForm.value,
      profile: this.profileForm.value,
      groups: this.selectedGroups,
      user_permissions: this.selectedPermissions
    };

    // Mock save operation
    setTimeout(() => {
      if (this.editingUser?.id) {
        // Update existing user
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...userData };
        }
      } else {
        // Create new user
        const newUser: User = {
          ...userData,
          id: this.users.length + 1,
          date_joined: new Date().toISOString()
        };
        this.users.push(newUser);
      }

      this.dataSource.data = this.users;
      this.snackBar.open(
        `User ${this.editingUser?.id ? 'updated' : 'created'} successfully`,
        'Close',
        { duration: 3000 }
      );

      this.dialog.closeAll();
      this.isSaving = false;
    }, 1000);
  }

  toggleUserStatus(user: User): void {
    user.is_active = !user.is_active;
    this.snackBar.open(
      `User ${user.is_active ? 'activated' : 'deactivated'}`,
      'Close',
      { duration: 2000 }
    );
  }

  resetPassword(user: User): void {
    if (confirm(`Reset password for ${user.first_name} ${user.last_name}?`)) {
      this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.dataSource.data = this.users;
      this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
    }
  }

  openRolesDialog(): void {
    this.snackBar.open('Role management functionality coming soon', 'Close', { duration: 3000 });
  }

  refreshData(): void {
    this.loadData();
  }

  // Filter methods
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.dataSource.data = this.users;
    } else if (status === 'active') {
      this.dataSource.data = this.users.filter(u => u.is_active);
    } else if (status === 'inactive') {
      this.dataSource.data = this.users.filter(u => !u.is_active);
    } else if (status === 'admin') {
      this.dataSource.data = this.users.filter(u => u.is_staff || u.is_superuser);
    }
  }

  // FIX 3: Change parameter type to allow both string and number
  filterByGroup(groupId: string | number): void {
    if (groupId === 'all') {
      this.dataSource.data = this.users;
    } else {
      this.dataSource.data = this.users.filter(u =>
        u.groups?.some(g => g.id === Number(groupId))
      );
    }
  }

  // Permission management
  isUserInGroup(groupId: number): boolean {
    return this.selectedGroups.includes(groupId);
  }

  toggleUserGroup(groupId: number, checked: boolean): void {
    if (checked) {
      this.selectedGroups.push(groupId);
    } else {
      this.selectedGroups = this.selectedGroups.filter(id => id !== groupId);
    }
  }

  hasPermission(permissionId: number): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  togglePermission(permissionId: number, checked: boolean): void {
    if (checked) {
      this.selectedPermissions.push(permissionId);
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId);
    }
  }

  // Utility methods
  getActiveUsers(): User[] {
    return this.users.filter(u => u.is_active);
  }

  getAdminUsers(): User[] {
    return this.users.filter(u => u.is_staff || u.is_superuser);
  }

  getUserInitials(user: User): string {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  }

  getUserAvatarColor(user: User): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    const index = user.username.length % colors.length;
    return colors[index];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
}
