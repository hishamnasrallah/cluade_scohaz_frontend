// services/data-formatter.service.ts - ENHANCED with File Support
import { Injectable } from '@angular/core';
import { ResourceField } from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class DataFormatterService {

  formatDateForInput(date: any): string {
    if (!date) return '';

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      // Format as YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  formatDateTimeForInput(datetime: any): string {
    if (!datetime) return '';

    try {
      const d = new Date(datetime);
      if (isNaN(d.getTime())) return '';

      // Format as YYYY-MM-DDTHH:mm (for datetime-local input)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  }

  formatTimeForInput(time: any): string {
    if (!time) return '';

    try {
      if (typeof time === 'string' && time.includes(':')) {
        // If it's already in HH:mm format, return as is
        return time.substring(0, 5); // Take only HH:mm part
      }

      const d = new Date(time);
      if (isNaN(d.getTime())) return '';

      // Format as HH:mm
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    // Format dates for display
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          if (value.includes('T') || value.includes(' ')) {
            // DateTime
            return date.toLocaleString();
          } else {
            // Date only
            return date.toLocaleDateString();
          }
        }
      } catch (error) {
        // If date parsing fails, return original value
      }
    }

    return String(value);
  }

  getDefaultValue(field: ResourceField, record?: any): any {
    // If editing and record has value
    if (record && record[field.name] !== undefined && record[field.name] !== null) {
      let value = record[field.name];

      // Handle different field types for editing
      switch (field.type) {
        case 'DateField':
          return this.formatDateForInput(value);
        case 'DateTimeField':
          return this.formatDateTimeForInput(value);
        case 'TimeField':
          return this.formatTimeForInput(value);
        case 'BooleanField':
        case 'NullBooleanField':
          return !!value;
        case 'DecimalField':
        case 'FloatField':
          return value ? parseFloat(value) : null;
        case 'IntegerField':
        case 'BigIntegerField':
        case 'PositiveIntegerField':
        case 'SmallIntegerField':
          return value ? parseInt(value) : null;
        case 'FileField':
        case 'ImageField':
        case 'DocumentField':
        case 'MediaField':
          // For file fields, don't set a default value in edit mode
          // The user will need to choose a new file if they want to change it
          return null;
        default:
          return value;
      }
    }

    // Default values for new records
    switch (field.type) {
      case 'BooleanField':
      case 'NullBooleanField':
        return field.default !== null ? field.default : false;
      case 'IntegerField':
      case 'BigIntegerField':
      case 'PositiveIntegerField':
      case 'SmallIntegerField':
        return field.default !== null ? field.default : null;
      case 'DecimalField':
      case 'FloatField':
        return field.default !== null ? field.default : null;
      case 'DateField':
      case 'DateTimeField':
      case 'TimeField':
        return field.default !== null ? field.default : null;
      case 'FileField':
      case 'ImageField':
      case 'DocumentField':
      case 'MediaField':
        return null; // Files always start as null
      default:
        return field.default !== null ? field.default : null;
    }
  }

  // ENHANCED to handle file uploads
  prepareFormData(formValue: any, fields: ResourceField[]): FormData | any {
    // FIX: Create a copy to avoid modifying the original
    const formValueCopy = { ...formValue };

    // Check if we have any file fields with actual file data
    const hasFileFieldsWithData = fields.some(field =>
      field && this.isFileField(field.type) && formValueCopy[field.name] instanceof File
    );

    if (hasFileFieldsWithData) {
      // Use FormData for file uploads
      return this.prepareMultipartFormData(formValueCopy, fields);
    } else {
      // Use regular JSON for non-file forms
      return this.prepareJsonData(formValueCopy, fields);
    }
  }

  private prepareMultipartFormData(formValue: any, fields: ResourceField[]): FormData {
    const formData = new FormData();

    fields.forEach((field: ResourceField) => {
      if (!field || !field.name || field.read_only) return;

      const value = formValue[field.name];

      // FIX: Skip fields that don't exist in formValue (they were removed intentionally)
      if (!(field.name in formValue)) {
        return;
      }

      if (value === null || value === undefined) {
        // Don't append null/undefined values to FormData
        return;
      }

      if (this.isFileField(field.type)) {
        if (value instanceof File) {
          formData.append(field.name, value, value.name);
        }
        // Skip if not a File instance (could be null or undefined)
        return;
      }

      // Handle other field types
      const processedValue = this.processFieldValue(value, field);
      if (processedValue !== null && processedValue !== undefined) {
        formData.append(field.name, processedValue.toString());
      }
    });

    return formData;
  }

  private prepareJsonData(formValue: any, fields: ResourceField[]): any {
    const preparedData: any = {};

    fields.forEach((field: ResourceField) => {
      if (!field || !field.name || field.read_only) return;

      // FIX: Skip fields that don't exist in formValue (they were removed intentionally)
      if (!(field.name in formValue)) {
        return;
      }

      const value = formValue[field.name];

      if (value === null || value === undefined || value === '') {
        preparedData[field.name] = null;
        return;
      }

      preparedData[field.name] = this.processFieldValue(value, field);
    });

    return preparedData;
  }

  private processFieldValue(value: any, field: ResourceField): any {
    switch (field.type) {
      case 'DateField':
        // Ensure date is in YYYY-MM-DD format
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return value;
        } else if (value instanceof Date) {
          return this.formatDateForInput(value);
        } else {
          return null;
        }

      case 'DateTimeField':
        // Convert datetime-local format to proper datetime string
        if (typeof value === 'string' && value.includes('T')) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toISOString().slice(0, 19).replace('T', ' ');
          } else {
            return null;
          }
        } else {
          return null;
        }

      case 'TimeField':
        // Ensure time is in HH:mm:ss format
        if (typeof value === 'string' && value.match(/^\d{2}:\d{2}$/)) {
          return value + ':00'; // Add seconds
        } else {
          return value;
        }

      case 'IntegerField':
      case 'BigIntegerField':
      case 'PositiveIntegerField':
      case 'SmallIntegerField':
        return value ? parseInt(value) : null;

      case 'DecimalField':
      case 'FloatField':
        return value ? parseFloat(value) : null;

      case 'BooleanField':
      case 'NullBooleanField':
        return !!value;

      case 'FileField':
      case 'ImageField':
      case 'DocumentField':
      case 'MediaField':
        // File fields should be handled separately in multipart form data
        return value instanceof File ? value : null;

      case 'ManyToManyField':
        // FIX: Ensure many-to-many values are numbers
        if (Array.isArray(value)) {
          return value.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        }
        return value;

      default:
        return value;
    }
  }

  private isFileField(fieldType: string): boolean {
    return ['FileField', 'ImageField', 'DocumentField', 'MediaField'].includes(fieldType);
  }

  // Helper method to check if a field should be displayed as URL in table view
  isFileFieldDisplayUrl(field: ResourceField, value: any): boolean {
    return this.isFileField(field.type) && typeof value === 'string' && value.startsWith('http');
  }

  // Helper method to extract filename from URL
  getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.substring(pathname.lastIndexOf('/') + 1) || 'File';
    } catch {
      return 'File';
    }
  }
}
