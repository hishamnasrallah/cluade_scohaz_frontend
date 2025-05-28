// services/form-builder.service.ts
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Resource, ResourceField, RelationOption } from '../models/resource.model';
import { DataFormatterService } from './data-formatter.service';
import { FieldTypeUtils } from '../utils/field-type.utils';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {

  constructor(
    private fb: FormBuilder,
    private dataFormatter: DataFormatterService
  ) {}

  buildDynamicForm(resource: Resource, record?: any): FormGroup {
    const formControls: any = {};
    const formFields = this.getFormFields(resource);

    console.log('Building form for resource:', resource.name);
    console.log('Form fields:', formFields);

    formFields.forEach(field => {
      // Skip invalid fields
      if (!field || !field.name || !field.type) {
        console.log('Skipping invalid field:', field);
        return;
      }

      console.log(`Processing field: ${field.name} (${field.type})`);

      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      let defaultValue = this.dataFormatter.getDefaultValue(field, record);

      console.log(`Default value for ${field.name}:`, defaultValue);

      formControls[field.name] = [defaultValue, validators];
    });

    console.log('Form controls:', formControls);
    const form = this.fb.group(formControls);
    console.log('Dynamic form created:', form);

    return form;
  }

  getFormFields(resource: Resource): ResourceField[] {
    if (!resource.fields) {
      console.log('No fields found for resource:', resource.name);
      return [];
    }

    console.log('All fields for resource', resource.name, ':', resource.fields);

    // Filter out read-only fields and ensure field exists and has a name
    const formFields = resource.fields.filter((field: ResourceField) => {
      if (!field) {
        console.log('Skipping null/undefined field');
        return false;
      }
      if (!field.name) {
        console.log('Skipping field without name:', field);
        return false;
      }
      if (!field.type) {
        console.log('Skipping field without type:', field.name);
        return false;
      }
      if (field.read_only) {
        console.log('Skipping read-only field:', field.name);
        return false;
      }
      console.log('Including field in form:', field.name, '(', field.type, ')');
      return true;
    });

    console.log('Final form fields for', resource.name, ':', formFields);
    return formFields;
  }

  getDisplayFields(resource: Resource): ResourceField[] {
    if (!resource.fields) {
      return [];
    }

    // Return all fields that exist and have a name
    return resource.fields.filter((field: ResourceField) =>
      field &&
      field.name
    );
  }

  getTableColumns(resource: Resource, resourceData?: any[]): string[] {
    if (!resource.fields || resource.fields.length === 0) {
      const data = resourceData;
      if (data && data.length > 0) {
        return Object.keys(data[0]).filter(key => !key.startsWith('_') && key !== 'id');
      }
      return [];
    }

    // Return all field names that exist and are not null/undefined
    return resource.fields
      .filter((field: ResourceField) => field && field.name)
      .map((field: ResourceField) => field.name);
  }

  getDisplayColumns(resource: Resource, resourceData?: any[]): string[] {
    return [...this.getTableColumns(resource, resourceData), 'actions'];
  }

  getFieldErrors(form: FormGroup, fieldName: string): string[] {
    const control = form.get(fieldName);
    if (!control || !control.errors) {
      return [];
    }

    const errors: string[] = [];

    // Check for server errors
    if (control.errors['serverError']) {
      if (Array.isArray(control.errors['serverError'])) {
        errors.push(...control.errors['serverError']);
      } else {
        errors.push(control.errors['serverError']);
      }
    }

    return errors;
  }
}
