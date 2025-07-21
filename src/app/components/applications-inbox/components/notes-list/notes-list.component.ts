// src/app/components/applications-inbox/components/notes-list/notes-list.component.ts
import {Component, Input, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatDividerModule} from '@angular/material/divider';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';

import {Note, NoteCreateRequest} from '../../../../models/note.models';
import {NoteService} from '../../../../services/note.service';
import {TranslationService} from '../../../../services/translation.service';
import {TranslatePipe} from '../../../../pipes/translate.pipe';
import {AuthService} from '../../../../services/auth.service';
import {UserService} from '../../../../services/user.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    TranslatePipe,
    FormsModule
  ],
  template: `
    <div class="notes-container">
      <!-- Add Note Form -->
      <mat-card class="add-note-card">
        <form [formGroup]="noteForm" (ngSubmit)="addNote()">
          <mat-form-field class="full-width">
            <mat-label>{{ 'add_note' | translate }}</mat-label>
            <textarea
              matInput
              formControlName="content"
              rows="3"
              [placeholder]="'enter_your_note' | translate"
              [disabled]="addingNote">
            </textarea>
            <mat-error *ngIf="noteForm.get('content')?.hasError('required')">
              {{ 'note_content_required' | translate }}
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="!noteForm.valid || addingNote">
              <mat-icon *ngIf="!addingNote">add_comment</mat-icon>
              <mat-spinner *ngIf="addingNote" diameter="20"></mat-spinner>
              {{ addingNote ? ('adding' | translate) : ('add_note' | translate) }}
            </button>
          </div>
        </form>
      </mat-card>

      <!-- Notes List -->
      <div class="notes-list" *ngIf="!loading; else loadingTemplate">
        <div class="notes-header">
          <h3>
            <mat-icon>comment</mat-icon>
            {{ 'notes' | translate }} ({{ notes.length }})
          </h3>
        </div>

        <div class="notes-timeline" *ngIf="notes.length > 0; else emptyTemplate">
          <div *ngFor="let note of notes; let i = index" class="note-item">
            <div class="note-connector" *ngIf="i < notes.length - 1"></div>

            <div class="note-card">
              <div class="note-header">
                <div class="note-author">
                  <mat-icon class="author-icon">account_circle</mat-icon>
                  <div class="author-info">
                    <span class="author-name">{{ getAuthorName(note) }}</span>
                    <span class="note-time">{{ formatDateTime(note.created_at) }}</span>
                  </div>
                </div>
                <div class="note-approval-info" *ngIf="note.related_approval_record_id">
                  <mat-icon class="approval-icon">approval</mat-icon>
                  <span class="approval-text">
    Related to approval record #{{ note.related_approval_record_id }}
  </span>
                </div>
                <button
                  mat-icon-button
                  [matMenuTriggerFor]="noteMenu"
                  *ngIf="canEditNote(note)">
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #noteMenu="matMenu">
                  <button mat-menu-item (click)="editNote(note)">
                    <mat-icon>edit</mat-icon>
                    <span>{{ 'edit' | translate }}</span>
                  </button>
                  <button mat-menu-item (click)="deleteNote(note)">
                    <mat-icon>delete</mat-icon>
                    <span>{{ 'delete' | translate }}</span>
                  </button>
                </mat-menu>
              </div>

              <div class="note-content">
                <p [class.editing]="editingNoteId === note.id">
                  <ng-container *ngIf="editingNoteId !== note.id">
                    {{ note.content }}
                  </ng-container>
                  <mat-form-field *ngIf="editingNoteId === note.id" class="full-width">
                    <textarea
                      matInput
                      [(ngModel)]="editingContent"
                      rows="3">
                    </textarea>
                  </mat-form-field>
                </p>
              </div>

              <div class="note-actions">
                <ng-container *ngIf="editingNoteId !== note.id">
                  <button mat-button (click)="replyToNote(note)">
                    <mat-icon>reply</mat-icon>
                    {{ 'reply' | translate }}
                  </button>
                </ng-container>

                <ng-container *ngIf="editingNoteId === note.id">
                  <button mat-button color="primary" (click)="saveEdit(note)">
                    <mat-icon>save</mat-icon>
                    {{ 'save' | translate }}
                  </button>
                  <button mat-button (click)="cancelEdit()">
                    {{ 'cancel' | translate }}
                  </button>
                </ng-container>
              </div>

              <!-- Reply Form -->
              <div class="reply-form" *ngIf="replyingToNoteId === note.id">
                <mat-divider></mat-divider>
                <form [formGroup]="replyForm" (ngSubmit)="submitReply(note)">
                  <mat-form-field class="full-width">
                    <mat-label>{{ 'your_reply' | translate }}</mat-label>
                    <textarea
                      matInput
                      formControlName="content"
                      rows="2"
                      [placeholder]="'enter_reply' | translate">
                    </textarea>
                  </mat-form-field>

                  <div class="reply-actions">
                    <button mat-button type="submit" color="primary" [disabled]="!replyForm.valid">
                      <mat-icon>send</mat-icon>
                      {{ 'send_reply' | translate }}
                    </button>
                    <button mat-button type="button" (click)="cancelReply()">
                      {{ 'cancel' | translate }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyTemplate>
          <div class="empty-state">
            <mat-icon>speaker_notes_off</mat-icon>
            <p>{{ 'no_notes_yet' | translate }}</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'loading_notes' | translate }}...</p>
        </div>
      </ng-template>
    </div>
  `,
  styleUrl: './notes-list.component.scss'
})
export class NotesListComponent implements OnInit, OnDestroy {
  @Input() caseId!: number;
  // @Input() approvalRecordId?: number;
  @Output() noteAdded = new EventEmitter<Note>();
  @Output() noteUpdated = new EventEmitter<Note>();
  @Output() noteDeleted = new EventEmitter<number>();

