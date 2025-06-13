// src/app/builder/services/component-registry.service.ts

import { Injectable } from '@angular/core';
import { ComponentConfig } from '../models/component-config.model';

@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService {

  private components: ComponentConfig[] = [];

  constructor() {
    this.loadDefaultComponents();
  }

  private loadDefaultComponents(): void {
    this.components = [
      // Form Controls
      {
        id: 'mat_input',
        name: 'Text Input',
        category: 'Form',
        icon: 'input',
        component: 'mat-form-field > input',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Input Label' },
          { name: 'placeholder', type: 'string', defaultValue: 'Enter text' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'disabled', type: 'boolean', defaultValue: false },
          { name: 'readonly', type: 'boolean', defaultValue: false },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_email',
        name: 'Email Input',
        category: 'Form',
        icon: 'email',
        component: 'mat-form-field > input[type="email"]',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Email' },
          { name: 'placeholder', type: 'string', defaultValue: 'user@example.com' },
          { name: 'required', type: 'boolean', defaultValue: true },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_number',
        name: 'Number Input',
        category: 'Form',
        icon: 'pin',
        component: 'mat-form-field > input[type="number"]',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Number' },
          { name: 'placeholder', type: 'string', defaultValue: '0' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'min', type: 'number', defaultValue: 0 },
          { name: 'max', type: 'number', defaultValue: 100 },
          { name: 'step', type: 'number', defaultValue: 1 },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_textarea',
        name: 'Textarea',
        category: 'Form',
        icon: 'notes',
        component: 'mat-form-field > textarea',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Description' },
          { name: 'placeholder', type: 'string', defaultValue: 'Enter description...' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'rows', type: 'number', defaultValue: 4 },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_select',
        name: 'Select Dropdown',
        category: 'Form',
        icon: 'arrow_drop_down',
        component: 'mat-form-field > mat-select',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Select Option' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'options', type: 'string', defaultValue: 'Option 1,Option 2,Option 3' },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_radio',
        name: 'Radio Group',
        category: 'Form',
        icon: 'radio_button_checked',
        component: 'mat-radio-group',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Choose Option' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'options', type: 'string', defaultValue: 'Option 1,Option 2,Option 3' }
        ]
      },
      {
        id: 'mat_checkbox',
        name: 'Checkbox',
        category: 'Form',
        icon: 'check_box',
        component: 'mat-checkbox',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Accept Terms' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] }
        ]
      },
      {
        id: 'mat_slide_toggle',
        name: 'Slide Toggle',
        category: 'Form',
        icon: 'toggle_on',
        component: 'mat-slide-toggle',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Enable Feature' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] }
        ]
      },
      {
        id: 'mat_datepicker',
        name: 'Date Picker',
        category: 'Form',
        icon: 'calendar_today',
        component: 'mat-form-field > input[matDatepicker]',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Select Date' },
          { name: 'placeholder', type: 'string', defaultValue: 'MM/DD/YYYY' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'appearance', type: 'select', defaultValue: 'outline', options: ['outline', 'fill'] }
        ]
      },
      {
        id: 'mat_slider',
        name: 'Slider',
        category: 'Form',
        icon: 'tune',
        component: 'mat-slider',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Value' },
          { name: 'min', type: 'number', defaultValue: 0 },
          { name: 'max', type: 'number', defaultValue: 100 },
          { name: 'step', type: 'number', defaultValue: 1 },
          { name: 'defaultValue', type: 'number', defaultValue: 50 }
        ]
      },

      // Buttons
      {
        id: 'mat_button',
        name: 'Button',
        category: 'Button',
        icon: 'smart_button',
        component: 'button[mat-button]',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Click Me' },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] },
          { name: 'disabled', type: 'boolean', defaultValue: false },
          { name: 'icon', type: 'string', defaultValue: '' }
        ]
      },

      // Display Components
      {
        id: 'mat_card',
        name: 'Card',
        category: 'Layout',
        icon: 'credit_card',
        component: 'mat-card',
        inputs: [
          { name: 'title', type: 'string', defaultValue: 'Card Title' },
          { name: 'subtitle', type: 'string', defaultValue: 'Card Subtitle' },
          { name: 'content', type: 'string', defaultValue: 'Card content goes here...' }
        ]
      },
      {
        id: 'mat_divider',
        name: 'Divider',
        category: 'Layout',
        icon: 'horizontal_rule',
        component: 'mat-divider',
        inputs: [
          { name: 'inset', type: 'boolean', defaultValue: false },
          { name: 'vertical', type: 'boolean', defaultValue: false }
        ]
      },
      {
        id: 'mat_expansion_panel',
        name: 'Expansion Panel',
        category: 'Layout',
        icon: 'expand_more',
        component: 'mat-expansion-panel',
        inputs: [
          { name: 'title', type: 'string', defaultValue: 'Panel Title' },
          { name: 'description', type: 'string', defaultValue: 'Panel Description' },
          { name: 'content', type: 'string', defaultValue: 'Panel content...' },
          { name: 'expanded', type: 'boolean', defaultValue: false }
        ]
      },

      // Data Display
      {
        id: 'mat_list',
        name: 'List',
        category: 'Data',
        icon: 'list',
        component: 'mat-list',
        inputs: [
          { name: 'items', type: 'string', defaultValue: 'Item 1,Item 2,Item 3' },
          { name: 'dense', type: 'boolean', defaultValue: false }
        ]
      },
      {
        id: 'mat_chip',
        name: 'Chip',
        category: 'Data',
        icon: 'label',
        component: 'mat-chip',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Chip Label' },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] },
          { name: 'removable', type: 'boolean', defaultValue: false }
        ]
      },

      // Navigation
      {
        id: 'mat_tabs',
        name: 'Tabs',
        category: 'Navigation',
        icon: 'tab',
        component: 'mat-tab-group',
        inputs: [
          { name: 'tabs', type: 'string', defaultValue: 'Tab 1,Tab 2,Tab 3' },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] }
        ]
      },
      {
        id: 'mat_stepper',
        name: 'Stepper',
        category: 'Navigation',
        icon: 'linear_scale',
        component: 'mat-stepper',
        inputs: [
          { name: 'steps', type: 'string', defaultValue: 'Step 1,Step 2,Step 3' },
          { name: 'orientation', type: 'select', defaultValue: 'horizontal', options: ['horizontal', 'vertical'] }
        ]
      }
    ];
  }

  getAvailableComponents(): ComponentConfig[] {
    return this.components;
  }

  getComponentById(id: string): ComponentConfig | undefined {
    return this.components.find(comp => comp.id === id);
  }

  getComponentsByCategory(category: string): ComponentConfig[] {
    return this.components.filter(comp => comp.category === category);
  }

  getCategories(): string[] {
    return [...new Set(this.components.map(comp => comp.category))];
  }

  // Add custom component
  addCustomComponent(component: ComponentConfig): void {
    if (!this.components.find(c => c.id === component.id)) {
      this.components.push(component);
    }
  }

  // Remove custom component
  removeComponent(id: string): void {
    this.components = this.components.filter(c => c.id !== id);
  }
}
