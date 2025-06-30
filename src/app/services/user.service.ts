// services/user.service.ts - Complete User Management Service
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';

// Interfaces matching backend models
export interface CustomUser {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  second_name?: string;
  third_name?: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_developer: boolean;
  activated_account?: boolean;
  date_joined?: string;
  last_login?: string;
  user_type?: UserType;
  user_type_id?: number;
  groups?: Group[];
  group_ids?: number[];
  preference?: UserPreference;
  phone_numbers?: PhoneNumber[];
  password?: string; // Only for creation
}

export interface UserType {
  id: number;
  name: string;
  name_ara: string;
  code: string;
  active_ind: boolean;
  group?: Group;
  permissions?: Permission[];
}

export interface Group {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type?: number;
}

export interface UserPreference {
  id?: number;
  lang: string;
  user?: number;
}

export interface PhoneNumber {
  id?: number;
  phone_number: string;
  number_type: number;
  is_default: boolean;
  main: boolean;
  user?: number;
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomUser[];
}

export interface UserFilters {
  search?: string;
  user_type?: string;
  is_active?: boolean;
  group?: number;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface PasswordResetRequest {
  password: string;
}

export interface BulkUserOperation {
  user_ids: number[];
}

export interface GroupAssignment {
  group_ids: number[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<CustomUser[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  public users$ = this.usersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  private readonly API_ENDPOINTS = {
    users: '/auth/customuser/',
    groups: '/auth/groups/',
    userTypes: '/auth/customuser/user-types/',
    phoneNumbers: '/auth/phone_numbers/',
    activate: '/auth/customuser/{id}/activate/',
    deactivate: '/auth/customuser/{id}/deactivate/',
    resetPassword: '/auth/customuser/{id}/reset-password/',
    assignGroups: '/auth/customuser/{id}/assign-groups/',
    bulkActivate: '/auth/customuser/bulk-activate/',
    bulkDeactivate: '/auth/customuser/bulk-deactivate/',
    userDetail: '/auth/me/',
    changePassword: '/auth/change_password/'
  };

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  /**
   * Get paginated users list with filters
   */
  getUsers(filters?: UserFilters): Observable<UserListResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.user_type) params = params.set('user_type', filters.user_type);
      if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
      if (filters.group) params = params.set('group', filters.group.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.page_size) params = params.set('page_size', filters.page_size.toString());
      if (filters.ordering) params = params.set('ordering', filters.ordering);
    }

