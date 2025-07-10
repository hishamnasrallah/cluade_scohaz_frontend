// src/app/models/simple-pdf.models.ts

export interface SimplePDFTemplate {
  id?: number;
  name: string;
  code: string;
  page_size: 'A4' | 'letter';
  content_type: number | null;
  content_type_display?: string;
  query_filter: Record<string, any>;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  active: boolean;
  elements?: SimplePDFElement[];
}

export interface SimplePDFElement {
  id?: number;
  template?: number;
  x_position: number;
  y_position: number;
  text_content: string;
  is_dynamic: boolean;
  font_size: number;
}

export interface ContentType {
  id: number;
  app_label: string;
  model: string;
  display_name?: string;
}

export interface ContentTypeField {
  name: string;
  verbose_name: string;
  type: string;
  is_relation: boolean;
  related_model: string | null;
}

export interface ContentTypeWithFields extends ContentType {
  fields: ContentTypeField[];
}

export interface SimplePDFGenerateRequest {
  template_id: number;
  object_id?: number;
}

export interface SimplePDFGenerateResponse {
  file_url?: string;
  file_name?: string;
  error?: string;
}

export interface BulkCreateRequest {
  name: string;
  code: string;
  page_size?: 'A4' | 'letter';
  content_type: number;
  query_filter?: Record<string, any>;
  active?: boolean;
  elements: Omit<SimplePDFElement, 'id' | 'template'>[];
}

export interface DuplicateTemplateRequest {
  name?: string;
  code?: string;
}

export interface SimplePDFTemplateResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SimplePDFTemplate[];
}
