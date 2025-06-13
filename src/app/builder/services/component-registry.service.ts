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
      {
        id: 'mat_input',
        name: 'Material Input',
        category: 'Form',
        icon: 'input',
        component: 'mat-form-field > input',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Input Label' },
          { name: 'placeholder', type: 'string', defaultValue: 'Enter text' },
          { name: 'required', type: 'boolean', defaultValue: false }
        ]
      },
      {
        id: 'mat_select',
        name: 'Material Select',
        category: 'Form',
        icon: 'arrow_drop_down',
        component: 'mat-form-field > mat-select',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Select Option' },
          { name: 'required', type: 'boolean', defaultValue: false },
          { name: 'options', type: 'string', defaultValue: 'Option 1,Option 2' }
        ]
      },
      {
        id: 'mat_button',
        name: 'Material Button',
        category: 'Button',
        icon: 'smart_button',
        component: 'button[mat-button]',
        inputs: [
          { name: 'text', type: 'string', defaultValue: 'Click Me' },
          { name: 'color', type: 'select', defaultValue: 'primary', options: ['primary', 'accent', 'warn'] }
        ]
      },
      {
        id: 'mat_checkbox',
        name: 'Material Checkbox',
        category: 'Form',
        icon: 'check_box',
        component: 'mat-checkbox',
        inputs: [
          { name: 'label', type: 'string', defaultValue: 'Accept Terms' },
          { name: 'required', type: 'boolean', defaultValue: false }
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
}
