// utils/field-type.utils.ts - FIXED
import { ResourceField } from '../models/resource.model';

export class FieldTypeUtils {
  static isTextInput(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['CharField', 'TextField', 'EmailField', 'URLField'].includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  static isNumberInput(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField'].includes(field.type);
  }

  static hasChoices(field: ResourceField): boolean {
    if (!field) return false;
    return Boolean(field.choices && Array.isArray(field.choices) && field.choices.length > 0);
  }

  static isRelationField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type);
  }

  static isFileField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return field.type === 'FileField';
  }

  static isBooleanField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return field.type === 'BooleanField';
  }

  static isDateField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return field.type === 'DateField';
  }

  static isDateTimeField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return field.type === 'DateTimeField';
  }

  static isTimeField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return field.type === 'TimeField';
  }

  static getInputType(fieldType: string): string {
    switch (fieldType) {
      case 'EmailField':
        return 'email';
      case 'URLField':
        return 'url';
      default:
        return 'text';
    }
  }

  static getNumberStep(fieldType: string): string {
    switch (fieldType) {
      case 'DecimalField':
      case 'FloatField':
        return '0.01';
      default:
        return '1';
    }
  }

  static isUnhandledField(field: ResourceField): boolean {
    if (!field || !field.name || !field.type) {
      return false;
    }

    const handledTypes = [
      'CharField', 'TextField', 'EmailField', 'URLField',
      'IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField',
      'DateField', 'DateTimeField', 'TimeField',
      'BooleanField', 'FileField'
    ];

    return !handledTypes.includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  static formatColumnName(name: string): string {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
