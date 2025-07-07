// src/app/components/template-builder/template-wizard/template-wizard.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule} from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  PDFTemplate,
  PDFTemplateParameter,
  PDFTemplateDataSource,
  WizardData,
  DesignerData,
  ContentTypeModel,
  PDFTemplateElement,
  PDFTemplateVariable
} from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-template-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatExpansionModule,
    DragDropModule
  ],
  templateUrl: 'template-wizard.component.html',
  styleUrl: 'template-wizard.component.css',
})
export class TemplateWizardComponent implements OnInit {
  @Input() template: PDFTemplate | null = null;
  @Output() save = new EventEmitter<PDFTemplate>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('stepper') stepper!: MatStepper;

  // Form groups for each step
  basicInfoForm!: FormGroup;
  pageSetupForm!: FormGroup;
  dataSourceForm!: FormGroup;
  parametersForm!: FormGroup;
  dataSourcesForm!: FormGroup;
  permissionsForm!: FormGroup;

// Data
  designerData: DesignerData | null = null;
  contentTypes: ContentTypeModel[] = [];
  availableGroups: any[] = []; // This should come from your auth/user service

// Default values for dropdowns
  defaultPageSizes = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'legal', label: 'Legal (8.5 × 14 in)' }
  ];

  // Loading states
  loadingDesignerData = false;
  loadingContentTypes = false;
  queryFilters: any[] = [];
  selectedContentType: ContentTypeModel | null = null;
  private filterUpdateSubject = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private pdfTemplateService: PDFTemplateService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
    if (this.template) {
      this.populateFormsFromTemplate();
    }

    // Add this subscription to debounce filter updates
    this.filterUpdateSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.performQueryFilterUpdate();
    });
  }

  ngOnDestroy(): void {
    this.filterUpdateSubject.complete();
  }

  private initializeForms(): void {
    // Step 1: Basic Information
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      name_ara: [''],
      description: [''],
      description_ara: [''],
      code: ['', Validators.required],
      primary_language: ['en'],
      supports_bilingual: [false]
    });

    // Step 2: Page Setup
    this.pageSetupForm = this.fb.group({
      page_size: ['A4'],
      orientation: ['portrait'],
      margins: this.fb.group({
        top: [72],
        bottom: [72],
        left: [72],
        right: [72]
      }),
      header_enabled: [true],
      footer_enabled: [true],
      watermark_enabled: [false],
      watermark_text: ['']
    });

    // Step 3: Data Source
    this.dataSourceForm = this.fb.group({
      data_source_type: ['model'],
      content_type: [null],
      query_filter: [{}],
      custom_function_path: [''],
      raw_sql_query: ['']
    });

    // Step 4: Parameters
    this.parametersForm = this.fb.group({
      requires_parameters: [false],
      parameters: this.fb.array([])
    });

    // Step 5: Additional Data Sources
    this.dataSourcesForm = this.fb.group({
      data_sources: this.fb.array([])
    });

    // Step 6: Permissions
    this.permissionsForm = this.fb.group({
      allow_self_generation: [true],
      allow_other_generation: [false],
      groups: [[]]
    });
  }

  private loadInitialData(): void {
    // Load designer data
    this.loadingDesignerData = true;
    this.pdfTemplateService.getDesignerData().subscribe({
      next: (data) => {
        this.designerData = data;
        // Use defaults if backend doesn't provide values
        if (!this.designerData.page_sizes || this.designerData.page_sizes.length === 0) {
          this.designerData.page_sizes = this.defaultPageSizes;
        }
        this.loadingDesignerData = false;
      },
      error: (error) => {
        console.error('Error loading designer data:', error);
        // Use default values on error
        this.designerData = {
          page_sizes: this.defaultPageSizes,
          fonts: [
            { value: 'Helvetica', label: 'Helvetica' },
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Courier', label: 'Courier' },
            { value: 'Verdana', label: 'Verdana' }
          ],
          text_aligns: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' }
          ],
          parameter_types: [
            { value: 'string', label: 'Text' },
            { value: 'integer', label: 'Number' },
            { value: 'float', label: 'Decimal' },
            { value: 'date', label: 'Date' },
            { value: 'datetime', label: 'Date & Time' },
            { value: 'boolean', label: 'Yes/No' }
          ],
          widget_types: [
            { value: 'text', label: 'Text Input' },
            { value: 'number', label: 'Number Input' },
            { value: 'date', label: 'Date Picker' },
            { value: 'select', label: 'Dropdown' },
            { value: 'checkbox', label: 'Checkbox' },
            { value: 'radio', label: 'Radio Buttons' }
          ],
          fetch_methods: [
            { value: 'model_query', label: 'Model Query' },
            { value: 'raw_sql', label: 'Raw SQL' },
            { value: 'custom_function', label: 'Custom Function' },
            { value: 'api', label: 'External API' }
          ]
        };
        this.loadingDesignerData = false;
      }
    });

