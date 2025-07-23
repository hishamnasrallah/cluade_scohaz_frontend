// src/app/components/inquiry/components/data-visualizer/data-visualizer.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicColumn } from '../../../../models/inquiry-execution.models';

@Component({
  selector: 'app-data-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-visualizer">
      <p>Data visualization component - Coming soon</p>
    </div>
  `,
  styles: [`
    .data-visualizer {
      padding: 24px;
      text-align: center;
      color: #666;
    }
  `]
})
export class DataVisualizerComponent {
  @Input() data: any[] = [];
  @Input() columns: DynamicColumn[] = [];
  @Input() visualizations: any[] = [];
  @Output() configChange = new EventEmitter<any>();
}
