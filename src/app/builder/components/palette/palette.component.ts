// src/app/builder/components/palette/palette.component.ts

import { Component, OnInit } from '@angular/core';
import { ComponentRegistryService } from '../../services/component-registry.service';
import { ComponentConfig } from '../../models/component-config.model';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  imports: [
    CdkDrag,
    MatIcon
  ],
  styleUrls: ['./palette.component.scss']
})
export class PaletteComponent implements OnInit {
  components: ComponentConfig[] = [];

  constructor(private registry: ComponentRegistryService) {}

  ngOnInit(): void {
    this.components = this.registry.getAvailableComponents();
  }

  // Used to pass the component data during drag
  getDragData(component: ComponentConfig): ComponentConfig {
    return component;
  }
}