  notes: Note[] = [];
  loading = false;
  addingNote = false;
  editingNoteId: number | null = null;
  editingContent = '';
  replyingToNoteId: number | null = null;
  currentUserId: number | null = null;

  noteForm: FormGroup;
  replyForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private translationService: TranslationService,
    private dialog: MatDialog
  ) {
    this.noteForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    // Validate case ID
    if (!this.caseId) {
      console.error('NotesListComponent: caseId is required but not provided');
      return;
    }

    console.log('NotesListComponent initialized with caseId:', this.caseId);

    this.loadCurrentUser();
    this.loadNotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user && user.id) {
            this.currentUserId = user.id;
          }
        },
        error: (error) => {
          console.error('Error loading current user:', error);
        }
      });
  }

  loadNotes(): void {
    if (!this.caseId) return;

    this.loading = true;
    this.noteService.getNotesByCase(this.caseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Add null checking for response and notes
          if (response && response.notes) {
            this.notes = response.notes.sort((a, b) =>
              new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
            );
          } else {
            this.notes = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notes:', error);
          this.loading = false;
          this.notes = []; // Set empty array on error
          this.snackBar.open(
            this.translationService.instant('error_loading_notes'),
            this.translationService.instant('close'),
            {duration: 5000}
          );
        }
      });
  }

  addNote(): void {
    if (!this.noteForm.valid) {
      console.error('Form is invalid');
      return;
    }

    if (!this.caseId) {
      console.error('Case ID is missing:', this.caseId);
      this.snackBar.open(
        'Error: Case ID is missing',
        this.translationService.instant('close'),
        {duration: 5000}
      );
      return;
    }

    this.addingNote = true;

    // Build the noteData object conditionally
    const noteData: NoteCreateRequest = {
      case: this.caseId,
      content: this.noteForm.value.content.trim()
    };

    console.log('Creating note with data:', noteData); // Debug log

    this.noteService.createNote(noteData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (note) => {
          this.notes.unshift(note);
          this.noteForm.reset();
          this.addingNote = false;
          this.noteAdded.emit(note);
          this.snackBar.open(
            this.translationService.instant('note_added_success'),
            this.translationService.instant('close'),
            {duration: 3000}
          );
        },
        error: (error) => {
          console.error('Error adding note:', error);
          this.addingNote = false;

          // Show more specific error message
          let errorMessage = this.translationService.instant('error_adding_note');
          if (error.error && error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }

          this.snackBar.open(errorMessage, this.translationService.instant('close'), {
            duration: 5000
          });
        }
      });
  }

  editNote(note: Note): void {
    this.editingNoteId = note.id!;
    this.editingContent = note.content;
    this.cancelReply();
  }

  saveEdit(note: Note): void {
    if (!this.editingContent.trim()) return;

    this.noteService.updateNote(note.id!, {content: this.editingContent})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedNote) => {
          const index = this.notes.findIndex(n => n.id === note.id);
          if (index !== -1) {
            this.notes[index] = updatedNote;
          }
          this.editingNoteId = null;
          this.editingContent = '';
          this.noteUpdated.emit(updatedNote);
          this.snackBar.open(
            this.translationService.instant('note_updated_success'),
            this.translationService.instant('close'),
            {duration: 3000}
          );
        },
        error: (error) => {
          console.error('Error updating note:', error);
          this.snackBar.open(
            this.translationService.instant('error_updating_note'),
            this.translationService.instant('close'),
            {duration: 5000}
          );
        }
      });
  }

  cancelEdit(): void {
    this.editingNoteId = null;
    this.editingContent = '';
  }

  deleteNote(note: Note): void {
    const confirmMessage = this.translationService.instant('confirm_delete_note');
    if (!confirm(confirmMessage)) return;

    this.noteService.deleteNote(note.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notes = this.notes.filter(n => n.id !== note.id);
          this.noteDeleted.emit(note.id!);
          this.snackBar.open(
            this.translationService.instant('note_deleted_success'),
            this.translationService.instant('close'),
            {duration: 3000}
          );
        },
        error: (error) => {
          console.error('Error deleting note:', error);
          this.snackBar.open(
            this.translationService.instant('error_deleting_note'),
            this.translationService.instant('close'),
            {duration: 5000}
          );
        }
      });
  }

  replyToNote(note: Note): void {
    this.replyingToNoteId = note.id!;
    this.replyForm.reset();
    this.cancelEdit();
  }

  submitReply(note: Note): void {
    if (!this.replyForm.valid) return;

    this.noteService.addReply(note.id!, this.replyForm.value.content)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadNotes(); // Reload to show the reply
          this.replyForm.reset();
          this.replyingToNoteId = null;
          this.snackBar.open(
            this.translationService.instant('reply_added_success'),
            this.translationService.instant('close'),
            {duration: 3000}
          );
        },
        error: (error) => {
          console.error('Error adding reply:', error);
          this.snackBar.open(
            this.translationService.instant('error_adding_reply'),
            this.translationService.instant('close'),
            {duration: 5000}
          );
        }
      });
  }

  cancelReply(): void {
    this.replyingToNoteId = null;
    this.replyForm.reset();
  }

  canEditNote(note: Note): boolean {
    if (this.currentUserId === null) return false;

    // Check if the current user is the author
    return note.author === this.currentUserId;
  }

  getAuthorName(note: Note): string {
    // Use the backend-provided full name or username
    if (note.author_full_name) {
      return note.author_full_name;
    } else if (note.author_username) {
      return note.author_username;
    }
    return this.translationService.instant('unknown_user');
  }


  formatDateTime(dateString?: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return this.translationService.instant('minutes_ago', {minutes: diffMinutes});
    } else if (diffHours < 24) {
      return this.translationService.instant('hours_ago', {hours: diffHours});
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
