// src/app/builder/services/project-export.service.ts

import { Injectable } from '@angular/core';
import { ComponentConfig } from '../models/component-config.model';
import { LayoutSchema } from '../models/layout.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectExportService {

  exportCanvas(canvas: ComponentConfig[]): string {
    return JSON.stringify(canvas, null, 2);
  }

  exportLayout(layout: LayoutSchema): string {
    return JSON.stringify(layout, null, 2);
  }

  downloadAsFile(name: string, content: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  copyToClipboard(content: string): void {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard');
  }
}
