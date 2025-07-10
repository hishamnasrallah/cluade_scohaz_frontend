// src/app/components/simple-pdf/simple-template-drag-drop/simple-template-drag-drop.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule, CdkDrag } from '@angular/cdk/drag-drop';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  SimplePDFTemplate,
  SimplePDFElement,
  ContentType,
  BulkCreateRequest
} from '../../../models/simple-pdf.models';
import { SimplePDFService } from '../../../services/simple-pdf.service';

interface DesignElement extends SimplePDFElement {
  id?: number;
  tempId?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-simple-template-drag-drop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    CdkDrag,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatSliderModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <div class="designer-container">
      <!-- Toolbar -->
      <div class="designer-toolbar">
        <div class="toolbar-left">
          <button mat-icon-button (click)="undo()" [disabled]="!canUndo" matTooltip="Undo">
            <mat-icon>undo</mat-icon>
          </button>
          <button mat-icon-button (click)="redo()" [disabled]="!canRedo" matTooltip="Redo">
            <mat-icon>redo</mat-icon>
          </button>
          <mat-divider vertical></mat-divider>
          <button mat-icon-button (click)="toggleGrid()" [class.active]="showGrid" matTooltip="Toggle Grid">
            <mat-icon>grid_on</mat-icon>
          </button>
          <button mat-icon-button (click)="toggleSnap()" [class.active]="snapToGrid" matTooltip="Snap to Grid">
            <mat-icon>grid_4x4</mat-icon>
          </button>
          <mat-divider vertical></mat-divider>
          <mat-slider
            min="50"
            max="200"
            step="10"
            [(ngModel)]="zoom"
            class="zoom-slider">
          </mat-slider>
          <span class="zoom-label">{{ zoom }}%</span>
        </div>
        <div class="toolbar-right">
          <button mat-button (click)="configureTemplate()">
            <mat-icon>settings</mat-icon>
            Configure
          </button>
          <button mat-raised-button color="primary" (click)="saveTemplate()">
            <mat-icon>save</mat-icon>
            Save Template
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <mat-sidenav-container class="designer-content">
        <!-- Left Panel - Element Palette -->
        <mat-sidenav mode="side" opened position="start" class="palette-panel">
          <div class="panel-header">
            <h3>Elements</h3>
          </div>

          <div class="palette-content">
            <button mat-raised-button class="palette-item" (click)="addTextElement(false)">
              <mat-icon>text_fields</mat-icon>
              <span>Static Text</span>
            </button>

            <button mat-raised-button class="palette-item" (click)="addTextElement(true)">
              <mat-icon>code</mat-icon>
              <span>Dynamic Text</span>
            </button>

            <mat-divider></mat-divider>

            <div class="palette-info">
              <p><strong>Tips:</strong></p>
              <ul>
                <li>Click to add elements</li>
                <li>Drag elements to position</li>
                <li>Select to edit properties</li>
                <li>Right-click for options</li>
              </ul>
            </div>
          </div>
        </mat-sidenav>

        <!-- Canvas Area -->
        <mat-sidenav-content class="canvas-container">
          <div class="canvas-wrapper" [style.transform]="'scale(' + zoom / 100 + ')'">
            <div
              class="design-canvas"
              [style.width.px]="canvasWidth"
              [style.height.px]="canvasHeight"
              [class.show-grid]="showGrid"
              (click)="onCanvasClick($event)">

              <!-- Grid Lines -->
              <svg *ngIf="showGrid" class="grid-overlay" [attr.width]="canvasWidth" [attr.height]="canvasHeight">
                <defs>
                  <pattern id="grid" [attr.width]="gridSize" [attr.height]="gridSize" patternUnits="userSpaceOnUse">
                    <path [attr.d]="'M ' + gridSize + ' 0 L 0 0 0 ' + gridSize"
                          fill="none" stroke="#e0e0e0" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              <!-- Elements -->
              <div
                *ngFor="let element of elements"
                class="template-element"
                [class.selected]="element.selected"
                [style.left.px]="element.x_position"
                [style.top.px]="element.y_position"
                [style.font-size.px]="element.font_size"
                cdkDrag
                [cdkDragBoundary]="'.design-canvas'"
                (cdkDragEnded)="onElementDragEnded($event, element)"
                (click)="selectElement(element, $event)"
                (contextmenu)="onElementRightClick($event, element)">

