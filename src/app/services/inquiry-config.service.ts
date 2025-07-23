// services/inquiry-config.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import {
  InquiryConfiguration,
  InquiryField,
  InquiryFilter,
  InquiryRelation,
  InquirySort,
  InquiryPermission,
  ContentType,
  PaginatedResponse,
  InquirySchema,
  InquiryExecutionParams,
  InquiryExecutionResponse
} from '../models/inquiry-config.models';

@Injectable({
  providedIn: 'root'
})
export class InquiryConfigService {
  private apiUrl = '/inquiry/configurations';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  private getFullUrl(endpoint: string): string {
    return `${this.configService.getBaseUrl()}${endpoint}`;
  }

  // Configuration CRUD
  listConfigurations(params?: any): Observable<PaginatedResponse<InquiryConfiguration>> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    return this.http.get<PaginatedResponse<InquiryConfiguration>>(
      this.getFullUrl(this.apiUrl),
      { params: new HttpParams({ fromObject: params || {} }) }
    ).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.handleError('Error loading configurations', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  getConfiguration(code: string): Observable<InquiryConfiguration> {
    return this.http.get<InquiryConfiguration>(
      this.getFullUrl(`${this.apiUrl}/${code}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading configuration', error);
        return throwError(() => error);
      })
    );
  }

  createConfiguration(config: InquiryConfiguration): Observable<InquiryConfiguration> {
    this.loadingSubject.next(true);

    return this.http.post<InquiryConfiguration>(
      this.getFullUrl(this.apiUrl),
      config
    ).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.handleError('Error creating configuration', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  updateConfiguration(code: string, config: InquiryConfiguration): Observable<InquiryConfiguration> {
    this.loadingSubject.next(true);

    return this.http.put<InquiryConfiguration>(
      this.getFullUrl(`${this.apiUrl}/${code}/`),
      config
    ).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.handleError('Error updating configuration', error);
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  deleteConfiguration(code: string): Observable<void> {
    return this.http.delete<void>(
      this.getFullUrl(`${this.apiUrl}/${code}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error deleting configuration', error);
        return throwError(() => error);
      })
    );
  }

