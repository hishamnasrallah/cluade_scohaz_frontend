// src/app/models/pdf-template.models.ts

export interface PDFTemplate {
  id?: number;
  name: string;
  name_ara?: string;
  description?: string;
  description_ara?: string;
  code: string;
  primary_language: 'en' | 'ar';
  supports_bilingual: boolean;

  // Page setup
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

  // Data source
  data_source_type: 'model' | 'raw_sql' | 'custom_function' | 'api';
  content_type?: number;
  content_type_display?: string;
  query_filter?: any;
  custom_function_path?: string;
  raw_sql_query?: string;

  // Elements and structure
  elements?: PDFTemplateElement[];
  parameters?: PDFTemplateParameter[];
  data_sources?: PDFTemplateDataSource[];
  variables?: PDFTemplateVariable[];

  // Permissions
  allow_self_generation: boolean;
  allow_other_generation: boolean;
  requires_parameters: boolean;
  groups?: number[];

  // Metadata
  is_system_template: boolean;
  active_ind: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_name?: string;

  // UI flags
  can_edit?: boolean;
  can_delete?: boolean;
}

export interface PDFTemplateParameter {
  parameter_key: string;
  display_name: string;
  display_name_ara?: string;
  description?: string;
  description_ara?: string;
  parameter_type: 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean' | 'user_id' | 'model_id';
  is_required: boolean;
  default_value?: any;
  widget_type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'radio' | 'user_search' | 'model_search';
  widget_config?: any;
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
    [key: string]: any;
  };
  choices?: Array<{
    value: any;
    label: string;
    label_ara?: string;
  }>;
  query_field?: string;
  query_operator?: string;
  allow_user_override: boolean;
  restricted_to_groups?: number[];
  order: number;
  active_ind: boolean;
}

export interface PDFTemplateElement {
  element_type: ElementType;
  element_key: string;
  x_position: number;
  y_position: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index: number;

  // Text properties
  text_content?: string;
  text_content_ara?: string;
  font_family?: string;
  font_size?: number;
  font_color?: string;
  is_bold?: boolean;
  is_italic?: boolean;
  is_underline?: boolean;
  text_align?: 'left' | 'center' | 'right' | 'justify';
  line_height?: number;

  // Shape properties
  fill_color?: string;
  stroke_color?: string;
  stroke_width?: number;

  // Image properties
  image_source?: string;
  maintain_aspect_ratio?: boolean;

  // Dynamic properties
  data_source?: string;
  condition?: string;

  // Table properties
  table_config?: {
    data_source: string;
    headers: string[];
    columns: string[];
  };

  // Layout properties
  is_repeatable: boolean;
  page_number?: number;
  active_ind: boolean;
}

export type ElementType =
  | 'text' | 'dynamic_text'
  | 'image' | 'dynamic_image'
  | 'line' | 'rectangle' | 'circle'
  | 'table' | 'chart'
  | 'page_break' | 'loop' | 'conditional'
  | 'barcode' | 'qrcode' | 'signature';

export interface PDFTemplateDataSource {
  source_key: string;
  display_name: string;
  fetch_method: 'model_query' | 'raw_sql' | 'custom_function' | 'api' | 'parameter';
  content_type?: number;
  query_path?: string;
  filter_config?: any;
  custom_function_path?: string;
  raw_sql?: string;
  post_process_function?: string;
  cache_timeout?: number;
  order: number;
  active_ind: boolean;
}

export interface PDFTemplateVariable {
  variable_key: string;
  display_name: string;
  variable_type: 'text' | 'number' | 'date' | 'computed';
  data_source?: string;
  computation_formula?: string;
  default_value?: any;
  format_string?: string;
  active_ind: boolean;
}

export interface GeneratePDFRequest {
  template_id: number;
  parameters?: Record<string, any>;
  language?: 'en' | 'ar';
  filename?: string;
  generate_for_user_id?: number;
}

export interface PDFGenerationLog {
  id: number;
  template: number;
  template_name?: string;
  generated_by: number;
  generated_by_name?: string;
  generated_for?: number;
  generated_for_name?: string;
  parameters_used?: any;
  file_name: string;
  file_size?: number;
  generation_time?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface TemplateCategory {
  my_templates: PDFTemplate[];
  self_service: PDFTemplate[];
  shared_templates: PDFTemplate[];
  system_templates: PDFTemplate[];
}

export interface TemplatePreview {
  data: Record<string, any>;
  parameters_used: Record<string, any>;
  sample_count?: number;
}

export interface ValidateParametersRequest {
  parameters: Record<string, any>;
}

export interface ValidateParametersResponse {
  valid: boolean;
  error?: string;
  errors?: string[];
  validated_parameters?: any;
}

export interface PreviewDataRequest {
  parameters: Record<string, any>;
}

export interface DesignerData {
  page_sizes: Array<{ value: string; label: string }>;
  fonts: Array<{ value: string; label: string }>;
  text_aligns: Array<{ value: string; label: string }>;
  parameter_types: Array<{ value: string; label: string }>;
  widget_types: Array<{ value: string; label: string }>;
  fetch_methods: Array<{ value: string; label: string }>;
}

export interface WizardData {
  basicInfo: any;
  pageSetup: any;
  dataSource: any;
  parameters: PDFTemplateParameter[];
  dataSources: PDFTemplateDataSource[];
  design: {
    elements: PDFTemplateElement[];
    variables: PDFTemplateVariable[];
  };
  permissions: any;
}

export interface ContentTypeModel {
  id: number;
  app_label: string;
  model: string;
  display_name: string;
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface DragData {
  elementType?: ElementType;
  element?: PDFTemplateElement;
  isNew: boolean;
}

export interface BuilderState {
  mode: 'selection' | 'wizard' | 'dragdrop';
  currentStep?: number;
  isDirty: boolean;
}
