// models/inquiry-config.models.ts

export interface ContentType {
  id: number;
  app_label: string;
  model: string;
  name: string;
  verbose_name: string;
  fields: ModelField[];
}

export interface ModelField {
  name: string;
  type: string;
  verbose_name: string;
  is_relation: boolean;
  related_model?: string;
  relation_type?: string;
}

export interface InquiryConfiguration {
  id?: number;
  name: string;
  code: string;
  description?: string;
  content_type: number;
  display_name: string;
  icon?: string;
  allowed_groups: number[];
  is_public: boolean;
  default_page_size: number;
  max_page_size: number;
  allow_export: boolean;
  export_formats: string[];
  distinct: boolean;
  enable_search: boolean;
  search_fields: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;

  // Nested relations
  fields?: InquiryField[];
  filters?: InquiryFilter[];
  relations?: InquiryRelation[];
  sorts?: InquirySort[];
  permissions?: InquiryPermission[];
}

export interface InquiryField {
  id?: number;
  inquiry?: number;
  field_path: string;
  display_name: string;
  field_type: FieldType;
  is_visible: boolean;
  is_searchable: boolean;
  is_sortable: boolean;
  is_filterable: boolean;
  is_primary: boolean;
  format_template?: string;
  transform_function?: string;
  aggregation?: AggregationType;
  order: number;
  width?: string;
  alignment: 'left' | 'center' | 'right';
  json_extract_path?: string;
}

export interface InquiryFilter {
  id?: number;
  inquiry?: number;
  name: string;
  code: string;
  field_path: string;
  operator: FilterOperator;
  filter_type: FilterType;
  default_value?: any;
  is_required: boolean;
  validation_rules?: any;
  lookup_category?: string;
  choices_json?: Array<{value: any; label: string}>;
  choices_function?: string;
  placeholder?: string;
  help_text?: string;
  is_visible: boolean;
  is_advanced: boolean;
  order: number;
}

export interface InquiryRelation {
  id?: number;
  inquiry?: number;
  relation_path: string;
  display_name: string;
  relation_type: 'one_to_one' | 'foreign_key' | 'one_to_many' | 'many_to_many';
  include_fields: string[];
  exclude_fields: string[];
  use_select_related: boolean;
  use_prefetch_related: boolean;
  max_depth: number;
  include_count: boolean;
  order: number;
}

export interface InquirySort {
  id?: number;
  inquiry?: number;
  field_path: string;
  direction: 'asc' | 'desc';
  order: number;
}

export interface InquiryPermission {
  id?: number;
  inquiry?: number;
  group: number;
  can_view: boolean;
  can_export: boolean;
  can_view_all: boolean;
  row_permission_function?: string;
  visible_fields: string[];
  hidden_fields: string[];
  max_export_rows?: number;
  allowed_export_formats: string[];
}

// Enums
export type FieldType = 'string' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'json' | 'reference' | 'multi_reference';

export type FilterOperator = 'exact' | 'iexact' | 'contains' | 'icontains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'range' | 'isnull' | 'regex';

export type FilterType = 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'daterange' | 'lookup';

export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max';

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface InquirySchema {
  inquiry: InquiryConfiguration;
  fields: InquiryFieldSchema[];
  filters: InquiryFilterSchema[];
  sorts: InquirySort[];
  relations: InquiryRelation[];
  permissions: InquiryUserPermissions;
}

export interface InquiryFieldSchema {
  field_path: string;
  display_name: string;
  field_type: string;
  is_sortable: boolean;
  is_searchable: boolean;
  is_filterable: boolean;
  is_primary: boolean;
  is_visible?: boolean;
  width?: string;
  alignment?: string;
  format_template?: string;
}

export interface InquiryFilterSchema {
  code: string;
  name: string;
  field_path: string;
  operator: string;
  filter_type: string;
  default_value?: any;
  is_required: boolean;
  is_advanced: boolean;
  placeholder?: string;
  help_text?: string;
  validation_rules?: any;
  choices?: Array<{value: any; label: string}>;
}

export interface InquiryUserPermissions {
  can_view: boolean;
  can_export: boolean;
  can_view_all: boolean;
  export_formats: string[];
  max_export_rows?: number;
}

export interface InquiryExecutionParams {
  filters?: Record<string, any>;
  search?: string;
  sort?: Array<{field: string; direction: 'asc' | 'desc'}>;
  page?: number;
  page_size?: number;
  include_aggregations?: boolean;
  export?: string;
}

export interface InquiryExecutionResponse {
  results: any[];
  count: number;
  next: string | null;
  previous: string | null;
  aggregations?: Record<string, any>;
  execution_time_ms: number;
  inquiry: {
    name: string;
    display_name: string;
    code: string;
  };
}
