// components/settings/inquiry-management/components/inquiry-editor/inquiry-editor.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil, forkJoin, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { InquiryConfigService } from '../../../../../services/inquiry-config.service';
import { UserService } from '../../../../../services/user.service';
import {
  InquiryConfiguration,
  ContentType,
  ModelField,
  InquiryField,
  InquiryFilter,
  InquiryRelation,
  InquirySort,
  InquiryPermission
} from '../../../../../models/inquiry-config.models';
import { Group } from '../../../../../services/user.service';
import { TranslatePipe } from '../../../../../pipes/translate.pipe';

@Component({
  selector: 'app-inquiry-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatSlideToggleModule,
    TranslatePipe
  ],
  templateUrl: './inquiry-editor.component.html',
  styleUrls: ['./inquiry-editor.component.scss']
})
export class InquiryEditorComponent implements OnInit, OnDestroy {
  // State
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  inquiryCode: string | null = null;
  currentInquiry: InquiryConfiguration | null = null;

  // Data
  availableModels: ContentType[] = [];
  selectedModel: ContentType | null = null;
  availableGroups: Group[] = [];

  // Forms
  basicInfoForm!: FormGroup;
  modelSelectionForm!: FormGroup;
  fieldsForm!: FormGroup;
  filtersForm!: FormGroup;
  relationsForm!: FormGroup;
  permissionsForm!: FormGroup;

  // Field management
  availableFields: ModelField[] = [];
  selectedFields: InquiryField[] = [];
  filteredFields$!: Observable<ModelField[]>;

