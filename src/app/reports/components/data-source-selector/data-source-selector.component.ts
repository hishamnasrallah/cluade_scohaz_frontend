// src/app/reports/components/data-source-selector/data-source-selector.component.ts

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Report, DataSource, ContentType } from '../../../models/report.models';
import { ReportService } from '../../../services/report.service';

interface ContentTypeNode {
  name: string;
  app?: string;
  children?: ContentTypeNode[];
  contentType?: ContentType;
  level: number;
}

@Component({
  selector: 'app-data-source-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatAutocompleteModule
  ],
  templateUrl: 'data-source-selector.component.html',
  styleUrl: 'data-source-selector.component.scss'
})
export class DataSourceSelectorComponent implements OnInit {
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;

  @Input() report: Report | null = null;
  @Input() dataSources: DataSource[] = [];
  @Output() dataSourcesChange = new EventEmitter<DataSource[]>();

  // Tree data
  treeControl = new NestedTreeControl<ContentTypeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<ContentTypeNode>();
  treeData: ContentTypeNode[] = [];
  filteredTreeData: ContentTypeNode[] = [];

  // UI state
  searchTerm = '';
  selectedModel: ContentType | null = null;
  isLoadingModels = false;
  editingDataSource: DataSource | null = null;
  editingSelectRelated: string[] = [];
  editingPrefetchRelated: string[] = [];

