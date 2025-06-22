// components/resource-form/resource-form.component.ts - FIXED Many-to-Many Dialog
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
import {ConfigService} from '../../../../services/config.service';

export interface FileFieldInfo {
  hasExistingFile: boolean;
  existingFileUrl?: string;
  existingFileName?: string;
  newFile?: File;
  replaceFile: boolean;
}

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
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './resource-form.component.html',
  styleUrl: './resource-form.component.scss'
})
export class ResourceFormComponent implements OnInit, OnDestroy, OnChanges {
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
      private snackBar: MatSnackBar,
      private configService: ConfigService


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
    this.editModeService.editState$
        .pipe(takeUntil(this.destroy$))
        .subscribe(state => {
          this.editState = state;
        });

    if (this.editingRecord) {
      this.editModeService.setEditData(this.editingRecord);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.buildDynamicForm(this.resource, this.editingRecord);
    this.formFields = this.formBuilder.getFormFields(this.resource);

    this.form.valueChanges
        .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe(formValue => {
          Object.keys(formValue).forEach(fieldName => {
            this.editModeService.updateField(fieldName, formValue[fieldName]);
          });

          if (this.autoSaveEnabled && this.editState.hasChanges) {
            this.autoSaveSubject.next('auto-save');
          }
        });

    if (this.editingRecord) {
      this.initializeFileFields();
      this.initializeManyToManyFields();
    }
  }

