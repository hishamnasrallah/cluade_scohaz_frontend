// src/app/components/inquiry/components/search-bar/search-bar.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe
  ],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>{{ placeholder || ('search' | translate) }}</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input matInput
             [(ngModel)]="searchValue"
             (ngModelChange)="onSearchInput()"
             [placeholder]="placeholder || ('search' | translate)">
      <button mat-icon-button matSuffix
              *ngIf="searchValue"
              (click)="clearSearch()">
        <mat-icon>clear</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [`
    .search-field {
      width: 100%;

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: rgba(196, 247, 239, 0.1);
        }

        &.mat-focused .mat-mdc-text-field-wrapper {
          background: white;
          box-shadow: 0 0 0 2px rgba(52, 197, 170, 0.1);
        }
      }
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() searchFields: string[] = [];
  @Input() placeholder: string = '';
  @Output() searchChange = new EventEmitter<string>();

  searchValue = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchChange.emit(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchChange.emit('');
  }
}
