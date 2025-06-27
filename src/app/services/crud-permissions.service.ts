// services/crud-permissions.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface CRUDPermission {
  id?: number;
  group: number;
  content_type: number;
  context: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  // Response fields
  content_type_name?: string;
  group_name?: string;
  object_id?: number | null;
}

export interface Group {
  id: number;
  name: string;
}

export interface ContentTypeApp {
  app_label: string;
  app_name?: string;
  model_count?: number;
}

// Type for the raw API response (string array)
export type ContentTypeAppsResponse = string[];

export interface ContentTypeModel {
  id: number;
  model: string;
  app_label: string;
}

export interface CRUDPermissionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CRUDPermission[];
}

export interface PermissionSummary {
  total_permissions: number;
  total_groups: number;
  total_content_types: number;
  contexts: string[];
  permissions_by_context: { [context: string]: number };
  permissions_by_group: { [groupName: string]: number };
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UserEffectivePermissions {
  user_id: number;
  groups: Group[];
  permissions: CRUDPermission[];
  effective_permissions: {
    [contentTypeId: number]: {
      [context: string]: {
        can_create: boolean;
        can_read: boolean;
        can_update: boolean;
        can_delete: boolean;
      };
    };
  };
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface UserPermissionCheck {
  has_permission: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrudPermissionsService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  private getApiUrl(endpoint: string): string {
    const baseUrl = this.configService.getBaseUrl();
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Get list of CRUD permissions
   */
  getPermissions(): Observable<CRUDPermissionListResponse> {
    return this.http.get<CRUDPermissionListResponse>(this.getApiUrl('/auth/crud-permissions/'));
  }

  /**
   * Get detailed CRUD permission by ID
   */
  getPermission(id: number): Observable<CRUDPermission> {
    return this.http.get<CRUDPermission>(this.getApiUrl(`/auth/crud-permissions/${id}/`));
  }

  /**
   * Create new CRUD permission
   */
  createPermission(permission: Omit<CRUDPermission, 'id'>): Observable<CRUDPermission> {
    return this.http.post<CRUDPermission>(this.getApiUrl('/auth/crud-permissions/'), permission);
  }

  /**
   * Update existing CRUD permission
   */
  updatePermission(id: number, permission: Partial<CRUDPermission>): Observable<CRUDPermission> {
    return this.http.put<CRUDPermission>(this.getApiUrl(`/auth/crud-permissions/${id}/`), permission);
  }

  /**
   * Delete CRUD permission
   */
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`/auth/crud-permissions/${id}/`));
  }

  /**
   * Get list of groups
   */
  getGroups(): Observable<Group[] | { count: number; results: Group[] }> {
    return this.http.get<Group[] | { count: number; results: Group[] }>(this.getApiUrl('/auth/groups/'));
  }

  /**
   * Get list of applications for content types
   * Returns array of app label strings
   */
  getContentTypeApps(): Observable<ContentTypeAppsResponse> {
    return this.http.get<ContentTypeAppsResponse>(this.getApiUrl('/auth/content-types/apps/'));
  }

  /**
   * Get models for a specific application
   */
  getContentTypeModels(appLabel: string): Observable<ContentTypeModel[]> {
    return this.http.get<ContentTypeModel[]>(
      this.getApiUrl(`/auth/content-types/models/?app=${appLabel}`)
    );
  }

  /**
   * Get permissions for a specific group
   */
  getPermissionsByGroup(groupId: number): Observable<CRUDPermission[]> {
    return this.http.get<CRUDPermission[]>(this.getApiUrl(`/auth/crud-permissions/?group=${groupId}`));
  }

  /**
   * Get permissions for a specific content type
   */
  getPermissionsByContentType(contentTypeId: number): Observable<CRUDPermission[]> {
    return this.http.get<CRUDPermission[]>(this.getApiUrl(`/auth/crud-permissions/?content_type=${contentTypeId}`));
  }

  /**
   * Get permissions for a specific context
   */
  getPermissionsByContext(context: string): Observable<CRUDPermission[]> {
    return this.http.get<CRUDPermission[]>(this.getApiUrl(`/auth/crud-permissions/?context=${context}`));
  }

  /**
   * Bulk create permissions
   */
  bulkCreatePermissions(data: {
    group: number;
    content_types: number[];
    contexts: string[];
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
  }): Observable<{
    created: CRUDPermission[];
    errors: string[];
    created_count: number;
  }> {
    return this.http.post<{
      created: CRUDPermission[];
      errors: string[];
      created_count: number;
    }>(this.getApiUrl('/auth/crud-permissions/bulk-create/'), data);
  }

