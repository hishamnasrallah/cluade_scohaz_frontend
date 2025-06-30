// components/settings/user-management/user-management.component.ts - COMPLETE IMPLEMENTATION
import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { UserService, CustomUser, Group, UserType, PhoneNumber, UserFilters } from '../../../services/user.service';
import { CrudPermissionsService } from '../../../services/crud-permissions.service';
import { AuthService } from '../../../services/auth.service';

interface PhoneNumberForm {
  phone_number: string;
  number_type: number;
  is_default: boolean;
  main: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatSortModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild('editUserDialog') editUserDialog!: TemplateRef<any>;
  @ViewChild('phoneNumbersDialog') phoneNumbersDialog!: TemplateRef<any>;
  @ViewChild('resetPasswordDialog') resetPasswordDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // State management
  isLoading = false;
  isSaving = false;
  isResettingPassword = false;
  checkingUsername = false;
  showPassword = false;
  showResetPassword = false;
  errorMessage = '';

  // Data
  users: CustomUser[] = [];
  userGroups: Group[] = [];
  userTypes: UserType[] = [];
  phoneNumbers: PhoneNumber[] = [];
  currentUser: CustomUser | null = null;

  // Pagination
  totalUsers = 0;
  currentPage = 0;
  pageSize = 25;

  // Filters
  searchQuery = '';
  statusFilter = 'all';
  userTypeFilter = '';
  groupFilter: number | null = null;

  // Selection
  selection: CustomUser[] = [];

  // Table
  dataSource = new MatTableDataSource<CustomUser>();
  displayedColumns: string[] = ['select', 'user', 'email', 'userType', 'role', 'status', 'lastLogin', 'actions'];

  // Forms
  userForm!: FormGroup;
  phoneForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  // Dialog state
  editingUser: CustomUser | null = null;
  selectedUser: CustomUser | null = null;
  selectedGroups: number[] = [];
  editingPhone: PhoneNumber | null = null;
  addingPhone = false;
  dialogRef: MatDialogRef<any> | null = null;

  // Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Stats
  get activeUsers(): number {
    return this.users.filter(u => u.is_active).length;
  }

