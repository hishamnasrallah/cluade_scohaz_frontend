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
  templateUrl: './resource-form.component.html',
  styleUrl: './resource-form.component.scss'
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
