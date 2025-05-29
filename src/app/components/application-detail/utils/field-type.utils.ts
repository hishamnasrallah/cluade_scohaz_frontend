// utils/field-type.utils.ts - ENHANCED
import { ResourceField } from '../models/resource.model';

export class FieldTypeUtils {
  static isTextInput(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['CharField', 'TextField', 'EmailField', 'URLField', 'SlugField'].includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  static isNumberInput(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField', 'PositiveIntegerField', 'SmallIntegerField'].includes(field.type);
  }

  static hasChoices(field: ResourceField): boolean {
    if (!field) return false;
    return Boolean(field.choices && Array.isArray(field.choices) && field.choices.length > 0);
  }

  static isRelationField(field: ResourceField): boolean {
    if (!field || !field.name) return false;

    // Check if field has related_model property
    if (field.related_model) {
      return true;
    }

    // Check explicit relation types
    if (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) {
      return true;
    }

    // Check if field has relation_type property
    if (field.relation_type) {
      return true;
    }

    // Check common naming patterns for foreign keys
    if (field.name.endsWith('_id')) {
      return true;
    }

    return false;
  }

  // ENHANCED file field detection
  static isFileField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['FileField', 'ImageField', 'DocumentField', 'MediaField'].includes(field.type);
  }

  static isBooleanField(field: ResourceField): boolean {
    if (!field || !field.type) return false;
    return ['BooleanField', 'NullBooleanField'].includes(field.type);
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
      case 'PasswordField':
        return 'password';
      case 'CharField':
      case 'TextField':
      case 'SlugField':
      default:
        return 'text';
    }
  }

  static getNumberStep(fieldType: string): string {
    switch (fieldType) {
      case 'DecimalField':
      case 'FloatField':
        return '0.01';
      case 'IntegerField':
      case 'BigIntegerField':
      case 'PositiveIntegerField':
      case 'SmallIntegerField':
      default:
        return '1';
    }
  }

  // ENHANCED file accept types
  static getFileAcceptTypes(fieldType: string): string {
    switch (fieldType) {
      case 'ImageField':
        return 'image/*';
      case 'DocumentField':
        return '.pdf,.doc,.docx,.txt,.rtf';
      case 'MediaField':
        return 'image/*,video/*,audio/*';
      case 'FileField':
      default:
        return '*/*';
    }
  }

  static isUnhandledField(field: ResourceField): boolean {
    if (!field || !field.name || !field.type) {
      return false;
    }

    const handledTypes = [
      // Text fields
      'CharField', 'TextField', 'EmailField', 'URLField', 'SlugField',
      // Number fields
      'IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField', 'PositiveIntegerField', 'SmallIntegerField',
      // Date/Time fields
      'DateField', 'DateTimeField', 'TimeField',
      // Boolean fields
      'BooleanField', 'NullBooleanField',
      // File fields
      'FileField', 'ImageField', 'DocumentField', 'MediaField',
      // Relation fields
      'ForeignKey', 'OneToOneField', 'ManyToManyField'
    ];

    return !handledTypes.includes(field.type) &&
      !this.hasChoices(field) &&
      !this.isRelationField(field);
  }

  static formatColumnName(name: string): string {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  // Helper method to get field validation rules
  static getFieldValidationRules(field: ResourceField): string[] {
    const rules: string[] = [];

    if (field.required) {
      rules.push('Required');
    }

    if (field.type === 'EmailField') {
      rules.push('Valid email format');
    }

    if (field.type === 'URLField') {
      rules.push('Valid URL format');
    }

    if (this.isNumberInput(field)) {
      rules.push('Numeric value only');
    }

    if (this.isFileField(field)) {
      rules.push('File upload');
    }

    return rules;
  }

  // Helper method to get field placeholder text
  static getFieldPlaceholder(field: ResourceField): string {
    const fieldName = this.formatColumnName(field.name);

    switch (field.type) {
      case 'EmailField':
        return `Enter a valid email address`;
      case 'URLField':
        return `Enter a valid URL (https://...)`;
      case 'DateField':
        return `Select a date`;
      case 'DateTimeField':
        return `Select date and time`;
      case 'TimeField':
        return `Select time`;
      case 'FileField':
      case 'ImageField':
        return `Choose a file`;
      case 'BooleanField':
        return `Check if applicable`;
      case 'DecimalField':
      case 'FloatField':
        return `Enter decimal number`;
      case 'IntegerField':
      case 'BigIntegerField':
      case 'PositiveIntegerField':
      case 'SmallIntegerField':
        return `Enter whole number`;
      case 'TextField':
        return `Enter detailed ${fieldName.toLowerCase()}`;
      case 'CharField':
      default:
        return `Enter ${fieldName.toLowerCase()}`;
    }
  }
}
