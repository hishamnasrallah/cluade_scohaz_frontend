// src/app/builder/services/theme-customizer.service.ts

import { Injectable } from '@angular/core';
import {Theme} from '../models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeCustomizerService {
  setCSSVar(name: string, value: string): void {
    document.documentElement.style.setProperty(`--${name}`, value);
  }

  getAllThemes() {
    return [];
  }

  getActiveTheme(id: string) {

  }

  generateCSS(selectedTheme: Theme) {

  }

  createDefaultTheme(newTheme1: string) {

  }

  saveTheme(newTheme: Theme) {

  }

  cloneTheme(id: string, s: string) {

  }

  deleteTheme(id: string) {

  }

  exportTheme(id: string) {

  }

  importTheme(result: any) {

  }
}
