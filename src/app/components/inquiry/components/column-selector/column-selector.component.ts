// src/app/components/inquiry/components/column-selector/column-selector.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="column-selector">
      <p>Column selector component - Coming soon</p>
    </div>
  `,
  styles: [`
    .column-selector {
      padding: 24px;
    }
  `]
})
export class ColumnSelectorComponent {
  @Input() columns: any[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();
}
