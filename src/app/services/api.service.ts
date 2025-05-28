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

  executeApiCall(endpoint: string, method: string, data?: any): Observable<any> {
    const baseUrl = this.configService.getBaseUrl();
    const url = `${baseUrl}/${endpoint}`;

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

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
}