  /**
   * Bulk update permissions
   */
  bulkUpdatePermissions(data: {
    permission_ids: number[];
    can_create?: boolean;
    can_read?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
  }): Observable<{
    updated: CRUDPermission[];
    updated_count: number;
  }> {
    return this.http.put<{
      updated: CRUDPermission[];
      updated_count: number;
    }>(this.getApiUrl('/auth/crud-permissions/bulk-update/'), data);
  }

  /**
   * Bulk delete permissions
   */
  bulkDeletePermissions(permission_ids: number[]): Observable<{ deleted_count: number }> {
    return this.http.delete<{ deleted_count: number }>(
      this.getApiUrl('/auth/crud-permissions/bulk-delete/'),
      { body: { permission_ids } }
    );
  }

  /**
   * Copy permissions from one group to another
   */
  copyPermissions(fromGroupId: number, toGroupId: number): Observable<CRUDPermission[]> {
    return this.http.post<CRUDPermission[]>(
      this.getApiUrl('/auth/crud-permissions/copy/'),
      { from_group: fromGroupId, to_group: toGroupId }
    );
  }

  /**
   * Get permission summary statistics
   */
  getPermissionSummary(): Observable<PermissionSummary> {
    return this.http.get<PermissionSummary>(this.getApiUrl('/auth/crud-permissions/summary/'));
  }

  /**
   * Validate permission configuration
   */
  validatePermission(permission: Omit<CRUDPermission, 'id'>): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(this.getApiUrl('/auth/crud-permissions/validate/'), permission);
  }

  /**
   * Export permissions as JSON
   */
  exportPermissions(filters?: {
    groups?: number[];
    content_types?: number[];
    contexts?: string[];
  }): Observable<Blob> {
    return this.http.post(
      this.getApiUrl('/auth/crud-permissions/export/'),
      filters || {},
      { responseType: 'blob' }
    );
  }

  /**
   * Import permissions from JSON
   */
  importPermissions(file: File): Observable<BulkImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BulkImportResult>(this.getApiUrl('/auth/crud-permissions/import/'), formData);
  }

  /**
   * Check if user has specific permission
   */
  checkUserPermission(
    userId: number,
    contentType: number,
    context: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ): Observable<UserPermissionCheck> {
    return this.http.get<UserPermissionCheck>(
      this.getApiUrl(`/auth/crud-permissions/check/${userId}/${contentType}/${context}/${action}/`)
    );
  }

  /**
   * Get effective permissions for a user (considering all groups)
   */
  getUserEffectivePermissions(userId: number): Observable<UserEffectivePermissions> {
    return this.http.get<UserEffectivePermissions>(this.getApiUrl(`/auth/crud-permissions/user/${userId}/effective/`));
  }

  /**
   * Utility method to parse content type name
   */
  parseContentTypeName(contentTypeName: string): { app: string; model: string } {
    const [app, model] = contentTypeName.split('.');
    return { app: app || '', model: model || '' };
  }

  /**
   * Utility method to format permission summary
   */
  formatPermissionSummary(permission: CRUDPermission): string {
    const permissions = [];
    if (permission.can_create) permissions.push('Create');
    if (permission.can_read) permissions.push('Read');
    if (permission.can_update) permissions.push('Update');
    if (permission.can_delete) permissions.push('Delete');

    return permissions.length > 0 ? permissions.join(', ') : 'No permissions';
  }

  /**
   * Utility method to get CRUD abbreviation
   */
  getCRUDAbbreviation(permission: CRUDPermission): string {
    const permissions = [];
    if (permission.can_create) permissions.push('C');
    if (permission.can_read) permissions.push('R');
    if (permission.can_update) permissions.push('U');
    if (permission.can_delete) permissions.push('D');

    return permissions.length > 0 ? permissions.join('') : '----';
  }

  /**
   * Utility method to check if permission has any CRUD access
   */
  hasAnyPermission(permission: CRUDPermission): boolean {
    return permission.can_create || permission.can_read || permission.can_update || permission.can_delete;
  }

  /**
   * Utility method to check if permission has full access
   */
  hasFullAccess(permission: CRUDPermission): boolean {
    return permission.can_create && permission.can_read && permission.can_update && permission.can_delete;
  }

  /**
   * Utility method to get permission level
   */
  getPermissionLevel(permission: CRUDPermission): 'none' | 'read-only' | 'partial' | 'full' {
    if (!this.hasAnyPermission(permission)) return 'none';
    if (this.hasFullAccess(permission)) return 'full';
    if (permission.can_read && !permission.can_create && !permission.can_update && !permission.can_delete) {
      return 'read-only';
    }
    return 'partial';
  }
}
