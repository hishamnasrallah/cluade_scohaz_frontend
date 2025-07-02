// src/app/reports/components/field-builder/field-builder.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ViewChild,
  TemplateRef,
  SimpleChanges, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Report, DataSource, Field, FieldInfo } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

interface AvailableField extends FieldInfo {
  dataSourceId: number;
  dataSourceAlias: string;
}

@Component({
  selector: 'app-field-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatDividerModule,
    FormsModule,
    MatProgressSpinner
  ],
  templateUrl: 'field-builder.component.html',
  styleUrl: 'field-builder.component.scss'
})
export class FieldBuilderComponent implements OnInit {
  @ViewChild('fieldConfigDialog') fieldConfigDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Input() fields: Field[] = [];
  @Output() fieldsChange = new EventEmitter<Field[]>();

  // Available fields
  availableFields: Map<number, FieldInfo[]> = new Map();
  filteredFields: Map<number, FieldInfo[]> = new Map();

  // UI state
  searchTerm = '';
  editingFieldIndex: number = -1;

  // Forms
  fieldForm: FormGroup;
  formattingForm: FormGroup;

  // Options
  aggregationOptions = [
    { value: 'count', label: 'Count', icon: 'tag' },
    { value: 'count_distinct', label: 'Count Distinct', icon: 'fingerprint' },
    { value: 'sum', label: 'Sum', icon: 'add' },
    { value: 'avg', label: 'Average', icon: 'show_chart' },
    { value: 'min', label: 'Minimum', icon: 'arrow_downward' },
    { value: 'max', label: 'Maximum', icon: 'arrow_upward' },
    { value: 'group_by', label: 'Group By', icon: 'workspaces' }
  ];

  formatTypes = [
    { value: 'currency', label: 'Currency', icon: 'attach_money' },
    { value: 'percentage', label: 'Percentage', icon: 'percent' },
    { value: 'number', label: 'Number', icon: 'numbers' },
    { value: 'date', label: 'Date', icon: 'calendar_today' },
    { value: 'datetime', label: 'Date & Time', icon: 'schedule' },
    { value: 'email', label: 'Email', icon: 'email' },
    { value: 'url', label: 'URL', icon: 'link' }
  ];
  isLoadingFields = false;
  availableFieldTypes: Array<{ id: number; code: string; name: string; name_ara: string; active_ind: boolean }> = [];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.formattingForm = this.fb.group({
      type: [''],
      prefix: ['$'],
      suffix: [''],
      decimals: [2],
      thousands_separator: [true],
      date_format: ['MM/DD/YYYY'],
      multiply_by_100: [false]
    });

    this.fieldForm = this.fb.group({
      display_name: ['', Validators.required],
      aggregation: [''],
      width: [null],
      order: [0],
      is_visible: [true],
      formatting: this.formattingForm
    });
  }

  ngOnInit(): void {
    // Don't load fields immediately, wait for ngOnChanges
    console.log('FieldBuilder ngOnInit - dataSources:', this.dataSources);

    // Load field types from backend
    this.loadFieldTypes();
  }
