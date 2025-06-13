// src/app/builder/components/canvas/canvas.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { ComponentConfig } from '../../models/component-config.model';
import { NgForOf, NgIf } from '@angular/common';
import { DynamicRendererComponent } from '../dynamic-renderer/dynamic-renderer.component';
import { ConfigPanelComponent } from '../config-panel/config-panel.component';
import { SchemaStorageService } from '../../services/schema-storage.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { CodePreviewComponent } from '../code-preview/code-preview.component';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  imports: [
    NgForOf,
    NgIf,
    CdkDropList,
    CdkDrag,
    DynamicRendererComponent,
    ConfigPanelComponent,
    MatButton,
    MatIconButton,
    CodePreviewComponent,
    MatIcon,
    MatTooltipModule
  ],
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, OnDestroy {
  droppedComponents: ComponentConfig[] = [];
  selectedComponent?: ComponentConfig;
  selectedComponentIndex?: number;
  showCodePreview: boolean = false;
  canUndo: boolean = false;
  canRedo: boolean = false;

  private destroy$ = new Subject<void>();
  private history: ComponentConfig[][] = [];
  private currentHistoryIndex: number = -1;
  private maxHistorySize: number = 50;

  constructor(
    private storage: SchemaStorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAutoSave();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle drop event from palette
  onDrop(event: CdkDragDrop<ComponentConfig[]>): void {
    console.log('Drop event:', event);
    console.log('Previous container ID:', event.previousContainer.id);
    console.log('Current container ID:', event.container.id);
    console.log('Dropped data:', event.item.data);

    if (event.previousContainer === event.container) {
      // Moving within the same container
      moveItemInArray(this.droppedComponents, event.previousIndex, event.currentIndex);
    } else {
      // Dropping from palette
      const component = event.item.data;
      const newComponent = this.createComponentInstance(component);
      this.droppedComponents.splice(event.currentIndex, 0, newComponent);
    }
    this.saveToHistory();
  }

  // Create a unique instance of the component
  private createComponentInstance(component: ComponentConfig): ComponentConfig {
    return {
      ...JSON.parse(JSON.stringify(component)),
      instanceId: `${component.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Component selection
  selectComponent(comp: ComponentConfig, index: number): void {
    this.selectedComponent = comp;
    this.selectedComponentIndex = index;
  }

  // Delete component
  deleteComponent(index: number): void {
    this.droppedComponents.splice(index, 1);
    if (this.selectedComponentIndex === index) {
      this.selectedComponent = undefined;
      this.selectedComponentIndex = undefined;
    }
    this.saveToHistory();
  }

  // Duplicate component
  duplicateComponent(index: number): void {
    const component = this.droppedComponents[index];
    const duplicate = this.createComponentInstance(component);
    this.droppedComponents.splice(index + 1, 0, duplicate);
    this.saveToHistory();
  }

  // Move component up
  moveComponentUp(index: number): void {
    if (index > 0) {
      moveItemInArray(this.droppedComponents, index, index - 1);
      this.selectedComponentIndex = index - 1;
      this.saveToHistory();
    }
  }

  // Move component down
  moveComponentDown(index: number): void {
    if (index < this.droppedComponents.length - 1) {
      moveItemInArray(this.droppedComponents, index, index + 1);
      this.selectedComponentIndex = index + 1;
      this.saveToHistory();
    }
  }

  // History management
  saveToHistory(): void {
    // Remove any history after current index
    this.history = this.history.slice(0, this.currentHistoryIndex + 1);

    // Add current state to history
    this.history.push(JSON.parse(JSON.stringify(this.droppedComponents)));

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentHistoryIndex++;
    }

    this.updateHistoryButtons();
    this.autoSave();
  }

  undo(): void {
    if (this.canUndo) {
      this.currentHistoryIndex--;
      this.droppedComponents = JSON.parse(JSON.stringify(this.history[this.currentHistoryIndex]));
      this.updateHistoryButtons();
      this.selectedComponent = undefined;
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.currentHistoryIndex++;
      this.droppedComponents = JSON.parse(JSON.stringify(this.history[this.currentHistoryIndex]));
      this.updateHistoryButtons();
      this.selectedComponent = undefined;
    }
  }

  private updateHistoryButtons(): void {
    this.canUndo = this.currentHistoryIndex > 0;
    this.canRedo = this.currentHistoryIndex < this.history.length - 1;
  }

  // Schema operations
  saveSchema(): void {
    this.storage.saveSchema(this.droppedComponents);
    this.showNotification('Schema saved successfully!', 'success');
  }

  loadSchema(): void {
    const loaded = this.storage.loadSchema();
    if (loaded.length > 0) {
      this.droppedComponents = loaded;
      this.saveToHistory();
      this.showNotification('Schema loaded successfully!', 'success');
    } else {
      this.showNotification('No saved schema found', 'info');
    }
  }

  clearCanvas(): void {
    if (this.droppedComponents.length > 0) {
      if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
        this.droppedComponents = [];
        this.selectedComponent = undefined;
        this.selectedComponentIndex = undefined;
        this.storage.clearSchema();
        this.saveToHistory();
        this.showNotification('Canvas cleared', 'info');
      }
    }
  }

  // Export/Import
  exportSchema(): void {
    const schema = JSON.stringify(this.droppedComponents, null, 2);
    const blob = new Blob([schema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `canvas-schema-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showNotification('Schema exported successfully!', 'success');
  }

  importSchema(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const schema = JSON.parse(e.target.result);
          if (Array.isArray(schema)) {
            this.droppedComponents = schema;
            this.saveToHistory();
            this.showNotification('Schema imported successfully!', 'success');
          } else {
            throw new Error('Invalid schema format');
          }
        } catch (error) {
          this.showNotification('Failed to import schema. Please check the file format.', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  // Auto-save functionality
  private setupAutoSave(): void {
    // Auto-save every 30 seconds if there are changes
    setInterval(() => {
      if (this.droppedComponents.length > 0) {
        this.autoSave();
      }
    }, 30000);
  }

  private autoSave(): void {
    localStorage.setItem('canvas_autosave', JSON.stringify(this.droppedComponents));
    localStorage.setItem('canvas_autosave_time', new Date().toISOString());
  }

  private loadAutoSave(): void {
    const autoSaved = localStorage.getItem('canvas_autosave');
    if (autoSaved) {
      const autoSaveTime = localStorage.getItem('canvas_autosave_time');
      if (autoSaveTime) {
        const timeDiff = new Date().getTime() - new Date(autoSaveTime).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // Only load autosave if less than 24 hours old
        if (hoursDiff < 24) {
          try {
            const components = JSON.parse(autoSaved);
            if (components.length > 0) {
              this.droppedComponents = components;
              this.saveToHistory();
              this.showNotification('Auto-saved canvas restored', 'info');
            }
          } catch (error) {
            console.error('Failed to load autosave:', error);
          }
        }
      }
    }
  }

  toggleCodePreview(): void {
    this.showCodePreview = !this.showCodePreview;
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`${type}-snackbar`],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
