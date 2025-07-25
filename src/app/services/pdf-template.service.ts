// src/app/services/pdf-template.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import {
  PDFTemplate,
  PDFTemplateElement,
  PDFTemplateParameter,
  PDFTemplateDataSource,
  PDFTemplateVariable,
  PDFGenerationLog,
  TemplateCategory,
  GeneratePDFRequest,
  DesignerData,
  ContentTypeModel,
  TemplatePreview,
  PreviewDataRequest,
  ValidateParametersRequest,
  ValidateParametersResponse
} from '../models/pdf-template.models';

export interface ListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PDFTemplateService {
  private apiUrl = 'reports';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    // Debug logging
    console.log('ConfigService base URL:', this.configService.getBaseUrl());
    console.log('Sample full URL:', this.getFullUrl('/test/'));
  }

  private isValidUrl(url: string): boolean {
    try {
      // For relative URLs
      if (url.startsWith('/')) {
        return true;
      }
      // For absolute URLs
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  private getFullUrl(endpoint: string): string {
    const baseUrl = this.configService.getBaseUrl() || '';

    // If baseUrl is empty or just '/', use a relative URL
    if (!baseUrl || baseUrl === '/') {
      return `${this.apiUrl}${endpoint}`;
    }

    // Ensure baseUrl doesn't end with slash and apiUrl starts with slash
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanApiUrl = this.apiUrl.startsWith('/') ? this.apiUrl : '/' + this.apiUrl;

    console.log('PDF Template Service URL:', `${cleanBaseUrl}${cleanApiUrl}${endpoint}`); // Debug log

    return `${cleanBaseUrl}${cleanApiUrl}${endpoint}`;
  }

  // Template CRUD operations
  getTemplates(params?: HttpParams): Observable<ListResponse<PDFTemplate>> {
    return this.http.get<ListResponse<PDFTemplate>>(
      this.getFullUrl('/templates/'),
      { params }
    );
  }

  getTemplate(id: number): Observable<PDFTemplate> {
    return this.http.get<PDFTemplate>(this.getFullUrl(`/templates/${id}/`));
  }

  createTemplate(template: Partial<PDFTemplate>): Observable<PDFTemplate> {
    return this.http.post<PDFTemplate>(
      this.getFullUrl('/templates/'),
      template
    );
  }

  updateTemplate(id: number, template: Partial<PDFTemplate>): Observable<PDFTemplate> {
    return this.http.patch<PDFTemplate>(
      this.getFullUrl(`/templates/${id}/`),
      template
    );
  }

  deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(this.getFullUrl(`/templates/${id}/`));
  }

  duplicateTemplate(id: number, newName: string): Observable<PDFTemplate> {
    return this.http.post<PDFTemplate>(
      this.getFullUrl(`/templates/${id}/duplicate/`),
      { name: newName }
    );
  }

  getMyTemplates(): Observable<TemplateCategory> {
    const url = this.getFullUrl('/my-templates/');
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL for getMyTemplates:', url);
      return throwError(() => new Error('Invalid API URL configuration'));
    }
    return this.http.get<TemplateCategory>(url);
  }

  getDesignerData(): Observable<DesignerData> {
    const url = this.getFullUrl('/designer-data/');
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL for getDesignerData:', url);
      return throwError(() => new Error('Invalid API URL configuration'));
    }
    return this.http.get<DesignerData>(url);
  }

  // Parameter operations
  getParameters(templateId: number): Observable<ListResponse<PDFTemplateParameter>> {
    const params = new HttpParams().set('template', templateId.toString());
    return this.http.get<ListResponse<PDFTemplateParameter>>(
      this.getFullUrl('/parameters/'),
      { params }
    );
  }

  createParameter(parameter: PDFTemplateParameter): Observable<PDFTemplateParameter> {
    return this.http.post<PDFTemplateParameter>(
      this.getFullUrl('/parameters/'),
      parameter
    );
  }

  updateParameter(id: number, parameter: Partial<PDFTemplateParameter>): Observable<PDFTemplateParameter> {
    return this.http.patch<PDFTemplateParameter>(
      this.getFullUrl(`/parameters/${id}/`),
      parameter
    );
  }

  deleteParameter(id: number): Observable<void> {
    return this.http.delete<void>(this.getFullUrl(`/parameters/${id}/`));
  }

  // Element operations
  getElements(templateId: number): Observable<ListResponse<PDFTemplateElement>> {
    const params = new HttpParams().set('template', templateId.toString());
    return this.http.get<ListResponse<PDFTemplateElement>>(
      this.getFullUrl('/elements/'),
      { params }
    );
  }

  createElement(element: PDFTemplateElement): Observable<PDFTemplateElement> {
    return this.http.post<PDFTemplateElement>(
      this.getFullUrl('/elements/'),
      element
    );
  }

  updateElement(id: number, element: Partial<PDFTemplateElement>): Observable<PDFTemplateElement> {
    return this.http.patch<PDFTemplateElement>(
      this.getFullUrl(`/elements/${id}/`),
      element
    );
  }

  deleteElement(id: number): Observable<void> {
    return this.http.delete<void>(this.getFullUrl(`/elements/${id}/`));
  }

  // Data source operations
  getDataSources(templateId: number): Observable<ListResponse<PDFTemplateDataSource>> {
    const params = new HttpParams().set('template', templateId.toString());
    return this.http.get<ListResponse<PDFTemplateDataSource>>(
      this.getFullUrl('/data-sources/'),
      { params }
    );
  }

  createDataSource(dataSource: PDFTemplateDataSource): Observable<PDFTemplateDataSource> {
    return this.http.post<PDFTemplateDataSource>(
      this.getFullUrl('/data-sources/'),
      dataSource
    );
  }

  updateDataSource(id: number, dataSource: Partial<PDFTemplateDataSource>): Observable<PDFTemplateDataSource> {
    return this.http.patch<PDFTemplateDataSource>(
      this.getFullUrl(`/data-sources/${id}/`),
      dataSource
    );
  }

  deleteDataSource(id: number): Observable<void> {
    return this.http.delete<void>(this.getFullUrl(`/data-sources/${id}/`));
  }

  // Variable operations
  getVariables(templateId: number): Observable<ListResponse<PDFTemplateVariable>> {
    const params = new HttpParams().set('template', templateId.toString());
    return this.http.get<ListResponse<PDFTemplateVariable>>(
      this.getFullUrl('/variables/'),
      { params }
    );
  }

  createVariable(variable: PDFTemplateVariable): Observable<PDFTemplateVariable> {
    return this.http.post<PDFTemplateVariable>(
      this.getFullUrl('/variables/'),
      variable
    );
  }

  updateVariable(id: number, variable: Partial<PDFTemplateVariable>): Observable<PDFTemplateVariable> {
    return this.http.patch<PDFTemplateVariable>(
      this.getFullUrl(`/variables/${id}/`),
      variable
    );
  }

  deleteVariable(id: number): Observable<void> {
    return this.http.delete<void>(this.getFullUrl(`/variables/${id}/`));
  }

  // Template operations
  getParameterSchema(templateId: number, includeSamples = false): Observable<any> {
    const params = new HttpParams().set('include_samples', includeSamples.toString());
    return this.http.get<any>(
      this.getFullUrl(`/templates/${templateId}/parameter_schema/`),
      { params }
    );
  }

  validateParameters(templateId: number, parameters: Record<string, any>): Observable<ValidateParametersResponse> {
    return this.http.post<ValidateParametersResponse>(
      this.getFullUrl(`/templates/${templateId}/validate_parameters/`),
      { parameters }
    );
  }

  previewData(templateId: number, parameters: Record<string, any>): Observable<TemplatePreview> {
    return this.http.post<TemplatePreview>(
      this.getFullUrl(`/templates/${templateId}/preview_data/`),
      { parameters }
    );
  }

  testGenerate(templateId: number, parameters: Record<string, any>, language?: string): Observable<Blob> {
    return this.http.post(
      this.getFullUrl(`/templates/${templateId}/test_generate/`),
      { parameters, language, use_sample_data: false },
      { responseType: 'blob' }
    );
  }

  generatePDF(request: GeneratePDFRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      this.getFullUrl('/generate/'),
      request,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }

  // Utility endpoints
  getContentTypes(): Observable<ContentTypeModel[]> {
    const url = this.getFullUrl('/reports/content-types/');
    if (!this.isValidUrl(url)) {
      console.error('Invalid URL for getContentTypes:', url);
      return throwError(() => new Error('Invalid API URL configuration'));
    }
    return this.http.get<ContentTypeModel[]>(url);
  }

  // Updated getGenerationLogs to accept both HttpParams and plain objects
  getGenerationLogs(params?: HttpParams | any): Observable<ListResponse<PDFGenerationLog>> {
    // Convert plain object to HttpParams if needed
    let httpParams: HttpParams | undefined;

    if (params && !(params instanceof HttpParams)) {
      httpParams = new HttpParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams!.set(key, params[key].toString());
        }
      });
    } else {
      httpParams = params;
    }

    return this.http.get<ListResponse<PDFGenerationLog>>(
      this.getFullUrl('/logs/'),
      { params: httpParams }
    );
  }

  // Helper methods for file operations
  downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  displayPDF(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up after a delay
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  }

  // Batch operations for wizard
  saveTemplateWithRelations(
    template: Partial<PDFTemplate>,
    parameters: PDFTemplateParameter[],
    dataSources: PDFTemplateDataSource[],
    elements: PDFTemplateElement[],
    variables: PDFTemplateVariable[]
  ): Observable<PDFTemplate> {
    // Create template with all relations
    const templateData = {
      ...template,
      parameters,
      data_sources: dataSources,
      elements,
      variables
    };

    return this.createTemplate(templateData);
  }

  updateTemplateWithRelations(
    templateId: number,
    template: Partial<PDFTemplate>,
    parameters: PDFTemplateParameter[],
    dataSources: PDFTemplateDataSource[],
    elements: PDFTemplateElement[],
    variables: PDFTemplateVariable[]
  ): Observable<PDFTemplate> {
    // Update template with all relations
    const templateData = {
      ...template,
      parameters,
      data_sources: dataSources,
      elements,
      variables
    };

    return this.updateTemplate(templateId, templateData);
  }

  // Export/Import templates
  exportTemplate(templateId: number): Observable<any> {
    return this.http.get(
      this.getFullUrl(`/templates/${templateId}/export/`),
      { responseType: 'json' }
    );
  }

  importTemplate(templateData: any): Observable<PDFTemplate> {
    return this.http.post<PDFTemplate>(
      this.getFullUrl('/templates/import/'),
      templateData
    );
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('PDF Template Service Error:', error);
    return throwError(() => error);
  }
}
