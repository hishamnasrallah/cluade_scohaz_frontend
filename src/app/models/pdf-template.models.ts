// src/app/models/pdf-template.models.ts

// ============================================
// Main Template Interface
// ============================================

export interface PDFTemplate {
  id?: number;
  name: string;
  name_ara?: string;
  description?: string;
  description_ara?: string;
  code: string;
  primary_language: 'en' | 'ar';
  supports_bilingual: boolean;

  // Page configuration
  page_size: 'A4' | 'A3' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  header_enabled: boolean;
  footer_enabled: boolean;
  watermark_enabled: boolean;
  watermark_text?: string;

  // Data source configuration
  data_source_type: 'model' | 'raw_sql' | 'custom_function' | 'api';
  content_type?: number;
  content_type_display?: string;
  query_filter?: Record<string, any>;
  custom_function_path?: string;
  raw_sql_query?: string;

  // Metadata
  created_by?: number;
  created_by_name?: string;
  groups?: number[];
  requires_parameters: boolean;
  allow_self_generation: boolean;
  allow_other_generation: boolean;
  related_models?: Record<string, any>;
  is_system_template: boolean;
  active_ind: boolean;
  created_at?: string;
  updated_at?: string;

  // Relationships
  elements?: PDFTemplateElement[];
  variables?: PDFTemplateVariable[];
  parameters?: PDFTemplateParameter[];
  data_sources?: PDFTemplateDataSource[];

  // Permissions for current user
  can_edit?: boolean;
  can_delete?: boolean;
  can_generate_self?: boolean;
  can_generate_others?: boolean;

  // Additional properties
  parameter_schema?: ParameterSchema;
}

// ============================================
// Template Element Interface
// ============================================

export interface PDFTemplateElement {
  id?: number;
  template?: number;
  element_type: ElementType;
  element_key: string;

  // Position and dimensions
  x_position: number;
  y_position: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index: number;

  // Text properties
  text_content?: string;
  text_content_ara?: string;
  font_family: string;
  font_size: number;
  font_color: string;
  is_bold: boolean;
  is_italic: boolean;
  is_underline: boolean;
  text_align: 'left' | 'center' | 'right' | 'justify';
  line_height: number;

  // Shape properties
  fill_color?: string;
  stroke_color: string;
  stroke_width: number;

  // Image properties
  image_source?: string;
  maintain_aspect_ratio: boolean;

  // Table configuration
  table_config?: TableConfig;

  // Loop configuration
  loop_config?: LoopConfig;

  // Dynamic properties
  data_source?: string;
  condition?: string;

  // Hierarchy
  parent_element?: number;
  child_elements?: PDFTemplateElement[];

  // Page settings
  is_repeatable: boolean;
  page_number?: number;
  active_ind: boolean;
}

// ============================================
// Template Parameter Interface
// ============================================

export interface PDFTemplateParameter {
  id?: number;
  template?: number;
  parameter_key: string;
  display_name: string;
  display_name_ara?: string;
  description?: string;
  description_ara?: string;
  parameter_type: ParameterType;
  is_required: boolean;
  default_value?: string;
  widget_type: WidgetType;
  widget_config?: WidgetConfig;
  validation_rules?: ValidationRules;
  query_field?: string;
  query_operator?: string;
  allow_user_override: boolean;
  restricted_to_groups?: number[];
  order: number;
  active_ind: boolean;
  choices?: ParameterChoice[];
}

// ============================================
// Template Data Source Interface
// ============================================

export interface PDFTemplateDataSource {
  id?: number;
  template?: number;
  source_key: string;
  display_name: string;
  fetch_method: 'model_query' | 'raw_sql' | 'custom_function' | 'related_field' | 'prefetch';
  content_type?: number;
  query_path?: string;
  filter_config?: Record<string, any>;
  custom_function_path?: string;
  raw_sql?: string;
  post_process_function?: string;
  cache_timeout: number;
  order: number;
  active_ind: boolean;
}

// ============================================
// Template Variable Interface
// ============================================

export interface PDFTemplateVariable {
  id?: number;
  template?: number;
  variable_key: string;
  display_name: string;
  display_name_ara?: string;
  description?: string;
  data_type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'image' | 'list' | 'dict' | 'model';
  data_source: string;
  default_value?: string;
  format_string?: string;
  transform_function?: string;
  is_required: boolean;
  resolved_value?: any;
}

// ============================================
// Generation Log Interface
// ============================================

export interface PDFGenerationLog {
  id: number;
  template: number;
  template_name: string;
  generated_by: number;
  generated_by_name: string;
  generated_for?: number;
  generated_for_name?: string;
  content_type?: number;
  object_id?: number;
  parameters?: Record<string, any>;
  file_name: string;
  file_size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  completed_at?: string;
  generation_time?: number;
}

// ============================================
// Template Category Interface
// ============================================

