// src/app/services/note.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Note, NoteCreateRequest, NoteUpdateRequest, NotesResponse } from '../models/note.models';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly API_ENDPOINT = '/case/notes/';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  private getApiUrl(endpoint: string): string {
    const baseUrl = this.configService.getBaseUrl();
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Get all notes with optional filters
   */
  getNotes(filters?: {
    case_id?: number;
    author_id?: number;
    approval_record_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Observable<Note[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Note[]>(this.getApiUrl(this.API_ENDPOINT), { params });
  }

  /**
   * Get notes by case ID
   */
  getNotesByCase(caseId: number): Observable<NotesResponse> {
    return this.http.get<any>(
      this.getApiUrl(`${this.API_ENDPOINT}by_case/${caseId}/`)
    ).pipe(
      map(response => {
        // Handle different response formats
        if (response.notes) {
          return response;
        } else if (response.results) {
          // If it's paginated
          return {
            case_id: caseId,
            case_serial_number: '',
            total_notes: response.count || response.results.length,
            notes: response.results
          };
        } else if (Array.isArray(response)) {
          // If it's a plain array
          return {
            case_id: caseId,
            case_serial_number: '',
            total_notes: response.length,
            notes: response
          };
        } else {
          // Default empty response
          return {
            case_id: caseId,
            case_serial_number: '',
            total_notes: 0,
            notes: []
          };
        }
      })
    );
  }

  /**
   * Get a single note
   */
  getNote(id: number): Observable<Note> {
    return this.http.get<Note>(this.getApiUrl(`${this.API_ENDPOINT}${id}/`));
  }

  /**
   * Create a new note
   */
  createNote(note: NoteCreateRequest): Observable<Note> {
    return this.http.post<Note>(this.getApiUrl(this.API_ENDPOINT), note);
  }

  /**
   * Update a note
   */
  updateNote(id: number, note: NoteUpdateRequest): Observable<Note> {
    return this.http.patch<Note>(
      this.getApiUrl(`${this.API_ENDPOINT}${id}/`),
      note
    );
  }

  /**
   * Delete a note
   */
  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(
      this.getApiUrl(`${this.API_ENDPOINT}${id}/`)
    );
  }

  /**
   * Add a reply to a note
   */
  addReply(noteId: number, content: string): Observable<any> {
    return this.http.post<any>(
      this.getApiUrl(`${this.API_ENDPOINT}${noteId}/add_reply/`),
      { content }
    );
  }

  /**
   * Get current user's notes
   */
  getMyNotes(): Observable<any> {
    return this.http.get<any>(
      this.getApiUrl(`${this.API_ENDPOINT}my_notes/`)
    );
  }
}
