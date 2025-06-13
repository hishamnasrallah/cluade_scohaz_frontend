// src/app/builder/services/dynamic-renderer.service.ts

import { Injectable } from '@angular/core';
import { ComponentConfig } from '../models/component-config.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicRendererService {

  constructor() {}

  // Later this will render real Angular Material tags
  render(component: ComponentConfig): string {
    return `<${component.component}></${component.component}>`;
  }
}
