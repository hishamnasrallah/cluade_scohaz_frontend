import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { ApiResponse } from '../models/api.models';

export interface LookupResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LookupItem[];
}

export interface LookupItem {
  id: number;
  parent_lookup?: number;
  type: number;
  name: string;
  name_ara: string;
  code: string;
  icon?: string | null;
  active_ind: boolean;
}

export interface Page {
  id?: number;
  name: string;
  name_ara?: string;
  description?: string;
  description_ara?: string;
  active_ind: boolean;
  service: number;
  sequence_number: number;
  applicant_type: number;
}

export interface Category {
  id?: number;
  name: string;
  name_ara?: string;
  page: number[];
  is_repeatable: boolean;
  description?: string;
  code?: string;
  active_ind: boolean;
}

export interface Field {
  id?: number;
  _field_name: string;
  _sequence?: number;
  _field_display_name: string;
  _field_display_name_ara?: string;
  _field_type: number;
  _category: number[];
  service: number[];
  _parent_field?: number | null;
  _lookup?: number | null;
  _max_length?: number;
  _min_length?: number;
  _mandatory: boolean;
  _is_hidden: boolean;
  _is_disabled: boolean;
  active_ind: boolean;
  // ... other field properties
}

export interface FieldType {
  id: number;
  name: string;
  name_ara: string;
  code: string;
  active_ind: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}


  private getApiUrl(endpoint: string): string {
    const baseUrl = this.configService.getBaseUrl();
    return `${baseUrl}${endpoint}`;
  }

  // Lookup APIs
  getLookups(name: string): Observable<LookupResponse> {
    const params = new HttpParams().set('name', name);
    return this.http.get<LookupResponse>(this.getApiUrl('/lookups/'), { params });
  }

  // Page APIs
  getPages(): Observable<{ count: number; results: Page[] }> {
    return this.http.get<{ count: number; results: Page[] }>(this.getApiUrl('/define/api/pages/'));
  }

  createPage(page: Page): Observable<Page> {
    return this.http.post<Page>(this.getApiUrl('/define/api/pages/'), page);
  }

  updatePage(id: number, page: Page): Observable<Page> {
    return this.http.put<Page>(this.getApiUrl(`/define/api/pages/${id}/`), page);
  }

  // Category APIs
  getCategories(): Observable<{ count: number; results: Category[] }> {
    return this.http.get<{ count: number; results: Category[] }>(this.getApiUrl('/define/api/categories/'));
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.getApiUrl('/define/api/categories/'), category);
  }

  // Field APIs
  getFields(): Observable<{ count: number; results: Field[] }> {
    return this.http.get<{ count: number; results: Field[] }>(this.getApiUrl('/define/api/fields/'));
  }

  createField(field: Field): Observable<Field> {
    return this.http.post<Field>(this.getApiUrl('/define/api/fields/'), field);
  }

  getFieldTypes(): Observable<{ count: number; results: FieldType[] }> {
    return this.http.get<{ count: number; results: FieldType[] }>(this.getApiUrl('/define/api/field-types/'));
  }

  getApplications(): Observable<ApiResponse> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.get<ApiResponse>(`${baseUrl}/api/applications/categorized-urls/`);
  }

  // ENHANCED to handle FormData for file uploads
  executeApiCall(endpoint: string, method: string, data?: any): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const url = `${baseUrl}/${endpoint}`;

    // Check if data is FormData (for file uploads)
    const isFormData = data instanceof FormData;

    const options: any = {};

    if (!isFormData) {
      // Set JSON content type for regular data
      options.headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    // For FormData, don't set Content-Type header - let browser set it with boundary

    switch (method.toUpperCase()) {
      case 'GET':
        return this.http.get(url, options);
      case 'POST':
        return this.http.post(url, data, options);
      case 'PUT':
        return this.http.put(url, data, options);
      case 'PATCH':
        return this.http.patch(url, data, options);
      case 'DELETE':
        return this.http.delete(url, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // Specialized method for file uploads
  uploadFile(endpoint: string, file: File, additionalData?: any): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const url = `${baseUrl}/${endpoint}`;

    const formData = new FormData();
    formData.append('file', file, file.name);

    // Add any additional form data
    if (additionalData) {
      for (const key in additionalData) {
        if (additionalData[key] !== null && additionalData[key] !== undefined) {
          formData.append(key, additionalData[key].toString());
        }
      }
    }

    // Don't set Content-Type header for FormData - let browser handle it
    return this.http.post(url, formData);
  }

  // Helper method to determine if endpoint supports file uploads
  supportsFileUpload(endpoint: string): boolean {
    // You can implement logic here to determine if an endpoint supports file uploads
    // based on the endpoint path or other criteria
    return true; // For now, assume all endpoints support file uploads
  }
}
