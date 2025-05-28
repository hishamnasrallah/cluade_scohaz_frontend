// services/data-formatter.service.ts
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
          return !!value;
        case 'DecimalField':
        case 'FloatField':
          return value ? parseFloat(value) : null;
        case 'IntegerField':
        case 'BigIntegerField':
          return value ? parseInt(value) : null;
        default:
          return value;
      }
    }

    // Default values for new records
    switch (field.type) {
      case 'BooleanField':
        return field.default !== null ? field.default : false;
      case 'IntegerField':
      case 'BigIntegerField':
        return field.default !== null ? field.default : null;
      case 'DecimalField':
      case 'FloatField':
        return field.default !== null ? field.default : null;
      case 'DateField':
      case 'DateTimeField':
      case 'TimeField':
        return field.default !== null ? field.default : null;
      default:
        return field.default !== null ? field.default : null;
    }
  }

  prepareFormData(formValue: any, fields: ResourceField[]): any {
    const preparedData: any = {};

    fields.forEach((field: ResourceField) => {
      if (!field || !field.name || field.read_only) return;

      const value = formValue[field.name];

      if (value === null || value === undefined || value === '') {
        preparedData[field.name] = null;
        return;
      }

      switch (field.type) {
        case 'DateField':
          // Ensure date is in YYYY-MM-DD format
          if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            preparedData[field.name] = value;
          } else if (value instanceof Date) {
            preparedData[field.name] = this.formatDateForInput(value);
          } else {
            preparedData[field.name] = null;
          }
          break;

        case 'DateTimeField':
          // Convert datetime-local format to proper datetime string
          if (typeof value === 'string' && value.includes('T')) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              preparedData[field.name] = date.toISOString().slice(0, 19).replace('T', ' ');
            } else {
              preparedData[field.name] = null;
            }
          } else {
            preparedData[field.name] = null;
          }
          break;

        case 'TimeField':
          // Ensure time is in HH:mm:ss format
          if (typeof value === 'string' && value.match(/^\d{2}:\d{2}$/)) {
            preparedData[field.name] = value + ':00'; // Add seconds
          } else {
            preparedData[field.name] = value;
          }
          break;

        case 'IntegerField':
        case 'BigIntegerField':
          preparedData[field.name] = value ? parseInt(value) : null;
          break;

        case 'DecimalField':
        case 'FloatField':
          preparedData[field.name] = value ? parseFloat(value) : null;
          break;

        case 'BooleanField':
          preparedData[field.name] = !!value;
          break;

        default:
          preparedData[field.name] = value;
          break;
      }
    });

    return preparedData;
  }
}
