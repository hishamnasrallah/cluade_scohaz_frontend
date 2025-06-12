// components/settings/user-management/user-management.component.ts
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
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>User Management</h1>
            <p>Manage user accounts, roles, permissions, and access control</p>
          </div>
          <div class="header-actions">
            <button mat-button (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-button (click)="openRolesDialog()">
              <mat-icon>admin_panel_settings</mat-icon>
              Manage Roles
            </button>
            <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
              <mat-icon>person_add</mat-icon>
              Add User
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon total-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ users.length }}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon active-icon">
            <mat-icon>person</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getActiveUsers().length }}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin-icon">
            <mat-icon>admin_panel_settings</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ getAdminUsers().length }}</h3>
            <p>Administrators</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon groups-icon">
            <mat-icon>groups</mat-icon>
          </div>
          <div class="stat-content">
            <h3>{{ userGroups.length }}</h3>
            <p>User Groups</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-section" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading users...</p>
      </div>

      <!-- Users Content -->
      <div class="users-content" *ngIf="!isLoading">
        <!-- Filters -->
        <mat-card class="filters-card">
          <div class="filters-content">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput (keyup)="applyFilter($event)" placeholder="Name, email, username...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="all">All Users</mat-option>
                <mat-option value="active">Active Only</mat-option>
                <mat-option value="inactive">Inactive Only</mat-option>
                <mat-option value="admin">Administrators</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
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

        <!-- Users Table -->
        <mat-card class="users-table-card">
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
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
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
                  <span>{{ user.is_active ? 'Active' : 'Inactive' }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="last_login">Last Login</th>
              <td mat-cell *matCellDef="let user">
                {{ formatDate(user.last_login) }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user" class="actions-cell">
                <button mat-icon-button (click)="viewUser(user)" matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="editUser(user)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button
                        (click)="toggleUserStatus(user)"
                        [matTooltip]="user.is_active ? 'Deactivate' : 'Activate'">
                  <mat-icon>{{ user.is_active ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <button mat-icon-button (click)="resetPassword(user)" matTooltip="Reset Password">
                  <mat-icon>lock_reset</mat-icon>
                </button>
                <button mat-icon-button
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

          <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
        </mat-card>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="users.length === 0">
          <mat-icon>people</mat-icon>
          <h3>No users found</h3>
          <p>Start by creating your first user account</p>
          <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
            <mat-icon>person_add</mat-icon>
            Create First User
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Dialog -->
    <ng-template #editUserDialog>
      <div mat-dialog-title>{{ editingUser?.id ? 'Edit' : 'Create' }} User</div>
      <mat-dialog-content class="dialog-content">
        <mat-tab-group>
          <!-- Basic Information Tab -->
          <mat-tab label="Basic Info">
            <form [formGroup]="userForm" class="user-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="first_name">
                  <mat-error *ngIf="userForm.get('first_name')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="last_name">
                  <mat-error *ngIf="userForm.get('last_name')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username">
                  <mat-error *ngIf="userForm.get('username')?.hasError('required')">
                    Username is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email">
                  <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                    Please enter a valid email
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" *ngIf="!editingUser?.id">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-error *ngIf="userForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                  Password must be at least 8 characters
                </mat-error>
              </mat-form-field>

              <div class="checkbox-section">
                <mat-checkbox formControlName="is_active">Active User</mat-checkbox>
                <mat-checkbox formControlName="is_staff">Staff Status</mat-checkbox>
                <mat-checkbox formControlName="is_superuser">Superuser Status</mat-checkbox>
              </div>
            </form>
          </mat-tab>

          <!-- Groups & Permissions Tab -->
          <mat-tab label="Permissions">
            <div class="permissions-content">
              <div class="groups-section">
                <h4>User Groups</h4>
                <div class="groups-list">
                  <mat-checkbox *ngFor="let group of userGroups"
                                [checked]="isUserInGroup(group.id)"
                                (change)="toggleUserGroup(group.id, $event.checked)">
                    {{ group.name }}
                    <span class="permission-count">({{ group.permissions.length }} permissions)</span>
                  </mat-checkbox>
                </div>
              </div>

              <div class="permissions-section" *ngIf="availablePermissions.length > 0">
                <h4>Individual Permissions</h4>
                <div class="permissions-list">
                  <mat-checkbox *ngFor="let permission of availablePermissions"
                                [checked]="hasPermission(permission.id)"
                                (change)="togglePermission(permission.id, $event.checked)">
                    {{ permission.name }}
                    <span class="permission-codename">{{ permission.codename }}</span>
                  </mat-checkbox>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Profile Tab -->
          <mat-tab label="Profile">
            <form [formGroup]="profileForm" class="profile-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <input matInput formControlName="department">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Position</mat-label>
                  <input matInput formControlName="position">
                </mat-form-field>

                <mat-form-field appearance="outline">
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
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Bio</mat-label>
                <textarea matInput formControlName="bio" rows="3"></textarea>
              </mat-form-field>
            </form>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
                color="primary"
                (click)="saveUser()"
                [disabled]="!userForm.valid || isSaving">
          <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
          <span *ngIf="!isSaving">{{ editingUser?.id ? 'Update' : 'Create' }}</span>
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .user-management {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-text h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .header-text p {
      color: #64748b;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #f1f5f9;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      &.total-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.active-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
      &.admin-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
      &.groups-icon { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    }

    .stat-content h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .stat-content p {
      color: #64748b;
      margin: 4px 0 0 0;
      font-size: 0.9rem;
    }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-section p {
      margin-top: 16px;
      color: #64748b;
    }

    .users-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .filters-card {
      padding: 20px;
      border-radius: 16px;
    }

    .filters-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      align-items: end;
    }

    .search-field {
      min-width: 300px;
    }

    .users-table-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .users-table {
      width: 100%;
    }

    .user-cell {
      padding: 16px 8px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;
    }

    .user-username {
      color: #64748b;
      font-size: 0.8rem;
    }

    .role-chips {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .role-chip {
      font-size: 0.75rem;
      padding: 4px 8px;
      height: auto;
      min-height: 24px;

      &.superuser { background: #dc2626; color: white; }
      &.staff { background: #f59e0b; color: white; }
      &.group { background: #8b5cf6; color: white; }
      &.user { background: #64748b; color: white; }
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;

      &.active { color: #16a34a; }
      &.inactive { color: #64748b; }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      .status-indicator.active & { background: #16a34a; }
      .status-indicator.inactive & { background: #64748b; }
    }

    .actions-cell {
      padding: 8px;
    }

    .user-row {
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f8fafc;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        color: #94a3b8;
      }

      h3 {
        font-size: 1.5rem;
        margin: 0 0 8px 0;
        color: #334155;
      }

      p {
        margin: 0 0 24px 0;
      }
    }

    .dialog-content {
      max-height: 70vh;
      overflow: auto;
      min-width: 600px;
    }

    .user-form, .profile-form {
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .checkbox-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 16px 0;
    }

    .permissions-content {
      padding: 20px 0;
    }

    .groups-section, .permissions-section {
      margin-bottom: 24px;
    }

    .groups-section h4, .permissions-section h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }

    .groups-list, .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .permission-count, .permission-codename {
      color: #64748b;
      font-size: 0.8rem;
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .user-management {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .dialog-content {
        min-width: 400px;
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
      width: '700px',
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
