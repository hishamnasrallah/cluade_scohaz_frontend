// src/app/builder/components/canvas/canvas.component.ts

import { Component } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop, CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { ComponentConfig } from '../../models/component-config.model';
import {NgForOf, NgIf} from '@angular/common';
import {DynamicRendererComponent} from '../dynamic-renderer/dynamic-renderer.component';
import {ConfigPanelComponent} from '../config-panel/config-panel.component';
import { SchemaStorageService } from '../../services/schema-storage.service';
import {MatButton} from '@angular/material/button';
import {CodePreviewComponent} from '../code-preview/code-preview.component';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    NgForOf,
    CdkDropList,
    DynamicRendererComponent,
    ConfigPanelComponent,
    MatButton,
    CodePreviewComponent,
    NgIf
  ],
  styleUrls: ['./canvas.component.scss']
})

export class CanvasComponent {

// Inject into constructor
  constructor(private storage: SchemaStorageService) {}

  saveSchema(): void {
    this.storage.saveSchema(this.droppedComponents);
  }

  loadSchema(): void {
    this.droppedComponents = this.storage.loadSchema();
  }

  clearCanvas(): void {
    this.droppedComponents = [];
    this.storage.clearSchema();
    this.selectedComponent = undefined;
  }

  droppedComponents: ComponentConfig[] = [];

  // Handle drop event from palette
  onDrop(event: CdkDragDrop<ComponentConfig[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.droppedComponents, event.previousIndex, event.currentIndex);
    } else {
      const component = event.previousContainer.data[event.previousIndex];
      this.droppedComponents.splice(event.currentIndex, 0, { ...component }); // deep copy
    }
  }
  // Add to existing CanvasComponent

  selectedComponent?: ComponentConfig;

  selectComponent(comp: ComponentConfig): void {
    this.selectedComponent = comp;
  }

}
