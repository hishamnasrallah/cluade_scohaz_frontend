// src/app/models/inquiry-execution.models.ts

export interface InquiryMetadata {
  code: string;
  name: string;
  display_name: string;
  icon?: string;
  description?: string;
  category?: string;
  last_accessed?: string;
  is_favorite?: boolean;
  execution_count?: number;
  average_execution_time?: number;
}

export interface DynamicColumn {
  field: string;
  header: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json' | 'relation';
  sortable: boolean;
  searchable: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: string;
  visible: boolean;
  pinned?: 'left' | 'right';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface DynamicFilter {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'daterange';
  operator: string;
  value?: any;
  options?: FilterOption[];
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  visible: boolean;
  advanced?: boolean;
}

export interface FilterOption {
  value: any;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface QueryState {
  inquiryCode: string;
  filters: Record<string, any>;
  search?: string;
  sort?: SortState[];
  page: number;
  pageSize: number;
  selectedColumns?: string[];
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  inquiryCode: string;
  queryState: QueryState;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: Date;
  createdBy: string;
  tags?: string[];
  schedule?: QuerySchedule;
}

export interface QuerySchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'csv' | 'excel' | 'pdf';
}

export interface DataVisualization {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter';
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  aggregation?: string;
  title: string;
  colors?: string[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  includeFilters: boolean;
  includeAggregations: boolean;
  selectedColumns?: string[];
  dateFormat?: string;
  numberFormat?: string;
  fileName?: string;
}

export interface InquiryStatistics {
  totalRecords: number;
  filteredRecords: number;
  executionTime: number;
  aggregations: Record<string, any>;
  lastUpdated: Date;
}

export interface RowAction {
  icon: string;
  label: string;
  action: (row: any) => void;
  condition?: (row: any) => boolean;
  color?: string;
}
