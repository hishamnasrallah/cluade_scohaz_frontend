// src/app/builder/services/code-generator.service.ts

import { Injectable } from '@angular/core';
import { ComponentConfig } from '../models/component-config.model';

@Injectable({
  providedIn: 'root'
})
export class CodeGeneratorService {

  generateHTML(components: ComponentConfig[]): string {
    let html = '';

    components.forEach(comp => {
      const attrs = this.getAttributes(comp);
      switch (comp.id) {
        case 'mat_input':
          html += `
<mat-form-field appearance="fill">
  <mat-label>${attrs.label}</mat-label>
  <input matInput placeholder="${attrs.placeholder}" ${attrs.required} />
</mat-form-field>\n`;
          break;

        case 'mat_select':
          html += `
<mat-form-field appearance="fill">
  <mat-label>${attrs.label}</mat-label>
  <mat-select ${attrs.required}>
    ${(attrs.options || '').split(',').map((opt: string) => `<mat-option value="${opt.trim()}">${opt.trim()}</mat-option>`).join('\n    ')}
  </mat-select>
</mat-form-field>\n`;
          break;

        case 'mat_button':
          html += `<button mat-raised-button color="primary">${attrs.label}</button>\n`;
          break;

        case 'mat_checkbox':
          html += `<mat-checkbox ${attrs.required}>${attrs.label}</mat-checkbox>\n`;
          break;

        default:
          html += `<!-- Unknown component: ${comp.id} -->\n`;
      }
    });

    return html.trim();
  }

  private getAttributes(comp: ComponentConfig): any {
    const obj: any = {};
    for (const input of comp.inputs || []) {
      obj[input.name] = input.defaultValue;
    }
    obj.required = obj.required ? 'required' : '';
    return obj;
  }
}