  // Helper endpoints
  getAvailableModels(): Observable<ContentType[]> {
    return this.http.get<ContentType[]>(
      this.getFullUrl(`${this.apiUrl}/available_models/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading available models', error);
        return throwError(() => error);
      })
    );
  }

  previewConfiguration(code: string): Observable<any> {
    return this.http.get<any>(
      this.getFullUrl(`${this.apiUrl}/${code}/preview/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading preview', error);
        return throwError(() => error);
      })
    );
  }

  getInquirySchema(code: string): Observable<InquirySchema> {
    return this.http.get<InquirySchema>(
      this.getFullUrl(`/inquiry/schema/${code}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading inquiry schema', error);
        return throwError(() => error);
      })
    );
  }

  executeInquiry(code: string, params: InquiryExecutionParams): Observable<InquiryExecutionResponse> {
    return this.http.post<InquiryExecutionResponse>(
      this.getFullUrl(`/inquiry/execute/${code}/`),
      params
    ).pipe(
      catchError(error => {
        this.handleError('Error executing inquiry', error);
        return throwError(() => error);
      })
    );
  }

  // Field operations
  getFields(inquiryId: number): Observable<InquiryField[]> {
    return this.http.get<InquiryField[]>(
      this.getFullUrl(`/inquiry/fields/?inquiry=${inquiryId}`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading fields', error);
        return throwError(() => error);
      })
    );
  }

  addField(field: InquiryField): Observable<InquiryField> {
    return this.http.post<InquiryField>(
      this.getFullUrl('/inquiry/fields/'),
      field
    ).pipe(
      catchError(error => {
        this.handleError('Error adding field', error);
        return throwError(() => error);
      })
    );
  }

  updateField(fieldId: number, field: InquiryField): Observable<InquiryField> {
    return this.http.put<InquiryField>(
      this.getFullUrl(`/inquiry/fields/${fieldId}/`),
      field
    ).pipe(
      catchError(error => {
        this.handleError('Error updating field', error);
        return throwError(() => error);
      })
    );
  }

  deleteField(fieldId: number): Observable<void> {
    return this.http.delete<void>(
      this.getFullUrl(`/inquiry/fields/${fieldId}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error deleting field', error);
        return throwError(() => error);
      })
    );
  }

  // Filter operations
  getFilters(inquiryId: number): Observable<InquiryFilter[]> {
    return this.http.get<InquiryFilter[]>(
      this.getFullUrl(`/inquiry/filters/?inquiry=${inquiryId}`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading filters', error);
        return throwError(() => error);
      })
    );
  }

  addFilter(filter: InquiryFilter): Observable<InquiryFilter> {
    return this.http.post<InquiryFilter>(
      this.getFullUrl('/inquiry/filters/'),
      filter
    ).pipe(
      catchError(error => {
        this.handleError('Error adding filter', error);
        return throwError(() => error);
      })
    );
  }

  updateFilter(filterId: number, filter: InquiryFilter): Observable<InquiryFilter> {
    return this.http.put<InquiryFilter>(
      this.getFullUrl(`/inquiry/filters/${filterId}/`),
      filter
    ).pipe(
      catchError(error => {
        this.handleError('Error updating filter', error);
        return throwError(() => error);
      })
    );
  }

  deleteFilter(filterId: number): Observable<void> {
    return this.http.delete<void>(
      this.getFullUrl(`/inquiry/filters/${filterId}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error deleting filter', error);
        return throwError(() => error);
      })
    );
  }

  // Relation operations
  getRelations(inquiryId: number): Observable<InquiryRelation[]> {
    return this.http.get<InquiryRelation[]>(
      this.getFullUrl(`/inquiry/relations/?inquiry=${inquiryId}`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading relations', error);
        return throwError(() => error);
      })
    );
  }

  addRelation(relation: InquiryRelation): Observable<InquiryRelation> {
    return this.http.post<InquiryRelation>(
      this.getFullUrl('/inquiry/relations/'),
      relation
    ).pipe(
      catchError(error => {
        this.handleError('Error adding relation', error);
        return throwError(() => error);
      })
    );
  }

  updateRelation(relationId: number, relation: InquiryRelation): Observable<InquiryRelation> {
    return this.http.put<InquiryRelation>(
      this.getFullUrl(`/inquiry/relations/${relationId}/`),
      relation
    ).pipe(
      catchError(error => {
        this.handleError('Error updating relation', error);
        return throwError(() => error);
      })
    );
  }

  deleteRelation(relationId: number): Observable<void> {
    return this.http.delete<void>(
      this.getFullUrl(`/inquiry/relations/${relationId}/`)
    ).pipe(
      catchError(error => {
        this.handleError('Error deleting relation', error);
        return throwError(() => error);
      })
    );
  }

  // Sort operations
  getSorts(inquiryId: number): Observable<InquirySort[]> {
    return this.http.get<InquirySort[]>(
      this.getFullUrl(`/inquiry/sorts/?inquiry=${inquiryId}`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading sorts', error);
        return throwError(() => error);
      })
    );
  }

  updateSorts(inquiryId: number, sorts: InquirySort[]): Observable<InquirySort[]> {
    return this.http.post<InquirySort[]>(
      this.getFullUrl(`/inquiry/sorts/bulk_update/`),
      { inquiry: inquiryId, sorts }
    ).pipe(
      catchError(error => {
        this.handleError('Error updating sorts', error);
        return throwError(() => error);
      })
    );
  }

  // Permission operations
  getPermissions(inquiryId: number): Observable<InquiryPermission[]> {
    return this.http.get<InquiryPermission[]>(
      this.getFullUrl(`/inquiry/permissions/?inquiry=${inquiryId}`)
    ).pipe(
      catchError(error => {
        this.handleError('Error loading permissions', error);
        return throwError(() => error);
      })
    );
  }

  updatePermissions(permissions: InquiryPermission[]): Observable<InquiryPermission[]> {
    return this.http.post<InquiryPermission[]>(
      this.getFullUrl(`/inquiry/permissions/bulk_update/`),
      permissions
    ).pipe(
      catchError(error => {
        this.handleError('Error updating permissions', error);
        return throwError(() => error);
      })
    );
  }

  // Import/Export operations
  exportConfiguration(code: string): Observable<Blob> {
    return this.http.get(
      this.getFullUrl(`${this.apiUrl}/${code}/export/`),
      { responseType: 'blob' }
    ).pipe(
      catchError(error => {
        this.handleError('Error exporting configuration', error);
        return throwError(() => error);
      })
    );
  }

  importConfiguration(file: File): Observable<InquiryConfiguration> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<InquiryConfiguration>(
      this.getFullUrl(`${this.apiUrl}/import/`),
      formData
    ).pipe(
      catchError(error => {
        this.handleError('Error importing configuration', error);
        return throwError(() => error);
      })
    );
  }

  // Validation helpers
  validateFieldPath(contentTypeId: number, fieldPath: string): Observable<{ valid: boolean; field_type?: string }> {
    return this.http.post<{ valid: boolean; field_type?: string }>(
      this.getFullUrl(`${this.apiUrl}/validate_field_path/`),
      { content_type: contentTypeId, field_path: fieldPath }
    ).pipe(
      catchError(error => {
        this.handleError('Error validating field path', error);
        return throwError(() => error);
      })
    );
  }

  // Error handling
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
      }
    }

    this.errorSubject.next(errorMessage);
  }

  clearError(): void {
    this.errorSubject.next('');
  }
}