                <div class="element-content">
                  <mat-icon *ngIf="element.is_dynamic" class="dynamic-icon">code</mat-icon>
                  <span>{{ getElementDisplay(element) }}</span>
                </div>

                <!-- Element Actions -->
                <div class="element-actions" *ngIf="element.selected">
                  <button mat-icon-button [matMenuTriggerFor]="elementMenu" class="element-menu-btn">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #elementMenu="matMenu">
                    <button mat-menu-item (click)="duplicateElement(element)">
                      <mat-icon>content_copy</mat-icon>
                      <span>Duplicate</span>
                    </button>
                    <button mat-menu-item (click)="deleteElement(element)" color="warn">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </div>
          </div>
        </mat-sidenav-content>

        <!-- Right Panel - Properties -->
        <mat-sidenav mode="side" opened position="end" class="properties-panel">
          <div class="panel-header">
            <h3>Properties</h3>
          </div>

          <div class="properties-content" *ngIf="selectedElement">
            <form [formGroup]="propertiesForm">
              <!-- Position -->
              <h4>Position</h4>
              <div class="position-grid">
                <mat-form-field appearance="outline">
                  <mat-label>X</mat-label>
                  <input matInput type="number" formControlName="x_position">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Y</mat-label>
                  <input matInput type="number" formControlName="y_position">
                </mat-form-field>
              </div>

              <!-- Appearance -->
              <h4>Appearance</h4>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Font Size</mat-label>
                <input matInput type="number" formControlName="font_size">
              </mat-form-field>

              <!-- Content -->
              <h4>Content</h4>
              <mat-checkbox formControlName="is_dynamic" class="dynamic-checkbox">
                Dynamic Content
              </mat-checkbox>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Text Content</mat-label>
                <textarea matInput formControlName="text_content" rows="3"
                          [placeholder]="propertiesForm.get('is_dynamic')?.value ?
                            'e.g., user.email' : 'Static text'">
                </textarea>
                <mat-hint *ngIf="propertiesForm.get('is_dynamic')?.value">
                  Use dot notation for fields (e.g., user.name, order.total)
                </mat-hint>
              </mat-form-field>
            </form>
          </div>

          <div class="no-selection" *ngIf="!selectedElement">
            <mat-icon>info</mat-icon>
            <p>Select an element to view its properties</p>
          </div>