  // Export formats
  exportFormats = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'json', label: 'JSON' },
    { value: 'pdf', label: 'PDF' }
  ];

  // Icons
  availableIcons = [
    'dashboard', 'query_stats', 'analytics', 'assessment',
    'table_chart', 'view_list', 'storage', 'folder',
    'description', 'assignment', 'receipt', 'article'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private inquiryService: InquiryConfigService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.inquiryCode = this.route.snapshot.paramMap.get('code');
    this.isEditMode = !!this.inquiryCode;

    // Load initial data
    this.loadInitialData();

    // Setup auto-generation of code from name
    this.basicInfoForm.get('name')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(name => {
        if (!this.isEditMode && name) {
          const code = this.generateCode(name);
          this.basicInfoForm.patchValue({ code }, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Basic Information Form
    this.basicInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      display_name: ['', Validators.required],
      description: [''],
      icon: ['dashboard'],
      is_public: [false],
      active: [true]
    });

    // Model Selection Form
    this.modelSelectionForm = this.fb.group({
      content_type: [null, Validators.required],
      enable_search: [true],
      distinct: [false],
      default_page_size: [25, [Validators.required, Validators.min(1), Validators.max(100)]],
      max_page_size: [100, [Validators.required, Validators.min(1), Validators.max(1000)]]
    });

    // Fields Configuration Form
    this.fieldsForm = this.fb.group({
      fields: this.fb.array([])
    });

    // Filters Configuration Form
    this.filtersForm = this.fb.group({
      filters: this.fb.array([])
    });

    // Relations Configuration Form
    this.relationsForm = this.fb.group({
      relations: this.fb.array([])
    });

    // Permissions Configuration Form
    this.permissionsForm = this.fb.group({
      allowed_groups: [[]],
      allow_export: [true],
      export_formats: [['csv']],
      search_fields: [[]]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      models: this.inquiryService.getAvailableModels(),
      groups: this.userService.getGroups()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.availableModels = data.models;
          this.availableGroups = data.groups;

          // If in edit mode, load the inquiry
          if (this.isEditMode && this.inquiryCode) {
            this.loadInquiry(this.inquiryCode);
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.snackBar.open('Error loading initial data', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoading = false;
        }
      });
  }

  private loadInquiry(code: string): void {
    this.inquiryService.getConfiguration(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inquiry) => {
          this.currentInquiry = inquiry;
          this.populateForms(inquiry);

          // Load related data
          if (inquiry.id) {
            this.loadInquiryDetails(inquiry.id);
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Error loading inquiry', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoading = false;
        }
      });
  }

  private loadInquiryDetails(inquiryId: number): void {
    forkJoin({
      fields: this.inquiryService.getFields(inquiryId),
      filters: this.inquiryService.getFilters(inquiryId),
      relations: this.inquiryService.getRelations(inquiryId),
      sorts: this.inquiryService.getSorts(inquiryId),
      permissions: this.inquiryService.getPermissions(inquiryId)
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Populate fields
          this.selectedFields = data.fields;
          this.populateFieldsFormArray(data.fields);

          // Populate other form arrays
          this.populateFiltersFormArray(data.filters);
          this.populateRelationsFormArray(data.relations);
          // Handle sorts and permissions as needed
        },
        error: (error) => {
          console.error('Error loading inquiry details:', error);
        }
      });
  }

  private populateForms(inquiry: InquiryConfiguration): void {
    // Basic info
    this.basicInfoForm.patchValue({
      name: inquiry.name,
      code: inquiry.code,
      display_name: inquiry.display_name,
      description: inquiry.description,
      icon: inquiry.icon || 'dashboard',
      is_public: inquiry.is_public,
      active: inquiry.active
    });

    // Model selection
    this.modelSelectionForm.patchValue({
      content_type: inquiry.content_type,
      enable_search: inquiry.enable_search,
      distinct: inquiry.distinct,
      default_page_size: inquiry.default_page_size,
      max_page_size: inquiry.max_page_size
    });

    // Load model fields
    const selectedModel = this.availableModels.find(m => m.id === inquiry.content_type);
    if (selectedModel) {
      this.onModelSelect(selectedModel);
    }

    // Permissions
    this.permissionsForm.patchValue({
      allowed_groups: inquiry.allowed_groups,
      allow_export: inquiry.allow_export,
      export_formats: inquiry.export_formats,
      search_fields: inquiry.search_fields
    });
  }

  private populateFieldsFormArray(fields: InquiryField[]): void {
    const fieldsArray = this.fieldsForm.get('fields') as FormArray;
    fieldsArray.clear();

    fields.forEach(field => {
      fieldsArray.push(this.createFieldFormGroup(field));
    });
  }

  private populateFiltersFormArray(filters: InquiryFilter[]): void {
    const filtersArray = this.filtersForm.get('filters') as FormArray;
    filtersArray.clear();

    filters.forEach(filter => {
      filtersArray.push(this.createFilterFormGroup(filter));
    });
  }

  private populateRelationsFormArray(relations: InquiryRelation[]): void {
    const relationsArray = this.relationsForm.get('relations') as FormArray;
    relationsArray.clear();

    relations.forEach(relation => {
      relationsArray.push(this.createRelationFormGroup(relation));
    });
  }

  // Model selection
  onModelSelect(model: ContentType): void {
    this.selectedModel = model;
    this.availableFields = model.fields || [];

    // Reset fields when model changes
    if (!this.isEditMode) {
      this.selectedFields = [];
      const fieldsArray = this.fieldsForm.get('fields') as FormArray;
      fieldsArray.clear();
    }
  }

  // Field management
  get fieldsFormArray(): FormArray {
    return this.fieldsForm.get('fields') as FormArray;
  }

  createFieldFormGroup(field?: Partial<InquiryField>): FormGroup {
    return this.fb.group({
      id: [field?.id || null],
      field_path: [field?.field_path || '', Validators.required],
      display_name: [field?.display_name || '', Validators.required],
      field_type: [field?.field_type || 'string', Validators.required],
      is_visible: [field?.is_visible ?? true],
      is_searchable: [field?.is_searchable ?? false],
      is_sortable: [field?.is_sortable ?? false],
      is_filterable: [field?.is_filterable ?? false],
      is_primary: [field?.is_primary ?? false],
      width: [field?.width || ''],
      alignment: [field?.alignment || 'left'],
      format_template: [field?.format_template || ''],
      transform_function: [field?.transform_function || ''],
      aggregation: [field?.aggregation || null],
      json_extract_path: [field?.json_extract_path || ''],
      order: [field?.order || 0]
    });
  }

  addField(modelField: ModelField): void {
    const field: Partial<InquiryField> = {
      field_path: modelField.name,
      display_name: modelField.verbose_name || modelField.name,
      field_type: this.mapFieldType(modelField.type),
      is_visible: true,
      is_searchable: ['string', 'text'].includes(modelField.type),
      is_sortable: !modelField.is_relation,
      is_filterable: true,
      is_primary: modelField.name === 'id',
      order: this.fieldsFormArray.length
    };

    this.fieldsFormArray.push(this.createFieldFormGroup(field));
    this.selectedFields.push(field as InquiryField);
  }

  removeField(index: number): void {
    this.fieldsFormArray.removeAt(index);
    this.selectedFields.splice(index, 1);
  }

  // Filter management
  get filtersFormArray(): FormArray {
    return this.filtersForm.get('filters') as FormArray;
  }

  createFilterFormGroup(filter?: Partial<InquiryFilter>): FormGroup {
    return this.fb.group({
      id: [filter?.id || null],
      name: [filter?.name || '', Validators.required],
      code: [filter?.code || '', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
      field_path: [filter?.field_path || '', Validators.required],
      operator: [filter?.operator || 'exact', Validators.required],
      filter_type: [filter?.filter_type || 'text', Validators.required],
      default_value: [filter?.default_value || null],
      is_required: [filter?.is_required ?? false],
      is_visible: [filter?.is_visible ?? true],
      is_advanced: [filter?.is_advanced ?? false],
      placeholder: [filter?.placeholder || ''],
      help_text: [filter?.help_text || ''],
      order: [filter?.order || 0]
    });
  }

  addFilter(): void {
    this.filtersFormArray.push(this.createFilterFormGroup());
  }

  removeFilter(index: number): void {
    this.filtersFormArray.removeAt(index);
  }

  // Relation management
  get relationsFormArray(): FormArray {
    return this.relationsForm.get('relations') as FormArray;
  }

  createRelationFormGroup(relation?: Partial<InquiryRelation>): FormGroup {
    return this.fb.group({
      id: [relation?.id || null],
      relation_path: [relation?.relation_path || '', Validators.required],
      display_name: [relation?.display_name || '', Validators.required],
      relation_type: [relation?.relation_type || 'foreign_key', Validators.required],
      include_fields: [relation?.include_fields || []],
      exclude_fields: [relation?.exclude_fields || []],
      use_select_related: [relation?.use_select_related ?? false],
      use_prefetch_related: [relation?.use_prefetch_related ?? false],
      max_depth: [relation?.max_depth || 1, [Validators.min(1), Validators.max(5)]],
      include_count: [relation?.include_count ?? false],
      order: [relation?.order || 0]
    });
  }

  addRelation(): void {
    this.relationsFormArray.push(this.createRelationFormGroup());
  }

  removeRelation(index: number): void {
    this.relationsFormArray.removeAt(index);
  }

  // Save functionality
  saveInquiry(): void {
    if (!this.validateAllForms()) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    this.isSaving = true;

    const inquiryData: InquiryConfiguration = {
      ...this.currentInquiry,
      ...this.basicInfoForm.value,
      ...this.modelSelectionForm.value,
      ...this.permissionsForm.value
    };

    const request = this.isEditMode && this.inquiryCode
      ? this.inquiryService.updateConfiguration(this.inquiryCode, inquiryData)
      : this.inquiryService.createConfiguration(inquiryData);

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedInquiry) => {
          // Save fields, filters, relations, etc.
          if (savedInquiry.id) {
            this.saveRelatedData(savedInquiry.id);
          } else {
            this.isSaving = false;
            this.navigateToList();
          }
        },
        error: (error) => {
          this.snackBar.open('Error saving inquiry', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isSaving = false;
        }
      });
  }

  private saveRelatedData(inquiryId: number): void {
    const saveOperations = [];

    // Save fields
    const fields = this.fieldsFormArray.value.map((field: any, index: number) => ({
      ...field,
      inquiry: inquiryId,
      order: index
    }));

    fields.forEach((field: InquiryField) => {
      if (field.id) {
        saveOperations.push(this.inquiryService.updateField(field.id, field));
      } else {
        saveOperations.push(this.inquiryService.addField(field));
      }
    });

    // Save filters
    const filters = this.filtersFormArray.value.map((filter: any, index: number) => ({
      ...filter,
      inquiry: inquiryId,
      order: index
    }));

    filters.forEach((filter: InquiryFilter) => {
      if (filter.id) {
        saveOperations.push(this.inquiryService.updateFilter(filter.id, filter));
      } else {
        saveOperations.push(this.inquiryService.addFilter(filter));
      }
    });

    // Execute all save operations
    if (saveOperations.length > 0) {
      forkJoin(saveOperations)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Inquiry saved successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            this.isSaving = false;
            this.navigateToList();
          },
          error: (error) => {
            this.snackBar.open('Error saving inquiry details', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
            this.isSaving = false;
          }
        });
    } else {
      this.isSaving = false;
      this.navigateToList();
    }
  }

  private validateAllForms(): boolean {
    const forms = [
      this.basicInfoForm,
      this.modelSelectionForm,
      this.fieldsForm,
      this.filtersForm,
      this.relationsForm,
      this.permissionsForm
    ];

    let isValid = true;
    forms.forEach(form => {
      if (!form.valid) {
        Object.keys(form.controls).forEach(key => {
          form.get(key)?.markAsTouched();
        });
        isValid = false;
      }
    });

    return isValid;
  }

  // Navigation
  cancel(): void {
    if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      this.navigateToList();
    }
  }

  private navigateToList(): void {
    this.router.navigate(['/settings/inquiry-management']);
  }

  // Utility methods
  private generateCode(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private mapFieldType(djangoType: string): string {
    const typeMap: { [key: string]: string } = {
      'CharField': 'string',
      'TextField': 'string',
      'IntegerField': 'number',
      'FloatField': 'decimal',
      'DecimalField': 'decimal',
      'BooleanField': 'boolean',
      'DateField': 'date',
      'DateTimeField': 'datetime',
      'JSONField': 'json',
      'ForeignKey': 'reference',
      'ManyToManyField': 'multi_reference'
    };

    return typeMap[djangoType] || 'string';
  }

  isFieldSelected(field: ModelField): boolean {
    return this.selectedFields.some(f => f.field_path === field.name);
  }
}
