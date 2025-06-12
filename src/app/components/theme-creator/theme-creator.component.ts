import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { ThemeConfig, ThemePreset } from '../../models/theme.model';
import { Observable } from 'rxjs';
import { ThemePreviewComponent } from '../theme-preview/theme-preview.component';
import { ColorPickerComponent } from '../theme-controls/color-picker/color-picker.component';
import { TypographyControlsComponent } from '../theme-controls/typography-controls/typography-controls.component';
import { SpacingControlsComponent } from '../theme-controls/spacing-controls/spacing-controls.component';
import { EffectsControlsComponent } from '../theme-controls/effects-controls/effects-controls.component';

@Component({
  selector: 'app-theme-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ThemePreviewComponent,
    ColorPickerComponent,
    TypographyControlsComponent,
    SpacingControlsComponent,
    EffectsControlsComponent
  ],
  templateUrl: './theme-creator.component.html',
  styleUrls: ['./theme-creator.component.scss']
})
export class ThemeCreatorComponent implements OnInit {
  theme$: Observable<ThemeConfig>;
  presets$: Observable<ThemePreset[]>;
  activeTab: string = 'colors';
  showExportModal: boolean = false;
  exportedCode: string = '';

  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;

  tabs = [
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ];

  constructor(public themeService: ThemeService) {
    this.theme$ = this.themeService.theme$;
    this.presets$ = this.themeService.presets$;
  }

  ngOnInit(): void {
    // Initialize theme
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  applyPreset(presetId: string): void {
    this.themeService.applyPreset(presetId);
  }

  resetTheme(): void {
    if (confirm('Are you sure you want to reset to default theme?')) {
      this.themeService.resetTheme();
    }
  }

  exportTheme(): void {
    this.exportedCode = this.themeService.generateCSS();
    this.showExportModal = true;
  }

  exportJSON(): void {
    const themeJson = this.themeService.exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importTheme(): void {
    this.importInput.nativeElement.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeJson = e.target?.result as string;
          this.themeService.importTheme(themeJson);
          alert('Theme imported successfully!');
        } catch (error) {
          alert('Failed to import theme. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }
}