          <!-- Template Settings -->
          <mat-divider></mat-divider>
          <div class="template-settings">
            <h4>Template Settings</h4>
            <form [formGroup]="templateForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Page Size</mat-label>
                <mat-select formControlName="page_size" (selectionChange)="updateCanvasSize()">
                  <mat-option value="A4">A4</mat-option>
                  <mat-option value="letter">Letter</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Content Type</mat-label>
                <mat-select formControlName="content_type">
                  <mat-option [value]="null">None</mat-option>
                  <mat-option *ngFor="let ct of contentTypes" [value]="ct.id">
                    {{ ct.app_label }}.{{ ct.model }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </form>
          </div>
        </mat-sidenav>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .designer-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    /* Toolbar */
    .designer-toolbar {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .zoom-slider {
      width: 120px;
      margin: 0 8px;
    }

    .zoom-label {
      font-size: 0.875rem;
      color: #666;
      min-width: 40px;
    }

    button.active {
      color: #1976d2;
      background: rgba(25, 118, 210, 0.1);
    }

    /* Main Content */
    .designer-content {
      flex: 1;
      overflow: hidden;
    }

    /* Panels */
    .palette-panel,
    .properties-panel {
      width: 280px;
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 500;
    }

    /* Palette */
    .palette-content {
      padding: 16px;
    }

    .palette-item {
      width: 100%;
      margin-bottom: 12px;
      justify-content: flex-start;

      mat-icon {
        margin-right: 8px;
      }
    }

    .palette-info {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 4px;

      p {
        margin: 0 0 8px 0;
        font-weight: 500;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        font-size: 0.875rem;
        color: #666;
      }
    }

    /* Canvas */
    .canvas-container {
      background: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;
      padding: 40px;
    }

    .canvas-wrapper {
      transform-origin: center center;
      transition: transform 0.2s ease;
    }

    .design-canvas {
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;

      &.show-grid {
        background-image:
          repeating-linear-gradient(0deg, #f5f5f5 0px, transparent 1px, transparent 20px, #f5f5f5 21px),
          repeating-linear-gradient(90deg, #f5f5f5 0px, transparent 1px, transparent 20px, #f5f5f5 21px);
      }
    }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    /* Elements */
    .template-element {
      position: absolute;
      cursor: move;
      user-select: none;
      padding: 4px 8px;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(25, 118, 210, 0.05);
        border-color: #1976d2;
      }

      &.selected {
        background: rgba(25, 118, 210, 0.1);
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
      }

      &.cdk-drag-preview {
        opacity: 0.8;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      &.cdk-drag-placeholder {
        opacity: 0.5;
      }
    }

    .element-content {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dynamic-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
    }

    .element-actions {
      position: absolute;
      top: -36px;
      right: 0;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .element-menu-btn {
      width: 32px;
      height: 32px;
    }

    /* Properties */
    .properties-content,
    .template-settings {
      padding: 16px;
    }

    .properties-content h4,
    .template-settings h4 {
      margin: 16px 0 8px 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: #666;

      &:first-child {
        margin-top: 0;
      }
    }

    .position-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .dynamic-checkbox {
      margin-bottom: 16px;
    }

    .no-selection {
      padding: 32px;
      text-align: center;
      color: #999;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
    }

    /* Material Overrides */
    ::ng-deep {
      .mat-mdc-form-field {
        width: 100%;
      }

      .mat-drawer-inner-container {
        overflow: auto;
      }

      .mat-mdc-slider {
        color: #1976d2;
      }
    }
  `]
})
export class SimpleTemplateDragDropComponent implements OnInit {
  @Input() template: SimplePDFTemplate | null = null;
  @Output() save = new EventEmitter<BulkCreateRequest>();
  @Output() cancel = new EventEmitter<void>();

  // State
  elements: DesignElement[] = [];
  selectedElement: DesignElement | null = null;
  contentTypes: ContentType[] = [];

  // Forms
  templateForm!: FormGroup;
  propertiesForm!: FormGroup;

  // UI State
  zoom = 100;
  showGrid = true;
  snapToGrid = true;
  gridSize = 20;
  canvasWidth = 595; // A4 width in points
  canvasHeight = 842; // A4 height in points

  // History
  history: DesignElement[][] = [];
  historyIndex = -1;

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  constructor(
    private fb: FormBuilder,
    private simplePdfService: SimplePDFService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadContentTypes();
    if (this.template) {
      this.loadTemplate();
    }
    this.updateCanvasSize();
    this.saveToHistory();
  }

  private initializeForms(): void {
    // Template form
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      page_size: ['A4'],
      content_type: [null],
      query_filter: [{}],
      active: [true]
    });

    // Properties form
    this.propertiesForm = this.fb.group({
      x_position: [0],
      y_position: [0],
      text_content: [''],
      is_dynamic: [false],
      font_size: [12]
    });

    // Subscribe to form changes
    this.propertiesForm.valueChanges.subscribe(values => {
      if (this.selectedElement) {
        Object.assign(this.selectedElement, values);
        this.saveToHistory();
      }
    });
  }

  private loadContentTypes(): void {
    this.simplePdfService.getContentTypes().subscribe({
      next: (types) => {
        this.contentTypes = types;
      },
      error: (error) => {
        console.error('Error loading content types:', error);
      }
    });
  }

  private loadTemplate(): void {
    if (!this.template) return;

    // Load template settings
    this.templateForm.patchValue({
      name: this.template.name,
      code: this.template.code,
      page_size: this.template.page_size,
      content_type: this.template.content_type,
      query_filter: this.template.query_filter,
      active: this.template.active
    });

    // Load elements
    if (this.template.elements) {
      this.elements = this.template.elements.map(el => ({
        ...el,
        tempId: `el_${Date.now()}_${Math.random()}`
      }));
    }
  }

  updateCanvasSize(): void {
    const pageSize = this.templateForm.get('page_size')?.value;
    if (pageSize === 'letter') {
      this.canvasWidth = 612;
      this.canvasHeight = 792;
    } else {
      this.canvasWidth = 595;
      this.canvasHeight = 842;
    }
  }

  // Element management
  addTextElement(isDynamic: boolean): void {
    const newElement: DesignElement = {
      tempId: `el_${Date.now()}`,
      x_position: 100,
      y_position: 100 + (this.elements.length * 30),
      text_content: isDynamic ? 'field.name' : 'New Text',
      is_dynamic: isDynamic,
      font_size: 12,
      selected: true
    };

    // Apply snap to grid
    if (this.snapToGrid) {
      newElement.x_position = Math.round(newElement.x_position / this.gridSize) * this.gridSize;
      newElement.y_position = Math.round(newElement.y_position / this.gridSize) * this.gridSize;
    }

    // Deselect all elements
    this.elements.forEach(el => el.selected = false);

    this.elements.push(newElement);
    this.selectElement(newElement);
    this.saveToHistory();
  }

  selectElement(element: DesignElement | null, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    // Deselect all
    this.elements.forEach(el => el.selected = false);

    if (element) {
      element.selected = true;
      this.selectedElement = element;

      // Update properties form
      this.propertiesForm.patchValue({
        x_position: element.x_position,
        y_position: element.y_position,
        text_content: element.text_content,
        is_dynamic: element.is_dynamic,
        font_size: element.font_size
      }, { emitEvent: false });
    } else {
      this.selectedElement = null;
    }
  }

  onCanvasClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('design-canvas')) {
      this.selectElement(null);
    }
  }

  onElementDragEnded(event: any, element: DesignElement): void {
    const position = event.source.getFreeDragPosition();

    element.x_position += position.x / (this.zoom / 100);
    element.y_position += position.y / (this.zoom / 100);

    // Apply snap to grid
    if (this.snapToGrid) {
      element.x_position = Math.round(element.x_position / this.gridSize) * this.gridSize;
      element.y_position = Math.round(element.y_position / this.gridSize) * this.gridSize;
    }

    // Keep within bounds
    element.x_position = Math.max(0, Math.min(element.x_position, this.canvasWidth - 100));
    element.y_position = Math.max(0, Math.min(element.y_position, this.canvasHeight - 20));

    // Update properties form if selected
    if (this.selectedElement === element) {
      this.propertiesForm.patchValue({
        x_position: element.x_position,
        y_position: element.y_position
      }, { emitEvent: false });
    }

    // Reset position
    event.source.reset();
    this.saveToHistory();
  }

  onElementRightClick(event: MouseEvent, element: DesignElement): void {
    event.preventDefault();
    this.selectElement(element);
  }

  duplicateElement(element: DesignElement): void {
    const duplicate: DesignElement = {
      ...element,
      tempId: `el_${Date.now()}`,
      id: undefined,
      x_position: element.x_position + 20,
      y_position: element.y_position + 20,
      selected: true
    };

    // Deselect all
    this.elements.forEach(el => el.selected = false);

    this.elements.push(duplicate);
    this.selectElement(duplicate);
    this.saveToHistory();
  }

  deleteElement(element: DesignElement): void {
    const index = this.elements.findIndex(el => el.tempId === element.tempId);
    if (index > -1) {
      this.elements.splice(index, 1);
      if (this.selectedElement === element) {
        this.selectElement(null);
      }
      this.saveToHistory();
    }
  }

  getElementDisplay(element: DesignElement): string {
    if (element.is_dynamic) {
      return `{{ ${element.text_content} }}`;
    }
    return element.text_content;
  }

  // Toolbar actions
  toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  toggleSnap(): void {
    this.snapToGrid = !this.snapToGrid;
  }

  undo(): void {
    if (this.canUndo) {
      this.historyIndex--;
      this.elements = [...this.history[this.historyIndex]];
      this.selectElement(null);
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.historyIndex++;
      this.elements = [...this.history[this.historyIndex]];
      this.selectElement(null);
    }
  }

  private saveToHistory(): void {
    // Remove future history
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add current state
    this.history.push(this.elements.map(el => ({ ...el, selected: false })));

    // Limit history
    if (this.history.length > 50) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  configureTemplate(): void {
    // Could open a dialog for template configuration
    this.snackBar.open('Use the properties panel to configure the template', 'Close', { duration: 2000 });
  }

  saveTemplate(): void {
    if (!this.templateForm.valid) {
      this.snackBar.open('Please fill in all required template fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.elements.length === 0) {
      this.snackBar.open('Please add at least one element', 'Close', { duration: 3000 });
      return;
    }

    const templateData = this.templateForm.value;
    const elements = this.elements.map(el => ({
      x_position: el.x_position,
      y_position: el.y_position,
      text_content: el.text_content,
      is_dynamic: el.is_dynamic,
      font_size: el.font_size
    }));

    const saveData: BulkCreateRequest = {
      ...templateData,
      elements
    };

    this.save.emit(saveData);
  }
}
