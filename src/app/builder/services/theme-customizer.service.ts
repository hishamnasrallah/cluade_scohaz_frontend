// src/app/builder/services/theme-customizer.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeCustomizerService {
  setCSSVar(name: string, value: string): void {
    document.documentElement.style.setProperty(`--${name}`, value);
  }
}
