// src/app/builder/models/layout.model.ts

import { ComponentConfig } from './component-config.model';

export interface LayoutColumn {
  id: string;
  width: number; // 1–12
  components: ComponentConfig[];
  padding?: number; // NEW: px
}


export interface LayoutRow {
  id: string;
  columns: LayoutColumn[];
}

export type LayoutSchema = LayoutRow[];
