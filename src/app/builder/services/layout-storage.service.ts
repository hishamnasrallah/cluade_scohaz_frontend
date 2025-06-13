// src/app/builder/services/layout-storage.service.ts

import { Injectable } from '@angular/core';
import { LayoutSchema } from '../models/layout.model';

@Injectable({
  providedIn: 'root'
})
export class LayoutStorageService {
  private readonly KEY = 'builder_layout_schema';

  save(schema: LayoutSchema): void {
    const raw = JSON.stringify(schema);
    localStorage.setItem(this.KEY, raw);
  }

  load(): LayoutSchema {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LayoutSchema;
    } catch (error) {
      console.error('Invalid layout schema in localStorage');
      return [];
    }
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
  }
}
