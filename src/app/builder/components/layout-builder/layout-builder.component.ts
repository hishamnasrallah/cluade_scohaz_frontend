// src/app/builder/components/layout-builder/layout-builder.component.ts

import { Component } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { LayoutRow, LayoutColumn } from '../../models/layout.model';
import { ComponentConfig } from '../../models/component-config.model';
import {CdkDragDrop, CdkDropList, transferArrayItem} from '@angular/cdk/drag-drop';
import {MatButton, MatIconButton} from '@angular/material/button';
import {NgForOf, NgStyle} from '@angular/common';
import {DynamicRendererComponent} from '../dynamic-renderer/dynamic-renderer.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import { LayoutStorageService } from '../../services/layout-storage.service';
import {CanvasComponent} from '../canvas/canvas.component';
// import {MatIcon} from '@angular/material/icon';
import { ProjectExportService } from '../../services/project-export.service';

@Component({
  selector: 'app-layout-builder',
  templateUrl: './layout-builder.component.html',
  imports: [
    MatButton,
    NgForOf,
    NgStyle,
    CdkDropList,
    DynamicRendererComponent,
    // MatIconButton,
    MatTab,
    MatTabGroup,
    CanvasComponent,
    // MatIcon
  ],
  styleUrls: ['./layout-builder.component.scss']
})
export class LayoutBuilderComponent {
  layout: LayoutRow[] = [];
// Inject in constructor

  constructor(
    private layoutStorage: LayoutStorageService,
    private exportService: ProjectExportService
  ) {}

  exportAsJson(): void {
    const json = this.exportService.exportLayout(this.layout);
    this.exportService.downloadAsFile('layout-schema.json', json);
  }

  copyLayout(): void {
    const json = this.exportService.exportLayout(this.layout);
    this.exportService.copyToClipboard(json);
  }
  saveLayout(): void {
    this.layoutStorage.save(this.layout);
  }

  loadLayout(): void {
    this.layout = this.layoutStorage.load();
  }
  updateColumnWidth(col: LayoutColumn, width: number): void {
    col.width = width;
  }

  updateColumnPadding(col: LayoutColumn, padding: number): void {
    col.padding = padding;
  }

  clearLayout(): void {
    this.layout = [];
    this.layoutStorage.clear();
  }
  addRow(): void {
    const newRow: LayoutRow = {
      id: uuidv4(),
      columns: [
        {
          id: uuidv4(),
          width: 12,
          components: []
        }
      ]
    };
    this.layout.push(newRow);
  }

  addColumn(row: LayoutRow): void {
    if (row.columns.length >= 4) return;
    row.columns.push({
      id: uuidv4(),
      width: 12 / (row.columns.length + 1),
      components: []
    });

    // Normalize widths
    const normalizedWidth = Math.floor(12 / row.columns.length);
    row.columns.forEach(col => col.width = normalizedWidth);
  }

  onDrop(event: CdkDragDrop<ComponentConfig[]>, column: LayoutColumn): void {
    const dragged = event.item.data;
    column.components.push({ ...dragged }); // deep copy
  }
}
