// src/app/services/simple-pdf.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

import {
  SimplePDFTemplate,
  SimplePDFElement,
  ContentType,
  ContentTypeWithFields,
  SimplePDFGenerateRequest,
  BulkCreateRequest, SimplePDFTemplateResponse
} from '../models/simple-pdf.models';

@Injectable({
  providedIn: 'root'
})
export class SimplePDFService {
  private apiPath = 'simple_reports';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // Template CRUD operations
  getTemplates(): Observable<SimplePDFTemplate[]> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/`, 'GET').pipe(
      map((response: SimplePDFTemplateResponse) => response.results)
    );
  }

  getTemplate(id: number): Observable<SimplePDFTemplate> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/${id}/`, 'GET');
  }

  createTemplate(template: SimplePDFTemplate): Observable<SimplePDFTemplate> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/`, 'POST', template);
  }

  updateTemplate(id: number, template: Partial<SimplePDFTemplate>): Observable<SimplePDFTemplate> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/${id}/`, 'PATCH', template);
  }

  deleteTemplate(id: number): Observable<void> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/${id}/`, 'DELETE');
  }

  // Element CRUD operations
  getElements(templateId?: number): Observable<SimplePDFElement[]> {
    let url = `${this.apiPath}/elements/`;
    if (templateId) {
      url += `?template_id=${templateId}`;
    }
    return this.apiService.executeApiCall(url, 'GET');
  }

  createElement(element: SimplePDFElement): Observable<SimplePDFElement> {
    return this.apiService.executeApiCall(`${this.apiPath}/elements/`, 'POST', element);
  }

  updateElement(id: number, element: Partial<SimplePDFElement>): Observable<SimplePDFElement> {
    return this.apiService.executeApiCall(`${this.apiPath}/elements/${id}/`, 'PATCH', element);
  }

  deleteElement(id: number): Observable<void> {
    return this.apiService.executeApiCall(`${this.apiPath}/elements/${id}/`, 'DELETE');
  }

  // Bulk operations
  bulkCreateTemplate(request: BulkCreateRequest): Observable<SimplePDFTemplate> {
    return this.apiService.executeApiCall(`${this.apiPath}/templates/bulk-create/`, 'POST', request);
  }

  duplicateTemplate(id: number, name?: string, code?: string): Observable<SimplePDFTemplate> {
    const body = name || code ? { name, code } : {};
    return this.apiService.executeApiCall(`${this.apiPath}/templates/${id}/duplicate/`, 'POST', body);
  }

  // PDF Generation - Special handling for blob response
  generatePDF(request: SimplePDFGenerateRequest): Observable<HttpResponse<Blob>> {
    // Use http directly for blob responses since ApiService doesn't handle response type
    const baseUrl = (this.apiService as any).configService.getBaseUrl();
    return this.http.post(`${baseUrl}/${this.apiPath}/generate/`, request, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // Content Types
  getContentTypes(): Observable<ContentType[]> {
    return this.apiService.executeApiCall(`${this.apiPath}/content-types/`, 'GET').pipe(
      map((types: ContentType[]) => types.map(type => ({
        ...type,
        display_name: `${type.app_label}.${type.model}`
      })))
    );
  }

  getContentTypeFields(id: number): Observable<ContentTypeWithFields> {
    return this.apiService.executeApiCall(`${this.apiPath}/content-types/${id}/fields/`, 'GET');
  }

  // Utility methods
  downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Preview PDF in new tab
  previewPDF(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up after a delay
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }
}
