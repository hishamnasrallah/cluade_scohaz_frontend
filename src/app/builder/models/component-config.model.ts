// src/app/builder/models/component-config.model.ts

export interface ComponentInput {
  name: string;             // e.g. label, placeholder, required
  type: 'string' | 'number' | 'boolean' | 'select'; // UI type in the sidebar
  defaultValue?: any;
  options?: any[];          // For select dropdowns (e.g. ['outline', 'fill'])
  required?: boolean;
}

export interface ComponentConfig {
  id: string;                 // Unique ID (e.g. mat_input, mat_select)
  name: string;               // Display Name (e.g. Material Input)
  category: string;           // Form, Layout, Button, etc.
  icon: string;               // Icon for sidebar display
  component: string;          // Component tag name (e.g. mat-form-field + input)
  inputs: ComponentInput[];   // Configurable inputs
}