  private setupAutoSave(): void {
    this.autoSaveSubject
        .pipe(
            takeUntil(this.destroy$),
            debounceTime(2000)
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

        // FIXED: Ensure the file URL is properly extracted
        let fileUrl = existingValue;
        let fileName = this.extractFileName(existingValue);

        // Handle case where value might be an object with url property
        if (existingValue && typeof existingValue === 'object') {
          fileUrl = existingValue.url || existingValue.file || existingValue.path || existingValue;
          if (existingValue.name) {
            fileName = existingValue.name;
          }
        }

        // FIXED: Ensure URL is complete
        if (fileUrl && typeof fileUrl === 'string') {
          fileUrl = this.ensureCompleteUrl(fileUrl);
        }

        this.fileFields[field.name] = {
          hasExistingFile: !!fileUrl && fileUrl !== null && fileUrl !== '',
          existingFileUrl: fileUrl || '',
          existingFileName: fileName,
          replaceFile: false
        };

        console.log(`🔍 DEBUG: Initialized file field ${field.name}:`, this.fileFields[field.name]);
      }
    });
  }

  private ensureCompleteUrl(url: string): string {
    if (!url) return '';

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative URL, prepend the base URL
    const baseUrl = this.configService.getBaseUrl();

    // Remove leading slash from URL if base URL has trailing slash
    if (baseUrl.endsWith('/') && url.startsWith('/')) {
      url = url.substring(1);
    } else if (!baseUrl.endsWith('/') && !url.startsWith('/')) {
      // Add slash between base URL and relative URL if neither has it
      url = '/' + url;
    }

    return baseUrl + url;
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

      this.onFieldChange(fieldName, file);
    }
  }

  clearFile(fieldName: string, fileInput: HTMLInputElement): void {
    if (this.fileFields[fieldName]) {
      delete this.fileFields[fieldName].newFile;
    }
    this.form.get(fieldName)?.setValue(null);
    fileInput.value = '';

    this.onFieldChange(fieldName, null);
  }

  // ENHANCED: Many-to-many handling methods
  private initializeManyToManyFields(): void {
    console.log('🔍 DEBUG: Initializing many-to-many fields');
    this.formFields.forEach(field => {
      if (this.isManyToManyField(field) && this.editingRecord) {
        const existingValue = this.editingRecord[field.name];
        console.log(`🔍 DEBUG: M2M field ${field.name} existing value:`, existingValue);

        if (Array.isArray(existingValue)) {
          this.manyToManySelections[field.name] = [...existingValue];
          console.log(`✅ Initialized M2M field ${field.name} with:`, this.manyToManySelections[field.name]);
        } else {
          this.manyToManySelections[field.name] = [];
          console.log(`ℹ️ Initialized M2M field ${field.name} as empty array`);
        }
      }
    });
  }

  private resetManyToManySelections(): void {
    this.manyToManySelections = {};
    this.initializeManyToManyFields();
  }

  isManyToManyField(field: ResourceField): boolean {
    return FieldTypeUtils.isManyToManyField(field);
  }

  // ENHANCED: Better M2M selected items display
  getManyToManySelectedItems(fieldName: string): RelationOption[] {
    const selectedIds = this.manyToManySelections[fieldName] || [];
    const options = this.relationOptions[fieldName] || [];

    console.log(`🔍 DEBUG: Getting M2M selected items for ${fieldName}`);
    console.log(`🔍 DEBUG: Selected IDs:`, selectedIds);
    console.log(`🔍 DEBUG: Available options:`, options);

    const selectedItems = options.filter(option => selectedIds.includes(option.id));
    console.log(`🔍 DEBUG: Selected items:`, selectedItems);

    return selectedItems;
  }

  removeManyToManyItem(fieldName: string, itemId: any): void {
    console.log(`🔍 DEBUG: Removing M2M item ${itemId} from ${fieldName}`);

    if (!this.manyToManySelections[fieldName]) {
      this.manyToManySelections[fieldName] = [];
    }

    this.manyToManySelections[fieldName] = this.manyToManySelections[fieldName].filter(id => id !== itemId);
    console.log(`✅ Updated M2M selection for ${fieldName}:`, this.manyToManySelections[fieldName]);

    this.form.get(fieldName)?.setValue(this.manyToManySelections[fieldName]);
    this.onFieldChange(fieldName, this.manyToManySelections[fieldName]);
  }

  clearAllManyToMany(fieldName: string): void {
    console.log(`🔍 DEBUG: Clearing all M2M items for ${fieldName}`);
    this.manyToManySelections[fieldName] = [];
    this.form.get(fieldName)?.setValue([]);
    this.onFieldChange(fieldName, []);
  }

  // ENHANCED: Fixed M2M selector dialog opening
  openManyToManySelector(field: ResourceField): void {
    console.log(`🔍 DEBUG: Opening M2M selector for field:`, field);
    console.log(`🔍 DEBUG: Available options:`, this.relationOptions[field.name]);
    console.log(`🔍 DEBUG: Current selections:`, this.manyToManySelections[field.name]);

    // Check if options are loaded
    const options = this.relationOptions[field.name] || [];
    if (options.length === 0) {
      console.warn(`⚠️ No options available for ${field.name}. Make sure relation options are loaded.`);
      this.snackBar.open(`No ${field.name} options available. Please try again.`, 'Close', {
        duration: 3000
      });
      return;
    }

    const dialogData: ManyToManyData = {
      fieldName: field.name,
      title: this.formatColumnName(field.name),
      options: options,
      selectedIds: this.manyToManySelections[field.name] || [],
      loading: false
    };

    console.log(`🔍 DEBUG: Dialog data for ${field.name}:`, dialogData);

    const dialogRef = this.dialog.open(ManyToManySelectorComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: dialogData, // FIXED: Pass data correctly
      disableClose: false,
      panelClass: 'many-to-many-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`🔍 DEBUG: M2M dialog closed with result:`, result);

      if (result !== undefined && Array.isArray(result)) {
        console.log(`✅ Updating M2M selection for ${field.name}:`, result);

        this.manyToManySelections[field.name] = result;
        this.form.get(field.name)?.setValue(result);
        this.onFieldChange(field.name, result);

        // Show success message
        const selectedCount = result.length;
        this.snackBar.open(`Selected ${selectedCount} ${field.name}`, 'Close', {
          duration: 2000
        });
      } else {
        console.log(`ℹ️ M2M dialog cancelled or no changes made`);
      }
    });
  }

  // *** ENHANCED RELATIONSHIP FIELD DETECTION ***
  isSingleRelationField(field: ResourceField): boolean {
    return FieldTypeUtils.isSingleRelationField(field);
  }

  isForeignKeyField(field: ResourceField): boolean {
    return FieldTypeUtils.isForeignKeyField(field);
  }

  isOneToOneField(field: ResourceField): boolean {
    return FieldTypeUtils.isOneToOneField(field);
  }

  isLookupField(field: ResourceField): boolean {
    return FieldTypeUtils.isLookupField(field);
  }

  getRelationshipType(field: ResourceField): string {
    return FieldTypeUtils.getRelationTypeDisplayName(field);
  }

  hasRelationOptions(field: ResourceField): boolean {
    const options = this.relationOptions[field.name];
    return Boolean(options && Array.isArray(options) && options.length > 0);
  }

  getRelationOptions(field: ResourceField): RelationOption[] {
    return this.relationOptions[field.name] || [];
  }

  // *** FIXED: MISSING METHODS FROM TEMPLATE ***
  getFieldPlaceholder(field: ResourceField): string {
    return FieldTypeUtils.getFieldPlaceholder(field);
  }

  getRelationTypeDisplayName(field: ResourceField): string {
    return FieldTypeUtils.getRelationTypeDisplayName(field);
  }

  getFieldDebugInfo(field: ResourceField): string {
    const debugInfo = {
      name: field.name,
      type: field.type,
      relation_type: field.relation_type,
      related_model: field.related_model,
      limit_choices_to: field.limit_choices_to,
      isRelationField: this.isRelationField(field),
      relationshipType: this.getRelationshipType(field),
      isSingleRelation: this.isSingleRelationField(field),
      optionsCount: this.relationOptions[field.name]?.length || 0,
      options: this.relationOptions[field.name]?.slice(0, 3) // Show first 3 options
    };
    return JSON.stringify(debugInfo, null, 2);
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

    const originalValue = this.editState.originalData?.[fieldName];
    this.form.get(fieldName)?.setValue(originalValue);

    if (this.isFileField(this.getFieldByName(fieldName)) && this.fileFields[fieldName]) {
      this.fileFields[fieldName].replaceFile = false;
      delete this.fileFields[fieldName].newFile;
    }

    if (this.isManyToManyField(this.getFieldByName(fieldName))) {
      this.manyToManySelections[fieldName] = Array.isArray(originalValue) ? [...originalValue] : [];
    }
  }

  resetAllChanges(): void {
    this.editModeService.resetAllChanges();

    const originalData = this.editState.originalData;
    if (originalData) {
      this.form.patchValue(originalData);
      this.resetFileFields();
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
// Form submission
  submitForm(): void {
    this.clearServerErrors();

    if (this.form.valid) {
      let formData: any;

      if (this.editState.isEditing) {
        // For editing, we'll let the parent component decide whether to send all data or just changes
        // based on whether it uses PUT or PATCH
        const changedFields = this.editModeService.getChangedFields();
        const allFormData = { ...this.form.value };

        // Add metadata to help parent component decide
        formData = {
          _changedFields: changedFields,
          _allFields: allFormData,
          _changedCount: Object.keys(changedFields).length,
          _totalCount: Object.keys(allFormData).length,
          ...changedFields // Default to changed fields
        };
      } else {
        // For new records, send all form data
        formData = { ...this.form.value };
      }

      // Add files to form data
      for (const fieldName in this.fileFields) {
        const fileInfo = this.fileFields[fieldName];
        if (fileInfo.newFile) {
          formData[fieldName] = fileInfo.newFile;
          if (formData._allFields) {
            formData._allFields[fieldName] = fileInfo.newFile;
          }
        } else if (!this.editState.isEditing || fileInfo.replaceFile) {
          formData[fieldName] = null;
          if (formData._allFields) {
            formData._allFields[fieldName] = null;
          }
        }
      }

      // Add many-to-many selections
      for (const fieldName in this.manyToManySelections) {
        if (this.editState.isEditing) {
          if (this.hasFieldChanged(fieldName)) {
            formData[fieldName] = this.manyToManySelections[fieldName];
            if (formData._allFields) {
              formData._allFields[fieldName] = this.manyToManySelections[fieldName];
            }
          }
        } else {
          formData[fieldName] = this.manyToManySelections[fieldName];
        }
      }

      console.log('🔍 DEBUG: Final form data being submitted:', formData);
      this.onSubmit.emit(formData);
    } else {
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

  getFieldErrorMessage(fieldName: string): string {
    const errors = this.getFieldErrors(fieldName);
    return errors.length > 0 ? errors[0] : '';
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

  getCompleteFileUrl(fieldName: string): string {
    const fileInfo = this.getFileInfo(fieldName);
    if (!fileInfo?.existingFileUrl) return '';

    // Ensure the URL is complete and properly formatted
    let url = fileInfo.existingFileUrl;

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Otherwise, prepend the base URL
    const baseUrl = this.configService.getBaseUrl();
    if (baseUrl.endsWith('/') && url.startsWith('/')) {
      url = url.substring(1);
    } else if (!baseUrl.endsWith('/') && !url.startsWith('/')) {
      url = '/' + url;
    }

    return baseUrl + url;
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
      @Inject(MAT_DIALOG_DATA) public data: any,

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