// Add this method
  private loadFieldTypes(): void {
    this.reportService.getFieldTypes().subscribe({
      next: (response) => {
        console.log('Loaded field types:', response);
        this.availableFieldTypes = response;
      },
      error: (err) => {
        console.error('Error loading field types:', err);
      }
    });
  }
  // Add this helper method
  private getFieldTypeId(fieldTypeName: string): number | null {
    // Map Django field types to your backend field type codes
    const typeMapping: Record<string, string> = {
      // Integer types
      'BigAutoField': 'NUMBER',
      'AutoField': 'NUMBER',
      'IntegerField': 'NUMBER',
      'BigIntegerField': 'NUMBER',
      'SmallIntegerField': 'NUMBER',
      'PositiveIntegerField': 'NUMBER',
      'PositiveSmallIntegerField': 'NUMBER',

      // Decimal types
      'FloatField': 'DECIMAL',
      'DecimalField': 'DECIMAL',

      // Text types
      'CharField': 'TEXT',
      'TextField': 'TEXTAREA',
      'SlugField': 'SLUG',

      // Boolean
      'BooleanField': 'BOOLEAN',
      'NullBooleanField': 'BOOLEAN',

      // Date/Time types
      'DateField': 'DATE',
      'DateTimeField': 'DATETIME',
      'TimeField': 'TIME',

      // Email/URL
      'EmailField': 'EMAIL',
      'URLField': 'URL',

      // File types
      'FileField': 'FILE',
      'ImageField': 'IMAGE',

      // Relationship types
      'ForeignKey': 'FOREIGN_KEY',
      'ManyToManyField': 'MANY_TO_MANY',
      'OneToOneField': 'ONE_TO_ONE',

      // Other types
      'UUIDField': 'UUID',
      'GenericIPAddressField': 'IP_ADDRESS',
      'JSONField': 'JSON'
    };

    const mappedCode = typeMapping[fieldTypeName];
    if (!mappedCode) {
      console.warn(`No mapping found for field type: ${fieldTypeName}, defaulting to TEXT`);
      // Default to TEXT for unknown types
      const textType = this.availableFieldTypes.find(ft => ft.code === 'TEXT');
      return textType?.id || null;
    }

    // Find the field type by code
    const fieldType = this.availableFieldTypes.find(ft =>
      ft.code === mappedCode && ft.active_ind
    );

    if (!fieldType) {
      console.warn(`No field type found for code: ${mappedCode}`);
      // Try to find TEXT as fallback
      const textType = this.availableFieldTypes.find(ft => ft.code === 'TEXT');
      return textType?.id || null;
    }

    console.log(`Mapped ${fieldTypeName} -> ${mappedCode} -> ID: ${fieldType.id}`);
    return fieldType.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('FieldBuilder ngOnChanges:', changes);

    if (changes['dataSources']) {
      const currentValue = changes['dataSources'].currentValue;
      const previousValue = changes['dataSources'].previousValue;

      console.log('DataSources changed from:', previousValue, 'to:', currentValue);

      // Check if we have a real change (not just initialization)
      if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
        // Check if this is a real change or just the same data
        const hasChanged = !previousValue ||
          previousValue.length !== currentValue.length ||
          JSON.stringify(previousValue) !== JSON.stringify(currentValue);

        if (hasChanged) {
          console.log('DataSources actually changed, reloading fields...');
          // Clear previous fields
          this.availableFields.clear();
          this.filteredFields.clear();

          // Load fields for new data sources
          this.loadAvailableFields();
        }
      }
    }

    // Also reload if fields array changes (for edit mode)
    if (changes['fields'] && !changes['fields'].firstChange) {
      console.log('Fields input changed:', this.fields);
    }
  }

  loadAvailableFields(): void {
    console.log('Loading available fields for dataSources:', this.dataSources);

    if (!Array.isArray(this.dataSources) || this.dataSources.length === 0) {
      console.warn('No data sources available to load fields from');
      return;
    }

    this.isLoadingFields = true;

    // Track loading promises
    const loadPromises: Promise<void>[] = [];

    for (const dataSource of this.dataSources) {
      // Check both content_type_id and content_type object
      const contentTypeId = dataSource.content_type_id || dataSource.content_type?.id;

      if (!contentTypeId) {
        console.warn('Data source missing content_type_id:', dataSource);
        continue;
      }

      console.log(`Loading fields for data source ${dataSource.alias} (content_type_id: ${contentTypeId})`);

      const promise = this.reportService.getContentTypeFields(contentTypeId)
        .toPromise()
        .then(response => {
          if (response && response.fields) {
            // Use both possible keys for the map
            const key = dataSource.id || contentTypeId;
            this.availableFields.set(key, response.fields);

            // Also set by content_type_id to ensure we can find it
            if (dataSource.id && dataSource.id !== contentTypeId) {
              this.availableFields.set(contentTypeId, response.fields);
            }

            console.log(`Loaded ${response.fields.length} fields for data source ${dataSource.alias} (key: ${key})`);
          }
        })
        .catch(err => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        });

      loadPromises.push(promise);
    }

    // After all fields are loaded, filter them
    Promise.all(loadPromises).then(() => {
      console.log('All fields loaded. Available fields map:', this.availableFields);
      this.filterFields();
      this.isLoadingFields = false;

      // Force change detection
      this.cdr.detectChanges();
    });
  }

  filterFields(): void {
    const term = this.searchTerm.toLowerCase();

    if (!term) {
      this.filteredFields = new Map(this.availableFields);
    } else {
      this.filteredFields.clear();

      for (const [dsId, fields] of this.availableFields.entries()) {
        const filtered = fields.filter(field =>
          field.verbose_name.toLowerCase().includes(term) ||
          field.path.toLowerCase().includes(term) ||
          field.type.toLowerCase().includes(term)
        );

        if (filtered.length > 0) {
          this.filteredFields.set(dsId, filtered);
        }
      }
    }
  }

  getAvailableFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    const key = dataSource.id || dataSource.content_type_id;
    return this.availableFields.get(key!) || [];
  }

  getFilteredFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    const key = dataSource.id || dataSource.content_type_id;
    return this.filteredFields.get(key!) || [];
  }

  isFieldSelected(field: FieldInfo): boolean {
    return this.fields.some(f => f.field_path === field.path);
  }

