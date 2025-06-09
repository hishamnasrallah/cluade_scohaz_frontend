// services/case.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CasesResponse } from '../components/applications-inbox/applications-inbox.component';

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  constructor(private apiService: ApiService) {}

  /**
   * Get employee cases (both assigned and available)
   */
  getEmployeeCases(): Observable<CasesResponse> {
    return this.apiService.executeApiCall('case/cases/employee/', 'GET');
  }

  /**
   * Assign a case to the current employee
   * @param caseId - The ID of the case to assign
   */
  assignCase(caseId: number): Observable<any> {
    return this.apiService.executeApiCall(`case/cases/assign_case/?case_id=${caseId}`, 'PUT');
  }

  /**
   * Perform an action on a case
   * @param caseId - The ID of the case
   * @param actionId - The ID of the action to perform
   */
  performCaseAction(caseId: number, actionId: number): Observable<any> {
    return this.apiService.executeApiCall(`case/cases/${caseId}/action/?action_id=${actionId}`, 'POST');
  }
}
