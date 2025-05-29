// utils/field-type.utils.ts - CORRECTED VERSION
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

  // ENHANCED relationship detection
  static isRelationField(field: ResourceField): boolean {
    if (!field || !field.name) return false;

    // Check if field has related_model property (most reliable indicator)
    if (field.related_model) {
      return true;
    }

    // Check explicit relation types in field.type
    if (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) {
      return true;
    }

    // Check if field has relation_type property
    if (field.relation_type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.relation_type)) {
      return true;
    }

    // Check common naming patterns for foreign keys
    if (field.name.endsWith('_id')) {
      return true;
    }

    return false;
  }

  // CORRECTED: Specific relationship type detection with proper null checks
  static isForeignKeyField(field: ResourceField): boolean {
    if (!field) return false;

    return field.type === 'ForeignKey' ||
        field.relation_type === 'ForeignKey' ||
        (!!field.related_model && field.name.endsWith('_id'));
  }

  static isOneToOneField(field: ResourceField): boolean {
    if (!field) return false;

    return field.type === 'OneToOneField' ||
        field.relation_type === 'OneToOneField';
  }

  static isManyToManyField(field: ResourceField): boolean {
    if (!field) return false;

    return field.type === 'ManyToManyField' ||
        field.relation_type === 'ManyToManyField';
  }

  // CORRECTED: Check if field is a lookup relation with proper null checks
  static isLookupField(field: ResourceField): boolean {
    if (!field) return false;

    return field.related_model === 'lookup.lookup' ||
        (!!field.limit_choices_to && field.limit_choices_to.includes('lookup'));
  }

  // NEW: Get relationship type for a field
  static getRelationshipType(field: ResourceField): 'ForeignKey' | 'OneToOneField' | 'ManyToManyField' | 'Lookup' | null {
    if (!field || !this.isRelationField(field)) return null;

    if (this.isLookupField(field)) return 'Lookup';
    if (this.isManyToManyField(field)) return 'ManyToManyField';
    if (this.isOneToOneField(field)) return 'OneToOneField';
    if (this.isForeignKeyField(field)) return 'ForeignKey';

    return null;
  }

  // NEW: Parse related model info
  static parseRelatedModel(field: ResourceField): { app: string; model: string } | null {
    if (!field.related_model) return null;

    const parts = field.related_model.split('.');
    if (parts.length !== 2) return null;

    return {
      app: parts[0],
      model: parts[1]
    };
  }

  // NEW: Get expected endpoint patterns for a related model
  static getExpectedEndpointPatterns(appName: string, modelName: string): string[] {
    return [
      `${appName}/${modelName}/`,
      `${appName}/${modelName}s/`,
      `api/${appName}/${modelName}/`,
      `api/${appName}/${modelName}s/`,
      `${modelName}/`,
      `${modelName}s/`,
    ];
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

  // NEW: Helper method to get field validation rules with relationship info
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

    // Add relationship-specific rules
    if (this.isRelationField(field)) {
      const relType = this.getRelationshipType(field);
      switch (relType) {
        case 'ForeignKey':
          rules.push('Select a related record');
          break;
        case 'OneToOneField':
          rules.push('Select one related record');
          break;
        case 'ManyToManyField':
          rules.push('Select one or more related records');
          break;
        case 'Lookup':
          rules.push('Select from lookup values');
          break;
      }
    }

    return rules;
  }

  // NEW: Helper method to get field placeholder text with relationship context
  static getFieldPlaceholder(field: ResourceField): string {
    const fieldName = this.formatColumnName(field.name);

    // Handle relationship fields
    if (this.isRelationField(field)) {
      const relType = this.getRelationshipType(field);
      switch (relType) {
        case 'ForeignKey':
          return `Select a ${fieldName.toLowerCase().replace(' id', '')}`;
        case 'OneToOneField':
          return `Select ${fieldName.toLowerCase()}`;
        case 'ManyToManyField':
          return `Select multiple ${fieldName.toLowerCase()}`;
        case 'Lookup':
          return `Select from ${fieldName.toLowerCase()} options`;
        default:
          return `Select ${fieldName.toLowerCase()}`;
      }
    }

    // Handle regular fields
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

  // NEW: Helper to determine if field should show as dropdown
  static shouldShowAsDropdown(field: ResourceField): boolean {
    return this.hasChoices(field) || this.isRelationField(field);
  }

  // NEW: Helper to determine if field needs special loading
  static needsAsyncOptions(field: ResourceField): boolean {
    return this.isRelationField(field) && !this.hasChoices(field);
  }

  // NEW: Get display name for relation type
  static getRelationTypeDisplayName(field: ResourceField): string {
    const relType = this.getRelationshipType(field);
    switch (relType) {
      case 'ForeignKey':
        return 'Foreign Key';
      case 'OneToOneField':
        return 'One-to-One';
      case 'ManyToManyField':
        return 'Many-to-Many';
      case 'Lookup':
        return 'Lookup';
      default:
        return 'Unknown';
    }
  }
}
