// src/app/models/report.models.ts

export interface Report {
  id?: number;
  name: string;
  description?: string;
  report_type: 'ad_hoc' | 'template' | 'dashboard' | 'scheduled';
  is_active: boolean;
  is_public: boolean;
  category?: string;
  tags: string[];
  shared_with_users: number[];
  shared_with_groups: number[];
  config?: Record<string, any>;
  created_by?: number;
  created_by_username?: string;
  created_at?: string;
  updated_at?: string;
  field_count?: number;
  last_execution?: {
    executed_at: string;
    executed_by: string;
    status: string;
    row_count: number;
  };
  data_sources?: DataSource[];
  fields?: Field[];
  filters?: Filter[];
  joins?: Join[];
  parameters?: Parameter[];
  can_edit?: boolean;
  can_execute?: boolean;
}

export interface DataSource {
  id?: number;
  report: number;
  content_type_id: number;
  content_type?: ContentType;
  alias: string;
  is_primary: boolean;
  select_related?: string[];
  prefetch_related?: string[];
  app_name?: string;
  model_name?: string;
  model_info?: {
    verbose_name: string;
    verbose_name_plural: string;
    db_table: string;
    field_count: number;
  };
  available_fields?: FieldInfo[];
}

export interface ContentType {
  id: number;
  app_label: string;
  model: string;
  display_name: string;
  verbose_name?: string;
  verbose_name_plural?: string;
}

export interface Field {
  id?: number;
  report: number;
  data_source: number;
  field_path: string;
  field_name?: string;
  display_name: string;
  field_type: number | string; // Allow both number and string
  field_type_name?: string; // Store the original Django field type name for UI
  aggregation?: string | null;
  order: number;
  is_visible: boolean;
  width?: number | null;
  formatting?: any;
}

export interface Filter {
  id?: number;
  report: number;
  data_source: number;
  field_path: string;
  field_name?: string;
  field_type?: string;
  operator: FilterOperator;
  value?: any;
  value_type: 'static' | 'parameter' | 'dynamic' | 'user_attribute';
  logic_group: 'AND' | 'OR';
  group_order: number;
  parent_group?: number;
  is_active: boolean;
  is_required: boolean;
}

export interface Join {
  id?: number;
  report: number;
  left_source: number;
  right_source: number;
  left_field: string;
  right_field: string;
  join_type: 'inner' | 'left' | 'right' | 'outer';
}

export interface Parameter {
  id?: number;
  report: number;
  name: string;
  display_name: string;
  parameter_type: ParameterType;
  is_required: boolean;
  default_value?: any;
  choices_static?: ParameterChoice[];
  choices_query?: ChoicesQuery;
  validation_rules?: Record<string, any>;
  help_text?: string;
  placeholder?: string;
  order: number;
}

export interface Schedule {
  id?: number;
  report: number;
  name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time_of_day: string;
  timezone: string;
  parameters?: Record<string, any>;
  output_format: 'csv' | 'excel' | 'pdf';
  recipient_emails: string[];
  recipient_users: number[];
  recipient_groups: number[];
  email_subject?: string;
  email_body?: string;
  is_active: boolean;
  retry_on_failure: boolean;
  max_retries?: number;
}

export interface FieldInfo {
  name: string;
  path: string;
  verbose_name: string;
  type: string;
  is_relation: boolean;
}

export interface FieldFormatting {
  type?: 'currency' | 'percentage' | 'number' | 'date' | 'datetime' | 'email' | 'url' | 'conditional';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  thousands_separator?: string;
  date_format?: string;
  multiply_by_100?: boolean;
  negative_format?: string;
  rules?: Array<{
    condition: string;
    color: string;
  }>;
}

export interface ParameterChoice {
  value: string;
  label: string;
}

export interface ChoicesQuery {
  content_type_id: number;
  value_field: string;
  label_field: string;
  filter?: Record<string, any>;
  order_by?: string;
}

export interface ExecutionResult {
  success: boolean;
  data: any[];
  row_count: number;
  execution_time: number;
  execution_id?: number;
  columns: Column[];
  parameters_used?: Record<string, any>;
  error?: string;
}

export interface Column {
  name: string;
  display_name: string;
  type: string;
  aggregation?: string;
  width?: number;
  formatting?: FieldFormatting;
}

export interface ReportExecution {
  id: number;
  report: number;
  executed_by: string;
  executed_at: string;
  status: 'pending' | 'running' | 'success' | 'error';
  execution_time?: number;
  row_count?: number;
  error_message?: string;
}

export interface ReportListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Report[];
}

// Filter operators
export type FilterOperator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in' | 'contains' | 'icontains'
  | 'startswith' | 'endswith' | 'regex'
  | 'isnull' | 'isnotnull' | 'between' | 'date_range';

// Parameter types
export type ParameterType =
  | 'text' | 'number' | 'date' | 'datetime'
  | 'date_range' | 'select' | 'multiselect'
  | 'boolean' | 'user';

// Dynamic value types
export interface DynamicValue {
  type: 'today' | 'yesterday' | 'tomorrow'
    | 'current_week_start' | 'current_week_end'
    | 'current_month_start' | 'current_month_end'
    | 'current_year_start' | 'current_year_end'
    | 'current_user_id' | 'current_user_email';
  label: string;
}

// Builder data for UI
export interface BuilderData {
  content_types: Record<string, ContentTypeGroup>;
  field_lookups: Record<string, string[]>;
  aggregation_options: Array<{ value: string; label: string }>;
  operator_options: Record<string, Array<{ value: string; label: string }>>;
  parameter_type_options: Array<{ value: string; label: string }>;
  dynamic_values: DynamicValue[];
}

export interface ContentTypeGroup {
  label: string;
  content_types: ContentType[];
}
