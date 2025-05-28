// models/resource.model.ts - FIXED
export interface ResourceField {
  name: string;
  type: string;
  required: boolean;
  read_only: boolean;
  default: any;
  help_text: string;
  choices?: Array<{
    value: string;
    label: string;
  }>;
  relation_type?: string;
  related_model?: string;
  limit_choices_to?: string;
}

export interface Resource {
  name: string;
  endpoints: any[];
  hasListView: boolean;
  hasDetailView: boolean;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  fields: ResourceField[];
  listEndpoint: any;
  detailEndpoint: any;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface RelationOption {
  id: any;
  display: string;
}

export interface TableData {
  [key: string]: any;
  id?: any;
  pk?: any;
}

// Helper function to convert API keys to ResourceField[]
export function convertApiKeysToResourceFields(apiKeys: any[]): ResourceField[] {
  if (!Array.isArray(apiKeys)) {
    return [];
  }

  return apiKeys.map(key => {
    if (typeof key === 'string') {
      // If it's just a string, create a basic field
      return {
        name: key,
        type: 'CharField',
        required: false,
        read_only: false,
        default: null,
        help_text: ''
      } as ResourceField;
    } else if (typeof key === 'object' && key !== null) {
      // If it's already an object, ensure it has all required properties
      return {
        name: key.name || '',
        type: key.type || 'CharField',
        required: key.required || false,
        read_only: key.read_only || false,
        default: key.default || null,
        help_text: key.help_text || '',
        choices: key.choices || undefined,
        relation_type: key.relation_type || undefined,
        related_model: key.related_model || undefined,
        limit_choices_to: key.limit_choices_to || undefined
      } as ResourceField;
    }

    // Fallback for unknown types
    return {
      name: 'unknown',
      type: 'CharField',
      required: false,
      read_only: false,
      default: null,
      help_text: ''
    } as ResourceField;
  });
}
