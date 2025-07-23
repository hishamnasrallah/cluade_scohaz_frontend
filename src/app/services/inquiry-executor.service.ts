// src/app/services/inquiry-executor.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, throwError, of } from 'rxjs';
import { catchError, tap, map, shareReplay } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { InquiryConfigService } from './inquiry-config.service';
import {
  InquiryExecutionParams,
  InquiryExecutionResponse,
  InquirySchema,
  PaginatedResponse,
  InquiryConfiguration
} from '../models/inquiry-config.models';
import {
  InquiryMetadata,
  SavedQuery,
  InquiryStatistics,
  QueryState
} from '../models/inquiry-execution.models';

@Injectable({
  providedIn: 'root'
})
export class InquiryExecutorService {
  private apiUrl = '/api/inquiry';

  // State management
  private currentInquirySubject = new BehaviorSubject<InquiryMetadata | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private dataSubject = new BehaviorSubject<any[]>([]);
  private statisticsSubject = new BehaviorSubject<InquiryStatistics | null>(null);

  // Observables
  public currentInquiry$ = this.currentInquirySubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public data$ = this.dataSubject.asObservable();
  public statistics$ = this.statisticsSubject.asObservable();

  // Events
  public dataRefreshed$ = new Subject<void>();
  public filterApplied$ = new Subject<Record<string, any>>();

  // Cache
  private schemaCache = new Map<string, InquirySchema>();
  private dataCache = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private inquiryConfigService: InquiryConfigService
  ) {}

  private getFullUrl(endpoint: string): string {
    return `${this.configService.getBaseUrl()}${endpoint}`;
  }

  // Get available inquiries for current user
  getAvailableInquiries(): Observable<InquiryMetadata[]> {
    return this.inquiryConfigService.listConfigurations()
      .pipe(
        map((response: PaginatedResponse<InquiryConfiguration>) =>
          response.results.map(config => ({
            code: config.code,
            name: config.name,
            display_name: config.display_name,
            icon: config.icon,
            description: config.description,
            category: this.categorizeInquiry(config),
            is_favorite: this.isFavorite(config.code)
          }))
        ),
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  // Get inquiry schema
  getInquirySchema(code: string, useCache = true): Observable<InquirySchema> {
    if (useCache && this.schemaCache.has(code)) {
      return of(this.schemaCache.get(code)!);
    }

    return this.inquiryConfigService.getInquirySchema(code)
      .pipe(
        tap(schema => this.schemaCache.set(code, schema)),
        catchError(this.handleError)
      );
  }

  // Execute inquiry
  executeInquiry(code: string, params: InquiryExecutionParams): Observable<InquiryExecutionResponse> {
    this.loadingSubject.next(true);

    return this.inquiryConfigService.executeInquiry(code, params)
      .pipe(
        tap(response => {
          this.dataSubject.next(response.results);
          this.updateStatistics(response);
          this.loadingSubject.next(false);
          this.dataRefreshed$.next();
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.handleError(error);
        })
      );
  }

  // Export data
  exportData(code: string, params: InquiryExecutionParams, format: string): Observable<Blob> {
    const exportParams = { ...params, export: format };

    return this.http.post(
      this.getFullUrl(`/inquiry/execute/${code}/`),
      exportParams,
      { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Save query
  saveQuery(query: SavedQuery): Observable<SavedQuery> {
    return this.http.post<SavedQuery>(
      this.getFullUrl(`${this.apiUrl}/saved-queries/`),
      query
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get saved queries
  getSavedQueries(inquiryCode?: string): Observable<SavedQuery[]> {
    let params = new HttpParams();
    if (inquiryCode) {
      params = params.set('inquiry_code', inquiryCode);
    }

    return this.http.get<SavedQuery[]>(
      this.getFullUrl(`${this.apiUrl}/saved-queries/`),
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Favorite management
  toggleFavorite(code: string): Observable<void> {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(code);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(code);
    }

    localStorage.setItem('inquiry_favorites', JSON.stringify(favorites));
    return of(void 0);
  }

  private getFavorites(): string[] {
    const stored = localStorage.getItem('inquiry_favorites');
    return stored ? JSON.parse(stored) : [];
  }

  private isFavorite(code: string): boolean {
    return this.getFavorites().includes(code);
  }

  // Recent inquiries
  addToRecent(inquiry: InquiryMetadata): void {
    const recent = this.getRecentInquiries();
    const filtered = recent.filter(i => i.code !== inquiry.code);
    filtered.unshift(inquiry);

    // Keep only last 10
    const toStore = filtered.slice(0, 10);
    localStorage.setItem('recent_inquiries', JSON.stringify(toStore));
  }

  getRecentInquiries(): InquiryMetadata[] {
    const stored = localStorage.getItem('recent_inquiries');
    return stored ? JSON.parse(stored) : [];
  }

  // Statistics
  private updateStatistics(response: InquiryExecutionResponse): void {
    this.statisticsSubject.next({
      totalRecords: response.count,
      filteredRecords: response.results.length,
      executionTime: response.execution_time_ms,
      aggregations: response.aggregations || {},
      lastUpdated: new Date()
    });
  }

  // Column preferences
  saveColumnPreferences(inquiryCode: string, columns: string[]): void {
    const key = `inquiry_columns_${inquiryCode}`;
    localStorage.setItem(key, JSON.stringify(columns));
  }

  getColumnPreferences(inquiryCode: string): string[] | null {
    const key = `inquiry_columns_${inquiryCode}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  // Categorization
  private categorizeInquiry(config: InquiryConfiguration): string {
    // Logic to categorize inquiries based on model or naming convention
    const modelName = config.content_type.toString();

    if (modelName.includes('user') || modelName.includes('auth')) {
      return 'User Management';
    } else if (modelName.includes('order') || modelName.includes('sale')) {
      return 'Sales & Orders';
    } else if (modelName.includes('report')) {
      return 'Reports';
    }

    return 'General';
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('InquiryExecutorService Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error?.detail) {
      errorMessage = error.error.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Clear cache
  clearCache(): void {
    this.schemaCache.clear();
    this.dataCache.clear();
  }
}
