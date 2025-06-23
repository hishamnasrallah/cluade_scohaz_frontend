// src/app/components/theme-creator/utils/theme-import-export.util.ts
import { ThemeConfig } from '../../../models/theme.model';

export class ThemeImportExportUtil {
  static exportTheme(theme: ThemeConfig): void {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const brandName = theme.brandName || 'theme';
    const sanitizedBrandName = brandName.replace(/\s+/g, '-').toLowerCase();
    link.download = `theme-${sanitizedBrandName}-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  static importTheme(file: File): Promise<ThemeConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string) as ThemeConfig;
          resolve(theme);
        } catch (error) {
          reject(new Error('Invalid theme file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static validateImportedTheme(theme: any): theme is ThemeConfig {
    // Basic validation - check for required properties
    const requiredProps = [
      'primaryColor',
      'secondaryColor',
      'backgroundColor',
      'textColor',
      'fontFamily',
      'fontSizeBase',
      'spacingUnit',
      'borderRadius'
    ];

    return requiredProps.every(prop => prop in theme);
  }
}
