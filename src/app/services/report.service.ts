// src/app/services/report.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import {
  Report,
  ReportListResponse,
  DataSource,
  Field,
  Filter,
  Parameter,
  Join,
  Schedule,
  ExecutionResult,
  ContentType,
  FieldInfo,
  BuilderData,
  ReportExecution
} from '../models/report.models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = '';
  private apiPath = '/reports/api';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getBaseUrl();
  }

  private getUrl(endpoint: string): string {
    return `${this.baseUrl}${this.apiPath}${endpoint}`;
  }

  // Report CRUD operations
  getReports(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    report_type?: string;
    is_active?: boolean;
    is_public?: boolean;
    category?: string;
    ordering?: string;
  }): Observable<ReportListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ReportListResponse>(this.getUrl('/reports/'), { params: httpParams });
  }

  getReport(id: number): Observable<Report> {
    return this.http.get<Report>(this.getUrl(`/reports/${id}/`));
  }

  createReport(report: Partial<Report>): Observable<Report> {
    return this.http.post<Report>(this.getUrl('/reports/'), report);
  }

  updateReport(id: number, report: Partial<Report>): Observable<Report> {
    return this.http.patch<Report>(this.getUrl(`/reports/${id}/`), report);
  }

  deleteReport(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/reports/${id}/`));
  }

  duplicateReport(id: number): Observable<Report> {
    return this.http.post<Report>(this.getUrl(`/reports/${id}/duplicate/`), {});
  }

  // Report execution
  executeReport(id: number, params: {
    parameters?: Record<string, any>;
    limit?: number;
    offset?: number;
    export_format?: 'json' | 'csv' | 'excel' | 'pdf';
    save_result?: boolean;
    result_name?: string;
  }): Observable<ExecutionResult> {
    return this.http.post<ExecutionResult>(this.getUrl(`/reports/${id}/execute/`), params);
  }

  previewReport(id: number, parameters?: Record<string, any>): Observable<ExecutionResult> {
    return this.http.post<ExecutionResult>(
      this.getUrl(`/reports/${id}/preview/`),
      { parameters }
    );
  }

  exportReport(id: number, format: 'csv' | 'excel' | 'pdf', parameters?: Record<string, any>): Observable<Blob> {
    return this.http.post(
      this.getUrl(`/reports/${id}/execute/`),
      {
        parameters,
        export_format: format
      },
      {
        responseType: 'blob'
      }
    );
  }

  // Data Sources
  getDataSources(reportId: number): Observable<DataSource[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<any>(this.getUrl('/data-sources/'), { params }).pipe(
      map(response => {
        // If the response has a 'results' property, return that, otherwise return the response itself
        return response.results || response;
      })
    );
  }

  createDataSource(dataSource: Partial<DataSource>): Observable<DataSource> {
    return this.http.post<DataSource>(this.getUrl('/data-sources/'), dataSource);
  }

  updateDataSource(id: number, dataSource: Partial<DataSource>): Observable<DataSource> {
    return this.http.patch<DataSource>(this.getUrl(`/data-sources/${id}/`), dataSource);
  }

  deleteDataSource(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/data-sources/${id}/`));
  }

  // Fields
  getFields(reportId: number): Observable<Field[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<any>(this.getUrl('/fields/'), { params }).pipe(
      map(response => {
        // If the response has a 'results' property, return that, otherwise return the response itself
        return response.results || response;
      })
    );
  }

  createField(field: Partial<Field>): Observable<Field> {
    return this.http.post<Field>(this.getUrl('/fields/'), field);
  }

  updateField(id: number, field: Partial<Field>): Observable<Field> {
    return this.http.patch<Field>(this.getUrl(`/fields/${id}/`), field);
  }

  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/fields/${id}/`));
  }

  reorderFields(reportId: number, fieldOrders: Array<{ id: number; order: number }>): Observable<void> {
    const updates = fieldOrders.map(({ id, order }) =>
      this.updateField(id, { order })
    );
    return new Observable(observer => {
      Promise.all(updates.map(update => update.toPromise()))
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Filters
  getFilters(reportId: number): Observable<Filter[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<any>(this.getUrl('/filters/'), { params }).pipe(
      map(response => {
        // If the response has a 'results' property, return that, otherwise return the response itself
        return response.results || response;
      })
    );
  }

  createFilter(filter: Partial<Filter>): Observable<Filter> {
    return this.http.post<Filter>(this.getUrl('/filters/'), filter);
  }

  updateFilter(id: number, filter: Partial<Filter>): Observable<Filter> {
    return this.http.patch<Filter>(this.getUrl(`/filters/${id}/`), filter);
  }

  deleteFilter(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/filters/${id}/`));
  }

  // Parameters
  getParameters(reportId: number): Observable<Parameter[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<any>(this.getUrl('/parameters/'), { params }).pipe(
      map(response => {
        // If the response has a 'results' property, return that, otherwise return the response itself
        return response.results || response;
      })
    );
  }

  createParameter(parameter: Partial<Parameter>): Observable<Parameter> {
    return this.http.post<Parameter>(this.getUrl('/parameters/'), parameter);
  }

  updateParameter(id: number, parameter: Partial<Parameter>): Observable<Parameter> {
    return this.http.patch<Parameter>(this.getUrl(`/parameters/${id}/`), parameter);
  }

  deleteParameter(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/parameters/${id}/`));
  }

  // Joins
  getJoins(reportId: number): Observable<Join[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<Join[]>(this.getUrl('/joins/'), { params });
  }

  createJoin(join: Partial<Join>): Observable<Join> {
    return this.http.post<Join>(this.getUrl('/joins/'), join);
  }

  updateJoin(id: number, join: Partial<Join>): Observable<Join> {
    return this.http.patch<Join>(this.getUrl(`/joins/${id}/`), join);
  }

  deleteJoin(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/joins/${id}/`));
  }

  // Schedules
  getSchedules(reportId: number): Observable<Schedule[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<Schedule[]>(this.getUrl('/schedules/'), { params });
  }

  createSchedule(schedule: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(this.getUrl('/schedules/'), schedule);
  }

  updateSchedule(id: number, schedule: Partial<Schedule>): Observable<Schedule> {
    return this.http.patch<Schedule>(this.getUrl(`/schedules/${id}/`), schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(this.getUrl(`/schedules/${id}/`));
  }

  // Executions
  getExecutions(reportId: number): Observable<ReportExecution[]> {
    const params = new HttpParams().set('report', reportId.toString());
    return this.http.get<ReportExecution[]>(this.getUrl('/executions/'), { params });
  }

  // Utility methods
  getContentTypes(): Observable<Record<string, { label: string; content_types: ContentType[] }>> {
    return this.http.get<Record<string, { label: string; content_types: ContentType[] }>>(
      this.getUrl('/content-types/')
    );
  }

  getContentTypeFields(contentTypeId: number): Observable<{
    content_type: ContentType;
    fields: FieldInfo[];
  }> {
    const params = new HttpParams().set('content_type_id', contentTypeId.toString());
    return this.http.get<{
      content_type: ContentType;
      fields: FieldInfo[];
    }>(this.getUrl('/content-type-fields/'), { params });
  }

  getFieldLookups(fieldType: string): Observable<{ lookups: string[] }> {
    const params = new HttpParams().set('field_type', fieldType);
    return this.http.get<{ lookups: string[] }>(this.getUrl('/field-lookups/'), { params });
  }

  // Get field types from backend
// Get field types from backend
  getFieldTypes(): Observable<Array<{ id: number; code: string; name: string; name_ara: string; active_ind: boolean }>> {
    return this.http.get<{
      count: number;
      results: Array<{ id: number; code: string; name: string; name_ara: string; active_ind: boolean }>
    }>(
      this.getUrl('/field-types/')
    ).pipe(
      map(response => response.results || []),
      catchError(err => {
        console.error('Error loading field types:', err);
        return of([]);
      })
    );
  }
  // Get options for related fields (select/multiselect)
  getRelatedFieldOptions(contentTypeId: number, params?: {
    search?: string;
    limit?: number;
    value_field?: string;
    label_field?: string;
  }): Observable<Array<{ value: any; label: string }>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    // In a real implementation, this would call a backend endpoint like:
    // return this.http.get<Array<{ value: any; label: string }>>(
    //   this.getUrl(`/content-types/${contentTypeId}/options/`),
    //   { params: httpParams }
    // );

    // Simulating the API response for now
    return new Observable(observer => {
      setTimeout(() => {
        // Generate mock data based on content type
        const mockData = Array.from({ length: 20 }, (_, i) => ({
          value: i + 1,
          label: `Option ${i + 1} for Type ${contentTypeId}`
        }));

        // Apply search filter if provided
        let filtered = mockData;
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filtered = mockData.filter(item =>
            item.label.toLowerCase().includes(searchLower)
          );
        }

        // Apply limit if provided
        if (params?.limit) {
          filtered = filtered.slice(0, params.limit);
        }

        observer.next(filtered);
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  getBuilderData(reportId?: number): Observable<BuilderData> {
    let params = new HttpParams();
    if (reportId) {
      params = params.set('report_id', reportId.toString());
    }
    return this.http.get<BuilderData>(this.getUrl('/reports/builder_data/'), { params });
  }

  // Helper methods for UI
  getAggregationOptions(): Array<{ value: string; label: string }> {
    return [
      { value: '', label: 'None' },
      { value: 'count', label: 'Count' },
      { value: 'count_distinct', label: 'Count Distinct' },
      { value: 'sum', label: 'Sum' },
      { value: 'avg', label: 'Average' },
      { value: 'min', label: 'Minimum' },
      { value: 'max', label: 'Maximum' },
      { value: 'group_by', label: 'Group By' }
    ];
  }

  getOperatorOptions(fieldType: string): Array<{ value: string; label: string }> {
    console.log('getOperatorOptions called with fieldType:', fieldType);

    const baseOperators = [
      { value: 'eq', label: 'Equals' },
      { value: 'ne', label: 'Not Equals' },
      { value: 'isnull', label: 'Is Null' },
      { value: 'isnotnull', label: 'Is Not Null' }
    ];

    const numericOperators = [
      { value: 'gt', label: 'Greater Than' },
      { value: 'gte', label: 'Greater Than or Equal' },
      { value: 'lt', label: 'Less Than' },
      { value: 'lte', label: 'Less Than or Equal' },
      { value: 'between', label: 'Between' }
    ];

    const textOperators = [
      { value: 'contains', label: 'Contains' },
      { value: 'icontains', label: 'Contains (Case Insensitive)' },
      { value: 'startswith', label: 'Starts With' },
      { value: 'endswith', label: 'Ends With' },
      { value: 'regex', label: 'Regex' }
    ];

    const listOperators = [
      { value: 'in', label: 'In List' },
      { value: 'not_in', label: 'Not In List' }
    ];

    const dateOperators = [
      { value: 'date_range', label: 'Date Range' },
      ...numericOperators
    ];

    let result: Array<{ value: string; label: string }> = [];

    // Convert to lowercase and remove 'Field' suffix for comparison
    const normalizedType = fieldType.toLowerCase().replace('field', '');

    switch (normalizedType) {
      case 'integer':
      case 'float':
      case 'decimal':
      case 'bigauto':
      case 'auto':
      case 'biginteger':
        result = [...baseOperators, ...numericOperators];
        break;
      case 'char':
      case 'text':
      case 'email':
      case 'url':
        result = [...baseOperators, ...textOperators, ...listOperators];
        break;
      case 'date':
      case 'datetime':
        result = [...baseOperators, ...dateOperators];
        break;
      case 'boolean':
        result = baseOperators.filter(op => ['eq', 'ne'].includes(op.value));
        break;
      case 'foreignkey':
      case 'manytomany':
        result = [...baseOperators, ...listOperators];
        break;
      default:
        console.warn('Unknown field type, using default operators:', fieldType);
        result = baseOperators;
        break;
    }

    console.log('getOperatorOptions returning:', result);
    return result;
  }
  getParameterTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'text', label: 'Text' },
      { value: 'number', label: 'Number' },
      { value: 'date', label: 'Date' },
      { value: 'datetime', label: 'Date & Time' },
      { value: 'date_range', label: 'Date Range' },
      { value: 'select', label: 'Select (Single)' },
      { value: 'multiselect', label: 'Select (Multiple)' },
      { value: 'boolean', label: 'Yes/No' },
      { value: 'user', label: 'User' }
    ];
  }

  getDynamicValues(): Array<{ type: string; label: string }> {
    return [
      { type: 'today', label: 'Today' },
      { type: 'yesterday', label: 'Yesterday' },
      { type: 'tomorrow', label: 'Tomorrow' },
      { type: 'current_week_start', label: 'Start of Current Week' },
      { type: 'current_week_end', label: 'End of Current Week' },
      { type: 'current_month_start', label: 'Start of Current Month' },
      { type: 'current_month_end', label: 'End of Current Month' },
      { type: 'current_year_start', label: 'Start of Current Year' },
      { type: 'current_year_end', label: 'End of Current Year' },
      { type: 'current_user_id', label: 'Current User ID' },
      { type: 'current_user_email', label: 'Current User Email' }
    ];
  }

  // Formatting helpers
  getFormattingTypes(): Array<{ value: string; label: string; icon: string }> {
    return [
      { value: 'currency', label: 'Currency', icon: 'attach_money' },
      { value: 'percentage', label: 'Percentage', icon: 'percent' },
      { value: 'number', label: 'Number', icon: 'numbers' },
      { value: 'date', label: 'Date', icon: 'calendar_today' },
      { value: 'datetime', label: 'Date & Time', icon: 'schedule' },
      { value: 'email', label: 'Email', icon: 'email' },
      { value: 'url', label: 'URL', icon: 'link' },
      { value: 'conditional', label: 'Conditional', icon: 'rule' }
    ];
  }
}
