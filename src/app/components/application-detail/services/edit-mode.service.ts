// services/edit-mode.service.ts - FIXED
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service'; // FIXED: Correct import path
import { Resource, ResourceField, TableData } from '../models/resource.model';

export interface EditModeState {
  isEditing: boolean;
  originalData: any | null;
  currentData: any | null;
  hasChanges: boolean;
  loadingRecord: boolean;
  error: string | null;
  fieldChanges: { [key: string]: boolean };
}

export interface EditModeConfig {
  autoSave: boolean;
  confirmOnCancel: boolean;
  loadFreshData: boolean;
  trackChanges: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EditModeService {
  private editStateSubject = new BehaviorSubject<EditModeState>({
    isEditing: false,
    originalData: null,
    currentData: null,
    hasChanges: false,
    loadingRecord: false,
    error: null,
    fieldChanges: {}
  });

  public editState$ = this.editStateSubject.asObservable();

  constructor(private apiService: ApiService) {} // FIXED: Made private instead of public

  get currentState(): EditModeState {
    return this.editStateSubject.value;
  }

  // Initialize edit mode with fresh data loading
  initializeEditMode(
      resource: Resource,
      recordId: any,
      config: Partial<EditModeConfig> = {}
  ): Observable<any> {
    const defaultConfig: EditModeConfig = {
      autoSave: false,
      confirmOnCancel: true,
      loadFreshData: true,
      trackChanges: true,
      ...config
    };

    this.updateState({
      isEditing: true,
      loadingRecord: true,
      error: null,
      fieldChanges: {}
    });

    if (defaultConfig.loadFreshData && recordId) {
      return this.loadRecordData(resource, recordId);
    } else {
      // Use existing data if available
      return of(this.currentState.originalData);
    }
  }

  // Load fresh record data for editing
  private loadRecordData(resource: Resource, recordId: any): Observable<any> {
    if (!resource.detailEndpoint) {
      const error = 'No detail endpoint available for this resource';
      this.updateState({ error, loadingRecord: false });
      throw new Error(error);
    }

    const path = this.cleanPath(resource.detailEndpoint.path, recordId);

    return this.apiService.executeApiCall(path, 'GET').pipe(
        map(data => {
          // FIXED: Add null check before spreading
          const safeData = data || {};
          this.updateState({
            originalData: { ...safeData },
            currentData: { ...safeData },
            loadingRecord: false,
            error: null,
            hasChanges: false,
            fieldChanges: {}
          });
          return data;
        }),
        catchError(error => {
          this.updateState({
            error: `Failed to load record: ${error.message || 'Unknown error'}`,
            loadingRecord: false
          });
          throw error;
        })
    );
  }

  // Set edit data (for cases where we already have the data)
  setEditData(data: any): void {
    // FIXED: Add null check before spreading
    const safeData = data || {};
    this.updateState({
      isEditing: true,
      originalData: { ...safeData },
      currentData: { ...safeData },
      hasChanges: false,
      loadingRecord: false,
      error: null,
      fieldChanges: {}
    });
  }

  // Track field changes
  updateField(fieldName: string, newValue: any): void {
    const state = this.currentState;
    if (!state.isEditing || !state.originalData) return;

    const originalValue = state.originalData[fieldName];
    const hasChanged = !this.deepEqual(originalValue, newValue);

    const updatedCurrentData = {
      ...(state.currentData || {}), // FIXED: Add null check
      [fieldName]: newValue
    };

    const updatedFieldChanges = {
      ...state.fieldChanges,
      [fieldName]: hasChanged
    };

    const hasAnyChanges = Object.values(updatedFieldChanges).some(changed => changed);

    this.updateState({
      currentData: updatedCurrentData,
      fieldChanges: updatedFieldChanges,
      hasChanges: hasAnyChanges
    });
  }

  // Get changed fields only
  getChangedFields(): any {
    const state = this.currentState;
    if (!state.isEditing || !state.hasChanges || !state.currentData) return {};

    const changedData: any = {};
    Object.keys(state.fieldChanges).forEach(fieldName => {
      if (state.fieldChanges[fieldName]) {
        changedData[fieldName] = state.currentData[fieldName];
      }
    });

    return changedData;
  }

  // Get all current data
  getCurrentData(): any {
    return this.currentState.currentData || {};
  }

  // Check if specific field has changed
  hasFieldChanged(fieldName: string): boolean {
    return this.currentState.fieldChanges[fieldName] || false;
  }

  // Reset field to original value
  resetField(fieldName: string): void {
    const state = this.currentState;
    if (!state.isEditing || !state.originalData) return;

    const originalValue = state.originalData[fieldName];
    this.updateField(fieldName, originalValue);
  }

  // Reset all changes
  resetAllChanges(): void {
    const state = this.currentState;
    if (!state.isEditing || !state.originalData) return;

    // FIXED: Add null check before spreading
    const safeOriginalData = state.originalData || {};
    this.updateState({
      currentData: { ...safeOriginalData },
      hasChanges: false,
      fieldChanges: {}
    });
  }

  // Exit edit mode
  exitEditMode(): void {
    this.updateState({
      isEditing: false,
      originalData: null,
      currentData: null,
      hasChanges: false,
      loadingRecord: false,
      error: null,
      fieldChanges: {}
    });
  }

  // Check if we can safely exit (no unsaved changes)
  canSafelyExit(): boolean {
    return !this.currentState.hasChanges;
  }

  // Get summary of changes for user confirmation
  getChangesSummary(): { field: string; oldValue: any; newValue: any }[] {
    const state = this.currentState;
    if (!state.isEditing || !state.hasChanges || !state.originalData || !state.currentData) return [];

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    Object.keys(state.fieldChanges).forEach(fieldName => {
      if (state.fieldChanges[fieldName]) {
        changes.push({
          field: fieldName,
          oldValue: state.originalData[fieldName],
          newValue: state.currentData[fieldName]
        });
      }
    });

    return changes;
  }

  private updateState(updates: Partial<EditModeState>): void {
    const currentState = this.editStateSubject.value;
    this.editStateSubject.next({ ...currentState, ...updates });
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  }

  private cleanPath(path: string, id?: any): string {
    let cleanedPath = path.replace(/\/$/, '');
    if (id) {
      cleanedPath = cleanedPath.replace(/<pk>/, id.toString());
    }
    cleanedPath = cleanedPath.replace(/<[^>]+>/g, '');
    cleanedPath = cleanedPath.replace(/\.<format>/, '');
    cleanedPath = cleanedPath.replace(/\./, '');
    cleanedPath = cleanedPath.replace(/\?\?$/, '');
    return cleanedPath;
  }

  // getCurrentData(): any {
  //   return this.currentState.currentData || {};
  // }

  // Get all data including unchanged fields (for PUT requests)
  getAllData(): any {
    const state = this.currentState;
    if (!state.isEditing || !state.originalData) return {};

    // Start with original data
    const allData: any = { ...state.originalData };

    // Override with current changes
    if (state.currentData) {
      Object.keys(state.currentData).forEach(key => {
        allData[key] = state.currentData[key];
      });
    }

    return allData;
  }

  // Get original data
  getOriginalData(): any {
    return this.currentState.originalData || {};
  }
}
