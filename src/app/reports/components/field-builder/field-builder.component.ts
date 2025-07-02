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
  availableFields: Map<number | string, FieldInfo[]> = new Map();
  filteredFields: Map<number | string, FieldInfo[]> = new Map();

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
  ngOnChanges(changes: SimpleChanges): void {
    console.log('FieldBuilder ngOnChanges:', changes);

    if (changes['dataSources']) {
      const currentValue = changes['dataSources'].currentValue;
      const previousValue = changes['dataSources'].previousValue;

      console.log('DataSources changed from:', previousValue, 'to:', currentValue);

      // Check if we have a real change
      if (currentValue && Array.isArray(currentValue) && currentValue.length > 0) {
        console.log('DataSources actually changed, reloading fields...');

        // Clear previous fields
        this.availableFields.clear();
        this.filteredFields.clear();

        // Wait a bit to ensure data sources are properly initialized
        setTimeout(() => {
          this.loadAvailableFields();
        }, 100);
      }
    }

    // Handle fields array changes for edit mode
    if (changes['fields']) {
      console.log('Fields input changed:', this.fields);

      // Ensure fields have proper field_type_name
      this.fields = this.fields.map(field => ({
        ...field,
        field_type_name: field.field_type_name || field.field_type,
        aggregation: field.aggregation || '',
        formatting: field.formatting || {}
      }));
    }
  }

  loadAvailableFields(): void {
    console.log('Loading available fields for dataSources:', this.dataSources);

    if (!Array.isArray(this.dataSources) || this.dataSources.length === 0) {
      console.warn('No data sources available to load fields from');
      this.isLoadingFields = false;
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
            // Store fields with multiple keys to ensure we can find them
            const keys = [
              dataSource.id,
              contentTypeId,
              `${dataSource.id}_${contentTypeId}` // Composite key
            ].filter(key => key !== undefined && key !== null);

            keys.forEach(key => {
              this.availableFields.set(key!, response.fields);
              this.filteredFields.set(key!, response.fields);
            });

            console.log(`Loaded ${response.fields.length} fields for data source ${dataSource.alias}`);
            console.log('Available keys:', keys);
          }
        })
        .catch(err => {
          console.error(`Error loading fields for data source ${dataSource.alias}:`, err);
        });

      loadPromises.push(promise);
    }

    // After all fields are loaded, update UI
    Promise.all(loadPromises).then(() => {
      console.log('All fields loaded. Available fields map size:', this.availableFields.size);
      console.log('Available fields keys:', Array.from(this.availableFields.keys()));

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
    // Try multiple keys to find the fields
    const keys = [
      dataSource.id,
      dataSource.content_type_id,
      `${dataSource.id}_${dataSource.content_type_id}`
    ].filter(key => key !== undefined && key !== null);

    for (const key of keys) {
      const fields = this.availableFields.get(key!);
      if (fields && fields.length > 0) {
        console.log(`Found fields for data source ${dataSource.alias} using key: ${key}`);
        return fields;
      }
    }

    console.warn(`No fields found for data source ${dataSource.alias}, tried keys:`, keys);
    return [];
  }

  getFilteredFieldsForDataSource(dataSource: DataSource): FieldInfo[] {
    // Try multiple keys to find the fields
    const keys = [
      dataSource.id,
      dataSource.content_type_id,
      `${dataSource.id}_${dataSource.content_type_id}`
    ].filter(key => key !== undefined && key !== null);

    for (const key of keys) {
      const fields = this.filteredFields.get(key!);
      if (fields && fields.length > 0) {
        return fields;
      }
    }

    return [];
  }

  isFieldSelected(field: FieldInfo): boolean {
    return this.fields.some(f => f.field_path === field.path);
  }


  quickAddField(field: FieldInfo, dataSource: DataSource): void {
    // Always add to local array only, never save immediately
    const newField: Field = {
      report: this.report?.id || 0,
      data_source: dataSource.id || dataSource.content_type_id!,
      field_path: field.path,
      field_name: field.name,
      display_name: field.verbose_name,
      field_type: this.mapFieldTypeToValidChoice(field.type), // Map to valid choice
      field_type_name: field.type, // Store original type for reference
      order: this.fields.length,
      is_visible: true,
      aggregation: '', // Empty string
      width: null,
      formatting: {} // Empty object
    };

    // Add to local array
    this.fields = [...this.fields, newField];
    this.fieldsChange.emit(this.fields);

    this.snackBar.open('Field added', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
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
    // Just update the order locally
    this.fields = this.fields.map((field, index) => ({
      ...field,
      order: index
    }));
    this.fieldsChange.emit(this.fields);
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

    const updates: Partial<Field> = {
      ...this.fieldForm.value,
      formatting: this.formattingForm.value.type ? this.formattingForm.value : null
    };

    // Update locally only
    this.fields[this.editingFieldIndex] = {
      ...field,
      ...updates
    };

    this.fieldsChange.emit(this.fields);
    this.dialog.closeAll();

    this.snackBar.open('Field updated', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  toggleVisibility(field: Field, index: number): void {
    this.fields[index] = {
      ...field,
      is_visible: !field.is_visible
    };
    this.fieldsChange.emit(this.fields);
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
      this.fields = [];
      this.fieldsChange.emit(this.fields);

      this.snackBar.open('All fields removed', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar']
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
  private mapFieldTypeToValidChoice(fieldType: string): string {
    // Map Django field types that aren't in FIELD_TYPE_CHOICES to valid ones
    const fieldTypeMapping: Record<string, string> = {
      'BigAutoField': 'BigIntegerField',
      'AutoField': 'IntegerField',
      'PositiveIntegerField': 'IntegerField',
      'PositiveSmallIntegerField': 'SmallIntegerField',
      'NullBooleanField': 'BooleanField',
      'SlugField': 'CharField',
      'GenericIPAddressField': 'CharField',
      'FileField': 'CharField',
      'ImageField': 'CharField',
      'DurationField': 'CharField',
      'BinaryField': 'TextField'
    };

    // Return mapped type or original if not in mapping
    return fieldTypeMapping[fieldType] || fieldType;
  }
}
