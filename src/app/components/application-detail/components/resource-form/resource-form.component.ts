// components/enhanced-resource-form/enhanced-resource-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
  MatCardActions
} from '@angular/material/card';

import { Resource, ResourceField, RelationOption } from '../../models/resource.model';
import { FormBuilderService } from '../../services/form-builder.service';
import { FieldTypeUtils } from '../../utils/field-type.utils';
import { EditModeService, EditModeState } from '../../services/edit-mode.service';
import {
  ManyToManySelectorComponent,
  ManyToManyData
} from '../many-to-many-selector/many-to-many-selector.component';

export interface FileFieldInfo {
  hasExistingFile: boolean;
  existingFileUrl?: string;
  existingFileName?: string;
  newFile?: File;
  replaceFile: boolean;
}

@Component({
  selector: 'app-enhanced-resource-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSlideToggleModule,
    FormsModule
  ],
  template: `
    <div class="form-overlay" (click)="onOverlayClick($event)">
      <mat-card class="enhanced-form-card" (click)="$event.stopPropagation()">

        <!-- Enhanced Header -->
        <mat-card-header class="enhanced-form-header" [class.edit-mode]="editState.isEditing">
          <div class="header-content">
            <div class="title-section">
              <mat-card-title class="form-title">
                <mat-icon class="mode-icon">{{ editState.isEditing ? 'edit' : 'add' }}</mat-icon>
                {{ editState.isEditing ? 'Edit' : 'Create' }} {{ formatColumnName(resource.name) }}
              </mat-card-title>

              <!-- Edit Mode Indicators -->
              <div class="edit-indicators" *ngIf="editState.isEditing">
                <mat-chip class="edit-chip" *ngIf="!editState.hasChanges">
                  <mat-icon>lock</mat-icon>
                  No Changes
                </mat-chip>
                <mat-chip class="changes-chip" *ngIf="editState.hasChanges" [matBadge]="getChangedFieldsCount()" matBadgeColor="accent">
                  <mat-icon>edit</mat-icon>
                  {{ getChangedFieldsCount() }} Change{{ getChangedFieldsCount() !== 1 ? 's' : '' }}
                </mat-chip>
              </div>
            </div>

            <!-- Action Buttons in Header -->
            <div class="header-actions">
              <button mat-icon-button
                      *ngIf="editState.hasChanges"
                      (click)="resetAllChanges()"
                      matTooltip="Reset all changes"
                      class="reset-btn">
                <mat-icon>undo</mat-icon>
              </button>

              <button mat-icon-button
                      (click)="handleCancel()"
                      matTooltip="Close"
                      class="close-button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-header>

        <!-- Loading State for Edit Mode -->
        <div *ngIf="editState.loadingRecord" class="loading-edit-data">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading record data...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="editState.error" class="edit-error">
          <mat-icon class="error-icon">error</mat-icon>
          <div class="error-content">
            <h4>Error Loading Record</h4>
            <p>{{ editState.error }}</p>
            <button mat-button color="primary" (click)="retryLoadRecord()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </div>

        <mat-card-content class="enhanced-form-content" *ngIf="!editState.loadingRecord && !editState.error">

          <!-- Changes Summary (Collapsible) -->
          <mat-expansion-panel class="changes-summary" *ngIf="editState.hasChanges && editState.isEditing">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>compare_arrows</mat-icon>
                Changes Summary ({{ getChangedFieldsCount() }})
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="changes-list">
              <div *ngFor="let change of getChangesSummary()" class="change-item">
                <div class="change-field">{{ formatColumnName(change.field) }}</div>
                <div class="change-values">
                  <span class="old-value">{{ formatValue(change.oldValue) }}</span>
                  <mat-icon class="arrow">arrow_forward</mat-icon>
                  <span class="new-value">{{ formatValue(change.newValue) }}</span>
                  <button mat-icon-button
                          (click)="resetSingleField(change.field)"
                          matTooltip="Reset this field"
                          class="reset-field-btn">
                    <mat-icon>undo</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-expansion-panel>

          <!-- Auto-save Toggle -->
          <div class="form-options" *ngIf="editState.isEditing">
            <mat-slide-toggle
              [(ngModel)]="autoSaveEnabled"
              (change)="onAutoSaveToggle($event)"
              color="primary">
              <span>Auto-save changes</span>
              <mat-icon matTooltip="Automatically save changes as you type" class="info-icon">info</mat-icon>
            </mat-slide-toggle>
          </div>

          <!-- Main Form -->
          <form [formGroup]="form" (ngSubmit)="submitForm()" class="enhanced-dynamic-form">
            <div class="form-grid">
              <div *ngFor="let field of formFields; let i = index" class="form-field-container">

                <!-- Field Change Indicator -->
                <div class="field-header" *ngIf="editState.isEditing">
                  <span class="field-name">{{ formatColumnName(field.name) }}</span>
                  <div class="field-status">
                    <mat-icon *ngIf="hasFieldChanged(field.name)"
                              class="changed-icon"
                              matTooltip="This field has been modified">
                      edit
                    </mat-icon>
                    <button *ngIf="hasFieldChanged(field.name)"
                            mat-icon-button
                            (click)="resetSingleField(field.name)"
                            matTooltip="Reset this field"
                            class="field-reset-btn">
                      <mat-icon>undo</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Boolean checkbox -->
                <div *ngIf="isBooleanField(field)"
                     class="checkbox-container"
                     [class.field-error]="hasFieldError(field.name)"
                     [class.field-changed]="hasFieldChanged(field.name)">
                  <mat-checkbox [formControlName]="field.name"
                                (change)="onFieldChange(field.name, $event.checked)"
                                class="custom-checkbox">
                    {{ formatColumnName(field.name) }}
                    <span *ngIf="field.help_text" class="help-text">({{ field.help_text }})</span>
                  </mat-checkbox>

                  <div class="field-errors">
                    <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                      {{ formatColumnName(field.name) }} is required
                    </mat-error>
                    <div *ngFor="let error of getFieldErrors(field.name)" class="field-error-message">
                      <mat-icon class="error-icon-small">error</mat-icon>
                      {{ error }}
                    </div>
                  </div>
                </div>

                <!-- Enhanced File field -->
                <div *ngIf="isFileField(field)" class="enhanced-file-container">
                  <label class="file-label">{{ formatColumnName(field.name) }}</label>

                  <!-- Existing File Display (Edit Mode) -->
                  <div class="existing-file" *ngIf="editState.isEditing && getFileInfo(field.name).hasExistingFile">
                    <div class="file-info">
                      <mat-icon class="file-icon">attachment</mat-icon>
                      <div class="file-details">
                        <span class="file-name">{{ getFileInfo(field.name).existingFileName || 'Current File' }}</span>
                        <div class="file-actions">
                          <a [href]="getFileInfo(field.name).existingFileUrl"
                             target="_blank"
                             mat-button
                             color="primary"
                             class="view-file-btn">
                            <mat-icon>visibility</mat-icon>
                            View Current
                          </a>
                          <button mat-button
                                  color="accent"
                                  (click)="toggleFileReplace(field.name)"
                                  class="replace-file-btn">
                            <mat-icon>{{ getFileInfo(field.name).replaceFile ? 'cancel' : 'swap_horiz' }}</mat-icon>
                            {{ getFileInfo(field.name).replaceFile ? 'Keep Current' : 'Replace File' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- File Input (Always shown in create mode, conditionally in edit mode) -->
                  <div class="file-input-section"
                       *ngIf="!editState.isEditing || !getFileInfo(field.name).hasExistingFile || getFileInfo(field.name).replaceFile">
                    <input type="file"
                           [required]="field.required && (!editState.isEditing || !getFileInfo(field.name).hasExistingFile)"
                           [accept]="getFileAcceptTypes(field)"
                           (change)="onFileChange($event, field.name)"
                           class="file-input"
                           #fileInput>

                    <!-- Selected File Preview -->
                    <div class="selected-file-preview" *ngIf="getFileInfo(field.name).newFile">
                      <mat-icon class="preview-icon">insert_drive_file</mat-icon>
                      <span class="preview-name">{{ getFileInfo(field.name).newFile?.name }}</span>
                      <button mat-icon-button
                              (click)="clearFile(field.name, fileInput)"
                              class="clear-file-btn">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-errors">
                    <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                      {{ formatColumnName(field.name) }} is required
                    </mat-error>
                    <div *ngFor="let error of getFieldErrors(field.name)" class="field-error-message">
                      <mat-icon class="error-icon-small">error</mat-icon>
                      {{ error }}
                    </div>
                  </div>
                </div>

                <!-- Enhanced Many-to-Many field -->
                <div *ngIf="isManyToManyField(field)"
                     class="enhanced-many-to-many-container"
                     [class.field-changed]="hasFieldChanged(field.name)">
                  <label class="field-label">{{ formatColumnName(field.name) }}</label>

                  <!-- Selection Summary -->
                  <div class="selection-summary">
                    <div class="selection-count">
                      <mat-icon>group</mat-icon>
                      {{ getManyToManySelectedItems(field.name).length }} item{{ getManyToManySelectedItems(field.name).length !== 1 ? 's' : '' }} selected
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                      <button mat-icon-button
                              *ngIf="getManyToManySelectedItems(field.name).length > 0"
                              (click)="clearAllManyToMany(field.name)"
                              matTooltip="Clear all selections"
                              class="clear-all-btn">
                        <mat-icon>clear_all</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Selected items display -->
                  <div class="selected-items" *ngIf="getManyToManySelectedItems(field.name).length > 0">
                    <mat-chip-set class="selected-chips">
                      <mat-chip *ngFor="let item of getManyToManySelectedItems(field.name)"
                                (removed)="removeManyToManyItem(field.name, item.id)"
                                removable="true">
                        {{ item.display }}
                        <mat-icon matChipRemove>cancel</mat-icon>
                      </mat-chip>
                    </mat-chip-set>
                  </div>

                  <!-- No selection message -->
                  <div class="no-selection" *ngIf="getManyToManySelectedItems(field.name).length === 0">
                    <mat-icon class="no-selection-icon">info</mat-icon>
                    <span>No items selected</span>
                  </div>

                  <!-- Selection button -->
                  <button type="button"
                          mat-stroked-button
                          (click)="openManyToManySelector(field)"
                          class="selection-button">
                    <mat-icon>{{ getManyToManySelectedItems(field.name).length > 0 ? 'edit' : 'add' }}</mat-icon>
                    {{ getManyToManySelectedItems(field.name).length > 0 ? 'Edit Selection' : 'Select Items' }}
                    <span class="selection-count-badge" *ngIf="getManyToManySelectedItems(field.name).length > 0">
                      ({{ getManyToManySelectedItems(field.name).length }})
                    </span>
                  </button>

                  <div class="field-errors">
                    <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                      {{ formatColumnName(field.name) }} is required
                    </mat-error>
                    <div *ngFor="let error of getFieldErrors(field.name)" class="field-error-message">
                      <mat-icon class="error-icon-small">error</mat-icon>
                      {{ error }}
                    </div>
                  </div>
                </div>

                <!-- Enhanced Regular form fields -->
                <mat-form-field *ngIf="shouldShowFormField(field)"
                                appearance="outline"
                                class="enhanced-form-field"
                                [class.field-error]="hasFieldError(field.name)"
                                [class.field-changed]="hasFieldChanged(field.name)">

                  <mat-label>
                    {{ formatColumnName(field.name) }}
                    <mat-icon *ngIf="hasFieldChanged(field.name)" class="changed-indicator">edit</mat-icon>
                  </mat-label>

                  <!-- Text inputs -->
                  <input *ngIf="isTextInput(field)"
                         matInput
                         [type]="getInputType(field.type)"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name)"
                         (input)="onFieldChange(field.name, $event.target.value)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Number inputs -->
                  <input *ngIf="isNumberInput(field)"
                         matInput
                         type="number"
                         [step]="getNumberStep(field.type)"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name)"
                         (input)="onFieldChange(field.name, $event.target.value)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Date input -->
                  <ng-container *ngIf="isDateField(field)">
                    <input matInput
                           [matDatepicker]="datePicker"
                           [formControlName]="field.name"
                           [required]="field.required"
                           [placeholder]="'Select ' + formatColumnName(field.name)"
                           (dateChange)="onFieldChange(field.name, $event.value)"
                           [class.input-error]="hasFieldError(field.name)">
                    <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                    <mat-datepicker #datePicker></mat-datepicker>
                  </ng-container>

                  <!-- DateTime input -->
                  <input *ngIf="isDateTimeField(field)"
                         matInput
                         type="datetime-local"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Select ' + formatColumnName(field.name)"
                         (input)="onFieldChange(field.name, $event.target.value)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Time input -->
                  <input *ngIf="isTimeField(field)"
                         matInput
                         type="time"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Select ' + formatColumnName(field.name)"
                         (input)="onFieldChange(field.name, $event.target.value)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Select for choices -->
                  <mat-select *ngIf="hasChoices(field)"
                              [formControlName]="field.name"
                              [required]="field.required"
                              (selectionChange)="onFieldChange(field.name, $event.value)"
                              [class.input-error]="hasFieldError(field.name)">
                    <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                    <mat-option *ngFor="let choice of field.choices" [value]="choice.value">
                      {{ choice.label }}
                    </mat-option>
                  </mat-select>

                  <!-- Foreign Key / One-to-One relation fields -->
                  <mat-select *ngIf="isSingleRelationField(field)"
                              [formControlName]="field.name"
                              [required]="field.required"
                              (selectionChange)="onFieldChange(field.name, $event.value)"
                              [class.input-error]="hasFieldError(field.name)">
                    <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                    <mat-option *ngFor="let option of relationOptions[field.name]" [value]="option.id">
                      {{ option.display }}
                    </mat-option>
                  </mat-select>

                  <!-- Reset button for changed fields -->
                  <button *ngIf="hasFieldChanged(field.name)"
                          matSuffix
                          mat-icon-button
                          (click)="resetSingleField(field.name)"
                          matTooltip="Reset to original value"
                          class="field-reset-suffix">
                    <mat-icon>undo</mat-icon>
                  </button>

                  <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                    <mat-icon>error</mat-icon>
                    {{ formatColumnName(field.name) }} is required
                  </mat-error>

                  <div *ngFor="let error of getFieldErrors(field.name)" class="field-error-message">
                    <mat-icon class="error-icon-small">error</mat-icon>
                    {{ error }}
                  </div>
                </mat-form-field>
              </div>
            </div>
          </form>
        </mat-card-content>

        <!-- Enhanced Actions -->
        <mat-card-actions class="enhanced-form-actions" *ngIf="!editState.loadingRecord && !editState.error">
          <div class="actions-left">
            <button mat-button
                    *ngIf="editState.hasChanges"
                    (click)="resetAllChanges()"
                    class="reset-all-btn">
              <mat-icon>undo</mat-icon>
              Reset All Changes
            </button>
          </div>

          <div class="actions-right">
            <button mat-button
                    type="button"
                    (click)="handleCancel()"
                    class="cancel-btn">
              Cancel
            </button>

            <button mat-raised-button
                    color="primary"
                    type="button"
                    (click)="submitForm()"
                    [disabled]="(!form.valid || submitting) && !editState.hasChanges"
                    class="submit-btn">
              <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
              <mat-icon *ngIf="!submitting">{{ editState.isEditing ? 'save' : 'add' }}</mat-icon>
              <span *ngIf="!submitting">
                {{ editState.isEditing ? 'Save Changes' : 'Create' }}
                <span *ngIf="editState.hasChanges && editState.isEditing" class="changes-indicator">
                  ({{ getChangedFieldsCount() }})
                </span>
              </span>
              <span *ngIf="submitting">{{ editState.isEditing ? 'Saving...' : 'Creating...' }}</span>
            </button>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .enhanced-form-card {
      width: 90vw;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Enhanced Header */
    .enhanced-form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
    }

    .enhanced-form-header.edit-mode {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .title-section {
      flex: 1;
    }

    .form-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mode-icon {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 8px;
      font-size: 20px;
      width: 36px;
      height: 36px;
    }

    .edit-indicators {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .edit-chip, .changes-chip {
      background: rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      font-size: 12px;
      height: 28px;
    }

    .changes-chip {
      background: rgba(255, 193, 7, 0.9) !important;
      color: #333 !important;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .reset-btn, .close-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }

    .reset-btn:hover, .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Loading and Error States */
    .loading-edit-data, .edit-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .edit-error {
      color: #d32f2f;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-content h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    .error-content p {
      margin: 0 0 16px 0;
      opacity: 0.8;
    }

    /* Enhanced Content */
    .enhanced-form-content {
      padding: 32px;
      background: #fafafa;
    }

    .form-options {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid #e0e0e0;
    }

    .info-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
      margin-left: 8px;
    }

    /* Changes Summary */
    .changes-summary {
      margin-bottom: 24px;
      background: #e3f2fd;
      border: 1px solid #bbdefb;
    }

    .changes-summary .mat-expansion-panel-header {
      background: #bbdefb;
      color: #1565c0;
      font-weight: 600;
    }

    .changes-list {
      padding: 16px 0;
    }

    .change-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e3f2fd;
    }

    .change-item:last-child {
      border-bottom: none;
    }

    .change-field {
      font-weight: 600;
      color: #1565c0;
      min-width: 120px;
    }

    .change-values {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .old-value {
      background: #ffcdd2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .new-value {
      background: #c8e6c9;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .arrow {
      color: #666;
      font-size: 16px;
    }

    .reset-field-btn {
      width: 32px;
      height: 32px;
      color: #666;
    }

    /* Enhanced Form Grid */
    .enhanced-dynamic-form {
      width: 100%;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .form-field-container {
      width: 100%;
    }

    /* Field Headers */
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .field-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .field-status {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .changed-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ff9800;
    }

    .field-reset-btn {
      width: 24px;
      height: 24px;
      color: #666;
    }

    /* Enhanced Fields */
    .enhanced-form-field {
      width: 100%;
      background: white;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .enhanced-form-field.field-changed {
      background: rgba(255, 152, 0, 0.05);
      border: 2px solid rgba(255, 152, 0, 0.3);
      box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
    }

    .changed-indicator {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #ff9800;
      margin-left: 4px;
    }

    .field-reset-suffix {
      color: #666;
      width: 36px;
      height: 36px;
    }

    /* Enhanced File Fields */
    .enhanced-file-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .enhanced-file-container.field-changed {
      border: 2px solid rgba(255, 152, 0, 0.5);
      background: rgba(255, 152, 0, 0.05);
    }

    .file-label {
      display: block;
      margin-bottom: 16px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .existing-file {
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #ddd;
    }

    .file-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .file-icon {
      color: #666;
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 4px;
    }

    .file-details {
      flex: 1;
    }

    .file-name {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }

    .file-actions {
      display: flex;
      gap: 8px;
    }

    .view-file-btn, .replace-file-btn {
      height: 32px;
      font-size: 12px;
      padding: 0 12px;
    }

    .file-input-section {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      transition: border-color 0.3s ease;
    }

    .file-input-section:hover {
      border-color: #2196f3;
    }

    .file-input {
      width: 100%;
      font-size: 14px;
    }

    .selected-file-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 12px;
      background: #e3f2fd;
      border-radius: 6px;
    }

    .preview-icon {
      color: #1976d2;
    }

    .preview-name {
      flex: 1;
      font-size: 14px;
      color: #1976d2;
    }

    .clear-file-btn {
      width: 24px;
      height: 24px;
      color: #666;
    }

    /* Enhanced Many-to-Many */
    .enhanced-many-to-many-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .enhanced-many-to-many-container.field-changed {
      border: 2px solid rgba(255, 152, 0, 0.5);
      background: rgba(255, 152, 0, 0.05);
    }

    .selection-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .selection-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: #333;
    }

    .quick-actions {
      display: flex;
      gap: 4px;
    }

    .clear-all-btn {
      width: 32px;
      height: 32px;
      color: #f44336;
    }

    .selection-count-badge {
      font-weight: 600;
      color: #2196f3;
    }

    /* Field Errors */
    .field-errors {
      margin-top: 8px;
    }

    .field-error-message {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .error-icon-small {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Enhanced Actions */
    .enhanced-form-actions {
      padding: 24px 32px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions-left, .actions-right {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .reset-all-btn {
      color: #ff9800;
      border: 1px solid #ff9800;
      height: 40px;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
      height: 40px;
      padding: 0 24px;
    }

    .submit-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      height: 40px;
      padding: 0 32px;
      font-weight: 600;
      min-width: 140px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-btn:disabled {
      background: #ccc;
      color: #666;
    }

    .changes-indicator {
      font-size: 12px;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .enhanced-form-card {
        width: 95vw;
        margin: 10px;
      }

      .enhanced-form-content {
        padding: 20px;
      }

      .enhanced-form-actions {
        flex-direction: column;
        gap: 16px;
      }

      .actions-left, .actions-right {
        width: 100%;
        justify-content: center;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class EnhancedResourceFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() resource!: Resource;
  @Input() editingRecord: any = null;
  @Input() submitting = false;
  @Input() relationOptions: { [key: string]: RelationOption[] } = {};
  @Input() validationErrors: any = {};
  @Input() showDebug = false;

  @Output() onSubmit = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  form!: FormGroup;
  formFields: ResourceField[] = [];
  editState!: EditModeState;
  autoSaveEnabled = false;

  // File handling
  fileFields: { [key: string]: FileFieldInfo } = {};

  // Many-to-many handling
  manyToManySelections: { [key: string]: any[] } = {};

  private destroy$ = new Subject<void>();
  private autoSaveSubject = new Subject<string>();

  constructor(
    private formBuilder: FormBuilderService,
    private editModeService: EditModeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeEditMode();
    this.buildForm();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editModeService.exitEditMode();
  }

  ngOnChanges(): void {
    if (this.resource) {
      this.buildForm();
      this.resetFileFields();
      this.resetManyToManySelections();
    }

    if (this.validationErrors && Object.keys(this.validationErrors).length > 0) {
      this.setFormErrors();
    } else {
      this.clearServerErrors();
    }
  }

  private initializeEditMode(): void {
    // Subscribe to edit state changes
    this.editModeService.editState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.editState = state;
      });

    // Initialize edit mode if we have editing record
    if (this.editingRecord) {
      this.editModeService.setEditData(this.editingRecord);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.buildDynamicForm(this.resource, this.editingRecord);
    this.formFields = this.formBuilder.getFormFields(this.resource);

    // Setup form value changes tracking
    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(formValue => {
        // Update edit mode service with current form state
        Object.keys(formValue).forEach(fieldName => {
          this.editModeService.updateField(fieldName, formValue[fieldName]);
        });

        // Auto-save if enabled
        if (this.autoSaveEnabled && this.editState.hasChanges) {
          this.autoSaveSubject.next('auto-save');
        }
      });

    // Initialize file fields for edit mode
    if (this.editingRecord) {
      this.initializeFileFields();
      this.initializeManyToManyFields();
    }
  }

  private setupAutoSave(): void {
    this.autoSaveSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(2000) // Wait 2 seconds after last change
      )
      .subscribe(() => {
        if (this.autoSaveEnabled && this.editState.hasChanges && this.form.valid) {
          this.performAutoSave();
        }
      });
  }

  private performAutoSave(): void {
    const changedData = this.editModeService.getChangedFields();
    this.onSubmit.emit({ ...changedData, _autoSave: true });

    this.snackBar.open('Auto-saved changes', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  // File handling methods
  private initializeFileFields(): void {
    this.formFields.forEach(field => {
      if (this.isFileField(field) && this.editingRecord) {
        const existingValue = this.editingRecord[field.name];
        this.fileFields[field.name] = {
          hasExistingFile: !!existingValue,
          existingFileUrl: existingValue,
          existingFileName: this.extractFileName(existingValue),
          replaceFile: false
        };
      }
    });
  }

  private resetFileFields(): void {
    this.fileFields = {};
    this.initializeFileFields();
  }

  private extractFileName(url: string): string {
    if (!url) return '';
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || 'File';
    } catch {
      return 'File';
    }
  }

  getFileInfo(fieldName: string): FileFieldInfo {
    return this.fileFields[fieldName] || {
      hasExistingFile: false,
      replaceFile: false
    };
  }

  toggleFileReplace(fieldName: string): void {
    if (this.fileFields[fieldName]) {
      this.fileFields[fieldName].replaceFile = !this.fileFields[fieldName].replaceFile;

      // Clear new file if canceling replace
      if (!this.fileFields[fieldName].replaceFile) {
        delete this.fileFields[fieldName].newFile;
        this.form.get(fieldName)?.setValue(null);
      }
    }
  }

  onFileChange(event: any, fieldName: string): void {
    const file = event.target.files[0];
    if (file) {
      if (!this.fileFields[fieldName]) {
        this.fileFields[fieldName] = {
          hasExistingFile: false,
          replaceFile: false
        };
      }

      this.fileFields[fieldName].newFile = file;
      this.form.get(fieldName)?.setValue('file_selected');
      this.form.get(fieldName)?.markAsTouched();

      // Track change
      this.onFieldChange(fieldName, file);
    }
  }

  clearFile(fieldName: string, fileInput: HTMLInputElement): void {
    if (this.fileFields[fieldName]) {
      delete this.fileFields[fieldName].newFile;
    }
    this.form.get(fieldName)?.setValue(null);
    fileInput.value = '';

    // Track change
    this.onFieldChange(fieldName, null);
  }

  // Many-to-many handling methods
  private initializeManyToManyFields(): void {
    this.formFields.forEach(field => {
      if (this.isManyToManyField(field) && this.editingRecord) {
        const existingValue = this.editingRecord[field.name];
        if (Array.isArray(existingValue)) {
          this.manyToManySelections[field.name] = [...existingValue];
        }
      }
    });
  }

  private resetManyToManySelections(): void {
    this.manyToManySelections = {};
    this.initializeManyToManyFields();
  }

  isManyToManyField(field: ResourceField): boolean {
    return field.type === 'ManyToManyField' || field.relation_type === 'ManyToManyField';
  }

  isSingleRelationField(field: ResourceField): boolean {
    return this.isRelationField(field) && !this.isManyToManyField(field);
  }

  getManyToManySelectedItems(fieldName: string): RelationOption[] {
    const selectedIds = this.manyToManySelections[fieldName] || [];
    const options = this.relationOptions[fieldName] || [];
    return options.filter(option => selectedIds.includes(option.id));
  }

  removeManyToManyItem(fieldName: string, itemId: any): void {
    if (!this.manyToManySelections[fieldName]) {
      this.manyToManySelections[fieldName] = [];
    }

    this.manyToManySelections[fieldName] = this.manyToManySelections[fieldName].filter(id => id !== itemId);
    this.form.get(fieldName)?.setValue(this.manyToManySelections[fieldName]);
    this.onFieldChange(fieldName, this.manyToManySelections[fieldName]);
  }

  clearAllManyToMany(fieldName: string): void {
    this.manyToManySelections[fieldName] = [];
    this.form.get(fieldName)?.setValue([]);
    this.onFieldChange(fieldName, []);
  }

  openManyToManySelector(field: ResourceField): void {
    const dialogData: ManyToManyData = {
      fieldName: field.name,
      title: this.formatColumnName(field.name),
      options: this.relationOptions[field.name] || [],
      selectedIds: this.manyToManySelections[field.name] || [],
      loading: false
    };

    const dialogRef = this.dialog.open(ManyToManySelectorComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.manyToManySelections[field.name] = result;
        this.form.get(field.name)?.setValue(result);
        this.onFieldChange(field.name, result);
      }
    });
  }

  // Change tracking methods
  onFieldChange(fieldName: string, value: any): void {
    this.editModeService.updateField(fieldName, value);
  }

  hasFieldChanged(fieldName: string): boolean {
    return this.editModeService.hasFieldChanged(fieldName);
  }

  resetSingleField(fieldName: string): void {
    this.editModeService.resetField(fieldName);

    // Update form control
    const originalValue = this.editState.originalData?.[fieldName];
    this.form.get(fieldName)?.setValue(originalValue);

    // Reset file field if needed
    if (this.isFileField(this.getFieldByName(fieldName)) && this.fileFields[fieldName]) {
      this.fileFields[fieldName].replaceFile = false;
      delete this.fileFields[fieldName].newFile;
    }

    // Reset many-to-many if needed
    if (this.isManyToManyField(this.getFieldByName(fieldName))) {
      this.manyToManySelections[fieldName] = Array.isArray(originalValue) ? [...originalValue] : [];
    }
  }

  resetAllChanges(): void {
    this.editModeService.resetAllChanges();

    // Reset form to original values
    const originalData = this.editState.originalData;
    if (originalData) {
      this.form.patchValue(originalData);

      // Reset file fields
      this.resetFileFields();

      // Reset many-to-many
      this.resetManyToManySelections();
    }
  }

  getChangedFieldsCount(): number {
    return Object.values(this.editState.fieldChanges).filter(changed => changed).length;
  }

  getChangesSummary(): { field: string; oldValue: any; newValue: any }[] {
    return this.editModeService.getChangesSummary();
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return 'Empty';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') return 'Object';
    const str = String(value);
    return str.length > 30 ? str.substring(0, 30) + '...' : str;
  }

  // Auto-save handling
  onAutoSaveToggle(event: any): void {
    this.autoSaveEnabled = event.checked;
    if (this.autoSaveEnabled && this.editState.hasChanges) {
      this.snackBar.open('Auto-save enabled - changes will be saved automatically', 'Close', {
        duration: 3000
      });
    }
  }

  // Form submission
  submitForm(): void {
    this.clearServerErrors();

    if (this.form.valid) {
      const formData: any = this.editState.isEditing ?
        this.editModeService.getChangedFields() :
        { ...this.form.value };

      // Add files to form data
      for (const fieldName in this.fileFields) {
        const fileInfo = this.fileFields[fieldName];
        if (fileInfo.newFile) {
          formData[fieldName] = fileInfo.newFile;
        } else if (!this.editState.isEditing || fileInfo.replaceFile) {
          // Include null for file fields when creating or explicitly replacing
          formData[fieldName] = null;
        }
      }

      // Add many-to-many selections
      for (const fieldName in this.manyToManySelections) {
        if (this.editState.isEditing) {
          // Only include if changed
          if (this.hasFieldChanged(fieldName)) {
            formData[fieldName] = this.manyToManySelections[fieldName];
          }
        } else {
          formData[fieldName] = this.manyToManySelections[fieldName];
        }
      }

      this.onSubmit.emit(formData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
      });

      this.form.updateValueAndValidity();
    }
  }

  // Cancel handling
  handleCancel(): void {
    if (this.editState.hasChanges) {
      const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
        width: '400px',
        data: {
          changesCount: this.getChangedFieldsCount(),
          changes: this.getChangesSummary()
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'discard') {
          this.onCancel.emit();
        } else if (result === 'save') {
          this.submitForm();
        }
        // 'cancel' does nothing - keeps dialog open
      });
    } else {
      this.onCancel.emit();
    }
  }

  retryLoadRecord(): void {
    if (this.editingRecord && this.editingRecord.id) {
      this.editModeService.initializeEditMode(this.resource, this.editingRecord.id, {
        loadFreshData: true
      }).subscribe({
        next: (data) => {
          this.buildForm();
          this.snackBar.open('Record data reloaded successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to reload record data', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onOverlayClick(event: Event): void {
    this.handleCancel();
  }

  // Utility methods
  private getFieldByName(fieldName: string): ResourceField {
    return this.formFields.find(f => f.name === fieldName) || {} as ResourceField;
  }

  private setFormErrors(): void {
    if (!this.form || !this.validationErrors) return;

    for (const fieldName in this.validationErrors) {
      const control = this.form.get(fieldName);
      if (control) {
        const errors = this.validationErrors[fieldName];
        const currentErrors = control.errors || {};
        control.setErrors({
          ...currentErrors,
          serverError: Array.isArray(errors) ? errors : [errors]
        });
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    }
    this.form.updateValueAndValidity();
  }

  private clearServerErrors(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors && control.errors['serverError']) {
        const errors = { ...control.errors };
        delete errors['serverError'];
        if (Object.keys(errors).length === 0) {
          control.setErrors(null);
        } else {
          control.setErrors(errors);
        }
      }
    });
  }

  // Field type checking methods (delegate to FieldTypeUtils)
  formatColumnName(name: string): string {
    return FieldTypeUtils.formatColumnName(name);
  }

  isTextInput(field: ResourceField): boolean {
    return FieldTypeUtils.isTextInput(field);
  }

  isNumberInput(field: ResourceField): boolean {
    return FieldTypeUtils.isNumberInput(field);
  }

  hasChoices(field: ResourceField): boolean {
    return FieldTypeUtils.hasChoices(field);
  }

  isRelationField(field: ResourceField): boolean {
    return FieldTypeUtils.isRelationField(field);
  }

  isFileField(field: ResourceField): boolean {
    return FieldTypeUtils.isFileField(field);
  }

  isBooleanField(field: ResourceField): boolean {
    return FieldTypeUtils.isBooleanField(field);
  }

  isDateField(field: ResourceField): boolean {
    return FieldTypeUtils.isDateField(field);
  }

  isDateTimeField(field: ResourceField): boolean {
    return FieldTypeUtils.isDateTimeField(field);
  }

  isTimeField(field: ResourceField): boolean {
    return FieldTypeUtils.isTimeField(field);
  }

  isUnhandledField(field: ResourceField): boolean {
    return FieldTypeUtils.isUnhandledField(field);
  }

  getInputType(fieldType: string): string {
    return FieldTypeUtils.getInputType(fieldType);
  }

  getNumberStep(fieldType: string): string {
    return FieldTypeUtils.getNumberStep(fieldType);
  }

  getFileAcceptTypes(field: ResourceField): string {
    return FieldTypeUtils.getFileAcceptTypes(field.type);
  }

  shouldShowFormField(field: ResourceField): boolean {
    return !this.isBooleanField(field) && !this.isFileField(field) && !this.isManyToManyField(field);
  }

  getFieldErrors(fieldName: string): string[] {
    const errors: string[] = [];

    const control = this.form.get(fieldName);
    if (control && control.errors) {
      if (control.errors['serverError']) {
        if (Array.isArray(control.errors['serverError'])) {
          errors.push(...control.errors['serverError']);
        } else {
          errors.push(control.errors['serverError']);
        }
      }

      if (control.errors['email'] && control.touched) {
        errors.push('Please enter a valid email address');
      }

      if (control.errors['url'] && control.touched) {
        errors.push('Please enter a valid URL');
      }
    }

    if (this.validationErrors && this.validationErrors[fieldName]) {
      const serverErrors = this.validationErrors[fieldName];
      if (Array.isArray(serverErrors)) {
        errors.push(...serverErrors);
      } else {
        errors.push(serverErrors);
      }
    }

    return [...new Set(errors)];
  }

  hasFieldError(fieldName: string): boolean {
    if (this.validationErrors && this.validationErrors[fieldName]) {
      return true;
    }

    const control = this.form.get(fieldName);
    if (!control) return false;

    const hasErrors = !!(control.errors && Object.keys(control.errors).length > 0);
    if (!hasErrors) return false;

    const hasServerErrors = !!(control.errors && control.errors['serverError']);
    const isInteracted = control.touched || control.dirty;

    return hasServerErrors || isInteracted;
  }
}

// Confirm Cancel Dialog Component
@Component({
  selector: 'app-confirm-cancel-dialog',
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="warning-icon">warning</mat-icon>
        Unsaved Changes
      </h2>

      <mat-dialog-content>
        <p>You have <strong>{{ data.changesCount }}</strong> unsaved change{{ data.changesCount !== 1 ? 's' : '' }}.</p>
        <p>What would you like to do?</p>

        <div class="changes-preview" *ngIf="data.changes.length > 0">
          <h4>Changed fields:</h4>
          <ul class="changes-list">
            <li *ngFor="let change of data.changes.slice(0, 3)">
              {{ formatColumnName(change.field) }}
            </li>
            <li *ngIf="data.changes.length > 3">
              and {{ data.changes.length - 3 }} more...
            </li>
          </ul>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          Continue Editing
        </button>
        <button mat-button color="warn" (click)="onDiscard()" class="discard-btn">
          <mat-icon>delete</mat-icon>
          Discard Changes
        </button>
        <button mat-raised-button color="primary" (click)="onSave()" class="save-btn">
          <mat-icon>save</mat-icon>
          Save & Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 350px;
    }

    .warning-icon {
      color: #ff9800;
      margin-right: 8px;
      vertical-align: middle;
    }

    .changes-preview {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
    }

    .changes-preview h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .changes-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
    }

    .changes-list li {
      margin-bottom: 4px;
    }

    .dialog-actions {
      justify-content: flex-end;
      gap: 8px;
    }

    .cancel-btn {
      color: #666;
    }

    .discard-btn {
      color: #f44336;
    }

    .save-btn {
      background: #4caf50;
      color: white;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class ConfirmCancelDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  onDiscard(): void {
    this.dialogRef.close('discard');
  }

  onSave(): void {
    this.dialogRef.close('save');
  }

  formatColumnName(name: string): string {
    return FieldTypeUtils.formatColumnName(name);
  }
}
