
// src/app/builder/services/validation-rules.service.ts

import { Injectable } from '@angular/core';
import { ValidationRule, FieldValidation, ConditionalLogic } from '../models/validation-rules.model';
import { ComponentConfig } from '../models/component-config.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationRulesService {
  private validationRules: Map<string, FieldValidation> = new Map();
  private conditionalLogic: Map<string, ConditionalLogic[]> = new Map();

  // Validation rule templates
  private ruleTemplates = {
    email: {
      type: 'email' as const,
      message: 'Please enter a valid email address',
      enabled: true
    },
    required: {
      type: 'required' as const,
      message: 'This field is required',
      enabled: true
    },
    phoneNumber: {
      type: 'pattern' as const,
      value: '^[+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
      message: 'Please enter a valid phone number',
      enabled: true
    },
    url: {
      type: 'pattern' as const,
      value: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$',
      message: 'Please enter a valid URL',
      enabled: true
    },
    alphaNumeric: {
      type: 'pattern' as const,
      value: '^[a-zA-Z0-9]+$',
      message: 'Only letters and numbers are allowed',
      enabled: true
    },
    number: {
      type: 'pattern' as const,
      value: '^[0-9]+$',
      message: 'Only numbers are allowed',
      enabled: true
    }
  };

  // Get validation rules for a field
  getFieldValidation(fieldId: string): FieldValidation | undefined {
    return this.validationRules.get(fieldId);
  }

  // Set validation rules for a field
  setFieldValidation(fieldId: string, rules: ValidationRule[]): void {
    this.validationRules.set(fieldId, { fieldId, rules });
  }

  // Add a validation rule to a field
  addValidationRule(fieldId: string, rule: ValidationRule): void {
    const validation = this.validationRules.get(fieldId) || { fieldId, rules: [] };
    validation.rules.push(rule);
    this.validationRules.set(fieldId, validation);
  }

  // Remove a validation rule from a field
  removeValidationRule(fieldId: string, ruleType: string): void {
    const validation = this.validationRules.get(fieldId);
    if (validation) {
      validation.rules = validation.rules.filter(r => r.type !== ruleType);
      this.validationRules.set(fieldId, validation);
    }
  }

  // Get conditional logic for a field
  getConditionalLogic(fieldId: string): ConditionalLogic[] {
    return this.conditionalLogic.get(fieldId) || [];
  }

  // Add conditional logic
  addConditionalLogic(logic: ConditionalLogic): void {
    const existing = this.conditionalLogic.get(logic.fieldId) || [];
    existing.push(logic);
    this.conditionalLogic.set(logic.fieldId, existing);
  }

  // Remove conditional logic
  removeConditionalLogic(fieldId: string, logicId: string): void {
    const existing = this.conditionalLogic.get(fieldId) || [];
    const filtered = existing.filter(l => l.id !== logicId);
    this.conditionalLogic.set(fieldId, filtered);
  }

  // Generate validation code for Angular
  generateValidationCode(component: ComponentConfig): string {
    const validation = this.validationRules.get(component.instanceId || component.id);
    if (!validation || validation.rules.length === 0) {
      return '[]';
    }

    const validators: string[] = [];

    validation.rules.forEach(rule => {
      if (!rule.enabled) return;

      switch (rule.type) {
        case 'required':
          validators.push('Validators.required');
          break;
        case 'email':
          validators.push('Validators.email');
          break;
        case 'pattern':
          validators.push(`Validators.pattern(/${rule.value}/)`);
          break;
        case 'min':
          validators.push(`Validators.min(${rule.value})`);
          break;
        case 'max':
          validators.push(`Validators.max(${rule.value})`);
          break;
        case 'minLength':
          validators.push(`Validators.minLength(${rule.value})`);
          break;
        case 'maxLength':
          validators.push(`Validators.maxLength(${rule.value})`);
          break;
      }
    });

    return `[${validators.join(', ')}]`;
  }

  // Generate conditional logic code
  generateConditionalLogicCode(components: ComponentConfig[]): string {
    let code = '';

    components.forEach(component => {
      const logic = this.conditionalLogic.get(component.instanceId || component.id);
      if (logic && logic.length > 0) {
        logic.forEach(rule => {
          code += this.generateSingleLogicCode(rule, component);
        });
      }
    });

    return code;
  }

  private generateSingleLogicCode(logic: ConditionalLogic, component: ComponentConfig): string {
    let conditionCode = '';

    logic.conditions.forEach((condition, index) => {
      if (index > 0 && condition.combineWith) {
        conditionCode += condition.combineWith === 'AND' ? ' && ' : ' || ';
      }

      const fieldRef = `this.formData.${condition.fieldId}`;

      switch (condition.operator) {
        case 'equals':
          conditionCode += `${fieldRef} === '${condition.value}'`;
          break;
        case 'notEquals':
          conditionCode += `${fieldRef} !== '${condition.value}'`;
          break;
        case 'contains':
          conditionCode += `${fieldRef}.includes('${condition.value}')`;
          break;
        case 'greaterThan':
          conditionCode += `${fieldRef} > ${condition.value}`;
          break;
        case 'lessThan':
          conditionCode += `${fieldRef} < ${condition.value}`;
          break;
        case 'isEmpty':
          conditionCode += `!${fieldRef} || ${fieldRef}.length === 0`;
          break;
        case 'isNotEmpty':
          conditionCode += `${fieldRef} && ${fieldRef}.length > 0`;
          break;
      }
    });

    const actionCode = this.generateActionCode(logic, component);

    return `
    // Conditional logic for ${component.name}
    if (${conditionCode}) {
      ${actionCode}
    }
    `;
  }

  private generateActionCode(logic: ConditionalLogic, component: ComponentConfig): string {
    const fieldRef = `this.${component.instanceId || component.id}`;

    switch (logic.action) {
      case 'show':
        return `${fieldRef}Visible = true;`;
      case 'hide':
        return `${fieldRef}Visible = false;`;
      case 'enable':
        return `${fieldRef}Disabled = false;`;
      case 'disable':
        return `${fieldRef}Disabled = true;`;
      case 'setValue':
        return `this.formData.${component.instanceId || component.id} = '${logic.targetValue}';`;
      default:
        return '';
    }
  }

  // Get rule templates
  getRuleTemplates() {
    return this.ruleTemplates;
  }

  // Export all rules
  exportRules(): { validations: any, conditionalLogic: any } {
    return {
      validations: Object.fromEntries(this.validationRules),
      conditionalLogic: Object.fromEntries(this.conditionalLogic)
    };
  }

  // Import rules
  importRules(data: { validations: any, conditionalLogic: any }): void {
    this.validationRules = new Map(Object.entries(data.validations || {}));
    this.conditionalLogic = new Map(Object.entries(data.conditionalLogic || {}));
  }

  // Clear all rules
  clearRules(): void {
    this.validationRules.clear();
    this.conditionalLogic.clear();
  }
}
