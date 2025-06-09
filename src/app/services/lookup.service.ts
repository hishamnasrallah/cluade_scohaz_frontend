// services/lookup.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private cache: { [key: string]: any[] } = {};

  constructor(private apiService: ApiService) {}

  /**
   * Get case types lookup data
   */
  getCaseTypes(): Observable<any[]> {
    return this.getLookupData('case_type');
  }

  /**
   * Get status lookup data
   */
  getStatuses(): Observable<any[]> {
    return this.getLookupData('status');
  }

  /**
   * Get gender lookup data
   */
  getGenders(): Observable<any[]> {
    return this.getLookupData('gender');
  }

  /**
   * Get applicant types lookup data
   */
  getApplicantTypes(): Observable<any[]> {
    return this.getLookupData('applicant_type');
  }

  /**
   * Generic method to get lookup data by name
   * @param lookupName - The name of the lookup
   */
  getLookupData(lookupName: string): Observable<any[]> {
    // Check cache first
    if (this.cache[lookupName]) {
      return of(this.cache[lookupName]);
    }

    // Fetch from API
    return this.apiService.executeApiCall(`lookups/?name=${encodeURIComponent(lookupName)}`, 'GET')
      .pipe(
        catchError(error => {
          console.warn(`Failed to load lookup data for ${lookupName}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Get lookup value by name and ID
   * @param lookupName - The name of the lookup
   * @param id - The ID to find
   */
  getLookupValue(lookupName: string, id: number): Observable<string> {
    return new Observable(observer => {
      this.getLookupData(lookupName).subscribe(data => {
        const item = data.find(item => item.id === id);
        observer.next(item ? item.name : `ID: ${id}`);
        observer.complete();
      });
    });
  }

  /**
   * Clear cache for a specific lookup or all lookups
   * @param lookupName - Optional specific lookup name to clear
   */
  clearCache(lookupName?: string): void {
    if (lookupName) {
      delete this.cache[lookupName];
    } else {
      this.cache = {};
    }
  }
}
