// utils/field-type.utils.ts - FIXED TYPE SAFETY
import { ResourceField } from '../models/resource.model';

export class FieldTypeUtils {
  static isTextInput(field: ResourceField): boolean {
    if (!field?.type) return false;
    return ['CharField', 'TextField', 'EmailField', 'URLField', 'SlugField'].includes(field.type) &&
        !this.hasChoices(field) &&
        !this.isRelationField(field);
  }

  static isNumberInput(field: ResourceField): boolean {
    if (!field?.type) return false;
    return ['IntegerField', 'BigIntegerField', 'DecimalField', 'FloatField', 'PositiveIntegerField', 'SmallIntegerField'].includes(field.type);
  }

  static hasChoices(field: ResourceField): boolean {
    if (!field) return false;
    return Boolean(field.choices && Array.isArray(field.choices) && field.choices.length > 0);
  }

  // *** ENHANCED RELATIONSHIP DETECTION WITH PROPER TYPE SAFETY ***
  static isRelationField(field: ResourceField): boolean {
    if (!field?.name) return false;

    console.log(`🔍 DEBUG: Checking isRelationField for ${field.name}`);
    console.log(`🔍 DEBUG: - type: ${field.type}`);
    console.log(`🔍 DEBUG: - relation_type: ${field.relation_type}`);
    console.log(`🔍 DEBUG: - related_model: ${field.related_model}`);

    // Primary check: explicit relation types in field.type
    if (field.type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.type)) {
      console.log(`✅ ${field.name} is relation field: type = ${field.type}`);
      return true;
    }

    // Secondary check: explicit relation types in field.relation_type
    if (field.relation_type && ['ForeignKey', 'OneToOneField', 'ManyToManyField'].includes(field.relation_type)) {
      console.log(`✅ ${field.name} is relation field: relation_type = ${field.relation_type}`);
      return true;
    }

    // Tertiary check: has related_model property
    if (field.related_model && field.related_model.trim()) {
      console.log(`✅ ${field.name} is relation field: has related_model = ${field.related_model}`);
      return true;
    }

    // Quaternary check: naming pattern (field ends with _id)
    if (field.name.endsWith('_id')) {
      console.log(`✅ ${field.name} is relation field: ends with _id`);
      return true;
    }

    // Final check: has limit_choices_to (usually indicates lookup relation)
    if (field.limit_choices_to && field.limit_choices_to.trim()) {
      console.log(`✅ ${field.name} is relation field: has limit_choices_to`);
      return true;
    }

