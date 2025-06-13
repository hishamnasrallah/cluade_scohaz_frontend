// src/app/builder/components/config-panel/config-panel.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { ComponentConfig, ComponentInput } from '../../models/component-config.model';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  imports: [
    NgSwitch,
    NgIf,
    NgForOf,
    NgSwitchCase,
    MatCheckbox
  ],
  styleUrls: ['./config-panel.component.scss']
})
export class ConfigPanelComponent implements OnInit {
  @Input() selectedComponent!: ComponentConfig;

  ngOnInit(): void {}

  updateInputValue(input: ComponentInput, event: any): void {
    input.defaultValue = input.type === 'boolean' ? event.checked : event.target.value;
  }
}