// Load content types
    this.loadingContentTypes = true;
    this.pdfTemplateService.getContentTypes().subscribe({
      next: (types) => {
        console.log('Loaded content types:', types); // Debug log
        this.contentTypes = types;
        this.loadingContentTypes = false;
      },
      error: (error) => {
        console.error('Error loading content types:', error);
        console.error('Error details:', error.message, error.status); // More debug info
        this.contentTypes = []; // Ensure empty array on error
        this.loadingContentTypes = false;
      }
    });

    // TODO: Load available groups from your auth service
    this.availableGroups = [
      { id: 1, name: 'Administrators' },
      { id: 2, name: 'Managers' },
      { id: 3, name: 'Employees' }
    ];
  }

  private populateFormsFromTemplate(): void {
    if (!this.template) return;

    // Populate basic info
    this.basicInfoForm.patchValue({
      name: this.template.name,
      name_ara: this.template.name_ara,
      description: this.template.description,
      description_ara: this.template.description_ara,
      code: this.template.code,
      primary_language: this.template.primary_language,
      supports_bilingual: this.template.supports_bilingual
    });

    // Populate page setup
    this.pageSetupForm.patchValue({
      page_size: this.template.page_size,
      orientation: this.template.orientation,
      margins: {
        top: this.template.margin_top,
        bottom: this.template.margin_bottom,
        left: this.template.margin_left,
        right: this.template.margin_right
      },
      header_enabled: this.template.header_enabled,
      footer_enabled: this.template.footer_enabled,
      watermark_enabled: this.template.watermark_enabled,
      watermark_text: this.template.watermark_text
    });

    // Populate data source
    this.dataSourceForm.patchValue({
      data_source_type: this.template.data_source_type,
      content_type: this.template.content_type,
      query_filter: this.template.query_filter,
      custom_function_path: this.template.custom_function_path,
      raw_sql_query: this.template.raw_sql_query
    });

    // Populate parameters
    if (this.template.parameters) {
      this.parametersForm.patchValue({
        requires_parameters: this.template.requires_parameters
      });
      this.template.parameters.forEach(param => {
        this.addParameter(param);
      });
    }

    // Populate data sources
    if (this.template.data_sources) {
      this.template.data_sources.forEach(source => {
        this.addDataSource(source);
      });
    }

    // Populate permissions
    this.permissionsForm.patchValue({
      allow_self_generation: this.template.allow_self_generation,
      allow_other_generation: this.template.allow_other_generation,
      groups: this.template.groups || []
    });
  }

  // Form array getters
  get parameters(): FormArray {
    return this.parametersForm.get('parameters') as FormArray;
  }

  get dataSources(): FormArray {
    return this.dataSourcesForm.get('data_sources') as FormArray;
  }

  // Parameter management
  addParameter(param?: PDFTemplateParameter): void {
    const parameterForm = this.fb.group({
      parameter_key: [param?.parameter_key || '', Validators.required],
      display_name: [param?.display_name || '', Validators.required],
      display_name_ara: [param?.display_name_ara || ''],
      description: [param?.description || ''],
      description_ara: [param?.description_ara || ''],
      parameter_type: [param?.parameter_type || 'string'],
      is_required: [param?.is_required ?? true],
      default_value: [param?.default_value || ''],
      widget_type: [param?.widget_type || 'text'],
      widget_config: [param?.widget_config || {}],
      validation_rules: [param?.validation_rules || {}],
      query_field: [param?.query_field || ''],
      query_operator: [param?.query_operator || 'exact'],
      allow_user_override: [param?.allow_user_override ?? true],
      restricted_to_groups: [param?.restricted_to_groups || []],
      order: [param?.order ?? this.parameters.length],
      active_ind: [param?.active_ind ?? true]
    });

    this.parameters.push(parameterForm);
  }

  removeParameter(index: number): void {
    this.parameters.removeAt(index);
  }

  dropParameter(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.parameters.controls, event.previousIndex, event.currentIndex);
    // Update order values
    this.parameters.controls.forEach((control, index) => {
      control.patchValue({ order: index });
    });
  }

  // Data source management
  addDataSource(source?: PDFTemplateDataSource): void {
    const dataSourceForm = this.fb.group({
      source_key: [source?.source_key || '', Validators.required],
      display_name: [source?.display_name || '', Validators.required],
      fetch_method: [source?.fetch_method || 'model_query'],
      content_type: [source?.content_type || null],
      query_path: [source?.query_path || ''],
      filter_config: [source?.filter_config || {}],
      custom_function_path: [source?.custom_function_path || ''],
      raw_sql: [source?.raw_sql || ''],
      post_process_function: [source?.post_process_function || ''],
      cache_timeout: [source?.cache_timeout || 0],
      order: [source?.order ?? this.dataSources.length],
      active_ind: [source?.active_ind ?? true]
    });

    this.dataSources.push(dataSourceForm);
  }

  removeDataSource(index: number): void {
    this.dataSources.removeAt(index);
  }

  // Event handlers
  onDataSourceTypeChange(): void {
    const type = this.dataSourceForm.get('data_source_type')?.value;

    // Clear filters when changing data source type
    this.queryFilters = [];
    this.selectedContentType = null;

    // Reset fields based on type
    if (type !== 'model') {
      this.dataSourceForm.patchValue({ content_type: null, query_filter: {} }, { emitEvent: false });
    }
    if (type !== 'raw_sql') {
      this.dataSourceForm.patchValue({ raw_sql_query: '' }, { emitEvent: false });
    }
    if (type !== 'custom_function') {
      this.dataSourceForm.patchValue({ custom_function_path: '' }, { emitEvent: false });
    }
  }


  addQueryFilter(): void {
    const contentTypeId = this.dataSourceForm.get('content_type')?.value;
    if (!contentTypeId) {
      this.snackBar.open('Please select a model first', 'Close', { duration: 3000 });
      return;
    }

    this.selectedContentType = this.contentTypes.find(ct => ct.id === contentTypeId) || null;

    if (!this.selectedContentType || !this.selectedContentType.model_fields) {
      this.snackBar.open('No fields available for this model', 'Close', { duration: 3000 });
      return;
    }

    const newFilter = {
      id: Date.now(),
      field: '',
      fieldType: '',
      operator: 'exact',
      value: ''
    };

    this.queryFilters.push(newFilter);
    // Don't update immediately when adding empty filter
  }

  removeQueryFilter(index: number): void {
    this.queryFilters.splice(index, 1);
    this.scheduleQueryFilterUpdate();
  }
  onFilterFieldChange(filter: any): void {
    const field = this.selectedContentType?.model_fields?.find(f => f.name === filter.field);
    if (field) {
      filter.fieldType = field.type;
      filter.operator = 'exact'; // Reset operator when field changes
      filter.value = ''; // Reset value when field changes
    }
    this.scheduleQueryFilterUpdate();
  }
  onFilterOperatorChange(filter: any): void {
    this.scheduleQueryFilterUpdate();
  }

  onFilterValueChange(filter: any): void {
    this.scheduleQueryFilterUpdate();
  }

  scheduleQueryFilterUpdate(): void {
    this.filterUpdateSubject.next();
  }
  updateQueryFilter(): void {
    // Convert filters array to Django query format
    const queryFilter: any = {};

    this.queryFilters.forEach(filter => {
      if (filter.field && filter.value !== '') {
        const key = filter.operator === 'exact' ? filter.field : `${filter.field}__${filter.operator}`;
        queryFilter[key] = filter.value;
      }
    });

    this.dataSourceForm.patchValue({ query_filter: queryFilter });
  }

  getOperatorsForField(fieldType: string): Array<{value: string, label: string}> {
    const operators: Record<string, Array<{value: string, label: string}>> = {
      'CharField': [
        { value: 'exact', label: 'Equals' },
        { value: 'icontains', label: 'Contains' },
        { value: 'istartswith', label: 'Starts with' },
        { value: 'iendswith', label: 'Ends with' }
      ],
      'IntegerField': [
        { value: 'exact', label: 'Equals' },
        { value: 'gt', label: 'Greater than' },
        { value: 'gte', label: 'Greater than or equal' },
        { value: 'lt', label: 'Less than' },
        { value: 'lte', label: 'Less than or equal' }
      ],
      'DateField': [
        { value: 'exact', label: 'Equals' },
        { value: 'gt', label: 'After' },
        { value: 'gte', label: 'On or after' },
        { value: 'lt', label: 'Before' },
        { value: 'lte', label: 'On or before' }
      ],
      'BooleanField': [
        { value: 'exact', label: 'Equals' }
      ],
      'ForeignKey': [
        { value: 'exact', label: 'Equals' },
        { value: 'in', label: 'In list' }
      ]
    };

    return operators[fieldType] || [{ value: 'exact', label: 'Equals' }];
  }

  getAvailableWidgets(parameterType: string): any[] {
    if (!this.designerData) return [];

    const widgetMap: Record<string, string[]> = {
      'integer': ['number', 'text'],
      'float': ['number', 'text'],
      'string': ['text', 'select', 'radio'],
      'date': ['date', 'text'],
      'datetime': ['datetime', 'text'],
      'boolean': ['checkbox', 'select'],
      'user_id': ['user_search', 'select'],
      'model_id': ['model_search', 'select']
    };

    const availableTypes = widgetMap[parameterType] || ['text'];
    return this.designerData.widget_types.filter(w => availableTypes.includes(w.value));
  }

  completeWizard(): void {
    if (this.isFormValid()) {
      const wizardData = this.collectWizardData();
      const template = this.buildTemplateFromWizardData(wizardData);
      this.save.emit(template);
    }
  }

  private isFormValid(): boolean {
    return this.basicInfoForm.valid &&
      this.pageSetupForm.valid &&
      this.dataSourceForm.valid &&
      this.parametersForm.valid &&
      this.dataSourcesForm.valid &&
      this.permissionsForm.valid;
  }

  private collectWizardData(): WizardData {
    return {
      basicInfo: this.basicInfoForm.value,
      pageSetup: this.pageSetupForm.value,
      dataSource: this.dataSourceForm.value,
      parameters: this.parameters.value,
      dataSources: this.dataSources.value,
      design: {
        elements: [], // Elements will be added in designer mode
        variables: []
      },
      permissions: this.permissionsForm.value
    };
  }

  private buildTemplateFromWizardData(data: WizardData): PDFTemplate {
    return {
      // Basic info
      ...data.basicInfo,

      // Page setup
      page_size: data.pageSetup.page_size as 'A4' | 'A3' | 'letter' | 'legal',
      orientation: data.pageSetup.orientation as 'portrait' | 'landscape',
      margin_top: data.pageSetup.margins.top,
      margin_bottom: data.pageSetup.margins.bottom,
      margin_left: data.pageSetup.margins.left,
      margin_right: data.pageSetup.margins.right,
      header_enabled: data.pageSetup.header_enabled,
      footer_enabled: data.pageSetup.footer_enabled,
      watermark_enabled: data.pageSetup.watermark_enabled,
      watermark_text: data.pageSetup.watermark_text,

      // Data source
      data_source_type: data.dataSource.data_source_type as 'model' | 'raw_sql' | 'custom_function' | 'api',
      content_type: data.dataSource.content_type,
      query_filter: data.dataSource.query_filter,
      custom_function_path: data.dataSource.custom_function_path,
      raw_sql_query: data.dataSource.raw_sql_query,

      // Parameters and sources
      parameters: data.parameters,
      data_sources: data.dataSources,
      elements: data.design.elements,
      variables: data.design.variables,

      // Permissions
      ...data.permissions,
      requires_parameters: data.permissions.requires_parameters || data.parameters.length > 0,

      // Defaults
      is_system_template: false,
      active_ind: true
    };
  }

  onModelSelected(contentTypeId: number): void {
    const selectedModel = this.contentTypes.find(ct => ct.id === contentTypeId);
    if (selectedModel && selectedModel.model_fields) {
      console.log('Selected model fields:', selectedModel.model_fields);
      // You can store these fields for later use in query building
      // this.selectedModelFields = selectedModel.model_fields;
    }
  }
  getFieldType(fieldName: string): string {
    if (!this.selectedContentType || !this.selectedContentType.model_fields) {
      return '';
    }
    const field = this.selectedContentType.model_fields.find(f => f.name === fieldName);
    return field ? field.type : '';
  }

  getOperatorsForFilter(filter: any): Array<{value: string, label: string}> {
    return this.getOperatorsForField(filter.fieldType || '');
  }

  performQueryFilterUpdate(): void {
    const queryFilter: any = {};

    this.queryFilters.forEach(filter => {
      if (filter.field && filter.value !== '' && filter.value !== null && filter.value !== undefined) {
        const key = filter.operator === 'exact' ? filter.field : `${filter.field}__${filter.operator}`;
        queryFilter[key] = filter.value;
      }
    });

    // Only update if the value actually changed
    const currentValue = this.dataSourceForm.get('query_filter')?.value;
    if (JSON.stringify(currentValue) !== JSON.stringify(queryFilter)) {
      this.dataSourceForm.patchValue({ query_filter: queryFilter }, { emitEvent: false });
    }
  }

  protected readonly Object = Object;
}