  get adminUsers(): number {
    return this.users.filter(u => u.is_staff || u.is_superuser).length;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForms();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // User form
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      second_name: [''],
      third_name: [''],
      last_name: ['', Validators.required],
      user_type_id: [null],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      is_active: [true],
      activated_account: [false],
      is_staff: [false],
      is_developer: [false],
      is_superuser: [false]
    });

    // Phone form
    this.phoneForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      number_type: [2, Validators.required],
      is_default: [false],
      main: [false]
    });

    // Reset password form
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      groups: this.userService.getGroups(),
      userTypes: this.userService.getUserTypes()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userGroups = data.groups;
          this.userTypes = data.userTypes;
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = 'Error loading initial data';
          this.isLoading = false;
        }
      });
  }

  loadUsers(): void {
    const filters: UserFilters = {
      search: this.searchQuery,
      user_type: this.userTypeFilter,
      group: this.groupFilter || undefined,
      page: this.currentPage + 1,
      page_size: this.pageSize,
      ordering: this.sort?.active ? `${this.sort.direction === 'desc' ? '-' : ''}${this.sort.active}` : undefined
    };

    // Apply status filter
    if (this.statusFilter === 'active') {
      filters.is_active = true;
    } else if (this.statusFilter === 'inactive') {
      filters.is_active = false;
    } else if (this.statusFilter === 'admin') {
      // This would need backend support or client-side filtering
    }

    this.userService.getUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.results;
          this.totalUsers = response.count;
          this.dataSource.data = this.users;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Error loading users';
          this.isLoading = false;
        }
      });
  }

  // Search and Filter Methods
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.userTypeFilter = '';
    this.groupFilter = null;
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  // Selection Methods
  toggleSelection(user: CustomUser): void {
    const index = this.selection.findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.selection.splice(index, 1);
    } else {
      this.selection.push(user);
    }
  }

  toggleAllSelection(event: MatCheckboxChange): void {
    if (event.checked) {
      this.selection = [...this.users];
    } else {
      this.selection = [];
    }
  }

  isSelected(user: CustomUser): boolean {
    return this.selection.some(u => u.id === user.id);
  }

  isAllSelected(): boolean {
    return this.selection.length === this.users.length && this.users.length > 0;
  }

  isSomeSelected(): boolean {
    return this.selection.length > 0 && this.selection.length < this.users.length;
  }

  clearSelection(): void {
    this.selection = [];
  }

  // User CRUD Operations
  openCreateUserDialog(): void {
    this.editingUser = null;
    this.userForm.reset({
      is_active: true,
      activated_account: false,
      is_staff: false,
      is_developer: false,
      is_superuser: false
    });
    this.selectedGroups = [];

    // Password is required for new users
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

  editUser(user: CustomUser): void {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      second_name: user.second_name,
      third_name: user.third_name,
      last_name: user.last_name,
      user_type_id: user.user_type?.id || null,
      is_active: user.is_active,
      activated_account: user.activated_account,
      is_staff: user.is_staff,
      is_developer: user.is_developer,
      is_superuser: user.is_superuser
    });

    this.selectedGroups = user.groups?.map(g => g.id) || [];

    // Password is not required for existing users
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

  viewUser(user: CustomUser): void {
    // Navigate to user detail view or open a read-only dialog
    this.snackBar.open(`Viewing ${user.first_name} ${user.last_name}`, 'Close', { duration: 2000 });
  }

  private openDialog(): void {
    this.dialogRef = this.dialog.open(this.editUserDialog, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  saveUser(): void {
    if (!this.userForm.valid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSaving = true;
    const userData = {
      ...this.userForm.value,
      group_ids: this.selectedGroups
    };

    // Remove password if empty (for updates)
    if (!userData.password) {
      delete userData.password;
    }

    const request = this.editingUser?.id
      ? this.userService.updateUser(this.editingUser.id, userData)
      : this.userService.createUser(userData);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.snackBar.open(
            `User ${this.editingUser?.id ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000, panelClass: 'success-snackbar' }
          );
          this.loadUsers();
          this.closeDialog();
          this.isSaving = false;
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.detail || 'Error saving user',
            'Close',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
          this.isSaving = false;
        }
      });
  }

  toggleUserStatus(user: CustomUser): void {
    const action = user.is_active ? 'deactivate' : 'activate';
    const request = user.is_active
      ? this.userService.deactivateUser(user.id!)
      : this.userService.activateUser(user.id!);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `User ${action}d successfully`,
            'Close',
            { duration: 2000, panelClass: 'success-snackbar' }
          );
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(
            `Error ${action}ing user`,
            'Close',
            { duration: 3000, panelClass: 'error-snackbar' }
          );
        }
      });
  }

  deleteUser(user: CustomUser): void {
    if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      this.userService.deleteUser(user.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Error deleting user', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
    }
  }

  // Bulk Operations
  bulkActivate(): void {
    const userIds = this.selection.map(u => u.id!).filter(id => id !== undefined);

    this.userService.bulkActivateUsers(userIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            `${userIds.length} users activated successfully`,
            'Close',
            { duration: 3000, panelClass: 'success-snackbar' }
          );
          this.clearSelection();
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Error activating users', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  bulkDeactivate(): void {
    const userIds = this.selection.map(u => u.id!).filter(id => id !== undefined);

    this.userService.bulkDeactivateUsers(userIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            `${userIds.length} users deactivated successfully`,
            'Close',
            { duration: 3000, panelClass: 'success-snackbar' }
          );
          this.clearSelection();
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Error deactivating users', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  // Password Reset
  resetPassword(user: CustomUser): void {
    this.selectedUser = user;
    this.resetPasswordForm.reset();
    this.dialog.open(this.resetPasswordDialog, {
      width: '500px'
    });
  }

  confirmResetPassword(): void {
    if (!this.resetPasswordForm.valid || !this.selectedUser?.id) return;

    this.isResettingPassword = true;
    const password = this.resetPasswordForm.get('password')?.value;

    this.userService.resetUserPassword(this.selectedUser.id, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Password reset successfully', 'Close', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          this.closeResetPasswordDialog();
          this.isResettingPassword = false;
        },
        error: (error) => {
          this.snackBar.open('Error resetting password', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isResettingPassword = false;
        }
      });
  }

  closeResetPasswordDialog(): void {
    this.dialog.closeAll();
    this.selectedUser = null;
    this.resetPasswordForm.reset();
  }

  // Phone Number Management
  managePhoneNumbers(user: CustomUser): void {
    this.selectedUser = user;
    this.loadPhoneNumbers(user.id!);
    this.dialog.open(this.phoneNumbersDialog, {
      width: '600px'
    });
  }

  private loadPhoneNumbers(userId: number): void {
    this.userService.getUserPhoneNumbers(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (phones) => {
          this.phoneNumbers = phones;
        },
        error: (error) => {
          this.snackBar.open('Error loading phone numbers', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  startAddingPhone(): void {
    this.addingPhone = true;
    this.phoneForm.reset({
      number_type: 2,
      is_default: false,
      main: false
    });
  }

  editPhoneNumber(phone: PhoneNumber): void {
    this.editingPhone = phone;
    this.phoneForm.patchValue(phone);
  }

  savePhoneNumber(): void {
    if (!this.phoneForm.valid || !this.selectedUser?.id) return;

    const phoneData = {
      ...this.phoneForm.value,
      user: this.selectedUser.id
    };

    const request = this.editingPhone?.id
      ? this.userService.updatePhoneNumber(this.editingPhone.id, phoneData)
      : this.userService.addPhoneNumber(phoneData);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Phone number ${this.editingPhone ? 'updated' : 'added'} successfully`,
            'Close',
            { duration: 2000, panelClass: 'success-snackbar' }
          );
          this.loadPhoneNumbers(this.selectedUser!.id!);
          this.cancelPhoneEdit();
        },
        error: (error) => {
          this.snackBar.open('Error saving phone number', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  deletePhoneNumber(phone: PhoneNumber): void {
    if (confirm('Are you sure you want to delete this phone number?')) {
      this.userService.deletePhoneNumber(phone.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Phone number deleted successfully', 'Close', {
              duration: 2000,
              panelClass: 'success-snackbar'
            });
            this.loadPhoneNumbers(this.selectedUser!.id!);
          },
          error: (error) => {
            this.snackBar.open('Error deleting phone number', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
    }
  }

  cancelPhoneEdit(): void {
    this.editingPhone = null;
    this.addingPhone = false;
    this.phoneForm.reset();
  }

  closePhoneDialog(): void {
    this.dialog.closeAll();
    this.selectedUser = null;
    this.phoneNumbers = [];
    this.cancelPhoneEdit();
  }

  // Group Management
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

  // Username Availability Check
  checkUsernameAvailability(): void {
    const username = this.userForm.get('username')?.value;
    if (!username || username === this.editingUser?.username) return;

    this.checkingUsername = true;
    this.userService.checkUsernameAvailability(username, this.editingUser?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (available) => {
          if (!available) {
            this.userForm.get('username')?.setErrors({ notAvailable: true });
          }
          this.checkingUsername = false;
        },
        error: () => {
          this.checkingUsername = false;
        }
      });
  }

  // Export
  exportUsers(): void {
    const filters: UserFilters = {
      search: this.searchQuery,
      user_type: this.userTypeFilter,
      is_active: this.statusFilter === 'active' ? true : this.statusFilter === 'inactive' ? false : undefined,
      group: this.groupFilter || undefined
    };

    this.userService.exportUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.snackBar.open('Error exporting users', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  // Utility Methods
  refreshData(): void {
    this.loadUsers();
  }

  clearError(): void {
    this.errorMessage = '';
    this.userService.clearError();
  }

  getUserInitials(user: CustomUser): string {
    const first = user.first_name?.charAt(0) || '';
    const last = user.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  }

  getUserAvatarColor(user: CustomUser): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    const index = (user.id || 0) % colors.length;
    return colors[index];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString();
  }

  // Validators
  private passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
