// components/settings/user-management/user-management.component.ts
import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin, timer, of } from 'rxjs';
import { UserService, CustomUser, Group, UserType, PhoneNumber, UserFilters } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface PhoneNumberForm {
  phone_number: string;
  number_type: number;
  is_default: boolean;
  main: boolean;
}

interface PasswordStrength {
  score: number;
  text: string;
  feedback?: string[];
}
interface FilterPreset {
  id: string;
  name: string;
  filters: UserFilters;
  statusFilter: string;
  userTypeFilter: string;
  groupFilter: number | null;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  adminUsers: number;
  staffUsers: number;
  regularUsers: number;
  usersByType: { [key: string]: number };
  usersByGroup: { [key: string]: number };
}

interface QuickAction {
  icon: string;
  label: string;
  action: (user: CustomUser) => void;
  color?: string;
  disabled?: (user: CustomUser) => boolean;
}

interface ColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
  width?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports:[
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
    MatDividerModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatBadgeModule,
    ScrollingModule,
    DragDropModule,
    MatAutocompleteModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild('editUserDialog') editUserDialog!: TemplateRef<any>;
  @ViewChild('phoneNumbersDialog') phoneNumbersDialog!: TemplateRef<any>;
  @ViewChild('resetPasswordDialog') resetPasswordDialog!: TemplateRef<any>;
  @ViewChild('viewUserDialog') viewUserDialog!: TemplateRef<any>;
  @ViewChild('filterPresetsDialog') filterPresetsDialog!: TemplateRef<any>;
  @ViewChild('compareUsersDialog') compareUsersDialog!: TemplateRef<any>;
  @ViewChild('batchEditDialog') batchEditDialog!: TemplateRef<any>;
  @ViewChild('columnSettingsDialog') columnSettingsDialog!: TemplateRef<any>;
  @ViewChild('groupsOverviewDialog') groupsOverviewDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  viewMode: 'table' | 'grid' = 'table';

  // State management
  isLoading = false;
  isLoadingSkeleton = true;
  isSaving = false;
  isResettingPassword = false;
  checkingUsername = false;
  showPassword = false;
  showResetPassword = false;
  showGeneratedPassword = false;
  errorMessage = '';
  successMessage = '';

  // Statistics
  userStatistics: UserStatistics = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0,
    adminUsers: 0,
    staffUsers: 0,
    regularUsers: 0,
    usersByType: {},
    usersByGroup: {}
  };

  // Data
  users: CustomUser[] = [];
  cachedUsers: Map<number, CustomUser> = new Map();
  userGroups: Group[] = [];
  userTypes: UserType[] = [];
  phoneNumbers: PhoneNumber[] = [];
  currentUser: CustomUser | null = null;

  // Filters
  searchQuery = '';
  statusFilter = 'all';
  userTypeFilter = '';
  groupFilter: number | null = null;
  advancedFilters: any = {};
  filterChips: string[] = [];
  filterPresets: FilterPreset[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalUsers = 0;
  pageSizeOptions = [5, 10, 25, 50, 100];

  // Selection
  selection: CustomUser[] = [];
  compareUsers: CustomUser[] = [];

  // Table columns
  columns: ColumnDefinition[] = [
    { key: 'select', label: 'Select', visible: true, sortable: false },
    { key: 'user', label: 'User', visible: true, sortable: true },
    { key: 'email', label: 'Email', visible: true, sortable: true },
    { key: 'userType', label: 'Type', visible: true, sortable: false },
    { key: 'role', label: 'Role', visible: true, sortable: false },
    { key: 'status', label: 'Status', visible: true, sortable: true },
    { key: 'lastLogin', label: 'Last Login', visible: true, sortable: true },
    { key: 'dateJoined', label: 'Date Joined', visible: false, sortable: true },
    { key: 'actions', label: 'Actions', visible: true, sortable: false }
  ];

  displayedColumns: string[] = [];

  // Quick actions
  quickActions: QuickAction[] = [
    {
      icon: 'visibility',
      label: 'View',
      action: (user) => this.viewUser(user),
      color: 'primary'
    },
    {
      icon: 'edit',
      label: 'Edit',
      action: (user) => this.editUser(user),
      color: 'accent'
    },
    {
      icon: 'content_copy',
      label: 'Copy Details',
      action: (user) => this.copyUserDetails(user)
    },
    {
      icon: 'compare_arrows',
      label: 'Compare',
      action: (user) => this.addToComparison(user),
      disabled: (user) => this.compareUsers.length >= 3
    }
  ];

  // Table
  dataSource = new MatTableDataSource<CustomUser>();

  // Forms
  userForm!: FormGroup;
  phoneForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  profileForm!: FormGroup;
  batchEditForm!: FormGroup;
  filterPresetForm!: FormGroup;

  // Dialog state
  editingUser: CustomUser | null = null;
  selectedUser: CustomUser | null = null;
  selectedGroups: number[] = [];
  editingPhone: PhoneNumber | null = null;
  addingPhone = false;
  dialogRef: MatDialogRef<any> | null = null;

// Password generation
  passwordStrength: PasswordStrength = { score: 0, text: 'Weak' };
  generatedPassword = '';
  suggestedUsernames: string[] = [];

  // Keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault();
          this.openCreateUserDialog();
          break;
        case 'f':
          event.preventDefault();
          this.focusSearch();
          break;
        case 'e':
          event.preventDefault();
          if (this.selection.length === 1) {
            this.editUser(this.selection[0]);
          }
          break;
        case 'p':
          event.preventDefault();
          this.printUsers();
          break;
      }
    }
  }

