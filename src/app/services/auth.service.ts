// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { LoginRequest, LoginResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const baseUrl = this.configService.getBaseUrl();
    return this.http.post<LoginResponse>(`${baseUrl}/auth/login/`, credentials)
      .pipe(
        tap(response => {
          console.log('Access Token:', response.access); // ✅ Debug line
          console.log('Access Token:', response.access); // ✅ Debug line

          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          console.log('Access Token:', localStorage.getItem('access_token')); // ✅ Debug line
          console.log('refresh Token:', localStorage.getItem('refresh_token')); // ✅ Debug line
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticatedSubject.next(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private checkAuthStatus(): void {
    const token = this.getAccessToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
