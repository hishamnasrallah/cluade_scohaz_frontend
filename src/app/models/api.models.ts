
// models/api.models.ts
export interface ApiResponse {
  applications: {
    api_version: string;
    schema_generated_on: string;
    total_applications: number;
    total_urls: number;
    applications: { [key: string]: ApiEndpoint[] };
  };
}

export interface ApiEndpoint {
  path: string;
  name: string;
  methods: string[];
  parameters: string[];
  keys: string[];
  other_info: string;
  query_params: string[];
  permissions: string[];
  methods_info: { [key: string]: MethodInfo };
  available_actions: string[];
}

export interface MethodInfo {
  description: string;
  status_codes: StatusCode[];
  request_example: any;
  response_example: any;
}

export interface StatusCode {
  code: number;
  description: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}
