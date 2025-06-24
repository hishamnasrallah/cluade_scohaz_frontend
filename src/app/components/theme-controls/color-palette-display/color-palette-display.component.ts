import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeConfig, getContrastRatio } from '../../../models/theme.model';

@Component({
  selector: 'app-color-palette-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './color-palette-display.component.html',
  styleUrls: ['./color-palette-display.component.scss']
})
export class ColorPaletteDisplayComponent {
  @Input() theme!: ThemeConfig;

  getContrastRatio(color1Key: keyof ThemeConfig, color2Key: keyof ThemeConfig): number {
    const color1 = this.theme[color1Key] as string;
    const color2 = this.theme[color2Key] as string;
    return getContrastRatio(color1, color2);
  }

  getContrastRatioWithWhite(colorKey: keyof ThemeConfig): number {
    const color = this.theme[colorKey] as string;
    return getContrastRatio(color, '#FFFFFF');
  }

  copyColor(color: string): void {
    navigator.clipboard.writeText(color).then(() => {
      // Optional: Show a toast notification
      console.log(`Copied ${color} to clipboard`);
    });
  }
}
