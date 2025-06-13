// src/app/builder/components/dynamic-renderer/dynamic-renderer.component.ts

import { Component, Input, OnInit } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { ComponentConfig } from '../../models/component-config.model';
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-dynamic-renderer',
  templateUrl: './dynamic-renderer.component.html',
  imports: [
    NgSwitch,
    MatFormField,
    MatInput,
    MatFormField,
    MatSelect,
    ReactiveFormsModule,
    NgSwitchCase,
    MatOption,
    NgSwitchDefault,
    MatButton,
    MatCheckbox
  ],
  styleUrls: ['./dynamic-renderer.component.scss']
})
export class DynamicRendererComponent implements OnInit {
  @Input() componentConfig!: ComponentConfig;

  control!: FormControl;
  form!: FormGroup;
  label: string = '';
  placeholder: string = '';
  required: boolean = false;
  options: string[] = [];

  ngOnInit(): void {
    const name = this.componentConfig.id + '_' + this.componentConfig.id.substring(0, 5);
    this.control = new FormControl('');
    this.form = new FormGroup({ [name]: this.control });
  }

  // getInputValue(name: string): any {
  //   return this.componentConfig.inputs?.find(i => i.name === name)?.defaultValue;
  // }
}
