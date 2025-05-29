import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { ApiResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

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
