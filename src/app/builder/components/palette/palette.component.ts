// src/app/builder/components/palette/palette.component.ts

import { Component, OnInit } from '@angular/core';
import { ComponentRegistryService } from '../../services/component-registry.service';
import { ComponentConfig } from '../../models/component-config.model';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatIcon } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  imports: [
    CdkDrag,
    CdkDropList,
    MatIcon,
    NgForOf,
    NgIf,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput
  ],
  styleUrls: ['./palette.component.scss']
})
export class PaletteComponent implements OnInit {
  components: ComponentConfig[] = [];
  filteredComponents: ComponentConfig[] = [];
  categories: string[] = [];
  selectedCategory: string = 'all';
  searchTerm: string = '';

  constructor(private registry: ComponentRegistryService) {}

  ngOnInit(): void {
    this.components = this.registry.getAvailableComponents();
    console.log('Palette components loaded:', this.components);
    this.filteredComponents = [...this.components];
    this.extractCategories();
    console.log('Categories:', this.categories);
  }

  private extractCategories(): void {
    const categorySet = new Set<string>();
    this.components.forEach(comp => categorySet.add(comp.category));
    this.categories = ['all', ...Array.from(categorySet)];
  }

  filterComponents(): void {
    this.filteredComponents = this.components.filter(comp => {
      const matchesCategory = this.selectedCategory === 'all' || comp.category === this.selectedCategory;
      const matchesSearch = comp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comp.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterComponents();
  }

  onSearchChange(): void {
    this.filterComponents();
  }

  // Enhanced drag data with deep copy
  getDragData(component: ComponentConfig): ComponentConfig {
    return JSON.parse(JSON.stringify(component));
  }

  formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
}
