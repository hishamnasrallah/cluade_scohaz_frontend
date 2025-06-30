// src/app/reports/components/parameter-builder/parameter-builder.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { Report, Parameter, ParameterType, ParameterChoice } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';


interface ValidationRules {
  min_length?: number | null;
  max_length?: number | null;
  regex?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  step?: number | null;
  allow_decimals?: boolean | null;
  min_date?: string | null;
  max_date?: string | null;
  allow_past?: boolean | null;
  allow_future?: boolean | null;
  min_selections?: number | null;
  max_selections?: number | null;
}

@Component({
  selector: 'app-parameter-builder',
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
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule
  ],
  templateUrl: 'parameter-builder.component.html',
  styleUrl: 'parameter-builder.component.scss'
})
export class ParameterBuilderComponent implements OnInit {
  @Input() report: Report | null = null;
  @Input() parameters: Parameter[] = [];
  @Output() parametersChange = new EventEmitter<Parameter[]>();

  // Forms
  parameterForms: FormGroup[] = [];

  // Parameter types
  parameterTypes = [
    { value: 'text', label: 'Text', icon: 'text_fields' },
    { value: 'number', label: 'Number', icon: 'numbers' },
    { value: 'date', label: 'Date', icon: 'calendar_today' },
    { value: 'datetime', label: 'Date & Time', icon: 'schedule' },
    { value: 'date_range', label: 'Date Range', icon: 'date_range' },
    { value: 'select', label: 'Select (Single)', icon: 'radio_button_checked' },
    { value: 'multiselect', label: 'Select (Multiple)', icon: 'check_box' },
    { value: 'boolean', label: 'Yes/No', icon: 'toggle_on' },
    { value: 'user', label: 'User', icon: 'person' }
  ];

  // Temporary storage for static choices
  staticChoices: Map<number, ParameterChoice[]> = new Map();

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms(): void {
    this.parameterForms = [];
    this.parameters.forEach((param, index) => {
      const form = this.createParameterForm(param);
      this.parameterForms.push(form);

      // Initialize static choices
      if (param.choices_static) {
        this.staticChoices.set(index, [...param.choices_static]);
      }
    });
  }

  createParameterForm(parameter?: Parameter): FormGroup {
    const form = this.fb.group({
      name: [parameter?.name || '', Validators.required],
      display_name: [parameter?.display_name || '', Validators.required],
      parameter_type: [parameter?.parameter_type || 'text', Validators.required],
      is_required: [parameter?.is_required || false],
      default_value: [parameter?.default_value || null],
      help_text: [parameter?.help_text || ''],
      placeholder: [parameter?.placeholder || ''],
      order: [parameter?.order || 0],

      // For select/multiselect
      choices_type: ['static'],
      query_content_type: [null],
      query_value_field: ['id'],
      query_label_field: ['name'],

      // For date range
      default_start: [''],
      default_end: [''],

      // Validation rules
      // Validation rules
      validation_rules: this.fb.group({
        min_length: [null as number | null],
        max_length: [null as number | null],
        regex: [''],
        min_value: [null as number | null],
        max_value: [null as number | null],
        step: [1 as number | null],
        allow_decimals: [true as boolean | null],
        min_date: [null as string | null],
        max_date: [null as string | null],
        allow_past: [true as boolean | null],
        allow_future: [true as boolean | null],
        min_selections: [null as number | null],
        max_selections: [null as number | null]
      })
    });

    // Set validation rules if they exist
// Set validation rules if they exist
    if (parameter?.validation_rules) {
      const validationRules = parameter.validation_rules as ValidationRules;
      form.get('validation_rules')?.patchValue({
        min_length: validationRules.min_length ?? null,
        max_length: validationRules.max_length ?? null,
        regex: validationRules.regex ?? '',
        min_value: validationRules.min_value ?? null,
        max_value: validationRules.max_value ?? null,
        step: validationRules.step ?? 1,
        allow_decimals: validationRules.allow_decimals ?? true,
        min_date: validationRules.min_date ?? null,
        max_date: validationRules.max_date ?? null,
        allow_past: validationRules.allow_past ?? true,
        allow_future: validationRules.allow_future ?? true,
        min_selections: validationRules.min_selections ?? null,
        max_selections: validationRules.max_selections ?? null
      });
    }
    return form;
  }

