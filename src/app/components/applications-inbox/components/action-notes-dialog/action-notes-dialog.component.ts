import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

export interface ActionNotesDialogData {
  actionName: string;
  caseSerial: string;
  mandatory: boolean;
}

@Component({
  selector: 'app-action-notes-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslatePipe
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>comment</mat-icon>
      {{ 'add_notes_for_action' | translate }}: {{ data.actionName }}
    </h2>

    <mat-dialog-content>
      <p class="case-info">
        {{ 'case' | translate }}: <strong>{{ data.caseSerial }}</strong>
      </p>

      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>{{ 'notes' | translate }}</mat-label>
          <textarea
            matInput
            formControlName="notes"
            rows="5"
            [placeholder]="'enter_notes_for_action' | translate">
          </textarea>
          <mat-error *ngIf="form.get('notes')?.hasError('required')">
            {{ 'notes_required_for_action' | translate }}
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ 'cancel' | translate }}
      </button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="!form.valid">
        {{ 'confirm_action' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }

    .case-info {
      margin-bottom: 20px;
      color: #6B7280;
    }

    mat-dialog-content {
      min-width: 400px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: #34C5AA;
      }
    }
  `]
})
export class ActionNotesDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ActionNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActionNotesDialogData
  ) {
    const validators = data.mandatory ? [Validators.required] : [];
    this.form = this.fb.group({
      notes: ['', validators]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.notes);
    }
  }
}
