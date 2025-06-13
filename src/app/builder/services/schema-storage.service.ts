// src/app/builder/services/schema-storage.service.ts

import { Injectable } from '@angular/core';
import { ComponentConfig } from '../models/component-config.model';

@Injectable({
  providedIn: 'root'
})
export class SchemaStorageService {
  private readonly LOCAL_KEY = 'builder_schema';

  constructor() {}

  saveSchema(components: ComponentConfig[]): void {
    const raw = JSON.stringify(components);
    localStorage.setItem(this.LOCAL_KEY, raw);
  }

  loadSchema(): ComponentConfig[] {
    const data = localStorage.getItem(this.LOCAL_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as ComponentConfig[];
    } catch {
      console.error('Invalid schema in localStorage');
      return [];
    }
  }

  clearSchema(): void {
    localStorage.removeItem(this.LOCAL_KEY);
  }
}
