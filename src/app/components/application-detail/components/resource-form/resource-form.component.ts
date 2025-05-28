// components/resource-form/resource-form.component.ts - FIXED
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-resource-form',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="form-overlay" (click)="onOverlayClick($event)">
      <mat-card class="form-card" (click)="$event.stopPropagation()">
        <mat-card-header class="form-header">
          <mat-card-title class="form-title">
            {{ isEdit ? 'Edit' : 'Create' }} {{ formatColumnName(resource.name) }}
          </mat-card-title>
          <button mat-icon-button (click)="onCancel.emit()" class="close-button">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content class="form-content">
          <!-- Validation Error Summary -->
          <div *ngIf="hasValidationErrors()" class="error-summary">
            <mat-icon class="error-icon">error</mat-icon>
            <div class="error-content">
              <h4>Please fix the following errors:</h4>
              <ul>
                <li *ngFor="let error of getValidationErrorSummary()">{{ error }}</li>
              </ul>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submitForm()" class="dynamic-form">
            <div class="form-grid">
              <div *ngFor="let field of formFields; let i = index" class="form-field-container">

                <!-- Debug info (remove in production) -->
                <div class="debug-info" *ngIf="showDebug">
                  Field: {{ field?.name || 'NO NAME' }} | Type: {{ field?.type || 'NO TYPE' }} | Required: {{ field?.required || false }} | HasError: {{ hasFieldError(field.name) }}
                </div>

                <!-- Visual error indicator for debugging -->
                <div *ngIf="hasFieldError(field.name)" class="field-error-indicator">
                  🔴 ERROR: {{ field.name }} - {{ getFieldErrors(field.name).join(', ') }}
                </div>

                <!-- Boolean checkbox -->
                <div *ngIf="isBooleanField(field)"
                     class="checkbox-container"
                     [class.field-error]="hasFieldError(field.name)">
                  <mat-checkbox [formControlName]="field.name" class="custom-checkbox">
                    {{ formatColumnName(field.name) }}
                    <span *ngIf="field.help_text" class="help-text">({{ field.help_text }})</span>
                  </mat-checkbox>
                  <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                    {{ formatColumnName(field.name) }} is required
                  </mat-error>
                  <div *ngFor="let error of getFieldErrors(field.name)" class="field-error-message">
                    <mat-icon class="error-icon-small">error</mat-icon>
                    {{ error }}
                  </div>
                </div>

                <!-- File field as URL input -->
                <mat-form-field *ngIf="isFileField(field)"
                                appearance="outline"
                                class="form-field"
                                [class.field-error]="hasFieldError(field.name)">
                  <mat-label>{{ formatColumnName(field.name) }} URL</mat-label>
                  <input matInput
                         type="url"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name) + ' URL'"
                         [class.input-error]="hasFieldError(field.name)">

                  <button *ngIf="form.get(field.name)?.value"
                          matSuffix
                          mat-icon-button
                          type="button"
                          (click)="previewFile(form.get(field.name)?.value)"
                          matTooltip="Preview file in new tab"
                          class="preview-btn">
                    <mat-icon>visibility</mat-icon>
                  </button>

                  <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                    <mat-icon>error</mat-icon>
                    {{ formatColumnName(field.name) }} is required
                  </mat-error>
                  <mat-error *ngFor="let error of getFieldErrors(field.name)">
                    <mat-icon>error</mat-icon>
                    {{ error }}
                  </mat-error>
                </mat-form-field>

                <!-- Regular form fields -->
                <mat-form-field *ngIf="shouldShowFormField(field)"
                                appearance="outline"
                                class="form-field"
                                [class.field-error]="hasFieldError(field.name)">
                  <mat-label>{{ formatColumnName(field.name) }}</mat-label>

                  <!-- Text inputs -->
                  <input *ngIf="isTextInput(field)"
                         matInput
                         [type]="getInputType(field.type)"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Number inputs -->
                  <input *ngIf="isNumberInput(field)"
                         matInput
                         type="number"
                         [step]="getNumberStep(field.type)"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Date input -->
                  <ng-container *ngIf="isDateField(field)">
                    <input matInput
                           [matDatepicker]="datePicker"
                           [formControlName]="field.name"
                           [required]="field.required"
                           [placeholder]="'Select ' + formatColumnName(field.name)"
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
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Time input -->
                  <input *ngIf="isTimeField(field)"
                         matInput
                         type="time"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Select ' + formatColumnName(field.name)"
                         [class.input-error]="hasFieldError(field.name)">

                  <!-- Select for choices -->
                  <mat-select *ngIf="hasChoices(field)"
                              [formControlName]="field.name"
                              [required]="field.required"
                              [class.input-error]="hasFieldError(field.name)">
                    <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                    <mat-option *ngFor="let choice of field.choices" [value]="choice.value">
                      {{ choice.label }}
                    </mat-option>
                  </mat-select>

                  <!-- Relation fields -->
                  <mat-select *ngIf="isRelationField(field)"
                              [formControlName]="field.name"
                              [required]="field.required"
                              [class.input-error]="hasFieldError(field.name)">
                    <mat-option [value]="null">-- Select {{ formatColumnName(field.name) }} --</mat-option>
                    <mat-option *ngFor="let option of relationOptions[field.name]" [value]="option.id">
                      {{ option.display }}
                    </mat-option>
                  </mat-select>

                  <!-- Fallback for unhandled types -->
                  <input *ngIf="isUnhandledField(field)"
                         matInput
                         type="text"
                         [formControlName]="field.name"
                         [required]="field.required"
                         [placeholder]="'Enter ' + formatColumnName(field.name) + ' (' + field.type + ')'"
                         [class.input-error]="hasFieldError(field.name)">

                  <mat-error *ngIf="form.get(field.name)?.hasError('required') && form.get(field.name)?.touched">
                    <mat-icon>error</mat-icon>
                    {{ formatColumnName(field.name) }} is required
                  </mat-error>
                  <mat-error *ngFor="let error of getFieldErrors(field.name)">
                    <mat-icon>error</mat-icon>
                    {{ error }}
                  </mat-error>
                </mat-form-field>
              </div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions class="form-actions">
          <button mat-button type="button" (click)="onCancel.emit()" class="cancel-btn">
            Cancel
          </button>
          <button mat-raised-button
                  color="primary"
                  type="button"
                  (click)="submitForm()"
                  [disabled]="!form.valid || submitting"
                  class="submit-btn">
            <mat-spinner diameter="20" *ngIf="submitting"></mat-spinner>
            <span *ngIf="!submitting">{{ isEdit ? 'Update' : 'Create' }}</span>
            <span *ngIf="submitting">{{ isEdit ? 'Updating...' : 'Creating...' }}</span>
          </button>
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

    .form-card {
      width: 90vw;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
      padding: 24px;
    }

    .form-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .close-button {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
    }

    .form-content {
      padding: 32px;
      background: #fafafa;
    }

    .error-summary {
      background: #ffebee;
      border: 1px solid #f44336;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .error-icon {
      color: #f44336;
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;
    }

    .error-content h4 {
      margin: 0 0 8px 0;
      color: #d32f2f;
      font-size: 16px;
      font-weight: 600;
    }

    .error-content ul {
      margin: 0;
      padding-left: 20px;
      color: #d32f2f;
    }

    .error-content li {
      margin-bottom: 4px;
      font-size: 14px;
    }

    .dynamic-form {
      width: 100%;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .form-field-container {
      width: 100%;
    }

    .debug-info {
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
      padding: 4px 8px;
      background-color: #e3f2fd;
      border-radius: 4px;
      border-left: 3px solid #2196f3;
    }

    .field-error-indicator {
      background: #ff5722;
      color: white;
      padding: 4px 8px;
      margin-bottom: 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .form-field {
      width: 100%;
      background: white;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    /* Error Field Highlighting */
    .form-field.field-error {
      background: rgba(244, 67, 54, 0.02);
      border: 2px solid rgba(244, 67, 54, 0.3);
      animation: errorPulse 0.6s ease-in-out;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .checkbox-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .checkbox-container.field-error {
      border: 2px solid #f44336;
      background: rgba(244, 67, 54, 0.02);
      animation: errorPulse 0.6s ease-in-out;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .input-error {
      color: #f44336 !important;
      font-weight: 500;
    }

    .field-error-message {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
      font-weight: 500;
      animation: slideDown 0.3s ease-out;
    }

    .error-icon-small {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    @keyframes errorPulse {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.1);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 6px rgba(244, 67, 54, 0.15);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .custom-checkbox {
      font-size: 16px;
    }

    .help-text {
      color: #666;
      font-size: 14px;
      font-style: italic;
    }

    .preview-btn {
      color: #1976d2;
      transition: color 0.2s ease;
    }

    .preview-btn:hover {
      color: #1565c0;
    }

    .form-actions {
      padding: 24px 32px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
    }

    .submit-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      min-width: 120px;
    }

    .submit-btn:disabled {
      background: #ccc;
      color: #666;
    }

    mat-error {
      font-size: 12px;
      margin-top: 4px;
      color: #f44336;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: slideDown 0.3s ease-out;
    }

    mat-error mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Material Form Field Error States */
    ::ng-deep .form-field.field-error .mat-mdc-form-field-outline {
      color: #f44336 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-form-field-outline-thick {
      color: #f44336 !important;
      border-width: 3px !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-text-field-wrapper {
      background-color: rgba(244, 67, 54, 0.04) !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-form-field-label {
      color: #f44336 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-form-field-required-marker {
      color: #f44336 !important;
    }

    /* Input Error Styling */
    ::ng-deep .input-error.mat-mdc-input-element {
      color: #f44336 !important;
      font-weight: 500 !important;
    }

    /* Select/Dropdown Error Styling */
    ::ng-deep .input-error.mat-mdc-select {
      color: #f44336 !important;
      font-weight: 500 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-select {
      color: #f44336 !important;
      font-weight: 500 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-select .mat-mdc-select-value {
      color: #f44336 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-select .mat-mdc-select-placeholder {
      color: rgba(244, 67, 54, 0.7) !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-select .mat-mdc-select-arrow {
      color: #f44336 !important;
    }

    /* Select trigger styling when in error state */
    ::ng-deep .form-field.field-error .mat-mdc-select-trigger {
      color: #f44336 !important;
    }

    /* Select panel styling */
    ::ng-deep .mat-mdc-select-panel {
      border-top: 3px solid #f44336 !important;
    }

    /* Focus and hover states for error selects */
    ::ng-deep .form-field.field-error .mat-mdc-select:focus {
      color: #f44336 !important;
    }

    ::ng-deep .form-field.field-error .mat-mdc-select-focused {
      color: #f44336 !important;
    }

    /* Checkbox Error Styling */
    ::ng-deep .checkbox-container.field-error .mat-mdc-checkbox {
      --mdc-checkbox-outline-color: #f44336;
      --mdc-checkbox-selected-checkmark-color: white;
      --mdc-checkbox-selected-focus-icon-color: #f44336;
      --mdc-checkbox-selected-hover-icon-color: #f44336;
      --mdc-checkbox-selected-icon-color: #f44336;
      --mdc-checkbox-selected-pressed-icon-color: #f44336;
    }

    /* Focus States for Error Fields */
    ::ng-deep .form-field.field-error .mat-mdc-form-field-focus-overlay {
      background-color: rgba(244, 67, 54, 0.12) !important;
    }

    ::ng-deep .form-field.field-error:not(.mat-mdc-form-field-disabled) .mat-mdc-form-field-flex:hover .mat-mdc-form-field-outline {
      color: #f44336 !important;
    }

    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-text-field-wrapper {
      background-color: rgba(244, 67, 54, 0.04);
    }

    .mat-mdc-form-field.mat-form-field-invalid .mat-mdc-form-field-outline-thick {
      color: #f44336;
    }

    .checkbox-container.ng-invalid {
      border-color: #f44336;
      background-color: rgba(244, 67, 54, 0.04);
    }

    ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }

    ::ng-deep .error-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
    }

    ::ng-deep .mat-mdc-form-field-outline {
      border-radius: 8px;
    }

    ::ng-deep .mat-mdc-form-field-focus-overlay {
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-card {
        width: 95vw;
        margin: 10px;
      }

      .form-content {
        padding: 20px;
      }
    }
  `]
})
export class ResourceFormComponent implements OnInit, OnChanges {
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

  constructor(private formBuilder: FormBuilderService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(): void {
    if (this.resource) {
      this.buildForm();
    }

    // Handle validation errors from backend
    if (this.validationErrors && Object.keys(this.validationErrors).length > 0) {
      this.setFormErrors();
    }
  }

  get isEdit(): boolean {
    return !!this.editingRecord;
  }

  private buildForm(): void {
    this.form = this.formBuilder.buildDynamicForm(this.resource, this.editingRecord);
    this.formFields = this.formBuilder.getFormFields(this.resource);
  }

  private setFormErrors(): void {
    if (!this.form || !this.validationErrors) return;

    // Set server-side validation errors on form controls
    for (const fieldName in this.validationErrors) {
      const control = this.form.get(fieldName);
      if (control) {
        const errors = this.validationErrors[fieldName];
        control.setErrors({
          serverError: Array.isArray(errors) ? errors : [errors]
        });
        control.markAsTouched(); // Show the error immediately
      }
    }
  }

  onOverlayClick(event: Event): void {
    // Close form when clicking overlay
    this.onCancel.emit();
  }

  previewFile(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // FIXED: Changed from calling onSubmit() to emitting the form value
  submitForm(): void {
    // Clear any previous server-side validation errors
    this.clearServerErrors();

    if (this.form.valid) {
      this.onSubmit.emit(this.form.value);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  private clearServerErrors(): void {
    // Clear server-side validation errors from form controls
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors && control.errors['serverError']) {
        const errors = { ...control.errors };
        delete errors['serverError'];

        // If no other errors remain, set to null
        if (Object.keys(errors).length === 0) {
          control.setErrors(null);
        } else {
          control.setErrors(errors);
        }
      }
    });
  }

  // Field type checking methods
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

  shouldShowFormField(field: ResourceField): boolean {
    return !this.isBooleanField(field) && !this.isFileField(field);
  }

  getFieldErrors(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) {
      return [];
    }

    const errors: string[] = [];

    // Handle server-side validation errors
    if (control.errors['serverError']) {
      if (Array.isArray(control.errors['serverError'])) {
        errors.push(...control.errors['serverError']);
      } else {
        errors.push(control.errors['serverError']);
      }
    }

    // Handle client-side validation errors
    if (control.errors['required'] && control.touched) {
      // Required error is already handled in template
    }

    if (control.errors['email'] && control.touched) {
      errors.push('Please enter a valid email address');
    }

    if (control.errors['url'] && control.touched) {
      errors.push('Please enter a valid URL');
    }

    return errors;
  }

  hasValidationErrors(): boolean {
    return this.validationErrors && Object.keys(this.validationErrors).length > 0;
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    if (!control) return false;

    // Check if field has any errors and is touched or dirty
    return !!(control.errors && (control.touched || control.dirty));
  }

  getValidationErrorSummary(): string[] {
    const errors: string[] = [];

    for (const fieldName in this.validationErrors) {
      const fieldErrors = this.validationErrors[fieldName];
      const fieldLabel = this.formatColumnName(fieldName);

      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(error => {
          errors.push(`${fieldLabel}: ${error}`);
        });
      } else {
        errors.push(`${fieldLabel}: ${fieldErrors}`);
      }
    }

    return errors;
  }
}