// Subjects for cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Cache settings
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: Date | null = null;

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
    private cdr: ChangeDetectorRef,
    private clipboard: Clipboard
  ) {
    this.initializeForms();
    this.setupSearch();
    this.loadFilterPresets();
    this.updateDisplayedColumns();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadInitialData();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.saveFilterPresets();
  }

  // Missing method implementations
  resetColumns(): void {
    // Reset to default column configuration
    this.columns = [
      { key: 'select', label: 'Select', visible: true, sortable: false },
      { key: 'user', label: 'User', visible: true, sortable: true },
      { key: 'email', label: 'Email', visible: true, sortable: true },
      { key: 'userType', label: 'Type', visible: true, sortable: false },
      { key: 'role', label: 'Role', visible: true, sortable: false },
      { key: 'status', label: 'Status', visible: true, sortable: true },
      { key: 'lastLogin', label: 'Last Login', visible: true, sortable: true },
      { key: 'dateJoined', label: 'Date Joined', visible: false, sortable: true },
      { key: 'actions', label: 'Actions', visible: true, sortable: false }
    ];
    this.updateDisplayedColumns();
  }

  importUsers(): void {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.handleFileImport(file);
      }
    };

    input.click();
  }

  private handleFileImport(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Process imported data
        this.processImportedUsers(jsonData);
      } catch (error) {
        this.snackBar.open('Error importing file', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    };

    reader.readAsBinaryString(file);
  }

  private processImportedUsers(users: any[]): void {
    // Validate and process imported users
    const validUsers = users.filter(user =>
      user.username && user.email && user.first_name && user.last_name
    );

    if (validUsers.length === 0) {
      this.snackBar.open('No valid users found in file', 'Close', {
        duration: 3000,
        panelClass: 'warning-snackbar'
      });
      return;
    }

    // In a real app, this would be a bulk import endpoint
    this.snackBar.open(`Importing ${validUsers.length} users...`, 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });

    // Simulate import process
    setTimeout(() => {
      this.loadUsers();
      this.snackBar.open(`Successfully imported ${validUsers.length} users`, 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    }, 2000);
  }

  selectAllGroups(): void {
    if (this.selectedGroups.length === this.userGroups.length) {
      this.selectedGroups = [];
    } else {
      this.selectedGroups = this.userGroups.map(g => g.id);
    }
  }

  viewUserActivity(user: CustomUser): void {
    // Navigate to user activity log or open dialog
    this.snackBar.open('User activity log feature coming soon', 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });
  }

  openGroupsOverview(): void {
    this.dialog.open(this.groupsOverviewDialog, {
      width: '800px',
      maxHeight: '90vh',
      panelClass: 'ocean-mint-dialog'
    });
  }

  bulkAssignGroup(): void {
    // Open dialog to assign group to selected users
    this.snackBar.open('Bulk assign group feature coming soon', 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });
  }

  // Groups Overview Methods
  getTotalUsersInGroups(): number {
    // Calculate total unique users across all groups
    const uniqueUserIds = new Set<number>();
    this.users.forEach(user => {
      if (user.groups && user.groups.length > 0) {
        uniqueUserIds.add(user.id!);
      }
    });
    return uniqueUserIds.size;
  }

  getTotalPermissions(): number {
    // Calculate total unique permissions across all groups
    const uniquePermissions = new Set<string>();
    this.userGroups.forEach(group => {
      if (group.permissions) {
        group.permissions.forEach(perm => {
          uniquePermissions.add(perm.codename);
        });
      }
    });
    return uniquePermissions.size;
  }

  getUserCountInGroup(groupId: number): number {
    return this.users.filter(user =>
      user.groups && user.groups.some(g => g.id === groupId)
    ).length;
  }

  viewGroupDetails(group: Group): void {
    // Navigate to group details or open detailed view
    this.snackBar.open(`Viewing details for ${group.name}`, 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });
  }

  editGroup(group: Group): void {
    // Open group edit dialog
    this.snackBar.open(`Editing ${group.name}`, 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });
  }

  createGroup(): void {
    // Open create group dialog
    this.snackBar.open('Create group functionality would open here', 'Close', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });
    this.dialog.closeAll();
  }

  bulkExport(): void {
    // Export selected users
    const selectedData = this.selection.map(user => ({
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      type: user.user_type?.name || 'N/A',
      status: user.is_active ? 'Active' : 'Inactive',
      last_login: this.formatDate(user.last_login)
    }));

    const ws = XLSX.utils.json_to_sheet(selectedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Users');
    XLSX.writeFile(wb, `selected_users_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  bulkDelete(): void {
    if (confirm(`Are you sure you want to delete ${this.selection.length} users?`)) {
      const userIds = this.selection.map(u => u.id!).filter(id => id !== undefined);

      // In a real app, this would be a bulk delete endpoint
      this.snackBar.open(`Deleting ${userIds.length} users...`, 'Close', {
        duration: 2000,
        panelClass: 'info-snackbar'
      });

      setTimeout(() => {
        this.clearSelection();
        this.loadUsers();
        this.snackBar.open('Users deleted successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      }, 2000);
    }
  }

  private initializeForms(): void {
    // Enhanced user form with better validation
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_]{3,30}$/),
        this.usernameValidator.bind(this)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailDomainValidator
      ]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      second_name: [''],
      third_name: [''],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      user_type_id: [null],
      password: ['', this.getPasswordValidators()],
      is_active: [true],
      activated_account: [false],
      is_staff: [false],
      is_developer: [false],
      is_superuser: [false]
    });

    // Enhanced phone form
    this.phoneForm = this.fb.group({
      phone_number: ['', [
        Validators.required,
        Validators.pattern(/^\+?[0-9\s\-\(\)]{10,}$/),
        this.phoneNumberValidator
      ]],
      number_type: [2, Validators.required],
      is_default: [false],
      main: [false]
    });

    // Profile form
    this.profileForm = this.fb.group({
      phone: ['', Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)],
      department: ['', Validators.maxLength(100)],
      position: ['', Validators.maxLength(100)],
      timezone: ['UTC'],
      bio: ['', Validators.maxLength(500)]
    });

    // Reset password form
    this.resetPasswordForm = this.fb.group({
      password: ['', this.getPasswordValidators()],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Batch edit form
    this.batchEditForm = this.fb.group({
      is_active: [null],
      user_type_id: [null],
      is_staff: [null],
      is_developer: [null],
      groups: [[]]
    });

    // Filter preset form
    this.filterPresetForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  // Enhanced validators
  private getPasswordValidators() {
    return [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(128),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-])[A-Za-z\d@$!%*?&#^()_+=\-]/)
    ];
  }

  private usernameValidator(control: AbstractControl): { [key: string]: any } | null {
    const username = control.value;
    if (!username) return null;

    // Check for reserved usernames
    const reserved = ['admin', 'root', 'system', 'user', 'test'];
    if (reserved.includes(username.toLowerCase())) {
      return { reserved: true };
    }

    return null;
  }

  private emailDomainValidator(control: AbstractControl): { [key: string]: any } | null {
    const email = control.value;
    if (!email) return null;

    // Check for disposable email domains
    const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
    const domain = email.split('@')[1];

    if (domain && disposableDomains.includes(domain)) {
      return { disposableEmail: true };
    }

    return null;
  }

  private phoneNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    const phone = control.value;
    if (!phone) return null;

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { invalidLength: true };
    }

    return null;
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
    this.isLoadingSkeleton = true;

    // Simulate skeleton loading for better UX
    timer(800).subscribe(() => {
      forkJoin({
        groups: this.userService.getGroups(),
        userTypes: this.userService.getUserTypes()
      }).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.userGroups = data.groups;
            this.userTypes = data.userTypes;
            this.loadUsers();
            this.isLoadingSkeleton = false;
          },
          error: (error) => {
            this.errorMessage = 'Error loading initial data';
            this.isLoadingSkeleton = false;
          }
        });
    });
  }

  // Load user statistics
  private loadStatistics(): void {
    // This would ideally come from a dedicated endpoint
    // For now, we'll calculate from the loaded users
    this.calculateStatistics();
  }

  private calculateStatistics(): void {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.userStatistics = {
      totalUsers: this.totalUsers,
      activeUsers: this.users.filter(u => u.is_active).length,
      inactiveUsers: this.users.filter(u => !u.is_active).length,
      newUsersThisMonth: this.users.filter(u =>
        u.date_joined && new Date(u.date_joined) >= thisMonth
      ).length,
      adminUsers: this.users.filter(u => u.is_superuser).length,
      staffUsers: this.users.filter(u => u.is_staff && !u.is_superuser).length,
      regularUsers: this.users.filter(u => !u.is_staff && !u.is_superuser).length,
      usersByType: {},
      usersByGroup: {}
    };

    // Calculate by type
    this.users.forEach(user => {
      if (user.user_type) {
        const typeName = user.user_type.name;
        this.userStatistics.usersByType[typeName] =
          (this.userStatistics.usersByType[typeName] || 0) + 1;
      }
    });

    // Calculate by group
    this.users.forEach(user => {
      if (user.groups) {
        user.groups.forEach(group => {
          this.userStatistics.usersByGroup[group.name] =
            (this.userStatistics.usersByGroup[group.name] || 0) + 1;
        });
      }
    });
  }

  loadUsers(useCache = true): void {
    // Check cache first
    if (useCache && this.shouldUseCache()) {
      this.dataSource.data = Array.from(this.cachedUsers.values());
      this.calculateStatistics();
      return;
    }

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
      // Client-side filtering for admin status
    }


    this.isLoading = true;
    this.userService.getUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.results;
          this.totalUsers = response.count;
          this.dataSource.data = this.users;
          this.updateCache(this.users);
          this.calculateStatistics();
          this.isLoading = false;
          this.updateFilterChips();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Error loading users';
          this.isLoading = false;
        }
      });
  }

  private shouldUseCache(): boolean {
    if (!this.lastCacheUpdate) return false;

    const now = new Date().getTime();
    const lastUpdate = this.lastCacheUpdate.getTime();

    return (now - lastUpdate) < this.cacheTimeout;
  }

  private updateCache(users: CustomUser[]): void {
    this.cachedUsers.clear();
    users.forEach(user => {
      if (user.id) {
        this.cachedUsers.set(user.id, user);
      }
    });
    this.lastCacheUpdate = new Date();
  }

  // Enhanced search with advanced filters
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadUsers(false);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.userTypeFilter = '';
    this.groupFilter = null;
    this.advancedFilters = {};
    this.applyFilters();
  }

  // Filter chips
  private updateFilterChips(): void {
    this.filterChips = [];

    if (this.searchQuery) {
      this.filterChips.push(`Search: ${this.searchQuery}`);
    }

    if (this.statusFilter !== 'all') {
      this.filterChips.push(`Status: ${this.statusFilter}`);
    }

    if (this.userTypeFilter) {
      const type = this.userTypes.find(t => t.code === this.userTypeFilter);
      if (type) {
        this.filterChips.push(`Type: ${type.name}`);
      }
    }

    if (this.groupFilter) {
      const group = this.userGroups.find(g => g.id === this.groupFilter);
      if (group) {
        this.filterChips.push(`Group: ${group.name}`);
      }
    }
  }

  removeFilterChip(chip: string): void {
    if (chip.startsWith('Search:')) {
      this.searchQuery = '';
    } else if (chip.startsWith('Status:')) {
      this.statusFilter = 'all';
    } else if (chip.startsWith('Type:')) {
      this.userTypeFilter = '';
    } else if (chip.startsWith('Group:')) {
      this.groupFilter = null;
    }

    this.applyFilters();
  }

  // Filter presets
  openFilterPresets(): void {
    this.dialog.open(this.filterPresetsDialog, {
      width: '400px',
      panelClass: 'ocean-mint-dialog'
    });
  }

  saveFilterPreset(): void {
    if (!this.filterPresetForm.valid) return;

    const preset: FilterPreset = {
      id: this.generateId(),
      name: this.filterPresetForm.value.name,
      filters: {
        search: this.searchQuery,
        user_type: this.userTypeFilter,
        group: this.groupFilter || undefined
      },
      statusFilter: this.statusFilter,
      userTypeFilter: this.userTypeFilter,
      groupFilter: this.groupFilter
    };

    this.filterPresets.push(preset);
    this.saveFilterPresets();
    this.filterPresetForm.reset();

    this.snackBar.open('Filter preset saved', 'Close', {
      duration: 2000,
      panelClass: 'success-snackbar'
    });
  }

  applyFilterPreset(preset: FilterPreset): void {
    this.searchQuery = preset.filters.search || '';
    this.statusFilter = preset.statusFilter;
    this.userTypeFilter = preset.userTypeFilter;
    this.groupFilter = preset.groupFilter;

    this.applyFilters();
    this.dialog.closeAll();
  }

  deleteFilterPreset(preset: FilterPreset): void {
    const index = this.filterPresets.findIndex(p => p.id === preset.id);
    if (index > -1) {
      this.filterPresets.splice(index, 1);
      this.saveFilterPresets();
    }
  }

  private loadFilterPresets(): void {
    const saved = localStorage.getItem('userFilterPresets');
    if (saved) {
      this.filterPresets = JSON.parse(saved);
    }
  }

  private saveFilterPresets(): void {
    localStorage.setItem('userFilterPresets', JSON.stringify(this.filterPresets));
  }

  // View mode toggle
  toggleViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
    if (mode === 'grid' && this.users.length === 0) {
      this.loadUsers();
    }
  }

  // Column settings
  openColumnSettings(): void {
    this.dialog.open(this.columnSettingsDialog, {
      width: '400px',
      panelClass: 'ocean-mint-dialog'
    });
  }

  toggleColumnVisibility(column: ColumnDefinition): void {
    column.visible = !column.visible;
    this.updateDisplayedColumns();
  }

  reorderColumns(event: CdkDragDrop<ColumnDefinition[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    this.updateDisplayedColumns();
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = this.columns
      .filter(col => col.visible)
      .map(col => col.key);
  }

  // Quick actions
  executeQuickAction(action: QuickAction, user: CustomUser, event: Event): void {
    event.stopPropagation();
    if (!action.disabled || !action.disabled(user)) {
      action.action(user);
    }
  }

  // User comparison
  addToComparison(user: CustomUser): void {
    if (this.compareUsers.length >= 3) {
      this.snackBar.open('Maximum 3 users can be compared', 'Close', {
        duration: 2000,
        panelClass: 'warning-snackbar'
      });
      return;
    }

    if (!this.compareUsers.find(u => u.id === user.id)) {
      this.compareUsers.push(user);
      this.snackBar.open('User added to comparison', 'Close', {
        duration: 1500,
        panelClass: 'info-snackbar'
      });
    }
  }

  removeFromComparison(user: CustomUser): void {
    const index = this.compareUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.compareUsers.splice(index, 1);
    }
  }

  openComparisonView(): void {
    if (this.compareUsers.length < 2) {
      this.snackBar.open('Select at least 2 users to compare', 'Close', {
        duration: 2000,
        panelClass: 'warning-snackbar'
      });
      return;
    }

    this.dialog.open(this.compareUsersDialog, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'ocean-mint-dialog'
    });
  }

  clearComparison(): void {
    this.compareUsers = [];
  }

  // Batch operations
  openBatchEdit(): void {
    if (this.selection.length === 0) {
      this.snackBar.open('Select users to edit', 'Close', {
        duration: 2000,
        panelClass: 'warning-snackbar'
      });
      return;
    }

    this.batchEditForm.reset();
    this.dialog.open(this.batchEditDialog, {
      width: '500px',
      panelClass: 'ocean-mint-dialog'
    });
  }

  applyBatchEdit(): void {
    const updates = this.batchEditForm.value;
    const hasUpdates = Object.values(updates).some(v => v !== null && v !== undefined);

    if (!hasUpdates) {
      this.snackBar.open('No changes to apply', 'Close', {
        duration: 2000,
        panelClass: 'warning-snackbar'
      });
      return;
    }

    // In a real app, this would be a bulk update endpoint
    const updatePromises = this.selection.map(user => {
      const userUpdates: any = { ...user };

      if (updates.is_active !== null) userUpdates.is_active = updates.is_active;
      if (updates.user_type_id !== null) userUpdates.user_type_id = updates.user_type_id;
      if (updates.is_staff !== null) userUpdates.is_staff = updates.is_staff;
      if (updates.is_developer !== null) userUpdates.is_developer = updates.is_developer;

      return this.userService.updateUser(user.id!, userUpdates);
    });

    forkJoin(updatePromises).subscribe({
      next: () => {
        this.snackBar.open(`${this.selection.length} users updated`, 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.clearSelection();
        this.loadUsers();
        this.dialog.closeAll();
      },
      error: () => {
        this.snackBar.open('Error updating users', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  // Copy user details
  copyUserDetails(user: CustomUser): void {
    const details = `
Name: ${user.first_name} ${user.second_name || ''} ${user.third_name || ''} ${user.last_name}
Username: @${user.username}
Email: ${user.email}
Type: ${user.user_type?.name || 'N/A'}
Status: ${user.is_active ? 'Active' : 'Inactive'}
Role: ${this.getUserRole(user)}
Joined: ${this.formatDate(user.date_joined)}
Last Login: ${this.formatDate(user.last_login)}
    `.trim();

    this.clipboard.copy(details);
    this.snackBar.open('User details copied to clipboard', 'Close', {
      duration: 2000,
      panelClass: 'success-snackbar'
    });
  }

  // Password generator
  generatePassword(): void {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&#^()_+=';
    let password = '';

    // Ensure at least one of each required character type
    password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz');
    password += this.getRandomChar('0123456789');
    password += this.getRandomChar('@$!%*?&#^()_+=');

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    this.generatedPassword = password.split('').sort(() => 0.5 - Math.random()).join('');
    this.userForm.patchValue({ password: this.generatedPassword });
    this.showGeneratedPassword = true;
    this.checkPasswordStrength();
  }

  private getRandomChar(charset: string): string {
    return charset.charAt(Math.floor(Math.random() * charset.length));
  }

  copyGeneratedPassword(): void {
    this.clipboard.copy(this.generatedPassword);
    this.snackBar.open('Password copied to clipboard', 'Close', {
      duration: 2000,
      panelClass: 'success-snackbar'
    });
  }

  // Username suggestions
  generateUsernameSuggestions(): void {
    const firstName = this.userForm.get('first_name')?.value || '';
    const lastName = this.userForm.get('last_name')?.value || '';

    if (!firstName || !lastName) return;

    this.suggestedUsernames = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}${lastName.charAt(0).toLowerCase()}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
    ];

    // Check availability for each suggestion
    this.suggestedUsernames.forEach((username, index) => {
      this.userService.checkUsernameAvailability(username).subscribe(available => {
        if (!available) {
          this.suggestedUsernames[index] = `${username}${Math.floor(Math.random() * 100)}`;
        }
      });
    });
  }

  selectSuggestedUsername(username: string): void {
    this.userForm.patchValue({ username });
    this.suggestedUsernames = [];
  }

  // Print functionality
  printUsers(): void {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #34C5AA; color: white; }
        h2 { color: #2F4858; }
        .header { margin-bottom: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
      <div class="header">
        <h2>User Management Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Users: ${this.totalUsers}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          ${this.users.map(user => `
            <tr>
              <td>${user.first_name} ${user.last_name}</td>
              <td>@${user.username}</td>
              <td>${user.email}</td>
              <td>${user.user_type?.name || 'N/A'}</td>
              <td>${user.is_active ? 'Active' : 'Inactive'}</td>
              <td>${this.formatDate(user.last_login)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Printed by: ${this.currentUser?.username || 'System'}</p>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // Enhanced export functionality
  exportUsers(): void {
    const exportOptions = [
      { label: 'CSV', icon: 'description', action: () => this.exportToCSV() },
      { label: 'Excel', icon: 'table_chart', action: () => this.exportToExcel() },
      { label: 'PDF', icon: 'picture_as_pdf', action: () => this.exportToPDF() }
    ];

    // Show export options menu
    // In a real implementation, this would open a menu
    this.exportToExcel(); // Default to Excel for now
  }

  exportToCSV(): void {
    // Use existing CSV export
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

  exportToExcel(): void {
    const ws_data = [
      ['User Report', '', '', '', '', ''],
      ['Generated:', new Date().toLocaleString(), '', '', '', ''],
      ['Total Users:', this.totalUsers.toString(), '', '', '', ''],
      [],
      ['Name', 'Username', 'Email', 'Type', 'Status', 'Last Login']
    ];

    this.users.forEach(user => {
      ws_data.push([
        `${user.first_name} ${user.last_name}`,
        user.username,
        user.email,
        user.user_type?.name || 'N/A',
        user.is_active ? 'Active' : 'Inactive',
        this.formatDate(user.last_login)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Add some styling
    ws['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 20 }
    ];

    XLSX.writeFile(wb, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportToPDF(): void {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text('User Management Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total Users: ${this.totalUsers}`, 14, 40);

    // Add table
    const tableData = this.users.map(user => [
      `${user.first_name} ${user.last_name}`,
      user.username,
      user.email,
      user.user_type?.name || 'N/A',
      user.is_active ? 'Active' : 'Inactive'
    ]);

    (doc as any).autoTable({
      head: [['Name', 'Username', 'Email', 'Type', 'Status']],
      body: tableData,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [52, 197, 170] }
    });

    doc.save(`users_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  // Focus search input
  private focusSearch(): void {
    const searchInput = document.querySelector('.search-field input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  // Enhanced password strength check
  checkPasswordStrength(): void {
    const password = this.userForm.get('password')?.value || '';
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (password.length >= 12) score++;
    else feedback.push('12+ characters recommended');

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else feedback.push('Mix of upper and lowercase');

    if (/\d/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[@$!%*?&#^()_+=\-]/.test(password)) score++;
    else feedback.push('Include special characters');

    // Check for common patterns
    if (!/(.)\1{2,}/.test(password)) score++;
    else feedback.push('Avoid repeated characters');

    if (!/^(password|12345|qwerty)/i.test(password)) score++;
    else feedback.push('Avoid common passwords');

    const strengths = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
    this.passwordStrength = {
      score: Math.min(score, 6),
      text: strengths[Math.min(score, 6)],
      feedback
    };
  }

  // Skeleton loader
  getSkeletonArray(count: number): number[] {
    return Array(count).fill(0).map((_, i) => i);
  }

  // Utility methods
  refreshData(): void {
    this.clearCache();
    this.loadUsers(false);
    this.loadStatistics();
  }

  private clearCache(): void {
    this.cachedUsers.clear();
    this.lastCacheUpdate = null;
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
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
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

    if (diffDays === 0) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `Today at ${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getUserRole(user: CustomUser): string {
    if (user.is_superuser) return 'Super Admin';
    if (user.is_staff) return 'Staff';
    if (user.is_developer) return 'Developer';
    if (user.groups && user.groups.length > 0) {
      return user.groups.map(g => g.name).join(', ');
    }
    return 'User';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  // Selection methods
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
    this.passwordStrength = { score: 0, text: 'Weak' };

    // Password is required for new users
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

  private openDialog(): void {
    this.dialogRef = this.dialog.open(this.editUserDialog, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'ocean-mint-dialog'
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
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
      width: '500px',
      panelClass: 'ocean-mint-dialog'
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
      width: '600px',
      panelClass: 'ocean-mint-dialog'
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

  // Validators
  private passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }


  viewUser(user: CustomUser): void {
    if (!user) return;

    this.selectedUser = user;

    // Ensure dialog template is available
    setTimeout(() => {
      if (this.viewUserDialog) {
        this.dialog.open(this.viewUserDialog, {
          width: '600px',
          panelClass: 'ocean-mint-dialog'
        });
      } else {
        console.error('View user dialog template not found');
        this.snackBar.open('Error opening user details', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  closeViewDialog(): void {
    this.dialog.closeAll();
    this.selectedUser = null;
  }

  // Add a safe edit method
  editUserFromView(): void {
    if (this.selectedUser) {
      this.editUser(this.selectedUser);
      this.closeViewDialog();
    }
  }

// Update the editUser method to also populate profile form if needed:
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

    // Populate profile form if user has profile data
    // For now, initialize with empty values until backend provides profile data
    this.profileForm.patchValue({
      phone: '',
      department: '',
      position: '',
      timezone: 'UTC',
      bio: ''
    });

    this.selectedGroups = user.groups?.map(g => g.id) || [];

    // Password is not required for existing users
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.openDialog();
  }

// Update saveUser method to include profile data:
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
      group_ids: this.selectedGroups,
      profile: this.profileForm.value // Include profile data
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
}
