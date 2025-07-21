// src/app/models/note.models.ts
export interface Note {
  id?: number;
  case: number;
  case_serial_number?: string;
  author?: number;
  author_username?: string;
  author_full_name?: string;
  content: string;
  related_approval_record?: number;
  related_approval_record_id?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_username?: string;
  updated_by?: number;
  updated_by_username?: string;
}

export interface NoteCreateRequest {
  case: number;
  content: string;
  related_approval_record?: number;
}

export interface NoteUpdateRequest {
  content: string;
}

export interface NotesResponse {
  case_id: number;
  case_serial_number: string;
  total_notes: number;
  notes: Note[];
}
