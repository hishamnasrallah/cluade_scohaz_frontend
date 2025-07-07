// src/app/components/template-builder/template-drag-drop/template-drag-drop.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule, CdkDrag } from '@angular/cdk/drag-drop';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  PDFTemplate,
  PDFTemplateElement,
  ElementType,
  DesignerData,
  ElementPosition,
  DragData,
  BuilderState
} from '../../../models/pdf-template.models';
import { PDFTemplateService } from '../../../services/pdf-template.service';

interface PaletteItem {
  type: ElementType;
  label: string;
  icon: string;
  category: 'basic' | 'dynamic' | 'layout' | 'special';
}

@Component({
  selector: 'app-template-drag-drop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule,
    MatMenuModule,
    MatSliderModule,
    MatRadioModule,
    MatDialogModule,
    MatSnackBarModule
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
            [(value)]="zoom"
            (input)="onZoomChange($event)"
            class="zoom-slider">
          </mat-slider>
          <span class="zoom-label">{{ zoom }}%</span>
        </div>
        <div class="toolbar-right">
          <button mat-button (click)="configureTemplate()">
            <mat-icon>settings</mat-icon>
            Configure
          </button>
          <button mat-button (click)="previewTemplate()">
            <mat-icon>visibility</mat-icon>
            Preview
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

          <mat-tab-group>
            <!-- Basic Elements -->
            <mat-tab label="Basic">
              <div class="palette-grid">
                <div
                  *ngFor="let item of getPaletteItems('basic')"
                  class="palette-item"
                  [cdkDrag]="true"
                  [cdkDragData]="{ elementType: item.type, isNew: true }"
                  (cdkDragStarted)="onDragStarted($event)">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </mat-tab>

            <!-- Dynamic Elements -->
            <mat-tab label="Dynamic">
              <div class="palette-grid">
                <div
                  *ngFor="let item of getPaletteItems('dynamic')"
                  class="palette-item"
                  [cdkDrag]="true"
                  [cdkDragData]="{ elementType: item.type, isNew: true }"
                  (cdkDragStarted)="onDragStarted($event)">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </mat-tab>

            <!-- Layout Elements -->
            <mat-tab label="Layout">
              <div class="palette-grid">
                <div
                  *ngFor="let item of getPaletteItems('layout')"
                  class="palette-item"
                  [cdkDrag]="true"
                  [cdkDragData]="{ elementType: item.type, isNew: true }"
                  (cdkDragStarted)="onDragStarted($event)">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </mat-tab>

            <!-- Special Elements -->
            <mat-tab label="Special">
              <div class="palette-grid">
                <div
                  *ngFor="let item of getPaletteItems('special')"
                  class="palette-item"
                  [cdkDrag]="true"
                  [cdkDragData]="{ elementType: item.type, isNew: true }"
                  (cdkDragStarted)="onDragStarted($event)">
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span>{{ item.label }}</span>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-sidenav>

        <!-- Canvas Area -->
        <mat-sidenav-content class="canvas-container">
          <div class="canvas-wrapper" [style.transform]="'scale(' + zoom / 100 + ')'">
            <div
              class="design-canvas"
              cdkDropList
              [cdkDropListData]="elements"
              (cdkDropListDropped)="onDrop($event)"
              [style.width.px]="canvasWidth"
              [style.height.px]="canvasHeight"
              [class.show-grid]="showGrid"
              [style.background-size.px]="gridSize"
              (click)="onCanvasClick($event)">

              <!-- Grid Lines (visual only) -->
              <svg *ngIf="showGrid" class="grid-overlay" [attr.width]="canvasWidth" [attr.height]="canvasHeight">
                <defs>
                  <pattern id="grid" [attr.width]="gridSize" [attr.height]="gridSize" patternUnits="userSpaceOnUse">
                    <path [attr.d]="'M ' + gridSize + ' 0 L 0 0 0 ' + gridSize"
                          fill="none" stroke="#e5e7eb" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              <!-- Page margins indicator -->
              <div class="page-margins"
                   [style.top.px]="template?.margin_top || 72"
                   [style.bottom.px]="template?.margin_bottom || 72"
                   [style.left.px]="template?.margin_left || 72"
                   [style.right.px]="template?.margin_right || 72">
              </div>

              <!-- Template Elements -->
              <div
                *ngFor="let element of elements; let i = index"
                class="template-element"
                [class.selected]="selectedElement === element"
                [style.left.px]="element.x_position"
                [style.top.px]="element.y_position"
                [style.width.px]="element.width || 'auto'"
                [style.height.px]="element.height || 'auto'"
                [style.transform]="'rotate(' + (element.rotation || 0) + 'deg)'"
                [style.z-index]="element.z_index"
                cdkDrag
                [cdkDragData]="{ element: element, isNew: false }"
                (cdkDragStarted)="onElementDragStarted($event, element)"
                (cdkDragEnded)="onElementDragEnded($event, element)"
                (click)="selectElement(element, $event)">

                <!-- Element Content -->
                <div class="element-content" [ngSwitch]="element.element_type">
                  <!-- Text Element -->
                  <div *ngSwitchCase="'text'" class="text-element"
                       [style.font-family]="element.font_family"
                       [style.font-size.px]="element.font_size"
                       [style.color]="element.font_color"
                       [style.font-weight]="element.is_bold ? 'bold' : 'normal'"
                       [style.font-style]="element.is_italic ? 'italic' : 'normal'"
                       [style.text-decoration]="element.is_underline ? 'underline' : 'none'"
                       [style.text-align]="element.text_align"
                       [style.line-height]="element.line_height">
                    {{ element.text_content || 'Text Element' }}
                  </div>

                  <!-- Dynamic Text Element -->
                  <div *ngSwitchCase="'dynamic_text'" class="dynamic-text-element"
                       [style.font-family]="element.font_family"
                       [style.font-size.px]="element.font_size"
                       [style.color]="element.font_color">
                    <mat-icon class="dynamic-icon">code</mat-icon>
                    {{ element.data_source || '{{variable}}' }}
                  </div>

                  <!-- Image Element -->
                  <div *ngSwitchCase="'image'" class="image-element">
                    <mat-icon>image</mat-icon>
                    <span>Image: {{ element.image_source || 'No source' }}</span>
                  </div>

                  <!-- Line Element -->
                  <svg *ngSwitchCase="'line'" class="line-element"
                       [attr.width]="element.width || 100"
                       [attr.height]="element.height || 1">
                    <line x1="0" y1="0"
                          [attr.x2]="element.width || 100"
                          [attr.y2]="element.height || 0"
                          [attr.stroke]="element.stroke_color"
                          [attr.stroke-width]="element.stroke_width" />
                  </svg>

                  <!-- Rectangle Element -->
                  <div *ngSwitchCase="'rectangle'" class="shape-element"
                       [style.background-color]="element.fill_color || 'transparent'"
                       [style.border]="element.stroke_width + 'px solid ' + element.stroke_color">
                  </div>

                  <!-- Table Element -->
                  <div *ngSwitchCase="'table'" class="table-element">
                    <mat-icon>table_chart</mat-icon>
                    <span>Table</span>
                  </div>

                  <!-- Default -->
                  <div *ngSwitchDefault class="unknown-element">
                    <mat-icon>help_outline</mat-icon>
                    <span>{{ element.element_type }}</span>
                  </div>
                </div>

                <!-- Resize Handles -->
                <div class="resize-handles" *ngIf="selectedElement === element">
                  <div class="resize-handle top-left" (mousedown)="startResize($event, element, 'top-left')"></div>
                  <div class="resize-handle top-right" (mousedown)="startResize($event, element, 'top-right')"></div>
                  <div class="resize-handle bottom-left" (mousedown)="startResize($event, element, 'bottom-left')"></div>
                  <div class="resize-handle bottom-right" (mousedown)="startResize($event, element, 'bottom-right')"></div>
                </div>

                <!-- Element Actions -->
                <div class="element-actions" *ngIf="selectedElement === element">
                  <button mat-icon-button [matMenuTriggerFor]="elementMenu" class="element-menu-btn">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #elementMenu="matMenu">
                    <button mat-menu-item (click)="duplicateElement(element)">
                      <mat-icon>content_copy</mat-icon>
                      <span>Duplicate</span>
                    </button>
                    <button mat-menu-item (click)="bringToFront(element)">
                      <mat-icon>flip_to_front</mat-icon>
                      <span>Bring to Front</span>
                    </button>
                    <button mat-menu-item (click)="sendToBack(element)">
                      <mat-icon>flip_to_back</mat-icon>
                      <span>Send to Back</span>
                    </button>
                    <mat-divider></mat-divider>
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
        <mat-sidenav mode="side" opened position="end" class="properties-panel" #propertiesDrawer>
          <div class="panel-header">
            <h3>Properties</h3>
          </div>

          <div class="properties-content" *ngIf="selectedElement">
            <form [formGroup]="propertiesForm">
              <!-- Common Properties -->
              <mat-expansion-panel expanded>
                <mat-expansion-panel-header>
                  <mat-panel-title>General</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="property-group">
                  <mat-form-field appearance="outline">
                    <mat-label>Element Key</mat-label>
                    <input matInput formControlName="element_key">
                  </mat-form-field>

                  <div class="position-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>X</mat-label>
                      <input matInput type="number" formControlName="x_position">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Y</mat-label>
                      <input matInput type="number" formControlName="y_position">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Width</mat-label>
                      <input matInput type="number" formControlName="width">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Height</mat-label>
                      <input matInput type="number" formControlName="height">
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Rotation (degrees)</mat-label>
                    <input matInput type="number" formControlName="rotation">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Z-Index</mat-label>
                    <input matInput type="number" formControlName="z_index">
                  </mat-form-field>
                </div>
              </mat-expansion-panel>

              <!-- Text Properties -->
              <mat-expansion-panel *ngIf="isTextElement(selectedElement)">
                <mat-expansion-panel-header>
                  <mat-panel-title>Text Properties</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="property-group">
                  <mat-form-field appearance="outline" *ngIf="selectedElement.element_type === 'text'">
                    <mat-label>Text Content</mat-label>
                    <textarea matInput formControlName="text_content" rows="3"></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" *ngIf="selectedElement.element_type === 'dynamic_text'">
                    <mat-label>Data Source</mat-label>
                    <input matInput formControlName="data_source" placeholder="e.g., user.name">
                    <mat-hint>Use dot notation for nested values</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Font Family</mat-label>
                    <mat-select formControlName="font_family">
                      <mat-option *ngFor="let font of designerData?.fonts" [value]="font.value">
                        {{ font.label }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Font Size</mat-label>
                    <input matInput type="number" formControlName="font_size">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Font Color</mat-label>
                    <input matInput type="color" formControlName="font_color">
                  </mat-form-field>

                  <div class="text-style-options">
                    <mat-checkbox formControlName="is_bold">Bold</mat-checkbox>
                    <mat-checkbox formControlName="is_italic">Italic</mat-checkbox>
                    <mat-checkbox formControlName="is_underline">Underline</mat-checkbox>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Text Align</mat-label>
                    <mat-select formControlName="text_align">
                      <mat-option *ngFor="let align of designerData?.text_aligns" [value]="align.value">
                        {{ align.label }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Line Height</mat-label>
                    <input matInput type="number" step="0.1" formControlName="line_height">
                  </mat-form-field>
                </div>
              </mat-expansion-panel>

              <!-- Shape Properties -->
              <mat-expansion-panel *ngIf="isShapeElement(selectedElement)">
                <mat-expansion-panel-header>
                  <mat-panel-title>Shape Properties</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="property-group">
                  <mat-form-field appearance="outline">
                    <mat-label>Fill Color</mat-label>
                    <input matInput type="color" formControlName="fill_color">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Stroke Color</mat-label>
                    <input matInput type="color" formControlName="stroke_color">
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Stroke Width</mat-label>
                    <input matInput type="number" formControlName="stroke_width">
                  </mat-form-field>
                </div>
              </mat-expansion-panel>

              <!-- Image Properties -->
              <mat-expansion-panel *ngIf="selectedElement.element_type === 'image' || selectedElement.element_type === 'dynamic_image'">
                <mat-expansion-panel-header>
                  <mat-panel-title>Image Properties</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="property-group">
                  <mat-form-field appearance="outline">
                    <mat-label>Image Source</mat-label>
                    <input matInput formControlName="image_source"
                           [placeholder]="selectedElement.element_type === 'dynamic_image' ? 'e.g., user.profile_image' : 'URL or path'">
                  </mat-form-field>

                  <mat-checkbox formControlName="maintain_aspect_ratio">
                    Maintain Aspect Ratio
                  </mat-checkbox>
                </div>
              </mat-expansion-panel>

              <!-- Advanced Properties -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Advanced</mat-panel-title>
                </mat-expansion-panel-header>

                <div class="property-group">
                  <mat-form-field appearance="outline">
                    <mat-label>Display Condition</mat-label>
                    <input matInput formControlName="condition"
                           placeholder="e.g., user.is_active">
                    <mat-hint>Leave empty to always show</mat-hint>
                  </mat-form-field>

                  <mat-checkbox formControlName="is_repeatable">
                    Repeat on every page
                  </mat-checkbox>

                  <mat-form-field appearance="outline">
                    <mat-label>Page Number</mat-label>
                    <input matInput type="number" formControlName="page_number">
                    <mat-hint>Leave empty for all pages</mat-hint>
                  </mat-form-field>
                </div>
              </mat-expansion-panel>
            </form>
          </div>

          <div class="no-selection" *ngIf="!selectedElement">
            <mat-icon>info</mat-icon>
            <p>Select an element to view its properties</p>
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
      background: #f8fafb;
    }

    /* Toolbar */
    .designer-toolbar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 8px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
      color: #6b7280;
      min-width: 40px;
    }

    button.active {
      color: #34c5aa;
      background: rgba(52, 197, 170, 0.1);
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
      border: none;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    /* Palette */
    .palette-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 16px;
    }

    .palette-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      cursor: move;
      transition: all 0.2s ease;

      &:hover {
        background: #f9fafb;
        border-color: #34c5aa;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
        color: #6b7280;
      }

      span {
        display: block;
        font-size: 0.75rem;
        color: #4b5563;
      }
    }

    /* Canvas */
    .canvas-container {
      background: #e5e7eb;
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;

      &.show-grid {
        background-image:
          repeating-linear-gradient(0deg, #f3f4f6 0px, transparent 1px, transparent 20px, #f3f4f6 21px),
          repeating-linear-gradient(90deg, #f3f4f6 0px, transparent 1px, transparent 20px, #f3f4f6 21px);
      }
    }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .page-margins {
      position: absolute;
      border: 1px dashed #9ca3af;
      pointer-events: none;
    }

    /* Template Elements */
    .template-element {
      position: absolute;
      cursor: move;
      user-select: none;
      min-width: 20px;
      min-height: 20px;

      &:hover {
        outline: 1px solid #34c5aa;
      }

      &.selected {
        outline: 2px solid #34c5aa;
        box-shadow: 0 0 0 4px rgba(52, 197, 170, 0.1);
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
      width: 100%;
      height: 100%;
      position: relative;
    }

    /* Element Types */
    .text-element,
    .dynamic-text-element {
      padding: 4px;
      word-wrap: break-word;
    }

    .dynamic-text-element {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #f3f4f6;
      border: 1px dashed #9ca3af;
      padding: 4px 8px;
      border-radius: 4px;

      .dynamic-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #6b7280;
      }
    }

    .image-element {
      background: #f3f4f6;
      border: 1px dashed #9ca3af;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      gap: 8px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #9ca3af;
      }

      span {
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .shape-element {
      width: 100%;
      height: 100%;
    }

    .table-element {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;

      mat-icon {
        color: #6b7280;
      }
    }

    /* Resize Handles */
    .resize-handles {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      pointer-events: none;
    }

    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #34c5aa;
      border: 1px solid white;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: all;

      &.top-left { top: 0; left: 0; cursor: nw-resize; }
      &.top-right { top: 0; right: 0; cursor: ne-resize; }
      &.bottom-left { bottom: 0; left: 0; cursor: sw-resize; }
      &.bottom-right { bottom: 0; right: 0; cursor: se-resize; }
    }

    /* Element Actions */
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

    /* Properties Panel */
    .properties-content {
      padding: 16px;
    }

    .property-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px 0;
    }

    .position-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .text-style-options {
      display: flex;
      gap: 16px;
    }

    .no-selection {
      padding: 32px;
      text-align: center;
      color: #9ca3af;

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

      .mat-expansion-panel {
        box-shadow: none !important;
        border: 1px solid #e5e7eb;
        margin-bottom: 8px;
      }

      .mat-expansion-panel-header {
        height: 48px;
        padding: 0 16px;
      }

      .mat-expansion-panel-body {
        padding: 0 16px 16px;
      }

      .mat-drawer-inner-container {
        overflow: auto;
      }

      .mat-mdc-slider {
        color: #34c5aa;
      }
    }
  `]
})
export class TemplateDragDropComponent implements OnInit {
  @Input() template: PDFTemplate | null = null;
  @Output() save = new EventEmitter<PDFTemplate>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('propertiesDrawer') propertiesDrawer!: MatDrawer;

  // State
  elements: PDFTemplateElement[] = [];
  selectedElement: PDFTemplateElement | null = null;
  designerData: DesignerData | null = null;
  propertiesForm!: FormGroup;

  // UI State
  zoom = 100;
  showGrid = true;
  snapToGrid = true;
  gridSize = 20;
  canvasWidth = 595; // A4 width in points
  canvasHeight = 842; // A4 height in points

  // History
  history: PDFTemplateElement[][] = [];
  historyIndex = -1;
  maxHistorySize = 50;

  // Drag state
  isDragging = false;
  dragData: DragData | null = null;

  // Resize state
  isResizing = false;
  resizeData: any = null;

  // Palette items
  paletteItems: PaletteItem[] = [
    // Basic
    { type: 'text', label: 'Text', icon: 'text_fields', category: 'basic' },
    { type: 'image', label: 'Image', icon: 'image', category: 'basic' },
    { type: 'line', label: 'Line', icon: 'horizontal_rule', category: 'basic' },
    { type: 'rectangle', label: 'Rectangle', icon: 'rectangle', category: 'basic' },
    { type: 'circle', label: 'Circle', icon: 'circle', category: 'basic' },

    // Dynamic
    { type: 'dynamic_text', label: 'Variable', icon: 'code', category: 'dynamic' },
    { type: 'dynamic_image', label: 'Dynamic Image', icon: 'image_search', category: 'dynamic' },
    { type: 'table', label: 'Table', icon: 'table_chart', category: 'dynamic' },
    { type: 'chart', label: 'Chart', icon: 'insert_chart', category: 'dynamic' },

    // Layout
    { type: 'page_break', label: 'Page Break', icon: 'insert_page_break', category: 'layout' },
    { type: 'loop', label: 'Loop Container', icon: 'repeat', category: 'layout' },
    { type: 'conditional', label: 'Conditional', icon: 'rule', category: 'layout' },

    // Special
    { type: 'barcode', label: 'Barcode', icon: 'qr_code_2', category: 'special' },
    { type: 'qrcode', label: 'QR Code', icon: 'qr_code', category: 'special' },
    { type: 'signature', label: 'Signature', icon: 'draw', category: 'special' }
  ];

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  constructor(
    private fb: FormBuilder,
    private pdfTemplateService: PDFTemplateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.initializePropertiesForm();
  }

  ngOnInit(): void {
    this.loadDesignerData();
    if (this.template) {
      this.loadTemplate();
    }
    this.updateCanvasSize();
    this.saveToHistory();
  }

  private initializePropertiesForm(): void {
    this.propertiesForm = this.fb.group({
      element_key: [''],
      x_position: [0],
      y_position: [0],
      width: [null],
      height: [null],
      rotation: [0],
      z_index: [0],

      // Text properties
      text_content: [''],
      text_content_ara: [''],
      font_family: ['Helvetica'],
      font_size: [12],
      font_color: ['#000000'],
      is_bold: [false],
      is_italic: [false],
      is_underline: [false],
      text_align: ['left'],
      line_height: [1.2],

      // Shape properties
      fill_color: [''],
      stroke_color: ['#000000'],
      stroke_width: [1],

      // Image properties
      image_source: [''],
      maintain_aspect_ratio: [true],

      // Dynamic properties
      data_source: [''],
      condition: [''],

      // Advanced
      is_repeatable: [false],
      page_number: [null]
    });

    // Subscribe to form changes
    this.propertiesForm.valueChanges.subscribe(values => {
      if (this.selectedElement) {
        Object.assign(this.selectedElement, values);
        this.saveToHistory();
      }
    });
  }

  private loadDesignerData(): void {
    this.pdfTemplateService.getDesignerData().subscribe({
      next: (data) => {
        this.designerData = data;
      },
      error: (error) => {
        console.error('Error loading designer data:', error);
      }
    });
  }

  private loadTemplate(): void {
    if (this.template) {
      // Load template properties
      this.updateCanvasSize();

      // Load elements
      if (this.template.elements) {
        this.elements = [...this.template.elements];
      }
    }
  }

  private updateCanvasSize(): void {
    if (this.template) {
      // Calculate canvas size based on template settings
      const sizes: Record<string, [number, number]> = {
        'A4': [595, 842],
        'A3': [842, 1191],
        'letter': [612, 792],
        'legal': [612, 1008]
      };

      const [width, height] = sizes[this.template.page_size] || sizes['A4'];

      if (this.template.orientation === 'landscape') {
        this.canvasWidth = height;
        this.canvasHeight = width;
      } else {
        this.canvasWidth = width;
        this.canvasHeight = height;
      }
    }
  }

  // Palette methods
  getPaletteItems(category: string): PaletteItem[] {
    return this.paletteItems.filter(item => item.category === category);
  }

  // Drag and drop
  onDragStarted(event: any): void {
    this.isDragging = true;
  }

  onDrop(event: CdkDragDrop<PDFTemplateElement[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within canvas
      moveItemInArray(this.elements, event.previousIndex, event.currentIndex);
    } else {
      // New element from palette
      const dragData = event.item.data as DragData;
      if (dragData.isNew && dragData.elementType) {
        const newElement = this.createNewElement(dragData.elementType, event.dropPoint);
        this.elements.push(newElement);
        this.selectElement(newElement);
        this.saveToHistory();
      }
    }
    this.isDragging = false;
  }

  onElementDragStarted(event: any, element: PDFTemplateElement): void {
    this.selectElement(element);
  }

  onElementDragEnded(event: any, element: PDFTemplateElement): void {
    // Update position
    const rect = event.source.element.nativeElement.getBoundingClientRect();
    const canvasRect = event.source.element.nativeElement.parentElement.getBoundingClientRect();

    element.x_position = rect.left - canvasRect.left;
    element.y_position = rect.top - canvasRect.top;

    if (this.snapToGrid) {
      element.x_position = Math.round(element.x_position / this.gridSize) * this.gridSize;
      element.y_position = Math.round(element.y_position / this.gridSize) * this.gridSize;
    }

    this.saveToHistory();
  }

  private createNewElement(type: ElementType, position?: { x: number; y: number }): PDFTemplateElement {
    const baseElement: PDFTemplateElement = {
      element_type: type,
      element_key: `${type}_${Date.now()}`,
      x_position: position?.x || 100,
      y_position: position?.y || 100,
      z_index: this.elements.length,
      active_ind: true,

      // Defaults based on type
      font_family: 'Helvetica',
      font_size: 12,
      font_color: '#000000',
      is_bold: false,
      is_italic: false,
      is_underline: false,
      text_align: 'left',
      line_height: 1.2,
      stroke_color: '#000000',
      stroke_width: 1,
      maintain_aspect_ratio: true
    };

    // Set default sizes based on type
    switch (type) {
      case 'text':
      case 'dynamic_text':
        baseElement.width = 200;
        baseElement.height = 30;
        baseElement.text_content = 'New Text';
        break;
      case 'image':
      case 'dynamic_image':
        baseElement.width = 150;
        baseElement.height = 150;
        break;
      case 'line':
        baseElement.width = 200;
        baseElement.height = 1;
        break;
      case 'rectangle':
      case 'circle':
        baseElement.width = 100;
        baseElement.height = 100;
        break;
      case 'table':
        baseElement.width = 400;
        baseElement.height = 200;
        baseElement.table_config = {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          columns: ['field1', 'field2', 'field3']
        };
        break;
      case 'page_break':
        baseElement.width = this.canvasWidth - 40;
        baseElement.height = 2;
        break;
    }

    return baseElement;
  }

  // Selection
  selectElement(element: PDFTemplateElement | null, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.selectedElement = element;

    if (element && this.propertiesForm) {
      // Update properties form
      this.propertiesForm.patchValue(element, { emitEvent: false });
    }
  }

  onCanvasClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('design-canvas')) {
      this.selectElement(null);
    }
  }

  // Element operations
  duplicateElement(element: PDFTemplateElement): void {
    const duplicate = { ...element };
    duplicate.element_key = `${element.element_key}_copy_${Date.now()}`;
    duplicate.x_position += 20;
    duplicate.y_position += 20;
    duplicate.z_index = this.elements.length;

    this.elements.push(duplicate);
    this.selectElement(duplicate);
    this.saveToHistory();
  }

  deleteElement(element: PDFTemplateElement): void {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
      this.selectElement(null);
      this.saveToHistory();
    }
  }

  bringToFront(element: PDFTemplateElement): void {
    const maxZ = Math.max(...this.elements.map(e => e.z_index), 0);
    element.z_index = maxZ + 1;
    this.saveToHistory();
  }

  sendToBack(element: PDFTemplateElement): void {
    const minZ = Math.min(...this.elements.map(e => e.z_index), 0);
    element.z_index = minZ - 1;
    this.saveToHistory();
  }

  // Resize
  startResize(event: MouseEvent, element: PDFTemplateElement, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeData = {
      element,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: element.width || 0,
      startHeight: element.height || 0,
      startLeft: element.x_position,
      startTop: element.y_position
    };

    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  }

  private onResize = (event: MouseEvent): void => {
    if (!this.isResizing || !this.resizeData) return;

    const dx = event.clientX - this.resizeData.startX;
    const dy = event.clientY - this.resizeData.startY;
    const element = this.resizeData.element;

    switch (this.resizeData.handle) {
      case 'top-left':
        element.width = Math.max(20, this.resizeData.startWidth - dx);
        element.height = Math.max(20, this.resizeData.startHeight - dy);
        element.x_position = this.resizeData.startLeft + dx;
        element.y_position = this.resizeData.startTop + dy;
        break;
      case 'top-right':
        element.width = Math.max(20, this.resizeData.startWidth + dx);
        element.height = Math.max(20, this.resizeData.startHeight - dy);
        element.y_position = this.resizeData.startTop + dy;
        break;
      case 'bottom-left':
        element.width = Math.max(20, this.resizeData.startWidth - dx);
        element.height = Math.max(20, this.resizeData.startHeight + dy);
        element.x_position = this.resizeData.startLeft + dx;
        break;
      case 'bottom-right':
        element.width = Math.max(20, this.resizeData.startWidth + dx);
        element.height = Math.max(20, this.resizeData.startHeight + dy);
        break;
    }

    this.propertiesForm.patchValue({
      x_position: element.x_position,
      y_position: element.y_position,
      width: element.width,
      height: element.height
    }, { emitEvent: false });
  };

  private stopResize = (): void => {
    this.isResizing = false;
    this.resizeData = null;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
    this.saveToHistory();
  };

  // Toolbar actions
  toggleGrid(): void {
    this.showGrid = !this.showGrid;
  }

  toggleSnap(): void {
    this.snapToGrid = !this.snapToGrid;
  }

  onZoomChange(event: any): void {
    this.zoom = event.value;
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
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add current state
    this.history.push([...this.elements]);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  // Type guards
  isTextElement(element: PDFTemplateElement): boolean {
    return element.element_type === 'text' || element.element_type === 'dynamic_text';
  }

  isShapeElement(element: PDFTemplateElement): boolean {
    return ['line', 'rectangle', 'circle'].includes(element.element_type);
  }

  // Actions
  configureTemplate(): void {
    // TODO: Open template configuration dialog
    console.log('Configure template');
  }

  previewTemplate(): void {
    // TODO: Open preview dialog
    console.log('Preview template');
  }

  saveTemplate(): void {
    const template: PDFTemplate = {
      ...this.template!,
      elements: this.elements,
      // Additional properties would be set via configuration dialog
    };

    this.save.emit(template);
  }
}