  // Forms
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      alias: ['', Validators.required],
      is_primary: [false]
    });
  }

  ngOnInit(): void {
    this.loadContentTypes();
  }

  hasChild = (_: number, node: ContentTypeNode) => !!node.children && node.children.length > 0;

  loadContentTypes(): void {
    this.isLoadingModels = true;
    this.reportService.getContentTypes().subscribe({
      next: (contentTypes) => {
        this.buildTreeData(contentTypes);
        this.isLoadingModels = false;
      },
      error: (err) => {
        console.error('Error loading content types:', err);
        this.snackBar.open('Error loading models', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingModels = false;
      }
    });
  }

  buildTreeData(contentTypes: Record<string, { label: string; content_types: ContentType[] }>): void {
    this.treeData = Object.entries(contentTypes).map(([app, data]) => ({
      name: data.label,
      app: app,
      level: 0,
      children: data.content_types.map(ct => ({
        name: ct.verbose_name || ct.model,
        contentType: ct,
        level: 1
      }))
    }));

    this.filteredTreeData = [...this.treeData];
    this.dataSource.data = this.filteredTreeData;
  }

  filterTree(): void {
    if (!this.searchTerm) {
      this.filteredTreeData = [...this.treeData];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTreeData = this.treeData
        .map(app => ({
          ...app,
          children: app.children?.filter(model =>
            model.name.toLowerCase().includes(term) ||
            model.contentType?.model.toLowerCase().includes(term)
          )
        }))
        .filter(app => app.children && app.children.length > 0);
    }

    this.dataSource.data = this.filteredTreeData;
    this.treeControl.dataNodes = this.filteredTreeData;
    this.treeControl.expandAll();
  }

  selectModel(contentType?: ContentType): void {
    if (contentType && !this.isModelAlreadyAdded(contentType)) {
      this.selectedModel = contentType;
    }
  }

  isModelAlreadyAdded(contentType?: ContentType): boolean {
    if (!contentType) return true;
    return this.dataSources.some(ds => ds.content_type_id === contentType.id);
  }

  addDataSource(contentType?: ContentType): void {
    if (!contentType || !this.report?.id) return;

    const newDataSource: Partial<DataSource> = {
      report: this.report.id,
      content_type_id: contentType.id,
      alias: contentType.model.toLowerCase(),
      is_primary: this.dataSources.length === 0,
      select_related: [],
      prefetch_related: []
    };

    this.reportService.createDataSource(newDataSource).subscribe({
      next: (dataSource) => {
        this.dataSources = [...this.dataSources, dataSource];
        this.dataSourcesChange.emit(this.dataSources);
        this.selectedModel = null;

        this.snackBar.open('Data source added successfully', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error adding data source:', err);
        this.snackBar.open('Error adding data source', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  removeDataSource(index: number): void {
    const dataSource = this.dataSources[index];
    if (!dataSource.id) return;

    if (confirm(`Remove data source "${dataSource.alias}"?`)) {
      this.reportService.deleteDataSource(dataSource.id).subscribe({
        next: () => {
          this.dataSources = this.dataSources.filter((_, i) => i !== index);

          // If removed primary, set first as primary
          if (dataSource.is_primary && this.dataSources.length > 0) {
            this.setPrimarySource(0);
          }

          this.dataSourcesChange.emit(this.dataSources);

          this.snackBar.open('Data source removed', 'Close', {
            duration: 2000,
            panelClass: ['info-snackbar']
          });
        },
        error: (err) => {
          console.error('Error removing data source:', err);
          this.snackBar.open('Error removing data source', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  setPrimarySource(index: number): void {
    const newPrimary = this.dataSources[index];
    if (!newPrimary.id) return;

    // Update all sources
    const updates = this.dataSources.map((ds, i) => {
      if (!ds.id) return null;

      const isPrimary = i === index;
      if (ds.is_primary !== isPrimary) {
        return this.reportService.updateDataSource(ds.id, { is_primary: isPrimary });
      }
      return null;
    }).filter(obs => obs !== null);

    if (updates.length === 0) return;

    Promise.all(updates.map(obs => obs!.toPromise())).then(() => {
      this.dataSources = this.dataSources.map((ds, i) => ({
        ...ds,
        is_primary: i === index
      }));
      this.dataSourcesChange.emit(this.dataSources);
    });
  }

  editDataSource(dataSource: DataSource): void {
    this.editingDataSource = dataSource;
    this.editingSelectRelated = [...(dataSource.select_related || [])];
    this.editingPrefetchRelated = [...(dataSource.prefetch_related || [])];

    this.editForm.patchValue({
      alias: dataSource.alias,
      is_primary: dataSource.is_primary
    });

    this.dialog.open(this.editDialog, {
      width: '600px',
      maxWidth: '90vw'
    });
  }

  addSelectRelated(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.editingSelectRelated.includes(value)) {
      this.editingSelectRelated.push(value);
    }
    event.chipInput?.clear();
  }

  removeSelectRelated(field: string): void {
    const index = this.editingSelectRelated.indexOf(field);
    if (index >= 0) {
      this.editingSelectRelated.splice(index, 1);
    }
  }

  addPrefetchRelated(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.editingPrefetchRelated.includes(value)) {
      this.editingPrefetchRelated.push(value);
    }
    event.chipInput?.clear();
  }

  removePrefetchRelated(field: string): void {
    const index = this.editingPrefetchRelated.indexOf(field);
    if (index >= 0) {
      this.editingPrefetchRelated.splice(index, 1);
    }
  }

  saveDataSourceEdit(): void {
    if (!this.editForm.valid || !this.editingDataSource?.id) return;

    const updates: Partial<DataSource> = {
      ...this.editForm.value,
      select_related: this.editingSelectRelated,
      prefetch_related: this.editingPrefetchRelated
    };

    this.reportService.updateDataSource(this.editingDataSource.id, updates).subscribe({
      next: (updated) => {
        const index = this.dataSources.findIndex(ds => ds.id === updated.id);
        if (index >= 0) {
          this.dataSources[index] = updated;

          // Handle primary change
          if (updated.is_primary) {
            this.dataSources = this.dataSources.map(ds => ({
              ...ds,
              is_primary: ds.id === updated.id
            }));
          }

          this.dataSourcesChange.emit(this.dataSources);
        }

        this.dialog.closeAll();
        this.snackBar.open('Data source updated', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        console.error('Error updating data source:', err);
        this.snackBar.open('Error updating data source', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
