// src/app/builder/components/code-preview/code-preview.component.ts

import { Component, Input, OnChanges } from '@angular/core';
import { ComponentConfig } from '../../models/component-config.model';
import { CodeGeneratorService } from '../../services/code-generator.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-code-preview',
  templateUrl: './code-preview.component.html',
  imports: [
    MatButton
  ],
  styleUrls: ['./code-preview.component.scss']
})
export class CodePreviewComponent implements OnChanges {
  @Input() schema: ComponentConfig[] = [];
  generatedCode: string = '';

  constructor(private generator: CodeGeneratorService) {}

  ngOnChanges(): void {
    this.generatedCode = this.generator.generateHTML(this.schema);
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedCode);
    alert('Code copied to clipboard!');
  }
}
