// src/app/builder/components/config-panel/config-panel.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ComponentConfig, ComponentInput } from '../../models/component-config.model';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  imports: [
    NgSwitch,
    NgIf,
    NgForOf,
    NgSwitchCase,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    FormsModule,
    MatSlideToggle,
    MatIconButton,
    MatIcon,
    MatTooltipModule,
    MatExpansionModule
  ],
  styleUrls: ['./config-panel.component.scss']
})
export class ConfigPanelComponent implements OnInit, OnChanges {
  @Input() selectedComponent!: ComponentConfig;
  @Output() configUpdated = new EventEmitter<void>();

  groupedInputs: { [key: string]: ComponentInput[] } = {};
  expandedPanels: Set<string> = new Set(['basic', 'appearance']);

  ngOnInit(): void {
    this.groupInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedComponent']) {
      this.groupInputs();
    }
  }

  private groupInputs(): void {
    this.groupedInputs = {};

    if (!this.selectedComponent?.inputs) return;

    // Define input groups
    const groups: { [key: string]: string[] } = {
      basic: ['label', 'placeholder', 'defaultValue', 'value', 'text', 'title', 'subtitle', 'content', 'items', 'tabs', 'steps', 'options'],
      validation: ['required', 'disabled', 'readonly', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'step'],
      appearance: ['appearance', 'color', 'icon', 'rows', 'dense', 'inset', 'vertical', 'expanded', 'removable', 'orientation'],
      advanced: []
    };

    // Group inputs
    this.selectedComponent.inputs.forEach(input => {
      let grouped = false;

      for (const [groupName, inputNames] of Object.entries(groups)) {
        if (inputNames.includes(input.name)) {
          if (!this.groupedInputs[groupName]) {
            this.groupedInputs[groupName] = [];
          }
          this.groupedInputs[groupName].push(input);
          grouped = true;
          break;
        }
      }

      // If not in any group, add to advanced
      if (!grouped) {
        if (!this.groupedInputs['advanced']) {
          this.groupedInputs['advanced'] = [];
        }
        this.groupedInputs['advanced'].push(input);
      }
    });

    // Remove empty groups
    Object.keys(this.groupedInputs).forEach(key => {
      if (this.groupedInputs[key].length === 0) {
        delete this.groupedInputs[key];
      }
    });
  }

  updateInputValue(input: ComponentInput, event: any): void {
    const value = this.extractValue(input, event);
    input.defaultValue = value;
    this.configUpdated.emit();
  }

  private extractValue(input: ComponentInput, event: any): any {
    switch (input.type) {
      case 'boolean':
        return event.checked ?? event;
      case 'number':
        return Number(event.target?.value ?? event);
      case 'string':
      case 'select':
        return event.target?.value ?? event;
      default:
        return event.target?.value ?? event;
    }
  }

  resetToDefault(input: ComponentInput): void {
    const defaultValues: { [key: string]: any } = {
      string: '',
      number: 0,
      boolean: false,
      select: input.options?.[0] || ''
    };

    input.defaultValue = defaultValues[input.type] ?? '';
    this.configUpdated.emit();
  }

  getInputIcon(inputName: string): string {
    const iconMap: { [key: string]: string } = {
      label: 'label',
      placeholder: 'text_fields',
      required: 'star',
      disabled: 'block',
      readonly: 'lock',
      min: 'arrow_downward',
      max: 'arrow_upward',
      color: 'palette',
      icon: 'insert_emoticon',
      appearance: 'style',
      options: 'list',
      rows: 'table_rows'
    };

    return iconMap[inputName] || 'settings';
  }

  getGroupIcon(groupName: string): string {
    const iconMap: { [key: string]: string } = {
      basic: 'edit',
      validation: 'rule',
      appearance: 'palette',
      advanced: 'tune'
    };

    return iconMap[groupName] || 'folder';
  }

  formatGroupName(groupName: string): string {
    return groupName.charAt(0).toUpperCase() + groupName.slice(1) + ' Settings';
  }

  isPanelExpanded(groupName: string): boolean {
    return this.expandedPanels.has(groupName);
  }

  togglePanel(groupName: string): void {
    if (this.expandedPanels.has(groupName)) {
      this.expandedPanels.delete(groupName);
    } else {
      this.expandedPanels.add(groupName);
    }
  }

  getGroupsArray(): Array<{ key: string; value: ComponentInput[] }> {
    return Object.keys(this.groupedInputs).map(key => ({
      key,
      value: this.groupedInputs[key]
    }));
  }

  formatInputName(name: string): string {
    // Convert camelCase or snake_case to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  formatOptionName(option: string): string {
    if (typeof option !== 'string') return String(option);
    return option.charAt(0).toUpperCase() + option.slice(1).toLowerCase();
  }
}
