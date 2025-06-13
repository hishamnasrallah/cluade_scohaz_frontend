// src/app/builder/components/dynamic-renderer/dynamic-renderer.component.ts

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentConfig } from '../../models/component-config.model';
import { NgSwitch, NgSwitchCase, NgSwitchDefault, NgForOf, NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSlider } from '@angular/material/slider';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dynamic-renderer',
  templateUrl: './dynamic-renderer.component.html',
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggle,
    MatSlider,
    MatIcon
  ],
  styleUrls: ['./dynamic-renderer.component.scss']
})
export class DynamicRendererComponent implements OnInit, OnChanges {
  @Input() componentConfig!: ComponentConfig;

  control!: FormControl;
  form!: FormGroup;

  // Component properties
  label: string = '';
  placeholder: string = '';
  required: boolean = false;
  options: string[] = [];
  minValue: number = 0;
  maxValue: number = 100;
  stepValue: number = 1;
  disabled: boolean = false;
  readonly: boolean = false;
  appearance: 'outline' | 'fill' = 'outline';
  color: 'primary' | 'accent' | 'warn' = 'primary';

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['componentConfig'] && !changes['componentConfig'].firstChange) {
      this.initializeComponent();
    }
  }

  private initializeComponent(): void {
    // Extract input values from component config
    this.extractInputValues();

    // Create form control with validators
    const validators = [];
    if (this.required) {
      validators.push(Validators.required);
    }

    // Add specific validators based on component type
    if (this.componentConfig.id === 'mat_email') {
      validators.push(Validators.email);
    }

    if (this.componentConfig.id === 'mat_number') {
      validators.push(Validators.min(this.minValue));
      validators.push(Validators.max(this.maxValue));
    }

    // Initialize control with default value
    const defaultValue = this.getInputValue('defaultValue') || '';
    this.control = new FormControl(
      { value: defaultValue, disabled: this.disabled },
      validators
    );

    // Create form with unique name
    const controlName = `${this.componentConfig.id}_${Date.now()}`;
    this.form = new FormGroup({
      [controlName]: this.control
    });
  }

  private extractInputValues(): void {
    this.label = this.getInputValue('label') || 'Label';
    this.placeholder = this.getInputValue('placeholder') || '';
    this.required = this.getInputValue('required') || false;
    this.disabled = this.getInputValue('disabled') || false;
    this.readonly = this.getInputValue('readonly') || false;
    this.appearance = this.getInputValue('appearance') || 'outline';
    this.color = this.getInputValue('color') || 'primary';

    // Extract options for select/radio
    const optionsValue = this.getInputValue('options');
    if (optionsValue) {
      this.options = typeof optionsValue === 'string'
        ? optionsValue.split(',').map(opt => opt.trim())
        : optionsValue;
    }

    // Extract number-specific values
    this.minValue = this.getInputValue('min') || 0;
    this.maxValue = this.getInputValue('max') || 100;
    this.stepValue = this.getInputValue('step') || 1;
  }

  getInputValue(name: string): any {
    const input = this.componentConfig.inputs?.find(i => i.name === name);
    return input?.defaultValue;
  }

  getErrorMessage(): string {
    if (this.control.hasError('required')) {
      return `${this.label} is required`;
    }
    if (this.control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (this.control.hasError('min')) {
      return `Minimum value is ${this.minValue}`;
    }
    if (this.control.hasError('max')) {
      return `Maximum value is ${this.maxValue}`;
    }
    return '';
  }
}