// Update the getFieldTypeCode method (add this new method)
  private getFieldTypeCode(fieldTypeName: string): string {
    const typeMapping: Record<string, string> = {
      'BigAutoField': 'NUMBER',
      'AutoField': 'NUMBER',
      'IntegerField': 'NUMBER',
      'BigIntegerField': 'NUMBER',
      'SmallIntegerField': 'NUMBER',
      'PositiveIntegerField': 'NUMBER',
      'FloatField': 'DECIMAL',
      'DecimalField': 'DECIMAL',
      'CharField': 'TEXT',
      'TextField': 'TEXTAREA',
      'SlugField': 'SLUG',
      'BooleanField': 'BOOLEAN',
      'DateField': 'DATE',
      'DateTimeField': 'DATETIME',
      'TimeField': 'TIME',
      'EmailField': 'EMAIL',
      'URLField': 'URL',
      'FileField': 'FILE',
      'ImageField': 'IMAGE',
      'ForeignKey': 'FOREIGN_KEY',
      'ManyToManyField': 'MANY_TO_MANY',
      'OneToOneField': 'ONE_TO_ONE',
      'UUIDField': 'UUID',
      'GenericIPAddressField': 'IP_ADDRESS',
      'JSONField': 'JSON'
    };

    return typeMapping[fieldTypeName] || 'TEXT';
  }

  quickAddField(field: FieldInfo, dataSource: DataSource): void {
    // Get the field type code
    const fieldTypeCode = this.getFieldTypeCode(field.type);

    console.log('Field type mapping:', {
      originalType: field.type,
      mappedCode: fieldTypeCode
    });

    if (!this.report?.id || !dataSource.id) {
      // For new reports without ID, add to local array
      const newField: Field = {
        report: this.report?.id || 0,
        data_source: dataSource.id || dataSource.content_type_id!,
        field_path: field.path,
        field_name: field.name,
        display_name: field.verbose_name,
        field_type: fieldTypeCode as any, // Use the code
        field_type_name: field.type, // Store original type name for UI
        order: this.fields.length,
        is_visible: true,
        aggregation: '', // Empty string
        width: null,
        formatting: {} // Empty object
      };

      this.fields = [...this.fields, newField];
      this.fieldsChange.emit(this.fields);

      this.snackBar.open('Field added (will be saved with report)', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    } else {
      // For existing reports, save to backend immediately
      const newField = {
        report: this.report.id,
        data_source: dataSource.id,
        field_path: field.path,
        field_name: field.name,
        display_name: field.verbose_name,
        field_type: fieldTypeCode, // Send the code like "NUMBER", "TEXT", etc.
        aggregation: '', // Empty string
        order: this.fields.length,
        is_visible: true,
        width: null,
        formatting: {} // Empty object
      };

      console.log('Creating field with field_type code:', newField);

      this.reportService.createField(newField).subscribe({
        next: (createdField) => {
          // Store the original field type name for UI
          createdField.field_type_name = field.type;
          this.fields = [...this.fields, createdField];
          this.fieldsChange.emit(this.fields);

          this.snackBar.open('Field added', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => {
          console.error('Error adding field:', err);
          console.error('Error details:', err.error);

          // Show specific error message
          let errorMessage = 'Error adding field';
          if (err.error?.field_type) {
            errorMessage = `Field type error: ${err.error.field_type[0]}`;
          } else if (err.error?.data_source) {
            errorMessage = `Data source error: ${err.error.data_source[0]}`;
          } else if (err.error?.aggregation) {
            errorMessage = `Aggregation error: ${err.error.aggregation[0]}`;
          }

          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within selected fields
      moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
      this.updateFieldOrders();
    } else {
      // Adding from available fields
      const field = event.item.data as FieldInfo;
      const dataSourceId = event.previousContainer.data[0]?.dataSourceId;

      if (dataSourceId && !this.isFieldSelected(field)) {
        const dataSource = this.dataSources.find(ds => ds.id === dataSourceId);
        if (dataSource) {
          this.quickAddField(field, dataSource);
        }
      }
    }
  }

  updateFieldOrders(): void {
    const updates = this.fields.map((field, index) => {
      if (field.id && field.order !== index) {
        return this.reportService.updateField(field.id, { order: index });
      }
      return null;
    }).filter(obs => obs !== null);

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs!.toPromise())).then(() => {
        this.fields = this.fields.map((field, index) => ({
          ...field,
          order: index
        }));
        this.fieldsChange.emit(this.fields);
      });
    }
  }

  editField(field: Field, index: number): void {
    this.editingFieldIndex = index;

    this.fieldForm.patchValue({
      display_name: field.display_name,
      aggregation: field.aggregation || '',
      width: field.width,
      order: field.order,
      is_visible: field.is_visible
    });

    if (field.formatting) {
      this.formattingForm.patchValue(field.formatting);
    } else {
      this.formattingForm.reset({
        type: '',
        prefix: '$',
        decimals: 2,
        thousands_separator: true,
        date_format: 'MM/DD/YYYY'
      });
    }

    this.dialog.open(this.fieldConfigDialog, {
      width: '600px',
      maxWidth: '90vw'
    });
  }

  saveFieldConfig(): void {
    if (!this.fieldForm.valid || this.editingFieldIndex < 0) return;

    const field = this.fields[this.editingFieldIndex];
    if (!field.id) return;

    const updates: Partial<Field> = {
      ...this.fieldForm.value,
      formatting: this.formattingForm.value.type ? this.formattingForm.value : null
    };

    this.reportService.updateField(field.id, updates).subscribe({
      next: (updatedField) => {
        this.fields[this.editingFieldIndex] = updatedField;
        this.fieldsChange.emit(this.fields);

        this.dialog.closeAll();
        this.snackBar.open('Field updated', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error updating field:', err);
        this.snackBar.open('Error updating field', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleVisibility(field: Field, index: number): void {
    if (!field.id) return;

    const updates = { is_visible: !field.is_visible };

    this.reportService.updateField(field.id, updates).subscribe({
      next: (updatedField) => {
        this.fields[index] = updatedField;
        this.fieldsChange.emit(this.fields);
      },
      error: (err) => {
        console.error('Error toggling visibility:', err);
        this.snackBar.open('Error updating field', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeField(index: number): void {
    const field = this.fields[index];
    if (!field.id) return;

    if (confirm(`Remove field "${field.display_name}"?`)) {
      this.reportService.deleteField(field.id).subscribe({
        next: () => {
          this.fields = this.fields.filter((_, i) => i !== index);
          this.fieldsChange.emit(this.fields);

          this.snackBar.open('Field removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        },
        error: (err) => {
          console.error('Error removing field:', err);
          this.snackBar.open('Error removing field', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  clearAllFields(): void {
    if (confirm('Remove all fields?')) {
      const deletions = this.fields
        .filter(field => field.id)
        .map(field => this.reportService.deleteField(field.id!));

      Promise.all(deletions.map(obs => obs.toPromise())).then(() => {
        this.fields = [];
        this.fieldsChange.emit(this.fields);

        this.snackBar.open('All fields removed', 'Close', {
          duration: 2000,
          panelClass: ['info-snackbar']
        });
      });
    }
  }

  suggestFields(): void {
    // Implement field suggestions based on common patterns
    const primaryDs = this.dataSources.find(ds => ds.is_primary);
    if (!primaryDs) return;

    const commonFields = ['id', 'name', 'created_at', 'status'];
    const key = primaryDs.id || primaryDs.content_type_id;
    const availableForPrimary = this.availableFields.get(key!) || [];

    const suggestedFields = availableForPrimary.filter(field =>
      commonFields.some(common => field.name.toLowerCase().includes(common)) &&
      !this.isFieldSelected(field)
    );

    suggestedFields.forEach(field => {
      this.quickAddField(field, primaryDs);
    });

    if (suggestedFields.length === 0) {
      this.snackBar.open('No suggested fields found', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    }
  }

  addAllPrimaryFields(): void {
    const primaryDs = this.dataSources.find(ds => ds.is_primary);
    if (!primaryDs) {
      this.snackBar.open('No primary data source found', 'Close', {
        duration: 2000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const key = primaryDs.id || primaryDs.content_type_id;
    const availableForPrimary = this.availableFields.get(key!) || [];
    const unselectedFields = availableForPrimary.filter(field => !this.isFieldSelected(field));

    if (unselectedFields.length === 0) {
      this.snackBar.open('All fields are already selected', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    if (unselectedFields.length > 10) {
      if (!confirm(`Add all ${unselectedFields.length} fields?`)) {
        return;
      }
    }

    unselectedFields.forEach(field => {
      this.quickAddField(field, primaryDs);
    });
  }

  getDataSourceAlias(dataSourceId: number): string {
    const ds = this.dataSources.find(d =>
      d.id === dataSourceId || d.content_type_id === dataSourceId
    );
    return ds?.alias || 'unknown';
  }

  getFieldIcon(type: string | number | undefined): string {
    // If type is undefined or null, return default icon
    if (!type) return 'text_fields';

    // If type is a number (field_type ID), we need to map it
    // For now, return a default icon since we don't have the mapping
    if (typeof type === 'number') {
      // TODO: Implement proper mapping from field_type ID to icon
      return 'text_fields';
    }

    // Original string-based mapping
    const icons: Record<string, string> = {
      'CharField': 'text_fields',
      'TextField': 'subject',
      'IntegerField': 'pin',
      'FloatField': 'calculate',
      'DecimalField': 'calculate',
      'BooleanField': 'toggle_on',
      'DateField': 'calendar_today',
      'DateTimeField': 'schedule',
      'EmailField': 'email',
      'URLField': 'link',
      'ForeignKey': 'link',
      'ManyToManyField': 'call_split'
    };
    return icons[type] || 'text_fields';
  }

  getFieldTypeLabel(type: string): string {
    return type.replace('Field', '').replace(/([A-Z])/g, ' $1').trim();
  }

  getAggregationLabel(aggregation: string): string {
    const option = this.aggregationOptions.find(opt => opt.value === aggregation);
    return option?.label || aggregation;
  }

  getFormattingIcon(type: string): string {
    const format = this.formatTypes.find(f => f.value === type);
    return format?.icon || 'format_paint';
  }

  getAggregatedFieldsCount(): number {
    return this.fields.filter(f => f.aggregation).length;
  }

  getVisibleFieldsCount(): number {
    return this.fields.filter(f => f.is_visible).length;
  }
}