export interface TemplateCategory {
  self_service: PDFTemplate[];
  my_templates: PDFTemplate[];
  shared_templates: PDFTemplate[];
  system_templates: PDFTemplate[];
  summary: {
    total: number;
    can_create: boolean;
    can_generate_others: boolean;
  };
}

// ============================================
// API Request/Response Interfaces
// ============================================

export interface GeneratePDFRequest {
  template_id: number;
  parameters?: Record<string, any>;
  language?: 'en' | 'ar';
  filename?: string;
  generate_for_user_id?: number;
}

export interface ParameterSchema {
  required: string[];
  properties: Record<string, any>;
}

export interface TemplatePreview {
  template: PDFTemplate;
  data: Record<string, any>;
  parameters_used: Record<string, any>;
}

export interface PreviewDataRequest {
  parameters: Record<string, any>;
}

export interface ValidateParametersRequest {
  parameters: Record<string, any>;
}

export interface ValidateParametersResponse {
  valid: boolean;
  message?: string;
  error?: string;
}

// ============================================
// Designer Data Interface
// ============================================

export interface DesignerData {
  fonts: Array<{ value: string; label: string }>;
  element_types: Array<{ value: string; label: string; icon: string }>;
  page_sizes: Array<{ value: string; label: string }>;
  orientations: Array<{ value: string; label: string }>;
  text_aligns: Array<{ value: string; label: string }>;
  data_types: Array<{ value: string; label: string }>;
  parameter_types: Array<{ value: string; label: string }>;
  widget_types: Array<{ value: string; label: string }>;
  query_operators: Array<{ value: string; label: string }>;
  fetch_methods: Array<{ value: string; label: string }>;
  default_colors: string[];
}

// ============================================
// Content Type Model Interface
// ============================================

export interface ContentTypeModel {
  id: number;
  app_label: string;
  model: string;
  display_name: string;
  model_fields: ModelField[];
}

export interface ModelField {
  name: string;
  type: string;
  verbose_name: string;
  is_relation: boolean;
  related_model?: string;
}

// ============================================
// Type Definitions
// ============================================

export type ElementType =
  | 'text'
  | 'dynamic_text'
  | 'image'
  | 'dynamic_image'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'table'
  | 'chart'
  | 'barcode'
  | 'qrcode'
  | 'signature'
  | 'page_break'
  | 'loop'
  | 'conditional';

export type ParameterType =
  | 'integer'
  | 'string'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'float'
  | 'uuid'
  | 'model_id'
  | 'user_id';

export type WidgetType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'user_search'
  | 'model_search';

// ============================================
// Widget Configuration Interfaces
// ============================================

export interface WidgetConfig {
  placeholder?: string;
  maxlength?: number;
  min?: number;
  max?: number;
  step?: number;
  type?: string;
  choices?: ParameterChoice[];
  multiple?: boolean;
  search_fields?: string[];
  display_field?: string;
  filter?: Record<string, any>;
  model?: string;
  model_id?: number;
  model_name?: string;
}

export interface ParameterChoice {
  value: string;
  label: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  choices?: string[];
  minlength?: number;
  maxlength?: number;
}

// ============================================
// Configuration Interfaces
// ============================================

export interface TableConfig {
  data_source: string;
  headers: string[];
  columns: string[];
  style?: Record<string, any>;
}

export interface LoopConfig {
  data_source: string;
  item_variable?: string;
  index_variable?: string;
}

// ============================================
// Builder Specific Interfaces
// ============================================

export interface BuilderState {
  template: Partial<PDFTemplate>;
  currentStep?: number;
  isDirty: boolean;
  selectedElement?: PDFTemplateElement;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface ElementPosition {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface DragData {
  element?: PDFTemplateElement;
  elementType?: ElementType;
  isNew: boolean;
}

// ============================================
// Wizard Interfaces
// ============================================

export interface WizardStep {
  label: string;
  icon: string;
  component: any;
  isValid: () => boolean;
}

export interface WizardData {
  basicInfo: {
    name: string;
    name_ara?: string;
    description?: string;
    description_ara?: string;
    code: string;
    primary_language: 'en' | 'ar';
    supports_bilingual: boolean;
  };
  pageSetup: {
    page_size: string;
    orientation: string;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    header_enabled: boolean;
    footer_enabled: boolean;
    watermark_enabled: boolean;
    watermark_text?: string;
  };
  dataSource: {
    data_source_type: string;
    content_type?: number;
    query_filter?: Record<string, any>;
    custom_function_path?: string;
    raw_sql_query?: string;
    related_models?: Record<string, any>;
  };
  parameters: PDFTemplateParameter[];
  dataSources: PDFTemplateDataSource[];
  design: {
    elements: PDFTemplateElement[];
    variables: PDFTemplateVariable[];
  };
  permissions: {
    groups: number[];
    requires_parameters: boolean;
    allow_self_generation: boolean;
    allow_other_generation: boolean;
  };
}

// ============================================
// User Search Interface (for parameter widgets)
// ============================================

export interface UserOption {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

// ============================================
// Export all interfaces for easy importing
// ============================================

export * from './pdf-template.models';