  addParameter(): void {
    if (!this.report?.id) return;

    const newParameter: Partial<Parameter> = {
      report: this.report.id,
      name: `param_${this.parameters.length + 1}`,
      display_name: `Parameter ${this.parameters.length + 1}`,
      parameter_type: 'text',
      is_required: false,
      order: this.parameters.length
    };

    this.reportService.createParameter(newParameter).subscribe({
      next: (parameter) => {
        this.parameters.push(parameter);
        const form = this.createParameterForm(parameter);
        this.parameterForms.push(form);
        this.parametersChange.emit(this.parameters);

        this.snackBar.open('Parameter added', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error adding parameter:', err);
        this.snackBar.open('Error adding parameter', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeParameter(index: number): void {
    const parameter = this.parameters[index];

    if (confirm(`Remove parameter "${parameter.display_name}"?`)) {
      if (parameter.id) {
        this.reportService.deleteParameter(parameter.id).subscribe({
          next: () => {
            this.parameters.splice(index, 1);
            this.parameterForms.splice(index, 1);
            this.staticChoices.delete(index);
            this.updateParameterOrders();
            this.parametersChange.emit(this.parameters);

            this.snackBar.open('Parameter removed', 'Close', {
              duration: 2000,
              panelClass: ['info-snackbar']
            });
          },
          error: (err) => {
            console.error('Error removing parameter:', err);
            this.snackBar.open('Error removing parameter', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  updateParameter(index: number): void {
    const parameter = this.parameters[index];
    if (!parameter.id) return;

    const form = this.parameterForms[index];
    const formValue = form.value;

    const updates: Partial<Parameter> = {
      name: formValue.name,
      display_name: formValue.display_name,
      parameter_type: formValue.parameter_type,
      is_required: formValue.is_required,
      default_value: formValue.default_value,
      help_text: formValue.help_text,
      placeholder: formValue.placeholder,
      validation_rules: formValue.validation_rules
    };

    // Handle choices
    if (formValue.parameter_type === 'select' || formValue.parameter_type === 'multiselect') {
      if (formValue.choices_type === 'static') {
        updates.choices_static = this.staticChoices.get(index) || [];
      } else {
        updates.choices_query = {
          content_type_id: formValue.query_content_type,
          value_field: formValue.query_value_field,
          label_field: formValue.query_label_field
        };
      }
    }

    // Handle date range defaults
    if (formValue.parameter_type === 'date_range') {
      updates.default_value = {
        start: formValue.default_start,
        end: formValue.default_end
      };
    }

    this.reportService.updateParameter(parameter.id, updates).subscribe({
      next: (updated) => {
        this.parameters[index] = updated;
        this.parametersChange.emit(this.parameters);
      },
      error: (err) => {
        console.error('Error updating parameter:', err);
        this.snackBar.open('Error updating parameter', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onParameterTypeChange(index: number): void {
    const form = this.parameterForms[index];
    const type = form.get('parameter_type')?.value;

    // Reset default value based on type
    switch (type) {
      case 'boolean':
        form.patchValue({ default_value: false });
        break;
      case 'number':
        form.patchValue({ default_value: null });
        break;
      case 'date_range':
        form.patchValue({
          default_value: null,
          default_start: '',
          default_end: ''
        });
        break;
      default:
        form.patchValue({ default_value: '' });
    }

    this.updateParameter(index);
  }

  onChoicesTypeChange(index: number): void {
    const form = this.parameterForms[index];

    if (form.get('choices_type')?.value === 'static' && !this.staticChoices.has(index)) {
      this.staticChoices.set(index, [{ value: '', label: '' }]);
    }

    this.updateParameter(index);
  }

  getStaticChoices(index: number): ParameterChoice[] {
    if (!this.staticChoices.has(index)) {
      this.staticChoices.set(index, []);
    }
    return this.staticChoices.get(index)!;
  }

  addChoice(index: number): void {
    const choices = this.getStaticChoices(index);
    choices.push({ value: '', label: '' });
    this.staticChoices.set(index, choices);
  }

  removeChoice(index: number, choiceIndex: number): void {
    const choices = this.getStaticChoices(index);
    choices.splice(choiceIndex, 1);
    this.staticChoices.set(index, choices);
    this.updateStaticChoices(index);
  }

  updateStaticChoices(index: number): void {
    this.updateParameter(index);
  }

  onDrop(event: CdkDragDrop<Parameter[]>): void {
    moveItemInArray(this.parameters, event.previousIndex, event.currentIndex);
    moveItemInArray(this.parameterForms, event.previousIndex, event.currentIndex);

    // Update static choices map
    const newChoicesMap = new Map<number, ParameterChoice[]>();
    this.staticChoices.forEach((choices, oldIndex) => {
      let newIndex = oldIndex;
      if (oldIndex === event.previousIndex) {
        newIndex = event.currentIndex;
      } else if (event.previousIndex < event.currentIndex) {
        if (oldIndex > event.previousIndex && oldIndex <= event.currentIndex) {
          newIndex = oldIndex - 1;
        }
      } else {
        if (oldIndex >= event.currentIndex && oldIndex < event.previousIndex) {
          newIndex = oldIndex + 1;
        }
      }
      newChoicesMap.set(newIndex, choices);
    });
    this.staticChoices = newChoicesMap;

    this.updateParameterOrders();
  }

  updateParameterOrders(): void {
    const updates = this.parameters.map((param, index) => {
      if (param.id && param.order !== index) {
        return this.reportService.updateParameter(param.id, { order: index });
      }
      return null;
    }).filter(obs => obs !== null);

    if (updates.length > 0) {
      Promise.all(updates.map(obs => obs!.toPromise())).then(() => {
        this.parameters = this.parameters.map((param, index) => ({
          ...param,
          order: index
        }));
        this.parametersChange.emit(this.parameters);
      });
    }
  }

  getParameterForm(index: number): FormGroup {
    return this.parameterForms[index];
  }

  getParameterIcon(type: ParameterType): string {
    const paramType = this.parameterTypes.find(t => t.value === type);
    return paramType?.icon || 'tune';
  }

  getParameterTypeLabel(type: ParameterType): string {
    const paramType = this.parameterTypes.find(t => t.value === type);
    return paramType?.label || type;
  }

  getContentTypes(): any[] {
    // This would be populated from the report service
    return [];
  }
}