    return this.http.get<UserListResponse>(this.getApiUrl(this.API_ENDPOINTS.users), { params })
      .pipe(
        tap(response => {
          this.usersSubject.next(response.results);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.handleError('Error loading users', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get single user by ID
   */
  getUser(id: number): Observable<CustomUser> {
    return this.http.get<CustomUser>(this.getApiUrl(`${this.API_ENDPOINTS.users}${id}/`))
      .pipe(
        catchError(error => {
          this.handleError('Error loading user', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user details
   */
  getCurrentUser(): Observable<CustomUser> {
    return this.http.get<CustomUser>(this.getApiUrl(this.API_ENDPOINTS.userDetail))
      .pipe(
        catchError(error => {
          this.handleError('Error loading current user', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new user
   */
  createUser(user: Partial<CustomUser>): Observable<CustomUser> {
    this.loadingSubject.next(true);

    // Prepare the data - remove undefined/null values
    const userData = this.cleanUserData(user);

    return this.http.post<CustomUser>(this.getApiUrl(this.API_ENDPOINTS.users), userData)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.handleError('Error creating user', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update existing user
   */
  updateUser(id: number, user: Partial<CustomUser>): Observable<CustomUser> {
    this.loadingSubject.next(true);

    // Don't send password on update unless explicitly set
    const userData = this.cleanUserData(user);
    if (!userData.password) {
      delete userData.password;
    }

    return this.http.put<CustomUser>(this.getApiUrl(`${this.API_ENDPOINTS.users}${id}/`), userData)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.handleError('Error updating user', error);
          this.loadingSubject.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete user (actually deactivates)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`${this.API_ENDPOINTS.users}${id}/`))
      .pipe(
        catchError(error => {
          this.handleError('Error deleting user', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Activate user account
   */
  activateUser(id: number): Observable<any> {
    const url = this.API_ENDPOINTS.activate.replace('{id}', id.toString());
    return this.http.post<any>(this.getApiUrl(url), {})
      .pipe(
        catchError(error => {
          this.handleError('Error activating user', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Deactivate user account
   */
  deactivateUser(id: number): Observable<any> {
    const url = this.API_ENDPOINTS.deactivate.replace('{id}', id.toString());
    return this.http.post<any>(this.getApiUrl(url), {})
      .pipe(
        catchError(error => {
          this.handleError('Error deactivating user', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Reset user password
   */
  resetUserPassword(id: number, password: string): Observable<any> {
    const url = this.API_ENDPOINTS.resetPassword.replace('{id}', id.toString());
    return this.http.post<any>(this.getApiUrl(url), { password })
      .pipe(
        catchError(error => {
          this.handleError('Error resetting password', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Assign groups to user
   */
  assignGroups(id: number, groupIds: number[]): Observable<any> {
    const url = this.API_ENDPOINTS.assignGroups.replace('{id}', id.toString());
    return this.http.post<any>(this.getApiUrl(url), { group_ids: groupIds })
      .pipe(
        catchError(error => {
          this.handleError('Error assigning groups', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Bulk activate users
   */
  bulkActivateUsers(userIds: number[]): Observable<any> {
    return this.http.post<any>(this.getApiUrl(this.API_ENDPOINTS.bulkActivate), { user_ids: userIds })
      .pipe(
        catchError(error => {
          this.handleError('Error bulk activating users', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Bulk deactivate users
   */
  bulkDeactivateUsers(userIds: number[]): Observable<any> {
    return this.http.post<any>(this.getApiUrl(this.API_ENDPOINTS.bulkDeactivate), { user_ids: userIds })
      .pipe(
        catchError(error => {
          this.handleError('Error bulk deactivating users', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all groups
   */
  getGroups(): Observable<Group[]> {
    return this.http.get<any>(this.getApiUrl(this.API_ENDPOINTS.groups))
      .pipe(
        map(response => {
          // Handle both array and paginated response
          if (Array.isArray(response)) {
            return response;
          } else if (response.results) {
            return response.results;
          }
          return [];
        }),
        catchError(error => {
          this.handleError('Error loading groups', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all user types
   */
  getUserTypes(): Observable<UserType[]> {
    return this.http.get<UserType[]>(this.getApiUrl(this.API_ENDPOINTS.userTypes))
      .pipe(
        catchError(error => {
          this.handleError('Error loading user types', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user phone numbers
   */
  getUserPhoneNumbers(userId: number): Observable<PhoneNumber[]> {
    return this.http.get<{ result: PhoneNumber[] }>(
      this.getApiUrl(this.API_ENDPOINTS.phoneNumbers),
      { params: { user: userId.toString() } }
    ).pipe(
      map(response => response.result || []),
      catchError(error => {
        this.handleError('Error loading phone numbers', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add phone number
   */
  addPhoneNumber(phoneNumber: PhoneNumber): Observable<PhoneNumber> {
    return this.http.post<PhoneNumber>(this.getApiUrl(this.API_ENDPOINTS.phoneNumbers), phoneNumber)
      .pipe(
        catchError(error => {
          this.handleError('Error adding phone number', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update phone number
   */
  updatePhoneNumber(id: number, phoneNumber: Partial<PhoneNumber>): Observable<PhoneNumber> {
    return this.http.put<PhoneNumber>(
      this.getApiUrl(`${this.API_ENDPOINTS.phoneNumbers}${id}/`),
      phoneNumber
    ).pipe(
      catchError(error => {
        this.handleError('Error updating phone number', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete phone number
   */
  deletePhoneNumber(id: number): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`${this.API_ENDPOINTS.phoneNumbers}${id}/`))
      .pipe(
        catchError(error => {
          this.handleError('Error deleting phone number', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Change current user password
   */
  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(this.getApiUrl(this.API_ENDPOINTS.changePassword), {
      old_password: oldPassword,
      password: newPassword,
      password2: confirmPassword
    }).pipe(
      catchError(error => {
        this.handleError('Error changing password', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Export users to CSV
   */
  exportUsers(filters?: UserFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.user_type) params = params.set('user_type', filters.user_type);
      if (filters.is_active !== undefined) params = params.set('is_active', filters.is_active.toString());
      if (filters.group) params = params.set('group', filters.group.toString());
    }
    params = params.set('export', 'csv');

    return this.http.get(this.getApiUrl(this.API_ENDPOINTS.users), {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        this.handleError('Error exporting users', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if username is available
   */
  checkUsernameAvailability(username: string, excludeUserId?: number): Observable<boolean> {
    let params = new HttpParams().set('username', username);
    if (excludeUserId) {
      params = params.set('exclude', excludeUserId.toString());
    }

    return this.http.get<{ available: boolean }>(
      this.getApiUrl('/auth/check-username/'),
      { params }
    ).pipe(
      map(response => response.available),
      catchError(() => {
        // If endpoint doesn't exist, fallback to checking via user list
        return this.getUsers({ search: username }).pipe(
          map(response => {
            const users = response.results.filter(u => u.username === username);
            if (excludeUserId) {
              return users.length === 0 || (users.length === 1 && users[0].id === excludeUserId);
            }
            return users.length === 0;
          })
        );
      })
    );
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to get full API URL
   */
  private getApiUrl(endpoint: string): string {
    const baseUrl = this.configService.getBaseUrl();
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Helper method to clean user data before sending
   */
  private cleanUserData(user: Partial<CustomUser>): any {
    const cleaned: any = {};

    // Copy all defined values
    Object.keys(user).forEach(key => {
      const value = (user as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });

    // Handle special fields
    if (user.user_type && typeof user.user_type === 'object') {
      cleaned.user_type_id = user.user_type.id;
      delete cleaned.user_type;
    }

    if (user.groups && Array.isArray(user.groups)) {
      cleaned.group_ids = user.groups.map(g => g.id);
      delete cleaned.groups;
    }

    // Remove read-only fields
    delete cleaned.id;
    delete cleaned.date_joined;
    delete cleaned.last_login;
    delete cleaned.preference;
    delete cleaned.phone_numbers;

    return cleaned;
  }

  /**
   * Helper method to handle errors
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);

    let errorMessage = message;

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.detail) {
        errorMessage = error.error.detail;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.non_field_errors) {
        errorMessage = error.error.non_field_errors.join(', ');
      } else {
        // Handle field-specific errors
        const fieldErrors = Object.keys(error.error)
          .map(key => `${key}: ${error.error[key].join(', ')}`)
          .join('; ');
        if (fieldErrors) {
          errorMessage = fieldErrors;
        }
      }
    }

    this.errorSubject.next(errorMessage);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSubject.next('');
  }
}