    console.log(`❌ ${field.name} is NOT a relation field`);
    return false;
  }

  // *** SPECIFIC RELATIONSHIP TYPE DETECTION WITH TYPE SAFETY ***
  static isForeignKeyField(field: ResourceField): boolean {
    if (!field) return false;

    const isForeignKey = field.type === 'ForeignKey' ||
        field.relation_type === 'ForeignKey' ||
        (field.related_model && field.related_model !== 'lookup.lookup' && field.name.endsWith('_id'));

    return Boolean(isForeignKey);
  }

  static isOneToOneField(field: ResourceField): boolean {
    if (!field) return false;

    const isOneToOne = field.type === 'OneToOneField' ||
        field.relation_type === 'OneToOneField';

    return Boolean(isOneToOne);
  }

  static isManyToManyField(field: ResourceField): boolean {
    if (!field) return false;

    const isManyToMany = field.type === 'ManyToManyField' ||
        field.relation_type === 'ManyToManyField' ||
        (field.related_model && field.name.endsWith('s') && !field.name.endsWith('_id'));

    return Boolean(isManyToMany);
  }

  // *** SIMPLIFIED LOOKUP DETECTION - KEEP AS SPECIAL CASE ***
  static isLookupField(field: ResourceField): boolean {
    if (!field) return false;

    const isLookup = (field.related_model === 'lookup.lookup') ||
        (field.limit_choices_to && field.limit_choices_to.includes('lookup'));

    return Boolean(isLookup);
  }

  // *** SINGLE VS MULTIPLE RELATIONSHIP DETECTION ***
  static isSingleRelationField(field: ResourceField): boolean {
    if (!this.isRelationField(field)) return false;

    // Single relation: ForeignKey, OneToOne, or Lookup
    return this.isForeignKeyField(field) ||
        this.isOneToOneField(field) ||
        this.isLookupField(field);
  }

  static isMultipleRelationField(field: ResourceField): boolean {
    if (!this.isRelationField(field)) return false;

    // Multiple relation: ManyToMany
    return this.isManyToManyField(field);
  }

  // *** RELATIONSHIP TYPE UTILITIES ***
  static getRelationshipType(field: ResourceField): 'ForeignKey' | 'OneToOneField' | 'ManyToManyField' | 'Lookup' | null {
    if (!field || !this.isRelationField(field)) return null;

    if (this.isLookupField(field)) return 'Lookup';
    if (this.isManyToManyField(field)) return 'ManyToManyField';
    if (this.isOneToOneField(field)) return 'OneToOneField';
    if (this.isForeignKeyField(field)) return 'ForeignKey';

    return null;
  }

  static parseRelatedModel(field: ResourceField): { app: string; model: string } | null {
    if (!field?.related_model) return null;

    const parts = field.related_model.split('.');
    if (parts.length !== 2) return null;

    return {
      app: parts[0],
      model: parts[1]
    };
  }

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

  // *** FILE FIELD DETECTION ***
  static isFileField(field: ResourceField): boolean {
    if (!field?.type) return false;
    return ['FileField', 'ImageField', 'DocumentField', 'MediaField'].includes(field.type);
  }

  // *** BOOLEAN FIELD DETECTION ***
  static isBooleanField(field: ResourceField): boolean {
    if (!field?.type) return false;
    return ['BooleanField', 'NullBooleanField'].includes(field.type);
  }

  // *** DATE/TIME FIELD DETECTION ***
  static isDateField(field: ResourceField): boolean {
    if (!field?.type) return false;
    return field.type === 'DateField';
  }

  static isDateTimeField(field: ResourceField): boolean {
    if (!field?.type) return false;
    return field.type === 'DateTimeField';
  }

  static isTimeField(field: ResourceField): boolean {
    if (!field?.type) return false;
    return field.type === 'TimeField';
  }

  // *** INPUT TYPE UTILITIES ***
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

  // *** FIELD VALIDATION ***
  static isUnhandledField(field: ResourceField): boolean {
    if (!field?.name || !field?.type) {
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

  // *** DISPLAY UTILITIES ***
  static formatColumnName(name: string): string {
    if (!name) return '';
    return name
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
  }

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

  // *** FORM FIELD UTILITIES ***
  static shouldShowAsDropdown(field: ResourceField): boolean {
    return this.hasChoices(field) || this.isRelationField(field);
  }

  static needsAsyncOptions(field: ResourceField): boolean {
    return this.isRelationField(field) && !this.hasChoices(field);
  }

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

  // *** DEBUGGING UTILITIES ***
  static debugField(field: ResourceField): void {
    console.log(`🔍 DEBUG: Field Analysis for "${field.name}"`);
    console.log(`  - Type: ${field.type}`);
    console.log(`  - Relation Type: ${field.relation_type}`);
    console.log(`  - Related Model: ${field.related_model}`);
    console.log(`  - Limit Choices To: ${field.limit_choices_to}`);
    console.log(`  - Has Choices: ${this.hasChoices(field)}`);
    console.log(`  - Is Relation Field: ${this.isRelationField(field)}`);
    console.log(`  - Relation Type: ${this.getRelationshipType(field)}`);
    console.log(`  - Is Single Relation: ${this.isSingleRelationField(field)}`);
    console.log(`  - Is Multiple Relation: ${this.isMultipleRelationField(field)}`);
  }
}
