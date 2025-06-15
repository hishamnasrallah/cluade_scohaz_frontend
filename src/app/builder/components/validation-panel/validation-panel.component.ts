// src/app/builder/components/validation-panel/validation-panel.component.ts

import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { ComponentConfig } from '../../models/component-config.model';
import { ValidationRule, ConditionalLogic, Condition } from '../../models/validation-rules.model';
import { ValidationRulesService } from '../../services/validation-rules.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-validation-panel',
  template: `
    <div class="validation-panel" *ngIf="selectedComponent">
      <mat-accordion multi>
        <!-- Validation Rules Section -->
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>rule</mat-icon>
              Validation Rules
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="rules-section">
            <!-- Quick Rules -->
            <div class="quick-rules">
              <mat-chip-listbox>
                <mat-chip-option
                  *ngFor="let template of ruleTemplates"
                  (click)="addQuickRule(template.key)"
                  [selected]="hasRule(template.key)">
                  {{ template.label }}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>

            <!-- Active Rules -->
            <div class="active-rules" *ngIf="activeRules.length > 0">
              <h4>Active Rules</h4>
              <div class="rule-item" *ngFor="let rule of activeRules">
                <mat-slide-toggle [(ngModel)]="rule.enabled">
                  {{ getRuleLabel(rule.type) }}
                </mat-slide-toggle>

                <div class="rule-config" *ngIf="rule.enabled">
                  <!-- Rule Value Input -->
                  <mat-form-field *ngIf="needsValue(rule.type)" appearance="outline">
                    <mat-label>Value</mat-label>
                    <input matInput [(ngModel)]="rule.value" (change)="updateRule(rule)">
                  </mat-form-field>

                  <!-- Custom Message -->
                  <mat-form-field appearance="outline">
                    <mat-label>Error Message</mat-label>
                    <input matInput [(ngModel)]="rule.message" (change)="updateRule(rule)">
                  </mat-form-field>

                  <button mat-icon-button color="warn" (click)="removeRule(rule.type)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Add Custom Rule -->
            <button mat-stroked-button (click)="showCustomRule = !showCustomRule">
              <mat-icon>add</mat-icon>
              Add Custom Rule
            </button>

            <div class="custom-rule" *ngIf="showCustomRule">
              <mat-form-field appearance="outline">
                <mat-label>Rule Type</mat-label>
                <mat-select [(ngModel)]="customRule.type">
                  <mat-option value="pattern">Pattern (Regex)</mat-option>
                  <mat-option value="min">Minimum Value</mat-option>
                  <mat-option value="max">Maximum Value</mat-option>
                  <mat-option value="minLength">Minimum Length</mat-option>
                  <mat-option value="maxLength">Maximum Length</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Value</mat-label>
                <input matInput [(ngModel)]="customRule.value">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Error Message</mat-label>
                <input matInput [(ngModel)]="customRule.message">
              </mat-form-field>

              <button mat-raised-button color="primary" (click)="addCustomRule()">
                Add Rule
              </button>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Conditional Logic Section -->
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>alt_route</mat-icon>
              Conditional Logic
            </mat-panel-title>
          </mat-expansion-panel-header>

          <div class="logic-section">
            <div class="logic-list" *ngIf="conditionalLogic.length > 0">
              <div class="logic-item" *ngFor="let logic of conditionalLogic; let i = index">
                <div class="logic-header">
                  <span>Rule {{ i + 1 }}</span>
                  <button mat-icon-button color="warn" (click)="removeLogic(logic.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>

                <div class="logic-conditions">
                  <div class="condition" *ngFor="let condition of logic.conditions; let j = index">
                    <mat-form-field appearance="outline">
                      <mat-label>Field</mat-label>
                      <mat-select [(ngModel)]="condition.fieldId">
                        <mat-option *ngFor="let field of availableFields" [value]="field.id">
                          {{ field.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Operator</mat-label>
                      <mat-select [(ngModel)]="condition.operator">
                        <mat-option value="equals">Equals</mat-option>
                        <mat-option value="notEquals">Not Equals</mat-option>
                        <mat-option value="contains">Contains</mat-option>
                        <mat-option value="greaterThan">Greater Than</mat-option>
                        <mat-option value="lessThan">Less Than</mat-option>
                        <mat-option value="isEmpty">Is Empty</mat-option>
                        <mat-option value="isNotEmpty">Is Not Empty</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" *ngIf="needsConditionValue(condition.operator)">
                      <mat-label>Value</mat-label>
                      <input matInput [(ngModel)]="condition.value">
                    </mat-form-field>

                    <mat-form-field appearance="outline" *ngIf="j > 0">
                      <mat-label>Combine</mat-label>
                      <mat-select [(ngModel)]="condition.combineWith">
                        <mat-option value="AND">AND</mat-option>
                        <mat-option value="OR">OR</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <button mat-button (click)="addCondition(logic)">
                    <mat-icon>add</mat-icon>
                    Add Condition
                  </button>
                </div>

                <div class="logic-action">
                  <mat-form-field appearance="outline">
                    <mat-label>Action</mat-label>
                    <mat-select [(ngModel)]="logic.action">
                      <mat-option value="show">Show Field</mat-option>
                      <mat-option value="hide">Hide Field</mat-option>
                      <mat-option value="enable">Enable Field</mat-option>
                      <mat-option value="disable">Disable Field</mat-option>
                      <mat-option value="setValue">Set Value</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" *ngIf="logic.action === 'setValue'">
                    <mat-label>Target Value</mat-label>
                    <input matInput [(ngModel)]="logic.targetValue">
                  </mat-form-field>
                </div>
              </div>
            </div>

            <button mat-raised-button color="accent" (click)="addNewLogic()">
              <mat-icon>add</mat-icon>
              Add Conditional Logic
            </button>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  styles: [`
    .validation-panel {
      padding: 16px;
      height: 100%;
      overflow-y: auto;
    }

    .rules-section, .logic-section {
      padding: 16px 0;
    }

    .quick-rules {
      margin-bottom: 20px;
    }

    .active-rules h4 {
      margin: 16px 0 12px;
      color: #475569;
      font-size: 14px;
      font-weight: 600;
    }

    .rule-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .rule-config {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .custom-rule {
      margin-top: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .logic-item {
      margin-bottom: 20px;
      padding: 16px;
      background: #f1f5f9;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .logic-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .condition {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .logic-action {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 12px;
    }

    mat-form-field {
      flex: 1;
      min-width: 120px;
    }
  `]
})
export class ValidationPanelComponent implements OnInit, OnChanges {
  @Input() selectedComponent!: ComponentConfig;
  @Input() allComponents: ComponentConfig[] = [];

  activeRules: ValidationRule[] = [];
  conditionalLogic: ConditionalLogic[] = [];
  availableFields: { id: string; name: string }[] = [];

  showCustomRule = false;
  customRule: Partial<ValidationRule> = {
    type: 'pattern',
    value: '',
    message: '',
    enabled: true
  };

  ruleTemplates = [
    { key: 'required', label: 'Required', icon: 'star' },
    { key: 'email', label: 'Email', icon: 'email' },
    { key: 'phoneNumber', label: 'Phone', icon: 'phone' },
    { key: 'url', label: 'URL', icon: 'link' },
    { key: 'number', label: 'Numbers Only', icon: 'numbers' },
    { key: 'alphaNumeric', label: 'Alphanumeric', icon: 'text_fields' }
  ];

  constructor(private validationService: ValidationRulesService) {}

  ngOnInit(): void {
    this.loadValidationData();
  }

  ngOnChanges(): void {
    this.loadValidationData();
  }

  private loadValidationData(): void {
    if (!this.selectedComponent) return;

    const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
    const validation = this.validationService.getFieldValidation(fieldId);

    this.activeRules = validation?.rules || [];
    this.conditionalLogic = this.validationService.getConditionalLogic(fieldId);

    // Build available fields list
    this.availableFields = this.allComponents
      .filter(c => c.instanceId !== this.selectedComponent.instanceId)
      .map(c => ({
        id: c.instanceId || c.id,
        name: c.name
      }));
  }

  hasRule(ruleType: string): boolean {
    return this.activeRules.some(r => r.type === ruleType);
  }

  addQuickRule(templateKey: string): void {
    if (this.hasRule(templateKey)) {
      this.removeRule(templateKey);
      return;
    }

    const template = this.validationService.getRuleTemplates()[templateKey];
    if (template) {
      const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
      this.validationService.addValidationRule(fieldId, { ...template });
      this.loadValidationData();
    }
  }

  updateRule(rule: ValidationRule): void {
    const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
    const rules = this.activeRules.filter(r => r.type !== rule.type);
    rules.push(rule);
    this.validationService.setFieldValidation(fieldId, rules);
  }

  removeRule(ruleType: string): void {
    const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
    this.validationService.removeValidationRule(fieldId, ruleType);
    this.loadValidationData();
  }

  addCustomRule(): void {
    if (this.customRule.type && this.customRule.value) {
      const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
      this.validationService.addValidationRule(fieldId, this.customRule as ValidationRule);
      this.loadValidationData();
      this.showCustomRule = false;
      this.customRule = { type: 'pattern', value: '', message: '', enabled: true };
    }
  }

  needsValue(ruleType: string): boolean {
    return ['pattern', 'min', 'max', 'minLength', 'maxLength'].includes(ruleType);
  }

  getRuleLabel(ruleType: string): string {
    const labels: { [key: string]: string } = {
      required: 'Required Field',
      email: 'Valid Email',
      pattern: 'Pattern Match',
      min: 'Minimum Value',
      max: 'Maximum Value',
      minLength: 'Minimum Length',
      maxLength: 'Maximum Length',
      phoneNumber: 'Phone Number',
      url: 'Valid URL',
      number: 'Numbers Only',
      alphaNumeric: 'Letters & Numbers'
    };
    return labels[ruleType] || ruleType;
  }

  // Conditional Logic Methods
  addNewLogic(): void {
    const newLogic: ConditionalLogic = {
      id: Date.now().toString(),
      fieldId: this.selectedComponent.instanceId || this.selectedComponent.id,
      conditions: [{
        fieldId: '',
        operator: 'equals',
        value: ''
      }],
      action: 'show'
    };

    this.validationService.addConditionalLogic(newLogic);
    this.loadValidationData();
  }

  removeLogic(logicId: string): void {
    const fieldId = this.selectedComponent.instanceId || this.selectedComponent.id;
    this.validationService.removeConditionalLogic(fieldId, logicId);
    this.loadValidationData();
  }

  addCondition(logic: ConditionalLogic): void {
    logic.conditions.push({
      fieldId: '',
      operator: 'equals',
      value: '',
      combineWith: 'AND'
    });
  }

  needsConditionValue(operator: string): boolean {
    return !['isEmpty', 'isNotEmpty'].includes(operator);
  }
}
