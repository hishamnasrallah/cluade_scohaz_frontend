// src/app/builder/models/validation-rules.model.ts

export interface ValidationRule {
  type: 'required' | 'email' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'custom';
  value?: any;
  message?: string;
  enabled: boolean;
}

export interface FieldValidation {
  fieldId: string;
  rules: ValidationRule[];
}

export interface ConditionalLogic {
  id: string;
  fieldId: string;
  conditions: Condition[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue';
  targetValue?: any;
}

export interface Condition {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value?: any;
  combineWith?: 'AND' | 'OR';
}
